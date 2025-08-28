'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  GripVertical,
  ArrowUpDown
} from 'lucide-react';

// Mock order/sort question data
const mockOrderData = {
  id: '1',
  instruction: 'Put these events in the correct chronological order:',
  items: [
    { id: '1', text: 'World War II ends', correctOrder: 4 },
    { id: '2', text: 'The Internet is invented', correctOrder: 3 },
    { id: '3', text: 'Neil Armstrong walks on the Moon', correctOrder: 2 },
    { id: '4', text: 'The first iPhone is released', correctOrder: 1 }
  ],
  difficulty: 'Medium'
};

interface DraggableItemProps {
  item: typeof mockOrderData.items[0];
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  isDragging: boolean;
  isCorrect?: boolean;
  showResult: boolean;
}

function DraggableItem({ item, index, onMove, isDragging, isCorrect, showResult }: DraggableItemProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (fromIndex !== index) {
      onMove(fromIndex, index);
    }
  };

  return (
    <div
      draggable={!showResult}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        flex items-center gap-3 p-4 border rounded-lg cursor-move transition-all
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${showResult
          ? isCorrect
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
          : 'border-gray-200 hover:border-gray-300'
        }
        ${!showResult ? 'hover:shadow-md' : ''}
      `}
    >
      {!showResult && (
        <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
      )}

      <div className="flex items-center gap-3 flex-1">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${showResult
            ? isCorrect
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
          }
        `}>
          {showResult ? (isCorrect ? '✓' : '✗') : index + 1}
        </div>

        <span className="flex-1">{item.text}</span>

        {showResult && isCorrect && (
          <CheckCircle className="h-5 w-5 text-green-600" />
        )}
        {showResult && !isCorrect && (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
      </div>
    </div>
  );
}

interface OrderQuestionProps {
  question: typeof mockOrderData;
  items: typeof mockOrderData.items;
  onReorder: (items: typeof mockOrderData.items) => void;
  onSubmit: () => void;
  showResult: boolean;
  isCorrect: boolean;
}

function OrderQuestion({ question, items, onReorder, onSubmit, showResult, isCorrect }: OrderQuestionProps) {
  const handleMove = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onReorder(newItems);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order the Items</span>
          <Badge variant={question.difficulty === 'Easy' ? 'default' : question.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
            {question.difficulty}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-medium">{question.instruction}</p>

        <div className="space-y-3">
          {items.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              index={index}
              onMove={handleMove}
              isDragging={false}
              isCorrect={showResult ? item.correctOrder === index + 1 : undefined}
              showResult={showResult}
            />
          ))}
        </div>

        {!showResult && (
          <div className="flex gap-3">
            <Button onClick={onSubmit} className="flex-1">
              Submit Order
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // Shuffle the items randomly
                const shuffled = [...items].sort(() => Math.random() - 0.5);
                onReorder(shuffled);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Shuffle
            </Button>
          </div>
        )}

        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? 'Perfect Order! ✓' : 'Not quite right ✗'}
            </div>
            <div className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect
                ? 'You arranged all items in the correct chronological order!'
                : 'Some items are in the wrong order. The correct chronological order is shown above.'
              }
            </div>
          </div>
        )}

        {showResult && (
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function TestOrderActivity() {
  const [items, setItems] = useState(() =>
    // Start with shuffled items
    [...mockOrderData.items].sort(() => Math.random() - 0.5)
  );
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    const correct = items.every((item, index) => item.correctOrder === index + 1);
    setIsCorrect(correct);
    setShowResult(true);
    setAttempts(attempts + 1);
  };

  const handleReorder = (newItems: typeof mockOrderData.items) => {
    setItems(newItems);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order/Sort Activity</h1>
          <p className="text-muted-foreground">Arrange items in the correct order using drag and drop</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            Attempts: {attempts}
          </Badge>
          {showResult && (
            <Badge variant={isCorrect ? 'default' : 'destructive'}>
              {isCorrect ? 'Correct Order' : 'Incorrect Order'}
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
            <li>Read the instruction carefully to understand what order is needed</li>
            <li>Drag items using the grip handle to rearrange them</li>
            <li>Drop items in the correct positions</li>
            <li>Click "Submit Order" when you think the order is correct</li>
            <li>Use "Shuffle" to randomize the order if you get stuck</li>
            <li>Items will be highlighted in green (correct) or red (incorrect)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Order Question */}
      <OrderQuestion
        question={mockOrderData}
        items={items}
        onReorder={handleReorder}
        onSubmit={handleSubmit}
        showResult={showResult}
        isCorrect={isCorrect}
      />

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This activity tests the drag-and-drop ordering functionality.
              The correct chronological order for the test items is:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {mockOrderData.items
                .sort((a, b) => a.correctOrder - b.correctOrder)
                .map((item, index) => (
                  <li key={item.id}>{item.text}</li>
                ))}
            </ol>
            <div className="pt-3 border-t">
              <p className="text-sm font-medium">Current Order:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                {items.map((item, index) => (
                  <li key={item.id}>{item.text}</li>
                ))}
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
