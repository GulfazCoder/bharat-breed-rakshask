'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';

interface ProvidersProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">भर</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bharat Breed Rakshask
          </h1>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Loading your data...
        </p>
      </CardContent>
    </Card>
  </div>
);

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};