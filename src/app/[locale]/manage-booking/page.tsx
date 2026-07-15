'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getBookingByCredentials, cancelBooking, requestBookingChange, updateBooking } from '@/lib/bookings';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, AlertCircle, Edit, Upload, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';

export default function ManageBookingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [bookingNumber, setBookingNumber] = useState('');
  const [bookingPassword, setBookingPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedSlot, setRequestedSlot] = useState('');
  const [changeReason, setChangeReason] = useState('');
  
  // Kitchen checklist items
  const [checklistItems, setChecklistItems] = useState({
    kitchenCleaned: false,
    equipmentReturned: false,
    gasTurnedOff: false,
    trashDisposed: false,
    surfacesWiped: false,
  });
  
  // Kitchen image upload
  const [kitchenImage, setKitchenImage] = useState<File | null>(null);
  const [kitchenImagePreview, setKitchenImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const TIME_SLOTS = [
    '08:00–10:00',
    '10:00–12:00',
    '12:00–14:00',
    '14:00–16:00',
    '16:00–18:00',
    '18:00–20:00',
    '20:00–22:00',
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBooking(null);
    setShowDetails(false);
    setIsLoading(true);

    try {
      const result = await getBookingByCredentials(bookingNumber, bookingPassword);
      if (!result) {
        setError(t('manageBooking.invalidCredentials'));
        return;
      }
      setBooking(result);
      setShowDetails(true);
    } catch (err) {
      setError(t('common.error') + '. ' + t('common.pleaseSignIn'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t('common.confirm'))) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelBooking(booking.id);
      alert(t('manageBooking.cancelBooking'));
      setBooking(null);
      setShowDetails(false);
      setBookingNumber('');
      setBookingPassword('');
    } catch (err) {
      setError(t('manageBooking.cancelBookingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestedDate || !requestedSlot || !changeReason) {
      setError(t('booking.purpose') + ' ' + t('common.required'));
      return;
    }

    setIsLoading(true);
    try {
      await requestBookingChange(booking.id, requestedDate, requestedSlot, changeReason);
      alert(t('manageBooking.requestChange') + '. ' + t('admin.pending'));
      setShowChangeRequest(false);
      setRequestedDate('');
      setRequestedSlot('');
      setChangeReason('');
      
      // Refresh booking data
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure Firestore update
      const result = await getBookingByCredentials(bookingNumber, bookingPassword);
      setBooking(result);
      console.log('Updated booking after change request:', result);
    } catch (err) {
      console.error('Change request error:', err);
      setError(t('manageBooking.cancelBookingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklistItems(prev => ({
      ...prev,
      [item]: checked
    }));
  };

  const handleKitchenImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKitchenImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setKitchenImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteBooking = async () => {
    if (!Object.values(checklistItems).every(item => item)) {
      setError('Please complete all checklist items before finishing.');
      return;
    }

    if (!kitchenImage) {
      setError('Please upload a kitchen image before finishing.');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Upload kitchen image to Cloudinary
      const imageUrl = await uploadToCloudinary(kitchenImage, 'kitchen-images');
      
      // Update booking with checklist and image
      await updateBooking(booking.id, {
        checklist: checklistItems,
        kitchenImage: imageUrl,
        status: 'completed'
      });

      alert('Booking completed successfully!');
      
      // Refresh booking data
      const result = await getBookingByCredentials(bookingNumber, bookingPassword);
      setBooking(result);
    } catch (err) {
      console.error('Error completing booking:', err);
      setError('Failed to complete booking. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold">{t('home.manageBooking')}</h1>
          </div>
          <img 
            src="/storyset/Barbecue-rafiki.svg" 
            alt="BBQ Illustration" 
            className="h-12 w-auto hidden sm:block"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!showDetails ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{t('manageBooking.findYourBooking')}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t('manageBooking.enterBookingCredentials')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingNumber" className="text-sm">{t('bookingForm.bookingNumber')}</Label>
                  <Input
                    id="bookingNumber"
                    type="text"
                    placeholder="e.g., BK123ABC456"
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bookingPassword" className="text-sm">{t('bookingForm.bookingPassword')}</Label>
                  <Input
                    id="bookingPassword"
                    type="password"
                    placeholder="Enter your booking password"
                    value={bookingPassword}
                    onChange={(e) => setBookingPassword(e.target.value)}
                    required
                    className="text-base"
                  />
                </div>
                {error && (
                  <div className="text-xs sm:text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full py-3 sm:py-2 text-base" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('common.search')}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{t('booking.bookingDate')}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t('bookingForm.bookingNumber')}: {booking.bookingNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">{t('employee.name')}</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.employeeName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">{t('employee.department')}</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.employeeDepartment}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {t('calendar.today')}
                    </Label>
                    <div className="text-sm sm:text-base font-medium">
                      {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('booking.bookingTime')}
                    </Label>
                    <div className="text-sm sm:text-base font-medium">{booking.slot}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {t('booking.numberOfGuests')}
                    </Label>
                    <div className="text-sm sm:text-base font-medium">{booking.pax}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">{t('booking.purpose')}</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.purpose}</div>
                  </div>
                </div>

                {booking.remarks && (
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">{t('booking.remarks')}</Label>
                    <div className="text-sm sm:text-base">{booking.remarks}</div>
                  </div>
                )}

                <div className="flex items-center space-x-2 flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    booking.status === 'booked' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {t('status.booked')}: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    booking.approvalStatus === 'approved'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.approvalStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.approvalStatus === 'change_requested'
                          ? 'bg-orange-100 text-orange-800'
                          : booking.approvalStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                  }`}>
                    {t('admin.pending')}: {booking.approvalStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.approvalStatus.replace('_', ' ').slice(1)}
                  </div>
                </div>

                {booking.approvalStatus === 'change_requested' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">{t('admin.pending')}</h4>
                    <p className="text-sm text-orange-800">
                      {t('calendar.selected')}: {format(new Date(booking.requestedDate), 'MMM d, yyyy')} at {booking.requestedSlot}
                    </p>
                    {booking.changeRequestReason && (
                      <p className="text-sm text-orange-700 mt-1">{t('booking.purpose')}: {booking.changeRequestReason}</p>
                    )}
                  </div>
                )}

                {booking.approvalStatus === 'rejected' && booking.changeRequestReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">{t('status.cancelled')}</h4>
                    <p className="text-sm text-red-800">{t('booking.purpose')}: {booking.changeRequestReason}</p>
                  </div>
                )}

                {/* Kitchen Completion Checklist */}
                {booking.status === 'booked' && booking.approvalStatus === 'approved' && (
                  <Card className="mt-4 border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Kitchen Completion Checklist
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Complete all items and upload kitchen image to finish booking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries({
                          kitchenCleaned: 'Kitchen cleaned thoroughly',
                          equipmentReturned: 'All equipment returned to proper place',
                          gasTurnedOff: 'Gas turned off completely',
                          trashDisposed: 'All trash disposed properly',
                          surfacesWiped: 'All surfaces wiped down'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={checklistItems[key as keyof typeof checklistItems]}
                              onChange={(e) => 
                                handleChecklistChange(key, e.target.checked)
                              }
                            />
                            <Label htmlFor={key} className="text-sm cursor-pointer">
                              {label}
                            </Label>
                          </div>
                        ))}

                        {/* Kitchen Image Upload */}
                        <div className="mt-4 space-y-2">
                          <Label className="text-sm font-medium">Upload Kitchen Image</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleKitchenImageChange}
                              className="flex-1"
                            />
                            {kitchenImagePreview && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border">
                                <img
                                  src={kitchenImagePreview}
                                  alt="Kitchen preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={handleCompleteBooking}
                          disabled={isUploadingImage || !Object.values(checklistItems).every(item => item) || !kitchenImage}
                          className="w-full mt-2"
                        >
                          {isUploadingImage ? t('common.loading') : 'Complete Booking'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {booking.status === 'booked' && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    {booking.approvalStatus === 'approved' && (
                      <Button
                        onClick={() => setShowChangeRequest(true)}
                        variant="outline"
                        className="flex-1 text-sm"
                        disabled={isLoading}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('manageBooking.requestChange')}
                      </Button>
                    )}
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      className="flex-1 text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : t('manageBooking.cancelBooking')}
                    </Button>
                    <Button
                      onClick={() => {
                        setBooking(null);
                        setShowDetails(false);
                        setBookingNumber('');
                        setBookingPassword('');
                      }}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      {t('common.search')}
                    </Button>
                  </div>
                )}

                {booking.status !== 'booked' && (
                  <Button
                    onClick={() => {
                      setBooking(null);
                      setShowDetails(false);
                      setBookingNumber('');
                      setBookingPassword('');
                    }}
                    variant="outline"
                    className="w-full text-sm"
                  >
                    {t('common.search')} {t('booking.newBooking')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showChangeRequest && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{t('manageBooking.requestChange')}</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t('manageBooking.requestChange')} {t('booking.bookingDate')} {t('booking.bookingTime')} ({t('admin.pending')})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedDate" className="text-sm">{t('calendar.today')}</Label>
                  <Input
                    id="requestedDate"
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    required
                    className="text-base"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestedSlot" className="text-sm">{t('booking.bookingTime')}</Label>
                  <select
                    id="requestedSlot"
                    value={requestedSlot}
                    onChange={(e) => setRequestedSlot(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                  >
                    <option value="">{t('booking.selectSlot')}</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeReason" className="text-sm">{t('booking.purpose')}</Label>
                  <textarea
                    id="changeReason"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                    rows={3}
                    placeholder={t('booking.remarks')}
                  />
                </div>
                {error && (
                  <div className="text-xs sm:text-sm text-red-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 text-sm"
                    disabled={isLoading}
                  >
                    {isLoading ? t('common.loading') : t('common.submit')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowChangeRequest(false);
                      setRequestedDate('');
                      setRequestedSlot('');
                      setChangeReason('');
                      setError('');
                    }}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
