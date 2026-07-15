'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBookingByCredentials, cancelBooking, requestBookingChange } from '@/lib/bookings';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, AlertCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';

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
        setError('Invalid booking number or password');
        return;
      }
      setBooking(result);
      setShowDetails(true);
    } catch (err) {
      setError('Failed to retrieve booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsLoading(true);
    try {
      await cancelBooking(booking.id);
      alert('Booking cancelled successfully');
      setBooking(null);
      setShowDetails(false);
      setBookingNumber('');
      setBookingPassword('');
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestedDate || !requestedSlot || !changeReason) {
      setError('Please fill in all change request fields');
      return;
    }

    setIsLoading(true);
    try {
      await requestBookingChange(booking.id, requestedDate, requestedSlot, changeReason);
      alert('Change request submitted. Waiting for admin approval.');
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
      setError('Failed to submit change request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">Manage Booking</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!showDetails ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Find Your Booking</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Enter your booking number and password to manage your booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingNumber" className="text-sm">Booking Number</Label>
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
                  <Label htmlFor="bookingPassword" className="text-sm">Booking Password</Label>
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
                  {isLoading ? t('common.loading') : 'Find Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Booking Details</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Booking Number: {booking.bookingNumber}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Employee Name</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.employeeName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Department</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.employeeDepartment}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      Date
                    </Label>
                    <div className="text-sm sm:text-base font-medium">
                      {format(new Date(booking.bookingDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Time Slot
                    </Label>
                    <div className="text-sm sm:text-base font-medium">{booking.slot}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600 flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Number of Guests
                    </Label>
                    <div className="text-sm sm:text-base font-medium">{booking.pax}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Purpose</Label>
                    <div className="text-sm sm:text-base font-medium">{booking.purpose}</div>
                  </div>
                </div>

                {booking.remarks && (
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">Remarks</Label>
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
                    Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                    Approval: {booking.approvalStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.approvalStatus.replace('_', ' ').slice(1)}
                  </div>
                </div>

                {booking.approvalStatus === 'change_requested' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">Change Request Pending</h4>
                    <p className="text-sm text-orange-800">
                      Requested: {format(new Date(booking.requestedDate), 'MMM d, yyyy')} at {booking.requestedSlot}
                    </p>
                    {booking.changeRequestReason && (
                      <p className="text-sm text-orange-700 mt-1">Reason: {booking.changeRequestReason}</p>
                    )}
                  </div>
                )}

                {booking.approvalStatus === 'rejected' && booking.changeRequestReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Change Request Rejected</h4>
                    <p className="text-sm text-red-800">Reason: {booking.changeRequestReason}</p>
                  </div>
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
                        Request Change
                      </Button>
                    )}
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      className="flex-1 text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? t('common.loading') : 'Cancel Booking'}
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
                      Search Another
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
                    Search Another Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showChangeRequest && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Request Booking Change</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Request to change your booking date and time (requires admin approval)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedDate" className="text-sm">New Date</Label>
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
                  <Label htmlFor="requestedSlot" className="text-sm">New Time Slot</Label>
                  <select
                    id="requestedSlot"
                    value={requestedSlot}
                    onChange={(e) => setRequestedSlot(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                  >
                    <option value="">Select a time slot</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changeReason" className="text-sm">Reason for Change</Label>
                  <textarea
                    id="changeReason"
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                    rows={3}
                    placeholder="Please explain why you need to change your booking"
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
                    {isLoading ? t('common.loading') : 'Submit Request'}
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
                    Cancel
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
