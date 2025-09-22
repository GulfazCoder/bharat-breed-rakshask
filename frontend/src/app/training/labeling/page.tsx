'use client';

import React, { useState, useRef } from 'react';
import { Upload, Save, RotateCcw, Eye, Tag, MapPin, UserCheck, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { aiTrainingModule, TrainingLabels, PhysicalAttributes, BreedSpecificTraits, LocationData, ExpertValidation } from '@/lib/services/ai-training-module';
import { toast } from 'sonner';

interface LabelingFormData {
  labels: TrainingLabels;
  physicalAttributes: PhysicalAttributes;
  breedSpecificTraits: BreedSpecificTraits;
  locationData: LocationData;
  expertValidation: ExpertValidation;
}

const INDIAN_BREEDS = {
  cattle: [
    'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Rathi', 'Hariana', 'Kankrej',
    'Ongole', 'Krishna Valley', 'Deoni', 'Khillari', 'Amritmahal', 'Hallikar',
    'Malnad Gidda', 'Pulikulam', 'Umblachery', 'Kangayam', 'Bargur', 'Alambadi',
    'Jersey', 'Holstein Friesian', 'Crossbred'
  ],
  buffalo: [
    'Murrah', 'Nili-Ravi', 'Surti', 'Jaffarabadi', 'Bhadawari', 'Nagpuri',
    'Toda', 'Pandharpuri', 'Mehsana', 'Chilika', 'Kalahandi', 'Marathwada',
    'Sambalpuri', 'Godavari', 'Banni'
  ]
};

const BODY_COLORS = [
  'Black', 'White', 'Brown', 'Red', 'Gray', 'Cream', 'Fawn', 'Brindle',
  'Black and White', 'Brown and White', 'Red and White', 'Spotted'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function LabelingPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<LabelingFormData>({
    labels: {
      animalType: 'cattle',
      breed: '',
      age: 'adult',
      gender: 'female',
      healthCondition: 'good'
    },
    physicalAttributes: {
      bodyColor: [],
      hornType: 'none',
      bodySize: 'medium',
      bodyCondition: 'normal',
      distinctiveFeatures: []
    },
    breedSpecificTraits: {
      milkingCapability: 'medium',
      humpPresence: false,
      facialFeatures: [],
      earType: 'normal',
      tailType: 'normal'
    },
    locationData: {
      region: '',
      state: '',
      climate: 'tropical',
      farmType: 'dairy'
    },
    expertValidation: {
      validatedBy: '',
      confidenceLevel: 'medium',
      notes: ''
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFormData = (section: keyof LabelingFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleColorSelection = (color: string) => {
    const colors = formData.physicalAttributes.bodyColor;
    if (colors.includes(color)) {
      updateFormData('physicalAttributes', 'bodyColor', colors.filter(c => c !== color));
    } else {
      updateFormData('physicalAttributes', 'bodyColor', [...colors, color]);
    }
  };

  const handleFeatureToggle = (feature: string, section: 'physicalAttributes' | 'breedSpecificTraits') => {
    const field = section === 'physicalAttributes' ? 'distinctiveFeatures' : 'facialFeatures';
    const features = formData[section][field] as string[];
    
    if (features.includes(feature)) {
      updateFormData(section, field, features.filter(f => f !== feature));
    } else {
      updateFormData(section, field, [...features, feature]);
    }
  };

  const resetForm = () => {
    setFormData({
      labels: {
        animalType: 'cattle',
        breed: '',
        age: 'adult',
        gender: 'female',
        healthCondition: 'good'
      },
      physicalAttributes: {
        bodyColor: [],
        hornType: 'none',
        bodySize: 'medium',
        bodyCondition: 'normal',
        distinctiveFeatures: []
      },
      breedSpecificTraits: {
        milkingCapability: 'medium',
        humpPresence: false,
        facialFeatures: [],
        earType: 'normal',
        tailType: 'normal'
      },
      locationData: {
        region: '',
        state: '',
        climate: 'tropical',
        farmType: 'dairy'
      },
      expertValidation: {
        validatedBy: '',
        confidenceLevel: 'medium',
        notes: ''
      }
    });
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    if (!formData.labels.breed) {
      toast.error('Please specify the breed');
      return;
    }

    setIsSubmitting(true);

    try {
      await aiTrainingModule.uploadTrainingData(
        selectedImage,
        formData.labels,
        formData.physicalAttributes,
        formData.breedSpecificTraits,
        formData.locationData,
        formData.expertValidation
      );

      toast.success('Training data saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error saving training data:', error);
      toast.error('Failed to save training data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-600" />
              Data Labeling Interface
            </h1>
            <p className="text-muted-foreground mt-2">
              Detailed livestock image annotation for AI training
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={resetForm}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedImage || isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Training Data'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload and Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Image Upload & Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Selected livestock"
                      className="max-h-64 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedImage?.name}
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Upload Livestock Image</p>
                      <p className="text-sm text-muted-foreground">
                        Select a clear, high-quality image for labeling
                      </p>
                    </div>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant={imagePreview ? "outline" : "default"}
                  className="mt-4"
                >
                  {imagePreview ? 'Change Image' : 'Choose Image'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Annotation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="physical">Physical</TabsTrigger>
                  <TabsTrigger value="traits">Traits</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>

                {/* Basic Labels Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Animal Type</Label>
                      <Select 
                        value={formData.labels.animalType} 
                        onValueChange={(value: any) => updateFormData('labels', 'animalType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cattle">Cattle</SelectItem>
                          <SelectItem value="buffalo">Buffalo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Breed</Label>
                      <Select 
                        value={formData.labels.breed} 
                        onValueChange={(value) => updateFormData('labels', 'breed', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_BREEDS[formData.labels.animalType].map((breed) => (
                            <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Age Category</Label>
                      <Select 
                        value={formData.labels.age} 
                        onValueChange={(value: any) => updateFormData('labels', 'age', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calf">Calf</SelectItem>
                          <SelectItem value="young">Young</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select 
                        value={formData.labels.gender} 
                        onValueChange={(value: any) => updateFormData('labels', 'gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Health Condition</Label>
                      <Select 
                        value={formData.labels.healthCondition} 
                        onValueChange={(value: any) => updateFormData('labels', 'healthCondition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Physical Attributes Tab */}
                <TabsContent value="physical" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium mb-3 block">Body Colors</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {BODY_COLORS.map((color) => (
                          <div key={color} className="flex items-center space-x-2">
                            <Checkbox
                              id={color}
                              checked={formData.physicalAttributes.bodyColor.includes(color)}
                              onCheckedChange={() => handleColorSelection(color)}
                            />
                            <Label htmlFor={color} className="text-sm">{color}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Horn Type</Label>
                        <Select 
                          value={formData.physicalAttributes.hornType} 
                          onValueChange={(value: any) => updateFormData('physicalAttributes', 'hornType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Horns</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="curved">Curved</SelectItem>
                            <SelectItem value="straight">Straight</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Body Size</Label>
                        <Select 
                          value={formData.physicalAttributes.bodySize} 
                          onValueChange={(value: any) => updateFormData('physicalAttributes', 'bodySize', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 col-span-2">
                        <Label>Body Condition</Label>
                        <Select 
                          value={formData.physicalAttributes.bodyCondition} 
                          onValueChange={(value: any) => updateFormData('physicalAttributes', 'bodyCondition', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="thin">Thin</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="well-fed">Well-fed</SelectItem>
                            <SelectItem value="overweight">Overweight</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Distinctive Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['dished face', 'pendulous ears', 'dewlap', 'hump', 'white patches', 'facial markings'].map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={formData.physicalAttributes.distinctiveFeatures.includes(feature)}
                              onCheckedChange={() => handleFeatureToggle(feature, 'physicalAttributes')}
                            />
                            <Label htmlFor={feature} className="text-sm capitalize">{feature}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Breed Specific Traits Tab */}
                <TabsContent value="traits" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Milking Capability</Label>
                        <Select 
                          value={formData.breedSpecificTraits.milkingCapability} 
                          onValueChange={(value: any) => updateFormData('breedSpecificTraits', 'milkingCapability', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="very-high">Very High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Ear Type</Label>
                        <Select 
                          value={formData.breedSpecificTraits.earType} 
                          onValueChange={(value: any) => updateFormData('breedSpecificTraits', 'earType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="drooping">Drooping</SelectItem>
                            <SelectItem value="pendulous">Pendulous</SelectItem>
                            <SelectItem value="erect">Erect</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hump"
                        checked={formData.breedSpecificTraits.humpPresence}
                        onCheckedChange={(checked) => updateFormData('breedSpecificTraits', 'humpPresence', checked)}
                      />
                      <Label htmlFor="hump">Hump Present</Label>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">Facial Features</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['dished face', 'straight profile', 'roman nose', 'wide forehead'].map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={formData.breedSpecificTraits.facialFeatures.includes(feature)}
                              onCheckedChange={() => handleFeatureToggle(feature, 'breedSpecificTraits')}
                            />
                            <Label htmlFor={feature} className="text-sm capitalize">{feature}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Location & Expert Validation Tab */}
                <TabsContent value="location" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select 
                          value={formData.locationData.state} 
                          onValueChange={(value) => updateFormData('locationData', 'state', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Region/District</Label>
                        <Input
                          value={formData.locationData.region}
                          onChange={(e) => updateFormData('locationData', 'region', e.target.value)}
                          placeholder="Enter region or district"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Climate</Label>
                        <Select 
                          value={formData.locationData.climate} 
                          onValueChange={(value: any) => updateFormData('locationData', 'climate', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tropical">Tropical</SelectItem>
                            <SelectItem value="subtropical">Subtropical</SelectItem>
                            <SelectItem value="arid">Arid</SelectItem>
                            <SelectItem value="temperate">Temperate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Farm Type</Label>
                        <Select 
                          value={formData.locationData.farmType} 
                          onValueChange={(value: any) => updateFormData('locationData', 'farmType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dairy">Dairy Farm</SelectItem>
                            <SelectItem value="beef">Beef Farm</SelectItem>
                            <SelectItem value="mixed">Mixed Farm</SelectItem>
                            <SelectItem value="subsistence">Subsistence Farm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Expert Validation
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Validated By</Label>
                          <Input
                            value={formData.expertValidation.validatedBy}
                            onChange={(e) => updateFormData('expertValidation', 'validatedBy', e.target.value)}
                            placeholder="Expert name/title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Confidence Level</Label>
                          <Select 
                            value={formData.expertValidation.confidenceLevel} 
                            onValueChange={(value: any) => updateFormData('expertValidation', 'confidenceLevel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="very-high">Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Textarea
                          value={formData.expertValidation.notes}
                          onChange={(e) => updateFormData('expertValidation', 'notes', e.target.value)}
                          placeholder="Any additional observations or notes about this animal..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Current Selection Summary */}
        {selectedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Current Annotation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Basic Info</h5>
                  <div className="space-y-1">
                    <Badge variant="outline">{formData.labels.animalType}</Badge>
                    {formData.labels.breed && <Badge>{formData.labels.breed}</Badge>}
                    <Badge variant="secondary">{formData.labels.age} {formData.labels.gender}</Badge>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Physical</h5>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Colors: {formData.physicalAttributes.bodyColor.join(', ') || 'None selected'}</div>
                    <div>Horns: {formData.physicalAttributes.hornType}</div>
                    <div>Size: {formData.physicalAttributes.bodySize}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Traits</h5>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Milking: {formData.breedSpecificTraits.milkingCapability}</div>
                    <div>Hump: {formData.breedSpecificTraits.humpPresence ? 'Yes' : 'No'}</div>
                    <div>Ears: {formData.breedSpecificTraits.earType}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Location</h5>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>State: {formData.locationData.state || 'Not specified'}</div>
                    <div>Climate: {formData.locationData.climate}</div>
                    <div>Farm: {formData.locationData.farmType}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}