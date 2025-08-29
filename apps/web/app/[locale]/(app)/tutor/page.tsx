'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, History, BookOpen, ChevronRight } from 'lucide-react';
import TutorTopicGrid from '@/components/app/tutor/TutorTopicGrid';
import TutorChat from '@/components/app/tutor/TutorChat';
import TranscriptDialog from '@/components/app/tutor/TranscriptDialog';
import { TutorSession, tutorApi, getTutorTopicById } from '@/lib/tutor-api';

type ViewState = 'topics' | 'chat';

interface TutorSessionSummary {
  id: string;
  topic: string;
  createdAt: string;
  children?: { id: string; name: string };
}

export default function TutorPage() {
  const [currentView, setCurrentView] = useState<ViewState>('topics');
  const [activeSession, setActiveSession] = useState<TutorSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<TutorSessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Load recent sessions on component mount
  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const sessions = await tutorApi.getUserSessions();
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleSessionCreated = (sessionId: string, topic: string) => {
    // Create a basic session object and switch to chat view
    const newSession: TutorSession = {
      id: sessionId,
      userId: '',
      topic,
      provider: 'anthropic',
      systemPrompt: '',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    
    setActiveSession(newSession);
    setCurrentView('chat');
    
    // Reload recent sessions to include the new one
    loadRecentSessions();
  };

  const handleSessionUpdate = (updatedSession: TutorSession) => {
    setActiveSession(updatedSession);
  };

  const handleBackToTopics = () => {
    setCurrentView('topics');
    setActiveSession(null);
  };

  const handleContinueSession = async (sessionId: string) => {
    try {
      const session = await tutorApi.getSession(sessionId);
      setActiveSession(session);
      setCurrentView('chat');
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (currentView === 'chat' && activeSession) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[700px]">
          <TutorChat
            session={activeSession}
            onBack={handleBackToTopics}
            onSessionUpdate={handleSessionUpdate}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">AI English Tutor</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Practice English conversation with your AI tutor in a safe, educational environment. 
            Choose a topic and start chatting to improve your language skills.
          </p>
        </div>

        <Tabs defaultValue="new-session" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mx-auto">
            <TabsTrigger value="new-session" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>New Chat</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>Recent Chats</span>
            </TabsTrigger>
          </TabsList>

          {/* New Session Tab */}
          <TabsContent value="new-session">
            <TutorTopicGrid
              onSessionCreated={handleSessionCreated}
              disabled={false}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Conversations</h2>
                <p className="text-gray-600">Continue previous conversations or review transcripts</p>
              </div>

              {isLoadingSessions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your conversations...</p>
                </div>
              ) : recentSessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-600 mb-4">Start your first AI tutor conversation by selecting a topic</p>
                    <Button
                      onClick={() => {
                        // Switch to new session tab
                        const newSessionTab = document.querySelector('[value="new-session"]') as HTMLElement;
                        newSessionTab?.click();
                      }}
                    >
                      Start First Conversation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentSessions.map((session) => {
                    const topic = getTutorTopicById(session.topic);
                    
                    return (
                      <Card key={session.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            {topic && (
                              <div className={`w-10 h-10 rounded-full ${topic.color} flex items-center justify-center text-white`}>
                                {topic.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate">{topic?.title || session.topic}</CardTitle>
                              <p className="text-sm text-gray-600">{formatSessionDate(session.createdAt)}</p>
                            </div>
                          </div>
                          {session.children && (
                            <Badge variant="outline" className="w-fit">
                              {session.children.name}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleContinueSession(session.id)}
                              className="flex-1"
                              size="sm"
                            >
                              Continue Chat
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            <TranscriptDialog
                              session={{
                                ...session,
                                userId: '',
                                provider: 'anthropic',
                                systemPrompt: '',
                                messages: []
                              } as TutorSession}
                            >
                              <Button variant="outline" size="sm">
                                Transcript
                              </Button>
                            </TranscriptDialog>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
