import { db } from './firebase';
import { collection, doc, getDoc, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export async function getBlockedDates() {
  const blockedDatesRef = collection(db, 'blockedDates');
  const q = query(blockedDatesRef, orderBy('date', 'asc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function isDateBlocked(date: string): Promise<boolean> {
  const blockedDatesRef = collection(db, 'blockedDates');
  const q = query(blockedDatesRef, where('date', '==', date));
  const querySnapshot = await getDocs(q);
  
  return !querySnapshot.empty;
}

export async function blockDate(date: string, reason: string, createdBy: string) {
  const data = {
    date,
    reason,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  
  const docRef = await addDoc(collection(db, 'blockedDates'), data);
  return {
    id: docRef.id,
    ...data
  };
}

export async function unblockDate(blockedDateId: string) {
  await deleteDoc(doc(db, 'blockedDates', blockedDateId));
}

export async function updateBlockedDate(blockedDateId: string, data: Partial<BlockedDate>) {
  const blockedDateRef = doc(db, 'blockedDates', blockedDateId);
  await updateDoc(blockedDateRef, data);
  
  const updatedDoc = await getDoc(blockedDateRef);
  return {
    id: updatedDoc.id,
    ...updatedDoc.data()
  };
}
