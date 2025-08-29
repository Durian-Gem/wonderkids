'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { TUTOR_TOPICS, TutorTopicId, tutorApi } from '@/lib/tutor-api';

interface TutorTopicGridProps {
  onSessionCreated: (sessionId: string, topic: string) => void;
  selectedChildId?: string;
  disabled?: boolean;
}

export default function TutorTopicGrid({ onSessionCreated, selectedChildId, disabled }: TutorTopicGridProps) {
  const [selectedTopic, setSelectedTopic] = useState<TutorTopicId | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopicSelect = async (topicId: TutorTopicId) => {
    if (disabled || isCreating) return;

    setSelectedTopic(topicId);
    setIsCreating(true);
    setError(null);

    try {
      const session = await tutorApi.createSession({
        topic: topicId,
        childId: selectedChildId,
      });

      onSessionCreated(session.id, topicId);
    } catch (err) {
      console.error('Failed to create tutor session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setSelectedTopic(null);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose a Topic to Practice</h2>
        <p className="text-gray-600">Select a topic you'd like to chat about with your AI tutor</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TUTOR_TOPICS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          const isLoading = isCreating && isSelected;

          return (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-full ${topic.color} flex items-center justify-center text-white text-xl`}>
                    {topic.icon}
                  </div>
                  {topic.id === 'animals' && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => handleTopicSelect(topic.id)}
                  disabled={disabled || isCreating}
                  className="w-full"
                  variant={isSelected ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Chat...
                    </>
                  ) : (
                    `Chat about ${topic.title}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Safety reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-blue-400">ℹ️</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Safe Learning Environment</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your AI tutor is designed to be safe and educational. Keep conversations focused on the chosen topic. 
                Parents can view all conversation transcripts in their dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
