'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Trash2, HardDrive, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { ContentPack, OfflineManager, pwaApi, OfflinePackStatus } from '@/lib/pwa-api';

export default function OfflinePackManager() {
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [packStatuses, setPackStatuses] = useState<OfflinePackStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offlineManager = OfflineManager.getInstance();

  useEffect(() => {
    loadPacks();
    updatePackStatuses();
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPacks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const availablePacks = await pwaApi.getPublishedPacks();
      setPacks(availablePacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content packs');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePackStatuses = () => {
    const statuses = offlineManager.getPackStatuses();
    setPackStatuses(statuses);
  };

  const handleDownloadPack = async (pack: ContentPack) => {
    try {
      setError(null);
      await offlineManager.downloadPack(pack);
      updatePackStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download pack');
    }
  };

  const handleRemovePack = async (packCode: string) => {
    try {
      setError(null);
      await offlineManager.removePack(packCode);
      updatePackStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove pack');
    }
  };

  const getPackStatus = (packCode: string): OfflinePackStatus | null => {
    return packStatuses.find(status => status.packCode === packCode) || null;
  };

  const getTotalStorageUsed = (): string => {
    const totalBytes = offlineManager.getTotalStorageUsed();
    return offlineManager.formatBytes(totalBytes);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offline content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5" />
              <CardTitle>Offline Content</CardTitle>
              <Badge variant={isOnline ? "default" : "secondary"}>
                {isOnline ? (
                  <><Wifi className="w-3 h-3 mr-1" />Online</>
                ) : (
                  <><WifiOff className="w-3 h-3 mr-1" />Offline</>
                )}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPacks}
              disabled={!isOnline}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            <p>Download lesson packs for offline learning. Storage used: <strong>{getTotalStorageUsed()}</strong></p>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Content Packs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Content Packs Available</h3>
              <p className="text-gray-600 text-sm">Check back later for offline learning packs</p>
            </CardContent>
          </Card>
        ) : (
          packs.map((pack) => {
            const status = getPackStatus(pack.code);
            const isDownloaded = status?.isDownloaded || false;
            const isDownloading = status && !status.isDownloaded && status.downloadProgress > 0;
            const packSize = offlineManager.formatBytes(
              pack.assets.reduce((sum, asset) => sum + asset.bytes, 0)
            );

            return (
              <Card key={pack.id} className={isDownloaded ? 'bg-green-50 border-green-200' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pack.title}</CardTitle>
                    <Badge variant={isDownloaded ? "default" : "outline"}>
                      {isDownloaded ? 'Downloaded' : packSize}
                    </Badge>
                  </div>
                  {pack.description && (
                    <p className="text-sm text-gray-600">{pack.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Pack Info */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Assets:</span>
                      <span>{pack.assets.length} files</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{packSize}</span>
                    </div>
                    {isDownloaded && status?.downloadedAt && (
                      <div className="flex justify-between">
                        <span>Downloaded:</span>
                        <span>{new Date(status.downloadedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Download Progress */}
                  {isDownloading && status && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Downloading...</span>
                        <span>{Math.round(status.downloadProgress)}%</span>
                      </div>
                      <Progress value={status.downloadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {isDownloaded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemovePack(pack.code)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleDownloadPack(pack)}
                        disabled={!isOnline || isDownloading}
                        size="sm"
                        className="flex-1"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Asset Types */}
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(pack.assets.map(asset => asset.kind))).map(kind => (
                      <Badge key={kind} variant="outline" className="text-xs">
                        {kind}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Usage Info */}
      {packStatuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packStatuses
                .filter(status => status.isDownloaded)
                .map(status => (
                  <div key={status.packCode} className="flex justify-between text-sm">
                    <span>{status.packCode}</span>
                    <span>{offlineManager.formatBytes(status.totalSize)}</span>
                  </div>
                ))}
              {packStatuses.filter(status => status.isDownloaded).length === 0 && (
                <p className="text-sm text-gray-500">No packs downloaded yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Help */}
      {!isOnline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <WifiOff className="w-5 h-5" />
              <div>
                <p className="font-medium">You're offline</p>
                <p className="text-sm">You can still access downloaded content packs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
