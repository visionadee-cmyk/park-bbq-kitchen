'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllBookings } from '@/lib/bookings';
import { Booking } from '@/types';
import { ArrowLeft, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminReportsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
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

  const getDepartmentData = () => {
    const deptMap: Record<string, number> = {};
    bookings.forEach(b => {
      deptMap[b.employeeDepartment] = (deptMap[b.employeeDepartment] || 0) + 1;
    });
    return Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyData = () => {
    const monthMap: Record<string, number> = {};
    bookings.forEach(b => {
      const month = b.bookingDate.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));
  };

  const getKitchenUtilization = () => {
    const totalSlots = 7; // 7 time slots per day
    const uniqueDates = new Set(bookings.map(b => b.bookingDate));
    const totalPossibleSlots = uniqueDates.size * totalSlots;
    if (totalPossibleSlots === 0) return 0;
    return Math.round((bookings.length / totalPossibleSlots) * 100);
  };

  const getAverageGuests = () => {
    if (bookings.length === 0) return 0;
    const total = bookings.reduce((sum, b) => sum + b.pax, 0);
    return Math.round(total / bookings.length);
  };

  const exportToExcel = () => {
    const headers = ['Date', 'Time', 'Employee', 'Department', 'Guests', 'Contact', 'Status'];
    const rows = bookings.map(b => [
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
          <div className="flex items-center space-x-4">
            <img 
              src="/storyset/Barbecue-bro.svg" 
              alt="BBQ Illustration" 
              className="h-12 w-auto hidden sm:block"
            />
            <Button onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold mb-6">{t('admin.reports')}</h2>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
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
              <CardTitle className="text-sm font-medium">{t('reports.mostActiveDepartment')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getDepartmentData().length > 0 ? getDepartmentData().sort((a, b) => b.value - a.value)[0].name : '-'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalEmployees')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(bookings.map(b => b.employeeId)).size}</div>
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
    </div>
  );
}
