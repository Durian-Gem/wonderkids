import { useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Trophy, Star, Zap, Target } from 'lucide-react';
import { cn } from '@repo/ui';

interface ResultDialogProps {
  isOpen: boolean;
  score: number;
  xpAwarded: number;
  streak: number;
  correctAnswers: number;
  totalQuestions: number;
  onClose: () => void;
  onContinue?: () => void;
}

export function ResultDialog({
  isOpen,
  score,
  xpAwarded,
  streak,
  correctAnswers,
  totalQuestions,
  onClose,
  onContinue
}: ResultDialogProps) {
  // Trigger confetti effect for good scores
  useEffect(() => {
    if (isOpen && score >= 70) {
      // Simple confetti effect using CSS animation
      const confettiContainer = document.createElement('div');
      confettiContainer.className = 'fixed inset-0 pointer-events-none z-50';
      confettiContainer.innerHTML = `
        <div class="absolute inset-0 animate-pulse">
          ${Array.from({ length: 20 }, (_, i) => `
            <div class="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce" 
                 style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${i * 100}ms;"></div>
          `).join('')}
        </div>
      `;
      document.body.appendChild(confettiContainer);
      
      // Remove confetti after animation
      setTimeout(() => {
        document.body.removeChild(confettiContainer);
      }, 3000);
    }
  }, [isOpen, score]);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent work! 🌟';
    if (score >= 70) return 'Great job! 🎉';
    if (score >= 50) return 'Good effort! 💪';
    return 'Keep practicing! 📚';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Trophy className="w-16 h-16 text-yellow-500" />;
    if (score >= 70) return <Star className="w-16 h-16 text-blue-500" />;
    return <Target className="w-16 h-16 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <Card className="max-w-md w-full p-6 bg-white">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getScoreIcon(score)}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Lesson Complete!
          </h2>
          <p className="text-lg font-medium text-gray-600">
            {getScoreMessage(score)}
          </p>
        </div>

        {/* Results */}
        <div className="space-y-4 mb-6">
          {/* Score */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Your Score</span>
            <span className={cn("text-xl font-bold", getScoreColor(score))}>
              {score}%
            </span>
          </div>

          {/* Correct answers */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Correct Answers</span>
            <span className="text-lg font-semibold text-gray-800">
              {correctAnswers} / {totalQuestions}
            </span>
          </div>

          {/* XP awarded */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">XP Earned</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              +{xpAwarded}
            </span>
          </div>

          {/* Streak */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">🔥</span>
              <span className="font-medium text-orange-700">Streak</span>
            </div>
            <span className="text-lg font-bold text-orange-600">
              {streak} day{streak !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          {onContinue && (
            <Button
              onClick={onContinue}
              className="flex-1"
            >
              Continue Learning
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
