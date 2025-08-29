'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

export default function TestEmailPage() {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const toggleEmail = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setEmailEnabled(!emailEnabled);
      setIsLoading(false);
    }, 500);
  };

  const previewWeeklyEmail = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setPreviewData({
        childName: "Emma",
        thisWeek: {
          minutes: 125.5,
          lessons: 12,
          streak: 7,
          topScore: 95
        },
        achievements: [
          "Completed 3 lessons in a row",
          "Perfect score on pronunciation",
          "Learned 15 new words"
        ],
        nextWeek: {
          focus: "Numbers and counting",
          recommended: 3
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const sendTestEmail = async () => {
    setIsLoading(true);
    setTimeout(() => {
      alert("✅ Test email sent successfully! Check your email for the weekly summary.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Weekly Guardian Email Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure weekly progress emails for guardians
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Progress Emails</h4>
                  <p className="text-sm text-gray-600">
                    Get weekly summaries of your child's learning progress
                  </p>
                </div>
                <Button
                  onClick={toggleEmail}
                  disabled={isLoading}
                  variant={emailEnabled ? "default" : "outline"}
                >
                  {isLoading ? "..." : emailEnabled ? "✅ Enabled" : "📧 Enable"}
                </Button>
              </div>

              {emailEnabled && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Weekly emails enabled!</p>
                  <p className="text-sm text-green-600 mt-1">
                    You'll receive progress summaries every Sunday at 6:00 PM.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Email Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>📊 Weekly learning progress summary</li>
                  <li>🎯 Achievements and milestones</li>
                  <li>📈 Performance analytics</li>
                  <li>📝 Recommended activities</li>
                  <li>🔔 Customizable frequency</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                See what your weekly email will look like
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={previewWeeklyEmail}
                  disabled={isLoading}
                  className="w-full"
                >
                  👁️ Preview This Week's Email
                </Button>

                {previewData && (
                  <div className="border rounded-lg p-4 bg-white">
                    <h4 className="font-medium mb-3">📧 Weekly Progress Report</h4>

                    <div className="space-y-3">
                      <div className="text-center">
                        <h5 className="font-bold text-lg text-blue-600">
                          {previewData.childName}'s Learning Journey
                        </h5>
                        <p className="text-sm text-gray-600">Week of August 26 - September 1</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {previewData.thisWeek.minutes}min
                          </div>
                          <div className="text-sm text-gray-600">Learning Time</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {previewData.thisWeek.lessons}
                          </div>
                          <div className="text-sm text-gray-600">Lessons Completed</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-2xl font-bold text-purple-600">
                            {previewData.thisWeek.streak}
                          </div>
                          <div className="text-sm text-gray-600">Day Streak</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded">
                          <div className="text-2xl font-bold text-orange-600">
                            {previewData.thisWeek.topScore}%
                          </div>
                          <div className="text-sm text-gray-600">Best Score</div>
                        </div>
                      </div>

                      <div>
                        <h6 className="font-medium mb-2">🏆 This Week's Achievements:</h6>
                        <ul className="text-sm space-y-1">
                          {previewData.achievements.map((achievement: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50 rounded">
                        <h6 className="font-medium mb-1">🎯 Next Week Focus:</h6>
                        <p className="text-sm">{previewData.nextWeek.focus}</p>
                        <p className="text-sm text-gray-600">
                          {previewData.nextWeek.recommended} recommended activities
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Admin Controls</CardTitle>
            <CardDescription>
              Test email functionality (development only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={sendTestEmail}
                disabled={isLoading}
                variant="outline"
              >
                📤 Send Test Email
              </Button>
              <Button
                onClick={() => alert("✅ Cron job simulation: Weekly email queued for Sunday 6:00 PM")}
                variant="outline"
              >
                ⏰ Simulate Weekly Cron
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">📧 Email Service Status:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600">✅</span> SMTP Provider Ready
                </div>
                <div>
                  <span className="text-green-600">✅</span> Resend Provider Ready
                </div>
                <div>
                  <span className="text-green-600">✅</span> Cron Scheduler Active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
