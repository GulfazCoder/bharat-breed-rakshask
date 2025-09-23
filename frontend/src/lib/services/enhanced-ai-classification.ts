// Enhanced AI Classification with Ensemble Methods and Advanced Feature Extraction
// Target: 85% accuracy (Stage 1 Enhancement)

import { aiClassificationService, ClassificationResult } from './ai-classification';

// Regional breed preferences based on geographic location
const REGIONAL_BREED_PREFERENCES = {
  'gujarat': {
    cattle: ['Gir', 'Kankrej', 'Dangi'],
    buffalo: ['Banni', 'Surti'],
    weights: { 'Gir': 1.5, 'Kankrej': 1.3 }
  },
  'punjab': {
    cattle: ['Sahiwal', 'Red Sindhi'],
    buffalo: ['Nili Ravi', 'Murrah'],
    weights: { 'Sahiwal': 1.4, 'Nili Ravi': 1.6 }
  },
  'maharashtra': {
    cattle: ['Gir', 'Deoni', 'Dangi'],
    buffalo: ['Murrah', 'Mehsana'],
    weights: { 'Gir': 1.2, 'Deoni': 1.3 }
  },
  'rajasthan': {
    cattle: ['Gir', 'Tharparkar', 'Rathi'],
    buffalo: ['Murrah'],
    weights: { 'Tharparkar': 1.4, 'Rathi': 1.2 }
  },
  'karnataka': {
    cattle: ['Amritmahal', 'Hallikar', 'Deoni'],
    buffalo: ['Murrah', 'Surti'],
    weights: { 'Amritmahal': 1.5, 'Hallikar': 1.3 }
  },
  'tamil_nadu': {
    cattle: ['Pulikulam', 'Umblachery', 'Kangayam'],
    buffalo: ['Toda'],
    weights: { 'Pulikulam': 1.4 }
  },
  'default': {
    cattle: ['Gir', 'Sahiwal', 'Holstein'],
    buffalo: ['Murrah', 'Nili Ravi'],
    weights: {}
  }
};

// Advanced breed characteristics for better matching
const ADVANCED_BREED_FEATURES = {
  cattle: {
    'gir': {
      distinctive_features: ['dished face', 'pendulous ears', 'prominent forehead'],
      color_patterns: ['red with white patches', 'reddish dun', 'white markings'],
      body_structure: ['large hump', 'dewlap', 'long tail'],
      size_indicators: ['medium to large', '400-475 kg female'],
      regional_markers: ['gujarat', 'gir forest'],
      genetic_markers: ['bos indicus', 'zebu type']
    },
    'holstein': {
      distinctive_features: ['straight face', 'large frame', 'angular body'],
      color_patterns: ['black and white', 'distinct patches', 'spotted'],
      body_structure: ['minimal hump', 'large udder', 'straight back'],
      size_indicators: ['large', '600-700 kg female'],
      regional_markers: ['exotic breed', 'dairy farms'],
      genetic_markers: ['bos taurus', 'european type']
    },
    'sahiwal': {
      distinctive_features: ['loose skin', 'heat tolerance', 'red color'],
      color_patterns: ['reddish brown', 'red sindhi', 'uniform color'],
      body_structure: ['prominent hump', 'dewlap', 'sturdy build'],
      size_indicators: ['medium', '350-400 kg female'],
      regional_markers: ['punjab', 'pakistan origin'],
      genetic_markers: ['bos indicus', 'zebu type']
    }
  },
  buffalo: {
    'murrah': {
      distinctive_features: ['curved horns', 'compact body', 'high milk yield'],
      color_patterns: ['jet black', 'uniform black', 'dark coat'],
      body_structure: ['well-developed udder', 'straight back', 'strong legs'],
      size_indicators: ['medium to large', '500-650 kg'],
      regional_markers: ['haryana', 'delhi', 'punjab'],
      genetic_markers: ['river buffalo', 'bubalus bubalis']
    },
    'nili_ravi': {
      distinctive_features: ['wall eyes', 'large size', 'long head'],
      color_patterns: ['black', 'white markings on face', 'distinct markings'],
      body_structure: ['large frame', 'long body', 'strong build'],
      size_indicators: ['large', '450-650 kg'],
      regional_markers: ['punjab', 'pakistan border'],
      genetic_markers: ['river buffalo']
    }
  }
};

// User feedback storage and learning
interface UserFeedback {
  imageHash: string;
  originalPrediction: string;
  userCorrection: string;
  confidence: number;
  timestamp: Date;
  location?: string;
}

class EnhancedAIClassificationService {
  private feedbackHistory: UserFeedback[] = [];
  private breedAccuracyStats: Map<string, { correct: number; total: number }> = new Map();
  private locationCache: string | null = null;

  /**
   * Enhanced classification with ensemble methods
   */
  async classifyImageEnhanced(
    imageDataUrl: string,
    location?: string,
    farmerInput?: {
      suspectedBreed?: string;
      animalAge?: string;
      purpose?: string;
    }
  ): Promise<ClassificationResult & { 
    enhancedConfidence: number;
    alternativeAnalysis: any[];
    recommendedActions: string[];
  }> {
    const startTime = Date.now();

    try {
      // Stage 1: Get base classification
      const baseResult = await aiClassificationService.classifyImage(imageDataUrl);

      // Stage 2: Multi-scale analysis
      const multiScaleResults = await this.performMultiScaleAnalysis(imageDataUrl);

      // Stage 3: Feature extraction and enhancement
      const enhancedFeatures = await this.extractAdvancedFeatures(imageDataUrl);

      // Stage 4: Regional bias application
      const regionalEnhancement = this.applyRegionalBias(
        baseResult,
        location || this.locationCache
      );

      // Stage 5: Ensemble voting
      const ensembleResult = this.performEnsembleVoting([
        baseResult,
        ...multiScaleResults,
        regionalEnhancement
      ]);

      // Stage 6: User feedback integration
      const feedbackEnhancement = this.integrateUserFeedback(ensembleResult);

      // Stage 7: Farmer input integration
      const farmerInputEnhancement = this.integrateFarmerInput(
        feedbackEnhancement,
        farmerInput
      );

      // Stage 8: Confidence calibration
      const calibratedResult = this.calibrateConfidence(
        farmerInputEnhancement,
        enhancedFeatures
      );

      // Stage 9: Generate alternative analysis
      const alternativeAnalysis = this.generateAlternativeAnalysis(
        calibratedResult,
        enhancedFeatures
      );

      // Stage 10: Generate recommendations
      const recommendedActions = this.generateRecommendations(calibratedResult);

      return {
        ...calibratedResult,
        enhancedConfidence: calibratedResult.breed.confidence,
        alternativeAnalysis,
        recommendedActions,
        processing_time: (Date.now() - startTime) / 1000
      };

    } catch (error) {
      console.error('Enhanced classification failed:', error);
      // Fallback to base classification
      return {
        ...await aiClassificationService.classifyImage(imageDataUrl),
        enhancedConfidence: 0.5,
        alternativeAnalysis: [],
        recommendedActions: ['Try with better lighting', 'Capture from different angle']
      };
    }
  }

  /**
   * Multi-scale image analysis for better feature extraction
   */
  private async performMultiScaleAnalysis(imageDataUrl: string): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];

    try {
      // Create different crops/scales of the image
      const imageScales = await this.createImageScales(imageDataUrl);

      for (const scaledImage of imageScales) {
        try {
          const result = await aiClassificationService.classifyImage(scaledImage);
          results.push(result);
        } catch (error) {
          console.warn('Scale analysis failed for one scale:', error);
        }
      }
    } catch (error) {
      console.error('Multi-scale analysis failed:', error);
    }

    return results;
  }

  /**
   * Create different scales/crops of the image
   */
  private async createImageScales(imageDataUrl: string): Promise<string[]> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scales: string[] = [];

        if (!ctx) {
          resolve([imageDataUrl]); // Fallback to original
          return;
        }

        // Original image
        scales.push(imageDataUrl);

        // Center crop (80%)
        const cropSize = Math.min(img.width, img.height) * 0.8;
        const startX = (img.width - cropSize) / 2;
        const startY = (img.height - cropSize) / 2;

        canvas.width = cropSize;
        canvas.height = cropSize;
        ctx.drawImage(img, startX, startY, cropSize, cropSize, 0, 0, cropSize, cropSize);
        scales.push(canvas.toDataURL('image/jpeg', 0.9));

        // Face/head focus (top 60%)
        canvas.width = img.width;
        canvas.height = img.height * 0.6;
        ctx.drawImage(img, 0, 0, img.width, img.height * 0.6, 0, 0, img.width, img.height * 0.6);
        scales.push(canvas.toDataURL('image/jpeg', 0.9));

        resolve(scales);
      };
      img.onerror = () => resolve([imageDataUrl]);
      img.src = imageDataUrl;
    });
  }

  /**
   * Extract advanced features from the image
   */
  private async extractAdvancedFeatures(imageDataUrl: string): Promise<{
    colorAnalysis: any;
    textureFeatures: any;
    shapeCharacteristics: any;
    qualityMetrics: any;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            colorAnalysis: {},
            textureFeatures: {},
            shapeCharacteristics: {},
            qualityMetrics: { quality: 'unknown' }
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Color analysis
        const colorAnalysis = this.analyzeColors(data);
        
        // Basic texture analysis
        const textureFeatures = this.analyzeTexture(data, canvas.width, canvas.height);
        
        // Shape characteristics
        const shapeCharacteristics = this.analyzeShape(data, canvas.width, canvas.height);
        
        // Quality metrics
        const qualityMetrics = this.analyzeImageQuality(data, canvas.width, canvas.height);

        resolve({
          colorAnalysis,
          textureFeatures,
          shapeCharacteristics,
          qualityMetrics
        });
      };
      img.src = imageDataUrl;
    });
  }

  /**
   * Analyze color distribution in image
   */
  private analyzeColors(imageData: Uint8ClampedArray): any {
    const colorBuckets = {
      black: 0, white: 0, red: 0, brown: 0, grey: 0, mixed: 0
    };
    
    const totalPixels = imageData.length / 4;
    let dominantColor = 'unknown';
    let maxCount = 0;

    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      const brightness = (r + g + b) / 3;
      
      if (brightness < 50) {
        colorBuckets.black++;
      } else if (brightness > 200) {
        colorBuckets.white++;
      } else if (r > g && r > b && r > 100) {
        colorBuckets.red++;
      } else if (r > 80 && g > 60 && b < 100) {
        colorBuckets.brown++;
      } else if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
        colorBuckets.grey++;
      } else {
        colorBuckets.mixed++;
      }
    }

    // Find dominant color
    Object.entries(colorBuckets).forEach(([color, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    });

    return {
      dominantColor,
      distribution: Object.fromEntries(
        Object.entries(colorBuckets).map(([color, count]) => [
          color, 
          (count / totalPixels * 100).toFixed(1)
        ])
      ),
      diversity: Object.values(colorBuckets).filter(count => count > totalPixels * 0.05).length
    };
  }

  /**
   * Basic texture analysis
   */
  private analyzeTexture(imageData: Uint8ClampedArray, width: number, height: number): any {
    // Simplified texture analysis - in production, use more sophisticated methods
    let edgePixels = 0;
    const threshold = 30;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const current = imageData[idx];
        const right = imageData[idx + 4];
        const bottom = imageData[(y + 1) * width + x * 4];

        if (Math.abs(current - right) > threshold || Math.abs(current - bottom) > threshold) {
          edgePixels++;
        }
      }
    }

    const totalPixels = (width - 2) * (height - 2);
    const edgeRatio = edgePixels / totalPixels;

    return {
      edgeDensity: edgeRatio,
      textureType: edgeRatio > 0.1 ? 'rough' : edgeRatio > 0.05 ? 'medium' : 'smooth'
    };
  }

  /**
   * Analyze shape characteristics
   */
  private analyzeShape(imageData: Uint8ClampedArray, width: number, height: number): any {
    const aspectRatio = width / height;
    
    return {
      aspectRatio,
      orientation: aspectRatio > 1.2 ? 'landscape' : aspectRatio < 0.8 ? 'portrait' : 'square',
      resolution: width * height,
      sizeCategory: width * height > 1000000 ? 'high' : width * height > 300000 ? 'medium' : 'low'
    };
  }

  /**
   * Analyze image quality metrics
   */
  private analyzeImageQuality(imageData: Uint8ClampedArray, width: number, height: number): any {
    let blur = 0;
    let brightness = 0;
    let contrast = 0;

    // Simplified quality metrics
    const sampleSize = Math.min(10000, imageData.length / 4);
    const step = Math.floor(imageData.length / (sampleSize * 4));

    for (let i = 0; i < imageData.length; i += step * 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      const pixelBrightness = (r + g + b) / 3;
      brightness += pixelBrightness;
    }

    brightness /= sampleSize;

    return {
      brightness: brightness / 255,
      quality: brightness > 50 && brightness < 200 ? 'good' : 'fair',
      resolution: `${width}x${height}`,
      estimatedFileSize: (width * height * 3) / 1024 // KB estimate
    };
  }

  /**
   * Apply regional breed preferences
   */
  private applyRegionalBias(result: ClassificationResult, location?: string): ClassificationResult {
    if (!location) return result;

    const region = location.toLowerCase();
    const regionalData = REGIONAL_BREED_PREFERENCES[region] || REGIONAL_BREED_PREFERENCES.default;
    
    const animalType = result.animal_type.prediction as 'cattle' | 'buffalo';
    const preferredBreeds = regionalData[animalType] || [];
    const breedWeights = regionalData.weights || {};

    // Boost confidence for regional breeds
    if (preferredBreeds.some(breed => 
      result.breed.prediction.toLowerCase().includes(breed.toLowerCase())
    )) {
      const weight = breedWeights[result.breed.prediction] || 1.1;
      result.breed.confidence = Math.min(result.breed.confidence * weight, 0.95);
      result.breed.confidence_level = result.breed.confidence > 0.75 ? 'high' : 
                                     result.breed.confidence > 0.6 ? 'medium' : 'low';
    }

    // Adjust top 3 with regional preferences
    if (result.breed.top_3) {
      result.breed.top_3 = result.breed.top_3.map(breed => {
        const weight = preferredBreeds.some(preferred => 
          breed.breed.toLowerCase().includes(preferred.toLowerCase())
        ) ? (breedWeights[breed.breed] || 1.1) : 1.0;
        
        return {
          ...breed,
          confidence: Math.min(breed.confidence * weight, 0.95)
        };
      }).sort((a, b) => b.confidence - a.confidence);
    }

    return result;
  }

  /**
   * Perform ensemble voting from multiple predictions
   */
  private performEnsembleVoting(results: ClassificationResult[]): ClassificationResult {
    if (results.length === 0) {
      throw new Error('No results for ensemble voting');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Weighted voting based on confidence
    const breedVotes: Map<string, number> = new Map();
    const animalTypeVotes: Map<string, number> = new Map();

    results.forEach(result => {
      const breedWeight = result.breed.confidence;
      const animalWeight = result.animal_type.confidence;

      // Breed voting
      const currentBreedVote = breedVotes.get(result.breed.prediction) || 0;
      breedVotes.set(result.breed.prediction, currentBreedVote + breedWeight);

      // Animal type voting
      const currentAnimalVote = animalTypeVotes.get(result.animal_type.prediction) || 0;
      animalTypeVotes.set(result.animal_type.prediction, currentAnimalVote + animalWeight);
    });

    // Get winning predictions
    const winningBreed = Array.from(breedVotes.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    const winningAnimalType = Array.from(animalTypeVotes.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Build consensus result
    const consensusResult = results[0]; // Use first as template
    
    consensusResult.breed.prediction = winningBreed[0];
    consensusResult.breed.confidence = Math.min(winningBreed[1] / results.length, 0.95);
    consensusResult.breed.confidence_level = consensusResult.breed.confidence > 0.75 ? 'high' : 
                                           consensusResult.breed.confidence > 0.6 ? 'medium' : 'low';

    consensusResult.animal_type.prediction = winningAnimalType[0];
    consensusResult.animal_type.confidence = Math.min(winningAnimalType[1] / results.length, 0.95);
    consensusResult.animal_type.confidence_level = consensusResult.animal_type.confidence > 0.75 ? 'high' : 
                                                  consensusResult.animal_type.confidence > 0.6 ? 'medium' : 'low';

    return consensusResult;
  }

  /**
   * Integrate user feedback from previous classifications
   */
  private integrateUserFeedback(result: ClassificationResult): ClassificationResult {
    const breedName = result.breed.prediction;
    const stats = this.breedAccuracyStats.get(breedName);

    if (stats && stats.total > 5) {
      const accuracy = stats.correct / stats.total;
      
      // Adjust confidence based on historical accuracy
      result.breed.confidence *= (0.5 + accuracy * 0.5);
      result.breed.confidence_level = result.breed.confidence > 0.75 ? 'high' : 
                                     result.breed.confidence > 0.6 ? 'medium' : 'low';
      
      if (accuracy < 0.6) {
        result.breed.needs_verification = true;
      }
    }

    return result;
  }

  /**
   * Integrate farmer input and domain knowledge
   */
  private integrateFarmerInput(
    result: ClassificationResult,
    farmerInput?: {
      suspectedBreed?: string;
      animalAge?: string;
      purpose?: string;
    }
  ): ClassificationResult {
    if (!farmerInput) return result;

    // If farmer suspects a specific breed, boost its confidence
    if (farmerInput.suspectedBreed) {
      const suspected = farmerInput.suspectedBreed.toLowerCase();
      const predicted = result.breed.prediction.toLowerCase();
      
      if (predicted.includes(suspected) || suspected.includes(predicted)) {
        result.breed.confidence = Math.min(result.breed.confidence * 1.2, 0.95);
        result.breed.confidence_level = 'high';
      }
    }

    // Adjust based on purpose
    if (farmerInput.purpose === 'dairy' && result.breed.prediction.includes('Holstein')) {
      result.breed.confidence = Math.min(result.breed.confidence * 1.1, 0.95);
    }

    return result;
  }

  /**
   * Calibrate confidence scores based on advanced features
   */
  private calibrateConfidence(result: ClassificationResult, features: any): ClassificationResult {
    let calibrationFactor = 1.0;

    // Image quality factor
    if (features.qualityMetrics.brightness < 0.3 || features.qualityMetrics.brightness > 0.9) {
      calibrationFactor *= 0.85; // Low lighting reduces confidence
    }

    // Color consistency factor
    if (features.colorAnalysis.diversity < 2) {
      calibrationFactor *= 0.9; // Low color diversity might indicate poor image
    }

    // Resolution factor
    if (features.shapeCharacteristics.sizeCategory === 'low') {
      calibrationFactor *= 0.8; // Low resolution reduces confidence
    }

    // Apply calibration
    result.breed.confidence *= calibrationFactor;
    result.breed.confidence = Math.max(Math.min(result.breed.confidence, 0.95), 0.1);
    result.breed.confidence_level = result.breed.confidence > 0.75 ? 'high' : 
                                   result.breed.confidence > 0.6 ? 'medium' : 'low';

    return result;
  }

  /**
   * Generate alternative analysis for the classification
   */
  private generateAlternativeAnalysis(result: ClassificationResult, features: any): any[] {
    const alternatives = [];

    // Feature-based analysis
    const colorAnalysis = features.colorAnalysis;
    if (colorAnalysis.dominantColor === 'black' && result.animal_type.prediction === 'buffalo') {
      alternatives.push({
        type: 'color_match',
        confidence: 0.8,
        reasoning: 'Black coloration strongly suggests buffalo breed, particularly Murrah'
      });
    }

    // Size-based analysis
    if (features.shapeCharacteristics.aspectRatio < 0.8) {
      alternatives.push({
        type: 'body_structure',
        confidence: 0.6,
        reasoning: 'Tall, narrow frame suggests dairy breed characteristics'
      });
    }

    // Regional likelihood
    alternatives.push({
      type: 'regional_probability',
      confidence: 0.7,
      reasoning: `${result.breed.prediction} is commonly found in this region`
    });

    return alternatives;
  }

  /**
   * Generate recommendations based on classification results
   */
  private generateRecommendations(result: ClassificationResult): string[] {
    const recommendations = [];

    if (result.breed.confidence < 0.6) {
      recommendations.push('Consider getting expert veterinarian confirmation');
      recommendations.push('Try capturing image from different angles');
      recommendations.push('Ensure good lighting conditions');
    }

    if (result.breed.needs_verification) {
      recommendations.push('Verification recommended due to breed complexity');
    }

    if (result.health.prediction !== 'healthy') {
      recommendations.push('Consider veterinary health checkup');
    }

    if (result.breed.confidence > 0.8) {
      recommendations.push('High confidence classification - suitable for breeding records');
    }

    return recommendations.length > 0 ? recommendations : ['Classification completed successfully'];
  }

  /**
   * Store user feedback for continuous learning
   */
  addUserFeedback(
    imageData: string,
    originalPrediction: string,
    userCorrection: string,
    confidence: number,
    location?: string
  ): void {
    const imageHash = this.generateImageHash(imageData);
    
    const feedback: UserFeedback = {
      imageHash,
      originalPrediction,
      userCorrection,
      confidence,
      timestamp: new Date(),
      location
    };

    this.feedbackHistory.push(feedback);

    // Update accuracy stats
    const isCorrect = originalPrediction.toLowerCase() === userCorrection.toLowerCase();
    const stats = this.breedAccuracyStats.get(originalPrediction) || { correct: 0, total: 0 };
    
    stats.total += 1;
    if (isCorrect) stats.correct += 1;
    
    this.breedAccuracyStats.set(originalPrediction, stats);

    console.log(`Feedback stored: ${originalPrediction} -> ${userCorrection} (${isCorrect ? 'correct' : 'incorrect'})`);
  }

  /**
   * Get accuracy statistics for continuous improvement
   */
  getAccuracyStats(): {
    overallAccuracy: number;
    breedAccuracies: { [breed: string]: number };
    totalFeedback: number;
  } {
    const totalFeedback = this.feedbackHistory.length;
    const correctFeedback = this.feedbackHistory.filter(f => 
      f.originalPrediction.toLowerCase() === f.userCorrection.toLowerCase()
    ).length;

    const breedAccuracies: { [breed: string]: number } = {};
    this.breedAccuracyStats.forEach((stats, breed) => {
      breedAccuracies[breed] = stats.correct / stats.total;
    });

    return {
      overallAccuracy: totalFeedback > 0 ? correctFeedback / totalFeedback : 0,
      breedAccuracies,
      totalFeedback
    };
  }

  /**
   * Simple hash function for image data
   */
  private generateImageHash(imageData: string): string {
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Set user location for regional bias
   */
  setUserLocation(location: string): void {
    this.locationCache = location.toLowerCase();
  }
}

// Export enhanced service class and instance
export { EnhancedAIClassificationService };
export const enhancedAIService = new EnhancedAIClassificationService();
export default enhancedAIService;
