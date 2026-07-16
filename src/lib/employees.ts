import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Employee } from '@/types';

export async function addEmployeeToFirestore(employeeId: string, employeeData: any) {
  await setDoc(doc(db, 'employees', employeeId), employeeData);
}

export async function getEmployeeById(employeeId: string): Promise<Employee | null> {
  const docRef = doc(db, 'employees', employeeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Employee;
  }
  
  return null;
}

export async function getAllEmployees(): Promise<Employee[]> {
  const employeesRef = collection(db, 'employees');
  const querySnapshot = await getDocs(employeesRef);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Employee));
}

export async function getEmployeesByDepartment(department: string): Promise<Employee[]> {
  const employeesRef = collection(db, 'employees');
  const q = query(employeesRef, where('department', '==', department));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Employee));
}

export async function searchEmployees(searchTerm: string): Promise<Employee[]> {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  try {
    const employeesRef = collection(db, 'employees');
    const querySnapshot = await getDocs(employeesRef);
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Employee))
      .filter(employee => 
        (employee.fullName && employee.fullName.toLowerCase().includes(searchTermLower)) ||
        (employee.employeeNumber && employee.employeeNumber.toLowerCase().includes(searchTermLower)) ||
        ((employee as any).employeeId && (employee as any).employeeId.toLowerCase().includes(searchTermLower))
      )
      .slice(0, 10); // Limit to 10 results
  } catch (error) {
    console.error('Error in searchEmployees:', error);
    return [];
  }
}
