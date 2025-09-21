'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Animal {
  id: string;
  name: string;
  breed: string;
  type: 'Cattle' | 'Buffalo';
  age: number;
  gender: 'Male' | 'Female';
  health: 'Healthy' | 'Needs Attention' | 'Under Treatment';
  lastCheckup: string;
  image?: string;
}

const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Ganga',
    breed: 'Gir',
    type: 'Cattle',
    age: 4,
    gender: 'Female',
    health: 'Healthy',
    lastCheckup: '2024-01-15',
  },
  {
    id: '2',
    name: 'Shyam',
    breed: 'Murrah',
    type: 'Buffalo',
    age: 3,
    gender: 'Male',
    health: 'Needs Attention',
    lastCheckup: '2024-01-10',
  },
  {
    id: '3',
    name: 'Kamdhenu',
    breed: 'Sahiwal',
    type: 'Cattle',
    age: 5,
    gender: 'Female',
    health: 'Healthy',
    lastCheckup: '2024-01-20',
  },
];

export default function AnimalsPage() {
  const [animals] = useState<Animal[]>(mockAnimals);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'All' | 'Cattle' | 'Buffalo'>('All');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || animal.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'bg-green-100 text-green-800';
      case 'Needs Attention': return 'bg-yellow-100 text-yellow-800';
      case 'Under Treatment': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cyber-green-700">My Animals</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Animal
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search animals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['All', 'Cattle', 'Buffalo'] as const).map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                size="sm"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{animals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animals.filter(a => a.health === 'Healthy').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {animals.filter(a => a.health === 'Needs Attention').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{animal.name}</CardTitle>
                <Badge variant="outline">{animal.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Breed:</span>
                  <span className="font-medium">{animal.breed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{animal.age} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{animal.gender}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Health:</span>
                  <Badge className={getHealthColor(animal.health)}>
                    {animal.health}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last checkup: {new Date(animal.lastCheckup).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No animals found matching your criteria.</p>
          <Button className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Animal
          </Button>
        </div>
      )}
    </div>
  );
}