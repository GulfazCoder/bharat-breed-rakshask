'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Sparkles, Info, AlertCircle, CheckCircle, Zap, Brain, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Image from 'next/image';

// AI Classification Results Interface
interface ClassificationResult {
  animal_type: {
    prediction: string;
    confidence: number;
    confidence_level: string;
  };
  breed: {
    prediction: string;
    confidence: number;
    confidence_level: string;
    top_3: Array<{
      breed: string;
      confidence: number;
    }>;
    needs_verification: boolean;
    suggestion?: string;
  };
  age: {
    prediction: string;
    confidence: number;
    confidence_level: string;
  };
  gender: {
    prediction: string;
    confidence: number;
    confidence_level: string;
  };
  health: {
    prediction: string;
    confidence: number;
    confidence_level: string;
  };
  processing_time: number;
}

interface BreedInfo {
  id: number;
  breedName: string;
  category: 'Cattle' | 'Buffalo';
  origin: string;
  primaryUse: string;
  milkYield: string;
  bodyColor: string;
  uniqueTraits: string;
  conservationStatus: string;
}

export default function ClassificationPage() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [breedInfo, setBreedInfo] = useState<BreedInfo | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      setError('Unable to access camera. Please check permissions.');
      toast.error('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Stop camera after capture
    stopCamera();
    
    // Start classification immediately
    classifyImage(imageData);
  }, []);

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      classifyImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Mock AI Classification (replace with actual API call)
  const classifyImage = async (imageData: string) => {
    if (!imageData) return;
    
    setIsLoading(true);
    setError(null);
    setClassificationResult(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock classification result
      const mockResult: ClassificationResult = {
        animal_type: {
          prediction: 'cattle',
          confidence: 0.89,
          confidence_level: 'high'
        },
        breed: {
          prediction: 'Gir',
          confidence: 0.82,
          confidence_level: 'high',
          top_3: [
            { breed: 'Gir', confidence: 0.82 },
            { breed: 'Sahiwal', confidence: 0.14 },
            { breed: 'Red Sindhi', confidence: 0.04 }
          ],
          needs_verification: false
        },
        age: {
          prediction: 'adult',
          confidence: 0.76,
          confidence_level: 'medium'
        },
        gender: {
          prediction: 'female',
          confidence: 0.71,
          confidence_level: 'medium'
        },
        health: {
          prediction: 'healthy',
          confidence: 0.88,
          confidence_level: 'high'
        },
        processing_time: 1.8
      };
      
      setClassificationResult(mockResult);
      
      // Load breed information
      loadBreedInfo(mockResult.breed.prediction);
      
      toast.success(`Classified as ${mockResult.breed.prediction}! 🎉`);
      
    } catch (error) {
      console.error('Classification error:', error);
      setError('Classification failed. Please try again.');
      toast.error('Classification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Load breed information from database
  const loadBreedInfo = async (breedName: string) => {
    try {
      // Mock breed info (in production, this would fetch from your breeds database)
      const mockBreedInfo: BreedInfo = {
        id: 1,
        breedName: breedName,
        category: breedName === 'Murrah' ? 'Buffalo' : 'Cattle',
        origin: 'Gujarat, India',
        primaryUse: 'Milk',
        milkYield: '2000-3000 kg',
        bodyColor: 'Reddish dun with white patches',
        uniqueTraits: 'Prominent forehead, excellent dairy breed',
        conservationStatus: 'Vulnerable'
      };
      
      setBreedInfo(mockBreedInfo);
    } catch (error) {
      console.error('Error loading breed info:', error);
    }
  };

  const resetClassification = () => {
    setCapturedImage(null);
    setClassificationResult(null);
    setBreedInfo(null);
    setError(null);
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
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
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Classification
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600">
              <Zap className="w-3 h-3 mr-1" />
              AI Ready
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Image Capture Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Capture or Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!capturedImage ? (
              <div className="space-y-4">
                {/* Camera View */}
                {isCameraActive ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '400px' }}
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                      <Button
                        onClick={capturePhoto}
                        size="lg"
                        className="rounded-full w-16 h-16"
                      >
                        <Camera className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        size="lg"
                        className="rounded-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        size="lg"
                        className="h-20 flex-col"
                      >
                        <Camera className="w-8 h-8 mb-2" />
                        Take Photo
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="lg"
                        className="h-20 flex-col"
                      >
                        <Upload className="w-8 h-8 mb-2" />
                        Upload Image
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* Tips */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">📸 Tips for Best Results</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Ensure good lighting conditions</li>
                          <li>• Capture the full animal in frame</li>
                          <li>• Take photo from the side for best profile view</li>
                          <li>• Avoid blurry or shaky images</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full rounded-lg max-h-80 object-contain bg-gray-100"
                  />
                  <Button
                    onClick={resetClassification}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                
                {!isLoading && !classificationResult && (
                  <Button
                    onClick={() => classifyImage(capturedImage)}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Classify Animal
                  </Button>
                )}
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Analyzing Image...</h3>
                  <p className="text-muted-foreground">
                    AI is examining the animal characteristics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Classification Results */}
        {classificationResult && (
          <div className="space-y-6">
            {/* Main Classification Result */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Classification Complete
                  </span>
                  <Badge variant="outline">
                    {(classificationResult.processing_time * 1000).toFixed(0)}ms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Animal Type & Breed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Animal Type</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg capitalize">
                        {classificationResult.animal_type.prediction}
                      </span>
                      <Badge className={getConfidenceColor(classificationResult.animal_type.confidence_level)}>
                        {(classificationResult.animal_type.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Primary Breed</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">
                        {classificationResult.breed.prediction}
                      </span>
                      <Badge className={getConfidenceColor(classificationResult.breed.confidence_level)}>
                        {(classificationResult.breed.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    {classificationResult.breed.needs_verification && (
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Verification recommended
                      </p>
                    )}
                  </div>
                </div>

                {/* Top 3 Breed Predictions */}
                {classificationResult.breed.top_3 && (
                  <div>
                    <h4 className="font-semibold mb-2">Alternative Possibilities</h4>
                    <div className="space-y-2">
                      {classificationResult.breed.top_3.slice(1).map((breed, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{breed.breed}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={breed.confidence * 100} className="w-20 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {(breed.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Classifications */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <h5 className="font-semibold text-sm text-muted-foreground">AGE</h5>
                    <p className="text-lg capitalize">{classificationResult.age.prediction}</p>
                    <Badge size="sm" className={getConfidenceColor(classificationResult.age.confidence_level)}>
                      {(classificationResult.age.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="font-semibold text-sm text-muted-foreground">GENDER</h5>
                    <p className="text-lg capitalize">{classificationResult.gender.prediction}</p>
                    <Badge size="sm" className={getConfidenceColor(classificationResult.gender.confidence_level)}>
                      {(classificationResult.gender.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="font-semibold text-sm text-muted-foreground">HEALTH</h5>
                    <p className="text-lg capitalize">{classificationResult.health.prediction}</p>
                    <Badge size="sm" className={getConfidenceColor(classificationResult.health.confidence_level)}>
                      {(classificationResult.health.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breed Information */}
            {breedInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Breed Information - {breedInfo.breedName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="characteristics">Traits</TabsTrigger>
                      <TabsTrigger value="care">Care Guide</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold">Origin</h4>
                          <p className="text-muted-foreground">{breedInfo.origin}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Primary Use</h4>
                          <p className="text-muted-foreground">{breedInfo.primaryUse}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Milk Yield</h4>
                          <p className="text-muted-foreground">{breedInfo.milkYield}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Conservation Status</h4>
                          <Badge variant={breedInfo.conservationStatus === 'Critical' ? 'destructive' : 'secondary'}>
                            {breedInfo.conservationStatus}
                          </Badge>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="characteristics" className="space-y-4">
                      <div>
                        <h4 className="font-semibold">Body Color</h4>
                        <p className="text-muted-foreground">{breedInfo.bodyColor}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Unique Traits</h4>
                        <p className="text-muted-foreground">{breedInfo.uniqueTraits}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="care" className="space-y-4">
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">
                          Care guide information coming soon...
                        </p>
                        <Button variant="outline" className="mt-4">
                          <ChevronRight className="w-4 h-4 mr-2" />
                          View Full Profile
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}