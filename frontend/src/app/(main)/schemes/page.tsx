'use client';

import { useState } from 'react';
import { Search, Phone, Mail, MapPin, Clock, Star, Filter, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

// Import data
import governmentSchemes from '@/lib/constants/governmentSchemes.json';
import veterinaryContacts from '@/lib/constants/veterinaryContacts.json';

interface Scheme {
  id: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  eligibility: string[];
  benefits: string[];
  applicationProcess: string;
  contactInfo: string;
  category: string;
  isActive: boolean;
}

interface VetContact {
  id: string;
  name: string;
  nameHi: string;
  qualification: string;
  specialization: string;
  specializationHi: string;
  phone: string;
  email: string;
  address: string;
  addressHi: string;
  district: string;
  districtHi: string;
  state: string;
  stateHi: string;
  pincode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  services: string[];
  servicesHi: string[];
  workingHours: string;
  emergencyAvailable: boolean;
  languagesSpoken: string[];
  experience: string;
  isGovernment: boolean;
  consultationFee: number;
  homeVisitAvailable: boolean;
  homeVisitFee: number;
  rating: number;
  reviews: number;
}

const SchemesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Filter schemes
  const filteredSchemes = (governmentSchemes as Scheme[]).filter((scheme) => {
    const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || scheme.category === categoryFilter;
    return matchesSearch && matchesCategory && scheme.isActive;
  });

  // Filter veterinary contacts
  const filteredVets = (veterinaryContacts as VetContact[]).filter((vet) => {
    const matchesSearch = vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vet.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || vet.state === locationFilter;
    const matchesSpecialty = specialtyFilter === 'all' || vet.specialization === specialtyFilter;
    return matchesSearch && matchesLocation && matchesSpecialty;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Breeding': return 'bg-green-100 text-green-800 border-green-200';
      case 'Insurance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Subsidy': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Health': return 'bg-red-100 text-red-800 border-red-200';
      case 'Training': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUniqueValues = (arr: any[], key: string) => {
    return [...new Set(arr.map(item => item[key]))].filter(Boolean);
  };

  const categories = getUniqueValues(governmentSchemes, 'category');
  const states = getUniqueValues(veterinaryContacts, 'state');
  const specializations = getUniqueValues(veterinaryContacts, 'specialization');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-cyber-green-700">Government Schemes & Veterinary Support</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Access government schemes for livestock development and connect with qualified veterinarians
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search schemes or veterinarians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="schemes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schemes">Government Schemes</TabsTrigger>
          <TabsTrigger value="vets">Veterinary Contacts</TabsTrigger>
        </TabsList>

        {/* Government Schemes Tab */}
        <TabsContent value="schemes" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
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
            </div>
            <p className="text-sm text-gray-600">
              {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-cyber-green-700">
                        {scheme.name}
                      </CardTitle>
                      <Badge className={getCategoryColor(scheme.category)}>
                        {scheme.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-gray-600 line-clamp-3">
                    {scheme.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Key Benefits:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {scheme.benefits.slice(0, 3).map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyber-green-500 mt-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-cyber-green-700">
                          {scheme.name}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                          {scheme.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-2">Eligibility Criteria:</h4>
                          <ul className="space-y-1 text-sm">
                            {scheme.eligibility.map((criteria, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-semibold mb-2">Benefits:</h4>
                          <ul className="space-y-1 text-sm">
                            {scheme.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Application Process:</h4>
                          <p className="text-sm">{scheme.applicationProcess}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-semibold">Contact Information:</h4>
                          <p className="text-sm">{scheme.contactInfo}</p>
                        </div>
                        
                        <Button className="w-full bg-cyber-green-600 hover:bg-cyber-green-700">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Veterinary Contacts Tab */}
        <TabsContent value="vets" className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Filter className="h-4 w-4 text-gray-500 mt-2" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-gray-600">
              {filteredVets.length} veterinarian{filteredVets.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVets.map((vet) => (
              <Card key={vet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-semibold text-cyber-green-700">
                        {vet.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{vet.qualification}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{vet.experience}</span>
                      </div>
                      <Badge variant={vet.isGovernment ? "default" : "secondary"}>
                        {vet.isGovernment ? "Government" : "Private"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{vet.rating}</span>
                      <span className="text-xs text-gray-500">({vet.reviews})</span>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    <span className="font-medium">{vet.specialization}</span>
                    <br />
                    <span className="text-xs">{vet.district}, {vet.state}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-cyber-green-600" />
                      <a href={`tel:${vet.phone}`} className="text-cyber-green-600 hover:underline">
                        {vet.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <a href={`mailto:${vet.email}`} className="text-gray-600 hover:underline">
                        {vet.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-600">{vet.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{vet.workingHours}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {vet.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {vet.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vet.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Consultation: </span>
                      <span className="font-medium">
                        {vet.consultationFee === 0 ? 'Free' : `₹${vet.consultationFee}`}
                      </span>
                    </div>
                    {vet.emergencyAvailable && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Emergency
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-cyber-green-600 hover:bg-cyber-green-700">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-cyber-green-700">
                            {vet.name}
                          </DialogTitle>
                          <DialogDescription>
                            {vet.qualification} • {vet.experience} experience
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Contact Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{vet.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{vet.email}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  <span>{vet.address}, {vet.district}, {vet.state} - {vet.pincode}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h4 className="font-semibold">Practice Details</h4>
                              <div className="space-y-2 text-sm">
                                <div><strong>Specialization:</strong> {vet.specialization}</div>
                                <div><strong>Working Hours:</strong> {vet.workingHours}</div>
                                <div><strong>Languages:</strong> {vet.languagesSpoken.join(', ')}</div>
                                <div className="flex items-center gap-2">
                                  <strong>Rating:</strong> 
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{vet.rating} ({vet.reviews} reviews)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h4 className="font-semibold mb-2">Services Offered</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {vet.services.map((service, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-green-500" />
                                  {service}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Fees</h4>
                              <div className="text-sm space-y-1">
                                <div><strong>Consultation:</strong> {vet.consultationFee === 0 ? 'Free' : `₹${vet.consultationFee}`}</div>
                                {vet.homeVisitAvailable && (
                                  <div><strong>Home Visit:</strong> ₹{vet.homeVisitFee}</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold mb-2">Availability</h4>
                              <div className="space-y-1">
                                {vet.emergencyAvailable && (
                                  <Badge className="bg-red-100 text-red-800 border-red-200">
                                    24/7 Emergency Available
                                  </Badge>
                                )}
                                {vet.homeVisitAvailable && (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                    Home Visits Available
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button className="flex-1 bg-cyber-green-600 hover:bg-cyber-green-700">
                              <Phone className="h-4 w-4 mr-2" />
                              Call Now
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchemesPage;