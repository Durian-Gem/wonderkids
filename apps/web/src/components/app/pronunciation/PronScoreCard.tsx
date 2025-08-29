'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { 
  SpeechAttempt, 
  formatScore, 
  getScoreColor, 
  getScoreLabel, 
  calculateOverallScore 
} from '@/lib/pronunciation-api';

interface PronScoreCardProps {
  attempt: SpeechAttempt;
  previousAttempts?: SpeechAttempt[];
  showDetails?: boolean;
}

export default function PronScoreCard({ 
  attempt, 
  previousAttempts = [], 
  showDetails = true 
}: PronScoreCardProps) {
  const overallScore = calculateOverallScore(
    attempt.accuracy || 0, 
    attempt.fluencyScore || 0
  );

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return 'default'; // Green
    if (score >= 0.6) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const renderSparkline = () => {
    if (previousAttempts.length < 2) return null;

    const allAttempts = [...previousAttempts, attempt];
    const scores = allAttempts.map(a => calculateOverallScore(a.accuracy || 0, a.fluencyScore || 0));
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore || 1;

    return (
      <div className="flex items-end space-x-1 h-8">
        {scores.map((score, index) => {
          const height = ((score - minScore) / range) * 100;
          const isLatest = index === scores.length - 1;
          
          return (
            <div
              key={index}
              className={`w-2 rounded-t ${
                isLatest ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pronunciation Score</CardTitle>
          <Badge variant={getScoreBadgeVariant(overallScore)}>
            {getScoreLabel(overallScore)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">
            {formatScore(overallScore)}
          </div>
          <p className="text-gray-600">Overall Score</p>
          <Progress value={overallScore * 100} className="w-full h-3" />
        </div>

        {/* Detailed Scores */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-4">
            {/* Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Accuracy</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(attempt.accuracy || 0)}`}>
                {formatScore(attempt.accuracy || 0)}
              </div>
              <Progress value={(attempt.accuracy || 0) * 100} className="h-2" />
              {attempt.wordsCorrect !== undefined && attempt.wordsTotal !== undefined && (
                <p className="text-xs text-gray-500">
                  {attempt.wordsCorrect}/{attempt.wordsTotal} words correct
                </p>
              )}
            </div>

            {/* Fluency */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Fluency</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(attempt.fluencyScore || 0)}`}>
                {formatScore(attempt.fluencyScore || 0)}
              </div>
              <Progress value={(attempt.fluencyScore || 0) * 100} className="h-2" />
              {attempt.wpm && (
                <p className="text-xs text-gray-500">
                  {Math.round(attempt.wpm)} words/min
                </p>
              )}
            </div>
          </div>
        )}

        {/* Progress Trend */}
        {previousAttempts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <span className="text-xs text-gray-500">
                {previousAttempts.length + 1} attempts
              </span>
            </div>
            
            {renderSparkline()}

            {/* Improvement Message */}
            {previousAttempts.length > 0 && (
              <div className="text-center">
                {(() => {
                  const lastScore = calculateOverallScore(
                    previousAttempts[previousAttempts.length - 1]?.accuracy || 0,
                    previousAttempts[previousAttempts.length - 1]?.fluencyScore || 0
                  );
                  const improvement = overallScore - lastScore;
                  
                  if (improvement > 0.05) {
                    return (
                      <p className="text-sm text-green-600 font-medium">
                        🎉 Great improvement! +{formatScore(improvement)}
                      </p>
                    );
                  } else if (improvement > 0) {
                    return (
                      <p className="text-sm text-blue-600">
                        👍 Keep it up! +{formatScore(improvement)}
                      </p>
                    );
                  } else if (improvement < -0.05) {
                    return (
                      <p className="text-sm text-orange-600">
                        💪 Keep practicing! You've got this!
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-sm text-gray-600">
                        📊 Consistent performance
                      </p>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 border-t pt-3">
          <Clock className="w-3 h-3" />
          <span>
            Recorded on {new Date(attempt.createdAt).toLocaleDateString()} at{' '}
            {new Date(attempt.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>

        {/* Encouragement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-center">
            {overallScore >= 0.9 ? (
              <p className="text-sm text-blue-800">
                🌟 <strong>Excellent!</strong> Your pronunciation is superb!
              </p>
            ) : overallScore >= 0.8 ? (
              <p className="text-sm text-blue-800">
                ⭐ <strong>Great job!</strong> You're speaking very clearly!
              </p>
            ) : overallScore >= 0.7 ? (
              <p className="text-sm text-blue-800">
                👏 <strong>Good work!</strong> Keep practicing to improve even more!
              </p>
            ) : overallScore >= 0.6 ? (
              <p className="text-sm text-blue-800">
                💪 <strong>Nice try!</strong> Practice makes perfect!
              </p>
            ) : (
              <p className="text-sm text-blue-800">
                🚀 <strong>Keep going!</strong> Every attempt makes you better!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
