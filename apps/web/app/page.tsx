export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">WonderKids</h1>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/signin" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </a>
              <a href="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                Get Started
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fun English Learning for <span className="text-blue-600">Kids</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Interactive lessons, games, and AI tutoring designed for children aged 5-12. 
            Safe, engaging, and educational.
          </p>
          
          <div className="flex justify-center space-x-4">
            <a
              href="/signin"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/dashboard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why families love WonderKids
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Interactive Lessons
              </h3>
              <p className="text-gray-600">
                Engaging activities, games, and quizzes that keep kids motivated and learning
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                See exactly what your child is learning with detailed progress reports and achievements
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Safe & Secure
              </h3>
              <p className="text-gray-600">
                Child-safe environment with parental controls and COPPA-compliant privacy protection
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
