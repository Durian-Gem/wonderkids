export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">WonderKids</h1>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-blue-600 font-medium">Dashboard</a>
              <a href="/family" className="text-gray-600 hover:text-gray-900">Family</a>
              <a href="/lesson/1d8ac6ee-03d7-405a-866b-34d904aaa7da" className="text-gray-600 hover:text-gray-900">Lessons</a>
              <a href="/" className="text-gray-600 hover:text-gray-900">Sign Out</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          WonderKids Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Welcome to WonderKids! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            You have successfully signed in to your account.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Start Learning
              </h3>
              <p className="text-blue-700 mb-4">
                Begin your English learning journey with interactive lessons.
              </p>
              <a
                href="/lesson/1d8ac6ee-03d7-405a-866b-34d904aaa7da"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Start Saying Hello Lesson
              </a>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                Family Profiles
              </h3>
              <p className="text-purple-700 mb-4">
                Manage your children's learning profiles and progress.
              </p>
              <a
                href="/family"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Manage Children
              </a>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-green-900 mb-2">
                Your Progress
              </h3>
              <p className="text-green-700 mb-4">
                Track your learning progress and achievements.
              </p>
              <div className="text-2xl font-bold text-green-600">
                0 XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
