'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/LanguageSelector';
import SignaturePad from '@/components/SignaturePad';
import { createBooking, getAvailableSlots, getBookingsByDate } from '@/lib/bookings';
import { searchEmployees } from '@/lib/employees';
import { uploadToCloudinary } from '@/lib/cloudinaryUpload';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react';

export default function BookingPage() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [pax, setPax] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [dateAvailability, setDateAvailability] = useState<Map<string, number>>(new Map());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCredentials, setBookingCredentials] = useState<{bookingNumber: string, bookingPassword: string} | null>(null);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [nameSearchResults, setNameSearchResults] = useState<any[]>([]);
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const TIME_SLOTS = [
    '09:00–11:00',
    '11:00–13:00',
    '13:00–15:00',
    '15:00–17:00',
    '17:00–19:00',
    '19:00–21:00',
    '21:00–23:00',
  ];

  useEffect(() => {
    loadMonthAvailability();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  useEffect(() => {
    const searchEmployeesData = async () => {
      if (employeeName && employeeName.length >= 2) {
        setIsSearchingName(true);
        try {
          const results = await searchEmployees(employeeName);
          setNameSearchResults(results);
          setShowNameDropdown(results.length > 0);
        } catch (error) {
          console.error('Error searching employees:', error);
          setNameSearchResults([]);
          setShowNameDropdown(false);
        } finally {
          setIsSearchingName(false);
        }
      } else {
        setNameSearchResults([]);
        setShowNameDropdown(false);
      }
    };

    const debounceTimer = setTimeout(searchEmployeesData, 300);
    return () => clearTimeout(debounceTimer);
  }, [employeeName]);

  const handleEmployeeSelect = (employee: any) => {
    setEmployeeId((employee as any).employeeId || employee.employeeNumber);
    setEmployeeCode((employee as any).employeeCode || employee.employeeNumber);
    setEmployeeName(employee.fullName);
    setDepartment(employee.department);
    setShowNameDropdown(false);
    setNameSearchResults([]);
  };

  const clearEmployeeName = () => {
    setEmployeeId('');
    setEmployeeCode('');
    setEmployeeName('');
    setDepartment('');
    setShowNameDropdown(false);
    setNameSearchResults([]);
  };

  const loadMonthAvailability = async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const availability = new Map<string, number>();
    
    for (const day of days) {
      if (day >= new Date() && day <= addDays(new Date(), 30)) {
        const dateStr = format(day, 'yyyy-MM-dd');
        try {
          const bookings = await getBookingsByDate(dateStr);
          const availableCount = TIME_SLOTS.length - bookings.length;
          availability.set(dateStr, availableCount);
        } catch (err) {
          // If Firebase permissions error, assume all slots available
          availability.set(dateStr, TIME_SLOTS.length);
        }
      }
    }
    
    setDateAvailability(availability);
  };

  const loadAvailableSlots = async () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      try {
        const slots = await getAvailableSlots(dateStr);
        setAvailableSlots(slots);
      } catch (err) {
        // If Firebase permissions error, assume all slots available
        setAvailableSlots(TIME_SLOTS);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate) {
      setError(t('booking.selectDate'));
      return;
    }

    if (!slot) {
      setError(t('booking.selectSlot'));
      return;
    }

    if (!agreement) {
      setError(t('booking.mustAgree'));
      return;
    }

    if (pax < 1 || pax > 50) {
      setError(t('booking.maxGuests'));
      return;
    }

    // Show signature modal if not signed yet
    if (!signature) {
      setShowSignatureModal(true);
      return;
    }

    setIsLoading(true);

    try {
      if (!employeeId || !employeeName || !department) {
        setError('Please fill in employee information');
        return;
      }

      // Upload signature to Cloudinary
      let signatureUrl = '';
      if (signature) {
        try {
          signatureUrl = await uploadToCloudinary(signature, 'signatures');
        } catch (uploadError) {
          console.error('Signature upload error:', uploadError);
          setError('Failed to upload signature. Please try again.');
          return;
        }
      }

      const bookingData = {
        employeeId: employeeCode,
        employeeName,
        employeeDepartment: department,
        contactNumber,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        slot,
        pax,
        remarks,
        agreement: true,
        signature: signatureUrl,
      };

      console.log('Creating booking with data:', bookingData);
      const result = await createBooking(bookingData);
      console.log('Booking created successfully:', result);
      setBookingCredentials({
        bookingNumber: result.bookingNumber,
        bookingPassword: result.bookingPassword
      });
      setBookingSuccess(true);
    } catch (err: any) {
      console.error('Booking error:', err);
      if (err.message === 'already_booked') {
        setError(t('booking.alreadyBooked'));
      } else if (err.message === 'slot_unavailable') {
        setError(t('booking.slotUnavailable'));
      } else {
        setError(t('booking.bookingError') + ': ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityColor = (available: number) => {
    if (available === 7) return 'bg-green-500';
    if (available >= 5) return 'bg-green-400';
    if (available >= 3) return 'bg-yellow-400';
    if (available >= 1) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const getAvailabilityText = (available: number) => {
    if (available === 7) return 'All slots available';
    if (available >= 5) return `${available} slots available`;
    if (available >= 3) return `${available} slots available`;
    if (available >= 1) return `${available} slot available`;
    return 'Fully booked';
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const firstDayOfMonth = monthStart.getDay();
    const daysInMonth = days.length;
    
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded-lg"></div>);
    }
    
    // Calendar days
    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const available = dateAvailability.get(dateStr) || 0;
      const isPast = day < new Date();
      const isTooFar = day > addDays(new Date(), 30);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isWeekendDay = isWeekend(day);
      
      calendarDays.push(
        <div
          key={dateStr}
          onClick={() => !isPast && !isTooFar && setSelectedDate(day)}
          className={`h-16 sm:h-24 rounded-lg p-1 sm:p-2 cursor-pointer transition-all ${
            isPast || isTooFar 
              ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
              : isSelected 
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2' 
                : 'bg-white hover:bg-blue-50 border border-gray-200'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </span>
            {isWeekendDay && !isSelected && (
              <span className="text-xs text-gray-400 hidden sm:block">{t('calendar.weekend')}</span>
            )}
          </div>
          {!isPast && !isTooFar && (
            <div className="mt-1 sm:mt-2">
              <div className={`h-1.5 sm:h-2 rounded-full ${getAvailabilityColor(available)}`}></div>
              <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                {available}
              </div>
            </div>
          )}
          {isPast && (
            <div className="text-xs text-gray-400 mt-1 sm:mt-2">{t('calendar.past')}</div>
          )}
          {isTooFar && (
            <div className="text-xs text-gray-400 mt-1 sm:mt-2">{t('calendar.unavailable')}</div>
          )}
        </div>
      );
    }
    
    return calendarDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <img src="/logo/logo.jpeg" alt="Park BBQ Kitchen Logo" className="h-8 w-auto sm:h-10" />
          </div>
          <div className="flex items-center space-x-4">
            <img 
              src="/storyset/Barbecue-bro.svg" 
              alt="BBQ Illustration" 
              className="h-12 w-auto hidden sm:block"
            />
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{t('booking.newBooking')}</CardTitle>
            <CardDescription className="text-sm sm:text-base">{t('booking.newBooking')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">{t('auth.employeeId')}</Label>
                  <Input
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder={t('auth.employeeId')}
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label className="text-sm">{t('bookingForm.fullName')}</Label>
                  <div className="relative">
                    <Input
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder={t('bookingForm.typeFullName')}
                      required
                      className="text-base pr-8"
                    />
                    {employeeName && (
                      <button
                        type="button"
                        onClick={clearEmployeeName}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {showNameDropdown && nameSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {nameSearchResults.map((employee) => (
                        <div
                          key={employee.id}
                          onClick={() => handleEmployeeSelect(employee)}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm">{employee.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {(employee as any).employeeCode || (employee as any).employeeNumber} • {employee.department}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isSearchingName && employeeName.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
                      {t('common.search')}...
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">{t('bookingForm.department')}</Label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={t('bookingForm.department')}
                    required
                    className="text-base"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`day-${index}`} className="text-center text-xs sm:text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {renderCalendar()}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 mr-1 sm:mr-2"></div>
                      <span className="text-xs">{t('calendar.allAvailable')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400 mr-1 sm:mr-2"></div>
                      <span className="text-xs">{t('calendar.limited')}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-1 sm:mr-2"></div>
                      <span className="text-xs">{t('calendar.fullyBooked')}</span>
                    </div>
                  </div>
                  {selectedDate && (
                    <div className="text-blue-600 font-medium text-xs sm:text-sm">
                      {t('calendar.selected')}: {format(selectedDate, 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {t('booking.bookingTime')}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((timeSlot) => {
                    const isAvailable = availableSlots.includes(timeSlot);
                    return (
                      <button
                        key={timeSlot}
                        type="button"
                        onClick={() => isAvailable && setSlot(timeSlot)}
                        disabled={!isAvailable}
                        className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                          slot === timeSlot
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : isAvailable
                              ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-medium">{timeSlot}</div>
                        <div className="text-xs mt-1">
                          {isAvailable ? t('booking.available') : t('booking.booked')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  {t('booking.numberOfGuests')}
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={pax}
                  onChange={(e) => setPax(parseInt(e.target.value))}
                  required
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t('booking.contactNumber')}</Label>
                <Input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  className="text-base"
                  placeholder={t('booking.contactNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t('booking.remarks')}</Label>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={t('booking.remarks')}
                  className="text-base"
                />
              </div>

              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm sm:text-base">{t('agreement.title')}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{t('agreement.intro')}</p>
                <ol className="list-decimal list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <li key={num}>{t(`agreement.rule${num}`)}</li>
                  ))}
                </ol>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreement"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                  />
                  <Label htmlFor="agreement" className="text-xs sm:text-sm">
                    {t('booking.agreeToRules')}
                  </Label>
                </div>
              </div>

              {error && (
                <div className="text-xs sm:text-sm text-red-500">{error}</div>
              )}

              <Button type="submit" className="w-full py-3 sm:py-2 text-base" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('common.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {bookingSuccess && bookingCredentials && (
          <Card className="mt-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 text-lg sm:text-xl">{t('bookingForm.bookingSuccessful')}</CardTitle>
              <CardDescription className="text-green-700 text-sm">{t('bookingForm.saveYourCredentials')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-600">{t('bookingForm.bookingNumber')}</Label>
                      <div className="text-lg font-bold text-gray-900 mt-1">{bookingCredentials.bookingNumber}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">{t('bookingForm.bookingPassword')}</Label>
                      <div className="text-lg font-bold text-gray-900 mt-1">{bookingCredentials.bookingPassword}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`Booking Number: ${bookingCredentials.bookingNumber}\nBooking Password: ${bookingCredentials.bookingPassword}`);
                      alert(t('bookingForm.credentialsCopied'));
                    }}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    {t('bookingForm.copyCredentials')}
                  </Button>
                  <Button 
                    onClick={() => router.push('/')}
                    className="flex-1 text-sm"
                  >
                    {t('bookingForm.goToHome')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signature Modal */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Sign Kitchen Use Agreement</CardTitle>
                <CardDescription className="text-sm">
                  Please sign below to confirm you agree to the kitchen use agreement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SignaturePad 
                    onSignatureChange={setSignature}
                    width={350}
                    height={200}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (signature) {
                          setShowSignatureModal(false);
                          // Submit the form after signature
                          document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }
                      }}
                      disabled={!signature}
                      className="flex-1"
                    >
                      Confirm & Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSignatureModal(false);
                        setSignature(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
