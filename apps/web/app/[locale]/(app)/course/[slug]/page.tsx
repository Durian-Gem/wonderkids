'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { apiClient } from '@/src/lib/api';
import type { CourseWithUnits } from '@repo/types';

export default function CoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<CourseWithUnits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.getCourseBySlug(slug);
      setCourse(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Course not found</h1>
        <p className="text-muted-foreground mb-4">
          {error || 'The requested course could not be found.'}
        </p>
        <Button asChild>
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    );
  }

  const cefrLabel = course.cefr_level ? `CEFR ${course.cefr_level}` : '';

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            {cefrLabel && (
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                {cefrLabel}
              </span>
            )}
            {course.description && (
              <p className="mt-3 text-green-100">{course.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{course.units?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Units</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {course.units?.reduce((total, unit) => total + (unit.lessons?.length || 0), 0) || 0}
            </div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {course.units?.reduce((total, unit) => 
                total + (unit.lessons?.reduce((lessonTotal, lesson) => lessonTotal + lesson.est_minutes, 0) || 0), 0
              ) || 0} min
            </div>
            <div className="text-sm text-muted-foreground">Estimated Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Units and Lessons */}
      <div className="space-y-6">
        {course.units?.map((unit, unitIndex) => (
          <Card key={unit.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {unit.idx}
                </span>
                <span>{unit.title}</span>
              </CardTitle>
              {unit.description && (
                <CardDescription>{unit.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.lessons?.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                        {lesson.est_minutes}min
                      </span>
                    </div>
                    
                    {lesson.objective && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {lesson.objective}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Lesson {lesson.idx}
                      </span>
                      <Button size="sm" variant="outline">
                        Start Lesson
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Ready to start learning?</h3>
            <p className="text-muted-foreground">
              Begin with the first lesson and work your way through the course at your own pace.
            </p>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Start First Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
