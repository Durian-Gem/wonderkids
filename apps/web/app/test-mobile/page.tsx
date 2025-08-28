'use client';

import {
  BookOpen,
  Flame,
  Home,
  LogOut,
  Menu,
  Settings,
  Star,
  TrendingUp,
  Trophy,
  User,
  X} from 'lucide-react';
import { useEffect,useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis} from 'recharts';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Mock data for mobile testing
const mockMobileData = {
  child: { name: 'Emma', age: 8, avatar: '/images/avatars/child1.png' },
  progress: {
    weeklyMinutes: 45,
    lessonsCompleted: 12,
    currentStreak: 5,
    totalXP: 850
  },
  chartData: [
    { day: 'Mon', minutes: 15 },
    { day: 'Tue', minutes: 20 },
    { day: 'Wed', minutes: 10 },
    { day: 'Thu', minutes: 25 },
    { day: 'Fri', minutes: 18 },
    { day: 'Sat', minutes: 30 },
    { day: 'Sun', minutes: 22 }
  ],
  recentLessons: [
    { title: 'Colors', completed: true, score: 95 },
    { title: 'Numbers', completed: true, score: 88 },
    { title: 'Animals', completed: false, score: null }
  ]
};

interface MobileStatsProps {
  data: typeof mockMobileData;
}

function MobileStats({ data }: MobileStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-lg font-bold">{data.progress.weeklyMinutes}min</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-lg font-bold">{data.progress.currentStreak} days</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">Lessons</p>
              <p className="text-lg font-bold">{data.progress.lessonsCompleted}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs text-muted-foreground">XP</p>
              <p className="text-lg font-bold">{data.progress.totalXP}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface MobileChartProps {
  data: typeof mockMobileData.chartData;
}

function MobileChart({ data }: MobileChartProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Weekly Progress</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorMinutes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

interface MobileLessonsProps {
  lessons: typeof mockMobileData.recentLessons;
}

function MobileLessons({ lessons }: MobileLessonsProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Recent Lessons</h3>
      <div className="space-y-3">
        {lessons.map((lesson, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{lesson.title}</span>
            </div>
            {lesson.completed ? (
              <Badge variant="secondary" className="text-xs">
                {lesson.score}%
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                In Progress
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

function MobileNavigation({ isOpen, onToggle }: MobileNavigationProps) {
  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>WK</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">WonderKids</p>
            <p className="text-xs text-muted-foreground">Emma's Dashboard</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={onToggle}>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <nav className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Lessons
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default function MobileTestPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [viewport, setViewport] = useState('mobile');

  useEffect(() => {
    const updateViewport = () => {
      if (window.innerWidth >= 1024) setViewport('desktop');
      else if (window.innerWidth >= 768) setViewport('tablet');
      else setViewport('mobile');
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation isOpen={navOpen} onToggle={() => setNavOpen(!navOpen)} />

      <main className="pb-20">
        {/* Viewport Info */}
        <div className="p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Viewport</p>
              <p className="text-xs text-muted-foreground">
                {viewport.charAt(0).toUpperCase() + viewport.slice(1)} ({window.innerWidth}px)
              </p>
            </div>
            <Badge variant={viewport === 'mobile' ? 'default' : 'secondary'}>
              {viewport}
            </Badge>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 space-y-6">
          <MobileStats data={mockMobileData} />
          <MobileChart data={mockMobileData.chartData} />
          <MobileLessons lessons={mockMobileData.recentLessons} />

          {/* Mobile-Specific Tests */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3">Mobile Interaction Tests</h3>
            <div className="space-y-3">
              <Button className="w-full" size="sm">
                Touch Test Button
              </Button>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Touch Target Test</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="outline" size="sm">Button</Button>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Progress Test</p>
                <Progress value={65} className="h-2" />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Text Readability Test</p>
                <p className="text-xs">This is small text that should be readable on mobile devices.</p>
                <p className="text-sm">This is normal text size.</p>
                <p className="text-base">This is larger text for emphasis.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          <Button variant="ghost" size="sm" className="flex flex-col items-center py-2">
            <Home className="h-4 w-4 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center py-2">
            <BookOpen className="h-4 w-4 mb-1" />
            <span className="text-xs">Learn</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center py-2">
            <Trophy className="h-4 w-4 mb-1" />
            <span className="text-xs">Rewards</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center py-2">
            <User className="h-4 w-4 mb-1" />
            <span className="text-xs">Profile</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center py-2">
            <Settings className="h-4 w-4 mb-1" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
