import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(':3000', ':4000') || 'http://localhost:4000';

interface CreateAttemptRequest {
  lessonId: string;
  childId?: string;
}

interface SubmitAnswersRequest {
  answers: Array<{
    questionId: string;
    response: Record<string, any>;
  }>;
}

interface LessonApiResponse<T> {
  data: T;
  success: boolean;
}

interface AttemptResult {
  score: number;
  xpAwarded: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
}

export class LessonApi {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  async getLesson(lessonId: string) {
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lesson: ${response.statusText}`);
    }
    
    const result: LessonApiResponse<any> = await response.json();
    return result.data;
  }

  async createAttempt(request: CreateAttemptRequest) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_URL}/api/attempts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create attempt: ${response.statusText}`);
    }
    
    const result: LessonApiResponse<{ attemptId: string }> = await response.json();
    return result.data.attemptId;
  }

  async submitAnswers(attemptId: string, request: SubmitAnswersRequest) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_URL}/api/attempts/${attemptId}/answers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit answers: ${response.statusText}`);
    }
    
    const result: LessonApiResponse<{}> = await response.json();
    return result.success;
  }

  async finishAttempt(attemptId: string) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_URL}/api/attempts/${attemptId}/finish`, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to finish attempt: ${response.statusText}`);
    }
    
    const result: LessonApiResponse<AttemptResult> = await response.json();
    return result.data;
  }
}

export const lessonApi = new LessonApi();
