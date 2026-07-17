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
import { getBookingsByEmployee, updateBooking } from '@/lib/bookings';
import { Booking } from '@/types';
import { LogOut, Calendar, Plus, Check, Upload, X } from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [checklist, setChecklist] = useState({
    kitchenCleaned: false,
    equipmentReturned: false,
    gasTurnedOff: false,
    trashDisposed: false,
    surfacesWiped: false,
  });
  const [kitchenImage, setKitchenImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openCleanupModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setChecklist(booking.checklist || {
      kitchenCleaned: false,
      equipmentReturned: false,
      gasTurnedOff: false,
      trashDisposed: false,
      surfacesWiped: false,
    });
    setImagePreview(booking.kitchenImage || '');
    setKitchenImage(null);
  };

  const closeCleanupModal = () => {
    setSelectedBooking(null);
    setChecklist({
      kitchenCleaned: false,
      equipmentReturned: false,
      gasTurnedOff: false,
      trashDisposed: false,
      surfacesWiped: false,
    });
    setImagePreview('');
    setKitchenImage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKitchenImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCleanup = async () => {
    if (!selectedBooking) return;
    
    if (!kitchenImage && !imagePreview) {
      alert('Please upload a cleanup photo');
      return;
    }

    if (!Object.values(checklist).every(Boolean)) {
      alert('Please complete all checklist items');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = imagePreview;
      
      if (kitchenImage) {
        // In production, you would upload to a storage service
        // For now, we'll use the base64 string
        imageUrl = imagePreview;
      }

      await updateBooking(selectedBooking.id, {
        checklist,
        kitchenImage: imageUrl,
      });

      alert('Cleanup verification submitted successfully');
      closeCleanupModal();
      loadBookings();
    } catch (error) {
      alert('Failed to submit cleanup verification');
    } finally {
      setIsSubmitting(false);
    }
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/booking/${booking.id}`)}
                            >
                              {t('common.edit')}
                            </Button>
                            {(!booking.checklist || !booking.kitchenImage || 
                              !booking.checklist.kitchenCleaned || 
                              !booking.checklist.equipmentReturned || 
                              !booking.checklist.gasTurnedOff || 
                              !booking.checklist.trashDisposed || 
                              !booking.checklist.surfacesWiped) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCleanupModal(booking)}
                              >
                                <Upload className="w-4 h-4 mr-1" />
                                Cleanup
                              </Button>
                            )}
                          </div>
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

      {/* Cleanup Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Cleanup Verification</h3>
                <Button variant="ghost" size="sm" onClick={closeCleanupModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Booking: {selectedBooking.bookingDate} at {selectedBooking.slot}
                </p>
                <p className="text-sm text-gray-600">
                  Please complete the checklist and upload a photo of the cleaned kitchen.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="font-semibold">Checklist</h4>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.kitchenCleaned}
                    onChange={(e) => setChecklist({ ...checklist, kitchenCleaned: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Kitchen cleaned</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.equipmentReturned}
                    onChange={(e) => setChecklist({ ...checklist, equipmentReturned: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Equipment returned</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.gasTurnedOff}
                    onChange={(e) => setChecklist({ ...checklist, gasTurnedOff: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Gas turned off</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.trashDisposed}
                    onChange={(e) => setChecklist({ ...checklist, trashDisposed: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Trash disposed</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.surfacesWiped}
                    onChange={(e) => setChecklist({ ...checklist, surfacesWiped: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Surfaces wiped</span>
                </label>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Upload Kitchen Photo</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Kitchen preview"
                      className="mt-4 max-w-full h-auto rounded"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={closeCleanupModal}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitCleanup} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
