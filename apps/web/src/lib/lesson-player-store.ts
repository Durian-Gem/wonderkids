import { create } from 'zustand';

export interface Question {
  id: string;
  idx: number;
  stem: any; // JSON object with question content
  answer: any; // JSON object with correct answers
  options?: Array<{
    id: string;
    idx: number;
    label: any; // JSON object with option content
    is_correct: boolean;
  }>;
  metadata?: any;
}

export interface Activity {
  id: string;
  idx: number;
  kind: 'quiz_mcq' | 'listen_choose' | 'match_pairs';
  prompt: any; // JSON object with activity instructions
  is_required: boolean;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  objective: string;
  est_minutes: number;
  activities: Activity[];
}

export interface UserResponse {
  questionId: string;
  response: Record<string, any>;
}

interface LessonPlayerState {
  // Current lesson data
  lesson: Lesson | null;
  attemptId: string | null;
  
  // Player state
  currentActivityIndex: number;
  responses: UserResponse[];
  isPlaying: boolean;
  isLoading: boolean;
  
  // Results
  score: number | null;
  xpAwarded: number | null;
  streak: number | null;
  showResults: boolean;
  
  // Actions
  setLesson: (lesson: Lesson) => void;
  setAttemptId: (attemptId: string) => void;
  nextActivity: () => void;
  previousActivity: () => void;
  goToActivity: (index: number) => void;
  setResponse: (questionId: string, response: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  setResults: (score: number, xpAwarded: number, streak: number) => void;
  showResultsDialog: () => void;
  hideResultsDialog: () => void;
  reset: () => void;
}

export const useLessonPlayerStore = create<LessonPlayerState>((set, get) => ({
  // Initial state
  lesson: null,
  attemptId: null,
  currentActivityIndex: 0,
  responses: [],
  isPlaying: false,
  isLoading: false,
  score: null,
  xpAwarded: null,
  streak: null,
  showResults: false,

  // Actions
  setLesson: (lesson) => set({ lesson, isPlaying: true }),
  
  setAttemptId: (attemptId) => set({ attemptId }),
  
  nextActivity: () => set((state) => {
    const maxIndex = state.lesson?.activities.length ? state.lesson.activities.length - 1 : 0;
    return {
      currentActivityIndex: Math.min(state.currentActivityIndex + 1, maxIndex)
    };
  }),
  
  previousActivity: () => set((state) => ({
    currentActivityIndex: Math.max(state.currentActivityIndex - 1, 0)
  })),
  
  goToActivity: (index) => set((state) => {
    const maxIndex = state.lesson?.activities.length ? state.lesson.activities.length - 1 : 0;
    return {
      currentActivityIndex: Math.min(Math.max(index, 0), maxIndex)
    };
  }),
  
  setResponse: (questionId, response) => set((state) => {
    const newResponses = state.responses.filter(r => r.questionId !== questionId);
    newResponses.push({ questionId, response });
    return { responses: newResponses };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setResults: (score, xpAwarded, streak) => set({
    score,
    xpAwarded,
    streak,
    showResults: true,
    isPlaying: false
  }),
  
  showResultsDialog: () => set({ showResults: true }),
  
  hideResultsDialog: () => set({ showResults: false }),
  
  reset: () => set({
    lesson: null,
    attemptId: null,
    currentActivityIndex: 0,
    responses: [],
    isPlaying: false,
    isLoading: false,
    score: null,
    xpAwarded: null,
    streak: null,
    showResults: false
  })
}));
