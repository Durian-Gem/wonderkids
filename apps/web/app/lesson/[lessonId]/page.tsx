import { LessonPageClient } from './client';

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  
  return <LessonPageClient lessonId={lessonId} />;
}
