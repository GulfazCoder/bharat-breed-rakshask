'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Calendar as CalendarIcon, Heart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Link from 'next/link';
import { BreedingFormData } from '@/lib/types';
import { breedingSlice } from '@/lib/store/slices/breedingSlice';

const AddBreedingRecordPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState<BreedingFormData>({
    animalId: '',
    matingDate: '',
    mateId: '',
    breedingMethod: 'Natural',
    expectedDueDate: '',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock animals data (would come from animals slice in complete implementation)
  const mockAnimals = [
    { id: 'animal-1', name: 'Ganga', breed: 'Gir', age: '4 years' },
    { id: 'animal-2', name: 'Lakshmi', breed: 'Sahiwal', age: '3 years' },
    { id: 'animal-3', name: 'Shyama', breed: 'Red Sindhi', age: '5 years' },
    { id: 'animal-4', name: 'Kamdhenu', breed: 'Holstein', age: '6 years' },
  ];

  const handleFormChange = (field: keyof BreedingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.animalId) {
      errors.animalId = 'Please select an animal';
    }
    
    if (!formData.matingDate) {
      errors.matingDate = 'Please select mating date';
    }
    
    if (!formData.expectedDueDate) {
      errors.expectedDueDate = 'Please calculate and enter expected due date';
    }
    
    // Validate dates
    if (formData.matingDate && formData.expectedDueDate) {
      const matingDate = new Date(formData.matingDate);
      const dueDate = new Date(formData.expectedDueDate);
      
      if (dueDate <= matingDate) {
        errors.expectedDueDate = 'Due date must be after mating date';
      }
      
      // Check if due date is approximately 280 days (9+ months) after mating
      const diffTime = dueDate.getTime() - matingDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 270 || diffDays > 290) {
        errors.expectedDueDate = 'Due date should be approximately 280 days (9+ months) after mating';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateDueDate = (matingDate: string) => {
    if (!matingDate) return '';
    
    const mating = new Date(matingDate);
    const dueDate = new Date(mating);
    dueDate.setDate(dueDate.getDate() + 280); // Cattle gestation period
    
    return dueDate.toISOString().split('T')[0];
  };

  const handleMatingDateChange = (date: string) => {
    handleFormChange('matingDate', date);
    
    // Auto-calculate due date
    const calculatedDueDate = calculateDueDate(date);
    if (calculatedDueDate) {
      handleFormChange('expectedDueDate', calculatedDueDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create breeding record
      const breedingRecord = {
        id: `breeding-${Date.now()}`,
        animalId: formData.animalId,
        matingDate: new Date(formData.matingDate),
        expectedDueDate: new Date(formData.expectedDueDate),
        mateId: formData.mateId || undefined,
        breedingMethod: formData.breedingMethod,
        pregnancyStatus: 'Expected' as const,
        notes: formData.notes || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      dispatch(breedingSlice.actions.addBreedingRecord(breedingRecord));
      
      // Add calendar event for due date
      const calendarEvent = {
        title: `${mockAnimals.find(a => a.id === formData.animalId)?.name} - Due Date`,
        start: new Date(formData.expectedDueDate),
        end: new Date(formData.expectedDueDate),
        type: 'delivery' as const,
        animalId: formData.animalId,
        animalName: mockAnimals.find(a => a.id === formData.animalId)?.name || 'Unknown',
        description: 'Expected delivery date',
        notificationEnabled: true
      };
      
      // Add to calendar (this would be a proper async action in complete implementation)
      // dispatch(addCalendarEvent(calendarEvent));
      
      toast.success('Breeding record added successfully!');
      router.push('/breeding');
      
    } catch (error) {
      toast.error('Failed to add breeding record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAnimal = mockAnimals.find(animal => animal.id === formData.animalId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link href="/breeding">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Add Breeding Record</h1>
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Breeding Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Animal Selection */}
              <div className="space-y-2">
                <Label htmlFor="animal-select">Select Animal *</Label>
                <Select
                  value={formData.animalId}
                  onValueChange={(value) => handleFormChange('animalId', value)}
                >
                  <SelectTrigger className={formErrors.animalId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose animal for breeding" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAnimals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{animal.name}</span>
                          <span className="text-sm text-muted-foreground">{animal.breed} • {animal.age}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.animalId && (
                  <p className="text-sm text-red-600">{formErrors.animalId}</p>
                )}
              </div>

              {/* Selected Animal Info */}
              {selectedAnimal && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected: <strong>{selectedAnimal.name}</strong> ({selectedAnimal.breed}, {selectedAnimal.age})
                  </AlertDescription>
                </Alert>
              )}

              {/* Breeding Method */}
              <div className="space-y-2">
                <Label htmlFor="breeding-method">Breeding Method *</Label>
                <Select
                  value={formData.breedingMethod}
                  onValueChange={(value: any) => handleFormChange('breedingMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select breeding method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Natural">🐄 Natural Breeding</SelectItem>
                    <SelectItem value="AI">🧪 Artificial Insemination (AI)</SelectItem>
                    <SelectItem value="ET">🔬 Embryo Transfer (ET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mate Selection (for Natural breeding) */}
              {formData.breedingMethod === 'Natural' && (
                <div className="space-y-2">
                  <Label htmlFor="mate-select">Select Mate (Optional)</Label>
                  <Select
                    value={formData.mateId || ''}
                    onValueChange={(value) => handleFormChange('mateId', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose mate (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific mate</SelectItem>
                      {mockAnimals.filter(animal => animal.id !== formData.animalId).map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.breed})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mating-date">Mating Date *</Label>
                  <Input
                    id="mating-date"
                    type="date"
                    value={formData.matingDate}
                    onChange={(e) => handleMatingDateChange(e.target.value)}
                    className={formErrors.matingDate ? 'border-red-500' : ''}
                    max={new Date().toISOString().split('T')[0]} // Can't be in the future
                  />
                  {formErrors.matingDate && (
                    <p className="text-sm text-red-600">{formErrors.matingDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Expected Due Date *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={formData.expectedDueDate}
                    onChange={(e) => handleFormChange('expectedDueDate', e.target.value)}
                    className={formErrors.expectedDueDate ? 'border-red-500' : ''}
                  />
                  {formErrors.expectedDueDate && (
                    <p className="text-sm text-red-600">{formErrors.expectedDueDate}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Cattle gestation period: ~280 days (9+ months)
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this breeding..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Actions */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Breeding Record
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/breeding')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Breeding Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cattle Gestation Period:</span>
                <span className="font-medium">280 days (~9.3 months)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Early Pregnancy Check:</span>
                <span className="font-medium">30-35 days after mating</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mid-pregnancy Check:</span>
                <span className="font-medium">150-180 days after mating</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pre-calving Care:</span>
                <span className="font-medium">2-4 weeks before due date</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBreedingRecordPage;