import { useState, useEffect } from 'react';
import { Activity } from '@/lib/lesson-player-store';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui';

interface MCQCardProps {
  activity: Activity;
  onAnswerChange: (questionId: string, response: Record<string, any>) => void;
  responses: Record<string, any>;
}

export function MCQCard({ activity, onAnswerChange, responses }: MCQCardProps) {
  const question = activity.questions[0]; // MCQ typically has one question
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Initialize selected options from responses
  useEffect(() => {
    if (question?.id) {
      const response = responses[question.id];
      if (response?.selectedOptions) {
        setSelectedOptions(response.selectedOptions);
      }
    }
  }, [question?.id, responses]);

  if (!question || !question.options) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No question data available</p>
      </Card>
    );
  }

  const handleOptionSelect = (optionText: string) => {
    // Determine if this is single or multi-select based on correct answers
    const correctOptions = question.options?.filter(opt => opt.is_correct) || [];
    const isMultiSelect = correctOptions.length > 1;

    let newSelectedOptions: string[];

    if (isMultiSelect) {
      // Multi-select: toggle the option
      if (selectedOptions.includes(optionText)) {
        newSelectedOptions = selectedOptions.filter(opt => opt !== optionText);
      } else {
        newSelectedOptions = [...selectedOptions, optionText];
      }
    } else {
      // Single-select: replace selection
      newSelectedOptions = [optionText];
    }

    setSelectedOptions(newSelectedOptions);
    onAnswerChange(question.id, { selectedOptions: newSelectedOptions });
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

      {/* Question stem */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-medium text-gray-700">
          {question.stem?.text || 'Question'}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options
          .sort((a, b) => a.idx - b.idx)
          .map((option) => {
            const optionText = option.label?.text || `Option ${option.idx}`;
            const isSelected = selectedOptions.includes(optionText);

            return (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full p-4 text-left justify-start h-auto min-h-[3rem] text-wrap",
                  isSelected && "bg-blue-50 border-blue-300 text-blue-700"
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
                      ? "bg-blue-500 border-blue-500" 
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
      {selectedOptions.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            {selectedOptions.length === 1 
              ? `Selected: ${selectedOptions[0]}`
              : `Selected ${selectedOptions.length} options`
            }
          </p>
        </div>
      )}
    </Card>
  );
}
