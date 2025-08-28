'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@repo/ui';
import { useLessonPlayerStore, Lesson, UserResponse } from '@/lib/lesson-player-store';
import { lessonApi } from '@/lib/lesson-api';
import { ActivityRenderer } from './ActivityRenderer';
import { ProgressDots } from './ProgressDots';
import { TimerBadge } from './TimerBadge';
import { ResultDialog } from './ResultDialog';

interface LessonPlayerProps {
  lessonId: string;
  initialLesson?: Lesson;
}

export function LessonPlayer({ lessonId, initialLesson }: LessonPlayerProps) {
  const router = useRouter();
  const {
    lesson,
    attemptId,
    currentActivityIndex,
    responses,
    isLoading,
    score,
    xpAwarded,
    streak,
    showResults,
    setLesson,
    setAttemptId,
    nextActivity,
    previousActivity,
    setResponse,
    setLoading,
    setResults,
    hideResultsDialog,
    reset
  } = useLessonPlayerStore();

  const [hasAttemptStarted, setHasAttemptStarted] = useState(false);

  // Initialize lesson
  useEffect(() => {
    if (initialLesson) {
      setLesson(initialLesson);
    } else if (lessonId && !lesson) {
      loadLesson();
    }
  }, [lessonId, initialLesson, lesson, setLesson]);

  // Start attempt when lesson is loaded
  useEffect(() => {
    if (lesson && !hasAttemptStarted && !attemptId) {
      startAttempt();
    }
  }, [lesson, hasAttemptStarted, attemptId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const lessonData = await lessonApi.getLesson(lessonId);
      setLesson(lessonData);
    } catch (error) {
      console.error('Failed to load lesson:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const startAttempt = async () => {
    if (!lesson) return;

    try {
      setLoading(true);
      const newAttemptId = await lessonApi.createAttempt({ lessonId: lesson.id });
      setAttemptId(newAttemptId);
      setHasAttemptStarted(true);
    } catch (error) {
      console.error('Failed to start attempt:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!attemptId || responses.length === 0) return;

    try {
      setLoading(true);
      await lessonApi.submitAnswers(attemptId, { answers: responses });
    } catch (error) {
      console.error('Failed to submit answers:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const finishLesson = async () => {
    if (!attemptId) return;

    try {
      setLoading(true);
      
      // Submit any pending answers first
      await submitAnswers();
      
      // Finish the attempt
      const result = await lessonApi.finishAttempt(attemptId);
      setResults(result.score, result.xpAwarded, result.streak);
    } catch (error) {
      console.error('Failed to finish lesson:', error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, response: Record<string, any>) => {
    setResponse(questionId, response);
  };

  const handleNext = () => {
    if (!lesson) return;

    if (currentActivityIndex < lesson.activities.length - 1) {
      nextActivity();
    } else {
      finishLesson();
    }
  };

  const handlePrevious = () => {
    previousActivity();
  };

  const handleResultClose = () => {
    hideResultsDialog();
    router.push('/dashboard');
  };

  const handleContinue = () => {
    hideResultsDialog();
    router.push('/dashboard');
  };

  // Get current activity responses
  const getCurrentActivityResponses = () => {
    if (!lesson) return {};
    
    const currentActivity = lesson.activities[currentActivityIndex];
    const activityResponses: Record<string, any> = {};
    
    if (currentActivity?.questions) {
      currentActivity.questions.forEach(question => {
        const response = responses.find(r => r.questionId === question.id);
        if (response) {
          activityResponses[question.id] = response.response;
        }
      });
    }
    
    return activityResponses;
  };

  // Check if current activity is answered
  const isCurrentActivityAnswered = () => {
    if (!lesson) return false;
    
    const currentActivity = lesson.activities[currentActivityIndex];
    if (!currentActivity?.questions) return false;
    
    return currentActivity.questions.every(question => 
      responses.some(r => r.questionId === question.id)
    );
  };

  if (isLoading && !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>Lesson not found</p>
        <Button 
          onClick={() => router.push('/dashboard')} 
          className="mt-4"
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  const currentActivity = lesson.activities[currentActivityIndex];
  const isLastActivity = currentActivityIndex === lesson.activities.length - 1;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <TimerBadge minutes={lesson.est_minutes} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lesson.title}
        </h1>
        
        <p className="text-gray-600 mb-4">
          {lesson.objective}
        </p>
        
        <ProgressDots
          total={lesson.activities.length}
          current={currentActivityIndex}
          className="mb-4"
        />
      </div>

      {/* Activity */}
      {currentActivity && (
        <div className="mb-6">
          <ActivityRenderer
            activity={currentActivity}
            onAnswerChange={handleAnswerChange}
            responses={getCurrentActivityResponses()}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentActivityIndex === 0 || isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          Activity {currentActivityIndex + 1} of {lesson.activities.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={!isCurrentActivityAnswered() || isLoading}
          className={cn(isLastActivity && "bg-green-600 hover:bg-green-700")}
        >
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
          ) : isLastActivity ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <ArrowRight className="w-4 h-4 mr-2" />
          )}
          {isLastActivity ? 'Finish Lesson' : 'Next'}
        </Button>
      </div>

      {/* Results Dialog */}
      <ResultDialog
        isOpen={showResults}
        score={score || 0}
        xpAwarded={xpAwarded || 0}
        streak={streak || 0}
        correctAnswers={0} // TODO: Calculate from responses
        totalQuestions={lesson.activities.reduce((sum, activity) => sum + activity.questions.length, 0)}
        onClose={handleResultClose}
        onContinue={handleContinue}
      />
    </div>
  );
}
