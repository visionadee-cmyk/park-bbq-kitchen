'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import Footer from '@/components/Footer';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function FAQPage() {
  const t = useTranslations();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const faqs = {
    general: [
      {
        q: "Do I need to login to use the app?",
        a: "No, employees don't need to login. Simply open the app URL and click \"Book Now\" or \"Manage Booking\"."
      },
      {
        q: "What languages are supported?",
        a: "The app supports English, Dhivehi, Tamil, Malayalam, Hindi, and Bengali."
      },
      {
        q: "Can I book the kitchen on weekends?",
        a: "Yes, you can book any day of the week. However, weekends may have higher demand."
      },
      {
        q: "How far in advance can I book?",
        a: "You can only book up to 3 days in advance (today, tomorrow, and day after tomorrow). The calendar will only show available dates within this 3-day window."
      },
      {
        q: "How close to the booking time can I book?",
        a: "You can only book slots that are at least 2 hours in the future. For example, if it's 10:00 AM, you cannot book the 09:00–11:00 slot, but you can book the 11:00–13:00 slot."
      }
    ],
    booking: [
      {
        q: "How many guests can I book for?",
        a: "You can book for 1 to 50 guests."
      },
      {
        q: "How many time slots are available per day?",
        a: "There are 7 time slots available per day (09:00–11:00 to 21:00–23:00)."
      },
      {
        q: "Can I book multiple slots on the same day?",
        a: "No, each employee can only book one slot per day."
      },
      {
        q: "Can I book if I have an unclosed booking?",
        a: "No, you must complete the cleanup checklist for your previous booking before making a new one."
      },
      {
        q: "What happens after I submit a booking?",
        a: "Your booking will be in \"Pending\" status until approved by an admin. You'll receive a booking number and password."
      },
      {
        q: "How long does admin approval take?",
        a: "Approval times vary. Contact your admin if your booking is pending for too long."
      }
    ],
    management: [
      {
        q: "How do I view my booking?",
        a: "Click \"Manage Booking\", enter your Booking Number and Password, then click \"Search\"."
      },
      {
        q: "What if I forget my booking number or password?",
        a: "Contact the admin. They can view all booking credentials in the admin panel."
      },
      {
        q: "Can I change my booking date or time?",
        a: "Yes, use the \"Request Change\" button in Manage Booking. The change requires admin approval and is subject to the same booking restrictions (3-day window and 2-hour prior)."
      },
      {
        q: "Can I cancel my booking?",
        a: "Yes, use the \"Cancel Booking\" button in Manage Booking."
      },
      {
        q: "What is the deadline for cancelling?",
        a: "There's no specific deadline, but it's best to cancel as early as possible to free up slots for others."
      }
    ],
    cleanup: [
      {
        q: "Why do I need to complete a cleanup checklist?",
        a: "To ensure the kitchen is clean and ready for the next user. This is required before you can make another booking."
      },
      {
        q: "What if I don't complete the cleanup checklist?",
        a: "You won't be able to make new bookings until the cleanup is completed."
      },
      {
        q: "What photos are acceptable for cleanup verification?",
        a: "Clear photos showing the entire kitchen after cleanup. JPEG and PNG formats are supported."
      },
      {
        q: "Can I complete the cleanup checklist after my booking time?",
        a: "Yes, you can complete it anytime after your booking, but you should do it as soon as possible."
      }
    ],
    technical: [
      {
        q: "The app shows ERR_FAILED on mobile. What should I do?",
        a: "Clear your browser cache and reload the page. Try using incognito/private mode."
      },
      {
        q: "The app is not loading. What should I do?",
        a: "Check your internet connection, try refreshing the page, or try a different browser."
      },
      {
        q: "Can I use the app offline?",
        a: "No, the app requires an internet connection to function properly."
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-xl font-semibold flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              FAQ
            </h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about the Park BBQ Kitchen Booking System</CardDescription>
          </CardHeader>
        </Card>

        {/* General Questions */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('general')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">General Questions</CardTitle>
              {expandedSections.includes('general') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('general') && (
            <CardContent className="space-y-4">
              {faqs.general.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Booking Questions */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('booking')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Booking Questions</CardTitle>
              {expandedSections.includes('booking') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('booking') && (
            <CardContent className="space-y-4">
              {faqs.booking.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Booking Management Questions */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('management')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Booking Management Questions</CardTitle>
              {expandedSections.includes('management') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('management') && (
            <CardContent className="space-y-4">
              {faqs.management.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Cleanup Questions */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('cleanup')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Cleanup Questions</CardTitle>
              {expandedSections.includes('cleanup') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('cleanup') && (
            <CardContent className="space-y-4">
              {faqs.cleanup.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Technical Questions */}
        <Card className="mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('technical')}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Technical Questions</CardTitle>
              {expandedSections.includes('technical') ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.includes('technical') && (
            <CardContent className="space-y-4">
              {faqs.technical.map((faq, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Contact Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">For technical issues or questions not covered here, please contact support:</p>
            <div className="space-y-2">
              <p className="text-gray-700"><strong>Email:</strong> support@villa-park.com.mv</p>
              <p className="text-gray-700"><strong>Phone:</strong> [Add support phone number]</p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
