import { db } from './firebase';
import { collection, doc, getDoc, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { Booking } from '@/types';
import { logBookingCreated } from './auditLog';
import { validateBookingDate, validateGuestCount, validateSlot, sanitizeInput } from './security';

// Generate unique booking number
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK${timestamp}${random}`;
}

// Generate random password for booking
function generateBookingPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const TIME_SLOTS = [
  '09:00–11:00',
  '11:00–13:00',
  '13:00–15:00',
  '15:00–17:00',
  '17:00–19:00',
  '19:00–21:00',
  '21:00–23:00',
];

export async function getBookingsByDate(date: string) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('bookingDate', '==', date));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));
}

export async function getBookingsByEmployee(employeeId: string) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('employeeId', '==', employeeId), orderBy('bookingDate', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  const bookings = await getBookingsByDate(date);
  const bookedSlots = bookings.map(b => b.slot);
  
  // Also include slots that have pending change requests
  const requestedSlots = bookings
    .filter(b => b.requestedSlot && (b.approvalStatus === 'change_requested' || b.approvalStatus === 'pending'))
    .map(b => b.requestedSlot);
  
  const unavailableSlots = [...bookedSlots, ...requestedSlots];
  
  return TIME_SLOTS.filter(slot => !unavailableSlots.includes(slot));
}

export async function createBooking(bookingData: Partial<Booking>) {
  const sanitizedRemarks = sanitizeInput(bookingData.remarks || '');
  
  if (!validateBookingDate(bookingData.bookingDate!)) {
    throw new Error('invalid_date');
  }
  
  if (!validateGuestCount(bookingData.pax!)) {
    throw new Error('invalid_guest_count');
  }
  
  if (!validateSlot(bookingData.slot!)) {
    throw new Error('invalid_slot');
  }
  
  const bookings = await getBookingsByDate(bookingData.bookingDate!);
  const hasExistingBooking = bookings.some(
    b => (b as any).employeeId === bookingData.employeeId && (b as any).status === 'booked'
  );
  
  if (hasExistingBooking) {
    throw new Error('already_booked');
  }
  
  const availableSlots = await getAvailableSlots(bookingData.bookingDate!);
  if (!availableSlots.includes(bookingData.slot!)) {
    throw new Error('slot_unavailable');
  }
  
  const bookingNumber = generateBookingNumber();
  const bookingPassword = generateBookingPassword();
  
  const data = {
    ...bookingData,
    remarks: sanitizedRemarks,
    status: 'booked',
    approvalStatus: 'pending', // New bookings require admin approval
    bookingNumber,
    bookingPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, 'bookings'), data);
  
  await logBookingCreated(bookingData.employeeId!, bookingData.employeeName!, docRef.id);
  
  return {
    id: docRef.id,
    ...data,
    bookingNumber,
    bookingPassword,
  };
}

export async function updateBooking(bookingId: string, data: Partial<Booking>) {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
  
  const updatedDoc = await getDoc(bookingRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  };
}

export async function cancelBooking(bookingId: string) {
  return updateBooking(bookingId, { status: 'cancelled' });
}

export async function deleteBooking(bookingId: string) {
  await deleteDoc(doc(db, 'bookings', bookingId));
}

export async function requestBookingChange(bookingId: string, requestedDate: string, requestedSlot: string, reason: string) {
  // Check if the requested date/slot is already booked or has a pending change request
  const existingBookings = await getBookingsByDate(requestedDate);
  
  const hasConflict = existingBookings.some(booking => {
    // Skip the current booking being changed
    if (booking.id === bookingId) return false;
    
    // Check if slot is already booked
    if (booking.slot === requestedSlot && booking.status === 'booked') return true;
    
    // Check if there's a pending change request for this slot
    if (booking.requestedSlot === requestedSlot && 
        (booking.approvalStatus === 'change_requested' || booking.approvalStatus === 'pending')) return true;
    
    return false;
  });
  
  if (hasConflict) {
    throw new Error('slot_unavailable');
  }
  
  return updateBooking(bookingId, {
    approvalStatus: 'change_requested',
    requestedDate,
    requestedSlot,
    changeRequestReason: reason,
  });
}

export async function approveBookingChange(bookingId: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingDoc = await getDoc(bookingRef);
  
  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }
  
  const booking = bookingDoc.data() as any;
  
  if (booking.approvalStatus === 'change_requested') {
    // Handle change request approval
    await updateDoc(bookingRef, {
      bookingDate: booking.requestedDate,
      slot: booking.requestedSlot,
      approvalStatus: 'approved',
      requestedDate: undefined,
      requestedSlot: undefined,
      changeRequestReason: undefined,
      updatedAt: new Date().toISOString(),
    });
  } else if (booking.approvalStatus === 'pending') {
    // Handle new booking approval
    await updateDoc(bookingRef, {
      approvalStatus: 'approved',
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function rejectBookingChange(bookingId: string, rejectionReason: string) {
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingDoc = await getDoc(bookingRef);
  
  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }
  
  const booking = bookingDoc.data() as any;
  
  if (booking.approvalStatus === 'change_requested') {
    // Handle change request rejection
    await updateDoc(bookingRef, {
      approvalStatus: 'approved',
      requestedDate: undefined,
      requestedSlot: undefined,
      changeRequestReason: rejectionReason,
      updatedAt: new Date().toISOString(),
    });
  } else if (booking.approvalStatus === 'pending') {
    // Handle new booking rejection
    await updateDoc(bookingRef, {
      approvalStatus: 'rejected',
      status: 'cancelled',
      changeRequestReason: rejectionReason,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function getAllBookings() {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, orderBy('bookingDate', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Booking));
}

export async function getTodayBookings() {
  const today = new Date().toISOString().split('T')[0];
  return getBookingsByDate(today);
}

export async function getTomorrowBookings() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  return getBookingsByDate(tomorrowStr);
}

export async function getBookingStats() {
  const allBookings = await getAllBookings();
  
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const todayBookings = allBookings.filter(b => b.bookingDate === today);
  const tomorrowBookings = allBookings.filter(b => b.bookingDate === tomorrowStr);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyBookings = allBookings.filter(b => b.bookingDate.startsWith(currentMonth));
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyBookings = allBookings.filter(b => new Date(b.bookingDate) >= oneWeekAgo);
  
  return {
    today: todayBookings.length,
    tomorrow: tomorrowBookings.length,
    monthly: monthlyBookings.length,
    weekly: weeklyBookings.length,
    total: allBookings.length,
    cancelled: allBookings.filter(b => b.status === 'cancelled').length,
    completed: allBookings.filter(b => b.status === 'completed').length,
    booked: allBookings.filter(b => b.status === 'booked').length,
  };
}

export async function getBookingByCredentials(bookingNumber: string, bookingPassword: string) {
  const bookingsRef = collection(db, 'bookings');
  const q = query(bookingsRef, where('bookingNumber', '==', bookingNumber));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const booking = querySnapshot.docs[0];
  const bookingData = {
    id: booking.id,
    ...booking.data()
  } as Booking;
  
  if (bookingData.bookingPassword !== bookingPassword) {
    return null;
  }
  
  return bookingData;
}
