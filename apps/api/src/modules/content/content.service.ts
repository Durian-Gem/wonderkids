import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class ContentService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getCourses() {
    try {
      // Query courses from public schema (default)
      const { data, error } = await this.supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch courses: ${error.message}`);
      }

      return { data, success: true };
    } catch (err) {
      console.error('Service error:', err);
      throw err;
    }
  }

  async getCourseBySlug(slug: string, userId?: string, forcePremium: boolean = false) {
    // Get course with units and lessons
    const { data: course, error: courseError } = await this.supabase
      .from('courses')
      .select(`
        *,
        units:units(
          *,
          lessons:lessons(*)
        )
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      throw new NotFoundException(`Course with slug "${slug}" not found`);
    }

    // Check if course is premium and user access
    if (course.is_premium) {
      if (!userId) {
        // For premium courses, return limited info when not authenticated
        return {
          data: {
            ...course,
            units: [],
            description: course.description,
            isPremium: true,
            requiresSubscription: true,
          },
          success: true,
        };
      }

      // Check if user has active subscription
      const hasActiveSubscription = await this.checkUserSubscription(userId);
      
      if (!hasActiveSubscription && !forcePremium) {
        throw new ForbiddenException('Premium subscription required to access this course');
      }
    }

    // Filter only published units and lessons
    const publishedUnits = course.units
      ?.filter(unit => unit.is_published)
      .map(unit => ({
        ...unit,
        lessons: unit.lessons
          ?.filter(lesson => lesson.is_published)
          .sort((a, b) => a.idx - b.idx) || []
      }))
      .sort((a, b) => a.idx - b.idx) || [];

    const result = {
      ...course,
      units: publishedUnits,
      isPremium: course.is_premium,
    };

    return { data: result, success: true };
  }

  private async checkUserSubscription(userId: string): Promise<boolean> {
    try {
      const { data: hasActiveSubscription, error } = await this.supabase
        .rpc('has_active_subscription', { user_uuid: userId });

      if (error) {
        console.error('Error checking subscription:', error);
        return false;
      }

      return hasActiveSubscription || false;
    } catch (error) {
      console.error('Error checking user subscription:', error);
      return false;
    }
  }
}
