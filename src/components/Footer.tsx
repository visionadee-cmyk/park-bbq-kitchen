'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/logo/logo.jpeg" 
              alt="Park BBQ Kitchen Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h3 className="font-bold text-lg">Park BBQ Kitchen</h3>
              <p className="text-gray-400 text-sm">Booking System</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-gray-400">
            <a href="/user-manual" className="hover:text-white transition-colors">
              User Manual
            </a>
            <a href="/faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          
          <div className="text-sm text-gray-400">
            © {currentYear} Park BBQ Kitchen. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
