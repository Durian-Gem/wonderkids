'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

export default function TestTutorPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [messages, setMessages] = useState<Array<{sender: string, content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const topics = [
    'animals', 'family', 'school', 'food', 'weather', 'hobbies', 'numbers'
  ];

  const startConversation = async (topic: string) => {
    setSelectedTopic(topic);
    setMessages([{ sender: 'system', content: `Starting conversation about ${topic}...` }]);

    setIsLoading(true);
    try {
      // Simulate API call to tutor
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: 'assistant', content: `Hello! Let's talk about ${topic}. What would you like to know?` }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'system', content: 'Error starting conversation. Please try again.' }
      ]);
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', content: message }]);

    setIsLoading(true);
    try {
      // Simulate AI response
      setTimeout(() => {
        const responses = [
          `That's interesting about ${selectedTopic}! Tell me more.`,
          `Great question! In ${selectedTopic}, we often see...`,
          `I love learning about ${selectedTopic} too! Did you know...`,
          `Thanks for sharing! Here's something fun about ${selectedTopic}...`
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { sender: 'assistant', content: randomResponse }]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { sender: 'system', content: 'Error sending message. Please try again.' }
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI Tutor Test Page
        </h1>

        {!selectedTopic ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Topic</CardTitle>
              <CardDescription>
                Select a topic to start a conversation with the AI tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => startConversation(topic)}
                    variant="outline"
                    className="h-16 text-lg capitalize"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">Conversation: {selectedTopic}</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTopic('');
                    setMessages([]);
                  }}
                >
                  Choose Different Topic
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-100 ml-12'
                          : msg.sender === 'assistant'
                          ? 'bg-green-100 mr-12'
                          : 'bg-gray-100 text-center'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1 capitalize">{msg.sender}</p>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-center text-gray-500">
                      AI is thinking...
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                      sendMessage(input.value);
                      input.value = '';
                    }}
                    disabled={isLoading}
                  >
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
