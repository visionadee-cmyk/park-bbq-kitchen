# Park BBQ Kitchen Booking System - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Employee Guide](#employee-guide)
4. [Admin Guide](#admin-guide)
5. [FAQ](#faq)
6. [Troubleshooting](#troubleshooting)

---

## Introduction

The Park BBQ Kitchen Booking System is a web-based application that allows employees to book the Park BBQ Kitchen for events. This system provides an easy-to-use interface for booking slots, managing bookings, and ensuring proper cleanup after use.

### Key Features
- **Easy Booking**: Book kitchen slots through a simple calendar interface
- **Employee Search**: Search employees by name or employee code
- **Booking Management**: View, change, and cancel bookings using booking credentials
- **Cleanup Verification**: Complete checklist and upload photos after use
- **Admin Dashboard**: Admin can approve, reject, and manage all bookings
- **Multi-language Support**: Available in English, Dhivehi, Tamil, Malayalam, Hindi, and Bengali

---

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Valid employee credentials

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL
3. Scan the QR code below for quick access:

```
[QR CODE PLACEHOLDER - Insert QR code image here]
```

---

## Employee Guide

### 1. Home Page

**Steps:**
1. Open the application URL
2. Select your preferred language
3. Click "Book Now" to create a new booking
4. Or click "Manage Booking" to view/change your existing bookings

**Screenshot Placeholder:**
```
[SCREENSHOT: Home page with language selector, Book Now, and Manage Booking buttons]
```

### 2. Booking a Kitchen Slot

**Important Booking Restrictions:**
- **3-Day Booking Window**: You can only book for today, tomorrow, or the day after tomorrow (maximum 3 days in advance)
- **2-Hour Prior Booking**: You can only book slots that are at least 2 hours in the future
- The calendar will only show available dates within the 3-day window

**Steps:**
1. Click "Book Now" on the home page
2. Select your name from the dropdown or search by name
3. Enter your Employee Code (e.g., 13011)
4. Select the booking date from the calendar (only shows today + 2 days)
5. Choose a time slot from available slots (green = available, red = fully booked)
6. Enter number of guests (pax) - Maximum 50 guests
7. Enter your contact number
8. Add any remarks (optional)
9. Agree to the terms and conditions
10. Sign using the signature pad
11. Click "Submit Booking"
12. Save your Booking Number and Password for future reference

**Screenshot Placeholder:**
```
[SCREENSHOT: Booking form with employee search fields]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Calendar showing available dates within 3-day window]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Time slot selection dropdown]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Signature pad for digital signature]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Booking success page with booking number and password]
```

### 3. Managing Your Bookings

**Steps:**
1. Click "Manage Booking" on the home page
2. Enter your Booking Number (received after booking)
3. Enter your Booking Password (received after booking)
4. Click "Search" to find your booking
5. View your booking details including:
   - Date and time
   - Employee name and department
   - Number of guests
   - Contact number
   - Booking status
   - Approval status

**Screenshot Placeholder:**
```
[SCREENSHOT: Manage Booking page with booking number and password fields]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Booking details display]
```

### 4. Requesting Date/Time Changes

**Important:**
- Change requests are subject to the same booking restrictions (3-day window and 2-hour prior)
- You can only change to dates within the 3-day window (today + 2 days)
- You can only change to slots that are at least 2 hours in the future

**Steps:**
1. Access your booking using Manage Booking
2. Click "Request Change" button
3. Select new date from calendar (only shows today + 2 days)
4. Choose new time slot from available options
5. Enter reason for change
6. Click "Submit"
7. Wait for admin approval (status will show "Change Requested")

**Screenshot Placeholder:**
```
[SCREENSHOT: Change request form with date, slot, and reason fields]
```

### 5. Cancelling a Booking

**Steps:**
1. Access your booking using Manage Booking
2. Click "Cancel Booking" button
3. Confirm cancellation

**Screenshot Placeholder:**
```
[SCREENSHOT: Cancel booking confirmation]
```

### 6. Completing Cleanup Checklist

**Important:** You cannot make a new booking until you complete the cleanup checklist for your previous booking.

**Steps:**
1. Click "Manage Booking" on the home page
2. Enter your Booking Number and Password
3. Click "Search" to find your booking
4. Complete all checklist items:
   - ✓ Kitchen cleaned thoroughly
   - ✓ All equipment returned to proper place
   - ✓ Gas turned off completely
   - ✓ All trash disposed properly
   - ✓ All surfaces wiped down
5. Upload a photo of the cleaned kitchen
6. Click "Complete Booking"
7. Your booking status will change to "Completed"

**Screenshot Placeholder:**
```
[SCREENSHOT: Kitchen completion checklist with checkboxes]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Kitchen image upload section]
```

### 7. Booking Code and Password

After successful booking, you will receive:
- **Booking Number**: A unique code for your booking (e.g., BK123ABC456)
- **Booking Password**: A password to verify your booking

**Important:** Save these credentials securely. You need them to:
- View your booking details
- Request changes to your booking
- Cancel your booking
- Complete the cleanup checklist

**Note:** If you forget your booking code or password, contact the admin. They can view all booking credentials in the admin panel.

**Screenshot Placeholder:**
```
[SCREENSHOT: Booking confirmation with code and password displayed]
```

---

## Admin Guide

### 1. Admin Login

**Steps:**
1. Open the application URL
2. Click "Admin Login" or navigate to /login
3. Enter your Employee ID
4. Enter your password
5. Click "Login"

**Screenshot Placeholder:**
```
[SCREENSHOT: Admin login page]
```

### 2. Admin Dashboard

The admin dashboard provides:
- **Statistics**: Total bookings, utilization rate, active departments
- **Booking Status**: Count of booked, completed, and cancelled bookings
- **Recent Bookings**: List of all bookings with details
- **Approval Management**: Approve or reject booking change requests
- **Navigation**: Links to Dashboard and Reports pages

**Screenshot Placeholder:**
```
[SCREENSHOT: Admin dashboard with statistics cards]
```

### 3. Managing Bookings

**Viewing Bookings:**
- All bookings are displayed in a table
- Filter by status, date, or search term
- View booking details including:
  - Date and time
  - Employee name and department
  - Number of guests
  - Contact number
  - Booking code and password
  - Cleanup photo
  - Signature
  - Status and approval status

**Screenshot Placeholder:**
```
[SCREENSHOT: Admin bookings table with all columns]
```

### 4. Viewing Cleanup Photos and Signatures

**Steps:**
1. In the bookings table, find the "Cleanup Photo" column
2. Click "View" button to see the cleanup photo
3. In the "Signature" column, click "View" to see the signature
4. Close the modal by clicking outside or the X button

**Screenshot Placeholder:**
```
[SCREENSHOT: Cleanup photo modal showing kitchen image]
```

**Screenshot Placeholder:**
```
[SCREENSHOT: Signature modal showing digital signature]
```

### 5. Approving/Rejecting Change Requests

When an employee requests to change their booking:
1. The booking will show "Change Requested" status
2. Click the ✓ button to approve the change
3. Click the ✗ button to reject the change
4. If rejected, provide a reason

**Screenshot Placeholder:**
```
[SCREENSHOT: Booking with change request approval buttons]
```

### 6. Cancelling Bookings

**Steps:**
1. Find the booking you want to cancel
2. Click the delete/trash icon
3. Confirm the cancellation

**Screenshot Placeholder:**
```
[SCREENSHOT: Cancel booking confirmation dialog]
```

### 7. Reports and Analytics

Access the Reports page to view:
- Bookings by department
- Bookings by employee
- Peak hours analysis
- Kitchen utilization statistics
- Filter by date range and download options

**Screenshot Placeholder:**
```
[SCREENSHOT: Reports page with charts and filters]
```

---

## FAQ

### General Questions

**Q: Do I need to login to use the app?**
A: No, employees don't need to login. Simply open the app URL and click "Book Now" or "Manage Booking".

**Q: What languages are supported?**
A: The app supports English, Dhivehi, Tamil, Malayalam, Hindi, and Bengali.

**Q: Can I book the kitchen on weekends?**
A: Yes, you can book any day of the week. However, weekends may have higher demand.

**Q: How far in advance can I book?**
A: You can only book up to 3 days in advance (today, tomorrow, and day after tomorrow). The calendar will only show available dates within this 3-day window.

**Q: How close to the booking time can I book?**
A: You can only book slots that are at least 2 hours in the future. For example, if it's 10:00 AM, you cannot book the 09:00–11:00 slot, but you can book the 11:00–13:00 slot.

### Booking Questions

**Q: How many guests can I book for?**
A: You can book for 1 to 50 guests.

**Q: How many time slots are available per day?**
A: There are 7 time slots available per day (09:00–11:00 to 21:00–23:00).

**Q: Can I book multiple slots on the same day?**
A: No, each employee can only book one slot per day.

**Q: Can I book if I have an unclosed booking?**
A: No, you must complete the cleanup checklist for your previous booking before making a new one.

**Q: What happens after I submit a booking?**
A: Your booking will be in "Pending" status until approved by an admin. You'll receive a booking number and password.

**Q: How long does admin approval take?**
A: Approval times vary. Contact your admin if your booking is pending for too long.

### Booking Management Questions

**Q: How do I view my booking?**
A: Click "Manage Booking", enter your Booking Number and Password, then click "Search".

**Q: What if I forget my booking number or password?**
A: Contact the admin. They can view all booking credentials in the admin panel.

**Q: Can I change my booking date or time?**
A: Yes, use the "Request Change" button in Manage Booking. The change requires admin approval and is subject to the same booking restrictions (3-day window and 2-hour prior).

**Q: Can I cancel my booking?**
A: Yes, use the "Cancel Booking" button in Manage Booking.

**Q: What is the deadline for cancelling?**
A: There's no specific deadline, but it's best to cancel as early as possible to free up slots for others.

### Cleanup Questions

**Q: Why do I need to complete a cleanup checklist?**
A: To ensure the kitchen is clean and ready for the next user. This is required before you can make another booking.

**Q: What if I don't complete the cleanup checklist?**
A: You won't be able to make new bookings until the cleanup is completed.

**Q: What photos are acceptable for cleanup verification?**
A: Clear photos showing the entire kitchen after cleanup. JPEG and PNG formats are supported.

**Q: Can I complete the cleanup checklist after my booking time?**
A: Yes, you can complete it anytime after your booking, but you should do it as soon as possible.

### Admin Questions

**Q: How do I access the admin panel?**
A: Navigate to /login and enter your admin Employee ID and password.

**Q: Can I view all booking credentials?**
A: Yes, the admin panel shows all booking numbers and passwords for assisting users.

**Q: Can I approve change requests?**
A: Yes, use the ✓ button to approve and ✗ button to reject change requests.

**Q: Can I view cleanup photos and signatures?**
A: Yes, click "View" in the respective columns to see photos and signatures.

### Technical Questions

**Q: The app shows ERR_FAILED on mobile. What should I do?**
A: Clear your browser cache and reload the page. Try using incognito/private mode.

**Q: The app is not loading. What should I do?**
A: Check your internet connection, try refreshing the page, or try a different browser.

**Q: Can I use the app offline?**
A: No, the app requires an internet connection to function properly.

---

## Troubleshooting

### Common Issues

**Issue: Cannot make a new booking**
- Solution: Check if you have an unclosed booking. Complete the cleanup checklist first.

**Issue: No available slots**
- Solution: Try selecting a different date or time slot. Slots are limited to 7 per day.

**Issue: "You have an unclosed booking" error**
- Solution: Complete the cleanup checklist and upload a photo for your previous booking.

**Issue: Cannot find my booking**
- Solution: Ensure you entered the correct Booking Number and Password. Contact admin if you forgot them.

**Issue: Change request not approved**
- Solution: Contact admin to check the status. Your requested slot might be unavailable.

**Issue: Mobile ERR_FAILED error**
- Solution: Clear your browser cache and reload the page. Try using incognito/private mode.

**Issue: Cleanup photo not uploading**
- Solution: Ensure the image is in a supported format (JPEG, PNG) and size is reasonable (<5MB).

**Issue: Signature not saving**
- Solution: Ensure you've signed in the signature pad and clicked "Confirm" before submitting.

### Contact Support

For technical issues or questions, contact:
- **Email**: support@villa-park.com.mv
- **Phone**: [Add support phone number]

---

## Quick Reference

### Employee Workflow
1. Open App → 2. Click Book Now → 3. Fill Details → 4. Sign → 5. Get Credentials → 6. Use Kitchen → 7. Complete Cleanup → 8. Book Again

### Admin Workflow
1. Login → 2. Review Bookings → 3. Approve/Reject Changes → 4. View Photos/Signatures → 5. Generate Reports

### Booking Status Meanings
- **Booked**: Booking is confirmed and approved
- **Completed**: Booking has been used and cleanup verified
- **Cancelled**: Booking was cancelled
- **No Show**: Employee did not show up for the booking

### Approval Status Meanings
- **Approved**: Booking is approved
- **Pending**: Waiting for admin approval
- **Rejected**: Booking was rejected
- **Change Requested**: Employee requested to change date/time

---

## Best Practices

1. **Book Early**: Book your slot in advance to ensure availability
2. **Save Credentials**: Save your booking number and password securely
3. **Complete Cleanup**: Always complete the cleanup checklist to avoid blocking future bookings
4. **Request Changes Early**: If you need to change your booking, request changes as early as possible
5. **Check Availability**: Use the calendar to check slot availability before booking
6. **Contact Admin**: If you need help, contact admin instead of making multiple bookings

---

## Version History

- **v1.0** - Initial release with basic booking functionality
- **v1.1** - Added cleanup verification with checklist and photo upload
- **v1.2** - Added admin panel with booking management
- **v1.3** - Added multi-language support
- **v1.4** - Added reports and analytics
- **v1.5** - Added booking code and password display in admin panel
- **v1.6** - Added cleanup photo and signature viewers in admin panel
- **v1.7** - Updated service worker for better mobile caching

---

**Document Version:** 2.0  
**Last Updated:** July 2026  
**Application Version:** 1.7

