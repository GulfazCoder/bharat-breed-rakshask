import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/common/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Bharat Breed Rakshask",
  description: "Comprehensive cattle and buffalo breed management system for Indian farmers - Built by Team Codeyodhaa with Love",
  keywords: ["cattle", "buffalo", "breed", "management", "farming", "India", "AI classification"],
  authors: [{ name: "Team Codeyodhaa" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {/* Main content area */}
            <main className="flex-1 mobile-nav-height">
              {children}
            </main>
            
            {/* Bottom navigation - only show on app pages */}
            <BottomNavigation />
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            expand={true}
            richColors
            closeButton
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              },
              className: 'toast',
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
