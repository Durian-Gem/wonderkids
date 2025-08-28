'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Volume2,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FillBlankQuestion {
  id: string;
  title: string;
  instructions: string;
  sentence: string;
  blanks: Array<{
    id: string;
    position: number; // Position in sentence where blank should be
    correctAnswers: string[]; // Multiple acceptable answers
    placeholder?: string;
  }>;
  audioUrl?: string;
  hints?: string[];
}

interface FillBlankCardProps {
  question: FillBlankQuestion;
  onAnswer: (answers: string[]) => void;
  isSubmitted?: boolean;
  userAnswers?: string[];
  correctAnswers?: string[];
  showFeedback?: boolean;
  className?: string;
}

interface BlankInputProps {
  blankId: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  isSubmitted: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
  disabled?: boolean;
}

function BlankInput({ 
  blankId, 
  placeholder, 
  value, 
  onChange, 
  isSubmitted, 
  isCorrect, 
  correctAnswer,
  disabled 
}: BlankInputProps) {
  return (
    <div className="inline-flex items-center relative">
      <Input
        id={blankId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "___"}
        disabled={disabled || isSubmitted}
        className={cn(
          "w-24 h-8 text-center text-base mx-1",
          isSubmitted && isCorrect && "border-green-500 bg-green-50 text-green-700",
          isSubmitted && !isCorrect && "border-red-500 bg-red-50 text-red-700"
        )}
        autoComplete="off"
      />
      {isSubmitted && (
        <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
          {isCorrect ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      )}
      {isSubmitted && !isCorrect && correctAnswer && (
        <div className="absolute top-full left-0 mt-1 text-xs text-green-600 font-medium whitespace-nowrap">
          {correctAnswer}
        </div>
      )}
    </div>
  );
}

function processSentenceWithBlanks(sentence: string, blanks: FillBlankQuestion['blanks']) {
  // Sort blanks by position to process them in order
  const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);
  
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: string }> = [];
  let lastPosition = 0;
  
  sortedBlanks.forEach((blank) => {
    // Add text before the blank
    if (blank.position > lastPosition) {
      parts.push({
        type: 'text',
        content: sentence.slice(lastPosition, blank.position)
      });
    }
    
    // Add the blank
    parts.push({
      type: 'blank',
      content: '',
      blankId: blank.id
    });
    
    lastPosition = blank.position;
  });
  
  // Add remaining text after the last blank
  if (lastPosition < sentence.length) {
    parts.push({
      type: 'text',
      content: sentence.slice(lastPosition)
    });
  }
  
  return parts;
}

export default function FillBlankCard({
  question,
  onAnswer,
  isSubmitted = false,
  userAnswers = [],
  correctAnswers = [],
  showFeedback = false,
  className
}: FillBlankCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Initialize answers from userAnswers if provided
  useState(() => {
    if (userAnswers.length > 0) {
      const initialAnswers: Record<string, string> = {};
      question.blanks.forEach((blank, index) => {
        initialAnswers[blank.id] = userAnswers[index] || '';
      });
      setAnswers(initialAnswers);
    }
  });

  const handleAnswerChange = (blankId: string, value: string) => {
    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
    
    // Convert to array format for parent component
    const answersArray = question.blanks.map(blank => newAnswers[blank.id] || '');
    onAnswer(answersArray);
  };

  const handleSubmit = () => {
    const answersArray = question.blanks.map(blank => answers[blank.id] || '');
    onAnswer(answersArray);
  };

  const handleReset = () => {
    setAnswers({});
    setShowHint({});
    onAnswer([]);
  };

  const handleShowHint = (blankId: string) => {
    setShowHint(prev => ({ ...prev, [blankId]: true }));
  };

  const playAudio = async () => {
    if (!question.audioUrl || audioPlaying) return;
    
    setAudioPlaying(true);
    try {
      const audio = new Audio(question.audioUrl);
      audio.onended = () => setAudioPlaying(false);
      audio.onerror = () => setAudioPlaying(false);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioPlaying(false);
    }
  };

  const isBlankCorrect = (blankId: string): boolean => {
    const blankIndex = question.blanks.findIndex(blank => blank.id === blankId);
    const userAnswer = answers[blankId]?.toLowerCase().trim();
    const blank = question.blanks.find(b => b.id === blankId);
    
    return blank?.correctAnswers.some(correct => 
      correct.toLowerCase().trim() === userAnswer
    ) || false;
  };

  const getCorrectAnswer = (blankId: string): string => {
    const blank = question.blanks.find(b => b.id === blankId);
    return blank?.correctAnswers[0] || '';
  };

  const allBlanksCompleted = question.blanks.every(blank =>
    (answers[blank.id] || '').trim().length > 0
  );

  const sentenceParts = processSentenceWithBlanks(question.sentence, question.blanks);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{question.title}</CardTitle>
          <Badge variant="outline">Fill in the blanks</Badge>
        </div>
        <p className="text-muted-foreground">{question.instructions}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Player */}
        {question.audioUrl && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={playAudio}
              disabled={audioPlaying}
              className="flex items-center gap-2"
            >
              <Volume2 className={cn("h-4 w-4", audioPlaying && "animate-pulse")} />
              {audioPlaying ? 'Playing...' : 'Listen'}
            </Button>
          </div>
        )}

        {/* Sentence with Blanks */}
        <div className="text-lg leading-relaxed p-6 bg-muted rounded-lg min-h-[100px] flex items-center justify-center">
          <div className="text-center">
            {sentenceParts.map((part, index) => (
              <span key={index}>
                {part.type === 'text' ? (
                  part.content
                ) : (
                  <BlankInput
                    blankId={part.blankId!}
                    placeholder={question.blanks.find(b => b.id === part.blankId)?.placeholder}
                    value={answers[part.blankId!] || ''}
                    onChange={(value) => handleAnswerChange(part.blankId!, value)}
                    isSubmitted={isSubmitted}
                    isCorrect={isSubmitted ? isBlankCorrect(part.blankId!) : undefined}
                    correctAnswer={isSubmitted && !isBlankCorrect(part.blankId!) ? getCorrectAnswer(part.blankId!) : undefined}
                    disabled={isSubmitted}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Hints */}
        {question.hints && question.hints.length > 0 && !isSubmitted && (
          <div className="space-y-2">
            {question.blanks.map((blank, index) => (
              <div key={blank.id} className="flex items-center gap-2">
                {showHint[blank.id] ? (
                  <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                    <strong>Hint {index + 1}:</strong> {question.hints![index]}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowHint(blank.id)}
                    className="flex items-center gap-1 text-blue-600"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Hint for blank {index + 1}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {!isSubmitted && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!allBlanksCompleted}
              className="px-8"
            >
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && isSubmitted && (
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="font-medium mb-2">
              {question.blanks.every(blank => isBlankCorrect(blank.id)) ? (
                <span className="text-green-600">Excellent! All answers are correct!</span>
              ) : (
                <span className="text-orange-600">Good effort! Check the highlighted answers.</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Tip: Pay attention to spelling and try to think of similar words.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
