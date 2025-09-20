'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Camera, 
  User, 
  Calendar
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
    id: 'reproduction',
    label: 'Breeding',
    labelHi: 'प्रजनन',
    icon: Calendar,
    path: '/breeding',
  },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className }) => {
  const pathname = usePathname();

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
          const isActive = pathname === item.path || 
                          (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                'accessibility-button',
                'flex flex-col items-center justify-center',
                'rounded-xl transition-all duration-200',
                'focus-visible:focus-visible',
                'hover:bg-muted',
                'relative',
                isActive ? [
                  'text-primary',
                  'bg-primary/10',
                ] : [
                  'text-muted-foreground',
                  'hover:text-foreground'
                ]
              )}
              aria-label={`${item.label} - ${item.labelHi}`}
            >
              <Icon 
                className={cn(
                  'w-6 h-6 mb-1',
                  isActive && 'text-primary'
                )} 
              />
              <span className={cn(
                'text-xs font-medium',
                'hidden sm:block',
                isActive && 'text-primary'
              )}>
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />
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