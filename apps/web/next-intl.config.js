/** @type {import('next-intl').Config} */
export default {
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localeDetection: false,
  messages: {
    en: './messages/en.json',
    vi: './messages/vi.json',
  },
};
