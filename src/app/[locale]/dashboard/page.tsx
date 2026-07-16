'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LanguageSelector } from '@/components/LanguageSelector';
import { getBookingsByEmployee } from '@/lib/bookings';
import { Booking } from '@/types';
import { LogOut, Calendar, Plus } from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadBookings();
  }, [user, router]);

  const loadBookings = async () => {
    if (user) {
      const userBookings = await getBookingsByEmployee(user.id);
      setBookings(userBookings as Booking[]);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const upcomingBookings = bookings.filter(b => b.status === 'booked');
  const pastBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
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
            <img src="/logo/logo.jpeg" alt="Park BBQ Kitchen Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold">{t('common.appName')}</h1>
              <p className="text-sm text-gray-600">{user?.fullName} - {user?.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <img 
              src="/storyset/Barbecue-pana.svg" 
              alt="BBQ Illustration" 
              className="h-12 w-auto hidden sm:block"
            />
            <LanguageSelector />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">{t('dashboard.myDashboard')}</h2>
          <Button onClick={() => router.push('/booking')}>
            <Plus className="w-4 h-4 mr-2" />
            {t('booking.newBooking')}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.upcomingBookings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.pastBookings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.cancelledBookings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cancelledBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.bookingHistory')}</CardTitle>
            <CardDescription>{t('dashboard.bookingHistory')}</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">{t('dashboard.noBookings')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('booking.bookingDate')}</TableHead>
                    <TableHead>{t('booking.bookingTime')}</TableHead>
                    <TableHead>{t('booking.numberOfGuests')}</TableHead>
                    <TableHead>{t('booking.contactNumber')}</TableHead>
                    <TableHead>{t('status.booked')}</TableHead>
                    <TableHead>{t('common.edit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.bookingDate}</TableCell>
                      <TableCell>{booking.slot}</TableCell>
                      <TableCell>{booking.pax}</TableCell>
                      <TableCell>{booking.contactNumber || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(booking.status) as any}>
                          {t(`status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {booking.status === 'booked' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/booking/${booking.id}`)}
                          >
                            {t('common.edit')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
