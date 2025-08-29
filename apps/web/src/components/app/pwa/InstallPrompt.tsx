'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone } from 'lucide-react';
import { canInstallPWA, promptPWAInstall, isPWAInstalled } from '@/lib/pwa-api';

interface InstallPromptProps {
  onDismiss?: () => void;
  className?: string;
}

export default function InstallPrompt({ onDismiss, className }: InstallPromptProps) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if PWA can be installed
    setCanInstall(canInstallPWA());
    setIsInstalled(isPWAInstalled());

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('wonderkids_pwa_dismissed');
    setIsDismissed(dismissed === 'true');

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const installed = await promptPWAInstall();
      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('wonderkids_pwa_dismissed', 'true');
    onDismiss?.();
  };

  // Don't show if already installed, can't install, or dismissed
  if (isInstalled || !canInstall || isDismissed) {
    return null;
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Install WonderKids</CardTitle>
            <Badge variant="secondary">PWA</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Install our app for a better learning experience with offline access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Offline lessons</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Faster loading</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Home screen access</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Push notifications</span>
            </div>
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Installing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Install App
              </>
            )}
          </Button>

          {/* Additional Info */}
          <p className="text-xs text-blue-600 text-center">
            Free to install • Works offline • No app store required
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
