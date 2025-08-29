'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Progress } from '@/src/components/ui/progress';

export default function TestPronunciationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [scores, setScores] = useState<{
    accuracy: number;
    fluency: number;
    pronunciation: number;
    wpm: number;
  } | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<Array<{
    id: number;
    score: number;
    date: string;
  }>>([]);

  const mediaRecorderRef = useState<MediaRecorder | null>(null);
  const streamRef = useState<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      streamRef[1](stream);
      mediaRecorderRef[1](mediaRecorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef[0]) {
      mediaRecorderRef[0].stop();
      setIsRecording(false);
    }
  };

  const submitRecording = async () => {
    if (!audioBlob) return;

    // Simulate API call to pronunciation service
    setTimeout(() => {
      const newScores = {
        accuracy: Math.floor(Math.random() * 40) + 60, // 60-100
        fluency: Math.floor(Math.random() * 30) + 70,  // 70-100
        pronunciation: Math.floor(Math.random() * 35) + 65, // 65-100
        wpm: Math.floor(Math.random() * 20) + 80, // 80-100
      };

      setScores(newScores);

      // Add to history
      const newAttempt = {
        id: Date.now(),
        score: newScores.pronunciation,
        date: new Date().toLocaleDateString(),
      };

      setAttemptHistory(prev => [newAttempt, ...prev.slice(0, 4)]);
    }, 1000);
  };

  const reset = () => {
    setAudioBlob(null);
    setScores(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Pronunciation Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle>Record Your Speech</CardTitle>
              <CardDescription>
                Read the text aloud and record your pronunciation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium mb-2">Practice Text:</p>
                <p className="text-gray-700">
                  "Hello! My name is Emma. I am eight years old and I love learning English."
                </p>
              </div>

              {!audioBlob ? (
                <div className="text-center">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                      🎤 Start Recording
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-red-500 font-medium">🔴 Recording...</div>
                      <Button onClick={stopRecording} variant="outline">
                        ⏹️ Stop Recording
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-600 font-medium">
                    ✅ Recording completed! ({Math.round(audioBlob.size / 1024)} KB)
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={submitRecording} className="flex-1">
                      📊 Get Score
                    </Button>
                    <Button onClick={reset} variant="outline">
                      🔄 Record Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scores Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Pronunciation Score</CardTitle>
              <CardDescription>
                {scores ? 'Your latest attempt results' : 'Record your speech to get a score'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scores ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{scores.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                      <Progress value={scores.accuracy} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{scores.fluency}%</div>
                      <div className="text-sm text-gray-600">Fluency</div>
                      <Progress value={scores.fluency} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{scores.pronunciation}%</div>
                      <div className="text-sm text-gray-600">Pronunciation</div>
                      <Progress value={scores.pronunciation} className="mt-2" />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{scores.wpm}</div>
                      <div className="text-sm text-gray-600">Words/Min</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Overall Score</h4>
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round((scores.accuracy + scores.fluency + scores.pronunciation) / 3)}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Record your speech to see your pronunciation scores</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Section */}
        {attemptHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Attempts</CardTitle>
              <CardDescription>Your last 5 pronunciation attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attemptHistory.map((attempt) => (
                  <div key={attempt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>{attempt.date}</span>
                    <span className="font-medium">{attempt.score}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
