'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addEmployeeToFirestore } from '@/lib/employees';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export default function ImportEmployeesPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [errors, setErrors] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleImport = async () => {
    if (!confirm('This will import 885 employees to Firestore. Continue?')) {
      return;
    }

    setIsImporting(true);
    setErrors([]);
    setCompleted(false);

    try {
      // Fetch the JSON file
      const response = await fetch('/Villa_Park_Employee_Users_2026-04-10_18-03.json');
      const jsonData = await response.json();

      setProgress({ current: 0, total: jsonData.users.length, success: 0, failed: 0 });

      let successCount = 0;
      let failedCount = 0;
      const importErrors: any[] = [];

      for (let i = 0; i < jsonData.users.length; i++) {
        const user = jsonData.users[i];
        
        try {
          const employeeData = {
            employeeNumber: user.employeeId,
            fullName: user.fullName,
            department: user.department,
            designation: user.designation,
            phone: user.phone || '',
            email: user.email || '',
            photo: user.photo || '',
            status: 'active',
            role: user.role === 'admin' ? 'admin' : 'employee',
            password: user.password || 'VillaPark2024',
            createdAt: new Date()
          };

          await addEmployeeToFirestore(user.employeeId, employeeData);
          successCount++;
          
        } catch (error: any) {
          failedCount++;
          importErrors.push({
            employeeId: user.employeeId,
            name: user.fullName,
            error: error.message
          });
        }

        // Update progress every 10 employees
        if (i % 10 === 0) {
          setProgress({ current: i + 1, total: jsonData.users.length, success: successCount, failed: failedCount });
        }
      }

      setProgress({ current: jsonData.users.length, total: jsonData.users.length, success: successCount, failed: failedCount });
      setErrors(importErrors);
      setCompleted(true);

    } catch (error: any) {
      console.error('Import failed:', error);
      alert('Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrors = () => {
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')} {t('admin.adminDashboard')}
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">{t('admin.manageEmployees')}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Import Employees from JSON</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Import 885 employees from Villa_Park_Employee_Users_2026-04-10_18-03.json to Firestore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!isImporting && !completed && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Before Importing</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Ensure the JSON file is in the public folder</li>
                      <li>Each employee will get a default password: VillaPark2024</li>
                      <li>Employees with role 'admin' will be set as admin users</li>
                      <li>This will create/update 885 employee records</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleImport} 
                    className="w-full py-3 text-base"
                    disabled={isImporting}
                  >
                    Start Import
                  </Button>
                </div>
              )}

              {isImporting && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Importing employees...</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {progress.current} / {progress.total}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{progress.success}</div>
                      <div className="text-sm text-green-700">Success</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>
                </div>
              )}

              {completed && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">Import Completed!</h3>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{progress.success}</div>
                        <div className="text-sm text-green-700">Successfully imported</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                        <div className="text-sm text-red-700">Failed</div>
                      </div>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="space-y-2">
                      <Button onClick={downloadErrors} variant="outline" className="w-full">
                        Download Error Report
                      </Button>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                        <h4 className="font-semibold text-red-900 mb-2">Failed Imports ({errors.length})</h4>
                        <ul className="text-xs text-red-800 space-y-1">
                          {errors.slice(0, 20).map((err, index) => (
                            <li key={index}>
                              {err.name} ({err.employeeId}): {err.error}
                            </li>
                          ))}
                          {errors.length > 20 && (
                            <li className="font-semibold">... and {errors.length - 20} more</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={() => router.push('/admin')} 
                    className="w-full"
                  >
                    Return to Admin Dashboard
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
