'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Heart, 
  History, 
  Trophy, 
  HelpCircle, 
  LogOut, 
  Edit, 
  ArrowRight,
  Star,
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, userProfile, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleAuthAction = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  // Menu items for authenticated users
  const authenticatedMenuItems = [
    {
      id: 'favorites',
      label: 'Favorite Breeds',
      icon: Heart,
      description: 'Manage your favorite breeds',
      path: '/favorites',
      badge: userProfile?.stats?.favoriteBreeds?.length || 0
    },
    {
      id: 'history',
      label: 'Classification History',
      icon: History,
      description: 'View your past classifications',
      path: '/history',
      badge: userProfile?.stats?.classificationsCount || 0
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Trophy,
      description: 'Your badges and milestones',
      path: '/achievements',
      badge: userProfile?.stats?.expertVerifications || 0
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'App preferences and account',
      path: '/settings'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and contact support',
      path: '/help'
    }
  ];

  // Menu items for guests
  const guestMenuItems = [
    {
      id: 'breeds',
      label: 'Browse Breeds',
      icon: BookOpen,
      description: 'Explore our breed database',
      path: '/breeds'
    },
    {
      id: 'about',
      label: 'About Us',
      icon: MessageSquare,
      description: 'Learn about our mission',
      path: '/about'
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      description: 'Get help and tutorials',
      path: '/help'
    }
  ];

  const menuItems = user ? authenticatedMenuItems : guestMenuItems;

  if (!user) {
    // Guest user interface
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              🐄 Welcome to Bharat Breed Rakshask
            </h1>
            <p className="text-muted-foreground">
              Sign in to unlock personalized features
            </p>
          </div>
        </header>

        <div className="p-4 space-y-6 max-w-md mx-auto">
          {/* Sign in prompt */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Join Our Community</h2>
              <p className="text-muted-foreground mb-6">
                Access personalized features, save your favorite breeds, and track your classification history.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => handleAuthAction('signup')} 
                  className="w-full"
                  size="lg"
                >
                  Create Account
                </Button>
                <Button 
                  onClick={() => handleAuthAction('signin')} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Why Sign Up?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Save Favorites</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep track of your favorite breeds
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Track History</h3>
                  <p className="text-sm text-muted-foreground">
                    View all your classification results
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock badges as you learn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu items for guests */}
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent 
                    className="p-4"
                    onClick={() => router.push(item.path)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{item.label}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  // Authenticated user interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.photoURL || ''} />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {user.displayName || 'User'}
              </h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              
              {/* User stats */}
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {userProfile?.stats?.classificationsCount || 0} classifications
                  </span>
                </div>
                {userProfile?.stats?.expertVerifications && userProfile.stats.expertVerifications > 0 && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-muted-foreground">
                      {userProfile.stats.expertVerifications} verified
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/profile/edit')}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-md mx-auto pb-20">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile?.stats?.favoriteBreeds?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile?.stats?.classificationsCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Classifications</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {userProfile?.stats?.expertVerifications || 0}
              </div>
              <div className="text-xs text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu items */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent 
                  className="p-4"
                  onClick={() => router.push(item.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator />

        {/* Account actions */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Button>
        </div>

        {/* App info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Bharat Breed Rakshask v1.0</p>
          <p>Built by Team Codeyodhaa with ❤️</p>
        </div>
      </div>
    </div>
  );
}