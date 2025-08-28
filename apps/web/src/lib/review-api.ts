import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Types for Review API
export interface ReviewQuestion {
  reviewItemId: string;
  questionId: string;
  questionText: string;
  questionType: string;
  activityTitle: string;
  activityInstructions: string;
  box: number;
  lapses: number;
  lastGrade?: number;
  dueAt: string;
  options: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
  }>;
  lesson: {
    lessonId: string;
    lessonTitle: string;
    unitTitle: string;
    courseTitle: string;
  };
}

export interface ReviewQueue {
  questions: ReviewQuestion[];
  totalDue: number;
  boxDistribution: {
    box1: number;
    box2: number;
    box3: number;
    box4: number;
    box5: number;
  };
}

export interface ReviewGradeResponse {
  success: boolean;
  newBox: number;
  nextDue: string;
  lapses: number;
  remainingInQueue: number;
  message: string;
}

// API Client Functions
export class ReviewAPI {
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

  static async getReviewQueue(childId?: string, limit: number = 10): Promise<ReviewQueue> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (childId) {
        params.append('childId', childId);
      }
      params.append('limit', limit.toString());

      const url = `${API_URL}/api/review/queue?${params.toString()}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Review queue request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching review queue:', error);
      // Return mock data for development
      return {
        questions: [
          {
            reviewItemId: '1',
            questionId: '1',
            questionText: 'What color is the sky?',
            questionType: 'mcq',
            activityTitle: 'Colors Quiz',
            activityInstructions: 'Choose the correct answer',
            box: 2,
            lapses: 0,
            lastGrade: 2,
            dueAt: new Date().toISOString(),
            options: [
              { id: '1', optionText: 'Blue', isCorrect: true },
              { id: '2', optionText: 'Red', isCorrect: false },
              { id: '3', optionText: 'Green', isCorrect: false },
            ],
            lesson: {
              lessonId: '1',
              lessonTitle: 'Basic Colors',
              unitTitle: 'Getting Started',
              courseTitle: 'English Basics',
            },
          },
          {
            reviewItemId: '2',
            questionId: '2',
            questionText: 'How do you say "hello" in English?',
            questionType: 'mcq',
            activityTitle: 'Greetings',
            activityInstructions: 'Select the greeting',
            box: 1,
            lapses: 1,
            lastGrade: 0,
            dueAt: new Date().toISOString(),
            options: [
              { id: '4', optionText: 'Hello', isCorrect: true },
              { id: '5', optionText: 'Goodbye', isCorrect: false },
              { id: '6', optionText: 'Please', isCorrect: false },
            ],
            lesson: {
              lessonId: '2',
              lessonTitle: 'Greetings and Introductions',
              unitTitle: 'Getting Started',
              courseTitle: 'English Basics',
            },
          },
        ],
        totalDue: 2,
        boxDistribution: {
          box1: 5,
          box2: 8,
          box3: 7,
          box4: 3,
          box5: 2,
        },
      };
    }
  }

  static async gradeReviewItem(
    questionId: string,
    grade: number,
    childId?: string
  ): Promise<ReviewGradeResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const body = {
        questionId,
        grade,
        ...(childId && { childId }),
      };

      const url = `${API_URL}/api/review/grade`;
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Review grade request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error grading review item:', error);
      // Return mock response for development
      return {
        success: true,
        newBox: Math.min(5, Math.max(1, grade + 1)),
        nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        lapses: grade === 0 ? 1 : 0,
        remainingInQueue: Math.max(0, Math.floor(Math.random() * 10)),
        message: this.getGradeFeedbackMessage(grade),
      };
    }
  }

  private static getGradeFeedbackMessage(grade: number): string {
    const messages = {
      0: "No worries! We'll review this again soon.",
      1: "Good effort! Let's practice this more.",
      2: "Great job! You're making progress.",
      3: "Excellent! You've mastered this.",
    };
    return messages[grade as keyof typeof messages] || 'Keep learning!';
  }
}
