/**
 * Advanced Confidence Scoring System
 * Multi-factor confidence analysis for livestock classification
 */

export interface ConfidenceFactors {
  visualClarity: number;        // 0-1: Image quality and clarity
  featureMatchStrength: number; // 0-1: How well features match expected patterns
  databaseConsistency: number;  // 0-1: Consistency with breed database
  expertConsensus: number;      // 0-1: Agreement with expert knowledge
  historicalAccuracy: number;   // 0-1: Based on historical classification performance
  contextualRelevance: number;  // 0-1: Geographic and contextual factors
  multiSourceAgreement: number; // 0-1: Agreement between different detection methods
}

export interface ConfidenceResult {
  overallConfidence: number;    // 0-1: Final confidence score
  confidenceLevel: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  factors: ConfidenceFactors;
  reliabilityIndicators: ReliabilityIndicators;
  recommendations: string[];
  uncertaintyAnalysis: UncertaintyAnalysis;
}

export interface ReliabilityIndicators {
  scoreStability: number;       // How consistent scores are across multiple attempts
  featureAgreement: number;     // Agreement between different visual features
  temporalConsistency: number;  // Consistency over time (if multiple samples)
  crossValidation: number;      // Validation against multiple models/methods
}

export interface UncertaintyAnalysis {
  primaryUncertaintySource: string;
  uncertaintyLevel: number;
  confidenceInterval: [number, number];
  alternativePredictions: Array<{
    prediction: string;
    probability: number;
    reasoning: string;
  }>;
}

export interface ClassificationInput {
  animalType: {
    prediction: string;
    rawScore: number;
    features: string[];
  };
  breed: {
    prediction: string;
    rawScore: number;
    alternatives: Array<{ breed: string; score: number }>;
    databaseMatch: boolean;
  };
  visualFeatures: {
    imageQuality: number;
    animalVisibility: number;
    backgroundClarity: number;
    lightingQuality: number;
  };
  detectionMetadata: {
    processingTime: number;
    apiResponseQuality: number;
    featureCount: number;
    objectDetectionScore?: number;
  };
}

export class AdvancedConfidenceScorer {
  private historicalAccuracy: Map<string, number> = new Map();
  private breedDatabase: Map<string, any> = new Map();
  private confidenceThresholds: ConfidenceThresholds;

  constructor() {
    this.initializeHistoricalData();
    this.initializeBreedDatabase();
    this.confidenceThresholds = new ConfidenceThresholds();
  }

  /**
   * Calculate comprehensive confidence score for classification
   */
  calculateConfidence(input: ClassificationInput): ConfidenceResult {
    const factors = this.analyzeConfidenceFactors(input);
    const reliabilityIndicators = this.assessReliability(input, factors);
    const overallConfidence = this.computeOverallConfidence(factors);
    const confidenceLevel = this.determineConfidenceLevel(overallConfidence);
    const uncertaintyAnalysis = this.analyzeUncertainty(input, factors);
    const recommendations = this.generateRecommendations(factors, reliabilityIndicators);

    return {
      overallConfidence,
      confidenceLevel,
      factors,
      reliabilityIndicators,
      recommendations,
      uncertaintyAnalysis
    };
  }

  /**
   * Analyze individual confidence factors
   */
  private analyzeConfidenceFactors(input: ClassificationInput): ConfidenceFactors {
    return {
      visualClarity: this.assessVisualClarity(input.visualFeatures),
      featureMatchStrength: this.assessFeatureMatchStrength(input),
      databaseConsistency: this.assessDatabaseConsistency(input.breed),
      expertConsensus: this.assessExpertConsensus(input.animalType, input.breed),
      historicalAccuracy: this.getHistoricalAccuracy(input.breed.prediction),
      contextualRelevance: this.assessContextualRelevance(input),
      multiSourceAgreement: this.assessMultiSourceAgreement(input)
    };
  }

  /**
   * Assess visual clarity of the image
   */
  private assessVisualClarity(visualFeatures: ClassificationInput['visualFeatures']): number {
    const weights = {
      imageQuality: 0.35,
      animalVisibility: 0.35,
      backgroundClarity: 0.15,
      lightingQuality: 0.15
    };

    const weightedScore = 
      visualFeatures.imageQuality * weights.imageQuality +
      visualFeatures.animalVisibility * weights.animalVisibility +
      visualFeatures.backgroundClarity * weights.backgroundClarity +
      visualFeatures.lightingQuality * weights.lightingQuality;

    // Apply quality thresholds
    if (weightedScore < 0.3) return 0.1; // Very poor quality
    if (weightedScore < 0.5) return Math.max(0.2, weightedScore * 0.7);
    if (weightedScore < 0.7) return weightedScore * 0.9;
    return Math.min(1.0, weightedScore * 1.1); // Boost high quality
  }

  /**
   * Assess strength of feature matching
   */
  private assessFeatureMatchStrength(input: ClassificationInput): number {
    let baseScore = input.animalType.rawScore;

    // Boost score if multiple features align
    const featureCount = input.animalType.features.length;
    const featureBonus = Math.min(0.2, featureCount * 0.05);
    baseScore += featureBonus;

    // Consider breed prediction strength
    const breedScore = input.breed.rawScore;
    const breedAlternatives = input.breed.alternatives.length;
    
    // If top breed score is significantly higher than alternatives, boost confidence
    if (breedAlternatives > 0) {
      const topScore = breedScore;
      const secondScore = input.breed.alternatives[0]?.score || 0;
      const scoreGap = topScore - secondScore;
      
      if (scoreGap > 0.2) {
        baseScore += 0.15; // Clear winner boost
      } else if (scoreGap < 0.05) {
        baseScore -= 0.1; // Very close scores reduce confidence
      }
    }

    return Math.min(1.0, Math.max(0.1, baseScore));
  }

  /**
   * Assess consistency with breed database
   */
  private assessDatabaseConsistency(breed: ClassificationInput['breed']): number {
    if (!breed.databaseMatch) {
      return 0.3; // Low confidence for breeds not in database
    }

    const breedInfo = this.breedDatabase.get(breed.prediction.toLowerCase());
    if (!breedInfo) {
      return 0.4; // Slight penalty for unknown breeds
    }

    // Check if prediction aligns with known breed characteristics
    let consistencyScore = 0.8; // Base score for database match

    // Additional validation could be added here based on:
    // - Breed rarity (rare breeds get lower confidence)
    // - Regional distribution
    // - Physical characteristics alignment
    
    return consistencyScore;
  }

  /**
   * Assess expert consensus based on known patterns
   */
  private assessExpertConsensus(animalType: ClassificationInput['animalType'], breed: ClassificationInput['breed']): number {
    // Simulate expert consensus based on prediction patterns
    const expertKnowledge = {
      // High confidence combinations
      'cattle_holstein': 0.9,
      'cattle_jersey': 0.9,
      'buffalo_murrah': 0.9,
      'buffalo_nili_ravi': 0.85,
      
      // Medium confidence combinations  
      'cattle_gir': 0.7,
      'cattle_sahiwal': 0.7,
      'buffalo_surti': 0.75,
      
      // Lower confidence (harder to distinguish)
      'cattle_mixed': 0.5,
      'buffalo_mixed': 0.5
    };

    const key = `${animalType.prediction}_${breed.prediction.toLowerCase().replace(/\s+/g, '_')}`;
    return expertKnowledge[key] || 0.6; // Default moderate consensus
  }

  /**
   * Get historical accuracy for this prediction type
   */
  private getHistoricalAccuracy(breedPrediction: string): number {
    const key = breedPrediction.toLowerCase();
    return this.historicalAccuracy.get(key) || 0.65; // Default moderate accuracy
  }

  /**
   * Assess contextual relevance (geographic, seasonal, etc.)
   */
  private assessContextualRelevance(input: ClassificationInput): number {
    // This could incorporate:
    // - Geographic location vs breed distribution
    // - Seasonal factors
    // - Farm type context
    // - Local breeding practices
    
    // For now, return moderate relevance with slight boost for common breeds
    const commonBreeds = ['holstein', 'jersey', 'murrah', 'gir', 'sahiwal'];
    const isCommon = commonBreeds.some(breed => 
      input.breed.prediction.toLowerCase().includes(breed)
    );
    
    return isCommon ? 0.8 : 0.6;
  }

  /**
   * Assess agreement between multiple detection methods
   */
  private assessMultiSourceAgreement(input: ClassificationInput): number {
    let agreement = 0.7; // Base agreement score

    // If object detection also identified the animal
    if (input.detectionMetadata.objectDetectionScore) {
      if (input.detectionMetadata.objectDetectionScore > 0.7) {
        agreement += 0.2;
      } else if (input.detectionMetadata.objectDetectionScore < 0.3) {
        agreement -= 0.2;
      }
    }

    // If multiple features were detected consistently
    const featureCount = input.detectionMetadata.featureCount;
    if (featureCount > 5) {
      agreement += 0.1;
    } else if (featureCount < 3) {
      agreement -= 0.15;
    }

    return Math.min(1.0, Math.max(0.2, agreement));
  }

  /**
   * Assess reliability indicators
   */
  private assessReliability(input: ClassificationInput, factors: ConfidenceFactors): ReliabilityIndicators {
    return {
      scoreStability: this.assessScoreStability(input),
      featureAgreement: this.assessFeatureAgreement(input),
      temporalConsistency: 0.8, // Would require multiple samples over time
      crossValidation: factors.multiSourceAgreement
    };
  }

  /**
   * Assess score stability (how consistent results would be on retry)
   */
  private assessScoreStability(input: ClassificationInput): number {
    // Higher quality inputs tend to have more stable scores
    const qualityFactor = input.visualFeatures.imageQuality;
    
    // Processing time can indicate complexity/uncertainty
    const processingFactor = Math.min(1.0, 5.0 / input.detectionMetadata.processingTime);
    
    // API response quality
    const apiFactor = input.detectionMetadata.apiResponseQuality;
    
    return (qualityFactor * 0.4 + processingFactor * 0.3 + apiFactor * 0.3);
  }

  /**
   * Assess agreement between different visual features
   */
  private assessFeatureAgreement(input: ClassificationInput): number {
    // If animal type and breed predictions are mutually supportive
    const features = input.animalType.features;
    const breedPrediction = input.breed.prediction.toLowerCase();
    
    let agreement = 0.7;
    
    // Check if features contain breed-specific terms
    const hasBreedFeatures = features.some(feature => 
      breedPrediction.includes(feature.toLowerCase()) || 
      feature.toLowerCase().includes(breedPrediction.split(' ')[0])
    );
    
    if (hasBreedFeatures) {
      agreement += 0.2;
    }
    
    // Check for conflicting features
    const animalType = input.animalType.prediction;
    const hasConflictingFeatures = features.some(feature => {
      if (animalType === 'cattle' && feature.includes('buffalo')) return true;
      if (animalType === 'buffalo' && feature.includes('dairy')) return true;
      return false;
    });
    
    if (hasConflictingFeatures) {
      agreement -= 0.3;
    }
    
    return Math.min(1.0, Math.max(0.2, agreement));
  }

  /**
   * Compute overall confidence using weighted factors
   */
  private computeOverallConfidence(factors: ConfidenceFactors): number {
    const weights = {
      visualClarity: 0.20,
      featureMatchStrength: 0.25,
      databaseConsistency: 0.15,
      expertConsensus: 0.15,
      historicalAccuracy: 0.10,
      contextualRelevance: 0.05,
      multiSourceAgreement: 0.10
    };

    let weightedSum = 0;
    Object.entries(factors).forEach(([key, value]) => {
      weightedSum += value * (weights[key as keyof typeof weights] || 0);
    });

    // Apply non-linear scaling to make confidence more meaningful
    const scaledConfidence = this.applyConfidenceScaling(weightedSum);
    
    return Math.min(1.0, Math.max(0.1, scaledConfidence));
  }

  /**
   * Apply non-linear scaling to confidence scores
   */
  private applyConfidenceScaling(rawConfidence: number): number {
    // Apply sigmoid-like curve to spread out middle values
    if (rawConfidence < 0.3) {
      return rawConfidence * 0.5; // Compress very low scores
    } else if (rawConfidence < 0.7) {
      // Linear region for middle scores
      return 0.15 + (rawConfidence - 0.3) * 1.25;
    } else {
      // Compress high scores to avoid overconfidence
      return 0.65 + (rawConfidence - 0.7) * 0.8;
    }
  }

  /**
   * Determine confidence level category
   */
  private determineConfidenceLevel(confidence: number): ConfidenceResult['confidenceLevel'] {
    if (confidence >= this.confidenceThresholds.veryHigh) return 'very_high';
    if (confidence >= this.confidenceThresholds.high) return 'high';
    if (confidence >= this.confidenceThresholds.medium) return 'medium';
    if (confidence >= this.confidenceThresholds.low) return 'low';
    return 'very_low';
  }

  /**
   * Analyze uncertainty in the prediction
   */
  private analyzeUncertainty(input: ClassificationInput, factors: ConfidenceFactors): UncertaintyAnalysis {
    // Identify primary source of uncertainty
    const factorScores = Object.entries(factors).map(([key, value]) => ({
      factor: key,
      score: value
    }));
    
    const lowestFactor = factorScores.reduce((min, current) => 
      current.score < min.score ? current : min
    );

    const uncertaintyLevel = 1 - factors.featureMatchStrength;
    const confidence = this.computeOverallConfidence(factors);
    
    // Create confidence interval
    const margin = uncertaintyLevel * 0.3;
    const confidenceInterval: [number, number] = [
      Math.max(0, confidence - margin),
      Math.min(1, confidence + margin)
    ];

    // Generate alternative predictions with probabilities
    const alternatives = input.breed.alternatives.slice(0, 3).map((alt, index) => ({
      prediction: alt.breed,
      probability: alt.score * (0.8 - index * 0.2),
      reasoning: `Alternative breed with ${(alt.score * 100).toFixed(1)}% feature match`
    }));

    return {
      primaryUncertaintySource: this.getUncertaintySourceDescription(lowestFactor.factor),
      uncertaintyLevel,
      confidenceInterval,
      alternativePredictions: alternatives
    };
  }

  /**
   * Generate recommendations to improve confidence
   */
  private generateRecommendations(factors: ConfidenceFactors, reliability: ReliabilityIndicators): string[] {
    const recommendations: string[] = [];

    if (factors.visualClarity < 0.6) {
      recommendations.push('📸 Improve image quality: Use better lighting and ensure animal is clearly visible');
      recommendations.push('🎯 Get closer to the animal or use higher resolution camera');
    }

    if (factors.featureMatchStrength < 0.5) {
      recommendations.push('🔍 Try capturing different angles showing distinctive breed features');
      recommendations.push('📐 Ensure the animal\'s head, body, and legs are visible');
    }

    if (factors.databaseConsistency < 0.6) {
      recommendations.push('📚 Consider expert verification for unusual or rare breeds');
      recommendations.push('🧬 Check breed characteristics against standard references');
    }

    if (reliability.featureAgreement < 0.6) {
      recommendations.push('🔄 Take multiple photos from different angles for comparison');
      recommendations.push('⚖️ Look for conflicting visual cues that might indicate mixed breeding');
    }

    if (factors.multiSourceAgreement < 0.5) {
      recommendations.push('🎪 Try classification again with different lighting or positioning');
      recommendations.push('👥 Consider getting a second opinion from livestock experts');
    }

    // Priority recommendations
    const overallConfidence = this.computeOverallConfidence(factors);
    if (overallConfidence < 0.4) {
      recommendations.unshift('⚠️ Low confidence classification - consider multiple verification methods');
    }

    return recommendations;
  }

  /**
   * Get description for uncertainty source
   */
  private getUncertaintySourceDescription(factor: string): string {
    const descriptions = {
      visualClarity: 'Poor image quality or visibility',
      featureMatchStrength: 'Weak feature detection or matching',
      databaseConsistency: 'Breed not well-represented in database',
      expertConsensus: 'Disagreement with expert knowledge patterns',
      historicalAccuracy: 'Poor historical performance for this breed type',
      contextualRelevance: 'Unusual context or geographic mismatch',
      multiSourceAgreement: 'Disagreement between detection methods'
    };
    
    return descriptions[factor] || 'Unknown uncertainty source';
  }

  /**
   * Initialize historical accuracy data
   */
  private initializeHistoricalData(): void {
    // Mock historical accuracy data - in production this would come from real performance metrics
    const historicalData = [
      { breed: 'holstein friesian', accuracy: 0.92 },
      { breed: 'jersey', accuracy: 0.89 },
      { breed: 'murrah', accuracy: 0.88 },
      { breed: 'gir', accuracy: 0.75 },
      { breed: 'sahiwal', accuracy: 0.73 },
      { breed: 'nili ravi', accuracy: 0.80 },
      { breed: 'surti', accuracy: 0.78 },
      { breed: 'tharparkar', accuracy: 0.70 },
      { breed: 'red sindhi', accuracy: 0.72 }
    ];

    historicalData.forEach(({ breed, accuracy }) => {
      this.historicalAccuracy.set(breed, accuracy);
    });
  }

  /**
   * Initialize breed database
   */
  private initializeBreedDatabase(): void {
    // Mock breed database - in production would be comprehensive
    const breeds = [
      { name: 'holstein friesian', type: 'cattle', rarity: 'common' },
      { name: 'jersey', type: 'cattle', rarity: 'common' },
      { name: 'gir', type: 'cattle', rarity: 'moderate' },
      { name: 'sahiwal', type: 'cattle', rarity: 'moderate' },
      { name: 'murrah', type: 'buffalo', rarity: 'common' },
      { name: 'nili ravi', type: 'buffalo', rarity: 'moderate' },
      { name: 'surti', type: 'buffalo', rarity: 'moderate' }
    ];

    breeds.forEach(breed => {
      this.breedDatabase.set(breed.name, breed);
    });
  }

  /**
   * Update historical accuracy based on feedback
   */
  public updateHistoricalAccuracy(breed: string, wasCorrect: boolean): void {
    const key = breed.toLowerCase();
    const currentAccuracy = this.historicalAccuracy.get(key) || 0.5;
    
    // Simple update - in production would use more sophisticated learning
    const learningRate = 0.05;
    const newAccuracy = wasCorrect 
      ? currentAccuracy + (1 - currentAccuracy) * learningRate
      : currentAccuracy - currentAccuracy * learningRate;
    
    this.historicalAccuracy.set(key, Math.min(0.98, Math.max(0.1, newAccuracy)));
    
    console.log(`📊 Updated accuracy for ${breed}: ${(newAccuracy * 100).toFixed(1)}%`);
  }

  /**
   * Analyze confidence for classification result (alias for calculateConfidence)
   */
  public analyzeConfidence(input: ClassificationInput): ConfidenceResult {
    return this.calculateConfidence(input);
  }
  
  /**
   * Get confidence summary for display
   */
  public getConfidenceSummary(result: ConfidenceResult): string {
    const level = result.confidenceLevel;
    const score = (result.overallConfidence * 100).toFixed(1);
    
    const levelDescriptions = {
      very_high: `Very High Confidence (${score}%) - Reliable classification`,
      high: `High Confidence (${score}%) - Good classification`,
      medium: `Medium Confidence (${score}%) - Reasonable classification`,
      low: `Low Confidence (${score}%) - Consider verification`,
      very_low: `Very Low Confidence (${score}%) - Requires verification`
    };
    
    return levelDescriptions[level];
  }
}

/**
 * Confidence threshold configuration
 */
class ConfidenceThresholds {
  public veryHigh = 0.85;
  public high = 0.70;
  public medium = 0.55;
  public low = 0.35;
  
  public shouldRequireVerification(confidence: number): boolean {
    return confidence < this.medium;
  }
  
  public isReliableForTraining(confidence: number): boolean {
    return confidence >= this.high;
  }
}

// Export singleton instance
export const confidenceScorer = new AdvancedConfidenceScorer();