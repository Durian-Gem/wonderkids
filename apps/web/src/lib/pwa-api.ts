import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types for PWA API
export interface ContentPack {
  id: string;
  code: string;
  title: string;
  description?: string;
  assets: PackAsset[];
  createdAt: string;
  isPublished: boolean;
}

export interface PackAsset {
  url: string;
  hash: string;
  bytes: number;
  kind: 'audio' | 'image' | 'lesson' | 'activity' | 'other';
}

export interface OfflinePackStatus {
  packCode: string;
  isDownloaded: boolean;
  downloadProgress: number;
  downloadedAt?: string;
  totalSize: number;
  downloadedSize: number;
}

// Get API base URL
function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
}

// PWA API functions
export const pwaApi = {
  /**
   * Get all published content packs
   */
  async getPublishedPacks(): Promise<ContentPack[]> {
    const response = await fetch(`${getApiUrl()}/pwa/packs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get content packs' }));
      throw new Error(error.message || 'Failed to get content packs');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get a specific content pack by code
   */
  async getPack(code: string): Promise<ContentPack> {
    const response = await fetch(`${getApiUrl()}/pwa/packs/${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get content pack' }));
      throw new Error(error.message || 'Failed to get content pack');
    }

    const result = await response.json();
    return result.data;
  },
};

// PWA Offline Manager
export class OfflineManager {
  private static instance: OfflineManager;
  private packs: Map<string, OfflinePackStatus> = new Map();
  private isDownloading = false;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    this.loadPersistedPacks();
  }

  /**
   * Load persisted pack status from localStorage
   */
  private loadPersistedPacks() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('wonderkids_offline_packs');
      if (stored) {
        const packs = JSON.parse(stored);
        Object.entries(packs).forEach(([code, status]) => {
          this.packs.set(code, status as OfflinePackStatus);
        });
      }
    } catch (error) {
      console.error('Failed to load persisted packs:', error);
    }
  }

  /**
   * Persist pack status to localStorage
   */
  private persistPacks() {
    if (typeof window === 'undefined') return;

    try {
      const packsObj = Object.fromEntries(this.packs);
      localStorage.setItem('wonderkids_offline_packs', JSON.stringify(packsObj));
    } catch (error) {
      console.error('Failed to persist packs:', error);
    }
  }

  /**
   * Get status of all offline packs
   */
  getPackStatuses(): OfflinePackStatus[] {
    return Array.from(this.packs.values());
  }

  /**
   * Get status of a specific pack
   */
  getPackStatus(packCode: string): OfflinePackStatus | null {
    return this.packs.get(packCode) || null;
  }

  /**
   * Check if a pack is downloaded
   */
  isPackDownloaded(packCode: string): boolean {
    const status = this.packs.get(packCode);
    return status?.isDownloaded || false;
  }

  /**
   * Download a content pack for offline use
   */
  async downloadPack(pack: ContentPack): Promise<void> {
    if (this.isDownloading) {
      throw new Error('Another download is in progress');
    }

    this.isDownloading = true;

    try {
      const status: OfflinePackStatus = {
        packCode: pack.code,
        isDownloaded: false,
        downloadProgress: 0,
        totalSize: pack.assets.reduce((sum, asset) => sum + asset.bytes, 0),
        downloadedSize: 0,
      };

      this.packs.set(pack.code, status);
      this.persistPacks();

      // Register pack assets with service worker for precaching
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cache = await caches.open(`pack-${pack.code}`);
        
        for (let i = 0; i < pack.assets.length; i++) {
          const asset = pack.assets[i];
          
          try {
            // Fetch and cache each asset
            const response = await fetch(asset.url);
            if (response.ok) {
              await cache.put(asset.url, response.clone());
              
              // Update progress
              status.downloadedSize += asset.bytes;
              status.downloadProgress = (status.downloadedSize / status.totalSize) * 100;
              this.packs.set(pack.code, { ...status });
              this.persistPacks();
            }
          } catch (error) {
            console.warn(`Failed to download asset ${asset.url}:`, error);
          }
        }

        // Mark as downloaded
        status.isDownloaded = true;
        status.downloadProgress = 100;
        status.downloadedAt = new Date().toISOString();
        this.packs.set(pack.code, status);
        this.persistPacks();
      }
    } finally {
      this.isDownloading = false;
    }
  }

  /**
   * Remove a downloaded pack
   */
  async removePack(packCode: string): Promise<void> {
    try {
      // Remove from cache
      if ('caches' in window) {
        await caches.delete(`pack-${packCode}`);
      }

      // Remove from status
      this.packs.delete(packCode);
      this.persistPacks();
    } catch (error) {
      console.error('Failed to remove pack:', error);
      throw error;
    }
  }

  /**
   * Check if the app is currently online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Get total storage used by offline packs
   */
  getTotalStorageUsed(): number {
    return Array.from(this.packs.values())
      .filter(pack => pack.isDownloaded)
      .reduce((sum, pack) => sum + pack.totalSize, 0);
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Utility functions
export function isPWAInstallable(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function isPWAInstalled(): boolean {
  return typeof window !== 'undefined' && 
         (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true);
}

export function canInstallPWA(): boolean {
  return isPWAInstallable() && !isPWAInstalled();
}

// Install PWA prompt
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    throw new Error('PWA install prompt not available');
  }

  try {
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    deferredPrompt = null;
    
    return choiceResult.outcome === 'accepted';
  } catch (error) {
    console.error('PWA install failed:', error);
    return false;
  }
}
