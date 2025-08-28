import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation.js';

// Can be imported from a shared config
const locales = ['en', 'vi'] as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

// Export config for the plugin
export const nextIntlConfig = {
  locales,
  defaultLocale: 'en' as const,
  localeDetection: false,
  messages: {
    en: './messages/en.json',
    vi: './messages/vi.json',
  },
};
