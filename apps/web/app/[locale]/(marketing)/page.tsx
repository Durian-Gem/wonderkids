import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Fun English Learning for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Kids
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Interactive lessons, games, and AI tutoring designed for children aged 5-12. 
            Safe, engaging, and educational.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <a href="/auth/sign-up">Get Started Free</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why families love WonderKids
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to help your child learn English effectively and safely
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎮</span>
              </div>
              <CardTitle>Interactive Lessons</CardTitle>
              <CardDescription>
                Engaging activities, games, and quizzes that keep kids motivated and learning
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle>Track Progress</CardTitle>
              <CardDescription>
                See exactly what your child is learning with detailed progress reports and achievements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <CardTitle>Safe & Secure</CardTitle>
              <CardDescription>
                Child-safe environment with parental controls and COPPA-compliant privacy protection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <CardTitle>AI Tutor</CardTitle>
              <CardDescription>
                Personalized AI tutoring sessions that adapt to your child's learning pace and style
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <CardTitle>CEFR Aligned</CardTitle>
              <CardDescription>
                Curriculum aligned with international CEFR standards for structured learning progression
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <CardTitle>Family Friendly</CardTitle>
              <CardDescription>
                Support multiple children under one account with individual progress tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What parents are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "My 7-year-old daughter loves the interactive lessons. She's been using WonderKids for 3 months and her English has improved so much!"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Parent, California</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "The progress tracking is amazing. I can see exactly what my kids are learning and where they need more practice."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">M</span>
                  </div>
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-gray-500">Parent, New York</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  "Safe, educational, and fun. WonderKids gives me peace of mind while my children learn independently."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold">L</span>
                  </div>
                  <div>
                    <p className="font-medium">Lisa Rodriguez</p>
                    <p className="text-sm text-gray-500">Parent, Texas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start your child's English journey today
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of families who trust WonderKids for their children's English education
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <a href="/auth/sign-up">Get Started Free</a>
          </Button>
          <p className="mt-4 text-sm text-blue-200">
            Free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
