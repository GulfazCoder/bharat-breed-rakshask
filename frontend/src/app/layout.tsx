import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Bharat Breed Rakshask",
  description: "Comprehensive cattle and buffalo breed management system for Indian farmers",
  keywords: ["cattle", "buffalo", "breed", "management", "farming", "India", "AI classification"],
  authors: [{ name: "Bharat Breed Rakshask Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased`}>
        <div className="flex flex-col min-h-screen">
          {/* Main content area */}
          <main className="flex-1 mobile-nav-height">
            {children}
          </main>
          
          {/* Bottom navigation - only show on app pages */}
          <BottomNavigation />
        </div>
        
        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
