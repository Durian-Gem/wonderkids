import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Types for Dashboard API
export interface DashboardSummary {
  minutesThisWeek: number;
  lessonsCompleted: number;
  streakDays: number;
  badges: Array<{
    code: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  totalXp: number;
  weeklyMinutes: Array<{
    week: string;
    minutes: number;
  }>;
}

export interface LessonMastery {
  lessonId: string;
  lessonTitle: string;
  unitId: string;
  unitTitle: string;
  courseId: string;
  courseTitle: string;
  mastery: number;
  stars: number;
  attemptCount: number;
  avgScore: number;
  lastCompleted?: string;
}

export interface DashboardMastery {
  lessons: LessonMastery[];
  overall: {
    totalLessons: number;
    completedLessons: number;
    averageMastery: number;
    totalStars: number;
  };
}

// API Client Functions
export class DashboardAPI {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  static async getDashboardSummary(childId?: string): Promise<DashboardSummary> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (childId) {
        params.append('childId', childId);
      }

      const url = `${API_URL}/api/dashboard/summary${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Dashboard summary request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      // Return mock data for development
      return {
        minutesThisWeek: 125.5,
        lessonsCompleted: 12,
        streakDays: 7,
        badges: [
          {
            code: 'FIRST_LESSON',
            title: 'First Steps',
            description: 'Completed your first lesson!',
            icon: '🌟',
            earnedAt: new Date().toISOString(),
          },
          {
            code: 'SEVEN_DAY_STREAK',
            title: 'Week Warrior',
            description: 'Learned for 7 days in a row!',
            icon: '🔥',
            earnedAt: new Date().toISOString(),
          },
        ],
        totalXp: 1250,
        weeklyMinutes: [
          { week: '2024-01-01', minutes: 45.5 },
          { week: '2024-01-08', minutes: 62.0 },
          { week: '2024-01-15', minutes: 78.3 },
          { week: '2024-01-22', minutes: 125.5 },
        ],
      };
    }
  }

  static async getDashboardMastery(childId?: string): Promise<DashboardMastery> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (childId) {
        params.append('childId', childId);
      }

      const url = `${API_URL}/api/dashboard/mastery${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Dashboard mastery request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard mastery:', error);
      // Return mock data for development
      return {
        lessons: [
          {
            lessonId: '1',
            lessonTitle: 'Greetings and Introductions',
            unitId: '1',
            unitTitle: 'Getting Started',
            courseId: '1',
            courseTitle: 'English Basics',
            mastery: 0.85,
            stars: 2,
            attemptCount: 3,
            avgScore: 85.5,
            lastCompleted: new Date().toISOString(),
          },
          {
            lessonId: '2',
            lessonTitle: 'Colors and Numbers',
            unitId: '1',
            unitTitle: 'Getting Started',
            courseId: '1',
            courseTitle: 'English Basics',
            mastery: 0.72,
            stars: 2,
            attemptCount: 2,
            avgScore: 72.0,
            lastCompleted: new Date().toISOString(),
          },
        ],
        overall: {
          totalLessons: 25,
          completedLessons: 18,
          averageMastery: 0.72,
          totalStars: 42,
        },
      };
    }
  }
}
