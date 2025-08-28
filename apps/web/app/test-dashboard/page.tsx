'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  Clock,
  BookOpen,
  Flame,
  Trophy,
  TrendingUp,
  Star,
  Users,
  BarChart3,
  Calendar
} from 'lucide-react';

// Mock children data
const mockChildren = [
  {
    id: '1',
    name: 'Emma',
    avatar: '/images/avatars/child1.png',
    age: 8,
  },
  {
    id: '2',
    name: 'Lucas',
    avatar: '/images/avatars/child2.png',
    age: 6,
  },
];

interface ChildSelectorProps {
  children: typeof mockChildren;
  selectedChildId: string | null;
  onChildSelect: (childId: string | null) => void;
}

function ChildSelector({ children, selectedChildId, onChildSelect }: ChildSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Select Child
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedChildId === null ? "default" : "outline"}
            onClick={() => onChildSelect(null)}
            className="h-auto p-3"
          >
            <div className="text-center">
              <div className="text-sm font-medium">All Children</div>
            </div>
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={selectedChildId === child.id ? "default" : "outline"}
              onClick={() => onChildSelect(child.id)}
              className="h-auto p-3"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={child.avatar} alt={child.name} />
                  <AvatarFallback>{child.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">{child.name}</div>
                  <div className="text-xs text-muted-foreground">Age {child.age}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
}

function MetricCard({ title, value, icon, description, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs text-green-500 ml-1">
              +{trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WeeklyChartProps {
  data: Array<{ week: string; minutes: number }>;
}

function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [`${value} minutes`, 'Learning Time']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestDashboard() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for testing
  const mockData = {
    minutesThisWeek: 125.5,
    lessonsCompleted: 12,
    streakDays: 7,
    badges: [
      {
        code: 'FIRST_LESSON',
        title: 'First Steps',
        description: 'Completed your first lesson!',
        icon: '🌟',
        earnedAt: new Date().toISOString(),
      },
      {
        code: 'SEVEN_DAY_STREAK',
        title: 'Week Warrior',
        description: 'Learned for 7 days in a row!',
        icon: '🔥',
        earnedAt: new Date().toISOString(),
      },
    ],
    totalXp: 1250,
    weeklyMinutes: [
      { week: '2024-01-01', minutes: 45.5 },
      { week: '2024-01-08', minutes: 62.0 },
      { week: '2024-01-15', minutes: 78.3 },
      { week: '2024-01-22', minutes: 125.5 },
    ],
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guardian Dashboard</h1>
          <p className="text-muted-foreground">Track your children's learning progress and achievements</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          This Week
        </Badge>
      </div>

      {/* Child Selector */}
      <ChildSelector
        children={mockChildren}
        selectedChildId={selectedChildId}
        onChildSelect={setSelectedChildId}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Minutes This Week"
          value={`${mockData.minutesThisWeek} min`}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          description="Learning time"
          trend={{ value: 15, label: 'from last week' }}
        />
        <MetricCard
          title="Lessons Completed"
          value={mockData.lessonsCompleted}
          icon={<BookOpen className="h-4 w-4 text-green-500" />}
          description="Total lessons"
        />
        <MetricCard
          title="Current Streak"
          value={`${mockData.streakDays} days`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          description="Consecutive days"
        />
        <MetricCard
          title="Total XP"
          value={mockData.totalXp}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          description="Experience points"
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <WeeklyChart data={mockData.weeklyMinutes} />
        </TabsContent>

        <TabsContent value="mastery" className="space-y-6">
          <div className="text-center py-8">Mastery chart would be displayed here</div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.badges.map((badge) => (
              <div key={badge.code} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-2xl">{badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{badge.title}</div>
                  <div className="text-sm text-muted-foreground">{badge.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
