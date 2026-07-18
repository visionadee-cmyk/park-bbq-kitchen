'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LanguageSelector } from '@/components/LanguageSelector';
import Footer from '@/components/Footer';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();

  const handleBookNow = () => {
    router.push('/booking');
  };

  const handleAdminLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/2 flex justify-center">
            <img 
              src="/storyset/Barbecue-rafiki.svg" 
              alt="BBQ Illustration" 
              className="w-full max-w-md h-auto"
            />
          </div>
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <img src="/logo/logo.jpeg" alt="Park BBQ Kitchen Logo" className="h-16 sm:h-20 w-auto" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">{t('common.appName')}</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base">Book the Park BBQ Kitchen for your events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm">Language</Label>
                  <LanguageSelector />
                </div>
                <Button onClick={handleBookNow} className="w-full py-3 sm:py-2 text-base" size="lg">
                  {t('home.bookNow')}
                </Button>
                <Button variant="outline" onClick={() => router.push('/manage-booking')} className="w-full text-sm">
                  {t('home.manageBooking')}
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => router.push('/user-manual')} className="flex-1 text-sm">
                    User Manual
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/faq')} className="flex-1 text-sm">
                    FAQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
