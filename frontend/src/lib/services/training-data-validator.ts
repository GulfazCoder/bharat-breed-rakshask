/**
 * Training Data Validation System
 * Comprehensive validation for livestock training data quality and consistency
 */

export interface TrainingDataEntry {
  id: string;
  imageUrl: string;
  imageData?: string; // Base64 or file data
  labels: {
    animalType: 'cattle' | 'buffalo' | 'goat' | 'sheep' | 'horse' | 'pig';
    breed: string;
    age: 'calf' | 'young_adult' | 'adult' | 'mature' | 'old';
    gender: 'male' | 'female' | 'unknown';
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'sick';
  };
  physicalAttributes: {
    bodyColor: string[];
    hornType: string;
    bodySize: string;
    bodyCondition: string;
    distinctiveFeatures: string[];
  };
  metadata: {
    captureDate: string;
    location?: string;
    source: string;
    expertVerified: boolean;
    verificationLevel: 'high' | 'medium' | 'low';
  };
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  recommendations: string[];
  qualityMetrics: QualityMetrics;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'image_quality' | 'label_consistency' | 'data_completeness' | 'biological_accuracy';
  message: string;
  severity: number; // 1-10
  field?: string;
}

export interface QualityMetrics {
  imageQuality: number;
  labelConsistency: number;
  dataCompleteness: number;
  biologicalAccuracy: number;
  expertVerification: number;
}

export interface ValidationReport {
  totalEntries: number;
  validEntries: number;
  invalidEntries: number;
  averageQualityScore: number;
  issueDistribution: { [key: string]: number };
  recommendations: string[];
  detailedResults: ValidationResult[];
}

export class TrainingDataValidator {
  private breedDatabase: Map<string, any> = new Map();
  private validationRules: ValidationRules;

  constructor() {
    this.initializeBreedDatabase();
    this.validationRules = new ValidationRules();
  }

  /**
   * Validate a single training data entry
   */
  async validateEntry(entry: TrainingDataEntry): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const qualityMetrics: QualityMetrics = {
      imageQuality: 0,
      labelConsistency: 0,
      dataCompleteness: 0,
      biologicalAccuracy: 0,
      expertVerification: 0
    };

    // 1. Image Quality Validation
    if (entry.imageData || entry.imageUrl) {
      const imageQualityResult = await this.validateImageQuality(entry);
      qualityMetrics.imageQuality = imageQualityResult.score;
      issues.push(...imageQualityResult.issues);
    } else {
      issues.push({
        type: 'error',
        category: 'image_quality',
        message: 'No image data provided',
        severity: 10,
        field: 'imageData'
      });
    }

    // 2. Label Consistency Validation
    const labelConsistencyResult = this.validateLabelConsistency(entry);
    qualityMetrics.labelConsistency = labelConsistencyResult.score;
    issues.push(...labelConsistencyResult.issues);

    // 3. Data Completeness Validation
    const completenessResult = this.validateDataCompleteness(entry);
    qualityMetrics.dataCompleteness = completenessResult.score;
    issues.push(...completenessResult.issues);

    // 4. Biological Accuracy Validation
    const biologicalResult = this.validateBiologicalAccuracy(entry);
    qualityMetrics.biologicalAccuracy = biologicalResult.score;
    issues.push(...biologicalResult.issues);

    // 5. Expert Verification Assessment
    qualityMetrics.expertVerification = this.assessExpertVerification(entry);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(qualityMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, qualityMetrics);

    return {
      isValid: issues.filter(i => i.type === 'error').length === 0 && overallScore >= 60,
      score: overallScore,
      issues,
      recommendations,
      qualityMetrics
    };
  }

  /**
   * Validate image quality
   */
  private async validateImageQuality(entry: TrainingDataEntry): Promise<{ score: number, issues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];
    let score = 100;

    try {
      if (entry.imageData) {
        // Validate base64 image data
        const imageInfo = this.analyzeBase64Image(entry.imageData);
        
        // Check image size
        if (imageInfo.size < 50000) { // Less than 50KB
          issues.push({
            type: 'warning',
            category: 'image_quality',
            message: 'Image file size is very small, may lack detail',
            severity: 5
          });
          score -= 15;
        }

        if (imageInfo.size > 10000000) { // More than 10MB
          issues.push({
            type: 'warning',
            category: 'image_quality',
            message: 'Image file size is very large, consider compression',
            severity: 3
          });
          score -= 5;
        }

        // Check image format
        if (!['jpeg', 'jpg', 'png'].includes(imageInfo.format.toLowerCase())) {
          issues.push({
            type: 'warning',
            category: 'image_quality',
            message: `Image format ${imageInfo.format} is not optimal, use JPEG or PNG`,
            severity: 4
          });
          score -= 10;
        }

        // Simulate resolution check (in real implementation, would analyze actual image)
        const estimatedResolution = this.estimateResolution(imageInfo.size);
        if (estimatedResolution < 640 * 480) {
          issues.push({
            type: 'warning',
            category: 'image_quality',
            message: 'Image resolution appears to be low, may affect classification accuracy',
            severity: 6
          });
          score -= 20;
        }

      } else if (entry.imageUrl) {
        // Validate image URL
        if (!this.isValidImageUrl(entry.imageUrl)) {
          issues.push({
            type: 'error',
            category: 'image_quality',
            message: 'Invalid image URL format',
            severity: 8,
            field: 'imageUrl'
          });
          score = 0;
        }
      }

    } catch (error) {
      issues.push({
        type: 'error',
        category: 'image_quality',
        message: 'Failed to validate image data',
        severity: 9
      });
      score = 0;
    }

    return { score: Math.max(score, 0), issues };
  }

  /**
   * Validate label consistency
   */
  private validateLabelConsistency(entry: TrainingDataEntry): { score: number, issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Check animal type and breed consistency
    if (entry.labels.animalType && entry.labels.breed) {
      const isConsistent = this.validateAnimalBreedConsistency(
        entry.labels.animalType,
        entry.labels.breed
      );

      if (!isConsistent) {
        issues.push({
          type: 'error',
          category: 'label_consistency',
          message: `Breed "${entry.labels.breed}" is not consistent with animal type "${entry.labels.animalType}"`,
          severity: 9,
          field: 'labels.breed'
        });
        score -= 30;
      }
    }

    // Check age and physical attributes consistency
    if (entry.labels.age && entry.physicalAttributes.bodySize) {
      const ageBodyConsistency = this.validateAgeBodyConsistency(
        entry.labels.age,
        entry.physicalAttributes.bodySize
      );

      if (!ageBodyConsistency) {
        issues.push({
          type: 'warning',
          category: 'label_consistency',
          message: 'Age and body size appear inconsistent',
          severity: 5
        });
        score -= 10;
      }
    }

    // Check gender-specific attributes
    if (entry.labels.gender === 'male' && entry.physicalAttributes.distinctiveFeatures.includes('udder')) {
      issues.push({
        type: 'error',
        category: 'label_consistency',
        message: 'Male animal cannot have udder as distinctive feature',
        severity: 8
      });
      score -= 25;
    }

    // Check health status and physical condition consistency
    if (entry.labels.healthStatus && entry.physicalAttributes.bodyCondition) {
      const healthBodyConsistency = this.validateHealthBodyConsistency(
        entry.labels.healthStatus,
        entry.physicalAttributes.bodyCondition
      );

      if (!healthBodyConsistency) {
        issues.push({
          type: 'warning',
          category: 'label_consistency',
          message: 'Health status and body condition may be inconsistent',
          severity: 4
        });
        score -= 8;
      }
    }

    return { score: Math.max(score, 0), issues };
  }

  /**
   * Validate data completeness
   */
  private validateDataCompleteness(entry: TrainingDataEntry): { score: number, issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Required fields check
    const requiredFields = [
      { field: 'labels.animalType', value: entry.labels.animalType, weight: 20 },
      { field: 'labels.breed', value: entry.labels.breed, weight: 20 },
      { field: 'labels.age', value: entry.labels.age, weight: 10 },
      { field: 'labels.gender', value: entry.labels.gender, weight: 10 },
      { field: 'physicalAttributes.bodyColor', value: entry.physicalAttributes.bodyColor?.length, weight: 10 },
      { field: 'metadata.captureDate', value: entry.metadata.captureDate, weight: 5 }
    ];

    requiredFields.forEach(({ field, value, weight }) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        issues.push({
          type: 'warning',
          category: 'data_completeness',
          message: `Missing required field: ${field}`,
          severity: 6,
          field
        });
        score -= weight;
      }
    });

    // Optional but valuable fields
    const optionalFields = [
      { field: 'physicalAttributes.hornType', value: entry.physicalAttributes.hornType, weight: 5 },
      { field: 'physicalAttributes.bodySize', value: entry.physicalAttributes.bodySize, weight: 5 },
      { field: 'physicalAttributes.distinctiveFeatures', value: entry.physicalAttributes.distinctiveFeatures?.length, weight: 8 },
      { field: 'metadata.location', value: entry.metadata.location, weight: 3 }
    ];

    optionalFields.forEach(({ field, value, weight }) => {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        issues.push({
          type: 'info',
          category: 'data_completeness',
          message: `Optional field missing: ${field} - would improve training quality`,
          severity: 2,
          field
        });
        score -= weight;
      }
    });

    return { score: Math.max(score, 0), issues };
  }

  /**
   * Validate biological accuracy
   */
  private validateBiologicalAccuracy(entry: TrainingDataEntry): { score: number, issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Validate breed exists in database
    if (entry.labels.breed) {
      const breedInfo = this.breedDatabase.get(entry.labels.breed.toLowerCase());
      if (!breedInfo) {
        issues.push({
          type: 'warning',
          category: 'biological_accuracy',
          message: `Breed "${entry.labels.breed}" not found in database, may be rare or misspelled`,
          severity: 5
        });
        score -= 15;
      } else {
        // Validate breed characteristics against database
        if (breedInfo.animalType !== entry.labels.animalType) {
          issues.push({
            type: 'error',
            category: 'biological_accuracy',
            message: `Breed "${entry.labels.breed}" belongs to ${breedInfo.animalType}, not ${entry.labels.animalType}`,
            severity: 9
          });
          score -= 30;
        }

        // Validate color consistency
        if (breedInfo.commonColors && entry.physicalAttributes.bodyColor) {
          const colorMatch = entry.physicalAttributes.bodyColor.some(color =>
            breedInfo.commonColors.includes(color.toLowerCase())
          );
          if (!colorMatch) {
            issues.push({
              type: 'warning',
              category: 'biological_accuracy',
              message: `Body colors may be unusual for ${entry.labels.breed} breed`,
              severity: 4
            });
            score -= 10;
          }
        }
      }
    }

    // Age validation
    if (entry.labels.age === 'calf' && entry.physicalAttributes.bodySize === 'large') {
      issues.push({
        type: 'warning',
        category: 'biological_accuracy',
        message: 'Calves are typically not large in body size',
        severity: 6
      });
      score -= 15;
    }

    // Gender and features validation
    if (entry.labels.gender === 'female' && 
        entry.labels.animalType === 'cattle' &&
        entry.labels.age === 'adult' &&
        !entry.physicalAttributes.distinctiveFeatures.some(f => f.toLowerCase().includes('udder'))) {
      issues.push({
        type: 'info',
        category: 'biological_accuracy',
        message: 'Adult female cattle typically have visible udders',
        severity: 3
      });
      score -= 5;
    }

    return { score: Math.max(score, 0), issues };
  }

  /**
   * Assess expert verification quality
   */
  private assessExpertVerification(entry: TrainingDataEntry): number {
    let score = 0;

    if (entry.metadata.expertVerified) {
      score += 40;
      
      switch (entry.metadata.verificationLevel) {
        case 'high':
          score += 60;
          break;
        case 'medium':
          score += 40;
          break;
        case 'low':
          score += 20;
          break;
      }
    } else {
      score = 20; // Some credit for self-reported data
    }

    return Math.min(score, 100);
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallScore(metrics: QualityMetrics): number {
    const weights = {
      imageQuality: 0.25,
      labelConsistency: 0.30,
      dataCompleteness: 0.20,
      biologicalAccuracy: 0.15,
      expertVerification: 0.10
    };

    return Math.round(
      metrics.imageQuality * weights.imageQuality +
      metrics.labelConsistency * weights.labelConsistency +
      metrics.dataCompleteness * weights.dataCompleteness +
      metrics.biologicalAccuracy * weights.biologicalAccuracy +
      metrics.expertVerification * weights.expertVerification
    );
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(issues: ValidationIssue[], metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];

    // Image quality recommendations
    if (metrics.imageQuality < 70) {
      recommendations.push('📸 Improve image quality: Use higher resolution images with good lighting');
      recommendations.push('🔍 Ensure the animal is clearly visible and takes up most of the frame');
    }

    // Label consistency recommendations
    if (metrics.labelConsistency < 80) {
      recommendations.push('🏷️ Review label consistency: Check that breed matches animal type');
      recommendations.push('🔄 Cross-validate age, gender, and physical attributes');
    }

    // Data completeness recommendations
    if (metrics.dataCompleteness < 70) {
      recommendations.push('📝 Complete missing data fields to improve training quality');
      recommendations.push('🎯 Add distinctive features and physical characteristics');
    }

    // Biological accuracy recommendations
    if (metrics.biologicalAccuracy < 75) {
      recommendations.push('🧬 Verify biological accuracy against breed standards');
      recommendations.push('📚 Consult livestock experts for breed identification');
    }

    // Expert verification recommendations
    if (metrics.expertVerification < 60) {
      recommendations.push('👨‍🏫 Get expert verification to improve data reliability');
      recommendations.push('🎓 Consider veterinarian or livestock specialist review');
    }

    // Priority issues
    const errorCount = issues.filter(i => i.type === 'error').length;
    if (errorCount > 0) {
      recommendations.unshift('🚨 Fix critical errors before using this data for training');
    }

    return recommendations;
  }

  /**
   * Validate multiple training data entries
   */
  async validateBatch(entries: TrainingDataEntry[]): Promise<ValidationReport> {
    const results: ValidationResult[] = [];
    let validCount = 0;
    let totalScore = 0;
    const issueCount: { [key: string]: number } = {};

    for (const entry of entries) {
      const result = await this.validateEntry(entry);
      results.push(result);
      
      if (result.isValid) {
        validCount++;
      }
      
      totalScore += result.score;
      
      // Count issues by category
      result.issues.forEach(issue => {
        issueCount[issue.category] = (issueCount[issue.category] || 0) + 1;
      });
    }

    // Generate batch recommendations
    const batchRecommendations: string[] = [];
    const averageScore = totalScore / entries.length;
    
    if (averageScore < 70) {
      batchRecommendations.push('📊 Overall data quality needs improvement');
    }
    
    if (validCount / entries.length < 0.8) {
      batchRecommendations.push('⚠️ High percentage of invalid entries - review data collection process');
    }

    return {
      totalEntries: entries.length,
      validEntries: validCount,
      invalidEntries: entries.length - validCount,
      averageQualityScore: Math.round(averageScore),
      issueDistribution: issueCount,
      recommendations: batchRecommendations,
      detailedResults: results
    };
  }

  // Helper methods
  private initializeBreedDatabase(): void {
    // Initialize with common breeds - in production this would load from actual database
    const commonBreeds = [
      { name: 'gir', animalType: 'cattle', commonColors: ['red', 'reddish', 'white'] },
      { name: 'sahiwal', animalType: 'cattle', commonColors: ['red', 'brown'] },
      { name: 'holstein friesian', animalType: 'cattle', commonColors: ['black', 'white'] },
      { name: 'jersey', animalType: 'cattle', commonColors: ['brown', 'fawn'] },
      { name: 'murrah', animalType: 'buffalo', commonColors: ['black', 'jet black'] },
      { name: 'nili ravi', animalType: 'buffalo', commonColors: ['black', 'dark'] },
      { name: 'surti', animalType: 'buffalo', commonColors: ['black', 'brown'] }
    ];

    commonBreeds.forEach(breed => {
      this.breedDatabase.set(breed.name.toLowerCase(), breed);
    });
  }

  private analyzeBase64Image(base64Data: string): { size: number, format: string } {
    // Simple base64 analysis
    const header = base64Data.substring(0, 50);
    let format = 'unknown';
    
    if (header.includes('jpeg') || header.includes('jpg')) format = 'jpeg';
    else if (header.includes('png')) format = 'png';
    else if (header.includes('gif')) format = 'gif';
    
    const size = Math.round(base64Data.length * 0.75); // Approximate file size
    
    return { size, format };
  }

  private estimateResolution(fileSize: number): number {
    // Rough estimation based on file size
    return Math.sqrt(fileSize / 3); // Simplified calculation
  }

  private isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
    } catch {
      return false;
    }
  }

  private validateAnimalBreedConsistency(animalType: string, breed: string): boolean {
    const breedInfo = this.breedDatabase.get(breed.toLowerCase());
    return !breedInfo || breedInfo.animalType === animalType;
  }

  private validateAgeBodyConsistency(age: string, bodySize: string): boolean {
    const ageBodyMap: { [key: string]: string[] } = {
      'calf': ['small', 'medium'],
      'young_adult': ['small', 'medium', 'large'],
      'adult': ['medium', 'large', 'extra_large'],
      'mature': ['large', 'extra_large'],
      'old': ['medium', 'large', 'extra_large']
    };

    return ageBodyMap[age]?.includes(bodySize) || false;
  }

  private validateHealthBodyConsistency(healthStatus: string, bodyCondition: string): boolean {
    const healthBodyMap: { [key: string]: string[] } = {
      'excellent': ['normal', 'fat'],
      'good': ['normal', 'fat'],
      'fair': ['thin', 'normal'],
      'poor': ['thin'],
      'sick': ['thin']
    };

    return healthBodyMap[healthStatus]?.includes(bodyCondition) || false;
  }

  /**
   * Validate a single image for classification (simplified validation)
   */
  public async validateSingleImage(data: {
    labels: any[];
    objects: any[];
    imageData?: string;
    imageUrl?: string;
  }): Promise<ValidationResult> {
    // Simplified validation for single image classification
    const issues: ValidationIssue[] = [];
    const qualityMetrics: QualityMetrics = {
      imageQuality: 75, // Default assumption
      labelConsistency: 80,
      dataCompleteness: 70,
      biologicalAccuracy: 75,
      expertVerification: 50
    };

    // Basic image validation
    if (!data.imageData && !data.imageUrl) {
      issues.push({
        type: 'warning',
        category: 'image_quality',
        message: 'No image data available for validation',
        severity: 5
      });
      qualityMetrics.imageQuality = 50;
    }

    // Label quality check
    if (!data.labels || data.labels.length === 0) {
      issues.push({
        type: 'warning',
        category: 'data_completeness',
        message: 'No labels available for validation',
        severity: 6
      });
      qualityMetrics.dataCompleteness = 40;
    }

    // Object detection quality
    if (!data.objects || data.objects.length === 0) {
      issues.push({
        type: 'info',
        category: 'data_completeness',
        message: 'No object detection data available',
        severity: 3
      });
    }

    const overallScore = this.calculateOverallScore(qualityMetrics);
    const recommendations = this.generateRecommendations(issues, qualityMetrics);

    return {
      isValid: overallScore >= 60,
      score: overallScore,
      issues,
      recommendations,
      qualityMetrics
    };
  }
}

/**
 * Validation rules configuration
 */
class ValidationRules {
  public imageQuality = {
    minSize: 50000, // 50KB
    maxSize: 10000000, // 10MB
    allowedFormats: ['jpeg', 'jpg', 'png'],
    minResolution: 640 * 480
  };

  public requiredFields = [
    'labels.animalType',
    'labels.breed',
    'labels.age',
    'labels.gender',
    'physicalAttributes.bodyColor',
    'metadata.captureDate'
  ];

  public optionalFields = [
    'physicalAttributes.hornType',
    'physicalAttributes.bodySize',
    'physicalAttributes.distinctiveFeatures',
    'metadata.location'
  ];
}

// Export singleton instance
export const trainingDataValidator = new TrainingDataValidator();