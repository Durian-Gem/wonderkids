'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Volume2,
  RotateCcw,
  GripVertical,
  ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OrderQuestion {
  id: string;
  title: string;
  instructions: string;
  items: Array<{
    id: string;
    text: string;
    correctPosition: number; // 0-based index for correct position
  }>;
  audioUrl?: string;
  hint?: string;
}

interface OrderListCardProps {
  question: OrderQuestion;
  onAnswer: (order: string[]) => void;
  isSubmitted?: boolean;
  userOrder?: string[];
  correctOrder?: string[];
  showFeedback?: boolean;
  className?: string;
}

interface SortableItemProps {
  id: string;
  text: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
  correctPosition?: number;
  currentPosition?: number;
  disabled?: boolean;
}

function SortableItem({ 
  id, 
  text, 
  isSubmitted, 
  isCorrect, 
  correctPosition,
  currentPosition,
  disabled 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: disabled || isSubmitted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg transition-all",
        isDragging && "opacity-50 shadow-lg",
        !isSubmitted && !disabled && "hover:border-gray-400 hover:shadow-sm cursor-move",
        isSubmitted && isCorrect && "border-green-500 bg-green-50",
        isSubmitted && !isCorrect && "border-red-500 bg-red-50",
        disabled && "cursor-not-allowed opacity-60"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        {!isSubmitted && !disabled && (
          <GripVertical className="h-5 w-5 text-gray-400" />
        )}
        {isSubmitted && (
          <div className="w-5 h-5 flex items-center justify-center">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium text-gray-900">{text}</div>
        {isSubmitted && !isCorrect && correctPosition !== undefined && (
          <div className="text-xs text-muted-foreground mt-1">
            Should be position {correctPosition + 1}
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {currentPosition !== undefined && `#${currentPosition + 1}`}
      </div>
    </div>
  );
}

export default function OrderListCard({
  question,
  onAnswer,
  isSubmitted = false,
  userOrder = [],
  correctOrder = [],
  showFeedback = false,
  className
}: OrderListCardProps) {
  // Initialize items with randomized order if no userOrder provided
  const [items, setItems] = useState(() => {
    if (userOrder.length > 0) {
      return userOrder;
    }
    
    // Create shuffled version of the items
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    return shuffled.map(item => item.id);
  });

  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Notify parent of the new order
        onAnswer(newOrder);
        
        return newOrder;
      });
    }
  }

  const handleSubmit = () => {
    onAnswer(items);
  };

  const handleReset = () => {
    // Re-shuffle the items
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    const newOrder = shuffled.map(item => item.id);
    setItems(newOrder);
    setShowHint(false);
    onAnswer(newOrder);
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

  const isItemCorrect = (itemId: string, currentIndex: number): boolean => {
    const item = question.items.find(i => i.id === itemId);
    return item ? item.correctPosition === currentIndex : false;
  };

  const getCorrectPosition = (itemId: string): number => {
    const item = question.items.find(i => i.id === itemId);
    return item?.correctPosition ?? -1;
  };

  const getItemText = (itemId: string): string => {
    const item = question.items.find(i => i.id === itemId);
    return item?.text ?? '';
  };

  const allItemsInCorrectOrder = items.every((itemId, index) => 
    isItemCorrect(itemId, index)
  );

  const scorePercentage = isSubmitted 
    ? Math.round((items.filter((itemId, index) => isItemCorrect(itemId, index)).length / items.length) * 100)
    : 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{question.title}</CardTitle>
          <Badge variant="outline">Drag to reorder</Badge>
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

        {/* Drag and Drop Area */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
            {isSubmitted ? 'Final order:' : 'Drag items to reorder them:'}
          </div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((itemId, index) => (
                  <SortableItem
                    key={itemId}
                    id={itemId}
                    text={getItemText(itemId)}
                    isSubmitted={isSubmitted}
                    isCorrect={isSubmitted ? isItemCorrect(itemId, index) : undefined}
                    correctPosition={isSubmitted ? getCorrectPosition(itemId) : undefined}
                    currentPosition={index}
                    disabled={isSubmitted}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Hint */}
        {question.hint && !isSubmitted && (
          <div className="space-y-2">
            {showHint ? (
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                <strong>Hint:</strong> {question.hint}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                  className="text-blue-600"
                >
                  💡 Show Hint
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!isSubmitted && (
          <div className="flex gap-2 justify-center">
            <Button onClick={handleSubmit} className="px-8">
              Submit Order
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Shuffle
            </Button>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && isSubmitted && (
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="font-medium mb-2">
              {allItemsInCorrectOrder ? (
                <span className="text-green-600">Perfect! All items are in the correct order!</span>
              ) : (
                <span className="text-orange-600">Good effort! You got {scorePercentage}% correct.</span>
              )}
            </div>
            {!allItemsInCorrectOrder && (
              <p className="text-sm text-muted-foreground">
                Look at the items marked with ❌ to see the correct positions.
              </p>
            )}
          </div>
        )}

        {/* Score Display */}
        {isSubmitted && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border">
              <span className="text-sm font-medium">Score:</span>
              <span className={cn(
                "font-bold",
                allItemsInCorrectOrder ? "text-green-600" : "text-orange-600"
              )}>
                {scorePercentage}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
