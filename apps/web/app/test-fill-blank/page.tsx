'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  Volume2,
  Lightbulb,
  RotateCcw
} from 'lucide-react';

// Mock fill-blank question data
const mockFillBlankData = {
  id: '1',
  sentence: 'The capital of France is ___.',
  correctAnswer: 'Paris',
  hint: 'This famous city is known as the City of Light.',
  audioUrl: '/audio/paris-question.mp3', // Mock audio URL
  difficulty: 'Easy'
};

interface FillBlankQuestionProps {
  question: typeof mockFillBlankData;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  showResult: boolean;
  isCorrect: boolean | null;
}

function FillBlankQuestion({
  question,
  onAnswer,
  userAnswer,
  setUserAnswer,
  showResult,
  isCorrect
}: FillBlankQuestionProps) {
  const handleSubmit = () => {
    if (userAnswer.trim()) {
      // Simple typo tolerance: check if answer contains the correct word
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrectAnswer = question.correctAnswer.toLowerCase();

      // Allow minor typos (missing 1 character, extra 1 character, or 1 wrong character)
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer ||
                       normalizedUserAnswer.includes(normalizedCorrectAnswer) ||
                       levenshteinDistance(normalizedUserAnswer, normalizedCorrectAnswer) <= 1;

      onAnswer(userAnswer, isCorrect);
    }
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmit();
    }
  };

  const parts = question.sentence.split('___');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fill in the Blank</span>
          <Badge variant={question.difficulty === 'Easy' ? 'default' : question.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
            {question.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentence with input field */}
        <div className="text-lg leading-relaxed">
          <span>{parts[0]}</span>
          <div className="inline-flex items-center gap-2 mx-2">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              className={`w-32 text-center font-medium ${
                showResult
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : ''
              }`}
              disabled={showResult}
            />
            {showResult && isCorrect && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {showResult && !isCorrect && (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <span>{parts[1]}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!showResult ? (
            <>
              <Button onClick={handleSubmit} disabled={!userAnswer.trim()}>
                Submit Answer
              </Button>
              <Button variant="outline" onClick={() => setUserAnswer('')}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline">
                <Volume2 className="h-4 w-4 mr-2" />
                Play Audio
              </Button>
              <Button variant="outline">
                <Lightbulb className="h-4 w-4 mr-2" />
                Hint
              </Button>
            </>
          ) : (
            <Button onClick={() => {
              setUserAnswer('');
              // Reset for next question
            }}>
              Next Question
            </Button>
          )}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Correct! ✓' : 'Not quite right ✗'}
            </div>
            <div className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect
                ? 'Great job! You got it right.'
                : `The correct answer is: ${question.correctAnswer}`
              }
            </div>
          </div>
        )}

        {/* Hint section */}
        {showResult && !isCorrect && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <Lightbulb className="h-4 w-4" />
              Hint
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {question.hint}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestFillBlank() {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleAnswer = (answer: string, correct: boolean) => {
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(attempts + 1);
  };

  const handleReset = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);
  };

  const handleNext = () => {
    handleReset();
    // In a real app, this would load the next question
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fill-in-the-Blank Activity</h1>
          <p className="text-muted-foreground">Complete the sentence by filling in the missing word</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Attempts: {attempts}
          </Badge>
          {showResult && (
            <Badge variant={isCorrect ? 'default' : 'destructive'}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Read the sentence carefully and fill in the missing word</li>
            <li>Type your answer in the blank field</li>
            <li>The system allows for minor spelling mistakes (typo tolerance)</li>
            <li>Click "Submit Answer" or press Enter to check your answer</li>
            <li>Use the hint if you need help</li>
            <li>Listen to the audio for pronunciation practice</li>
          </ul>
        </CardContent>
      </Card>

      {/* Fill Blank Question */}
      <FillBlankQuestion
        question={mockFillBlankData}
        onAnswer={handleAnswer}
        userAnswer={userAnswer}
        setUserAnswer={setUserAnswer}
        showResult={showResult}
        isCorrect={isCorrect}
      />

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Different Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Try these test cases to see the typo tolerance in action:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setUserAnswer('Paris')}
                disabled={showResult}
              >
                Paris (Correct)
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserAnswer('paris')}
                disabled={showResult}
              >
                paris (Lowercase)
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserAnswer('Prais')}
                disabled={showResult}
              >
                Prais (Typo)
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserAnswer('Paris is great')}
                disabled={showResult}
              >
                Paris is great (Extra words)
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserAnswer('London')}
                disabled={showResult}
              >
                London (Wrong)
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
