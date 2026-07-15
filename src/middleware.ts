import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'dv', 'hi', 'ta', 'ml', 'bn'],
  defaultLocale: 'en'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
