import { notFound } from 'next/navigation';
import { LessonPlayerClient } from './client';

interface LessonPageProps {
  params: Promise<{
    lessonId: string;
    locale: string;
  }>;
}

async function getLesson(lessonId: string) {
  try {
    const API_URL = process.env.API_URL || 'http://localhost:4000';
    const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
      cache: 'no-store' // Always fetch fresh lesson data
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch lesson:', error);
    return null;
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <LessonPlayerClient 
          lessonId={lessonId} 
          initialLesson={lesson} 
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = await getLesson(lessonId);
  
  if (!lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }

  return {
    title: `${lesson.title} - WonderKids English`,
    description: lesson.objective,
  };
}
