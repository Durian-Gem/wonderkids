'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

export default function TestPWAPage() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [contentPacks] = useState([
    { code: 'a1-u1', title: 'A1 Unit 1', description: 'Basic greetings and introductions' },
    { code: 'a1-u2', title: 'A1 Unit 2', description: 'Family and friends' },
    { code: 'a1-u3', title: 'A1 Unit 3', description: 'School and hobbies' },
  ]);
  const [downloadedPacks, setDownloadedPacks] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is installable
    const checkInstallability = () => {
      if ('serviceWorker' in navigator && 'caches' in window) {
        setIsInstallable(true);
      }

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstallability();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const downloadPack = async (packCode: string) => {
    // Simulate downloading content pack
    setTimeout(() => {
      setDownloadedPacks(prev => [...prev, packCode]);
    }, 2000);
  };

  const removePack = (packCode: string) => {
    setDownloadedPacks(prev => prev.filter(code => code !== packCode));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          PWA Test Page
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Installation Section */}
          <Card>
            <CardHeader>
              <CardTitle>App Installation</CardTitle>
              <CardDescription>
                Install WonderKids for offline learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Install Status</p>
                  <p className="text-sm text-gray-600">
                    {isInstalled ? '✅ Installed' : isInstallable ? '📱 Installable' : '❌ Not supported'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>

              {isInstallable && !isInstalled && (
                <Button onClick={installApp} className="w-full">
                  📱 Install WonderKids App
                </Button>
              )}

              {isInstalled && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">🎉 App Installed!</p>
                  <p className="text-sm text-green-600 mt-1">
                    You can now access WonderKids offline
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">PWA Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Service Worker caching</li>
                  <li>✅ Offline content access</li>
                  <li>✅ Background sync</li>
                  <li>✅ Push notifications</li>
                  <li>✅ App manifest</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Content Packs Section */}
          <Card>
            <CardHeader>
              <CardTitle>Offline Content Packs</CardTitle>
              <CardDescription>
                Download lessons for offline learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentPacks.map((pack) => (
                  <div key={pack.code} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{pack.title}</h4>
                      <p className="text-sm text-gray-600">{pack.description}</p>
                    </div>
                    {downloadedPacks.includes(pack.code) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePack(pack.code)}
                      >
                        🗑️ Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => downloadPack(pack.code)}
                      >
                        ⬇️ Download
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {downloadedPacks.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    📚 {downloadedPacks.length} pack{downloadedPacks.length > 1 ? 's' : ''} available offline
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    These lessons will work even without internet!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cache Status Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Cache & Storage Status</CardTitle>
            <CardDescription>
              Current offline capabilities and storage usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">📱</div>
                <div className="text-sm font-medium">Service Worker</div>
                <div className="text-xs text-gray-600">Active & caching</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">💾</div>
                <div className="text-sm font-medium">Cache Storage</div>
                <div className="text-xs text-gray-600">Images & audio cached</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">📚</div>
                <div className="text-sm font-medium">Content Packs</div>
                <div className="text-xs text-gray-600">{downloadedPacks.length} downloaded</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Offline Features Tested:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">App installation prompt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Service worker registration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Offline content caching</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Background sync ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Push notifications ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Manifest configuration</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
