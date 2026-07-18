'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { LanguageSelector } from '@/components/LanguageSelector';
import Footer from '@/components/Footer';
import { getAllBookings } from '@/lib/bookings';
import { Booking } from '@/types';
import { ArrowLeft, Download, Filter, FileText, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminReportsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadBookings();
  }, [user, router]);

  useEffect(() => {
    let filtered = bookings;

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(b => b.employeeDepartment === filterDepartment);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    if (filterMonth !== 'all') {
      filtered = filtered.filter(b => b.bookingDate.startsWith(filterMonth));
    }

    if (filterYear !== 'all') {
      filtered = filtered.filter(b => b.bookingDate.startsWith(filterYear));
    }

    setFilteredBookings(filtered);
  }, [bookings, filterDepartment, filterStatus, filterMonth, filterYear]);

  const loadBookings = async () => {
    const allBookings = await getAllBookings();
    setBookings(allBookings as Booking[]);
    setFilteredBookings(allBookings as Booking[]);
    setIsLoading(false);
  };

  const getDepartmentData = () => {
    const deptMap: Record<string, number> = {};
    filteredBookings.forEach(b => {
      deptMap[b.employeeDepartment] = (deptMap[b.employeeDepartment] || 0) + 1;
    });
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyData = () => {
    const monthMap: Record<string, number> = {};
    filteredBookings.forEach(b => {
      const month = b.bookingDate.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));
  };

  const getKitchenUtilization = () => {
    const totalSlots = 7;
    const uniqueDates = new Set(filteredBookings.map(b => b.bookingDate));
    const totalPossibleSlots = uniqueDates.size * totalSlots;
    if (totalPossibleSlots === 0) return 0;
    return Math.round((filteredBookings.length / totalPossibleSlots) * 100);
  };

  const getAverageGuests = () => {
    if (filteredBookings.length === 0) return 0;
    const total = filteredBookings.reduce((sum, b) => sum + b.pax, 0);
    return Math.round(total / filteredBookings.length);
  };

  const getDepartments = () => {
    const departments = new Set(bookings.map(b => b.employeeDepartment));
    return Array.from(departments).sort();
  };

  const getMonths = () => {
    const months = new Set(bookings.map(b => b.bookingDate.slice(0, 7)));
    return Array.from(months).sort().reverse();
  };

  const getYears = () => {
    const years = new Set(bookings.map(b => b.bookingDate.slice(0, 4)));
    return Array.from(years).sort().reverse();
  };

  const exportToExcel = () => {
    const headers = ['Date', 'Time', 'Employee', 'Department', 'Guests', 'Contact', 'Status'];
    const rows = filteredBookings.map(b => [
      b.bookingDate,
      b.slot,
      b.employeeName,
      b.employeeDepartment,
      b.pax,
      b.contactNumber || 'N/A',
      b.status,
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
  };

  const exportToPDF = () => {
    // Simple text-based PDF export
    const content = filteredBookings.map(b => 
      `Date: ${b.bookingDate}\nTime: ${b.slot}\nEmployee: ${b.employeeName}\nDepartment: ${b.employeeDepartment}\nGuests: ${b.pax}\nContact: ${b.contactNumber || 'N/A'}\nStatus: ${b.status}\n-------------------`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.txt';
    a.click();
  };

  const resetFilters = () => {
    setFilterDepartment('all');
    setFilterStatus('all');
    setFilterMonth('all');
    setFilterYear('all');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
                src="/storyset/Barbecue-bro.svg" 
                alt="BBQ Illustration" 
                className="h-12 w-auto hidden sm:block"
              />
              <LanguageSelector />
            </div>
          </div>
          <nav className="flex space-x-1 sm:space-x-4 border-t pt-4">
            <Button variant={pathname === '/admin' ? 'default' : 'ghost'} onClick={() => router.push('/admin')}>
              {t('admin.dashboard')}
            </Button>
            <Button variant={pathname === '/admin/reports' ? 'default' : 'ghost'} onClick={() => router.push('/admin/reports')}>
              {t('admin.reports')}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/user-manual')}>
              User Manual
            </Button>
            <Button variant="ghost" onClick={() => router.push('/faq')}>
              FAQ
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">{t('admin.reports')}</h2>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              {t('reports.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>{t('reports.department')}</Label>
                <Select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                  <option value="all">{t('reports.allDepartments')}</option>
                  {getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t('reports.status')}</Label>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">{t('reports.allStatuses')}</option>
                  <option value="booked">{t('status.booked')}</option>
                  <option value="completed">{t('status.completed')}</option>
                  <option value="cancelled">{t('status.cancelled')}</option>
                  <option value="no_show">{t('status.noShow')}</option>
                </Select>
              </div>
              <div>
                <Label>{t('reports.month')}</Label>
                <Select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                  <option value="all">{t('reports.allMonths')}</option>
                  {getMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t('reports.year')}</Label>
                <Select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                  <option value="all">{t('reports.allYears')}</option>
                  {getYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={resetFilters} variant="outline">
                {t('reports.resetFilters')}
              </Button>
              <Button onClick={exportToExcel} variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {t('reports.exportExcel')}
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                {t('reports.exportPDF')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalBookings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.averageGuests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageGuests()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.kitchenUtilization')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getKitchenUtilization()}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalDepartments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(filteredBookings.map(b => b.employeeDepartment)).size}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.bookingsByDepartment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getDepartmentData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getDepartmentData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.monthlyReport')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
