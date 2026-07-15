'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('villaparkbbqkitchen@gmail.com');
  const [password, setPassword] = useState('Adhu1447');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting admin login with email:', email);
      
      // Temporary bypass for Firebase connectivity issues
      if (email === 'villaparkbbqkitchen@gmail.com' && password === 'Adhu1447') {
        const adminUser = {
          id: 'admin-temp',
          employeeNumber: 'admin',
          fullName: 'Admin User',
          department: 'Management',
          designation: 'System Administrator',
          phone: '+9601234567',
          email: 'villaparkbbqkitchen@gmail.com',
          role: 'admin' as const
        };
        
        login(adminUser, 'temp-token');
        router.push('/admin');
        return;
      }
      
      setError('Invalid credentials');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Login failed: ' + (err.message || 'Please check your internet connection'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img 
                src="/logo/kitchen image.jpg" 
                alt="Park BBQ Kitchen" 
                className="w-32 h-32 object-cover rounded-full mx-auto"
              />
            </div>
            <CardTitle className="text-2xl">{t('adminAuth.adminLogin')}</CardTitle>
            <CardDescription className="text-base">
              {t('adminAuth.enterAdminEmail')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">{t('employee.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('employee.email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-base"
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full py-3 text-base"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('adminAuth.adminLogin')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
