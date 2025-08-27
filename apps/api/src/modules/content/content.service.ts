import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class ContentService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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

  async getCourseBySlug(slug: string) {
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
      units: publishedUnits
    };

    return { data: result, success: true };
  }
}
