'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, RotateCcw, Upload } from 'lucide-react';
import { AudioRecorder, generateAudioPath, pronunciationApi } from '@/lib/pronunciation-api';

interface RecorderProps {
  questionId: string;
  lessonId: string;
  activityId: string;
  childId?: string;
  expectedText?: string;
  onRecordingComplete: (attemptData: any) => void;
  disabled?: boolean;
}

export default function Recorder({
  questionId,
  lessonId,
  activityId,
  childId,
  expectedText,
  onRecordingComplete,
  disabled
}: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.startRecording();
      
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current) return;

    try {
      const audioBlob = await recorderRef.current.stopRecording();
      setRecordedBlob(audioBlob);
      setIsRecording(false);
      setHasRecording(true);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Create audio URL for playback
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(audioBlob);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  };

  const playRecording = () => {
    if (!audioRef.current || !hasRecording) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setError(null);
    
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const submitRecording = async () => {
    if (!recordedBlob || !recorderRef.current) return;

    setIsUploading(true);
    setError(null);

    try {
      // Generate unique path for this recording
      const userId = 'current-user'; // This should come from auth context
      const audioPath = generateAudioPath(userId, childId, questionId);
      
      // Upload audio to Supabase storage
      const uploadedPath = await recorderRef.current.uploadAudio(recordedBlob, audioPath);
      
      // Submit to pronunciation API
      const result = await pronunciationApi.createAttempt({
        lessonId,
        activityId,
        questionId,
        audioPath: uploadedPath,
      });

      onRecordingComplete(result);
      resetRecording();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit recording');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingProgress = (): number => {
    const maxTime = 30; // 30 seconds max
    return Math.min((recordingTime / maxTime) * 100, 100);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Expected Text */}
          {expectedText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Practice saying:</h4>
              <p className="text-lg text-blue-800 font-medium">{expectedText}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            {/* Recording Button */}
            <div className="relative">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={disabled || isUploading}
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={`w-20 h-20 rounded-full text-white ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              {isRecording && (
                <div className="absolute -inset-2 border-4 border-red-500 rounded-full animate-ping opacity-75"></div>
              )}
            </div>

            {/* Recording Status */}
            <div className="text-center">
              {isRecording ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-red-600">Recording...</p>
                  <p className="text-2xl font-mono text-gray-900">{formatTime(recordingTime)}</p>
                  <Progress value={getRecordingProgress()} className="w-48 mx-auto" />
                  {recordingTime >= 25 && (
                    <p className="text-sm text-orange-600">Recording will stop at 30 seconds</p>
                  )}
                </div>
              ) : hasRecording ? (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-green-600">Recording Ready</p>
                  <p className="text-xl font-mono text-gray-900">{formatTime(recordingTime)}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-600">Tap to Start Recording</p>
                  <p className="text-sm text-gray-500">Hold the microphone button and speak clearly</p>
                </div>
              )}
            </div>

            {/* Playback and Action Controls */}
            {hasRecording && (
              <div className="flex space-x-3">
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>

                <Button
                  onClick={resetRecording}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Record Again
                </Button>

                <Button
                  onClick={submitRecording}
                  size="sm"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Get Score
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Hidden audio element for playback */}
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />

          {/* Recording Tips */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Use a quiet environment for best results</li>
              <li>• Hold your device about 6 inches from your mouth</li>
              <li>• Practice the text before recording</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
