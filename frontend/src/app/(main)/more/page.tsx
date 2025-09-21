'use client';

import Link from 'next/link';
import { 
  FileText, 
  Calendar,
  Stethoscope,
  Settings,
  User,
  HelpCircle,
  Shield,
  Download,
  Award,
  TrendingUp,
  Heart,
  Globe,
  Languages
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const MorePage = () => {

  const menuSections = [
    {
      title: "Core Features",
      titleHi: "मुख्य विशेषताएं",
      items: [
        {
          title: "Animal Profile",
          titleHi: "पशु प्रोफाइल",
          description: "Manage your cattle records and health data",
          descriptionHi: "अपने मवेशी रिकॉर्ड और स्वास्थ्य डेटा प्रबंधित करें",
          icon: Heart,
          href: "/animals",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        },
        {
          title: "Breeding Management",
          titleHi: "प्रजनन प्रबंधन",
          description: "Track breeding cycles and reproductive health",
          descriptionHi: "प्रजनन चक्र और प्रजनन स्वास्थ्य को ट्रैक करें",
          icon: Calendar,
          href: "/breeding",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        }
      ]
    },
    {
      title: "Health & Support",
      titleHi: "स्वास्थ्य और सहायता",
      items: [
        {
          title: "Health Tips",
          titleHi: "स्वास्थ्य सुझाव",
          description: "Expert care guidelines and health tips",
          descriptionHi: "विशेषज्ञ देखभाल दिशानिर्देश और स्वास्थ्य सुझाव",
          icon: Stethoscope,
          href: "/health-tips",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          badge: "New"
        },
        {
          title: "Government Schemes",
          titleHi: "सरकारी योजनाएं",
          description: "Access schemes and veterinary contacts",
          descriptionHi: "योजनाओं और पशु चिकित्सा संपर्कों तक पहुंच",
          icon: FileText,
          href: "/schemes",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          badge: "New"
        }
      ]
    },
    {
      title: "Data & Analytics",
      titleHi: "डेटा और विश्लेषण",
      items: [
        {
          title: "Admin Dashboard",
          titleHi: "एडमिन डैशबोर्ड",
          description: "Advanced analytics and farm insights",
          descriptionHi: "उन्नत विश्लेषण और फार्म अंतर्दृष्टि",
          icon: TrendingUp,
          href: "/admin",
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          borderColor: "border-indigo-200"
        },
        {
          title: "Export Data",
          titleHi: "डेटा निर्यात",
          description: "Download your data in various formats",
          descriptionHi: "विभिन्न प्रारूपों में अपना डेटा डाउनलोड करें",
          icon: Download,
          href: "/export",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        }
      ]
    },
    {
      title: "Account & Settings",
      titleHi: "खाता और सेटिंग्स",
      items: [
        {
          title: "Profile Settings",
          titleHi: "प्रोफाइल सेटिंग्स",
          description: "Manage your account and preferences",
          descriptionHi: "अपना खाता और प्राथमिकताएं प्रबंधित करें",
          icon: User,
          href: "/profile",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        },
        {
          title: "App Settings",
          titleHi: "ऐप सेटिंग्स",
          description: "Configure app preferences and notifications",
          descriptionHi: "ऐप प्राथमिकताएं और अधिसूचनाएं कॉन्फ़िगर करें",
          icon: Settings,
          href: "/settings",
          color: "text-slate-600",
          bgColor: "bg-slate-50",
          borderColor: "border-slate-200"
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Help & Support",
      titleHi: "सहायता और समर्थन",
      icon: HelpCircle,
      href: "/help",
      color: "text-blue-600"
    },
    {
      title: "Privacy Policy",
      titleHi: "गोपनीयता नीति",
      icon: Shield,
      href: "/privacy",
      color: "text-green-600"
    },
    {
      title: "Language",
      titleHi: "भाषा",
      icon: Languages,
      href: "/language",
      color: "text-purple-600"
    },
    {
      title: "About",
      titleHi: "के बारे में",
      icon: Award,
      href: "/about",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-cyber-green-700">More Features</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access all app features, settings, and additional resources
        </p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <Link key={itemIndex} href={item.href}>
                    <Card className={`hover:shadow-md transition-shadow ${item.borderColor} border-l-4`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.bgColor}`}>
                              <Icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-base font-semibold">
                                {item.title}
                              </CardTitle>
                            </div>
                          </div>
                          {(item as any).badge && (
                            <Badge className="bg-cyber-green-100 text-cyber-green-800 border-cyber-green-200">
                              {(item as any).badge}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm text-gray-600">
                          {item.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
                    <div className="p-3 rounded-full bg-gray-50">
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-center text-gray-700">
                      {action.title}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* App Information */}
      <div className="bg-gray-50 rounded-lg p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-cyber-green-600" />
          <span className="font-semibold text-cyber-green-700">Bharat Breed Rakshask</span>
        </div>
        <p className="text-sm text-gray-600">
          Version 1.0.0 • Built with ❤️ for Indian farmers
        </p>
        <p className="text-xs text-gray-500">
          Empowering cattle farming through AI and technology
        </p>
      </div>
    </div>
  );
};

export default MorePage;