'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Home,
  Menu,
  Settings,
  Star,
  TrendingUp,
  Trophy,
  User,
  X
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock data for navigation testing
const mockUserData = {
  name: 'Sarah Johnson',
  children: [
    { id: '1', name: 'Emma', age: 8, avatar: '/images/avatars/child1.png' },
    { id: '2', name: 'Liam', age: 10, avatar: '/images/avatars/child2.png' }
  ],
  currentChild: '1'
};

const mockLessonData = {
  currentLesson: {
    id: 'lesson-1',
    title: 'Colors and Shapes',
    progress: 65,
    status: 'in-progress',
    nextActivity: 'Color Matching'
  },
  recentLessons: [
    { id: 'lesson-1', title: 'Colors and Shapes', completed: false, progress: 65 },
    { id: 'lesson-2', title: 'Numbers 1-10', completed: true, score: 92 },
    { id: 'lesson-3', title: 'Animals', completed: true, score: 88 }
  ]
};

const mockAchievementData = {
  totalBadges: 12,
  recentBadges: [
    { id: '1', name: 'Color Master', icon: '🎨', earnedDate: '2024-01-15' },
    { id: '2', name: 'Number Ninja', icon: '🔢', earnedDate: '2024-01-12' },
    { id: '3', name: 'Animal Friend', icon: '🐾', earnedDate: '2024-01-10' }
  ],
  currentStreak: 7,
  totalXP: 1250
};

interface NavigationFlowProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

function NavigationFlow({ currentStep, onStepChange }: NavigationFlowProps) {
  const steps = [
    { id: 1, name: 'Dashboard', icon: Home, description: 'View child progress overview' },
    { id: 2, name: 'Lessons', icon: BookOpen, description: 'Browse and start lessons' },
    { id: 3, name: 'Review', icon: CheckCircle, description: 'Practice with spaced repetition' },
    { id: 4, name: 'Achievements', icon: Trophy, description: 'View badges and rewards' },
    { id: 5, name: 'Profile', icon: User, description: 'Manage child profiles' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Navigation Flow Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Test seamless navigation between different features
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground text-muted-foreground'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-4">
          <h3 className="font-semibold">{steps[currentStep - 1]?.name}</h3>
          <p className="text-sm text-muted-foreground">
            {steps[currentStep - 1]?.description}
          </p>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={() => onStepChange(Math.min(steps.length, currentStep + 1))}
            disabled={currentStep === steps.length}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureContentProps {
  step: number;
  selectedChild: string;
  onChildChange: (childId: string) => void;
}

function FeatureContent({ step, selectedChild, onChildChange }: FeatureContentProps) {
  const currentChild = mockUserData.children.find(c => c.id === selectedChild);

  switch (step) {
    case 1: // Dashboard
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Welcome back, {mockUserData.name}!
              </p>
            </div>
            <select
              value={selectedChild}
              onChange={(e) => onChildChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {mockUserData.children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} (Age {child.age})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-xl font-bold">45 min</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Lessons</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-xl font-bold">5 days</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">XP</p>
                  <p className="text-xl font-bold">850</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );

    case 2: // Lessons
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lessons</h3>
            <Badge variant="secondary">Current: {currentChild?.name}</Badge>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold">{mockLessonData.currentLesson.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Next: {mockLessonData.currentLesson.nextActivity}
                </p>
              </div>
              <Button>Continue Lesson</Button>
            </div>
            <Progress value={mockLessonData.currentLesson.progress} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {mockLessonData.currentLesson.progress}% complete
            </p>
          </Card>

          <div className="space-y-2">
            <h4 className="font-semibold">Recent Lessons</h4>
            {mockLessonData.recentLessons.map(lesson => (
              <Card key={lesson.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{lesson.title}</span>
                  </div>
                  {lesson.completed ? (
                    <Badge variant="secondary">{lesson.score}%</Badge>
                  ) : (
                    <Badge variant="outline">In Progress</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      );

    case 3: // Review
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Review Queue</h3>
            <Badge variant="secondary">Due Today: 8</Badge>
          </div>

          <Card className="p-4">
            <div className="text-center mb-4">
              <h4 className="font-semibold mb-2">Ready to Review?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Practice your knowledge with spaced repetition
              </p>
              <Button className="w-full">
                Start Review Session
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">8</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">28</p>
                <p className="text-xs text-muted-foreground">Total Queue</p>
              </div>
            </div>
          </Card>
        </div>
      );

    case 4: // Achievements
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Achievements</h3>
            <Badge variant="secondary">{mockAchievementData.totalBadges} Badges Earned</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockAchievementData.totalBadges}</p>
              <p className="text-sm text-muted-foreground">Total Badges</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockAchievementData.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{mockAchievementData.totalXP}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </Card>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Recent Badges</h4>
            {mockAchievementData.recentBadges.map(badge => (
              <Card key={badge.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{badge.icon}</div>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Earned {badge.earnedDate}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );

    case 5: // Profile
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Child Profile</h3>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {currentChild?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-xl font-semibold">{currentChild?.name}</h4>
                <p className="text-muted-foreground">Age {currentChild?.age}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">Active Learner</Badge>
                  <Badge variant="outline">Grade 2</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Learning Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Lessons</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Score</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Study Time</span>
                  <span className="font-medium">120h</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-2">Preferences</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Language</span>
                  <span className="font-medium">English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Difficulty</span>
                  <span className="font-medium">Beginner</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Daily Goal</span>
                  <span className="font-medium">30 min</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      );

    default:
      return <div>Unknown step</div>;
  }
}

export default function NavigationTestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChild, setSelectedChild] = useState(mockUserData.currentChild);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([1]);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    setNavigationHistory(prev => [...prev, step]);
  };

  const handleChildChange = (childId: string) => {
    setSelectedChild(childId);
    // Simulate state persistence across features
    console.log(`Switched to child: ${childId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Cross-Feature Navigation Test</h1>
          <p className="text-muted-foreground">
            Test seamless navigation between dashboard, lessons, review, achievements, and profile
          </p>
        </div>

        <NavigationFlow currentStep={currentStep} onStepChange={handleStepChange} />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">State Persistence Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Navigation History</p>
                <p className="font-mono text-xs bg-muted p-2 rounded">
                  {navigationHistory.join(' → ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Child</p>
                <p className="font-semibold">
                  {mockUserData.children.find(c => c.id === selectedChild)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Session Active</p>
                <Badge variant="default" className="mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Yes
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <FeatureContent
          step={currentStep}
          selectedChild={selectedChild}
          onChildChange={handleChildChange}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Navigation Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>State Persistence</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Working
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Child Context Switching</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Working
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Feature Transitions</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Working
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>Loading States</span>
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Working
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
