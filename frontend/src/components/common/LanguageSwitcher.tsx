'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState('en');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Set cookie for language preference
      document.cookie = `locale=${languageCode}; path=/; max-age=31536000`; // 1 year
      
      setCurrentLanguage(languageCode);
      setIsOpen(false);
      
      // Reload page to apply new language
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  React.useEffect(() => {
    // Get current language from cookie
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1];
      setCurrentLanguage(locale);
    }
  }, []);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full accessibility-button"
        aria-label="Change language"
      >
        <Languages className="w-5 h-5" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Language options */}
          <Card className="absolute top-12 right-0 z-50 w-48">
            <CardContent className="p-2">
              <div className="space-y-1">
                {languages.map((language) => (
                  <Button
                    key={language.code}
                    variant={currentLanguage === language.code ? 'default' : 'ghost'}
                    className="w-full justify-start accessibility-button"
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-xs text-muted-foreground">{language.name}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};