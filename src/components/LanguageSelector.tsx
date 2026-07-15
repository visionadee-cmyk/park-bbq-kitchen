'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Select } from '@/components/ui/select';

export function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // Navigate to current path with new locale
    router.push(pathname, { locale: lang });
  };

  return (
    <Select
      value={language}
      onChange={(e) => handleLanguageChange(e.target.value)}
      className="text-sm w-auto"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </Select>
  );
}
