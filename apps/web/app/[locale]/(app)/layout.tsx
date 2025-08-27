'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/auth-context';
import { Button } from '@repo/ui/button';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-primary">WonderKids</h1>
            <nav className="hidden md:flex space-x-4">
              <a
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/family"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Family
              </a>
              <a
                href="/course/a1-starters"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Courses
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
