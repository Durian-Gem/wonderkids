import { Clock } from 'lucide-react';
import { cn } from '@repo/ui';

interface TimerBadgeProps {
  minutes: number;
  className?: string;
}

export function TimerBadge({ minutes, className }: TimerBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium",
      className
    )}>
      <Clock className="w-4 h-4" />
      <span>{minutes} min</span>
    </div>
  );
}
