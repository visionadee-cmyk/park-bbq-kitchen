# Park BBQ Kitchen Booking System

A comprehensive Progressive Web App (PWA) for employees to reserve the Park BBQ Kitchen.

## Features

- **Multi-language Support**: English, Dhivehi, Hindi, Tamil, Malayalam, and Bengali
- **Employee Authentication**: Secure login with Employee ID and password
- **Auto Employee Data Fetch**: Automatically retrieves employee information from database
- **Booking Management**: Create, view, edit, and cancel bookings
- **Time Slot System**: 7 time slots (08:00-22:00) with availability checking
- **Kitchen Agreement**: Mandatory agreement acceptance before booking
- **Employee Dashboard**: View upcoming, past, and cancelled bookings
- **Admin Dashboard**: Statistics, booking management, and analytics
- **Double Booking Prevention**: System prevents duplicate bookings
- **PWA Support**: Installable as a mobile app

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: Custom components (Shadcn UI style)
- **Database**: Firebase Firestore
- **Image Storage**: Cloudinary
- **Authentication**: JWT with bcrypt password hashing
- **Internationalization**: next-intl
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Calendar**: react-day-picker

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Cloudinary account created

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase and Cloudinary credentials in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   JWT_SECRET=your_jwt_secret_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Structure

### Employees Collection
```javascript
{
  id: string,
  employeeNumber: string,
  fullName: string,
  department: string,
  designation: string,
  phone: string,
  email: string,
  photo?: string,
  status: 'active' | 'inactive',
  role: 'employee' | 'admin',
  password: string (hashed),
  createdAt: Date
}
```

### Bookings Collection
```javascript
{
  id: string,
  employeeId: string,
  employeeName: string,
  employeeDepartment: string,
  bookingDate: string (YYYY-MM-DD),
  slot: string (e.g., "08:00–10:00"),
  pax: number (1-50),
  purpose: string,
  remarks?: string,
  agreement: boolean,
  status: 'booked' | 'completed' | 'cancelled' | 'no_show',
  createdAt: Date,
  updatedAt: Date
}
```

## Time Slots

- 08:00–10:00
- 10:00–12:00
- 12:00–14:00
- 14:00–16:00
- 16:00–18:00
- 18:00–20:00
- 20:00–22:00

## Booking Rules

- Maximum 50 guests per booking
- Maximum 30 days in advance booking
- Cannot book past dates
- One active booking per employee per day
- Must accept kitchen agreement before booking

## User Roles

### Employee
- Login with Employee ID and password
- Create new bookings
- View own bookings
- Cancel own bookings
- Change language

### Admin
- View all bookings
- Cancel any booking
- Delete any booking
- View booking statistics
- View analytics

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Create indexes for queries
4. Copy credentials to `.env.local`

## Future Enhancements

- QR code check-in at the kitchen
- SMS/WhatsApp reminders
- Email reminders
- Digital signature for agreement
- Kitchen photo upload after use
- Damage reporting with photos
- Cleaning checklist with supervisor approval
- Integration with company HRMS
- Mobile app (Android/iOS)
- Power BI/Grafana dashboard
- Blackout dates for maintenance
- Admin approval workflow for large bookings

## License

MIT
