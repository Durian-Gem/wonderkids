import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createClient } from '@supabase/supabase-js';
import { WeeklySummaryPayload } from './dto';
import { EmailProvider, ResendProvider, SMTPProvider, MockProvider } from './providers';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailProvider: EmailProvider;
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  constructor(
    private resendProvider: ResendProvider,
    private smtpProvider: SMTPProvider,
    private mockProvider: MockProvider,
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const provider = process.env.EMAIL_PROVIDER || 'mock';
    
    switch (provider.toLowerCase()) {
      case 'resend':
        this.emailProvider = this.resendProvider;
        break;
      case 'smtp':
        this.emailProvider = this.smtpProvider;
        break;
      default:
        this.emailProvider = this.mockProvider;
        break;
    }

    this.logger.log(`Email service initialized with provider: ${this.emailProvider.getName()}`);
  }

  // Weekly cron job - Sunday 18:00 Asia/Bangkok timezone
  @Cron('0 18 * * 0', {
    name: 'weekly-summary-emails',
    timeZone: process.env.TIMEZONE || 'Asia/Bangkok',
  })
  async handleWeeklySummaryJob() {
    this.logger.log('Starting weekly summary email job...');
    
    try {
      await this.enqueueWeeklySummaryEmails();
      this.logger.log('Weekly summary email job completed successfully');
    } catch (error) {
      this.logger.error('Weekly summary email job failed:', error);
    }
  }

  async enqueueWeeklySummaryEmails() {
    // Get all users who want weekly emails (assuming we have a preference)
    const { data: users, error: usersError } = await this.supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('email', 'is', null);

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    this.logger.log(`Processing weekly summaries for ${users.length} users`);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - 1);
    weekEnd.setHours(23, 59, 59, 999);

    for (const user of users) {
      try {
        const summary = await this.generateWeeklySummary(user.id, weekStart, weekEnd);
        
        // Only send email if there's meaningful activity
        if (summary.lessonsCompleted > 0 || summary.totalMinutes > 0) {
          const payload: WeeklySummaryPayload = {
            userId: user.id,
            userEmail: user.email,
            userName: user.full_name || 'WonderKids Parent',
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            summary
          };

          await this.enqueueEmailJob('weekly_summary', payload);
          this.logger.log(`Enqueued weekly summary for user ${user.id}`);
        } else {
          this.logger.log(`No activity for user ${user.id}, skipping email`);
        }
      } catch (error) {
        this.logger.error(`Failed to process weekly summary for user ${user.id}:`, error);
      }
    }
  }

  async generateWeeklySummary(userId: string, weekStart: Date, weekEnd: Date) {
    // Get user's children
    const { data: children } = await this.supabase
      .from('children')
      .select('id, name')
      .eq('guardian_id', userId);

    const childIds = children?.map(c => c.id) || [];
    const allUserIds = [userId, ...childIds];

    // Get week's attempts and progress
    const { data: attempts } = await this.supabase
      .from('attempts')
      .select(`
        id,
        user_id,
        child_id,
        score_percentage,
        duration_sec,
        completed_at,
        lessons (title, units (courses (title)))
      `)
      .in('user_id', allUserIds)
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString())
      .not('completed_at', 'is', null);

    // Calculate summary statistics
    const totalMinutes = Math.round((attempts?.reduce((sum, a) => sum + (a.duration_sec || 0), 0) || 0) / 60);
    const lessonsCompleted = attempts?.length || 0;

    // Get top scores
    const topScores = (attempts || [])
      .filter(a => a.score_percentage !== null)
      .sort((a, b) => b.score_percentage - a.score_percentage)
      .slice(0, 3)
      .map(a => ({
        lessonTitle: (a as any)?.lessons?.title || 'Unknown Lesson',
        score: a.score_percentage,
        date: a.completed_at?.split('T')[0] || ''
      }));

    // Get current streak (simplified - just count consecutive days with activity)
    const currentStreak = await this.calculateCurrentStreak(allUserIds);

    // Get badges earned this week (if we have a badges system)
    const badgesEarned = 0; // Placeholder

    // Children summary
    const childrenSummary = (children || []).map(child => {
      const childAttempts = attempts?.filter(a => a.child_id === child.id) || [];
      const childMinutes = Math.round(childAttempts.reduce((sum, a) => sum + (a.duration_sec || 0), 0) / 60);
      const childLessons = childAttempts.length;
      const avgScore = childAttempts.length > 0
        ? childAttempts.reduce((sum, a) => sum + (a.score_percentage || 0), 0) / childAttempts.length
        : 0;

      return {
        id: child.id,
        name: child.name,
        minutes: childMinutes,
        lessons: childLessons,
        progress: avgScore > 80 ? 'Excellent' : avgScore > 60 ? 'Good' : avgScore > 0 ? 'Learning' : 'Getting Started'
      };
    });

    return {
      totalMinutes,
      lessonsCompleted,
      currentStreak,
      badgesEarned,
      topScores,
      children: childrenSummary
    };
  }

  private async calculateCurrentStreak(userIds: string[]): Promise<number> {
    // Simplified streak calculation - count consecutive days with completed lessons
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data: dayAttempts } = await this.supabase
        .from('attempts')
        .select('id')
        .in('user_id', userIds)
        .gte('completed_at', dayStart.toISOString())
        .lte('completed_at', dayEnd.toISOString())
        .not('completed_at', 'is', null)
        .limit(1);

      if (dayAttempts && dayAttempts.length > 0) {
        streak++;
      } else if (i > 0) { // Don't break on today if no activity yet
        break;
      }
    }

    return streak;
  }

  async enqueueEmailJob(kind: string, payload: any) {
    const { data, error } = await this.supabase
      .from('email_jobs')
      .insert({
        user_id: payload.userId,
        kind,
        payload,
        status: 'queued',
        scheduled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to enqueue email job: ${error.message}`);
    }

    // Process immediately (in production, this might be handled by a separate worker)
    await this.processEmailJob(data.id);
    
    return data;
  }

  async processEmailJob(jobId: string) {
    const { data: job, error: jobError } = await this.supabase
      .from('email_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Email job not found: ${jobId}`);
    }

    if (job.status !== 'queued') {
      this.logger.warn(`Job ${jobId} is not in queued status: ${job.status}`);
      return;
    }

    try {
      let emailContent;
      
      switch (job.kind) {
        case 'weekly_summary':
          emailContent = this.generateWeeklySummaryEmail(job.payload);
          break;
        default:
          throw new Error(`Unknown email job kind: ${job.kind}`);
      }

      await this.emailProvider.sendEmail(
        job.payload.userEmail,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );

      // Mark as sent
      await this.supabase
        .from('email_jobs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      this.logger.log(`Email job ${jobId} processed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process email job ${jobId}:`, error);
      
      // Mark as failed
      await this.supabase
        .from('email_jobs')
        .update({ status: 'failed' })
        .eq('id', jobId);
    }
  }

  private generateWeeklySummaryEmail(payload: WeeklySummaryPayload) {
    const { userName, weekStart, weekEnd, summary } = payload;
    
    const subject = `🌟 Weekly Progress Summary - ${summary.lessonsCompleted} lessons completed!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly Progress Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px; }
          .content { padding: 20px; }
          .stat-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .highlight { color: #667eea; font-weight: bold; }
          .child-summary { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 10px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 Weekly Progress Summary</h1>
          <p>Learning achievements for ${weekStart} to ${weekEnd}</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}! 👋</h2>
          <p>Here's a summary of the learning progress this week:</p>
          
          <div class="stat-card">
            <h3>📊 Week Overview</h3>
            <ul>
              <li><span class="highlight">${summary.totalMinutes} minutes</span> of learning time</li>
              <li><span class="highlight">${summary.lessonsCompleted} lessons</span> completed</li>
              <li><span class="highlight">${summary.currentStreak} day</span> current streak 🔥</li>
              ${summary.badgesEarned > 0 ? `<li><span class="highlight">${summary.badgesEarned} new badges</span> earned 🏆</li>` : ''}
            </ul>
          </div>

          ${summary.topScores.length > 0 ? `
          <div class="stat-card">
            <h3>🏆 Top Performances</h3>
            <ul>
              ${summary.topScores.map(score => `
                <li>${score.lessonTitle}: <span class="highlight">${score.score}%</span> on ${score.date}</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          ${summary.children.length > 0 ? `
          <h3>👨‍👩‍👧‍👦 Children Progress</h3>
          ${summary.children.map(child => `
            <div class="child-summary">
              <h4>${child.name}</h4>
              <p>
                <strong>${child.lessons} lessons</strong> completed • 
                <strong>${child.minutes} minutes</strong> practiced • 
                Progress: <span class="highlight">${child.progress}</span>
              </p>
            </div>
          `).join('')}
          ` : ''}

          <div class="stat-card">
            <h3>🚀 Keep Going!</h3>
            <p>Great progress this week! Consistent practice leads to amazing results. Keep up the excellent work!</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://wonderkids.edu'}/dashboard" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
          </div>
        </div>

        <div class="footer">
          <p>Happy learning! 📚</p>
          <p>The WonderKids Team</p>
          <p><small>You're receiving this because you've enabled weekly progress emails. <a href="#">Unsubscribe</a></small></p>
        </div>
      </body>
      </html>
    `;

    const text = `
Weekly Progress Summary for ${userName}

Learning achievements for ${weekStart} to ${weekEnd}:

📊 Week Overview:
- ${summary.totalMinutes} minutes of learning time
- ${summary.lessonsCompleted} lessons completed  
- ${summary.currentStreak} day current streak
${summary.badgesEarned > 0 ? `- ${summary.badgesEarned} new badges earned` : ''}

${summary.topScores.length > 0 ? `
🏆 Top Performances:
${summary.topScores.map(score => `- ${score.lessonTitle}: ${score.score}% on ${score.date}`).join('\n')}
` : ''}

${summary.children.length > 0 ? `
👨‍👩‍👧‍👦 Children Progress:
${summary.children.map(child => `- ${child.name}: ${child.lessons} lessons, ${child.minutes} minutes, Progress: ${child.progress}`).join('\n')}
` : ''}

Keep up the excellent work!

The WonderKids Team
    `;

    return { subject, html, text };
  }

  // Manual trigger for development/testing
  async sendWeeklyNow(userId: string) {
    const { data: user, error: userError } = await this.supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - 1);
    weekEnd.setHours(23, 59, 59, 999);

    const summary = await this.generateWeeklySummary(userId, weekStart, weekEnd);

    const payload: WeeklySummaryPayload = {
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name || 'WonderKids Parent',
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      summary
    };

    return this.enqueueEmailJob('weekly_summary', payload);
  }
}
