import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { DashboardSummaryResponseDto, BadgeDto } from './dto/dashboard-summary.dto';
import { DashboardMasteryResponseDto, LessonMasteryDto } from './dto/dashboard-mastery.dto';

@Injectable()
export class DashboardService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async getDashboardSummary(
    userId: string,
    childId?: string,
  ): Promise<DashboardSummaryResponseDto> {
    // Determine target user/child for queries
    const targetUserId = childId ? null : userId;
    const targetChildId = childId;

    // If childId provided, verify guardian owns this child
    if (childId) {
      const { data: child, error: childError } = await this.supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('guardian_id', userId)
        .single();

      if (childError || !child) {
        throw new NotFoundException('Child not found or access denied');
      }
    }

    // Get weekly minutes using the view (with fallback for missing views)
    let weeklyData = null;
    if (this.configService.get('SUPABASE_URL')) {
      const { data, error: weeklyError } = await this.supabase
        .from('v_user_minutes_week')
        .select('week, total_minutes')
        .eq(targetUserId ? 'user_id' : 'child_id', targetUserId || targetChildId)
        .order('week', { ascending: true });

      if (weeklyError) {
        console.error('Error fetching weekly minutes:', weeklyError);
        weeklyData = null;
      } else {
        weeklyData = data;
      }
    }

    // Calculate this week's minutes
    const currentWeekStart = this.getWeekStart(new Date());
    const thisWeekData = weeklyData?.find(
      (item) => new Date(item.week).getTime() === currentWeekStart.getTime(),
    );
    const minutesThisWeek = thisWeekData?.total_minutes || 0;

    // Get total lessons completed (with fallback for missing data)
    let lessonsCompleted = 0;
    if (this.configService.get('SUPABASE_URL')) {
      const { count, error: lessonsError } = await this.supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq(targetUserId ? 'user_id' : 'child_id', targetUserId || targetChildId)
        .not('completed_at', 'is', null);

      if (lessonsError) {
        console.error('Error fetching lesson count:', lessonsError);
      } else {
        lessonsCompleted = count || 0;
      }
    }

    // Calculate current streak (with fallback for missing function)
    let streakDays = 0;
    if (this.configService.get('SUPABASE_URL') && childId) {
      const { data: streakData, error: streakError } = await this.supabase
        .rpc('calculate_streak', { child_uuid: childId });

      if (streakError) {
        console.error('Error calculating streak:', streakError);
      } else {
        streakDays = streakData || 0;
      }
    }

    // Get badges earned
    const badges = await this.getUserBadges(targetUserId || targetChildId);

    // Get total XP (with fallback for missing table)
    let totalXp = 0;
    if (this.configService.get('SUPABASE_URL')) {
      const { data: xpData, error: xpError } = await this.supabase
        .from('xp_events')
        .select('xp_amount')
        .eq(targetUserId ? 'user_id' : 'child_id', targetUserId || targetChildId);

      if (xpError) {
        console.error('Error fetching XP:', xpError);
      } else {
        totalXp = xpData?.reduce((sum, event) => sum + event.xp_amount, 0) || 0;
      }
    }

    // Format weekly minutes for charts
    const weeklyMinutes = (weeklyData || []).map((item) => ({
      week: item.week,
      minutes: item.total_minutes,
    }));

    return {
      minutesThisWeek,
      lessonsCompleted: lessonsCompleted || 0,
      streakDays,
      badges,
      totalXp,
      weeklyMinutes,
    };
  }

  async getDashboardMastery(
    userId: string,
    childId?: string,
  ): Promise<DashboardMasteryResponseDto> {
    // Determine target child for queries
    const targetChildId = childId;

    // If childId provided, verify guardian owns this child
    if (childId) {
      const { data: child, error: childError } = await this.supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('guardian_id', userId)
        .single();

      if (childError || !child) {
        throw new NotFoundException('Child not found or access denied');
      }
    }

    if (!targetChildId) {
      throw new NotFoundException('Child ID is required for mastery data');
    }

    // Get lesson mastery data using the view (with fallback for missing view)
    let masteryData = null;
    if (this.configService.get('SUPABASE_URL')) {
      const { data, error: masteryError } = await this.supabase
        .from('v_lesson_mastery')
        .select('*')
        .eq('child_id', targetChildId)
        .order('course_title, unit_title, lesson_title');

      if (masteryError) {
        console.error('Error fetching mastery data:', masteryError);
        // Don't throw error, use empty data instead
        masteryData = [];
      } else {
        masteryData = data || [];
      }
    } else {
      masteryData = [];
    }

    // Transform data to DTOs
    const lessons: LessonMasteryDto[] = (masteryData || []).map((item) => ({
      lessonId: item.lesson_id,
      lessonTitle: item.lesson_title,
      unitId: item.unit_id,
      unitTitle: item.unit_title,
      courseId: item.course_id,
      courseTitle: item.course_title,
      mastery: Number(item.mastery) || 0,
      stars: item.stars || 0,
      attemptCount: item.attempt_count || 0,
      avgScore: Number(item.avg_score) || 0,
      lastCompleted: item.last_completed ? new Date(item.last_completed) : undefined,
    }));

    // Calculate overall statistics
    const totalLessons = lessons.length;
    const completedLessons = lessons.filter((lesson) => lesson.attemptCount > 0).length;
    const averageMastery = totalLessons > 0 
      ? lessons.reduce((sum, lesson) => sum + lesson.mastery, 0) / totalLessons 
      : 0;
    const totalStars = lessons.reduce((sum, lesson) => sum + lesson.stars, 0);

    const overall = {
      totalLessons,
      completedLessons,
      averageMastery: Math.round(averageMastery * 100) / 100,
      totalStars,
    };

    return {
      lessons,
      overall,
    };
  }

  private async getUserBadges(userOrChildId: string): Promise<BadgeDto[]> {
    if (!this.configService.get('SUPABASE_URL')) {
      return [];
    }

    const { data: userBadges, error: badgesError } = await this.supabase
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          code,
          title,
          description,
          icon
        )
      `)
      .eq('child_id', userOrChildId)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return [];
    }

    return (userBadges || []).map((userBadge) => ({
      code: userBadge.badges.code,
      title: userBadge.badges.title,
      description: userBadge.badges.description,
      icon: userBadge.badges.icon,
      earnedAt: new Date(userBadge.earned_at),
    }));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }
}
