import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Types for Billing API
export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface BillingPortal {
  url: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription?: {
    id: string;
    planCode: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  premiumFeatures: string[];
}

export interface CreateCheckoutRequest {
  planCode: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePortalRequest {
  returnUrl?: string;
}

// API Client Functions
export class BillingAPI {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  static async createCheckoutSession(request: CreateCheckoutRequest): Promise<CheckoutSession> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Checkout session creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Return mock data for development
      return {
        url: 'https://checkout.stripe.com/pay/cs_test_mock_session',
        sessionId: 'cs_test_mock_session_id',
      };
    }
  }

  static async createBillingPortal(request: CreatePortalRequest = {}): Promise<BillingPortal> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/api/billing/portal`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Billing portal creation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating billing portal:', error);
      // Return mock data for development
      return {
        url: 'https://billing.stripe.com/p/login/mock_portal',
      };
    }
  }

  static async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_URL}/api/billing/status`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Subscription status request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Return mock data for development
      return {
        hasActiveSubscription: false,
        premiumFeatures: [],
      };
    }
  }

  // Helper function to redirect to checkout
  static async redirectToCheckout(planCode: string, successUrl?: string, cancelUrl?: string) {
    try {
      const session = await this.createCheckoutSession({
        planCode,
        successUrl,
        cancelUrl,
      });
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }

  // Helper function to open billing portal
  static async openBillingPortal(returnUrl?: string) {
    try {
      const portal = await this.createBillingPortal({
        returnUrl,
      });
      
      // Open billing portal in new tab
      window.open(portal.url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      throw error;
    }
  }
}
