'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Grid, List, MapPin, Droplets, Activity, Heart, ArrowLeft, Star, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import breedDatabase from '../../../../data/breeds-database.json';

// Enhanced breed interface
interface BreedData {
  id: number;
  breedName: string;
  category: 'Cattle' | 'Buffalo';
  type: string;
  origin: string;
  mainDistribution: string;
  primaryUse: string;
  milkYield: string | number;
  milkFat: string | number;
  bodyColor: string;
  uniqueTraits: string;
  conservationStatus: string;
  govtPrograms: string | null;
}

export default function BreedsPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  
  // State management
  const [breeds, setBreeds] = useState<BreedData[]>([]);
  const [filteredBreeds, setFilteredBreeds] = useState<BreedData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedConservation, setSelectedConservation] = useState<string>('all');
  const [selectedUse, setSelectedUse] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState({
    totalBreeds: 0,
    cattleCount: 0,
    buffaloCount: 0,
    criticalCount: 0,
    endangeredCount: 0
  });

  useEffect(() => {
    // Load breeds from database
    const breedData = breedDatabase as BreedData[];
    setBreeds(breedData);
    setFilteredBreeds(breedData);
    
    // Load favorites from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteBreeds') || '[]');
    setFavorites(savedFavorites);
    
    // Calculate statistics
    const totalBreeds = breedData.length;
    const cattleCount = breedData.filter(b => b.category === 'Cattle').length;
    const buffaloCount = breedData.filter(b => b.category === 'Buffalo').length;
    const criticalCount = breedData.filter(b => b.conservationStatus === 'Critical').length;
    const endangeredCount = breedData.filter(b => b.conservationStatus === 'Endangered').length;
    
    setStats({
      totalBreeds,
      cattleCount,
      buffaloCount,
      criticalCount,
      endangeredCount
    });
    
    setLoading(false);
  }, []);

  // Filter breeds based on search and filters
  useEffect(() => {
    let filtered = breeds;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(breed =>
        breed.breedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.uniqueTraits.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.bodyColor.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(breed => breed.category === selectedCategory);
    }

    // Origin filter
    if (selectedOrigin !== 'all') {
      filtered = filtered.filter(breed => breed.origin.includes(selectedOrigin));
    }

    // Conservation status filter
    if (selectedConservation !== 'all') {
      filtered = filtered.filter(breed => breed.conservationStatus === selectedConservation);
    }

    // Primary use filter
    if (selectedUse !== 'all') {
      filtered = filtered.filter(breed => breed.primaryUse.toLowerCase().includes(selectedUse.toLowerCase()));
    }

    setFilteredBreeds(filtered);
  }, [breeds, searchQuery, selectedCategory, selectedOrigin, selectedConservation, selectedUse]);

  // Get unique values for filter options
  const origins = [...new Set(breeds.map(b => b.origin.split(',')[0].trim()))].sort();
  const conservationStatuses = [...new Set(breeds.map(b => b.conservationStatus))].sort();
  const primaryUses = [...new Set(breeds.map(b => b.primaryUse))].sort();

  const getBreedSlug = (breedName: string) => {
    return breedName.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-');
  };

  const getConservationColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'vulnerable': return 'bg-yellow-100 text-yellow-800';
      case 'endangered': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleFavorite = (breedId: number) => {
    const updatedFavorites = favorites.includes(breedId)
      ? favorites.filter(id => id !== breedId)
      : [...favorites, breedId];
    
    setFavorites(updatedFavorites);
    localStorage.setItem('favoriteBreeds', JSON.stringify(updatedFavorites));
    
    toast.success(
      favorites.includes(breedId) 
        ? 'Removed from favorites' 
        : 'Added to favorites'
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOrigin('all');
    setSelectedConservation('all');
    setSelectedUse('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading breeds database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Breed Database</h1>
              <p className="text-sm text-muted-foreground">
                {filteredBreeds.length} of {stats.totalBreeds} breeds
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalBreeds}</div>
              <div className="text-sm text-muted-foreground">Total Breeds</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.cattleCount}</div>
              <div className="text-sm text-muted-foreground">Cattle</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.buffaloCount}</div>
              <div className="text-sm text-muted-foreground">Buffalo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.endangeredCount}</div>
              <div className="text-sm text-muted-foreground">Endangered</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search breeds by name, origin, traits, or color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Cattle">Cattle</SelectItem>
                    <SelectItem value="Buffalo">Buffalo</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                  <SelectTrigger>
                    <SelectValue placeholder="Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    {origins.map(origin => (
                      <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedConservation} onValueChange={setSelectedConservation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Conservation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {conservationStatuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUse} onValueChange={setSelectedUse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Primary Use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Uses</SelectItem>
                    <SelectItem value="milk">Milk</SelectItem>
                    <SelectItem value="draught">Draught</SelectItem>
                    <SelectItem value="dual">Dual Purpose</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breeds Display */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Breeds ({filteredBreeds.length})</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="conservation">Conservation Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBreeds.map((breed) => (
                  <Card key={breed.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">
                            {breed.category === 'Cattle' ? '🐄' : '🐃'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{breed.breedName}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {breed.origin}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(breed.id);
                          }}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              favorites.includes(breed.id) 
                                ? 'fill-red-600 text-red-600' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Primary Use
                          </span>
                          <span className="font-medium">{breed.primaryUse}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            Milk Yield
                          </span>
                          <span className="font-medium">{breed.milkYield}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {breed.category}
                        </Badge>
                        <Badge className={getConservationColor(breed.conservationStatus)}>
                          {breed.conservationStatus}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {breed.uniqueTraits}
                      </p>

                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/breeds/${getBreedSlug(breed.breedName)}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBreeds.map((breed) => (
                  <Card key={breed.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">
                            {breed.category === 'Cattle' ? '🐄' : '🐃'}
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <h3 className="font-semibold">{breed.breedName}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {breed.origin}
                              </p>
                            </div>
                            
                            <div className="text-sm">
                              <p className="font-medium">{breed.primaryUse}</p>
                              <p className="text-muted-foreground">Primary Use</p>
                            </div>
                            
                            <div className="text-sm">
                              <p className="font-medium">{breed.milkYield}</p>
                              <p className="text-muted-foreground">Milk Yield</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getConservationColor(breed.conservationStatus)}>
                                {breed.conservationStatus || 'Unknown'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(breed.id);
                                }}
                              >
                                <Heart 
                                  className={`w-4 h-4 ${
                                    favorites.includes(breed.id) 
                                      ? 'fill-red-600 text-red-600' 
                                      : 'text-muted-foreground'
                                  }`} 
                                />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/breeds/${getBreedSlug(breed.breedName)}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredBreeds.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No breeds found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {breeds
                .filter(breed => favorites.includes(breed.id))
                .map((breed) => (
                  <Card key={breed.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">
                            {breed.category === 'Cattle' ? '🐄' : '🐃'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{breed.breedName}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {breed.origin}
                            </div>
                          </div>
                        </div>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => router.push(`/breeds/${getBreedSlug(breed.breedName)}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
            
            {favorites.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💙</div>
                <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
                  Add breeds to your favorites by clicking the heart icon
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="conservation">
            <div className="space-y-6">
              {['Critical', 'Endangered', 'Vulnerable'].map(status => {
                const statusBreeds = breeds.filter(b => b.conservationStatus && b.conservationStatus === status);
                if (statusBreeds.length === 0) return null;
                
                return (
                  <div key={status}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Badge className={getConservationColor(status)}>
                        {status}
                      </Badge>
                      ({statusBreeds.length} breeds)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {statusBreeds.map((breed) => (
                        <Card key={breed.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-2xl">
                                {breed.category === 'Cattle' ? '🐄' : '🐃'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{breed.breedName}</h4>
                                <p className="text-sm text-muted-foreground">{breed.origin}</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              onClick={() => router.push(`/breeds/${getBreedSlug(breed.breedName)}`)}
                            >
                              Learn More
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}