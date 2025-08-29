'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, MessageSquare, Clock, User, Bot } from 'lucide-react';
import { TutorSession, TutorMessage, getTutorTopicById, formatMessageTime } from '@/lib/tutor-api';

interface TranscriptDialogProps {
  session: TutorSession;
  children: React.ReactNode;
}

export default function TranscriptDialog({ session, children }: TranscriptDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const topic = getTutorTopicById(session.topic);
  const conversationMessages = session.messages.filter(m => m.sender !== 'system');
  
  const handleExportTranscript = () => {
    const transcript = generateTranscriptText(session);
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-transcript-${session.topic}-${new Date(session.createdAt).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Conversation Transcript</span>
          </DialogTitle>
          <DialogDescription>
            Review the conversation between your child and the AI tutor
          </DialogDescription>
        </DialogHeader>

        {/* Session Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {topic && (
                <div className={`w-8 h-8 rounded-full ${topic.color} flex items-center justify-center text-white text-sm`}>
                  {topic.icon}
                </div>
              )}
              <div>
                <h3 className="font-medium">{topic?.title || session.topic}</h3>
                <p className="text-sm text-gray-600">{topic?.description}</p>
              </div>
            </div>
            <Badge variant="secondary">
              {conversationMessages.length} messages
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Started: {new Date(session.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Provider: {session.provider}</span>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          {conversationMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversation messages yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversationMessages.map((message, index) => (
                <div key={message.id}>
                  <div className={`p-4 ${message.sender === 'user' ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender === 'user' ? 'Student' : 'AI Tutor'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{message.content}</p>
                      </div>
                    </div>
                  </div>
                  {index < conversationMessages.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            All conversations are monitored for safety and educational value
          </div>
          <Button
            onClick={handleExportTranscript}
            variant="outline"
            size="sm"
            disabled={conversationMessages.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Transcript
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generateTranscriptText(session: TutorSession): string {
  const topic = getTutorTopicById(session.topic);
  const conversationMessages = session.messages.filter(m => m.sender !== 'system');
  
  let transcript = `WonderKids AI Tutor Conversation Transcript\n`;
  transcript += `============================================\n\n`;
  transcript += `Topic: ${topic?.title || session.topic}\n`;
  transcript += `Started: ${new Date(session.createdAt).toLocaleString()}\n`;
  transcript += `Messages: ${conversationMessages.length}\n\n`;
  
  if (conversationMessages.length === 0) {
    transcript += `No conversation messages recorded.\n`;
  } else {
    transcript += `Conversation:\n`;
    transcript += `-------------\n\n`;
    
    conversationMessages.forEach((message) => {
      const speaker = message.sender === 'user' ? 'Student' : 'AI Tutor';
      const time = formatMessageTime(message.createdAt);
      transcript += `[${time}] ${speaker}:\n${message.content}\n\n`;
    });
  }
  
  transcript += `\n---\n`;
  transcript += `Generated on: ${new Date().toLocaleString()}\n`;
  transcript += `WonderKids English Learning Platform\n`;
  
  return transcript;
}
