import { useState, useEffect } from 'react';
import { Activity } from '@/lib/lesson-player-store';
import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MatchPairsCardProps {
  activity: Activity;
  onAnswerChange: (questionId: string, response: Record<string, any>) => void;
  responses: Record<string, any>;
}

interface PairItem {
  id: string;
  content: string;
  type: 'left' | 'right';
  originalPair: number;
}

interface DraggableItemProps {
  item: PairItem;
  isMatched: boolean;
}

function DraggableItem({ item, isMatched }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing",
        "text-center font-medium transition-colors",
        isDragging && "opacity-50 scale-105",
        isMatched 
          ? "bg-green-100 border-green-300 text-green-800"
          : "bg-white border-gray-300 hover:border-blue-300"
      )}
    >
      {item.content}
    </div>
  );
}

export function MatchPairsCard({ activity, onAnswerChange, responses }: MatchPairsCardProps) {
  const question = activity.questions[0]; // Match pairs typically has one question
  const [matches, setMatches] = useState<Array<[string, string]>>([]);
  const [draggedItem, setDraggedItem] = useState<PairItem | null>(null);
  const [leftItems, setLeftItems] = useState<PairItem[]>([]);
  const [rightItems, setRightItems] = useState<PairItem[]>([]);

  // Initialize items and matches from question data
  useEffect(() => {
    if (!question?.stem?.pairs) return;

    const pairs: Array<[string, string]> = question.stem.pairs;
    
    // Create shuffled items
    const newLeftItems: PairItem[] = pairs.map((pair, index) => ({
      id: `left-${index}`,
      content: pair[0],
      type: 'left',
      originalPair: index
    }));

    const newRightItems: PairItem[] = pairs.map((pair, index) => ({
      id: `right-${index}`,
      content: pair[1],
      type: 'right',
      originalPair: index
    }));

    // Shuffle right items to make it challenging
    const shuffledRightItems = [...newRightItems].sort(() => Math.random() - 0.5);

    setLeftItems(newLeftItems);
    setRightItems(shuffledRightItems);

    // Initialize from existing response
    const response = responses[question.id];
    if (response?.pairs) {
      setMatches(response.pairs);
    }
  }, [question?.id, question?.stem?.pairs, responses]);

  if (!question || !question.stem?.pairs) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <p>No pairing data available</p>
      </Card>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    const item = [...leftItems, ...rightItems].find(item => item.id === draggedId);
    setDraggedItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);

    if (!over) return;

    const activeItem = [...leftItems, ...rightItems].find(item => item.id === active.id);
    const overItem = [...leftItems, ...rightItems].find(item => item.id === over.id);

    if (!activeItem || !overItem || activeItem.type === overItem.type) return;

    // Create a new match
    const leftContent = activeItem.type === 'left' ? activeItem.content : overItem.content;
    const rightContent = activeItem.type === 'right' ? activeItem.content : overItem.content;

    // Remove any existing matches involving these items
    const filteredMatches = matches.filter(
      ([left, right]) => left !== leftContent && right !== rightContent
    );

    const newMatches = [...filteredMatches, [leftContent, rightContent] as [string, string]];
    setMatches(newMatches);
    onAnswerChange(question.id, { pairs: newMatches });
  };

  const isItemMatched = (item: PairItem) => {
    return matches.some(([left, right]) => 
      (item.type === 'left' && left === item.content) ||
      (item.type === 'right' && right === item.content)
    );
  };

  const clearMatches = () => {
    setMatches([]);
    onAnswerChange(question.id, { pairs: [] });
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      {/* Activity prompt */}
      {activity.prompt?.title && (
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activity.prompt.title}
          </h2>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Drag items from the left to match them with items on the right
        </p>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Main matching area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Left column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-center text-gray-700 mb-4">
              Match these:
            </h3>
            <SortableContext items={leftItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {leftItems.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isMatched={isItemMatched(item)}
                />
              ))}
            </SortableContext>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-center text-gray-700 mb-4">
              With these:
            </h3>
            <SortableContext items={rightItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {rightItems.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  isMatched={isItemMatched(item)}
                />
              ))}
            </SortableContext>
          </div>
        </div>

        <DragOverlay>
          {draggedItem ? (
            <div className="p-3 rounded-lg border-2 border-blue-400 bg-blue-50 text-center font-medium shadow-lg">
              {draggedItem.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Current matches display */}
      {matches.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700">Current matches:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearMatches}
              className="text-red-600 hover:text-red-700"
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {matches.map(([left, right], index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-white rounded border">{left}</span>
                <span className="text-gray-400">↔</span>
                <span className="px-2 py-1 bg-white rounded border">{right}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          {matches.length} of {leftItems.length} pairs matched
        </p>
      </div>
    </Card>
  );
}
