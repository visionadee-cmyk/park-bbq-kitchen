const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serivceaccoutnkey.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

// Read the JSON file
const jsonPath = path.join(__dirname, '../Villa_Park_Employee_Users_2026-04-10_18-03.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function importEmployees() {
  console.log(`Starting import of ${jsonData.users.length} employees...`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const user of jsonData.users) {
    try {
      // Generate a default password if not present
      const defaultPassword = user.password || 'VillaPark2024';
      
      // Extract employee code from employeeId
      const employeeCode = user.employeeCode || user.employeeId.replace('villa-park_', '');
      
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
        password: defaultPassword,
        createdAt: new Date()
      };

      // Use employeeId as document ID
      await db.collection('employees').doc(user.employeeId).set(employeeData);
      
      successCount++;
      console.log(`✓ Imported: ${user.fullName} (${user.employeeId})`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error) {
      errorCount++;
      errors.push({ employeeId: user.employeeId, name: user.fullName, error: error.message });
      console.error(`✗ Failed: ${user.fullName} (${user.employeeId}) - ${error.message}`);
    }
  }

  console.log('\n=== Import Summary ===');
  console.log(`Total employees: ${jsonData.users.length}`);
  console.log(`Successfully imported: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n=== Errors ===');
    errors.forEach(err => {
      console.log(`${err.name} (${err.employeeId}): ${err.error}`);
    });
    
    // Save errors to file
    fs.writeFileSync(
      path.join(__dirname, '../import-errors.json'),
      JSON.stringify(errors, null, 2)
    );
    console.log('\nErrors saved to import-errors.json');
  }
}

importEmployees()
  .then(() => {
    console.log('\nImport completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error during import:', error);
    process.exit(1);
  });
