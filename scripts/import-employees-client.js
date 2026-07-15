// This script can be run in the browser console or as a Next.js API route
// Import the JSON data and push to Firestore using existing Firebase config

const importEmployeesToFirestore = async () => {
  // Read the JSON file
  const response = await fetch('/Villa_Park_Employee_Users_2026-04-10_18-03.json');
  const jsonData = await response.json();
  
  console.log(`Starting import of ${jsonData.users.length} employees...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const user of jsonData.users) {
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

      // This would be called from your booking page or admin page
      // You need to add this function to your lib/employees.ts file
      await addEmployeeToFirestore(user.employeeId, employeeData);
      
      successCount++;
      console.log(`✓ Imported: ${user.fullName}`);
      
    } catch (error) {
      errorCount++;
      errors.push({ employeeId: user.employeeId, name: user.fullName, error: error.message });
      console.error(`✗ Failed: ${user.fullName} - ${error.message}`);
    }
  }

  console.log('Import Summary:', { successCount, errorCount, errors });
  
  // Download error report
  if (errors.length > 0) {
    const blob = new Blob([JSON.stringify(errors, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.json';
    a.click();
  }
};

// Add this function to src/lib/employees.ts:
/*
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function addEmployeeToFirestore(employeeId: string, employeeData: any) {
  await setDoc(doc(db, 'employees', employeeId), employeeData);
}
*/
