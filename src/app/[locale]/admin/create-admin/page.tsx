'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { doc, updateDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export default function CreateAdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('villa-park_13011');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Adhu1447');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Looking for employee with ID:', employeeId);
      
      // Check if employee exists with this ID
      const employeeRef = doc(db, 'employees', employeeId);
      const employeeDoc = await getDoc(employeeRef);

      console.log('Employee exists:', employeeDoc.exists());

      if (!employeeDoc.exists()) {
        // Try to find employee by querying
        console.log('Employee not found by ID, trying to query...');
        const employeesRef = collection(db, 'employees');
        const q = query(employeesRef, where('employeeNumber', '==', employeeId));
        const querySnapshot = await getDocs(q);
        console.log('Query results:', querySnapshot.size);
        
        if (querySnapshot.empty) {
          setError('Employee not found with this ID. Please use a valid employee ID from your list.');
          setLoading(false);
          return;
        }
        
        // Use the found employee
        const foundDoc = querySnapshot.docs[0];
        console.log('Found employee:', foundDoc.id);
      }

      const employeeData = employeeDoc.exists() ? employeeDoc.data() : null;
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed');

      // Update employee to admin
      const updateData: any = {
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      // Add email if provided
      if (email) {
        updateData.email = email;
      }

      console.log('Updating employee with data:', updateData);
      await updateDoc(employeeRef, updateData);
      console.log('Employee updated successfully');

      setSuccess('Employee updated to admin successfully!');
      console.log('Admin Credentials:');
      console.log('Employee ID:', employeeId);
      console.log('Password:', password);
      console.log('Email:', email || employeeData?.email || 'No email set');
      console.log('Employee Name:', employeeData?.fullName || 'Unknown');
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to update employee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-center">
        <div className="w-full md:w-1/2 flex justify-center">
          <img 
            src="/storyset/Barbecue-bro.svg" 
            alt="BBQ Illustration" 
            className="w-full max-w-md h-auto"
          />
        </div>
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')} {t('admin.adminDashboard')}
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('adminAuth.adminLogin')}</CardTitle>
              <CardDescription>
                {t('admin.manageEmployees')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">{t('auth.employeeId')}</Label>
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g., villa-park_13011"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Use an existing employee ID from your list
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('employee.email')} ({t('common.loading')})</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g., admin@example.com"
                  />
                  <p className="text-xs text-gray-500">
                    {t('bookingForm.department')} {t('employee.email')} {t('auth.employeeId')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-500">{error}</div>
                )}
                {success && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                    {success}
                    <div className="mt-2">
                      <strong>{t('adminAuth.adminLogin')}:</strong><br />
                      {t('auth.employeeId')}: {employeeId}<br />
                      {t('auth.password')}: {password}<br />
                      {email && <>{t('employee.email')}: {email}<br /></>}
                    </div>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('admin.manageEmployees')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
