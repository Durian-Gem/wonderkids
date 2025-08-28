import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class LessonsService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getLessonById(lessonId: string) {
    try {
      // Get lesson basic info first (using public schema)
      const { data: lesson, error: lessonError } = await this.supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError || !lesson) {
        throw new NotFoundException(`Lesson with id "${lessonId}" not found`);
      }

      // Get activities with questions and options separately
      const { data: activities, error: activitiesError } = await this.supabase
        .from('activities')
        .select(`
          *,
          questions:questions(
            *,
            options:options(*)
          )
        `)
        .eq('lesson_id', lessonId)
        .order('idx', { ascending: true });

      if (activitiesError) {
        throw new Error(`Failed to fetch activities: ${activitiesError.message}`);
      }

      // Sort questions and options
      const sortedActivities = activities.map(activity => ({
        ...activity,
        questions: activity.questions
          ?.sort((a, b) => a.idx - b.idx)
          .map(question => ({
            ...question,
            options: question.options?.sort((a, b) => a.idx - b.idx) || []
          })) || []
      }));

      const result = {
        ...lesson,
        activities: sortedActivities
      };

      return { data: result, success: true };
    } catch (err) {
      console.error('Service error:', err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new Error(`Failed to fetch lesson: ${(err as Error).message}`);
    }
  }
}
