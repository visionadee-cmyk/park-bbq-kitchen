const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Read service account key
const serviceAccountPath = './serivceaccoutnkey.json';
let serviceAccount;

try {
  const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(serviceAccountFile);
  console.log('Service account loaded successfully');
} catch (error) {
  console.error('Error reading service account key:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin
try {
  console.log('Initializing Firebase Admin...');
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'park-bbq-kitchen'
  });

  const db = app.firestore();

  async function createAdmin() {
    const employeeId = 'villa-park_13011'; // MOHAMED SHAREEF
    const email = 'villaparkbbqkitchen@gmail.com';
    const password = 'Adhu1447';

    console.log('Updating employee to admin role...');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the employee
    const snapshot = await db.collection('employees').where('employeeNumber', '==', employeeId).get();

    if (snapshot.empty) {
      console.log('Employee not found');
      process.exit(1);
    }

    const employeeDoc = snapshot.docs[0];
    console.log('Found employee:', employeeDoc.data().fullName);
    
    // Update to admin
    await db.collection('employees').doc(employeeDoc.id).update({
      password: hashedPassword,
      email: email,
      role: 'admin',
      status: 'active',
      updatedAt: new Date().toISOString()
    });

    console.log('Employee updated to admin successfully');
    console.log('\nAdmin Credentials:');
    console.log('Employee ID:', employeeId);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nUse these credentials to login at: http://localhost:3000/en/admin/login');
  }

  createAdmin().then(() => process.exit(0)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
