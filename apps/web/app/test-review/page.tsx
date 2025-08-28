'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  BookOpen,
  Star,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

// Mock review queue data
const mockReviewData = {
  dueToday: 12,
  totalInQueue: 28,
  mastered: 45,
  queueStats: {
    box1: 8,
    box2: 6,
    box3: 5,
    box4: 4,
    box5: 5
  },
  currentQuestion: {
    id: '1',
    text: 'What is the capital of France?',
    options: ['London', 'Paris', 'Berlin', 'Madrid'],
    correctAnswer: 1,
    difficulty: 'Medium'
  }
};

interface QueueStatsProps {
  data: typeof mockReviewData;
}

function QueueStats({ data }: QueueStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Due Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{data.dueToday}</div>
          <p className="text-xs text-muted-foreground">questions ready</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            In Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{data.totalInQueue}</div>
          <p className="text-xs text-muted-foreground">total questions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-green-500" />
            Mastered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.mastered}</div>
          <p className="text-xs text-muted-foreground">completed questions</p>
        </CardContent>
      </Card>
    </div>
  );
}

interface KnowledgeDistributionProps {
  stats: typeof mockReviewData.queueStats;
}

function KnowledgeDistribution({ stats }: KnowledgeDistributionProps) {
  const levels = [
    { name: 'Learning', count: stats.box1, color: 'bg-red-500' },
    { name: 'Practicing', count: stats.box2, color: 'bg-orange-500' },
    { name: 'Improving', count: stats.box3, color: 'bg-yellow-500' },
    { name: 'Strong', count: stats.box4, color: 'bg-blue-500' },
    { name: 'Mastered', count: stats.box5, color: 'bg-green-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {levels.map((level, index) => (
            <div key={level.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${level.color}`}></div>
                <span className="text-sm font-medium">{level.name}</span>
                <Badge variant="outline">{level.count} items</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Level {index + 1}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ReviewQuestionProps {
  question: typeof mockReviewData.currentQuestion;
  onAnswer: (answerIndex: number) => void;
  showResult?: boolean;
  selectedAnswer?: number;
  isCorrect?: boolean;
}

function ReviewQuestion({ question, onAnswer, showResult, selectedAnswer, isCorrect }: ReviewQuestionProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Review Question</span>
          <Badge variant={question.difficulty === 'Easy' ? 'default' : question.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
            {question.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">{question.text}</div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <Button
              key={index}
              variant={
                showResult
                  ? index === question.correctAnswer
                    ? "default"
                    : index === selectedAnswer
                      ? "destructive"
                      : "outline"
                  : selectedAnswer === index
                    ? "default"
                    : "outline"
              }
              className="w-full justify-start text-left h-auto p-4"
              onClick={() => !showResult && onAnswer(index)}
              disabled={showResult}
            >
              <span className="mr-3 font-bold">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
              {showResult && index === question.correctAnswer && (
                <span className="ml-auto text-green-600">✓ Correct</span>
              )}
              {showResult && index === selectedAnswer && index !== question.correctAnswer && (
                <span className="ml-auto text-red-600">✗ Your answer</span>
              )}
            </Button>
          ))}
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Great job! ✓' : 'Not quite right ✗'}
            </div>
            <div className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect
                ? 'You\'re doing well! Keep up the good work.'
                : `The correct answer is: ${question.options[question.correctAnswer]}`
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GradingButtonsProps {
  onGrade: (grade: number) => void;
  disabled?: boolean;
}

function GradingButtons({ onGrade, disabled }: GradingButtonsProps) {
  const grades = [
    { value: 0, label: 'Again', description: 'I need to review this again', color: 'bg-red-500 hover:bg-red-600' },
    { value: 1, label: 'Hard', description: 'This was difficult', color: 'bg-orange-500 hover:bg-orange-600' },
    { value: 2, label: 'Good', description: 'I got this right', color: 'bg-blue-500 hover:bg-blue-600' },
    { value: 3, label: 'Easy', description: 'This was too easy', color: 'bg-green-500 hover:bg-green-600' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>How was this question for you?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {grades.map((grade) => (
              <Button
                key={grade.value}
                onClick={() => onGrade(grade.value)}
                disabled={disabled}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${grade.color} text-white`}
              >
                <span className="font-bold text-lg">{grade.label}</span>
                <span className="text-xs text-center">{grade.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TestReview() {
  const [currentStep, setCurrentStep] = useState<'stats' | 'question' | 'grading' | 'result'>('stats');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setIsCorrect(answerIndex === mockReviewData.currentQuestion.correctAnswer);
    setCurrentStep('grading');
  };

  const handleGrading = (grade: number) => {
    // Simulate grading logic
    setProgress(Math.min(progress + 10, 100));
    setCurrentStep('result');

    // Reset for next question after a delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentStep('question');
    }, 2000);
  };

  const handleStartReview = () => {
    setCurrentStep('question');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spaced Review</h1>
          <p className="text-muted-foreground">Reinforce your learning with intelligent spaced repetition</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Progress: {progress}%
          </Badge>
          <Progress value={progress} className="w-32" />
        </div>
      </div>

      {/* Review Stats */}
      {currentStep === 'stats' && (
        <>
          <QueueStats data={mockReviewData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KnowledgeDistribution stats={mockReviewData.queueStats} />

            <Card>
              <CardHeader>
                <CardTitle>Ready to Review?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You have {mockReviewData.dueToday} questions ready for review.
                  This will help reinforce your learning using spaced repetition.
                </p>
                <Button onClick={handleStartReview} size="lg" className="w-full">
                  Start Review Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Review Question */}
      {currentStep === 'question' && (
        <ReviewQuestion
          question={mockReviewData.currentQuestion}
          onAnswer={handleAnswerSelect}
          showResult={showResult}
          selectedAnswer={selectedAnswer || undefined}
          isCorrect={isCorrect}
        />
      )}

      {/* Grading Interface */}
      {currentStep === 'grading' && (
        <GradingButtons onGrade={handleGrading} />
      )}

      {/* Result Screen */}
      {currentStep === 'result' && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-muted-foreground mb-6">
              You've completed this review question. The next question will be ready soon.
            </p>
            <Button onClick={() => setCurrentStep('stats')}>
              Back to Review Queue
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
