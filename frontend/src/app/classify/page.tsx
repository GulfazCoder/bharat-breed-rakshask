'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Sparkles, Info, AlertCircle, CheckCircle, Zap, Brain, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

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
  // Router for navigation
  const router = useRouter();
  
  // Language context
  const { language, t } = useLanguage();
  
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

  // Check if we're in a secure context for camera access
  const isSecureContext = () => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  };

  // Check if device supports camera
  const isCameraSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };

  // Detect mobile device
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768 && 'ontouchstart' in window);
  };

  // Camera functions with enhanced mobile and network support
  const startCamera = async () => {
    try {
      setError(null);
      
      // Check browser compatibility first
      if (!isCameraSupported()) {
        throw new Error('Camera is not supported in this browser. Please try a modern browser like Chrome, Firefox, or Safari.');
      }

      // Check secure context for network access
      if (!isSecureContext()) {
        throw new Error('Camera access requires a secure connection (HTTPS). Please use HTTPS or access via localhost.');
      }
      
      // Log device information for debugging
      console.log('Device info:', {
        isMobile: isMobileDevice(),
        isSecure: isSecureContext(),
        userAgent: navigator.userAgent,
        protocol: window.location.protocol
      });
      
      // Try to enumerate devices first (helps with permissions)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.length);
        
        if (videoDevices.length === 0) {
          // Still proceed as some browsers don't show devices until permission is granted
          console.warn('No cameras detected, but continuing anyway (may be permission related)');
        }
      } catch (enumError) {
        console.warn('Could not enumerate devices:', enumError);
      }
      
      let stream;
      const isMobile = isMobileDevice();
      
      // Different camera configurations for mobile vs desktop
      const cameraConfigs = isMobile ? [
        // Mobile-optimized configurations
        {
          video: {
            facingMode: 'environment', // Back camera for better livestock photos
            width: { ideal: 1920, min: 720 },
            height: { ideal: 1080, min: 480 },
            frameRate: { ideal: 30, min: 15 }
          }
        },
        {
          video: {
            facingMode: 'user', // Front camera fallback
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        },
        {
          video: {
            width: { ideal: 1280, min: 480 },
            height: { ideal: 720, min: 320 }
          }
        },
        { video: true } // Basic fallback
      ] : [
        // Desktop configurations
        {
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 }
          }
        },
        {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        { video: true }
      ];
      
      // Try each configuration until one works
      for (let i = 0; i < cameraConfigs.length; i++) {
        const config = cameraConfigs[i];
        try {
          console.log(`Trying camera config ${i + 1}:`, config);
          stream = await navigator.mediaDevices.getUserMedia(config);
          console.log(`Camera config ${i + 1} successful!`);
          break;
        } catch (configError: any) {
          console.warn(`Camera config ${i + 1} failed:`, configError);
          
          // If it's a permission error, don't try other configs
          if (configError.name === 'NotAllowedError' || configError.name === 'PermissionDeniedError') {
            throw configError;
          }
          continue;
        }
      }
      
      if (!stream) {
        throw new Error('Unable to access camera with any configuration');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Important for iOS
        videoRef.current.setAttribute('muted', 'true'); // Required for autoplay on mobile
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsCameraActive(true);
                  toast.success('Camera ready! 📸');
                })
                .catch((playError) => {
                  console.error('Play failed:', playError);
                  setError('Failed to start video playback. Please try again.');
                });
            } else {
              setIsCameraActive(true);
              toast.success('Camera ready! 📸');
            }
          }
        };
        
        // Handle video errors
        videoRef.current.onerror = (e) => {
          console.error('Video error:', e);
          setError('Video stream error. Please try again.');
          stopCamera();
        };
      }
      
    } catch (error: any) {
      console.error('Camera error:', error);
      
      // Provide specific error messages with solutions
      let errorMessage = 'Unable to access camera.';
      let solution = '';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied.';
        solution = isMobileDevice() 
          ? 'Please allow camera access in your browser settings and refresh the page.'
          : 'Please click "Allow" when prompted for camera permission.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found.';
        solution = isMobileDevice()
          ? 'Please ensure your device has a working camera.'
          : 'Please connect a camera and try again.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is busy.';
        solution = 'Please close other applications using the camera and try again.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Camera settings not supported.';
        solution = 'Your camera doesn\'t support the required settings. Try using the upload feature instead.';
      } else if (error.message.includes('secure')) {
        errorMessage = 'Secure connection required.';
        solution = 'Camera access requires HTTPS. Please access this page via HTTPS or use localhost.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      const fullError = solution ? `${errorMessage} ${solution}` : errorMessage;
      setError(fullError);
      toast.error(errorMessage);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Test camera availability
  const testCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        toast.error('No cameras detected on this device');
        return;
      }
      
      // Test basic camera access
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
      testStream.getTracks().forEach(track => track.stop());
      
      toast.success(`${videoDevices.length} camera(s) detected and accessible! ✅`);
      
    } catch (error: any) {
      console.error('Camera test failed:', error);
      toast.error(`Camera test failed: ${error.message}`);
    }
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Camera not ready. Please try again.');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast.error('Canvas not supported in this browser.');
      return;
    }

    try {
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        toast.error('Camera is still loading. Please wait a moment.');
        return;
      }

      // Set canvas dimensions to match video
      const videoWidth = video.videoWidth || video.clientWidth || 640;
      const videoHeight = video.videoHeight || video.clientHeight || 480;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Convert to base64 image with good quality
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      if (imageData === 'data:,') {
        toast.error('Failed to capture image. Please try again.');
        return;
      }
      
      setCapturedImage(imageData);
      toast.success(t('photoCapturing') + ' 📸');
      
      // Stop camera after capture
      stopCamera();
      
      // Start classification immediately
      classifyImage(imageData);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture photo. Please try again.');
    }
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
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              {t('aiClassification')}
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
                      muted
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '400px', minHeight: '200px' }}
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
                        className="h-20 flex-col btn-enhanced hover:border-cyber-green-400 hover:bg-cyber-green-50 transition-all duration-300"
                      >
                        <Camera className="w-8 h-8 mb-2 text-cyber-green-600" />
                        <span className="text-cyber-green-700 font-medium">{t('takePhoto')}</span>
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="lg"
                        className="h-20 flex-col btn-enhanced hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                      >
                        <Upload className="w-8 h-8 mb-2 text-blue-600" />
                        <span className="text-blue-700 font-medium">{t('uploadImage')}</span>
                      </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {/* Tips & Camera Test */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">📸 Tips for Best Results</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Ensure good lighting conditions</li>
                              <li>• Capture the full animal in frame</li>
                              <li>• Take photo from the side for best profile view</li>
                              <li>• Avoid blurry or shaky images</li>
                            </ul>
                          </div>
                          <div className="flex-shrink-0">
                            <p className="text-sm text-muted-foreground mb-2">Having camera issues?</p>
                            <Button
                              onClick={testCameraAvailability}
                              variant="outline"
                              size="sm"
                              className="text-sm btn-enhanced hover:border-purple-400 hover:bg-purple-50"
                            >
                              <span className="text-purple-700">Test Camera 🔍</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Mobile & Network Access Information */}
                    {(!isSecureContext() || !isCameraSupported()) && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <div className="space-y-2">
                            <p className="font-medium">📱 Camera Access Information:</p>
                            <ul className="text-sm space-y-1 ml-4">
                              {!isSecureContext() && (
                                <li>• <strong>HTTPS Required:</strong> Camera access needs a secure connection for network devices. Use localhost or HTTPS.</li>
                              )}
                              {!isCameraSupported() && (
                                <li>• <strong>Browser Support:</strong> Please use a modern browser (Chrome, Firefox, Safari, Edge).</li>
                              )}
                              {isMobileDevice() && (
                                <li>• <strong>Mobile Users:</strong> Ensure camera permissions are enabled in browser settings.</li>
                              )}
                              <li>• <strong>Alternative:</strong> You can always upload a photo from your device gallery using the upload button.</li>
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Network Access Instructions */}
                    {window.location.hostname !== 'localhost' && window.location.protocol === 'http:' && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="space-y-2">
                            <p className="font-medium">🌐 For Network Device Access:</p>
                            <div className="text-sm space-y-1">
                              <p>To use the camera from other devices on your network:</p>
                              <ol className="ml-4 space-y-1">
                                <li>1. Stop the current server</li>
                                <li>2. Run: <code className="bg-white px-1 rounded">npm run generate-certs</code></li>
                                <li>3. Run: <code className="bg-white px-1 rounded">npm run dev:https</code></li>
                                <li>4. Access via: <code className="bg-white px-1 rounded">https://YOUR_IP:3443</code></li>
                              </ol>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
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
          <Card className="border-2 border-cyber-green-200 bg-gradient-to-br from-cyber-green-50 to-blue-50">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-cyber-green-200 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 border-4 border-cyber-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <Brain className="w-8 h-8 text-cyber-green-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyber-green-400 to-blue-400 rounded-full opacity-20 animate-ping"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyber-green-800">🧠 AI is Analyzing...</h3>
                  <div className="space-y-1">
                    <p className="text-cyber-green-700 font-medium">
                      Identifying breed characteristics
                    </p>
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-cyber-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-cyber-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-cyber-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Image processed</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <LoadingSpinner size="sm" />
                    <span>Analyzing features</span>
                  </div>
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
                    <Badge className={`text-xs ${getConfidenceColor(classificationResult.age.confidence_level)}`}>
                      {(classificationResult.age.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="font-semibold text-sm text-muted-foreground">GENDER</h5>
                    <p className="text-lg capitalize">{classificationResult.gender.prediction}</p>
                    <Badge className={`text-xs ${getConfidenceColor(classificationResult.gender.confidence_level)}`}>
                      {(classificationResult.gender.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <h5 className="font-semibold text-sm text-muted-foreground">HEALTH</h5>
                    <p className="text-lg capitalize">{classificationResult.health.prediction}</p>
                    <Badge className={`text-xs ${getConfidenceColor(classificationResult.health.confidence_level)}`}>
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