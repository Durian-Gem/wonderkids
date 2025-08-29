import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types for pronunciation API
export interface SpeechAttempt {
  id: string;
  userId: string;
  childId?: string;
  lessonId: string;
  activityId: string;
  questionId: string;
  audioPath: string;
  wordsTotal?: number;
  wordsCorrect?: number;
  accuracy?: number;
  fluencyScore?: number;
  pronScore?: number;
  wpm?: number;
  createdAt: string;
}

export interface CreateAttemptRequest {
  lessonId: string;
  activityId: string;
  questionId: string;
  audioPath: string;
}

export interface PronunciationScores {
  accuracy: number;
  fluencyScore: number;
  pronScore: number;
  wpm: number;
  wordsTotal: number;
  wordsCorrect: number;
}

// API helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

// Get API base URL
function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
}

// Pronunciation API functions
export const pronunciationApi = {
  /**
   * Create a new speech attempt
   */
  async createAttempt(data: CreateAttemptRequest): Promise<SpeechAttempt & PronunciationScores> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/pronunciation/attempts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create speech attempt' }));
      throw new Error(error.message || 'Failed to create speech attempt');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get speech attempts history
   */
  async getAttempts(lessonId?: string, childId?: string): Promise<SpeechAttempt[]> {
    const headers = await getAuthHeaders();
    
    const params = new URLSearchParams();
    if (lessonId) params.append('lessonId', lessonId);
    if (childId) params.append('childId', childId);
    
    const response = await fetch(`${getApiUrl()}/pronunciation/attempts?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get speech attempts' }));
      throw new Error(error.message || 'Failed to get speech attempts');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get a specific speech attempt by ID
   */
  async getAttempt(attemptId: string): Promise<SpeechAttempt> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/pronunciation/attempts/${attemptId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get speech attempt' }));
      throw new Error(error.message || 'Failed to get speech attempt');
    }

    const result = await response.json();
    return result.data;
  },
};

// Audio recording utilities
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  async uploadAudio(audioBlob: Blob, path: string): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(path, audioBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    return data.path;
  }
}

// Utility functions
export function generateAudioPath(userId: string, childId: string | undefined, questionId: string): string {
  const timestamp = Date.now();
  const child = childId || 'self';
  return `recordings/${userId}/${child}/${questionId}_${timestamp}.webm`;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreLabel(score: number): string {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.8) return 'Great';
  if (score >= 0.7) return 'Good';
  if (score >= 0.6) return 'Fair';
  return 'Keep Practicing';
}

export function calculateOverallScore(accuracy: number, fluency: number): number {
  return (accuracy * 0.7 + fluency * 0.3);
}
