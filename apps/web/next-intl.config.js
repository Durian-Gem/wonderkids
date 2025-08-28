/** @type {import('next-intl').Config} */
module.exports = {
  locales: ['en', 'vi'],
  defaultLocale: 'en',
  localeDetection: false,
  messages: {
    en: './messages/en.json',
    vi: './messages/vi.json',
  },
};
