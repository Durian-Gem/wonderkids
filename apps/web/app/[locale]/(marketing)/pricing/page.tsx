import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Family-Friendly Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          One plan that grows with your family. Support up to 3 children with comprehensive learning tools.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-blue-200 relative overflow-hidden">
          {/* Popular Badge */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 text-sm font-medium">
            Most Popular
          </div>
          
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl">Family Plan</CardTitle>
            <CardDescription>Everything your family needs</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-gray-500">/month</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Features List */}
            <ul className="space-y-3">
              {[
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
              ].map((feature, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
              <a href="/auth/sign-up">Start Free Trial</a>
            </Button>

            {/* Trial Info */}
            <p className="text-center text-sm text-gray-500">
              7-day free trial • No credit card required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How does the free trial work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                You get 7 days of full access to all features without entering a credit card. 
                If you decide to continue, you'll be asked to add payment information after the trial ends.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I add more than 3 children?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Currently, our Family Plan supports up to 3 children. If you need support for more children, 
                please contact our support team and we'll work out a custom solution for your family.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is it safe for children?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Absolutely. WonderKids is designed with child safety as our top priority. We're COPPA compliant, 
                use secure authentication, and our AI tutor has strict safety guidelines to ensure appropriate interactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What ages is WonderKids suitable for?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                WonderKids is designed for children aged 5-12. Our curriculum adapts to different skill levels, 
                from complete beginners to more advanced young learners.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. There are no long-term commitments or cancellation fees. 
                Your access will continue until the end of your current billing period.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center mt-20">
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="text-gray-600 mb-6">
          Join thousands of families who trust WonderKids for their children's English education.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
          <a href="/auth/sign-up">Start Your Free Trial</a>
        </Button>
      </div>
    </div>
  );
}
