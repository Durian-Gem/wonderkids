'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Mock user type for testing
interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// Mock authenticated user for testing
const mockUser: MockUser = {
  id: 'mock-user-id-123',
  email: 'test@example.com',
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth loading delay
    const timer = setTimeout(() => {
      setUser(mockUser);
      setSession({ user: mockUser });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
