'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Brain, Database, TrendingUp, Users, CheckCircle, AlertCircle, BarChart, Download, Settings, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  aiTrainingModule, 
  TrainingDataPoint, 
  ModelTrainingConfig 
} from '@/lib/services/ai-training-module';
import { toast } from 'sonner';

interface TrainingStats {
  totalSamples: number;
  dataQuality: {
    totalSamples: number;
    animalTypeDistribution: Record<string, number>;
    breedDistribution: Record<string, number>;
    expertValidatedPercentage: number;
    dataQualityScore: number;
  };
  recommendedNextSteps: string[];
}

export default function TrainingPage() {
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadTrainingStats();
  }, []);

  const loadTrainingStats = async () => {
    try {
      setIsLoading(true);
      const stats = await aiTrainingModule.getTrainingStatistics();
      setTrainingStats(stats);
    } catch (error) {
      console.error('Error loading training stats:', error);
      toast.error('Failed to load training statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadProgress(0);
    toast.info('Starting training data upload...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Example training data (in real scenario, this would come from a form)
        const exampleTrainingData = {
          labels: {
            animalType: 'cattle' as const,
            breed: 'Gir',
            age: 'adult' as const,
            gender: 'female' as const,
            healthCondition: 'good' as const
          },
          physicalAttributes: {
            bodyColor: ['red', 'white'],
            hornType: 'curved' as const,
            bodySize: 'medium' as const,
            bodyCondition: 'normal' as const,
            distinctiveFeatures: ['dished face', 'pendulous ears']
          },
          breedSpecificTraits: {
            milkingCapability: 'high' as const,
            humpPresence: true,
            facialFeatures: ['dished face'],
            earType: 'drooping' as const,
            tailType: 'normal'
          },
          locationData: {
            region: 'Gujarat',
            state: 'Gujarat',
            climate: 'subtropical' as const,
            farmType: 'dairy' as const
          },
          expertValidation: {
            validatedBy: 'Veterinary Expert',
            confidenceLevel: 'high' as const,
            notes: 'Excellent example of Gir breed characteristics'
          }
        };

        await aiTrainingModule.uploadTrainingData(
          file,
          exampleTrainingData.labels,
          exampleTrainingData.physicalAttributes,
          exampleTrainingData.breedSpecificTraits,
          exampleTrainingData.locationData,
          exampleTrainingData.expertValidation
        );

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      toast.success(`Successfully uploaded ${files.length} training samples!`);
      await loadTrainingStats();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload training data');
    }
  };

  const startModelTraining = async () => {
    if (!trainingStats || trainingStats.totalSamples < 100) {
      toast.error('Need at least 100 training samples to start training');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    
    const config: ModelTrainingConfig = {
      modelVersion: `v${Date.now()}`,
      trainingParameters: {
        batchSize: 32,
        learningRate: 0.001,
        epochs: 100,
        validationSplit: 0.2,
        dataAugmentation: true,
        transferLearning: true
      },
      featureWeights: {
        visualFeatures: 0.4,
        colorAnalysis: 0.15,
        sizeAnalysis: 0.15,
        shapeAnalysis: 0.15,
        textualFeatures: 0.1,
        regionalPreferences: 0.05
      },
      classificationThresholds: {
        animalTypeConfidence: 0.8,
        breedConfidence: 0.7,
        ageConfidence: 0.6,
        genderConfidence: 0.7,
        healthConfidence: 0.6
      }
    };

    try {
      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 5;
        });
      }, 500);

      const modelId = await aiTrainingModule.trainModel(config);
      
      clearInterval(progressInterval);
      setTrainingProgress(100);
      setIsTraining(false);

      toast.success('Model training completed successfully!');
      console.log('Trained model ID:', modelId);
      
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Model training failed');
      setIsTraining(false);
    }
  };

  const exportTrainingData = async (format: 'json' | 'csv') => {
    try {
      const data = await aiTrainingModule.exportTrainingData(format);
      
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(data, null, 2) : data.headers.join(',') + '\n' + data.data.map((row: any) => row.join(',')).join('\n')], 
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      );
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training_data.${format}`;
      a.click();
      
      toast.success(`Training data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export training data');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              AI Training Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Train and optimize the livestock classification AI model
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-green-600 border-green-300">
              <Database className="w-3 h-3 mr-1" />
              Training Active
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        {trainingStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Samples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainingStats.totalSamples}</div>
                <div className="text-xs text-muted-foreground">Training data points</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainingStats.dataQuality.dataQualityScore}/100</div>
                <Progress value={trainingStats.dataQuality.dataQualityScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expert Validated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trainingStats.dataQuality.expertValidatedPercentage.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Professional validation</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Breeds Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(trainingStats.dataQuality.breedDistribution).length}</div>
                <div className="text-xs text-muted-foreground">Unique breeds</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="training">Model Training</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recommendations */}
            {trainingStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trainingStats.recommendedNextSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Training Data Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {trainingStats ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Animal Types</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(trainingStats.dataQuality.animalTypeDistribution).map(([type, count]) => (
                          <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold">{count}</div>
                            <div className="text-sm text-muted-foreground capitalize">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Top Breeds</h4>
                      <div className="space-y-2">
                        {Object.entries(trainingStats.dataQuality.breedDistribution)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 5)
                          .map(([breed, count]) => (
                            <div key={breed} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">{breed}</span>
                              <Badge variant="outline">{count} samples</Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No training data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Training Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload high-quality images of livestock with proper labeling. 
                    Each image should be clearly labeled with animal type, breed, age, gender, and health condition.
                  </AlertDescription>
                </Alert>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Upload Training Images</p>
                    <p className="text-sm text-muted-foreground">
                      Select multiple images (JPG, PNG) for training data
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="training-upload"
                  />
                  <Button 
                    onClick={() => document.getElementById('training-upload')?.click()}
                    className="mt-4"
                  >
                    Choose Files
                  </Button>
                </div>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => exportTrainingData('json')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => exportTrainingData('csv')}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Model Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {trainingStats && trainingStats.totalSamples < 100 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Need at least 100 training samples to start model training. 
                      Current samples: {trainingStats.totalSamples}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Ready for model training! You have sufficient training data.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium">Training Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Model Parameters</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Batch Size: 32</li>
                        <li>• Learning Rate: 0.001</li>
                        <li>• Epochs: 100</li>
                        <li>• Validation Split: 20%</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Feature Weights</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Visual Features: 40%</li>
                        <li>• Color Analysis: 15%</li>
                        <li>• Size/Shape: 30%</li>
                        <li>• Regional: 15%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {isTraining && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Training Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Model Training</span>
                        <span>{trainingProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={trainingProgress} />
                      <p className="text-sm text-muted-foreground">
                        Training neural network with {trainingStats?.totalSamples} samples...
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={startModelTraining}
                  disabled={!trainingStats || trainingStats.totalSamples < 100 || isTraining}
                  className="w-full"
                  size="lg"
                >
                  {isTraining ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Model Training
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Training Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics will be available after model training</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}