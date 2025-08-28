import { cn } from '@repo/ui';

interface ProgressDotsProps {
  total: number;
  current: number;
  className?: string;
}

export function ProgressDots({ total, current, className }: ProgressDotsProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;
        const isCompleted = index < current;
        
        return (
          <div
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-colors duration-200",
              isActive && "bg-blue-500 ring-2 ring-blue-200",
              isCompleted && "bg-green-500",
              !isActive && !isCompleted && "bg-gray-300"
            )}
            aria-label={`Activity ${index + 1} of ${total}${
              isActive ? ' (current)' : isCompleted ? ' (completed)' : ''
            }`}
          />
        );
      })}
    </div>
  );
}
