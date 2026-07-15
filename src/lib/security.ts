export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function validateEmployeeId(employeeId: string): boolean {
  const regex = /^EMP\d{3,}$/i;
  return regex.test(employeeId);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

export function validateGuestCount(count: number): boolean {
  return count >= 1 && count <= 50;
}

export function validateSlot(slot: string): boolean {
  const validSlots = [
    '08:00–10:00',
    '10:00–12:00',
    '12:00–14:00',
    '14:00–16:00',
    '16:00–18:00',
    '18:00–20:00',
    '20:00–22:00',
  ];
  return validSlots.includes(slot);
}

export function validateBookingDate(date: string): boolean {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  maxDate.setHours(23, 59, 59, 999);
  
  return bookingDate >= today && bookingDate <= maxDate;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
