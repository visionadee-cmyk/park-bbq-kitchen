export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  department: string;
  designation: string;
  phone: string;
  email: string;
  photo?: string;
  status: 'active' | 'inactive';
  role: 'employee' | 'admin';
  password: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  bookingDate: string;
  slot: string;
  pax: number;
  purpose: string;
  remarks?: string;
  agreement: boolean;
  status: 'booked' | 'completed' | 'cancelled' | 'no_show';
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'change_requested';
  bookingNumber?: string;
  bookingPassword?: string;
  requestedDate?: string;
  requestedSlot?: string;
  changeRequestReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface Department {
  id: string;
  name: string;
  nameEn: string;
  nameDv: string;
  nameHi: string;
  nameTa: string;
  nameMl: string;
  nameBn: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: Date;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}
