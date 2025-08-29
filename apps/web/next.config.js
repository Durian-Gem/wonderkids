import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import withPWA from 'next-pwa';

const withNextIntl = createNextIntlPlugin('./next-intl.config.js');
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // Plugins will be configured separately to avoid serialization issues
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const withPWAConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /\.(mp3|wav|ogg|m4a|webm)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'audio',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /^.*\/api\/lessons\/.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'lessons-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    {
      urlPattern: /^.*\/api\/pwa\/packs.*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pwa-packs',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    API_URL: process.env.API_URL,
  },
};

export default withPWAConfig(withNextIntl(withMDX(nextConfig)));
