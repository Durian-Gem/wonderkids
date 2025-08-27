import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'vi'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Only run middleware on routes that need internationalization
  // Skip API routes and static files
  pathnames: {
    // If all locales use the same pathname, a
    // single external pathname can be provided.
    '/': '/',
    '/dashboard': '/dashboard',
    '/family': '/family',
    '/course/[slug]': '/course/[slug]',
    '/pricing': '/pricing',
    '/auth/sign-in': '/auth/sign-in',
    '/auth/sign-up': '/auth/sign-up',
  }
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|en)/:path*']
};
