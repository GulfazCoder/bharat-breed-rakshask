'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language translations
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    classify: 'Classify',
    profile: 'Profile',
    more: 'More',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    
    // Animals
    animals: 'My Animals',
    cattle: 'Cattle',
    buffalo: 'Buffalo',
    breed: 'Breed',
    age: 'Age',
    gender: 'Gender',
    health: 'Health',
    healthy: 'Healthy',
    
    // AI Classification
    aiClassification: 'AI Classification',
    takePhoto: 'Take Photo',
    uploadImage: 'Upload Image',
    analyzing: 'Analyzing...',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    theme: 'Theme',
    
    // Messages
    languageChanged: 'Language changed successfully!',
    cameraReady: 'Camera ready!',
    photoCapturing: 'Photo captured!',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    classify: 'वर्गीकृत करें',
    profile: 'प्रोफाइल',
    more: 'अधिक',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    add: 'जोड़ें',
    search: 'खोजें',
    filter: 'फिल्टर',
    export: 'निर्यात',
    
    // Animals
    animals: 'मेरे पशु',
    cattle: 'गोवंश',
    buffalo: 'भैंस',
    breed: 'नस्ल',
    age: 'उम्र',
    gender: 'लिंग',
    health: 'स्वास्थ्य',
    healthy: 'स्वस्थ',
    
    // AI Classification
    aiClassification: 'AI वर्गीकरण',
    takePhoto: 'फोटो लें',
    uploadImage: 'छवि अपलोड करें',
    analyzing: 'विश्लेषण कर रहा है...',
    
    // Settings
    settings: 'सेटिंग्स',
    language: 'भाषा',
    notifications: 'अधिसूचनाएं',
    theme: 'थीम',
    
    // Messages
    languageChanged: 'भाषा सफलतापूर्वक बदल दी गई!',
    cameraReady: 'कैमरा तैयार है!',
    photoCapturing: 'फोटो कैप्चर हो गई!',
  }
};

type Language = 'en' | 'hi';
type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  translations: typeof translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('app-language', newLanguage);
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language, TranslationKey };