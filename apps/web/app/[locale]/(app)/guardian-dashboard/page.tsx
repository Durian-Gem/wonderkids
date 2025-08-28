'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
import { DashboardAPI, DashboardSummary, DashboardMastery } from '@/lib/dashboard-api';

// Mock children data (replace with actual API call)
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
  const t = useTranslations('Dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('selectChild')}
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
              <div className="text-sm font-medium">{t('allChildren')}</div>
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
                  <div className="text-xs text-muted-foreground">{t('age', { age: child.age })}</div>
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
  const t = useTranslations('Dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('weeklyProgress')}
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

interface MasteryHeatmapProps {
  data: DashboardMastery;
}

function MasteryHeatmap({ data }: MasteryHeatmapProps) {
  const t = useTranslations('Dashboard');

  // Transform lessons data for bar chart
  const chartData = data.lessons.map((lesson) => ({
    name: lesson.lessonTitle.length > 20 
      ? lesson.lessonTitle.substring(0, 20) + '...' 
      : lesson.lessonTitle,
    mastery: Math.round(lesson.mastery * 100),
    stars: lesson.stars,
  }));

  const getColorByMastery = (mastery: number) => {
    if (mastery >= 80) return '#10b981'; // green
    if (mastery >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          {t('masteryLevels')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Mastery']}
              />
              <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColorByMastery(entry.mastery)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">{t('overallStats')}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">{t('totalLessons')}</div>
              <div className="font-bold">{data.overall.totalLessons}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('completed')}</div>
              <div className="font-bold">{data.overall.completedLessons}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('avgMastery')}</div>
              <div className="font-bold">{Math.round(data.overall.averageMastery * 100)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t('totalStars')}</div>
              <div className="font-bold">{data.overall.totalStars}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BadgesGridProps {
  badges: DashboardSummary['badges'];
}

function BadgesGrid({ badges }: BadgesGridProps) {
  const t = useTranslations('Dashboard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {t('achievements')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('noBadgesYet')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge) => (
              <div key={badge.code} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-2xl">{badge.icon}</div>
                <div className="flex-1">
                  <div className="font-medium">{badge.title}</div>
                  <div className="text-sm text-muted-foreground">{badge.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('earned')} {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GuardianDashboard() {
  const t = useTranslations('Dashboard');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [masteryData, setMasteryData] = useState<DashboardMastery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [summary, mastery] = await Promise.all([
          DashboardAPI.getDashboardSummary(selectedChildId || undefined),
          DashboardAPI.getDashboardMastery(selectedChildId || undefined),
        ]);
        
        setDashboardData(summary);
        setMasteryData(mastery);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedChildId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('loading')}</div>
        </div>
      </div>
    );
  }

  if (!dashboardData || !masteryData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">{t('errorLoading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t('thisWeek')}
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
          title={t('minutesThisWeek')}
          value={`${dashboardData.minutesThisWeek} min`}
          icon={<Clock className="h-4 w-4 text-blue-500" />}
          description={t('learningTime')}
          trend={{ value: 15, label: 'from last week' }}
        />
        <MetricCard
          title={t('lessonsCompleted')}
          value={dashboardData.lessonsCompleted}
          icon={<BookOpen className="h-4 w-4 text-green-500" />}
          description={t('totalLessons')}
        />
        <MetricCard
          title={t('currentStreak')}
          value={`${dashboardData.streakDays} days`}
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          description={t('consecutiveDays')}
        />
        <MetricCard
          title={t('totalXP')}
          value={dashboardData.totalXp}
          icon={<Star className="h-4 w-4 text-yellow-500" />}
          description={t('experiencePoints')}
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList>
          <TabsTrigger value="progress">{t('progress')}</TabsTrigger>
          <TabsTrigger value="mastery">{t('mastery')}</TabsTrigger>
          <TabsTrigger value="achievements">{t('achievements')}</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <WeeklyChart data={dashboardData.weeklyMinutes} />
        </TabsContent>

        <TabsContent value="mastery" className="space-y-6">
          <MasteryHeatmap data={masteryData} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <BadgesGrid badges={dashboardData.badges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
