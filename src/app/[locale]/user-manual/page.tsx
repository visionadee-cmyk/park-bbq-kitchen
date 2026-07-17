'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ArrowLeft, Book, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function UserManualPage() {
  const t = useTranslations();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['employee-guide']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-xl font-semibold flex items-center">
              <Book className="w-5 h-5 mr-2" />
              User Manual
            </h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Park BBQ Kitchen Booking System</CardTitle>
            <CardDescription>Complete guide for employees and administrators</CardDescription>
          </CardHeader>
        </Card>

        {/* Employee Guide Section */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('employee-guide')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Employee Guide</CardTitle>
              {expandedSections.includes('employee-guide') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('employee-guide') && (
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">1. Home Page</h3>
                <p className="text-gray-600 mb-3">Open the application URL, select your preferred language, then click "Book Now" to create a new booking or "Manage Booking" to view/change existing bookings.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Booking a Kitchen Slot</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Click "Book Now" on the home page</li>
                  <li>Select your name from the dropdown or search by name</li>
                  <li>Enter your Employee Code (e.g., 13011)</li>
                  <li>Select the booking date from the calendar</li>
                  <li>Choose a time slot from available slots (green = available, red = fully booked)</li>
                  <li>Enter number of guests (pax) - Maximum 50 guests</li>
                  <li>Enter your contact number</li>
                  <li>Add any remarks (optional)</li>
                  <li>Agree to the terms and conditions</li>
                  <li>Sign using the signature pad</li>
                  <li>Click "Submit Booking"</li>
                  <li>Save your Booking Number and Password for future reference</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Managing Your Bookings</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Click "Manage Booking" on the home page</li>
                  <li>Enter your Booking Number (received after booking)</li>
                  <li>Enter your Booking Password (received after booking)</li>
                  <li>Click "Search" to find your booking</li>
                  <li>View your booking details including date, time, and status</li>
                  <li>Request changes, cancel, or complete the cleanup checklist</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Requesting Date/Time Changes</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Access your booking using Manage Booking</li>
                  <li>Click "Request Change" button</li>
                  <li>Select new date from calendar</li>
                  <li>Choose new time slot from available options</li>
                  <li>Enter reason for change</li>
                  <li>Click "Submit"</li>
                  <li>Wait for admin approval (status will show "Change Requested")</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Cancelling a Booking</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Access your booking using Manage Booking</li>
                  <li>Click "Cancel Booking" button</li>
                  <li>Confirm cancellation</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Completing Cleanup Checklist</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                  <p className="text-yellow-800 font-medium">Important: You cannot make a new booking until you complete the cleanup checklist for your previous booking.</p>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Click "Manage Booking" on the home page</li>
                  <li>Enter your Booking Number and Password</li>
                  <li>Click "Search" to find your booking</li>
                  <li>Complete all checklist items:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Kitchen cleaned thoroughly</li>
                      <li>All equipment returned to proper place</li>
                      <li>Gas turned off completely</li>
                      <li>All trash disposed properly</li>
                      <li>All surfaces wiped down</li>
                    </ul>
                  </li>
                  <li>Upload a photo of the cleaned kitchen</li>
                  <li>Click "Complete Booking"</li>
                  <li>Your booking status will change to "Completed"</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">7. Booking Code and Password</h3>
                <p className="text-gray-600 mb-3">After successful booking, you will receive a Booking Number and Password. Save these credentials securely. You need them to view your booking details, request changes, cancel your booking, and complete the cleanup checklist.</p>
                <p className="text-gray-600">If you forget your booking code or password, contact the admin. They can view all booking credentials in the admin panel.</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Admin Guide Section */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('admin-guide')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Admin Guide</CardTitle>
              {expandedSections.includes('admin-guide') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('admin-guide') && (
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">1. Admin Login</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Open the application URL</li>
                  <li>Click "Admin Login" or navigate to /login</li>
                  <li>Enter your Employee ID</li>
                  <li>Enter your password</li>
                  <li>Click "Login"</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">2. Admin Dashboard</h3>
                <p className="text-gray-600 mb-3">The admin dashboard provides statistics, booking status counts, recent bookings, approval management, and navigation to Reports page.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">3. Managing Bookings</h3>
                <p className="text-gray-600 mb-3">All bookings are displayed in a table. You can filter by status, date, or search term. View booking details including date, time, employee info, booking code/password, cleanup photo, and signature.</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">4. Viewing Cleanup Photos and Signatures</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>In the bookings table, find the "Cleanup Photo" column</li>
                  <li>Click "View" button to see the cleanup photo</li>
                  <li>In the "Signature" column, click "View" to see the signature</li>
                  <li>Close the modal by clicking outside or the X button</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">5. Approving/Rejecting Change Requests</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>The booking will show "Change Requested" status</li>
                  <li>Click the ✓ button to approve the change</li>
                  <li>Click the ✗ button to reject the change</li>
                  <li>If rejected, provide a reason</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">6. Cancelling Bookings</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Find the booking you want to cancel</li>
                  <li>Click the delete/trash icon</li>
                  <li>Confirm the cancellation</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">7. Reports and Analytics</h3>
                <p className="text-gray-600 mb-3">Access the Reports page to view bookings by department, bookings by employee, peak hours analysis, and kitchen utilization statistics. Filter by date range and download options.</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Quick Reference Section */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('quick-reference')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Quick Reference</CardTitle>
              {expandedSections.includes('quick-reference') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('quick-reference') && (
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Employee Workflow</h3>
                <p className="text-gray-600">Open App → Click Book Now → Fill Details → Sign → Get Credentials → Use Kitchen → Complete Cleanup → Book Again</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Admin Workflow</h3>
                <p className="text-gray-600">Login → Review Bookings → Approve/Reject Changes → View Photos/Signatures → Generate Reports</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Booking Status Meanings</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Booked:</strong> Booking is confirmed and approved</li>
                  <li><strong>Completed:</strong> Booking has been used and cleanup verified</li>
                  <li><strong>Cancelled:</strong> Booking was cancelled</li>
                  <li><strong>No Show:</strong> Employee did not show up for the booking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Approval Status Meanings</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Approved:</strong> Booking is approved</li>
                  <li><strong>Pending:</strong> Waiting for admin approval</li>
                  <li><strong>Rejected:</strong> Booking was rejected</li>
                  <li><strong>Change Requested:</strong> Employee requested to change date/time</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Best Practices Section */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('best-practices')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Best Practices</CardTitle>
              {expandedSections.includes('best-practices') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('best-practices') && (
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li><strong>Book Early:</strong> Book your slot in advance to ensure availability</li>
                <li><strong>Save Credentials:</strong> Save your booking number and password securely</li>
                <li><strong>Complete Cleanup:</strong> Always complete the cleanup checklist to avoid blocking future bookings</li>
                <li><strong>Request Changes Early:</strong> If you need to change your booking, request changes as early as possible</li>
                <li><strong>Check Availability:</strong> Use the calendar to check slot availability before booking</li>
                <li><strong>Contact Admin:</strong> If you need help, contact admin instead of making multiple bookings</li>
              </ol>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  );
}
