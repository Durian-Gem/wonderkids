'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react';
import Recorder from '@/components/app/pronunciation/Recorder';
import PronScoreCard from '@/components/app/pronunciation/PronScoreCard';
import { lessonApi } from '@/lib/lesson-api';
import { pronunciationApi, SpeechAttempt } from '@/lib/pronunciation-api';

interface PracticeQuestion {
  id: string;
  questionText: string;
  correctAnswer?: string;
  audioUrl?: string;
}

interface PracticeActivity {
  id: string;
  title: string;
  instructions: string;
  questions: PracticeQuestion[];
}

export default function PronunciationPracticePage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [activities, setActivities] = useState<PracticeActivity[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState<{ [questionId: string]: SpeechAttempt[] }>({});
  const [latestAttempt, setLatestAttempt] = useState<SpeechAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    setIsLoading(true);
    try {
      const lessonData = await lessonApi.getLesson(lessonId);
      setLesson(lessonData);
      
      // Filter activities that can be used for pronunciation practice
      const practiceActivities = lessonData.activities
        .filter((activity: any) => 
          activity.type === 'mcq' || 
          activity.type === 'listen-choose' ||
          activity.questions?.some((q: any) => q.questionText)
        )
        .map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          instructions: activity.instructions || 'Practice pronouncing these words clearly.',
          questions: activity.questions
            .filter((q: any) => q.questionText)
            .map((q: any) => ({
              id: q.id,
              questionText: q.questionText,
              correctAnswer: q.options?.find((opt: any) => opt.isCorrect)?.text,
              audioUrl: q.audioUrl,
            }))
        }))
        .filter((activity: PracticeActivity) => activity.questions.length > 0);

      setActivities(practiceActivities);
      
      if (practiceActivities.length === 0) {
        setError('No pronunciation practice activities available for this lesson.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordingComplete = async (attemptData: SpeechAttempt) => {
    const questionId = getCurrentQuestion()?.id;
    if (!questionId) return;

    setLatestAttempt(attemptData);
    
    // Add to attempts history
    setAttempts(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), attemptData]
    }));

    // Load all attempts for this question to show progress
    try {
      const questionAttempts = await pronunciationApi.getAttempts(lessonId);
      const filteredAttempts = questionAttempts.filter(a => a.questionId === questionId);
      
      setAttempts(prev => ({
        ...prev,
        [questionId]: filteredAttempts
      }));
    } catch (err) {
      console.error('Failed to load attempts history:', err);
    }
  };

  const getCurrentActivity = (): PracticeActivity | null => {
    return activities[currentActivityIndex] || null;
  };

  const getCurrentQuestion = (): PracticeQuestion | null => {
    const activity = getCurrentActivity();
    return activity?.questions[currentQuestionIndex] || null;
  };

  const goToNextQuestion = () => {
    const activity = getCurrentActivity();
    if (!activity) return;

    if (currentQuestionIndex < activity.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setLatestAttempt(null);
    } else if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setLatestAttempt(null);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setLatestAttempt(null);
    } else if (currentActivityIndex > 0) {
      setCurrentActivityIndex(prev => prev - 1);
      const prevActivity = activities[currentActivityIndex - 1];
      setCurrentQuestionIndex(prevActivity.questions.length - 1);
      setLatestAttempt(null);
    }
  };

  const playQuestionAudio = () => {
    const question = getCurrentQuestion();
    if (question?.audioUrl) {
      const audio = new Audio(question.audioUrl);
      audio.play().catch(console.error);
    }
  };

  const resetCurrentAttempt = () => {
    setLatestAttempt(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pronunciation practice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentActivity = getCurrentActivity();
  const currentQuestion = getCurrentQuestion();
  const questionAttempts = currentQuestion ? attempts[currentQuestion.id] || [] : [];

  if (!currentActivity || !currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No pronunciation practice available</p>
            <Button onClick={() => router.back()}>Go Back to Lesson</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = {
    current: currentActivityIndex * getCurrentActivity()!.questions.length + currentQuestionIndex + 1,
    total: activities.reduce((sum, activity) => sum + activity.questions.length, 0)
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pronunciation Practice</h1>
              <p className="text-gray-600">{lesson?.title}</p>
            </div>
          </div>
          <Badge variant="outline">
            {progress.current} of {progress.total}
          </Badge>
        </div>

        {/* Activity Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{currentActivity.title}</CardTitle>
              <Badge variant="secondary">
                Question {currentQuestionIndex + 1} of {currentActivity.questions.length}
              </Badge>
            </div>
            <p className="text-gray-600">{currentActivity.instructions}</p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Practice Question</CardTitle>
                  {currentQuestion.audioUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playQuestionAudio}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Listen
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-xl font-medium text-gray-900">
                    {currentQuestion.questionText}
                  </p>
                  {currentQuestion.correctAnswer && (
                    <p className="text-lg text-blue-600 font-medium">
                      "{currentQuestion.correctAnswer}"
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Recorder
              questionId={currentQuestion.id}
              lessonId={lessonId}
              activityId={currentActivity.id}
              expectedText={currentQuestion.correctAnswer}
              onRecordingComplete={handleRecordingComplete}
            />

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentActivityIndex === 0 && currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {latestAttempt && (
                <Button
                  variant="outline"
                  onClick={resetCurrentAttempt}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              <Button
                onClick={goToNextQuestion}
                disabled={
                  currentActivityIndex === activities.length - 1 && 
                  currentQuestionIndex === currentActivity.questions.length - 1
                }
              >
                {currentActivityIndex === activities.length - 1 && 
                 currentQuestionIndex === currentActivity.questions.length - 1
                  ? 'Complete' 
                  : 'Next'}
              </Button>
            </div>
          </div>

          {/* Score Section */}
          <div className="space-y-4">
            {latestAttempt ? (
              <PronScoreCard
                attempt={latestAttempt}
                previousAttempts={questionAttempts.slice(0, -1)}
                showDetails={true}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-400 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <p className="font-medium">Record your pronunciation</p>
                    <p className="text-sm">Your score will appear here</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previous Attempts */}
            {questionAttempts.length > 0 && !latestAttempt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Previous Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {questionAttempts.slice(-3).map((attempt, index) => (
                      <div key={attempt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">
                          Attempt {questionAttempts.length - questionAttempts.slice(-3).length + index + 1}
                        </span>
                        <Badge variant="outline">
                          {Math.round((attempt.pronScore || 0) * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
