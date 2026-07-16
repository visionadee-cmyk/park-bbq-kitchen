import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Park BBQ Kitchen Booking System',
  description: 'Book the Park BBQ Kitchen for your events',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Park BBQ Kitchen',
  },
  icons: {
    icon: '/icon-192.jpeg',
    apple: '/icon-192.jpeg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport = {
  themeColor: '#000000',
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${locale === 'dv' ? 'font-dhivehi' : inter.className}`}>
        <ServiceWorkerRegistration />
        <NextIntlClientProvider messages={messages}>
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
