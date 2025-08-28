'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '5 lessons per week',
      'Basic vocabulary exercises',
      'Progress tracking',
      'Certificate of completion'
    ],
    icon: <Star className="h-6 w-6" />
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    features: [
      'Unlimited lessons',
      'Advanced activities',
      'AI tutor support',
      'Premium content',
      'Priority support',
      'Offline access'
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 'family',
    name: 'Family',
    price: 19.99,
    period: 'month',
    features: [
      'Up to 5 children',
      'All Premium features',
      'Family progress dashboard',
      'Parent reports',
      'Multi-language support',
      '24/7 support'
    ],
    icon: <Crown className="h-6 w-6" />
  }
];

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (planId: string) => void;
  selectedPlan: string | null;
}

function PricingCard({ plan, onSelect, selectedPlan }: PricingCardProps) {
  const isSelected = selectedPlan === plan.id;

  return (
    <Card className={`relative transition-all duration-300 ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {plan.icon}
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-muted-foreground">/{plan.period}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(plan.id)}
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
        >
          {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PricingTestPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'checkout'>('plans');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setCheckoutStep('checkout');
  };

  const handleBackToPlans = () => {
    setCheckoutStep('plans');
    setSelectedPlan(null);
  };

  const selectedPlanData = pricingPlans.find(p => p.id === selectedPlan);

  if (checkoutStep === 'checkout' && selectedPlanData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToPlans}>
              ← Back to Plans
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {selectedPlanData.icon}
                    <span className="ml-2 font-semibold">{selectedPlanData.name}</span>
                  </div>
                  <span className="font-bold text-lg">
                    ${selectedPlanData.price}/{selectedPlanData.period}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedPlanData.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                  {selectedPlanData.features.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{selectedPlanData.features.length - 3} more features
                    </div>
                  )}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedPlanData.price}/{selectedPlanData.period}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="parent@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVC</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="123"
                    />
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Complete Purchase
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start your child's English learning journey today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={handlePlanSelect}
              selectedPlan={selectedPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
