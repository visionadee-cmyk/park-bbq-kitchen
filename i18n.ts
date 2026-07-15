import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'dv', 'hi', 'ta', 'ml', 'bn'];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./src/i18n/locales/${locale}.json`)).default,
    timeZone: 'Indian/Maldives',
  };
});
