'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { blockDate, unblockDate, getBlockedDates, isDateBlocked } from '@/lib/blockedDates';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSettingsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadBlockedDates();
  }, [user, router]);

  const loadBlockedDates = async () => {
    const dates = await getBlockedDates();
    setBlockedDates(dates);
    setIsLoading(false);
  };

  const handleBlockDate = async () => {
    if (!selectedDate || !reason) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await blockDate(dateStr, reason, user!.id);
    setReason('');
    setSelectedDate(undefined);
    loadBlockedDates();
  };

  const handleUnblockDate = async (id: string) => {
    if (confirm(t('common.confirm'))) {
      await unblockDate(id);
      loadBlockedDates();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <img src="/logo/logo.jpeg" alt="Park BBQ Kitchen Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold">{t('admin.adminDashboard')}</h1>
          </div>
          <img 
            src="/storyset/Barbecue-amico.svg" 
            alt="BBQ Illustration" 
            className="h-12 w-auto hidden sm:block"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">{t('admin.settings')}</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.blockDates')}</CardTitle>
              <CardDescription>Block dates for maintenance or events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t('booking.bookingDate')}</Label>
                  <Calendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mt-2"
                  />
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Maintenance, Company Event, etc."
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleBlockDate} disabled={!selectedDate || !reason}>
                  <Plus className="w-4 h-4 mr-2" />
                  Block Date
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blocked Dates</CardTitle>
              <CardDescription>Currently blocked dates</CardDescription>
            </CardHeader>
            <CardContent>
              {blockedDates.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No blocked dates</div>
              ) : (
                <div className="space-y-2">
                  {blockedDates.map((blockedDate) => (
                    <div key={blockedDate.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">{blockedDate.date}</div>
                        <div className="text-sm text-gray-600">{blockedDate.reason}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblockDate(blockedDate.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
