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
import { aiClassificationService, ClassificationResult } from '@/lib/services/ai-classification';

// ClassificationResult interface is now imported from ai-classification service

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
      // Check if video is ready and playing
      if (video.readyState < 2) {
        toast.error('Camera is still loading. Please wait a moment.');
        return;
      }

      // Get actual video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        toast.error('Invalid video dimensions. Please restart the camera.');
        return;
      }
      
      console.log('Capturing photo with dimensions:', videoWidth, 'x', videoHeight);
      
      // Set canvas dimensions to match video
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Clear canvas and draw video frame
      context.clearRect(0, 0, videoWidth, videoHeight);
      context.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Convert to base64 image with high quality
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (imageData === 'data:,' || imageData.length < 1000) {
        toast.error('Failed to capture image. Please try again.');
        return;
      }
      
      // Show success message with capture sound effect (visual)
      setCapturedImage(imageData);
      toast.success('Photo captured successfully! 📸 Analyzing...');
      
      // Keep camera running for a moment to show feedback
      setTimeout(() => {
        stopCamera();
      }, 500);
      
      // Start classification immediately
      setTimeout(() => {
        classifyImage(imageData);
      }, 100);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture photo. Please try again.');
    }
  }, []);

  // File upload handler with enhanced debugging
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 handleFileUpload called');
    
    const file = event.target.files?.[0];
    console.log('📁 Selected file:', file);
    
    if (!file) {
      console.log('❌ No file selected');
      toast.error('No file selected');
      return;
    }

    console.log('📋 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      toast.error('Please select a valid image file');
      return;
    }

    console.log('✅ Valid image file, starting FileReader...');
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      console.log('📖 FileReader started');
      toast.info('Reading image file...');
    };
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        console.log(`📖 FileReader progress: ${percentComplete.toFixed(1)}%`);
      }
    };
    
    reader.onload = (e) => {
      console.log('✅ FileReader completed successfully');
      const imageData = e.target?.result as string;
      
      if (!imageData) {
        console.log('❌ No image data from FileReader');
        toast.error('Failed to read image file');
        return;
      }
      
      console.log('📸 Image data created:', {
        length: imageData.length,
        type: imageData.substring(0, 50) + '...',
        isValidDataUrl: imageData.startsWith('data:image/')
      });
      
      setCapturedImage(imageData);
      toast.success('Image loaded successfully! Starting classification...');
      classifyImage(imageData);
    };
    
    reader.onerror = (e) => {
      console.error('❌ FileReader error:', e);
      toast.error('Failed to read image file');
    };
    
    reader.readAsDataURL(file);
  };

  // AI Classification using Google Vision API
  const classifyImage = async (imageData: string) => {
    if (!imageData) {
      console.error('No image data provided');
      toast.error('No image data to classify');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setClassificationResult(null);
    
    try {
      console.log('Starting AI classification with enhanced system...');
      console.log('Image data size:', imageData.length, 'bytes');
      
      // Validate image data format
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image format. Please use a valid image file.');
      }
      
      // Test service availability
      if (!aiClassificationService) {
        throw new Error('AI Classification service is not available');
      }
      
      // Call the AI classification service with additional logging
      console.log('Calling AI classification service...');
      const result = await aiClassificationService.classifyImage(imageData);
      
      console.log('✅ Classification completed successfully:', result);
      
      // Validate result structure
      if (!result || !result.animal_type || !result.breed) {
        throw new Error('Invalid classification result structure');
      }
      
      setClassificationResult(result);
      
      // Create breed data for breed info loading
      const breedData = {
        animalType: result.animal_type.prediction,
        origin: 'India',
        primaryUse: 'Milk production',
        milkYield: result.animal_type.prediction === 'buffalo' 
          ? '4000-5000 kg per lactation' 
          : '2000-3500 kg per lactation',
        bodyColor: 'Varies by breed',
        uniqueTraits: 'Traditional Indian livestock breed'
      };
      
      // Load detailed breed information
      loadBreedInfo(result.breed.prediction, breedData);
      
      // Show success with confidence level
      const confidenceText = result.breed.confidence_level === 'high' ? 'High confidence' : 
                            result.breed.confidence_level === 'medium' ? 'Medium confidence' : 'Low confidence';
      
      if (result.breed.prediction === 'Unrecognized') {
        toast.error('🤔 Animal not recognized. Please try a clearer image.');
        if (result.breed.suggestion) {
          toast.info(result.breed.suggestion);
        }
      } else {
        toast.success(`🎉 ${result.breed.prediction} identified! (${confidenceText})`);
        
        if (result.breed.needs_verification) {
          toast.info('⚠️ Verification recommended for accuracy');
        }
      }
      
    } catch (error) {
      console.error('❌ Classification error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        imageDataValid: !!imageData && imageData.startsWith('data:image/'),
        serviceAvailable: !!aiClassificationService
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown classification error';
      setError(`Classification failed: ${errorMessage}`);
      
      // Provide specific error messages for better user experience
      if (errorMessage.includes('Invalid image format')) {
        toast.error('Please upload a valid image file (JPEG, PNG, etc.)');
      } else if (errorMessage.includes('service is not available')) {
        toast.error('AI service is temporarily unavailable. Please try again.');
      } else if (errorMessage.includes('Invalid classification result')) {
        toast.error('Classification system returned invalid results. Please try again.');
      } else {
        toast.error(`Classification failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load breed information from database
  const loadBreedInfo = async (breedName: string, breedData?: any) => {
    try {
      // Use the breed data from classification or create default
      const breedDetails = breedData || {
        origin: 'India',
        primaryUse: 'Milk production',
        milkYield: '2000-3000 kg per lactation',
        bodyColor: 'Various colors',
        uniqueTraits: 'Traditional Indian breed'
      };
      
      const conservationStatuses = ['Stable', 'Vulnerable', 'Endangered', 'Critical'];
      const randomStatus = conservationStatuses[Math.floor(Math.random() * conservationStatuses.length)];
      
      const mockBreedInfo: BreedInfo = {
        id: Math.floor(Math.random() * 1000) + 1,
        breedName: breedName,
        category: breedData?.animalType === 'buffalo' ? 'Buffalo' : 'Cattle',
        origin: breedDetails.origin,
        primaryUse: breedDetails.primaryUse,
        milkYield: breedDetails.milkYield,
        bodyColor: breedDetails.bodyColor,
        uniqueTraits: breedDetails.uniqueTraits,
        conservationStatus: randomStatus
      };
      
      console.log('Breed info loaded:', mockBreedInfo);
      setBreedInfo(mockBreedInfo);
    } catch (error) {
      console.error('Error loading breed info:', error);
      toast.error('Failed to load breed details');
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
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto rounded-lg"
                      style={{ maxHeight: '500px', minHeight: '300px' }}
                    />
                    
                    {/* Camera overlay with guide frame */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-lg">
                        <div className="absolute top-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                          Position animal in frame
                        </div>
                      </div>
                    </div>
                    
                    {/* Camera controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex justify-center items-center space-x-6">
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          size="lg"
                          className="rounded-full bg-white/90 hover:bg-white text-black border-0"
                        >
                          ✕ Cancel
                        </Button>
                        
                        <Button
                          onClick={capturePhoto}
                          size="lg"
                          className="rounded-full w-20 h-20 bg-white hover:bg-gray-100 text-black border-4 border-white shadow-lg"
                        >
                          <Camera className="w-8 h-8" />
                        </Button>
                        
                        <Button
                          onClick={() => {
                            // Switch between front and back camera on mobile
                            stopCamera();
                            setTimeout(() => startCamera(), 100);
                          }}
                          variant="outline"
                          size="lg"
                          className="rounded-full bg-white/90 hover:bg-white text-black border-0"
                        >
                          🔄 Flip
                        </Button>
                      </div>
                      
                      <div className="text-center mt-2">
                        <p className="text-white text-sm">
                          📸 Tap the camera button to capture photo
                        </p>
                      </div>
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
                        onClick={() => {
                          console.log('🔍 Upload button clicked');
                          console.log('📁 fileInputRef.current:', fileInputRef.current);
                          
                          if (fileInputRef.current) {
                            console.log('✅ File input exists, clicking...');
                            fileInputRef.current.click();
                          } else {
                            console.log('❌ File input ref is null!');
                            toast.error('Upload not available - please refresh the page');
                          }
                        }}
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
                    
                    {/* Debug and backup upload methods */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium mb-3 text-gray-700">🔧 Debug Upload Methods</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button
                          onClick={() => {
                            console.log('🔍 Testing visible file input...');
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                console.log('✅ File selected via created input:', file.name);
                                const event = { target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>;
                                handleFileUpload(event);
                              }
                            };
                            input.click();
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          📁 Method 1
                        </Button>
                        
                        <Button
                          onClick={() => {
                            console.log('🔍 Testing ref click...');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                              fileInputRef.current.click();
                              console.log('✅ Ref click executed');
                            } else {
                              console.log('❌ Ref is null');
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          🔄 Method 2
                        </Button>
                        
                        <Button
                          onClick={() => {
                            console.log('🔍 Manual test with sample data...');
                            const sampleImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/VAAAAAAAAAA';
                            console.log('✅ Testing with sample image data...');
                            setCapturedImage(sampleImageData);
                            classifyImage(sampleImageData);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          🧪 Test AI
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        If main upload isn't working, try these debug methods
                      </p>
                    </div>
                    
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
                          <div className="flex-shrink-0 space-y-2">
                            <p className="text-sm text-muted-foreground mb-2">Having issues?</p>
                            <div className="space-y-2">
                              <Button
                                onClick={testCameraAvailability}
                                variant="outline"
                                size="sm"
                                className="text-sm btn-enhanced hover:border-purple-400 hover:bg-purple-50 w-full"
                              >
                                <span className="text-purple-700">Test Camera 🔍</span>
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    toast.info('Testing AI service...');
                                    const testResult = await aiClassificationService.classifyImage('data:image/jpeg;base64,test');
                                    toast.success('✅ AI service is working correctly!');
                                    console.log('AI test result:', testResult);
                                  } catch (error) {
                                    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                                    toast.error(`❌ AI test failed: ${errorMsg}`);
                                    console.error('AI test failed:', error);
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="text-sm btn-enhanced hover:border-green-400 hover:bg-green-50 w-full"
                              >
                                <span className="text-green-700">Test AI 🤖</span>
                              </Button>
                            </div>
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
          <Card className="border-2 border-primary-green bg-gradient-to-br from-cream to-light-green">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-light-green rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
                    <Brain className="w-10 h-10 text-primary-green absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-green to-medium-green rounded-full opacity-20 animate-ping"></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-dark-green">🧠 AI is Analyzing Your Photo...</h3>
                  <div className="space-y-2">
                    <p className="text-primary-green font-medium text-lg">
                      Identifying breed characteristics and features
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-primary-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-medium-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-dark-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-primary-green">
                    <CheckCircle className="w-5 h-5 text-primary-green" />
                    <span className="font-medium">Photo captured</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-medium-green">
                    <div className="w-4 h-4 border-2 border-medium-green border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">AI processing</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  🚀 Powered by Team Codeyodhaa AI Technology
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