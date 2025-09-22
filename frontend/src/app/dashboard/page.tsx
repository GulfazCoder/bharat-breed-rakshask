'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Camera, 
  User, 
  Calendar,
  Sun,
  Moon,
  ChevronRight,
  Shield,
  BookOpen,
  Heart
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  className 
}) => {
  return (
    <Link href={href} className="block">
      <Card className={cn(
        "transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        "bg-card border border-border",
        "accessibility-button",
        className
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-muted">
                <Icon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const DashboardPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const featureCards = [
    {
      title: "Classify Animal",
      description: "Use camera or gallery",
      icon: Camera,
      href: "/classify",
    },
    {
      title: "Animal Profile",
      description: "View animal details",
      icon: User,
      href: "/profile",
    },
    {
      title: "Breeding Management",
      description: "Track pregnancy & breeding",
      icon: Calendar,
      href: "/breeding",
    },
    {
      title: "Health Tips & Care Guidelines",
      description: "Expert guidance for cattle health",
      icon: Heart,
      href: "/health-tips",
    },
    {
      title: "Government Schemes",
      description: "Browse welfare schemes",
      icon: Shield,
      href: "/schemes",
    },
    {
      title: "Animal Breeds",
      description: "Breed information database",
      icon: BookOpen,
      href: "/breeds",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="p-4 space-y-6">
        {/* Welcome section */}
        <div className="text-center py-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Welcome to Bharat Breed Rakshask
          </h2>
          <p className="text-muted-foreground">
            Manage your cattle and buffalo with AI-powered breed classification
          </p>
        </div>

        {/* Feature cards */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {featureCards.map((card, index) => (
            <FeatureCard
              key={card.href}
              title={card.title}
              description={card.description}
              icon={card.icon}
              href={card.href}
              className={cn(
                "animate-in fade-in-0 slide-in-from-bottom-4",
                `duration-${300 + index * 100}`
              )}
            />
          ))}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">78</div>
              <div className="text-sm text-muted-foreground">Breeds Supported</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">0</div>
              <div className="text-sm text-muted-foreground">Animals Registered</div>
            </CardContent>
          </Card>
        </div>

        {/* Help section */}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Need Help Getting Started?
              </h3>
              <p className="text-muted-foreground mb-4">
                Learn how to classify your first animal or add animals to your farm
              </p>
              <Button variant="outline" size="sm">
                View Tutorial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;