'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  Image as ImageIcon, 
  ArrowLeft,
  Moon,
  Sun,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ClassificationResult {
  breedName: string;
  confidence: number;
  category: 'Cattle' | 'Buffalo';
  characteristics: string[];
}

const ClassifyPage: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setClassificationResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // For now, we'll simulate camera capture by opening file picker
    // In a real app, this would open the camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClassify = async () => {
    if (!selectedImage) return;
    
    setIsClassifying(true);
    
    // Simulate AI classification with delay
    setTimeout(() => {
      // Mock classification result
      const mockResult: ClassificationResult = {
        breedName: "Cattle",
        confidence: 95,
        category: "Cattle",
        characteristics: [
          "Good dairy potential",
          "Medium body size",
          "Heat tolerant",
          "Disease resistant"
        ]
      };
      
      setClassificationResult(mockResult);
      setIsClassifying(false);
    }, 2000);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setClassificationResult(null);
    setShowHeatmap(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">Classify</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {!selectedImage ? (
          <>
            {/* Upload Image Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Upload Image</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleCameraCapture}
                  className="accessibility-button flex-col space-y-2 h-auto py-6"
                  variant="outline"
                >
                  <Camera className="w-8 h-8" />
                  <span>Camera</span>
                </Button>
                
                <Button
                  onClick={handleGallerySelect}
                  className="accessibility-button flex-col space-y-2 h-auto py-6"
                  variant="outline"
                >
                  <ImageIcon className="w-8 h-8" />
                  <span>Gallery</span>
                </Button>
              </div>
            </div>
            
            {/* Instructions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Tips for Best Results</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Ensure good lighting</li>
                  <li>• Capture the full animal in frame</li>
                  <li>• Avoid blurry images</li>
                  <li>• Take photo from the side for best profile view</li>
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Image Display */}
            <div className="relative">
              <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Selected animal"
                  fill
                  className="object-cover"
                />
                
                {/* Camera overlay guides */}
                <div className="camera-overlay">
                  <div className="camera-guide absolute inset-4" />
                </div>
                
                {/* Heatmap toggle */}
                {classificationResult && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setShowHeatmap(!showHeatmap)}
                  >
                    Heatmap
                  </Button>
                )}
                
                {/* Heatmap overlay */}
                {showHeatmap && classificationResult && (
                  <div className="heatmap-overlay absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-transparent" />
                )}
              </div>
            </div>

            {/* Classify Button */}
            {!classificationResult && (
              <Button
                onClick={handleClassify}
                disabled={isClassifying}
                className="w-full accessibility-button bg-primary hover:bg-primary/90"
              >
                {isClassifying ? 'Classifying...' : 'Classify Now'}
              </Button>
            )}

            {/* Loading Progress */}
            {isClassifying && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Analyzing image...</span>
                      <span className="text-sm text-muted-foreground">AI Processing</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Classification Result */}
            {classificationResult && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Result</h2>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center">
                          <Image
                            src="/api/placeholder/64/64"
                            alt="Cattle icon"
                            width={48}
                            height={48}
                            className="rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground">
                            {classificationResult.breedName}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Confidence: {classificationResult.confidence}%
                          </p>
                          
                          {/* Confidence Progress */}
                          <Progress 
                            value={classificationResult.confidence} 
                            className="h-2 mb-3" 
                          />
                          
                          {/* Characteristics */}
                          <div className="flex flex-wrap gap-2">
                            {classificationResult.characteristics.map((characteristic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {characteristic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="icon">
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Another
                  </Button>
                  <Button>
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ClassifyPage;