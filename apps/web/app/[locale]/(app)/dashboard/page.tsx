'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { apiClient } from '@/src/lib/api';
import type { Profile, Child } from '@repo/types';

export default function DashboardPage() {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      Promise.all([
        fetchProfile(),
        fetchChildren()
      ]).finally(() => setLoading(false));
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.access_token) return;
    
    try {
      const response = await apiClient.getProfile(session.access_token);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchChildren = async () => {
    if (!session?.access_token) return;
    
    try {
      const response = await apiClient.getChildren(session.access_token);
      setChildren(response.data);
    } catch (error) {
      console.error('Failed to fetch children:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayName = profile?.display_name || 'Guardian';

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold">Welcome back, {displayName}!</h1>
        <p className="text-blue-100 mt-2">
          Ready to continue your children's English learning journey?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minutes This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">
              +20% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              3 this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 days</div>
            <p className="text-xs text-muted-foreground">
              Keep it up! 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with the most important tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {children.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <h3 className="text-lg font-medium mb-2">Add your first child</h3>
              <p className="text-muted-foreground mb-4">
                Create a profile for your child to start their learning journey
              </p>
              <Button asChild>
                <a href="/family">Add Child Profile</a>
              </Button>
            </div>
          ) : (
            <>
              <Button asChild variant="default" size="lg">
                <a href="/course/a1-starters">Continue A1 Course</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/family">Manage Children</a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Children Overview */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Children</CardTitle>
            <CardDescription>
              Track progress for each child
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {child.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{child.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {child.birth_year && `Born ${child.birth_year}`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    Last lesson: Introduction basics
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
