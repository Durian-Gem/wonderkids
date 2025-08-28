import { Activity } from '@/lib/lesson-player-store';
import { MCQCard } from './cards/MCQCard';
import { ListenChooseCard } from './cards/ListenChooseCard';
import { MatchPairsCard } from './cards/MatchPairsCard';

interface ActivityRendererProps {
  activity: Activity;
  onAnswerChange: (questionId: string, response: Record<string, any>) => void;
  responses: Record<string, any>;
}

export function ActivityRenderer({ activity, onAnswerChange, responses }: ActivityRendererProps) {
  switch (activity.kind) {
    case 'quiz_mcq':
      return (
        <MCQCard
          activity={activity}
          onAnswerChange={onAnswerChange}
          responses={responses}
        />
      );
    
    case 'listen_choose':
      return (
        <ListenChooseCard
          activity={activity}
          onAnswerChange={onAnswerChange}
          responses={responses}
        />
      );
    
    case 'match_pairs':
      return (
        <MatchPairsCard
          activity={activity}
          onAnswerChange={onAnswerChange}
          responses={responses}
        />
      );
    
    default:
      return (
        <div className="flex items-center justify-center p-8 text-gray-500">
          <p>Unknown activity type: {activity.kind}</p>
        </div>
      );
  }
}
