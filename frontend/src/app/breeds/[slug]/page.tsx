'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Heart, MapPin, Calendar, TrendingUp, Activity, Droplets, Weight, Ruler, Shield, Thermometer, Eye, Info, AlertTriangle, CheckCircle, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import Image from 'next/image';
import breedDatabase from '../../../../../data/breeds-database.json';

// Enhanced breed interface with all database fields
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
  averageMaleWeight: string;
  averageFemaleWeight: string;
  heightAtWithers: string;
  bodyColor: string;
  hornShape: string;
  earType: string;
  hump: string;
  tailSwitch: string | null;
  diseaseResistance: string;
  climateTolerance: string;
  uniqueTraits: string;
  averageLifespan: string;
  productiveAge: string;
  ageAtFirstCalving: string;
  calvingInterval: string;
  milkImportance: string;
  conservationStatus: string;
  govtPrograms: string | null;
}

export default function BreedProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [breedData, setBreedData] = useState<BreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedBreeds, setRelatedBreeds] = useState<BreedData[]>([]);

  useEffect(() => {
    const slug = params.slug as string;
    if (!slug) return;

    // Convert slug back to breed name (replace dashes with spaces and capitalize)
    const breedName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Find breed in database
    const breed = breedDatabase.find((b: any) => 
      b.breedName.toLowerCase() === breedName.toLowerCase() ||
      b.breedName.toLowerCase().replace(/[()]/g, '').trim() === breedName.toLowerCase()
    ) as BreedData;

    if (breed) {
      setBreedData(breed);
      
      // Find related breeds (same category and origin)
      const related = breedDatabase.filter((b: any) => 
        b.id !== breed.id && 
        b.category === breed.category &&
        (b.origin === breed.origin || b.primaryUse === breed.primaryUse)
      ).slice(0, 3) as BreedData[];
      
      setRelatedBreeds(related);
      
      // Check if breed is favorited (from localStorage)
      const favorites = JSON.parse(localStorage.getItem('favoriteBreeds') || '[]');
      setIsFavorite(favorites.includes(breed.id));
    }
    
    setLoading(false);
  }, [params.slug]);

  const handleShare = async () => {
    if (!breedData) return;
    
    try {
      await navigator.share({
        title: `${breedData.breedName} - Bharat Breed Rakshask`,
        text: `Learn about ${breedData.breedName}, a ${breedData.category.toLowerCase()} breed from ${breedData.origin}`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    if (!breedData) return;
    
    const favorites = JSON.parse(localStorage.getItem('favoriteBreeds') || '[]');
    
    if (isFavorite) {
      const updated = favorites.filter((id: number) => id !== breedData.id);
      localStorage.setItem('favoriteBreeds', JSON.stringify(updated));
      setIsFavorite(false);
      toast.success('Removed from favorites');
    } else {
      favorites.push(breedData.id);
      localStorage.setItem('favoriteBreeds', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Added to favorites');
    }
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

  const getMilkYieldScore = (yieldValue: string | number) => {
    if (typeof yieldValue === 'string') {
      const numbers = yieldValue.match(/\d+/g);
      if (numbers) {
        const avgYield = parseInt(numbers[0]);
        return Math.min((avgYield / 3000) * 100, 100); // Scale to 3000kg max
      }
    }
    return 0;
  };

  const getBreedSlug = (breedName: string) => {
    return breedName.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading breed information...</p>
        </div>
      </div>
    );
  }

  if (!breedData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🐄</div>
          <h1 className="text-2xl font-bold">Breed Not Found</h1>
          <p className="text-muted-foreground">The breed you're looking for doesn't exist in our database.</p>
          <Button onClick={() => router.push('/breeds')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Breeds
          </Button>
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
              <h1 className="text-xl font-bold text-foreground">{breedData.breedName}</h1>
              <p className="text-sm text-muted-foreground">{breedData.category} from {breedData.origin}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFavorite}
              className={isFavorite ? 'text-red-600 border-red-200' : ''}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-600' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Breed Image Placeholder */}
              <div className="md:col-span-1">
                <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="text-4xl">
                        {breedData.category === 'Cattle' ? '🐄' : '🐃'}
                      </div>
                      <p className="text-sm text-muted-foreground">Breed Image</p>
                      <p className="text-xs text-muted-foreground">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {breedData.category}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {breedData.type}
                  </Badge>
                  <Badge className={getConservationColor(breedData.conservationStatus)}>
                    {breedData.conservationStatus || 'Unknown'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Origin</p>
                      <p className="text-sm text-muted-foreground">{breedData.origin}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Primary Use</p>
                      <p className="text-sm text-muted-foreground">{breedData.primaryUse}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Milk Yield</p>
                      <p className="text-sm text-muted-foreground">{breedData.milkYield}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Lifespan</p>
                      <p className="text-sm text-muted-foreground">{breedData.averageLifespan}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Unique Traits</h3>
                  <p className="text-sm text-muted-foreground">{breedData.uniqueTraits}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Milk Production</span>
                  <span className="text-sm text-muted-foreground">
                    {getMilkYieldScore(breedData.milkYield).toFixed(0)}%
                  </span>
                </div>
                <Progress value={getMilkYieldScore(breedData.milkYield)} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Conservation Priority</span>
                  <span className="text-sm text-muted-foreground">
                    {(breedData.conservationStatus === 'Critical' ? 100 : 
                     breedData.conservationStatus === 'Endangered' ? 80 :
                     breedData.conservationStatus === 'Vulnerable' ? 60 : 30)}%
                  </span>
                </div>
                <Progress 
                  value={(breedData.conservationStatus === 'Critical' ? 100 : 
                         breedData.conservationStatus === 'Endangered' ? 80 :
                         breedData.conservationStatus === 'Vulnerable' ? 60 : 30)}
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="characteristics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="characteristics">Physical</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="management">Care</TabsTrigger>
                <TabsTrigger value="economics">Economics</TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="characteristics" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Physical Characteristics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Body Color
                        </span>
                        <span className="text-sm text-muted-foreground">{breedData.bodyColor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Weight className="w-4 h-4" /> Male Weight
                        </span>
                        <span className="text-sm text-muted-foreground">{breedData.averageMaleWeight}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Weight className="w-4 h-4" /> Female Weight
                        </span>
                        <span className="text-sm text-muted-foreground">{breedData.averageFemaleWeight}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium flex items-center gap-2">
                          <Ruler className="w-4 h-4" /> Height at Withers
                        </span>
                        <span className="text-sm text-muted-foreground">{breedData.heightAtWithers}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Horn Shape</span>
                        <span className="text-sm text-muted-foreground">{breedData.hornShape}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Ear Type</span>
                        <span className="text-sm text-muted-foreground">{breedData.earType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Hump</span>
                        <span className="text-sm text-muted-foreground">{breedData.hump}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tail Switch</span>
                        <span className="text-sm text-muted-foreground">{breedData.tailSwitch || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Performance Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Droplets className="w-4 h-4" />
                          Milk Production
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Annual Yield:</span>
                          <span className="text-sm font-medium">{breedData.milkYield}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Fat Content:</span>
                          <span className="text-sm font-medium">{breedData.milkFat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Importance:</span>
                          <Badge variant="outline" className="text-xs">
                            {breedData.milkImportance}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Reproductive Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">First Calving:</span>
                          <span className="text-sm font-medium">{breedData.ageAtFirstCalving}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Calving Interval:</span>
                          <span className="text-sm font-medium">{breedData.calvingInterval}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Productive Age:</span>
                          <span className="text-sm font-medium">{breedData.productiveAge}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="management" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Management & Care</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Health & Disease Resistance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{breedData.diseaseResistance}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Thermometer className="w-4 h-4" />
                          Climate Adaptation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{breedData.climateTolerance}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distribution & Availability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Main Distribution:</strong> {breedData.mainDistribution}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Government Programs:</strong> {breedData.govtPrograms || 'No specific programs listed'}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="economics" className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Economic Considerations</h3>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Economic data varies by region, market conditions, and management practices. 
                      Consult local experts for specific investment guidance.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Primary Economic Use</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="mb-2">{breedData.primaryUse}</Badge>
                        <p className="text-sm text-muted-foreground">
                          This breed is primarily valued for {breedData.primaryUse.toLowerCase()}.
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Investment Considerations</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Proven breed with documented performance</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Adapted to local climate conditions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span>Conservation status: {breedData.conservationStatus}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Breeds */}
        {relatedBreeds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Breeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedBreeds.map((breed) => (
                  <Card key={breed.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {breed.category === 'Cattle' ? '🐄' : '🐃'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{breed.breedName}</h4>
                          <p className="text-xs text-muted-foreground">{breed.origin}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {breed.primaryUse}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => router.push(`/breeds/${getBreedSlug(breed.breedName)}`)}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}