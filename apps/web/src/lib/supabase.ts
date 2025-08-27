import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types for our database
export type Database = {
  app: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: 'guardian' | 'child' | 'admin' | 'teacher';
          locale: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guardian' | 'child' | 'admin' | 'teacher';
          locale?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          role?: 'guardian' | 'child' | 'admin' | 'teacher';
          locale?: string;
        };
      };
      children: {
        Row: {
          id: string;
          guardian_id: string;
          display_name: string;
          avatar_url: string | null;
          birth_year: number | null;
          locale: string;
          created_at: string;
        };
        Insert: {
          guardian_id: string;
          display_name: string;
          avatar_url?: string | null;
          birth_year?: number | null;
          locale?: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          birth_year?: number | null;
          locale?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          cefr_level: 'preA1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | null;
          description: string | null;
          is_published: boolean;
          created_at: string;
        };
      };
      units: {
        Row: {
          id: string;
          course_id: string;
          idx: number;
          title: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          unit_id: string;
          idx: number;
          title: string;
          objective: string | null;
          est_minutes: number;
          is_published: boolean;
          created_at: string;
        };
      };
    };
  };
};
