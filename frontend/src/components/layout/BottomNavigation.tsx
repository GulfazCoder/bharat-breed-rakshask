'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LayoutDashboard, 
  Camera, 
  User, 
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavigationItem } from '@/lib/types';

interface BottomNavigationProps {
  className?: string;
}

// Navigation items configuration
const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    labelHi: 'डैशबोर्ड',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'classify',
    label: 'Classify',
    labelHi: 'वर्गीकृत',
    icon: Camera,
    path: '/classify',
  },
  {
    id: 'profile',
    label: 'Profile',
    labelHi: 'प्रोफाइल',
    icon: User,
    path: '/profile',
  },
  {
    id: 'more',
    label: 'More',
    labelHi: 'अधिक',
    icon: MoreHorizontal,
    path: '/more',
  },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-card border-t border-border',
        'px-2 py-2',
        'sm:px-4',
        className
      )}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          // Improved active state detection
          const isActive = (() => {
            if (pathname === item.path) return true;
            if (item.path === '/dashboard' && pathname === '/') return true;
            if (item.path !== '/dashboard' && item.path !== '/' && pathname.startsWith(item.path)) return true;
            return false;
          })();
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                'flex flex-col items-center justify-center',
                'px-3 py-2 min-w-[60px]',
                'rounded-xl transition-all duration-200',
                'hover:bg-muted/50 active:bg-muted',
                'relative',
                isActive ? [
                  'text-primary-green',
                  'bg-primary-green/10',
                ] : [
                  'text-muted-foreground',
                  'hover:text-foreground'
                ]
              )}
              aria-label={`${item.label} - ${item.labelHi}`}
            >
              <Icon 
                className={cn(
                  'w-6 h-6 mb-1 transition-colors',
                  isActive ? 'text-primary-green' : 'text-muted-foreground'
                )} 
              />
              <span className={cn(
                'text-xs font-medium leading-tight',
                'block',
                isActive ? 'text-primary-green' : 'text-muted-foreground'
              )}>
                {language === 'hi' ? item.labelHi : item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-1 w-2 h-2 bg-primary-green rounded-full animate-pulse" />
              )}
              
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <span className="text-xs text-destructive-foreground font-bold">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;