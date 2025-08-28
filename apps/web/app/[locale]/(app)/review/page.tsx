import { Card } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { RefreshCw, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Review Center
            </h1>
            <p className="text-gray-600">
              Practice what you've learned with spaced repetition
            </p>
          </div>

          {/* Coming Soon Card */}
          <Card className="p-8 text-center mb-8">
            <div className="flex justify-center mb-4">
              <RefreshCw className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Review System Coming Soon!
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We're building an intelligent review system that will help you reinforce 
              what you've learned using spaced repetition. This will help you remember 
              vocabulary and concepts for the long term.
            </p>
            <div className="flex justify-center">
              <Link href="/dashboard">
                <Button>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </Card>

          {/* Features Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Smart Reviews
                </h3>
              </div>
              <p className="text-gray-600">
                Review questions will appear based on your performance and memory retention patterns.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Spaced Repetition
                </h3>
              </div>
              <p className="text-gray-600">
                Content you struggle with will appear more frequently, while mastered content appears less often.
              </p>
            </Card>
          </div>

          {/* Placeholder for future review queue */}
          <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">
              Your personalized review queue will appear here once the feature is ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
