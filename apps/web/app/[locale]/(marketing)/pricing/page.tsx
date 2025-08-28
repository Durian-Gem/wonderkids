'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, CreditCard, Settings, Crown } from 'lucide-react';
import { BillingAPI, SubscriptionStatus } from '@/lib/billing-api';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubscriptionCardProps {
  subscription: SubscriptionStatus;
  onManageBilling: () => void;
  isLoading: boolean;
}

function SubscriptionCard({ subscription, onManageBilling, isLoading }: SubscriptionCardProps) {
  const t = useTranslations('Pricing');

  return (
    <div className="max-w-md mx-auto mb-12">
      <Card className="border-2 border-green-200 relative overflow-hidden">
        {/* Active Badge */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 text-sm font-medium">
          <Crown className="h-4 w-4 inline mr-1" />
          {t('activeSubscription')}
        </div>
        
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Family Plan
          </CardTitle>
          <CardDescription>{t('currentPlan')}</CardDescription>
          {subscription.subscription && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground">
                {t('renewsOn')}: {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
              <Badge variant="outline" className="mt-2">
                {subscription.subscription.status}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Premium Features */}
          <div className="text-center">
            <div className="text-sm font-medium text-green-600 mb-2">{t('premiumFeatures')}:</div>
            <div className="flex flex-wrap justify-center gap-1">
              {subscription.premiumFeatures.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          {/* Manage Billing Button */}
          <Button 
            onClick={onManageBilling}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isLoading ? t('loading') : t('manageBilling')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface PricingCardProps {
  onSubscribe: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

function PricingCard({ onSubscribe, isLoading, isAuthenticated }: PricingCardProps) {
  const t = useTranslations('Pricing');

  const features = [
    'Up to 3 children',
    'All courses included',
    'Progress tracking',
    'AI tutor access',
    'Parent dashboard',
    'CEFR-aligned curriculum',
    'Safe learning environment',
    'Mobile & web access',
    'Email support',
    'Cancel anytime'
  ];

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2 border-blue-200 relative overflow-hidden">
        {/* Popular Badge */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 text-sm font-medium">
          {t('mostPopular')}
        </div>
        
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl">{t('familyPlan')}</CardTitle>
          <CardDescription>{t('everythingYourFamily')}</CardDescription>
          <div className="mt-4">
            <span className="text-4xl font-bold">$19</span>
            <span className="text-gray-500">/month</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Features List */}
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          {isAuthenticated ? (
            <Button 
              onClick={onSubscribe}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700" 
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isLoading ? t('processing') : t('subscribeNow')}
            </Button>
          ) : (
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
              <a href="/auth/sign-up">{t('startFreeTrial')}</a>
            </Button>
          )}

          {/* Trial Info */}
          <p className="text-center text-sm text-gray-500">
            {t('trialInfo')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PricingPage() {
  const t = useTranslations('Pricing');
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        const subscriptionStatus = await BillingAPI.getSubscriptionStatus();
        setSubscription(subscriptionStatus);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/auth/sign-in';
      return;
    }

    setLoading(true);
    try {
      const currentUrl = window.location.origin;
      await BillingAPI.redirectToCheckout(
        'family_monthly',
        `${currentUrl}/pricing?success=true`,
        `${currentUrl}/pricing?canceled=true`
      );
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('There was an error starting the checkout process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      await BillingAPI.openBillingPortal(window.location.href);
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('There was an error opening the billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') && (
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-medium text-green-800">{t('subscriptionSuccess')}</h3>
              <p className="text-sm text-green-600">{t('welcomeToPremium')}</p>
            </div>
          </div>
        </div>
      )}

      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('canceled') && (
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="font-medium text-orange-800">{t('subscriptionCanceled')}</h3>
              <p className="text-sm text-orange-600">{t('noCharges')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status or Pricing Card */}
      {subscription?.hasActiveSubscription ? (
        <SubscriptionCard 
          subscription={subscription}
          onManageBilling={handleManageBilling}
          isLoading={loading}
        />
      ) : (
        <PricingCard 
          onSubscribe={handleSubscribe}
          isLoading={loading}
          isAuthenticated={!!user}
        />
      )}

      {/* FAQ Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('faqTitle')}
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('faq1Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('faq1Answer')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('faq2Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('faq2Answer')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('faq3Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('faq3Answer')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('faq4Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('faq4Answer')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('faq5Title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{t('faq5Answer')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      {!subscription?.hasActiveSubscription && (
        <div className="text-center mt-20">
          <h3 className="text-2xl font-bold mb-4">{t('readyToStart')}</h3>
          <p className="text-gray-600 mb-6">{t('joinThousands')}</p>
          {user ? (
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSubscribe}
              disabled={loading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading ? t('processing') : t('subscribeNow')}
            </Button>
          ) : (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <a href="/auth/sign-up">{t('startFreeTrial')}</a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
