'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSelector } from '@/components/LanguageSelector';
import { authenticateEmployee } from '@/lib/auth';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const t = useTranslations();
  const { login } = useAuth();
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authenticateEmployee(employeeId, password);
      if (result) {
        if (result.user.role !== 'admin') {
          setError('Access denied. Admin only.');
          return;
        }
        login(result.user, result.token);
        router.push('/admin');
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err) {
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <LanguageSelector />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">{t('adminAuth.adminLogin')}</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">{t('adminAuth.adminAccessOnly')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm">{t('auth.employeeId')}</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            {error && (
              <div className="text-xs sm:text-sm text-red-500 text-center">{error}</div>
            )}
            <Button type="submit" className="w-full py-3 sm:py-2 text-base" disabled={isLoading}>
              {isLoading ? t('common.loading') : t('auth.login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
