'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center p-4">
    <Card className="w-full max-w-md shadow-2xl border-light-green bg-cream">
      <CardContent className="p-8 text-center">
        <div className="mb-8">
          {/* App Logo */}
          <div className="w-28 h-28 mx-auto mb-6 relative">
            <img 
              src="/logo.svg" 
              alt="Bharat Breed Rakshak Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-dark-green mb-2">
            Bharat Breed Rakshask
          </h1>
          
          <p className="text-primary-green text-sm mb-4">
            Built by Team Codeyodhaa with Love ❤️
          </p>
        </div>
        
        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-primary-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-medium-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-dark-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-sm text-primary-green font-medium mb-2">
          Loading your farm data...
        </p>
        
        <p className="text-xs text-medium-green">
          Made by Team Codeyodhaa
        </p>
      </CardContent>
    </Card>
  </div>
);

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate loading for a short time, then show content
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Show loading for 1 second, then show content
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Provider store={store}>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </Provider>
  );
};
