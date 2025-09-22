'use client';

import React from 'react';
import { ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const ProfilePage: React.FC = () => {
  // Mock data for demonstration
  const animals = [
    {
      id: '1',
      name: 'Ganga',
      breed: 'Gir',
      category: 'Cattle',
      age: '3 years',
      status: 'Healthy',
      isPregnant: false,
      image: '/api/placeholder/100/100'
    },
    {
      id: '2', 
      name: 'Lakshmi',
      breed: 'Murrah',
      category: 'Buffalo',
      age: '4 years',
      status: 'Pregnant',
      isPregnant: true,
      image: '/api/placeholder/100/100'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Animal Profile</h1>
          </div>
          <Button size="icon" className="rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search animals..."
              className="pl-10 accessibility-button"
            />
          </div>
          <Button variant="outline" size="icon" className="accessibility-button">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{animals.length}</div>
              <div className="text-sm text-muted-foreground">Total Animals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {animals.filter(a => a.isPregnant).length}
              </div>
              <div className="text-sm text-muted-foreground">Pregnant</div>
            </CardContent>
          </Card>
        </div>

        {/* Animals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Animals</h2>
          
          {animals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Animals Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first animal to track their health and breeding
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Animal
                </Button>
              </CardContent>
            </Card>
          ) : (
            animals.map((animal) => (
              <Card key={animal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-xl"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          {animal.name}
                        </h3>
                        <Badge 
                          variant={animal.status === 'Healthy' ? 'default' : 'secondary'}
                        >
                          {animal.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {animal.breed} • {animal.category} • {animal.age}
                      </p>
                      {animal.isPregnant && (
                        <Badge variant="outline" className="mt-2">
                          Pregnant
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;