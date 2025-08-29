import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types for tutor API
export interface TutorSession {
  id: string;
  userId: string;
  childId?: string;
  topic: string;
  provider: string;
  systemPrompt: string;
  createdAt: string;
  messages: TutorMessage[];
}

export interface TutorMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface CreateSessionRequest {
  topic: string;
  childId?: string;
}

export interface AddMessageRequest {
  content: string;
}

// Available tutor topics with metadata
export const TUTOR_TOPICS = [
  {
    id: 'animals',
    title: 'Animals',
    description: 'Learn about pets, farm animals, and wild animals',
    icon: '🐾',
    color: 'bg-green-500'
  },
  {
    id: 'family',
    title: 'Family',
    description: 'Talk about family members and relationships',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-blue-500'
  },
  {
    id: 'school',
    title: 'School',
    description: 'Discuss school subjects and activities',
    icon: '🏫',
    color: 'bg-purple-500'
  },
  {
    id: 'food',
    title: 'Food',
    description: 'Learn about healthy foods and meals',
    icon: '🍎',
    color: 'bg-orange-500'
  },
  {
    id: 'weather',
    title: 'Weather',
    description: 'Talk about sunny, rainy, and snowy days',
    icon: '🌤️',
    color: 'bg-yellow-500'
  },
  {
    id: 'hobbies',
    title: 'Hobbies',
    description: 'Share your favorite activities and games',
    icon: '🎨',
    color: 'bg-pink-500'
  },
  {
    id: 'numbers',
    title: 'Numbers',
    description: 'Practice counting and simple math',
    icon: '🔢',
    color: 'bg-indigo-500'
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Learn about different colors around us',
    icon: '🌈',
    color: 'bg-red-500'
  },
  {
    id: 'body-parts',
    title: 'Body Parts',
    description: 'Learn about head, hands, feet and more',
    icon: '👤',
    color: 'bg-teal-500'
  },
  {
    id: 'clothes',
    title: 'Clothes',
    description: 'Talk about what we wear in different weather',
    icon: '👕',
    color: 'bg-cyan-500'
  }
] as const;

export type TutorTopicId = typeof TUTOR_TOPICS[number]['id'];

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

// Tutor API functions
export const tutorApi = {
  /**
   * Create a new tutor session
   */
  async createSession(data: CreateSessionRequest): Promise<TutorSession> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/tutor/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create session' }));
      throw new Error(error.message || 'Failed to create session');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Add a message to a tutor session
   */
  async addMessage(sessionId: string, data: AddMessageRequest): Promise<{ userMessage: TutorMessage; aiMessage: TutorMessage }> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/tutor/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to send message' }));
      throw new Error(error.message || 'Failed to send message');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get a tutor session with messages
   */
  async getSession(sessionId: string): Promise<TutorSession> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/tutor/sessions/${sessionId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get session' }));
      throw new Error(error.message || 'Failed to get session');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get user's recent tutor sessions
   */
  async getUserSessions(): Promise<Array<{
    id: string;
    topic: string;
    createdAt: string;
    children?: { id: string; name: string };
  }>> {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${getApiUrl()}/tutor/sessions`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get sessions' }));
      throw new Error(error.message || 'Failed to get sessions');
    }

    const result = await response.json();
    return result.data;
  },
};

// Utility functions
export function getTutorTopicById(topicId: string) {
  return TUTOR_TOPICS.find(topic => topic.id === topicId);
}

export function validateMessageContent(content: string): string | null {
  if (!content.trim()) {
    return 'Message cannot be empty';
  }
  
  if (content.length > 300) {
    return 'Message is too long. Please keep it under 60 words.';
  }
  
  // Simple word count check (approximately)
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount > 60) {
    return 'Please keep your message under 60 words for better conversation.';
  }
  
  return null; // Valid
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
