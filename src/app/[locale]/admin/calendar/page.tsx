'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { getAllBookings } from '@/lib/bookings';
import { Booking } from '@/types';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function AdminCalendarPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [view, setView] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    const allBookings = await getAllBookings();
    setBookings(allBookings as Booking[]);
    setIsLoading(false);
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => b.bookingDate === dateStr);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      case 'no_show': return 'warning';
      default: return 'default';
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
            src="/storyset/Barbecue-rafiki.svg" 
            alt="BBQ Illustration" 
            className="h-12 w-auto hidden sm:block"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t('calendar.monthly')}</h2>
          <div className="flex space-x-2">
            <Button
              variant={view === 'monthly' ? 'default' : 'outline'}
              onClick={() => setView('monthly')}
            >
              {t('calendar.monthly')}
            </Button>
            <Button
              variant={view === 'weekly' ? 'default' : 'outline'}
              onClick={() => setView('weekly')}
            >
              {t('calendar.weekly')}
            </Button>
            <Button
              variant={view === 'daily' ? 'default' : 'outline'}
              onClick={() => setView('daily')}
            >
              {t('calendar.daily')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  {t('calendar.today')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth().map((date) => {
                const dayBookings = getBookingsForDate(date);
                const isToday = isSameDay(date, new Date());
                
                return (
                  <div
                    key={date.toString()}
                    className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      isToday ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayBookings.slice(0, 3).map((booking) => (
                        <div
                          key={booking.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                        >
                          {booking.slot} - {booking.employeeName}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
              <CardDescription>Bookings for selected date</CardDescription>
            </CardHeader>
            <CardContent>
              {getBookingsForDate(selectedDate).length === 0 ? (
                <div className="text-center py-4 text-gray-500">No bookings for this date</div>
              ) : (
                <div className="space-y-2">
                  {getBookingsForDate(selectedDate).map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">{booking.employeeName}</div>
                        <div className="text-sm text-gray-600">
                          {booking.slot} - {booking.employeeDepartment}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {t(`status.${booking.status}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
