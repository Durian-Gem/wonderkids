// Mock authentication service for UI testing
// This simulates Supabase auth responses for testing purposes

export interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

export interface MockAuthResponse {
  data: {
    user: MockUser | null;
    session: any;
  };
  error: Error | null;
}

class MockSupabaseClient {
  private currentUser: MockUser | null = null;
  
  get auth() {
    return {
      signInWithPassword: async ({ email, password }: { email: string; password: string }): Promise<MockAuthResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For testing, accept the specific test credentials
        if (email === 'dungpasoftware@gmail.com' && password === 'dungpasoftware@gmail.com') {
          this.currentUser = {
            id: 'mock-user-id-123',
            email: email,
            created_at: new Date().toISOString()
          };
          
          return {
            data: {
              user: this.currentUser,
              session: {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600,
                token_type: 'bearer',
                user: this.currentUser
              }
            },
            error: null
          };
        } else {
          return {
            data: { user: null, session: null },
            error: new Error('Invalid login credentials')
          };
        }
      },

      signUp: async ({ email, password, options }: { email: string; password: string; options?: any }): Promise<MockAuthResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.currentUser = {
          id: 'mock-new-user-id-456',
          email: email,
          created_at: new Date().toISOString()
        };
        
        return {
          data: {
            user: this.currentUser,
            session: null // Typically null for sign-up, requires email confirmation
          },
          error: null
        };
      },

      signInWithOtp: async ({ email, options }: { email: string; options?: any }): Promise<MockAuthResponse> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          data: { user: null, session: null },
          error: null // Magic link sent successfully
        };
      },

      getUser: async () => {
        return {
          data: { user: this.currentUser },
          error: null
        };
      },

      getSession: async () => {
        return {
          data: { 
            session: this.currentUser ? {
              access_token: 'mock-access-token',
              user: this.currentUser
            } : null
          },
          error: null
        };
      },

      signOut: async () => {
        this.currentUser = null;
        return { error: null };
      }
    };
  }
}

// Export the mock client
export const createMockClient = () => new MockSupabaseClient();

// Helper to check if we're in development/test mode
export const shouldUseMockAuth = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('your-project-id') || supabaseUrl === '';
};
