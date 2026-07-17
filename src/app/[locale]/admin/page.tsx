'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Search, LogOut, Users, Calendar, TrendingUp, Clock, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllBookings, getBookingStats, cancelBooking, deleteBooking, approveBookingChange, rejectBookingChange } from '@/lib/bookings';
import { logBookingCancelled, logBookingDeleted } from '@/lib/auditLog';
import { Booking } from '@/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export default function AdminPage() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [showApprovalRequests, setShowApprovalRequests] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCleanupImage, setSelectedCleanupImage] = useState<string | null>(null);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    const allBookings = await getAllBookings();
    const bookingStats = await getBookingStats();
    setBookings(allBookings as Booking[]);
    setFilteredBookings(allBookings as Booking[]);
    setStats(bookingStats);
    setIsLoading(false);
  };

  const changeRequests = bookings.filter(b => b.approvalStatus === 'change_requested');
  const pendingBookings = bookings.filter(b => b.approvalStatus === 'pending');
  const allApprovalRequests = [...changeRequests, ...pendingBookings];

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return isSameDay(bookingDate, date) && booking.status === 'booked';
    });
  };

  const getSlotAvailability = (date: Date, slot: string) => {
    const dayBookings = getBookingsForDate(date);
    const slotBookings = dayBookings.filter(b => b.slot === slot);
    return slotBookings.length === 0;
  };

  const timeSlots = ['08_00', '10_00', '12_00', '14_00', '16_00', '18_00', '20_00'];
  const slotLabels = {
    '08_00': '08:00-10:00',
    '10_00': '10:00-12:00',
    '12_00': '14:00-16:00',
    '14_00': '14:00-16:00',
    '16_00': '16:00-18:00',
    '18_00': '18:00-20:00',
    '20_00': '20:00-22:00'
  };

  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        b =>
          b.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.employeeDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    if (filterDate === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(b => b.bookingDate === today);
    } else if (filterDate === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      filtered = filtered.filter(b => b.bookingDate === tomorrowStr);
    } else if (filterDate === 'thisWeek') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(b => new Date(b.bookingDate) >= oneWeekAgo);
    } else if (filterDate === 'thisMonth') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      filtered = filtered.filter(b => b.bookingDate.startsWith(currentMonth));
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, filterStatus, filterDate]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm(t('common.confirm'))) {
      await cancelBooking(bookingId);
      await logBookingCancelled(user!.id, user!.fullName, bookingId);
      loadData();
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (confirm(t('common.confirm'))) {
      await deleteBooking(bookingId);
      await logBookingDeleted(user!.id, user!.fullName, bookingId);
      loadData();
    }
  };

  const handleApproveChange = async (bookingId: string) => {
    if (confirm('Approve this booking change request?')) {
      try {
        await approveBookingChange(bookingId);
        loadData();
      } catch (error) {
        alert('Failed to approve change request');
      }
    }
  };

  const handleRejectChange = async (bookingId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await rejectBookingChange(bookingId, reason);
        loadData();
      } catch (error) {
        alert('Failed to reject change request');
      }
    }
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

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'change_requested': return 'destructive';
      case 'rejected': return 'destructive';
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <img src="/logo/logo.jpeg" alt="Park BBQ Kitchen Logo" className="h-8 sm:h-12 w-auto" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">{t('common.appName')}</h1>
                <p className="text-xs sm:text-sm text-gray-600">{t('admin.adminDashboard')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <img 
                src="/storyset/Camping-bro.svg" 
                alt="BBQ Illustration" 
                className="h-12 w-auto hidden sm:block"
              />
              <LanguageSelector />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </div>
          </div>
          <nav className="flex space-x-1 sm:space-x-4 border-t pt-4">
            <Button variant={pathname === '/admin' ? 'default' : 'ghost'} onClick={() => router.push('/admin')}>
              {t('admin.dashboard')}
            </Button>
            <Button variant={pathname === '/admin/reports' ? 'default' : 'ghost'} onClick={() => router.push('/admin/reports')}>
              {t('admin.reports')}
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('admin.adminDashboard')}</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.todayBookings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.tomorrowBookings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.tomorrow || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.monthlyBookings')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.monthly || 0}</div>
              <p className="text-xs text-muted-foreground">{t('admin.bookings')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.totalEmployees')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">{t('admin.employees')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.pendingApprovals')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{allApprovalRequests.length}</div>
              <p className="text-xs text-muted-foreground">{t('admin.requests')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.totalGuests')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{bookings.reduce((sum, b) => sum + b.pax, 0)}</div>
              <p className="text-xs text-muted-foreground">{t('admin.guests')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.kitchenUtilization')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {(() => {
                  const totalSlots = 7;
                  const uniqueDates = new Set(bookings.map(b => b.bookingDate));
                  const totalPossibleSlots = uniqueDates.size * totalSlots;
                  if (totalPossibleSlots === 0) return '0%';
                  return Math.round((bookings.length / totalPossibleSlots) * 100) + '%';
                })()}
              </div>
              <p className="text-xs text-muted-foreground">{t('admin.utilization')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.activeDepartments')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{new Set(bookings.map(b => b.employeeDepartment)).size}</div>
              <p className="text-xs text-muted-foreground">{t('admin.departments')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.booked')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.booked || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.completed')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.completed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{t('admin.cancelled')}</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stats?.cancelled || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Requests Section */}
        {allApprovalRequests.length > 0 && (
          <Card className="mb-6 sm:mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center text-lg sm:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Pending Approval Requests ({allApprovalRequests.length})
              </CardTitle>
              <CardDescription className="text-orange-700 text-sm">
                {pendingBookings.length} new bookings and {changeRequests.length} change requests need your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{booking.employeeName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{booking.employeeDepartment}</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                        New Booking
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">{format(new Date(booking.bookingDate), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <p className="font-medium">{booking.slot}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
                      <div>
                        <span className="text-gray-500">Guests:</span>
                        <p className="font-medium">{booking.pax}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Contact:</span>
                        <p className="font-medium">{booking.contactNumber || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveChange(booking.id)}
                        className="bg-green-600 text-white hover:bg-green-700 text-xs sm:text-sm"
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectChange(booking.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {changeRequests.map((booking) => (
                  <div key={booking.id} className="bg-white p-3 sm:p-4 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{booking.employeeName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{booking.employeeDepartment}</p>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                        Change Requested
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-2 sm:mb-3">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <p className="font-medium">{format(new Date(booking.bookingDate), 'MMM d, yyyy')} at {booking.slot}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <p className="font-medium text-orange-700">
                          {booking.requestedDate && format(new Date(booking.requestedDate), 'MMM d, yyyy')} at {booking.requestedSlot}
                        </p>
                      </div>
                    </div>
                    {booking.changeRequestReason && (
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        <span className="font-medium">Reason:</span> {booking.changeRequestReason}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveChange(booking.id)}
                        className="bg-green-600 text-white hover:bg-green-700 text-xs sm:text-sm"
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectChange(booking.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        ✗ Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <CardTitle className="text-lg sm:text-xl">Booking Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-base sm:text-lg font-medium min-w-[120px] sm:min-w-[150px] text-center">
                  {format(currentMonth, 'MMM yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-sm">
              View upcoming bookings by date and time slot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[500px] sm:min-w-[600px]">
                {/* Calendar Header */}
                <div className="grid grid-cols-8 gap-1 sm:gap-2 mb-2 sm:mb-4">
                  <div></div>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="space-y-1 sm:space-y-2">
                  {Array.from({ length: 6 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-8 gap-1 sm:gap-2">
                      <div className="text-xs text-gray-500 flex items-center justify-center">
                        {weekIndex + 1}
                      </div>
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                        const dayIndexGlobal = weekIndex * 7 + dayIndex;
                        const day = calendarDays[dayIndexGlobal];
                        if (!day) return <div key={dayIndex} className="h-16 sm:h-24"></div>;
                        
                        const dayBookings = getBookingsForDate(day);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        
                        return (
                          <div
                            key={dayIndex}
                            className={`h-16 sm:h-24 border rounded-lg p-1 sm:p-2 ${
                              !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                            }`}
                          >
                            <div className="text-xs font-semibold mb-1">
                              {format(day, 'd')}
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                              {dayBookings.slice(0, 2).map(booking => (
                                <div
                                  key={booking.id}
                                  className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate"
                                  title={`${booking.employeeName} - ${booking.slot}`}
                                >
                                  {booking.employeeName}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <div className="text-[10px] sm:text-xs text-gray-500">
                                  +{dayBookings.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{t('dashboard.bookingHistory')}</CardTitle>
            <CardDescription className="text-sm">{t('dashboard.bookingHistory')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm">
                <option value="all">{t('status.booked')}</option>
                <option value="booked">{t('status.booked')}</option>
                <option value="completed">{t('status.completed')}</option>
                <option value="cancelled">{t('status.cancelled')}</option>
                <option value="no_show">{t('status.noShow')}</option>
              </Select>
              <Select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-sm">
                <option value="all">{t('calendar.thisMonth')}</option>
                <option value="today">{t('calendar.today')}</option>
                <option value="tomorrow">{t('calendar.tomorrow')}</option>
                <option value="thisWeek">{t('calendar.thisWeek')}</option>
                <option value="thisMonth">{t('calendar.thisMonth')}</option>
              </Select>
            </div>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">{t('dashboard.noBookings')}</div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">{t('booking.bookingDate')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">{t('booking.bookingTime')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">{t('employee.name')}</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('employee.department')}</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('booking.numberOfGuests')}</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('booking.contactNumber')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">Booking Code</TableHead>
                    <TableHead className="text-xs sm:text-sm">Password</TableHead>
                    <TableHead className="text-xs sm:text-sm">Cleanup Photo</TableHead>
                    <TableHead className="text-xs sm:text-sm">Signature</TableHead>
                    <TableHead className="text-xs sm:text-sm">{t('status.booked')}</TableHead>
                    <TableHead className="text-xs sm:text-sm">Approval</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">{t('common.edit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.approvalStatus === 'change_requested' && booking.requestedDate ? (
                          <div>
                            <div className="line-through text-gray-400">{booking.bookingDate}</div>
                            <div className="text-orange-600 font-medium">{format(new Date(booking.requestedDate), 'MMM d, yyyy')}</div>
                          </div>
) : (
                          booking.bookingDate
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.approvalStatus === 'change_requested' && booking.requestedSlot ? (
                          <div>
                            <div className="line-through text-gray-400">{booking.slot}</div>
                            <div className="text-orange-600 font-medium">{booking.requestedSlot}</div>
                          </div>
) : (
                          booking.slot
                        )}
                      </TableCell>
                      <TableCell>{booking.employeeName}</TableCell>
                      <TableCell>{booking.employeeDepartment}</TableCell>
                      <TableCell>{booking.pax}</TableCell>
                      <TableCell>{booking.contactNumber || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{booking.bookingNumber || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{booking.bookingPassword || 'N/A'}</TableCell>
                      <TableCell>
                        {booking.kitchenImage ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCleanupImage(booking.kitchenImage!)}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.signature ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSignature(booking.signature!)}
                          >
                            View
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(booking.status) as any}>
                          {t(`status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getApprovalStatusColor(booking.approvalStatus) as any}>
                          {booking.approvalStatus ? booking.approvalStatus.replace('_', ' ').charAt(0).toUpperCase() + booking.approvalStatus.replace('_', ' ').slice(1) : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.approvalStatus === 'change_requested' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveChange(booking.id)}
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                              >
                                ✓
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectChange(booking.id)}
                                className="bg-red-50 text-red-700 hover:bg-red-100"
                              >
                                ✗
                              </Button>
                            </>
                          )}
                          {booking.status === 'booked' && booking.approvalStatus === 'approved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Cleanup Image Modal */}
      {selectedCleanupImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCleanupImage(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Cleanup Photo</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedCleanupImage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <img src={selectedCleanupImage} alt="Cleanup photo" className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {selectedSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSignature(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Signature</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedSignature(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <img src={selectedSignature} alt="Signature" className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
