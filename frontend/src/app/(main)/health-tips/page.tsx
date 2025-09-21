'use client';

import { useState } from 'react';
import { Search, Filter, AlertTriangle, Calendar, BookOpen, Play, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from 'next-intl';

// Import health tips data
import healthTips from '@/lib/constants/healthTips.json';

interface HealthTip {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  description: string;
  descriptionHi: string;
  content: string;
  contentHi: string;
  tips: string[];
  tipsHi: string[];
  warningSigns: string[];
  priority: 'high' | 'medium' | 'low';
  season: string;
  applicableBreeds: string[];
  imageUrl: string;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const HealthTipsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');

  // Filter health tips
  const filteredTips = (healthTips as HealthTip[]).filter((tip) => {
    const matchesSearch = tip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tip.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tip.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || tip.priority === priorityFilter;
    const matchesSeason = seasonFilter === 'all' || tip.season === seasonFilter || tip.season === 'all';
    return matchesSearch && matchesCategory && matchesPriority && matchesSeason;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'General Care': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Nutrition': return 'bg-green-100 text-green-800 border-green-200';
      case 'Preventive Care': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Seasonal Care': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Dairy Management': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Reproduction': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Young Stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Heart className="h-4 w-4" />;
      case 'low': return <BookOpen className="h-4 w-4" />;
      default: return null;
    }
  };

  const getUniqueValues = (arr: any[], key: string) => {
    return [...new Set(arr.map(item => item[key]))].filter(Boolean);
  };

  const categories = getUniqueValues(healthTips, 'category');
  const seasons = getUniqueValues(healthTips, 'season').filter(season => season !== 'all');

  const getCurrentSeasonTips = () => {
    const currentMonth = new Date().getMonth();
    let currentSeason = 'all';
    
    if (currentMonth >= 2 && currentMonth <= 5) currentSeason = 'summer';
    else if (currentMonth >= 6 && currentMonth <= 9) currentSeason = 'monsoon';
    else currentSeason = 'winter';
    
    return (healthTips as HealthTip[]).filter(tip => 
      tip.season === currentSeason || tip.season === 'all'
    ).slice(0, 3);
  };

  const highPriorityTips = (healthTips as HealthTip[]).filter(tip => tip.priority === 'high').slice(0, 3);
  const currentSeasonTips = getCurrentSeasonTips();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-cyber-green-700">Health Tips & Care Guidelines</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert guidance for maintaining optimal cattle health and preventing diseases
        </p>
      </div>

      {/* High Priority & Seasonal Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Tips */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Critical Health Tips
            </CardTitle>
            <CardDescription>Essential practices for immediate implementation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {highPriorityTips.map((tip) => (
              <div key={tip.id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-medium text-red-800">{tip.title}</h4>
                  <p className="text-sm text-red-700 line-clamp-2">{tip.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Current Season Tips */}
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Calendar className="h-5 w-5" />
              Seasonal Care Tips
            </CardTitle>
            <CardDescription>Important care practices for current season</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentSeasonTips.map((tip) => (
              <div key={tip.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <Calendar className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-medium text-orange-800">{tip.title}</h4>
                  <p className="text-sm text-orange-700 line-clamp-2">{tip.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search health tips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={seasonFilter} onValueChange={setSeasonFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season.charAt(0).toUpperCase() + season.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-sm text-gray-600">
            {filteredTips.length} tip{filteredTips.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Health Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTips.map((tip) => (
          <Card key={tip.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(tip.category)}>
                      {tip.category}
                    </Badge>
                    <Badge className={getPriorityColor(tip.priority)}>
                      <span className="flex items-center gap-1">
                        {getPriorityIcon(tip.priority)}
                        {tip.priority.toUpperCase()}
                      </span>
                    </Badge>
                  </div>
                  {tip.season !== 'all' && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {tip.season.charAt(0).toUpperCase() + tip.season.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-cyber-green-700">
                {tip.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 line-clamp-3">
                {tip.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Quick Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {tip.tips.slice(0, 3).map((tipText, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-green-500 mt-2 flex-shrink-0" />
                      {tipText}
                    </li>
                  ))}
                </ul>
              </div>
              
              {tip.warningSigns.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-800">Warning Signs</AlertTitle>
                  <AlertDescription className="text-orange-700 text-xs">
                    Watch for: {tip.warningSigns.slice(0, 2).join(', ')}
                    {tip.warningSigns.length > 2 && '...'}
                  </AlertDescription>
                </Alert>
              )}

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Full Guide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-cyber-green-700">
                      {tip.title}
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      {tip.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryColor(tip.category)}>
                        {tip.category}
                      </Badge>
                      <Badge className={getPriorityColor(tip.priority)}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(tip.priority)}
                          {tip.priority.toUpperCase()}
                        </span>
                      </Badge>
                      {tip.season !== 'all' && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {tip.season.charAt(0).toUpperCase() + tip.season.slice(1)}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Detailed Guidelines</h4>
                      <p className="text-sm leading-relaxed text-gray-700">{tip.content}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-3">Implementation Tips</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {tip.tips.map((tipText, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green-500 mt-2 flex-shrink-0" />
                            {tipText}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {tip.warningSigns.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-semibold mb-3 text-orange-800">Warning Signs to Watch For</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tip.warningSigns.map((sign, index) => (
                              <div key={index} className="flex items-start gap-2 text-sm text-orange-700">
                                <AlertTriangle className="h-3 w-3 text-orange-600 mt-1 flex-shrink-0" />
                                {sign}
                              </div>
                            ))}
                          </div>
                          <Alert className="mt-3 border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800">Important</AlertTitle>
                            <AlertDescription className="text-red-700">
                              If you observe any of these warning signs, consult a veterinarian immediately.
                              Early intervention can prevent serious complications.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </>
                    )}
                    
                    <Separator />
                    
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-cyber-green-600 hover:bg-cyber-green-700">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Save to My Notes
                      </Button>
                      {tip.videoUrl && (
                        <Button variant="outline" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Video
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTips.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No health tips found</h3>
          <p className="text-gray-600">Try adjusting your search filters to find relevant health tips.</p>
        </div>
      )}
    </div>
  );
};

export default HealthTipsPage;