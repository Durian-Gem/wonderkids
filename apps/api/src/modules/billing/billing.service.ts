import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import {
  CheckoutSessionResponseDto,
  CustomerPortalResponseDto,
  SubscriptionStatusDto,
} from './dto/billing.dto';

// Note: You'll need to install stripe: yarn add stripe
// import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private supabase;
  // private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    // Initialize Stripe when package is installed
    // this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
    //   apiVersion: '2023-10-16',
    // });
  }

  async createCheckoutSession(
    userId: string,
    planCode: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<CheckoutSessionResponseDto> {
    try {
      // Get or create customer
      const customer = await this.getOrCreateStripeCustomer(userId);

      // Get price ID for plan
      const priceId = this.getPriceIdForPlan(planCode);
      if (!priceId) {
        throw new BadRequestException('Invalid plan code');
      }

      // Default URLs
      const defaultSuccessUrl = `${this.configService.get('APP_URL')}/dashboard?success=true`;
      const defaultCancelUrl = `${this.configService.get('APP_URL')}/pricing`;

      // Mock Stripe session creation for now
      // TODO: Replace with actual Stripe integration
      const mockSession = {
        id: `cs_mock_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/cs_mock_${Date.now()}`,
      };

      /*
      // Actual Stripe session creation (uncomment when Stripe is installed)
      const session = await this.stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
        metadata: {
          userId,
          planCode,
        },
      });
      */

      return {
        url: mockSession.url,
        sessionId: mockSession.id,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  async createCustomerPortalSession(
    userId: string,
    returnUrl?: string,
  ): Promise<CustomerPortalResponseDto> {
    try {
      // Get customer
      const customer = await this.getStripeCustomer(userId);
      if (!customer) {
        throw new NotFoundException('No billing account found');
      }

      const defaultReturnUrl = `${this.configService.get('APP_URL')}/dashboard`;

      // Mock portal session for now
      const mockPortal = {
        url: `https://billing.stripe.com/p/login/mock_${Date.now()}`,
      };

      /*
      // Actual Stripe portal session (uncomment when Stripe is installed)
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: returnUrl || defaultReturnUrl,
      });
      */

      return {
        url: mockPortal.url,
      };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new InternalServerErrorException('Failed to create portal session');
    }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusDto> {
    try {
      // Get subscription from database
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }

      const hasActiveSubscription = !!subscription;

      // Define premium features
      const premiumFeatures = hasActiveSubscription
        ? [
            'advanced_lessons',
            'ai_tutor',
            'progress_analytics',
            'unlimited_children',
            'priority_support',
          ]
        : [];

      return {
        hasActiveSubscription,
        subscription: subscription
          ? {
              id: subscription.id,
              planCode: subscription.plan_code,
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start),
              currentPeriodEnd: new Date(subscription.current_period_end),
              trialEnd: subscription.trial_end
                ? new Date(subscription.trial_end)
                : undefined,
            }
          : undefined,
        premiumFeatures,
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw new InternalServerErrorException('Failed to get subscription status');
    }
  }

  async handleWebhook(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  private async getOrCreateStripeCustomer(userId: string): Promise<any> {
    // Get user email
    const { data: user, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    // Check if customer already exists in our database
    const { data: existingSubscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      return { id: existingSubscription.stripe_customer_id };
    }

    // Mock customer creation for now
    const mockCustomer = {
      id: `cus_mock_${Date.now()}`,
      email: user.user.email,
    };

    /*
    // Actual Stripe customer creation (uncomment when Stripe is installed)
    const customer = await this.stripe.customers.create({
      email: user.user.email,
      metadata: {
        userId,
      },
    });
    */

    return mockCustomer;
  }

  private async getStripeCustomer(userId: string): Promise<any> {
    const { data: subscription } = await this.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .not('stripe_customer_id', 'is', null)
      .single();

    return subscription?.stripe_customer_id
      ? { id: subscription.stripe_customer_id }
      : null;
  }

  private getPriceIdForPlan(planCode: string): string | null {
    const priceMap = {
      family_monthly: this.configService.get('STRIPE_PRICE_FAMILY_MONTHLY'),
      family_yearly: this.configService.get('STRIPE_PRICE_FAMILY_YEARLY'),
    };

    return priceMap[planCode] || null;
  }

  private async handleCheckoutCompleted(session: any): Promise<void> {
    const userId = session.metadata?.userId;
    const planCode = session.metadata?.planCode;

    if (!userId || !planCode) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Get subscription details from Stripe
    const subscriptionId = session.subscription;

    // Mock subscription data for now
    const mockSubscription = {
      id: subscriptionId,
      status: 'active',
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    /*
    // Actual Stripe subscription retrieval (uncomment when Stripe is installed)
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    */

    // Upsert subscription in database
    await this.supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscriptionId,
        plan_code: planCode,
        status: mockSubscription.status,
        current_period_start: mockSubscription.current_period_start.toISOString(),
        current_period_end: mockSubscription.current_period_end.toISOString(),
        updated_at: new Date().toISOString(),
      });

    console.log(`Subscription created for user ${userId}: ${subscriptionId}`);
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription updated: ${subscription.id}`);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    console.log(`Subscription canceled: ${subscription.id}`);
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    // Handle successful payment (renewal, etc.)
    console.log(`Payment succeeded for invoice: ${invoice.id}`);
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    // Handle failed payment
    const subscriptionId = invoice.subscription;

    await this.supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    console.log(`Payment failed for subscription: ${subscriptionId}`);
  }
}
