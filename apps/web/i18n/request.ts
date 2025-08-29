import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import config from '../next-intl.config.js';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!config.locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});


