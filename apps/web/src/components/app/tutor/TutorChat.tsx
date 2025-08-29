'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, MessageCircle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { 
  TutorMessage, 
  TutorSession, 
  tutorApi, 
  validateMessageContent, 
  formatMessageTime,
  getTutorTopicById 
} from '@/lib/tutor-api';

interface TutorChatProps {
  session: TutorSession;
  onBack: () => void;
  onSessionUpdate: (session: TutorSession) => void;
}

export default function TutorChat({ session, onBack, onSessionUpdate }: TutorChatProps) {
  const [messages, setMessages] = useState<TutorMessage[]>(session.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const topic = getTutorTopicById(session.topic);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update word count when message changes
  useEffect(() => {
    const words = newMessage.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [newMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const validation = validateMessageContent(newMessage);
    if (validation) {
      setError(validation);
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const result = await tutorApi.addMessage(session.id, {
        content: newMessage.trim(),
      });

      // Add both user and AI messages to the conversation
      const updatedMessages = [...messages, result.userMessage, result.aiMessage];
      setMessages(updatedMessages);
      
      // Update the session with new messages
      const updatedSession = {
        ...session,
        messages: updatedMessages,
      };
      onSessionUpdate(updatedSession);

      setNewMessage('');
      setWordCount(0);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageBubbleClass = (sender: TutorMessage['sender']) => {
    switch (sender) {
      case 'user':
        return 'bg-primary text-primary-foreground ml-auto max-w-[80%]';
      case 'assistant':
        return 'bg-gray-100 text-gray-900 mr-auto max-w-[80%]';
      default:
        return 'hidden'; // Hide system messages
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              {topic && (
                <div className={`w-8 h-8 rounded-full ${topic.color} flex items-center justify-center text-white text-sm`}>
                  {topic.icon}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{topic?.title || session.topic}</CardTitle>
                <p className="text-sm text-gray-600">AI English Tutor</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary">
            {messages.filter(m => m.sender !== 'system').length} messages
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation!</h3>
            <p className="text-gray-600">
              Say hello or ask a question about {topic?.title.toLowerCase() || session.topic}
            </p>
          </div>
        ) : (
          messages
            .filter(message => message.sender !== 'system')
            .map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg px-4 py-2 ${getMessageBubbleClass(message.sender)}`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <div className="border-t p-4 space-y-3">
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask something about ${topic?.title.toLowerCase() || session.topic}...`}
              className="resize-none"
              rows={2}
              maxLength={300}
              disabled={isSending}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {wordCount}/60 words
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || wordCount > 60}
            size="sm"
            className="self-end"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Keep messages under 60 words for better conversation</p>
          <p>• Focus on the topic: {topic?.title || session.topic}</p>
          <p>• Be respectful and ask questions to learn English</p>
        </div>
      </div>
    </div>
  );
}
