'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief moment
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
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
            <p className="text-muted-foreground text-sm">
              Comprehensive cattle and buffalo breed management system
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-300" />
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Loading your dashboard...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
