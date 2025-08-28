import { useState, useEffect, useRef } from 'react';
import { Activity } from '@/lib/lesson-player-store';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui';
import { Play, Pause, Volume2 } from 'lucide-react';

interface ListenChooseCardProps {
  activity: Activity;
  onAnswerChange: (questionId: string, response: Record<string, any>) => void;
  responses: Record<string, any>;
}

export function ListenChooseCard({ activity, onAnswerChange, responses }: ListenChooseCardProps) {
  const question = activity.questions[0]; // Listen-choose typically has one question
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(false);

  // Initialize selected option from responses
  useEffect(() => {
    if (question?.id) {
      const response = responses[question.id];
      if (response?.selectedOption) {
        setSelectedOption(response.selectedOption);
      }
    }
  }, [question?.id, responses]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setCanPlay(true);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  if (!question || !question.options) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No question data available</p>
      </Card>
    );
  }

  const audioSrc = question.stem?.audio;

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
  };

  const handleOptionSelect = (optionText: string) => {
    setSelectedOption(optionText);
    onAnswerChange(question.id, { selectedOption: optionText });
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {/* Activity prompt */}
      {activity.prompt?.title && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activity.prompt.title}
          </h2>
        </div>
      )}

      {/* Audio player section */}
      <div className="mb-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <Volume2 className="w-16 h-16 text-blue-500" />
          
          {audioSrc && (
            <>
              <audio ref={audioRef} preload="auto">
                <source src={audioSrc} type="audio/mpeg" />
                <source src={audioSrc} type="audio/wav" />
                <source src={audioSrc} type="audio/ogg" />
                Your browser does not support the audio element.
              </audio>
              
              <Button
                onClick={handlePlayPause}
                disabled={!canPlay}
                size="lg"
                className="flex items-center gap-2"
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
            </>
          )}
          
          {!audioSrc && (
            <div className="text-gray-500">
              <p>Audio not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Instruction */}
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Listen to the audio and choose the correct answer
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options
          .sort((a, b) => a.idx - b.idx)
          .map((option) => {
            const optionText = option.label?.text || `Option ${option.idx}`;
            const isSelected = selectedOption === optionText;

            return (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full p-4 text-left justify-start h-auto min-h-[3rem] text-wrap",
                  isSelected && "bg-green-50 border-green-300 text-green-700"
                )}
                onClick={() => handleOptionSelect(optionText)}
                aria-pressed={isSelected}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                    isSelected 
                      ? "bg-green-500 border-green-500" 
                      : "border-gray-300"
                  )}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{optionText}</span>
                </div>
              </Button>
            );
          })}
      </div>

      {/* Selection feedback */}
      {selectedOption && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Selected: {selectedOption}</p>
        </div>
      )}
    </Card>
  );
}
