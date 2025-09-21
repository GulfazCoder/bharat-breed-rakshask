'use client';

import { useState } from 'react';
import { 
  Bell, 
  Globe, 
  Shield, 
  Smartphone, 
  Download,
  Sun,
  Moon,
  Languages,
  VolumeX,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    breeding: true,
    health: true,
    feeding: false,
    general: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'system',
    sound: true,
    autoSync: true,
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary-green">Settings</h1>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Breeding Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified about breeding cycles and appointments</p>
            </div>
            <Switch
              checked={notifications.breeding}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, breeding: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Health Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive health checkup and vaccination reminders</p>
            </div>
            <Switch
              checked={notifications.health}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, health: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Feeding Schedule</Label>
              <p className="text-sm text-muted-foreground">Get reminders for feeding times</p>
            </div>
            <Switch
              checked={notifications.feeding}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, feeding: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>General Updates</Label>
              <p className="text-sm text-muted-foreground">App updates and general information</p>
            </div>
            <Switch
              checked={notifications.general}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, general: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={preferences.language} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, language: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={preferences.theme} onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, theme: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sound Effects</Label>
              <p className="text-sm text-muted-foreground">Play sounds for notifications and actions</p>
            </div>
            <Switch
              checked={preferences.sound}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, sound: checked }))
              }
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto Sync</Label>
              <p className="text-sm text-muted-foreground">Automatically sync data when connected</p>
            </div>
            <Switch
              checked={preferences.autoSync}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, autoSync: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data & Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">App Data</p>
                <p className="text-sm text-muted-foreground">Backup your app data</p>
              </div>
              <Button variant="outline">
                Backup Now
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear Cache</p>
                <p className="text-sm text-muted-foreground">Free up storage space</p>
              </div>
              <Button variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms of Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Data Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Build</span>
            <span className="font-medium">2024.01.15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Developer</span>
            <span className="font-medium">Team Codeyodhaa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Built with</span>
            <span className="font-medium text-red-500">❤️ Love</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}