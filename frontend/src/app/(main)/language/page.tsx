'use client';

import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguagePage() {
  const { language: selectedLanguage, setLanguage, t } = useLanguage();

  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      flag: '🇮🇳',
    },
    {
      code: 'bn',
      name: 'Bengali',
      nativeName: 'বাংলা',
      flag: '🇧🇩',
    },
    {
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳',
    },
    {
      code: 'mr',
      name: 'Marathi',
      nativeName: 'मराठी',
      flag: '🇮🇳',
    },
    {
      code: 'gu',
      name: 'Gujarati',
      nativeName: 'ગુજરાતી',
      flag: '🇮🇳',
    },
  ];

  const handleLanguageChange = (languageCode: 'en' | 'hi') => {
    setLanguage(languageCode);
    toast.success(t('languageChanged'));
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Languages className="h-8 w-8 text-cyber-green-700" />
        <div>
          <h1 className="text-3xl font-bold text-cyber-green-700">{selectedLanguage === 'hi' ? 'भाषा सेटिंग्स' : 'Language Settings'}</h1>
          <p className="text-gray-600 mt-1">{selectedLanguage === 'hi' ? 'अपनी पसंदीदा भाषा चुनें' : 'Choose your preferred language'}</p>
        </div>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedLanguage === 'hi' ? 'भाषा चुनें' : 'Select Language'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedLanguage === language.code 
                  ? 'border-cyber-green-500 bg-cyber-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleLanguageChange(language.code as 'en' | 'hi')}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <div>
                  <h3 className="font-medium">{language.name}</h3>
                  <p className="text-sm text-gray-600">{language.nativeName}</p>
                </div>
              </div>
              {selectedLanguage === language.code && (
                <Check className="h-5 w-5 text-cyber-green-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Apply Button */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 mb-4 text-center">
            {selectedLanguage === 'hi' ? 'भाषा परिवर्तन तुरंत लागू हो जाता है!' : 'Language changes apply immediately!'}
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => toast.success(t('languageChanged'))}
          >
            {selectedLanguage === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}