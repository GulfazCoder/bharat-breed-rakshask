'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface DataCollectionFormProps {
  imageData: string;
  onSubmit: (annotation: any) => void;
  onCancel: () => void;
}

export function DataCollectionForm({ imageData, onSubmit, onCancel }: DataCollectionFormProps) {
  const [annotation, setAnnotation] = useState({
    breed: '',
    animalType: '',
    age: '',
    gender: '',
    health: '',
    location: '',
    farmerName: '',
    phoneNumber: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!annotation.breed || !annotation.animalType) {
      toast.error('Please fill in required fields (Breed and Animal Type)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Add geolocation if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const location = `${position.coords.latitude},${position.coords.longitude}`;
          setAnnotation(prev => ({ ...prev, location }));
        });
      }

      await onSubmit({
        ...annotation,
        imageData,
        timestamp: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        confidence: 1.0 // User-provided data has high confidence
      });

      toast.success('Training data submitted successfully! 🎉');
    } catch (error) {
      console.error('Failed to submit training data:', error);
      toast.error('Failed to submit training data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📚 Contribute Training Data
          <span className="text-sm font-normal text-muted-foreground">
            Help improve AI accuracy
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Preview */}
          <div className="flex justify-center mb-4">
            <img 
              src={imageData} 
              alt="Livestock" 
              className="max-w-xs rounded-lg border"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breed - Required */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Breed Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Gir, Holstein, Murrah"
                value={annotation.breed}
                onChange={(e) => setAnnotation({...annotation, breed: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            {/* Animal Type - Required */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Animal Type <span className="text-red-500">*</span>
              </label>
              <select 
                value={annotation.animalType}
                onChange={(e) => setAnnotation({...annotation, animalType: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Animal Type</option>
                <option value="cattle">Cattle</option>
                <option value="buffalo">Buffalo</option>
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium mb-1">Age Group</label>
              <select 
                value={annotation.age}
                onChange={(e) => setAnnotation({...annotation, age: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Age</option>
                <option value="calf">Calf (0-1 year)</option>
                <option value="young">Young (1-3 years)</option>
                <option value="adult">Adult (3-8 years)</option>
                <option value="mature">Mature (8+ years)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select 
                value={annotation.gender}
                onChange={(e) => setAnnotation({...annotation, gender: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Health */}
            <div>
              <label className="block text-sm font-medium mb-1">Health Status</label>
              <select 
                value={annotation.health}
                onChange={(e) => setAnnotation({...annotation, health: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Health</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Farmer Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Farmer Name</label>
              <input
                type="text"
                placeholder="Optional"
                value={annotation.farmerName}
                onChange={(e) => setAnnotation({...annotation, farmerName: e.target.value})}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              placeholder="Any special characteristics, health conditions, or other observations..."
              value={annotation.notes}
              onChange={(e) => setAnnotation({...annotation, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Training Data 📚'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
