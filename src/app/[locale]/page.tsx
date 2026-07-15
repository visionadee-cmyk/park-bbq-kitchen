'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { language, setLanguage, languages } = useLanguage();

  const handleBookNow = () => {
    router.push('/booking');
  };

  const handleAdminLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
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
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-base"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleBookNow} className="w-full py-3 sm:py-2 text-base" size="lg">
              Book Now
            </Button>
            <Button variant="outline" onClick={() => router.push('/manage-booking')} className="w-full text-sm">
              Manage Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
