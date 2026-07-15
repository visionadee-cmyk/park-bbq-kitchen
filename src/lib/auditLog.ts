import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const data = {
    ...log,
    timestamp: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, 'auditLogs'), data);
  return {
    id: docRef.id,
    ...data
  };
}

export async function logLogin(userId: string, userName: string) {
  return createAuditLog({
    userId,
    userName,
    action: 'LOGIN',
    details: 'User logged in',
  });
}

export async function logLogout(userId: string, userName: string) {
  return createAuditLog({
    userId,
    userName,
    action: 'LOGOUT',
    details: 'User logged out',
  });
}

export async function logBookingCreated(userId: string, userName: string, bookingId: string) {
  return createAuditLog({
    userId,
    userName,
    action: 'BOOKING_CREATED',
    details: `Booking created: ${bookingId}`,
  });
}

export async function logBookingCancelled(userId: string, userName: string, bookingId: string) {
  return createAuditLog({
    userId,
    userName,
    action: 'BOOKING_CANCELLED',
    details: `Booking cancelled: ${bookingId}`,
  });
}

export async function logBookingDeleted(userId: string, userName: string, bookingId: string) {
  return createAuditLog({
    userId,
    userName,
    action: 'BOOKING_DELETED',
    details: `Booking deleted: ${bookingId}`,
  });
}
