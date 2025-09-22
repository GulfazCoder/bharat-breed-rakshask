/**
 * Fallback Classification System
 * Robust backup classification methods when primary systems fail
 */

import { ClassificationResult } from './ai-classification';

export interface FallbackOptions {
  enablePatternMatching: boolean;
  enableStatisticalFallback: boolean;
  enableHeuristicAnalysis: boolean;
  enableCrowdSourcedData: boolean;
  maxRetryAttempts: number;
  fallbackThreshold: number; // Minimum confidence before triggering fallback
}

export interface FallbackResult {
  classification: ClassificationResult;
  fallbackMethod: 'pattern_matching' | 'statistical' | 'heuristic' | 'crowd_sourced' | 'emergency';
  reliability: number; // 0-1
  usedMethods: string[];
  reasonForFallback: string;
  recommendations: string[];
}

export interface ImageAnalysis {
  colorProfile: {
    dominantColors: string[];
    colorDistribution: { [color: string]: number };
  };
  shapeAnalysis: {
    aspectRatio: number;
    bodyProportions: {
      headToBody: number;
      legLength: number;
      hornVisibility: boolean;
    };
  };
  textureFeatures: {
    coatType: 'smooth' | 'rough' | 'woolly' | 'unknown';
    patternType: 'solid' | 'spotted' | 'striped' | 'mixed' | 'unknown';
  };
  sizeEstimation: {
    relativeSize: 'small' | 'medium' | 'large' | 'extra_large';
    confidence: number;
  };
}

export class FallbackClassifier {
  private fallbackOptions: FallbackOptions;
  private breedPatterns: Map<string, any> = new Map();
  private statisticalProfiles: Map<string, any> = new Map();
  private heuristicRules: Array<any> = [];
  private emergencyBreeds: Array<string> = [];

  constructor(options?: Partial<FallbackOptions>) {
    this.fallbackOptions = {
      enablePatternMatching: true,
      enableStatisticalFallback: true,
      enableHeuristicAnalysis: true,
      enableCrowdSourcedData: false, // Would require external data
      maxRetryAttempts: 3,
      fallbackThreshold: 0.4,
      ...options
    };

    this.initializeFallbackData();
  }

  /**
   * Main fallback classification method
   */
  async performFallback(
    imageDataUrl: string, 
    primaryFailure: any, 
    imageAnalysis?: ImageAnalysis
  ): Promise<FallbackResult> {
    const usedMethods: string[] = [];
    let bestClassification: ClassificationResult | null = null;
    let bestReliability = 0;
    let selectedMethod: FallbackResult['fallbackMethod'] = 'emergency';

    console.log('🔄 Initiating fallback classification due to:', primaryFailure?.message || 'Low confidence');

    // Try pattern matching first
    if (this.fallbackOptions.enablePatternMatching) {
      try {
        const patternResult = await this.patternMatchingFallback(imageDataUrl, imageAnalysis);
        usedMethods.push('Pattern Matching');
        
        if (patternResult.reliability > bestReliability) {
          bestClassification = patternResult.classification;
          bestReliability = patternResult.reliability;
          selectedMethod = 'pattern_matching';
        }
      } catch (error) {
        console.warn('Pattern matching fallback failed:', error);
      }
    }

    // Try statistical fallback
    if (this.fallbackOptions.enableStatisticalFallback) {
      try {
        const statResult = await this.statisticalFallback(imageAnalysis);
        usedMethods.push('Statistical Analysis');
        
        if (statResult.reliability > bestReliability) {
          bestClassification = statResult.classification;
          bestReliability = statResult.reliability;
          selectedMethod = 'statistical';
        }
      } catch (error) {
        console.warn('Statistical fallback failed:', error);
      }
    }

    // Try heuristic analysis
    if (this.fallbackOptions.enableHeuristicAnalysis) {
      try {
        const heuristicResult = await this.heuristicFallback(imageAnalysis);
        usedMethods.push('Heuristic Rules');
        
        if (heuristicResult.reliability > bestReliability) {
          bestClassification = heuristicResult.classification;
          bestReliability = heuristicResult.reliability;
          selectedMethod = 'heuristic';
        }
      } catch (error) {
        console.warn('Heuristic fallback failed:', error);
      }
    }

    // Emergency fallback if nothing worked
    if (!bestClassification || bestReliability < 0.2) {
      const emergencyResult = this.emergencyFallback();
      bestClassification = emergencyResult.classification;
      bestReliability = emergencyResult.reliability;
      selectedMethod = 'emergency';
      usedMethods.push('Emergency Fallback');
    }

    return {
      classification: bestClassification!,
      fallbackMethod: selectedMethod,
      reliability: bestReliability,
      usedMethods,
      reasonForFallback: this.getReasonForFallback(primaryFailure),
      recommendations: this.generateFallbackRecommendations(selectedMethod, bestReliability)
    };
  }

  /**
   * Pattern matching based fallback
   */
  private async patternMatchingFallback(
    imageDataUrl: string, 
    imageAnalysis?: ImageAnalysis
  ): Promise<{ classification: ClassificationResult; reliability: number }> {
    
    const patterns = imageAnalysis || await this.analyzeImagePatterns(imageDataUrl);
    const matchScores: { [breed: string]: number } = {};

    // Match against known breed patterns
    this.breedPatterns.forEach((patternData, breed) => {
      let score = 0;

      // Color matching
      if (patterns.colorProfile.dominantColors) {
        const colorMatches = patterns.colorProfile.dominantColors.filter(color =>
          patternData.colors.includes(color)
        ).length;
        score += (colorMatches / patterns.colorProfile.dominantColors.length) * 0.4;
      }

      // Shape matching
      if (patterns.shapeAnalysis && patternData.shapeFeatures) {
        if (patterns.shapeAnalysis.bodyProportions.hornVisibility === patternData.shapeFeatures.hasHorns) {
          score += 0.3;
        }
        
        const sizeMatch = this.compareSizes(
          patterns.sizeEstimation.relativeSize, 
          patternData.shapeFeatures.typicalSize
        );
        score += sizeMatch * 0.3;
      }

      if (score > 0) {
        matchScores[breed] = score;
      }
    });

    const bestMatch = Object.entries(matchScores)
      .sort((a, b) => b[1] - a[1])[0];

    if (bestMatch && bestMatch[1] > 0.3) {
      const classification = this.createClassificationFromPattern(bestMatch[0], bestMatch[1]);
      return {
        classification,
        reliability: Math.min(bestMatch[1], 0.7) // Cap reliability for pattern matching
      };
    }

    throw new Error('No pattern matches found');
  }

  /**
   * Statistical fallback based on common breeds and probabilities
   */
  private async statisticalFallback(
    imageAnalysis?: ImageAnalysis
  ): Promise<{ classification: ClassificationResult; reliability: number }> {
    
    // Use regional statistics and breed frequency data
    const regionalBreeds = this.getRegionalBreedStatistics();
    const selectedBreed = this.selectBreedByProbability(regionalBreeds, imageAnalysis);

    const classification = this.createStatisticalClassification(selectedBreed);
    
    return {
      classification,
      reliability: 0.5 // Moderate reliability for statistical approach
    };
  }

  /**
   * Heuristic rules based fallback
   */
  private async heuristicFallback(
    imageAnalysis?: ImageAnalysis
  ): Promise<{ classification: ClassificationResult; reliability: number }> {
    
    let animalType = 'cattle';
    let breed = 'Mixed Breed Cattle';
    let reliability = 0.4;

    if (imageAnalysis) {
      // Apply heuristic rules
      for (const rule of this.heuristicRules) {
        const result = this.applyHeuristicRule(rule, imageAnalysis);
        if (result.matches) {
          animalType = result.animalType || animalType;
          breed = result.breed || breed;
          reliability = Math.max(reliability, result.confidence);
          break;
        }
      }
    }

    const classification = this.createHeuristicClassification(animalType, breed, reliability);
    
    return {
      classification,
      reliability: Math.min(reliability, 0.6) // Cap reliability for heuristics
    };
  }

  /**
   * Emergency fallback - always works
   */
  private emergencyFallback(): { classification: ClassificationResult; reliability: number } {
    const randomBreed = this.emergencyBreeds[
      Math.floor(Math.random() * this.emergencyBreeds.length)
    ];

    const classification: ClassificationResult = {
      animal_type: {
        prediction: 'cattle',
        confidence: 0.3,
        confidence_level: 'low'
      },
      breed: {
        prediction: randomBreed,
        confidence: 0.25,
        confidence_level: 'low',
        top_3: this.emergencyBreeds.slice(0, 3).map((breed, index) => ({
          breed,
          confidence: 0.25 - (index * 0.05)
        })),
        needs_verification: true,
        suggestion: 'Classification failed - please try again with better lighting'
      },
      age: {
        prediction: 'adult',
        confidence: 0.3,
        confidence_level: 'low'
      },
      gender: {
        prediction: 'unknown',
        confidence: 0.2,
        confidence_level: 'low'
      },
      health: {
        prediction: 'unknown',
        confidence: 0.2,
        confidence_level: 'low'
      },
      processing_time: 0.1
    };

    return {
      classification,
      reliability: 0.2
    };
  }

  /**
   * Analyze image patterns for fallback classification
   */
  private async analyzeImagePatterns(imageDataUrl: string): Promise<ImageAnalysis> {
    // This would use basic image analysis techniques
    // For demo purposes, we'll simulate pattern analysis
    
    const mockAnalysis: ImageAnalysis = {
      colorProfile: {
        dominantColors: this.simulateColorAnalysis(imageDataUrl),
        colorDistribution: {
          'black': 0.4,
          'white': 0.3,
          'brown': 0.2,
          'other': 0.1
        }
      },
      shapeAnalysis: {
        aspectRatio: 1.6,
        bodyProportions: {
          headToBody: 0.25,
          legLength: 0.3,
          hornVisibility: Math.random() > 0.5
        }
      },
      textureFeatures: {
        coatType: 'smooth',
        patternType: 'solid'
      },
      sizeEstimation: {
        relativeSize: 'large',
        confidence: 0.6
      }
    };

    return mockAnalysis;
  }

  /**
   * Simulate color analysis from image
   */
  private simulateColorAnalysis(imageDataUrl: string): string[] {
    // In real implementation, this would analyze the actual image
    const possibleColors = ['black', 'white', 'brown', 'red', 'grey'];
    const numColors = Math.floor(Math.random() * 3) + 1;
    
    return possibleColors
      .sort(() => Math.random() - 0.5)
      .slice(0, numColors);
  }

  /**
   * Get regional breed statistics
   */
  private getRegionalBreedStatistics(): { [breed: string]: number } {
    // Mock regional statistics - in production would come from database
    return {
      'Gir': 0.15,
      'Sahiwal': 0.12,
      'Holstein Friesian': 0.20,
      'Jersey': 0.18,
      'Red Sindhi': 0.10,
      'Tharparkar': 0.08,
      'Mixed Breed': 0.17
    };
  }

  /**
   * Select breed based on statistical probability
   */
  private selectBreedByProbability(
    breedStats: { [breed: string]: number }, 
    imageAnalysis?: ImageAnalysis
  ): string {
    // Apply bias based on image analysis
    let adjustedStats = { ...breedStats };
    
    if (imageAnalysis?.colorProfile.dominantColors) {
      // Bias toward breeds that match dominant colors
      const dominantColor = imageAnalysis.colorProfile.dominantColors[0];
      
      if (dominantColor === 'black') {
        adjustedStats['Holstein Friesian'] *= 1.5;
      } else if (dominantColor === 'brown') {
        adjustedStats['Jersey'] *= 1.5;
        adjustedStats['Sahiwal'] *= 1.3;
      } else if (dominantColor === 'red') {
        adjustedStats['Gir'] *= 1.4;
        adjustedStats['Red Sindhi'] *= 1.6;
      }
    }

    // Select based on adjusted probabilities
    const totalWeight = Object.values(adjustedStats).reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let cumulative = 0;
    for (const [breed, weight] of Object.entries(adjustedStats)) {
      cumulative += weight;
      if (random <= cumulative) {
        return breed;
      }
    }

    return 'Mixed Breed';
  }

  /**
   * Apply a heuristic rule
   */
  private applyHeuristicRule(rule: any, imageAnalysis: ImageAnalysis): any {
    // Apply rule conditions
    let matches = true;
    let confidence = rule.baseConfidence || 0.4;

    for (const condition of rule.conditions) {
      switch (condition.type) {
        case 'color':
          if (!imageAnalysis.colorProfile.dominantColors.includes(condition.value)) {
            matches = false;
          } else {
            confidence += 0.1;
          }
          break;
        
        case 'size':
          if (imageAnalysis.sizeEstimation.relativeSize !== condition.value) {
            matches = false;
          } else {
            confidence += 0.1;
          }
          break;
        
        case 'horns':
          if (imageAnalysis.shapeAnalysis.bodyProportions.hornVisibility !== condition.value) {
            matches = false;
          } else {
            confidence += 0.15;
          }
          break;
      }
    }

    return {
      matches,
      animalType: matches ? rule.animalType : null,
      breed: matches ? rule.breed : null,
      confidence: matches ? Math.min(confidence, 0.8) : 0
    };
  }

  /**
   * Compare size estimates
   */
  private compareSizes(observed: string, expected: string): number {
    const sizeOrder = ['small', 'medium', 'large', 'extra_large'];
    const observedIndex = sizeOrder.indexOf(observed);
    const expectedIndex = sizeOrder.indexOf(expected);
    
    if (observedIndex === -1 || expectedIndex === -1) return 0;
    
    const difference = Math.abs(observedIndex - expectedIndex);
    return Math.max(0, 1 - (difference * 0.3));
  }

  /**
   * Create classification from pattern matching
   */
  private createClassificationFromPattern(breed: string, confidence: number): ClassificationResult {
    const animalType = this.getAnimalTypeFromBreed(breed);
    
    return {
      animal_type: {
        prediction: animalType,
        confidence: Math.min(confidence + 0.2, 0.9),
        confidence_level: confidence > 0.6 ? 'medium' : 'low'
      },
      breed: {
        prediction: breed,
        confidence: confidence,
        confidence_level: confidence > 0.6 ? 'medium' : 'low',
        top_3: [
          { breed, confidence },
          { breed: 'Mixed Breed', confidence: confidence - 0.2 },
          { breed: 'Unknown', confidence: confidence - 0.3 }
        ],
        needs_verification: true
      },
      age: this.generateFallbackAge(),
      gender: this.generateFallbackGender(),
      health: this.generateFallbackHealth(),
      processing_time: 0.5
    };
  }

  /**
   * Create statistical classification
   */
  private createStatisticalClassification(breed: string): ClassificationResult {
    const animalType = this.getAnimalTypeFromBreed(breed);
    
    return {
      animal_type: {
        prediction: animalType,
        confidence: 0.6,
        confidence_level: 'medium'
      },
      breed: {
        prediction: breed,
        confidence: 0.5,
        confidence_level: 'medium',
        top_3: [
          { breed, confidence: 0.5 },
          { breed: 'Mixed Breed', confidence: 0.3 },
          { breed: 'Common Local', confidence: 0.2 }
        ],
        needs_verification: true
      },
      age: this.generateFallbackAge(),
      gender: this.generateFallbackGender(),
      health: this.generateFallbackHealth(),
      processing_time: 0.3
    };
  }

  /**
   * Create heuristic classification
   */
  private createHeuristicClassification(
    animalType: string, 
    breed: string, 
    confidence: number
  ): ClassificationResult {
    return {
      animal_type: {
        prediction: animalType,
        confidence: Math.min(confidence, 0.7),
        confidence_level: confidence > 0.5 ? 'medium' : 'low'
      },
      breed: {
        prediction: breed,
        confidence: Math.min(confidence - 0.1, 0.6),
        confidence_level: confidence > 0.5 ? 'medium' : 'low',
        top_3: [
          { breed, confidence: Math.min(confidence - 0.1, 0.6) },
          { breed: 'Alternative Breed', confidence: Math.min(confidence - 0.2, 0.5) },
          { breed: 'Mixed Type', confidence: Math.min(confidence - 0.3, 0.4) }
        ],
        needs_verification: true
      },
      age: this.generateFallbackAge(),
      gender: this.generateFallbackGender(),
      health: this.generateFallbackHealth(),
      processing_time: 0.4
    };
  }

  /**
   * Get animal type from breed name
   */
  private getAnimalTypeFromBreed(breed: string): string {
    const buffaloBreeds = ['murrah', 'nili ravi', 'surti', 'jaffarabadi', 'mehsana'];
    return buffaloBreeds.some(b => breed.toLowerCase().includes(b)) ? 'buffalo' : 'cattle';
  }

  /**
   * Generate fallback age prediction
   */
  private generateFallbackAge(): any {
    const ages = ['calf', 'young adult', 'adult', 'mature'];
    const weights = [0.1, 0.2, 0.6, 0.1]; // Bias toward adult
    const selected = this.weightedRandom(ages, weights);
    
    return {
      prediction: selected,
      confidence: 0.4,
      confidence_level: 'low'
    };
  }

  /**
   * Generate fallback gender prediction
   */
  private generateFallbackGender(): any {
    return {
      prediction: Math.random() > 0.5 ? 'female' : 'male',
      confidence: 0.5,
      confidence_level: 'low'
    };
  }

  /**
   * Generate fallback health prediction
   */
  private generateFallbackHealth(): any {
    const healthStates = ['healthy', 'good', 'fair'];
    const selected = healthStates[Math.floor(Math.random() * healthStates.length)];
    
    return {
      prediction: selected,
      confidence: 0.6,
      confidence_level: 'medium'
    };
  }

  /**
   * Weighted random selection
   */
  private weightedRandom(items: string[], weights: number[]): string {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  /**
   * Get reason for fallback activation
   */
  private getReasonForFallback(primaryFailure: any): string {
    if (primaryFailure?.message) {
      if (primaryFailure.message.includes('API')) {
        return 'Primary AI service unavailable';
      }
      if (primaryFailure.message.includes('confidence')) {
        return 'Primary classification confidence too low';
      }
      if (primaryFailure.message.includes('network')) {
        return 'Network connectivity issues';
      }
    }
    
    return 'Primary classification system failed';
  }

  /**
   * Generate recommendations for fallback results
   */
  private generateFallbackRecommendations(
    method: FallbackResult['fallbackMethod'], 
    reliability: number
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push('🔄 Fallback classification was used - results may be less accurate');

    if (method === 'emergency') {
      recommendations.push('⚠️ Emergency fallback activated - please retry with better conditions');
      recommendations.push('💡 Ensure good lighting and clear animal visibility');
      recommendations.push('📶 Check your internet connection');
    } else if (reliability < 0.5) {
      recommendations.push('🔍 Low reliability classification - consider expert verification');
      recommendations.push('📸 Try taking another photo from a different angle');
    }

    switch (method) {
      case 'pattern_matching':
        recommendations.push('🎨 Pattern matching used - verify colors and shapes match the breed');
        break;
      case 'statistical':
        recommendations.push('📊 Statistical classification used - based on regional breed probabilities');
        break;
      case 'heuristic':
        recommendations.push('🧠 Heuristic rules applied - check breed characteristics carefully');
        break;
    }

    recommendations.push('👨‍🏫 Consider getting expert confirmation for important decisions');
    
    return recommendations;
  }

  /**
   * Initialize fallback data
   */
  private initializeFallbackData(): void {
    // Initialize breed patterns
    this.breedPatterns.set('gir', {
      colors: ['red', 'reddish', 'white'],
      shapeFeatures: { hasHorns: true, typicalSize: 'medium' },
      characteristics: ['hump', 'large ears']
    });

    this.breedPatterns.set('holstein friesian', {
      colors: ['black', 'white'],
      shapeFeatures: { hasHorns: false, typicalSize: 'large' },
      characteristics: ['dairy', 'spotted']
    });

    this.breedPatterns.set('jersey', {
      colors: ['brown', 'fawn'],
      shapeFeatures: { hasHorns: false, typicalSize: 'small' },
      characteristics: ['dairy', 'compact']
    });

    this.breedPatterns.set('murrah', {
      colors: ['black', 'jet black'],
      shapeFeatures: { hasHorns: true, typicalSize: 'large' },
      characteristics: ['curved horns', 'stocky']
    });

    // Initialize heuristic rules
    this.heuristicRules = [
      {
        conditions: [
          { type: 'color', value: 'black' },
          { type: 'size', value: 'large' },
          { type: 'horns', value: true }
        ],
        animalType: 'buffalo',
        breed: 'Murrah',
        baseConfidence: 0.6
      },
      {
        conditions: [
          { type: 'color', value: 'white' },
          { type: 'size', value: 'large' }
        ],
        animalType: 'cattle',
        breed: 'Holstein Friesian',
        baseConfidence: 0.5
      },
      {
        conditions: [
          { type: 'color', value: 'brown' },
          { type: 'size', value: 'small' }
        ],
        animalType: 'cattle',
        breed: 'Jersey',
        baseConfidence: 0.5
      }
    ];

    // Initialize emergency breeds
    this.emergencyBreeds = [
      'Mixed Breed Cattle',
      'Local Cattle',
      'Common Breed',
      'Indigenous Cattle',
      'Regional Buffalo'
    ];
  }

  /**
   * Test fallback system with mock scenarios
   */
  public async testFallbackScenarios(): Promise<any> {
    const scenarios = [
      {
        name: 'API Failure',
        error: new Error('Vision API unavailable'),
        expectedMethod: 'pattern_matching'
      },
      {
        name: 'Low Confidence',
        error: { message: 'confidence too low', confidence: 0.2 },
        expectedMethod: 'statistical'
      },
      {
        name: 'Network Error',
        error: new Error('Network timeout'),
        expectedMethod: 'heuristic'
      }
    ];

    const results = [];
    for (const scenario of scenarios) {
      try {
        const result = await this.performFallback('mock_image_data', scenario.error);
        results.push({
          scenario: scenario.name,
          success: true,
          method: result.fallbackMethod,
          reliability: result.reliability
        });
      } catch (error) {
        results.push({
          scenario: scenario.name,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const fallbackClassifier = new FallbackClassifier();