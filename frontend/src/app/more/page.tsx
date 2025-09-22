'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Brain, 
  Tag, 
  Settings, 
  HelpCircle, 
  Star, 
  Shield, 
  Languages, 
  BookOpen,
  Database,
  TrendingUp,
  Users,
  MessageSquare,
  Camera,
  Calendar,
  BarChart,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';

// Define toggleLanguage as optional since we might not always have it
interface LanguageContextType {
  language: string;
  toggleLanguage?: () => void;
}

const MorePage = () => {
  let language = 'en';
  let toggleLanguage = () => {};
  
  try {
    const context = useLanguage();
    language = context.language || 'en';
    toggleLanguage = context.toggleLanguage || (() => {});
  } catch (error) {
    console.log('Language context not available, using fallback');
  }

  const trainingFeatures = [
    {
      title: 'AI Training Dashboard',
      titleHi: 'एआई प्रशिक्षण डैशबोर्ड',
      description: 'Train and manage AI models for livestock classification',
      descriptionHi: 'पशुधन वर्गीकरण के लिए एआई मॉडल प्रशिक्षित और प्रबंधित करें',
      icon: Brain,
      href: '/training',
      badge: 'Beta',
      color: 'text-blue-600'
    },
    {
      title: 'Data Labeling',
      titleHi: 'डेटा लेबलिंग',
      description: 'Annotate livestock images for AI training',
      descriptionHi: 'एआई प्रशिक्षण के लिए पशुधन छवियों को एनोटेट करें',
      icon: Tag,
      href: '/training/labeling',
      badge: 'New',
      color: 'text-green-600'
    }
  ];

  const generalFeatures = [
    {
      title: 'Animal Breeds Database',
      titleHi: 'पशु नस्ल डेटाबेस',
      description: 'Browse comprehensive breed information',
      descriptionHi: 'व्यापक नस्ल जानकारी ब्राउज़ करें',
      icon: BookOpen,
      href: '/breeds',
      color: 'text-blue-600'
    },
    {
      title: 'Breeding Management',
      titleHi: 'प्रजनन प्रबंधन',
      description: 'Track breeding cycles and pregnancy',
      descriptionHi: 'प्रजनन चक्र और गर्भावस्था को ट्रैक करें',
      icon: Calendar,
      href: '/breeding',
      color: 'text-green-600'
    },
    {
      title: 'Health Care Tips',
      titleHi: 'स्वास्थ्य देखभाल सुझाव',
      description: 'Expert guidance for cattle health and disease prevention',
      descriptionHi: 'मवेशी स्वास्थ्य और रोग रोकथाम के लिए विशेषज्ञ मार्गदर्शन',
      icon: Heart,
      href: '/health-tips',
      color: 'text-red-600'
    },
    {
      title: 'Government Schemes',
      titleHi: 'सरकारी योजनाएं',
      description: 'Browse livestock welfare schemes and subsidies',
      descriptionHi: 'पशुधन कल्याण योजनाओं और सब्सिडी को देखें',
      icon: Shield,
      href: '/schemes',
      color: 'text-green-600'
    },
    {
      title: 'Admin Dashboard',
      titleHi: 'एडमिन डैशबोर्ड',
      description: 'Analytics and user management',
      descriptionHi: 'एनालिटिक्स और उपयोगकर्ता प्रबंधन',
      icon: BarChart,
      href: '/admin',
      color: 'text-purple-600'
    },
    {
      title: 'Buffalo vs Cattle Preview',
      titleHi: 'भैंस बनाम गाय पूर्वावलोकन',
      description: 'Enhanced classification preview with improvements',
      descriptionHi: 'सुधार के साथ उन्नत वर्गीकरण पूर्वावलोकन',
      icon: TrendingUp,
      href: '/buffalo-preview',
      color: 'text-orange-600'
    },
    {
      title: 'Settings',
      titleHi: 'सेटिंग्स',
      description: 'App preferences and configurations',
      descriptionHi: 'ऐप प्राथमिकताएं और कॉन्फ़िगरेशन',
      icon: Settings,
      href: '/settings',
      color: 'text-gray-600'
    },
    {
      title: 'Help & Support',
      titleHi: 'सहायता और समर्थन',
      description: 'Get help and contact support',
      descriptionHi: 'सहायता प्राप्त करें और समर्थन से संपर्क करें',
      icon: HelpCircle,
      href: '/help',
      color: 'text-purple-600'
    },
    {
      title: 'Rate App',
      titleHi: 'ऐप को रेट करें',
      description: 'Rate and review the application',
      descriptionHi: 'एप्लिकेशन को रेट और समीक्षा करें',
      icon: Star,
      href: '/rate',
      color: 'text-yellow-600'
    },
    {
      title: 'Privacy Policy',
      titleHi: 'गोपनीयता नीति',
      description: 'Read our privacy policy',
      descriptionHi: 'हमारी गोपनीयता नीति पढ़ें',
      icon: Shield,
      href: '/privacy',
      color: 'text-red-600'
    },
    {
      title: 'About',
      titleHi: 'के बारे में',
      description: 'Learn about Bharat Breed Rakshak',
      descriptionHi: 'भारत ब्रीड रक्षक के बारे में जानें',
      icon: BookOpen,
      href: '/about',
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    {
      title: 'Classifications',
      titleHi: 'वर्गीकरण',
      value: '1,247',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      title: 'Training Data',
      titleHi: 'प्रशिक्षण डेटा',
      value: '0',
      icon: Tag,
      color: 'text-green-600'
    },
    {
      title: 'Accuracy',
      titleHi: 'सटीकता',
      value: '94.2%',
      icon: TrendingUp,
      color: 'text-orange-600'
    },
    {
      title: 'Users',
      titleHi: 'उपयोगकर्ता',
      value: '25K+',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            {language === 'hi' ? 'अधिक सुविधाएं' : 'More Features'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'hi' 
              ? 'अतिरिक्त उपकरण और सेटिंग्स का अन्वेषण करें' 
              : 'Explore additional tools and settings'
            }
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">
                    {language === 'hi' ? stat.titleHi : stat.title}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Training Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              {language === 'hi' ? 'एआई प्रशिक्षण मॉड्यूल' : 'AI Training Modules'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {trainingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.title} href={feature.href}>
                    <Card className="transition-all hover:shadow-md border-2 border-transparent hover:border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg bg-gray-100 ${feature.color}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {language === 'hi' ? feature.titleHi : feature.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {language === 'hi' ? feature.descriptionHi : feature.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {feature.badge && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {feature.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* General Features */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'hi' ? 'सामान्य सुविधाएं' : 'General Features'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {generalFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.title} href={feature.href}>
                    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`p-2 rounded-lg bg-gray-100 ${feature.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {language === 'hi' ? feature.titleHi : feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {language === 'hi' ? feature.descriptionHi : feature.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Language Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Languages className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">
                    {language === 'hi' ? 'भाषा' : 'Language'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'hi' 
                      ? 'अपनी पसंदीदा भाषा चुनें' 
                      : 'Choose your preferred language'
                    }
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={toggleLanguage}>
                {language === 'hi' ? 'English' : 'हिन्दी'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'hi' ? 'त्वरित क्रियाएं' : 'Quick Actions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link href="/classify">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'वर्गीकृत करें' : 'Classify'}
                </Button>
              </Link>
              <Link href="/breeding">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'प्रजनन' : 'Breeding'}
                </Button>
              </Link>
              <Link href="/schemes">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'योजनाएं' : 'Schemes'}
                </Button>
              </Link>
              <Link href="/training">
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  {language === 'hi' ? 'प्रशिक्षण' : 'Training'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium mb-2">
              {language === 'hi' ? 'फीडबैक दें' : 'Give Feedback'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'hi' 
                ? 'हमें बताएं कि हम कैसे सुधार कर सकते हैं'
                : 'Tell us how we can improve'
              }
            </p>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              {language === 'hi' ? 'फीडबैक भेजें' : 'Send Feedback'}
            </Button>
          </CardContent>
        </Card>

        {/* Version Info */}
        <div className="text-center text-sm text-muted-foreground">
          <Separator className="my-4" />
          <p>Bharat Breed Rakshak v1.0.0</p>
          <p>{language === 'hi' ? '© 2025 सभी अधिकार सुरक्षित' : '© 2025 All rights reserved'}</p>
          <p className="mt-1">{language === 'hi' ? 'टीम कोडयोधा द्वारा निर्मित ❤️' : 'Made by Team Codeyodhaa with ❤️'}</p>
        </div>
      </div>
    </div>
  );
};

export default MorePage;