'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Brain, 
  Clock, 
  Target, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Zap,
  Trophy,
  ArrowRight,
  Users
} from 'lucide-react';
import { ReviewAPI, ReviewQuestion, ReviewQueue } from '@/lib/review-api';
import { cn } from '@/lib/utils';

// Mock children data (replace with actual API call)
const mockChildren = [
  {
    id: '1',
    name: 'Emma',
    avatar: '/images/avatars/child1.png',
    age: 8,
  },
  {
    id: '2', 
    name: 'Lucas',
    avatar: '/images/avatars/child2.png',
    age: 6,
  },
];

interface ChildSelectorProps {
  children: typeof mockChildren;
  selectedChildId: string | null;
  onChildSelect: (childId: string | null) => void;
}

function ChildSelector({ children, selectedChildId, onChildSelect }: ChildSelectorProps) {
  const t = useTranslations('Review');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('selectChild')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedChildId === null ? "default" : "outline"}
            onClick={() => onChildSelect(null)}
            size="sm"
          >
            {t('allChildren')}
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChildId === child.id ? "default" : "outline"}
              onClick={() => onChildSelect(child.id)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={child.avatar} alt={child.name} />
                <AvatarFallback>{child.name[0]}</AvatarFallback>
              </Avatar>
              {child.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QueueStatsProps {
  queue: ReviewQueue;
}

function QueueStats({ queue }: QueueStatsProps) {
  const t = useTranslations('Review');
  const total = Object.values(queue.boxDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('dueToday')}</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{queue.totalDue}</div>
          <p className="text-xs text-muted-foreground">{t('questionsReady')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('totalInQueue')}</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">{t('allLevels')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('mastered')}</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{queue.boxDistribution.box5}</div>
          <p className="text-xs text-muted-foreground">{t('level5Items')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface BoxDistributionProps {
  distribution: ReviewQueue['boxDistribution'];
}

function BoxDistribution({ distribution }: BoxDistributionProps) {
  const t = useTranslations('Review');
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  const boxes = [
    { level: 1, count: distribution.box1, color: 'bg-red-500', label: t('learning') },
    { level: 2, count: distribution.box2, color: 'bg-orange-500', label: t('practicing') },
    { level: 3, count: distribution.box3, color: 'bg-yellow-500', label: t('improving') },
    { level: 4, count: distribution.box4, color: 'bg-blue-500', label: t('strong') },
    { level: 5, count: distribution.box5, color: 'bg-green-500', label: t('mastered') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          {t('knowledgeDistribution')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {boxes.map((box) => (
          <div key={box.level} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {t('level')} {box.level}: {box.label}
              </span>
              <span className="text-muted-foreground">{box.count} {t('items')}</span>
            </div>
            <Progress 
              value={total > 0 ? (box.count / total) * 100 : 0} 
              className="h-2"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface ReviewCardProps {
  question: ReviewQuestion;
  onGrade: (grade: number) => void;
  isLoading: boolean;
}

function ReviewCard({ question, onGrade, isLoading }: ReviewCardProps) {
  const t = useTranslations('Review');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (isLoading || showFeedback) return;
    setSelectedOption(optionId);
    setShowFeedback(true);
  };

  const handleGrade = (grade: number) => {
    onGrade(grade);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const gradeButtons = [
    { grade: 0, label: t('again'), color: 'bg-red-500 hover:bg-red-600', icon: RotateCcw },
    { grade: 1, label: t('hard'), color: 'bg-orange-500 hover:bg-orange-600', icon: XCircle },
    { grade: 2, label: t('good'), color: 'bg-blue-500 hover:bg-blue-600', icon: CheckCircle },
    { grade: 3, label: t('easy'), color: 'bg-green-500 hover:bg-green-600', icon: Zap },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{question.activityTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{question.lesson.courseTitle} • {question.lesson.unitTitle}</p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {t('level')} {question.box}
          </Badge>
        </div>
        <p className="text-muted-foreground">{question.activityInstructions}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{question.questionText}</div>
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "w-full text-left justify-start h-auto p-4",
                selectedOption === option.id && "ring-2 ring-primary",
                showFeedback && option.isCorrect && "bg-green-100 border-green-500",
                showFeedback && selectedOption === option.id && !option.isCorrect && "bg-red-100 border-red-500"
              )}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isLoading}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                )}>
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span>{option.optionText}</span>
                {showFeedback && option.isCorrect && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {showFeedback && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-3">{t('howWasThis')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {gradeButtons.map((button) => {
                  const Icon = button.icon;
                  return (
                    <Button
                      key={button.grade}
                      onClick={() => handleGrade(button.grade)}
                      disabled={isLoading}
                      className={cn("text-white", button.color)}
                      size="sm"
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {button.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SessionCompleteProps {
  questionsCompleted: number;
  onRestart: () => void;
  onDashboard: () => void;
}

function SessionComplete({ questionsCompleted, onRestart, onDashboard }: SessionCompleteProps) {
  const t = useTranslations('Review');

  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardContent className="p-8 space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Trophy className="h-8 w-8 text-green-500" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">{t('sessionComplete')}</h2>
          <p className="text-muted-foreground mt-2">
            {t('questionsCompleted', { count: questionsCompleted })}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={onRestart} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('reviewMore')}
          </Button>
          <Button variant="outline" onClick={onDashboard} className="w-full">
            <ArrowRight className="h-4 w-4 mr-2" />
            {t('goToDashboard')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewPage() {
  const t = useTranslations('Review');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [queue, setQueue] = useState<ReviewQueue | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, [selectedChildId]);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const queueData = await ReviewAPI.getReviewQueue(selectedChildId || undefined);
      setQueue(queueData);
      setCurrentQuestionIndex(0);
      setQuestionsCompleted(0);
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (grade: number) => {
    if (!queue || !queue.questions[currentQuestionIndex]) return;
    
    setGrading(true);
    try {
      const question = queue.questions[currentQuestionIndex];
      await ReviewAPI.gradeReviewItem(
        question.questionId,
        grade,
        selectedChildId || undefined
      );
      
      setQuestionsCompleted(prev => prev + 1);
      
      // Move to next question or complete session
      if (currentQuestionIndex < queue.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Session complete
        setSessionStarted(false);
      }
    } catch (error) {
      console.error('Error grading question:', error);
    } finally {
      setGrading(false);
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    setCurrentQuestionIndex(0);
    setQuestionsCompleted(0);
  };

  const handleRestartSession = () => {
    fetchReviewQueue();
    setSessionStarted(true);
  };

  const handleGoToDashboard = () => {
    window.location.href = '/guardian-dashboard';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('loading')}</div>
        </div>
      </div>
    );
  }

  const currentQuestion = queue?.questions[currentQuestionIndex];
  const hasQuestions = queue && queue.questions.length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Child Selector */}
      <ChildSelector
        children={mockChildren}
        selectedChildId={selectedChildId}
        onChildSelect={setSelectedChildId}
      />

      {!sessionStarted && hasQuestions && (
        <>
          {/* Queue Statistics */}
          <QueueStats queue={queue} />

          {/* Knowledge Distribution */}
          <BoxDistribution distribution={queue.boxDistribution} />

          {/* Start Session */}
          <div className="text-center space-y-4">
            <Button onClick={handleStartSession} size="lg" className="px-8">
              <Brain className="h-5 w-5 mr-2" />
              {t('startReview')}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t('readyQuestions', { count: queue.totalDue })}
            </p>
          </div>
        </>
      )}

      {sessionStarted && currentQuestion && (
        <>
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('progress')}</span>
              <span>{currentQuestionIndex + 1} / {queue?.questions.length}</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / (queue?.questions.length || 1)) * 100} />
          </div>

          {/* Current Question */}
          <ReviewCard
            question={currentQuestion}
            onGrade={handleGrade}
            isLoading={grading}
          />
        </>
      )}

      {sessionStarted && !currentQuestion && questionsCompleted > 0 && (
        <SessionComplete
          questionsCompleted={questionsCompleted}
          onRestart={handleRestartSession}
          onDashboard={handleGoToDashboard}
        />
      )}

      {!hasQuestions && (
        <Card className="text-center p-8">
          <CardContent>
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('allCaughtUp')}</h2>
            <p className="text-muted-foreground mb-4">{t('noQuestionsReady')}</p>
            <Button onClick={fetchReviewQueue}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('checkAgain')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}