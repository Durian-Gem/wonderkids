'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { LessonPlayer } from '@/components/app/lesson-player/LessonPlayer';
import { useLessonPlayerStore } from '@/lib/lesson-player-store';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { useRouter } from 'next/navigation';

interface LessonPlayerClientProps {
  lessonId: string;
  initialLesson?: any;
}

export function LessonPlayerClient({ lessonId, initialLesson }: LessonPlayerClientProps) {
  const { user, loading } = useAuth();
  const { reset } = useLessonPlayerStore();
  const router = useRouter();

  // Reset lesson player state when component mounts
  useEffect(() => {
    reset();
  }, [reset]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in' as any);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600 mb-4">Please sign in to access lessons</p>
        <Button onClick={() => router.push('/auth/sign-in' as any)}>
          Sign In
        </Button>
      </Card>
    );
  }

  return (
    <LessonPlayer 
      lessonId={lessonId} 
      initialLesson={initialLesson} 
    />
  );
}
