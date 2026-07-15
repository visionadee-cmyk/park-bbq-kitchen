import { db } from './firebase';
import { collection, doc, getDoc, query, where, getDocs, setDoc, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logLogin, logLogout } from './auditLog';
import { sanitizeInput, validateEmployeeId, validatePassword } from './security';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  employeeNumber: string;
  fullName: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  photo?: string;
  role: 'employee' | 'admin';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      employeeNumber: user.employeeNumber,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getEmployeeByEmployeeNumber(employeeNumber: string) {
  const employeesRef = collection(db, 'employees');
  const q = query(employeesRef, where('employeeNumber', '==', employeeNumber));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

export async function getEmployeeByEmail(email: string) {
  const employeesRef = collection(db, 'employees');
  const q = query(employeesRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  };
}

export async function authenticateEmployee(employeeNumber: string, password: string) {
  const sanitizedEmployeeNumber = sanitizeInput(employeeNumber);
  
  if (!validateEmployeeId(sanitizedEmployeeNumber)) {
    return null;
  }
  
  if (!validatePassword(password)) {
    return null;
  }
  
  const employee = await getEmployeeByEmployeeNumber(sanitizedEmployeeNumber);
  
  if (!employee) {
    return null;
  }
  
  const isValid = await verifyPassword(password, (employee as any).password);
  
  if (!isValid) {
    return null;
  }
  
  if ((employee as any).status !== 'active') {
    return null;
  }
  
  const authUser: AuthUser = {
    id: employee.id,
    employeeNumber: (employee as any).employeeNumber,
    fullName: (employee as any).fullName,
    department: (employee as any).department,
    designation: (employee as any).designation,
    phone: (employee as any).phone,
    email: (employee as any).email,
    photo: (employee as any).photo,
    role: (employee as any).role,
  };
  
  const token = generateToken(authUser);
  
  await logLogin(authUser.id, authUser.fullName);
  
  return { user: authUser, token };
}

export async function authenticateAdminByEmail(email: string, password: string) {
  const sanitizedEmail = sanitizeInput(email);
  
  if (!validatePassword(password)) {
    return null;
  }
  
  const employee = await getEmployeeByEmail(sanitizedEmail);
  
  if (!employee) {
    return null;
  }
  
  const isValid = await verifyPassword(password, (employee as any).password);
  
  if (!isValid) {
    return null;
  }
  
  if ((employee as any).status !== 'active') {
    return null;
  }
  
  if ((employee as any).role !== 'admin') {
    return null;
  }
  
  const authUser: AuthUser = {
    id: employee.id,
    employeeNumber: (employee as any).employeeNumber,
    fullName: (employee as any).fullName,
    department: (employee as any).department,
    designation: (employee as any).designation,
    phone: (employee as any).phone,
    email: (employee as any).email,
    photo: (employee as any).photo,
    role: (employee as any).role,
  };
  
  const token = generateToken(authUser);
  
  await logLogin(authUser.id, authUser.fullName);
  
  return { user: authUser, token };
}

export async function createEmployee(data: any) {
  const hashedPassword = await hashPassword(data.password);
  
  const employeeData = {
    ...data,
    password: hashedPassword,
    status: 'active',
    role: data.role || 'employee',
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, 'employees'), employeeData);
  return {
    id: docRef.id,
    ...employeeData
  };
}
