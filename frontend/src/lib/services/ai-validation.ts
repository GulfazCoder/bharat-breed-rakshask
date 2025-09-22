// AI Classification validation and testing utilities

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export interface TestCase {
  description: string;
  expectedAnimalType: 'cattle' | 'buffalo';
  expectedBreed?: string;
  imageUrl?: string;
  mockLabels: Array<{
    description: string;
    score: number;
  }>;
}

// Test cases for validating AI classification
export const TEST_CASES: TestCase[] = [
  {
    description: "Gir cattle with typical characteristics",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Gir',
    mockLabels: [
      { description: 'cattle', score: 0.95 },
      { description: 'cow', score: 0.90 },
      { description: 'bovine', score: 0.85 },
      { description: 'reddish', score: 0.75 },
      { description: 'white patches', score: 0.70 },
      { description: 'curved horns', score: 0.65 },
      { description: 'large ears', score: 0.60 },
      { description: 'livestock', score: 0.80 },
      { description: 'farm animal', score: 0.85 }
    ]
  },
  {
    description: "Holstein Friesian dairy cattle",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Holstein',
    mockLabels: [
      { description: 'cattle', score: 0.98 },
      { description: 'dairy cow', score: 0.95 },
      { description: 'holstein', score: 0.85 },
      { description: 'black and white', score: 0.90 },
      { description: 'spotted', score: 0.80 },
      { description: 'large size', score: 0.75 },
      { description: 'milk cow', score: 0.85 },
      { description: 'livestock', score: 0.88 }
    ]
  },
  {
    description: "Murrah buffalo",
    expectedAnimalType: 'buffalo',
    expectedBreed: 'Murrah',
    mockLabels: [
      { description: 'buffalo', score: 0.95 },
      { description: 'water buffalo', score: 0.90 },
      { description: 'murrah', score: 0.80 },
      { description: 'black', score: 0.85 },
      { description: 'curved horns', score: 0.75 },
      { description: 'large mammal', score: 0.70 },
      { description: 'domestic buffalo', score: 0.82 },
      { description: 'livestock', score: 0.78 }
    ]
  },
  {
    description: "Jersey cattle",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Jersey',
    mockLabels: [
      { description: 'cattle', score: 0.92 },
      { description: 'jersey', score: 0.85 },
      { description: 'brown', score: 0.80 },
      { description: 'small size', score: 0.75 },
      { description: 'fawn', score: 0.70 },
      { description: 'dairy', score: 0.78 },
      { description: 'cow', score: 0.90 }
    ]
  },
  {
    description: "Generic cattle without breed specifics",
    expectedAnimalType: 'cattle',
    mockLabels: [
      { description: 'cattle', score: 0.90 },
      { description: 'cow', score: 0.85 },
      { description: 'livestock', score: 0.80 },
      { description: 'farm animal', score: 0.75 },
      { description: 'grazing', score: 0.70 },
      { description: 'mammal', score: 0.88 }
    ]
  },
  {
    description: "Non-livestock animal (should be rejected)",
    expectedAnimalType: 'cattle', // This should fail
    mockLabels: [
      { description: 'dog', score: 0.95 },
      { description: 'pet', score: 0.90 },
      { description: 'canine', score: 0.85 },
      { description: 'domestic animal', score: 0.80 }
    ]
  }
];

/**
 * Validate classification results against expected outcomes
 */
export function validateClassification(
  result: any,
  testCase: TestCase
): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let confidence = 1.0;

  // Check animal type prediction
  if (result.animal_type.prediction !== testCase.expectedAnimalType) {
    issues.push(`Expected ${testCase.expectedAnimalType}, got ${result.animal_type.prediction}`);
    confidence -= 0.5;
  }

  // Check confidence levels
  if (result.animal_type.confidence < 0.4) {
    issues.push('Animal type confidence too low');
    suggestions.push('Improve animal detection algorithms');
    confidence -= 0.2;
  }

  // Check breed prediction if expected
  if (testCase.expectedBreed) {
    const predictedBreed = result.breed.prediction.toLowerCase();
    const expectedBreed = testCase.expectedBreed.toLowerCase();
    
    if (!predictedBreed.includes(expectedBreed) && !expectedBreed.includes(predictedBreed)) {
      issues.push(`Expected breed ${testCase.expectedBreed}, got ${result.breed.prediction}`);
      confidence -= 0.3;
      
      // Check if it's in top 3
      const inTop3 = result.breed.top_3?.some((breed: any) => 
        breed.breed.toLowerCase().includes(expectedBreed) ||
        expectedBreed.includes(breed.breed.toLowerCase())
      );
      
      if (inTop3) {
        suggestions.push('Correct breed found in top 3 - consider adjusting scoring algorithm');
      } else {
        suggestions.push('Expected breed not in top 3 - review breed detection logic');
      }
    }
  }

  // Check for reasonable processing time
  if (result.processing_time > 10) {
    issues.push('Processing time too long');
    suggestions.push('Optimize API calls and processing');
    confidence -= 0.1;
  }

  // Validate confidence levels are reasonable
  if (result.breed.confidence > 0.95 && !testCase.expectedBreed) {
    issues.push('Confidence too high for generic classification');
    suggestions.push('Adjust confidence scoring to be more realistic');
    confidence -= 0.1;
  }

  return {
    isValid: issues.length === 0,
    confidence: Math.max(confidence, 0),
    issues,
    suggestions
  };
}

/**
 * Run all test cases and generate validation report
 */
export async function runValidationSuite(
  classificationFunction: (labels: any[]) => Promise<any>
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    testCase: TestCase;
    result: any;
    validation: ValidationResult;
  }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    try {
      // Mock the classification with test labels
      const result = await classificationFunction(testCase.mockLabels);
      const validation = validateClassification(result, testCase);
      
      results.push({
        testCase,
        result,
        validation
      });

      if (validation.isValid) {
        passed++;
      } else {
        failed++;
      }

    } catch (error) {
      failed++;
      results.push({
        testCase,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        validation: {
          isValid: false,
          confidence: 0,
          issues: ['Classification function threw an error'],
          suggestions: ['Fix the error in classification logic']
        }
      });
    }
  }

  return { passed, failed, results };
}

/**
 * Generate improvement recommendations based on validation results
 */
export function generateImprovementReport(validationResults: any): {
  summary: string;
  recommendations: string[];
  criticalIssues: string[];
} {
  const { passed, failed, results } = validationResults;
  const totalTests = passed + failed;
  const successRate = (passed / totalTests) * 100;

  const allIssues = results.flatMap((r: any) => r.validation.issues);
  const allSuggestions = results.flatMap((r: any) => r.validation.suggestions);
  
  // Count common issues
  const issueCount: { [key: string]: number } = {};
  allIssues.forEach(issue => {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  });

  // Identify critical issues (appearing in multiple tests)
  const criticalIssues = Object.entries(issueCount)
    .filter(([issue, count]) => count > 1)
    .map(([issue]) => issue);

  // Generate unique recommendations
  const uniqueRecommendations = [...new Set(allSuggestions)];

  const summary = `
AI Classification Validation Report:
- Success Rate: ${successRate.toFixed(1)}% (${passed}/${totalTests} tests passed)
- Critical Issues: ${criticalIssues.length}
- Total Recommendations: ${uniqueRecommendations.length}
  `;

  return {
    summary: summary.trim(),
    recommendations: uniqueRecommendations,
    criticalIssues
  };
}

/**
 * Image quality assessment
 */
export function assessImageQuality(imageData: string): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Basic checks on image data
  if (!imageData || imageData.length < 1000) {
    issues.push('Image data too small or missing');
    suggestions.push('Ensure image is properly captured and encoded');
  }
  
  // Check if it's a valid data URL
  if (!imageData.startsWith('data:image/')) {
    issues.push('Invalid image format');
    suggestions.push('Use JPEG or PNG format for best results');
  }
  
  // Estimate image size from base64 length
  const estimatedSize = (imageData.length * 0.75) / 1024; // KB
  
  if (estimatedSize < 50) {
    issues.push('Image appears to be very small');
    suggestions.push('Use higher resolution images for better classification');
  } else if (estimatedSize > 5000) {
    issues.push('Image appears to be very large');
    suggestions.push('Compress image to improve processing speed');
  }

  // Quality assessment
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  
  if (issues.length === 0 && estimatedSize > 100 && estimatedSize < 2000) {
    quality = 'excellent';
  } else if (issues.length <= 1) {
    quality = 'good';
  } else if (issues.length <= 2) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  return { quality, issues, suggestions };
}

export default {
  validateClassification,
  runValidationSuite,
  generateImprovementReport,
  assessImageQuality,
  TEST_CASES
};