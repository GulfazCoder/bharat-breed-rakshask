#!/usr/bin/env node

// Extended AI classification tests with edge cases and performance validation

// Mock improved AI classification
const mockClassification = {
  async processVisionResponse(visionResponse) {
    const labels = visionResponse.responses[0].labelAnnotations || [];
    const objects = visionResponse.responses[0].localizedObjectAnnotations || [];
    
    console.log(`Processing ${labels.length} labels:`, labels.slice(0, 5).map(l => `${l.description} (${l.score})`));
    
    // Enhanced animal type detection with weighted scoring
    let cattleScore = 0;
    let buffaloScore = 0;
    let animalConfidence = 0;

    // Primary animal detection
    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      
      // High-confidence cattle indicators
      if (desc.includes('cattle') || desc.includes('cow') || desc.includes('bull')) {
        cattleScore += label.score * 2;
        animalConfidence += label.score;
      }
      
      // Dairy-specific indicators
      if (desc.includes('dairy') || desc.includes('milk')) {
        cattleScore += label.score * 1.5;
        animalConfidence += label.score * 0.8;
      }
      
      // Buffalo indicators
      if (desc.includes('buffalo') || desc.includes('water buffalo')) {
        buffaloScore += label.score * 2;
        animalConfidence += label.score;
      }
      
      // Generic livestock
      if (desc.includes('livestock') || desc.includes('farm animal')) {
        animalConfidence += label.score * 0.3;
      }
      
      // Reject non-livestock
      if (desc.includes('dog') || desc.includes('cat') || desc.includes('horse') || 
          desc.includes('sheep') || desc.includes('goat')) {
        return { 
          animal_type: { prediction: 'unknown', confidence: 0.2, confidence_level: 'low' },
          breed: { prediction: 'Not livestock', confidence: 0.1, confidence_level: 'low' }
        };
      }
    });

    // Object detection bonus
    objects.forEach(obj => {
      const name = obj.name.toLowerCase();
      if (name.includes('cattle') || name.includes('cow')) {
        cattleScore += obj.score * 3;
        animalConfidence += obj.score;
      }
      if (name.includes('buffalo')) {
        buffaloScore += obj.score * 3;
        animalConfidence += obj.score;
      }
    });

    const animalType = cattleScore > buffaloScore ? 'cattle' : 'buffalo';
    const finalAnimalConfidence = Math.min(animalConfidence * 0.9, 0.95);

    // If confidence is too low, reject
    if (finalAnimalConfidence < 0.4) {
      return {
        animal_type: { prediction: 'unknown', confidence: finalAnimalConfidence, confidence_level: 'low' },
        breed: { prediction: 'Unrecognized', confidence: 0.1, confidence_level: 'low', top_3: [] },
        processing_time: 0.3
      };
    }

    // Enhanced breed detection
    const breedDatabase = {
      cattle: {
        'gir': { keywords: ['gir', 'reddish', 'white patches', 'drooping ears'], baseScore: 0.6 },
        'holstein': { keywords: ['holstein', 'friesian', 'black and white', 'spotted', 'dairy'], baseScore: 0.7 },
        'jersey': { keywords: ['jersey', 'brown', 'fawn', 'small size', 'light brown'], baseScore: 0.65 },
        'sahiwal': { keywords: ['sahiwal', 'red sindhi', 'reddish brown'], baseScore: 0.6 },
        'tharparkar': { keywords: ['tharparkar', 'white', 'grey', 'medium size'], baseScore: 0.6 }
      },
      buffalo: {
        'murrah': { keywords: ['murrah', 'jet black', 'curved horns', 'compact'], baseScore: 0.7 },
        'nili_ravi': { keywords: ['nili ravi', 'nili-ravi', 'wall eyes', 'large size'], baseScore: 0.65 },
        'surti': { keywords: ['surti', 'compact', 'good milker'], baseScore: 0.6 },
        'jaffarabadi': { keywords: ['jaffarabadi', 'heavy', 'large'], baseScore: 0.6 }
      }
    };

    const breeds = breedDatabase[animalType];
    const breedScores = {};

    // Score each breed
    Object.entries(breeds).forEach(([breedKey, breedData]) => {
      let score = breedData.baseScore;
      
      labels.forEach(label => {
        const desc = label.description.toLowerCase();
        breedData.keywords.forEach(keyword => {
          if (desc.includes(keyword)) {
            score += label.score * 0.8;
          }
        });
      });
      
      breedScores[breedKey] = score;
    });

    // Get top breed
    const sortedBreeds = Object.entries(breedScores)
      .sort(([,a], [,b]) => b - a)
      .map(([breed, score]) => ({ breed: breed.replace('_', ' '), score }));

    const topBreed = sortedBreeds[0];
    const breedConfidence = Math.min(topBreed.score, 0.9);

    // Capitalize breed name
    const formatBreedName = (name) => {
      return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return {
      animal_type: {
        prediction: animalType,
        confidence: finalAnimalConfidence,
        confidence_level: finalAnimalConfidence > 0.7 ? 'high' : finalAnimalConfidence > 0.5 ? 'medium' : 'low'
      },
      breed: {
        prediction: formatBreedName(topBreed.breed),
        confidence: breedConfidence,
        confidence_level: breedConfidence > 0.7 ? 'high' : breedConfidence > 0.5 ? 'medium' : 'low',
        top_3: sortedBreeds.slice(0, 3).map(b => ({ 
          breed: formatBreedName(b.breed), 
          score: Math.min(b.score, 0.9) 
        })),
        needs_verification: breedConfidence < 0.75
      },
      age: { prediction: 'adult', confidence: 0.6, confidence_level: 'medium' },
      gender: { prediction: 'female', confidence: 0.5, confidence_level: 'low' },
      health: { prediction: 'healthy', confidence: 0.8, confidence_level: 'high' },
      processing_time: Math.random() * 0.5 + 0.2 // 0.2-0.7 seconds
    };
  }
};

// Extended test cases including edge cases
const extendedTestCases = [
  // Basic cattle tests
  {
    description: "Gir cattle with typical red and white coloration",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Gir',
    mockLabels: [
      { description: 'cattle', score: 0.95 },
      { description: 'gir', score: 0.85 },
      { description: 'reddish', score: 0.80 },
      { description: 'white patches', score: 0.75 },
      { description: 'drooping ears', score: 0.70 },
      { description: 'livestock', score: 0.85 }
    ]
  },
  
  // Holstein with strong indicators
  {
    description: "Holstein Friesian with clear black and white pattern",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Holstein',
    mockLabels: [
      { description: 'cattle', score: 0.98 },
      { description: 'holstein', score: 0.90 },
      { description: 'friesian', score: 0.85 },
      { description: 'black and white', score: 0.95 },
      { description: 'dairy cow', score: 0.92 },
      { description: 'large size', score: 0.80 },
      { description: 'spotted', score: 0.88 }
    ]
  },

  // Jersey cattle
  {
    description: "Jersey cattle with characteristic brown coloration",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Jersey',
    mockLabels: [
      { description: 'cattle', score: 0.92 },
      { description: 'jersey', score: 0.88 },
      { description: 'brown', score: 0.85 },
      { description: 'fawn', score: 0.78 },
      { description: 'small size', score: 0.75 },
      { description: 'light brown', score: 0.72 }
    ]
  },

  // Buffalo tests
  {
    description: "Murrah buffalo with jet black coloration",
    expectedAnimalType: 'buffalo',
    expectedBreed: 'Murrah',
    mockLabels: [
      { description: 'buffalo', score: 0.96 },
      { description: 'murrah', score: 0.88 },
      { description: 'jet black', score: 0.90 },
      { description: 'curved horns', score: 0.82 },
      { description: 'water buffalo', score: 0.85 },
      { description: 'compact', score: 0.75 }
    ]
  },

  // Edge case: Generic cattle without specific breed indicators
  {
    description: "Generic cattle without clear breed characteristics",
    expectedAnimalType: 'cattle',
    mockLabels: [
      { description: 'cattle', score: 0.85 },
      { description: 'cow', score: 0.80 },
      { description: 'livestock', score: 0.75 },
      { description: 'farm animal', score: 0.70 },
      { description: 'grazing', score: 0.65 }
    ]
  },

  // Edge case: Low confidence animal detection
  {
    description: "Low quality image with poor animal detection",
    expectedAnimalType: 'cattle', // This should likely fail
    mockLabels: [
      { description: 'animal', score: 0.45 },
      { description: 'mammal', score: 0.40 },
      { description: 'outdoor', score: 0.60 },
      { description: 'field', score: 0.55 }
    ]
  },

  // Edge case: Non-livestock animal (should be rejected)
  {
    description: "Dog detected (should be rejected as non-livestock)",
    expectedAnimalType: 'unknown',
    mockLabels: [
      { description: 'dog', score: 0.95 },
      { description: 'pet', score: 0.90 },
      { description: 'canine', score: 0.85 },
      { description: 'domestic animal', score: 0.80 }
    ]
  },

  // Performance test: Large number of labels
  {
    description: "Performance test with many labels",
    expectedAnimalType: 'cattle',
    expectedBreed: 'Holstein',
    mockLabels: Array.from({ length: 50 }, (_, i) => {
      const labels = ['cattle', 'holstein', 'black and white', 'dairy', 'cow', 'livestock', 
                      'farm animal', 'large', 'spotted', 'bovine', 'domestic', 'grazing'];
      return {
        description: i < labels.length ? labels[i] : `generic_label_${i}`,
        score: Math.random() * 0.5 + 0.5
      };
    })
  }
];

function createMockVisionResponse(labels) {
  return {
    responses: [{
      labelAnnotations: labels.map(label => ({
        description: label.description,
        score: label.score,
        confidence: label.score
      })),
      localizedObjectAnnotations: labels
        .filter(l => ['cattle', 'cow', 'buffalo', 'bovine'].some(keyword => 
          l.description.toLowerCase().includes(keyword)))
        .map(label => ({
          name: label.description,
          score: label.score,
          boundingPoly: {
            normalizedVertices: [
              { x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 },
              { x: 0.9, y: 0.9 }, { x: 0.1, y: 0.9 }
            ]
          }
        })),
      imagePropertiesAnnotation: {
        dominantColors: {
          colors: [
            { color: { red: 139, green: 69, blue: 19 }, score: 0.6 },
            { color: { red: 255, green: 255, blue: 255 }, score: 0.3 },
            { color: { red: 0, green: 0, blue: 0 }, score: 0.1 }
          ]
        }
      }
    }]
  };
}

function validateResult(result, testCase) {
  const issues = [];
  const suggestions = [];
  let confidence = 1.0;

  // Check animal type prediction
  if (result.animal_type?.prediction !== testCase.expectedAnimalType) {
    issues.push(`Expected animal type ${testCase.expectedAnimalType}, got ${result.animal_type?.prediction}`);
    confidence -= 0.4;
  }

  // Check animal confidence levels
  if (result.animal_type?.confidence < 0.5) {
    issues.push('Animal detection confidence too low');
    suggestions.push('Improve animal detection accuracy');
    confidence -= 0.2;
  }

  // Check breed prediction if expected
  if (testCase.expectedBreed && result.breed?.prediction) {
    const predictedBreed = result.breed.prediction.toLowerCase();
    const expectedBreed = testCase.expectedBreed.toLowerCase();
    
    if (!predictedBreed.includes(expectedBreed) && !expectedBreed.includes(predictedBreed)) {
      issues.push(`Expected breed ${testCase.expectedBreed}, got ${result.breed.prediction}`);
      confidence -= 0.3;
      
      // Check if it's in top 3
      const inTop3 = result.breed.top_3?.some(breed => 
        breed.breed.toLowerCase().includes(expectedBreed) ||
        expectedBreed.includes(breed.breed.toLowerCase())
      );
      
      if (inTop3) {
        suggestions.push('Correct breed found in top 3 - adjust scoring');
      } else {
        suggestions.push('Expected breed not in top predictions');
      }
    }
  }

  // Check processing time
  if (result.processing_time > 5) {
    issues.push('Processing time too long');
    suggestions.push('Optimize processing speed');
    confidence -= 0.1;
  }

  // Check for reasonable confidence levels
  if (result.breed?.confidence > 0.95) {
    issues.push('Breed confidence unrealistically high');
    suggestions.push('Adjust confidence scoring to be more realistic');
    confidence -= 0.05;
  }

  return {
    isValid: issues.length === 0,
    confidence: Math.max(confidence, 0),
    issues,
    suggestions
  };
}

async function runExtendedTests() {
  console.log('🚀 Starting Extended AI Classification Tests...\n');
  
  let passed = 0;
  let failed = 0;
  let totalProcessingTime = 0;
  
  console.log('📋 DETAILED TEST RESULTS');
  console.log('='.repeat(60));
  
  for (let i = 0; i < extendedTestCases.length; i++) {
    const testCase = extendedTestCases[i];
    
    try {
      const startTime = Date.now();
      
      // Create mock vision response
      const mockVisionResponse = createMockVisionResponse(testCase.mockLabels);
      
      // Process with enhanced mock classification
      const result = await mockClassification.processVisionResponse(mockVisionResponse);
      
      const testTime = Date.now() - startTime;
      totalProcessingTime += testTime;
      
      // Validate result
      const validation = validateResult(result, testCase);
      
      const status = validation.isValid ? '✅ PASS' : '❌ FAIL';
      console.log(`${i + 1}. ${status} - ${testCase.description}`);
      
      // Show results
      if (result.animal_type) {
        console.log(`   Animal: ${result.animal_type.prediction || 'N/A'} (${(result.animal_type.confidence * 100).toFixed(1)}% ${result.animal_type.confidence_level})`);
      }
      
      if (result.breed) {
        console.log(`   Breed: ${result.breed.prediction || 'N/A'} (${(result.breed.confidence * 100).toFixed(1)}% ${result.breed.confidence_level})`);
        
        if (result.breed.top_3?.length) {
          const top3Display = result.breed.top_3.map(b => 
            `${b.breed} (${(b.score * 100).toFixed(1)}%)`
          ).join(', ');
          console.log(`   Top 3: ${top3Display}`);
        }
        
        if (result.breed.needs_verification) {
          console.log(`   ⚠️  Needs verification`);
        }
      }
      
      console.log(`   Processing: ${result.processing_time?.toFixed(2)}s (Test: ${testTime}ms)`);
      
      if (validation.issues.length > 0) {
        console.log(`   ❌ Issues: ${validation.issues.join(', ')}`);
      }
      
      if (validation.suggestions.length > 0) {
        console.log(`   💡 Suggestions: ${validation.suggestions.join(', ')}`);
      }
      
      if (validation.isValid) {
        passed++;
      } else {
        failed++;
      }
      
    } catch (error) {
      console.log(`${i + 1}. ❌ ERROR - ${testCase.description}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
    
    console.log();
  }
  
  // Summary and analytics
  const total = passed + failed;
  const successRate = (passed / total) * 100;
  const avgProcessingTime = totalProcessingTime / total;
  
  console.log('📊 COMPREHENSIVE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Overall Success Rate: ${successRate.toFixed(1)}% (${passed}/${total})`);
  console.log(`Tests Failed: ${failed}`);
  console.log(`Average Processing Time: ${avgProcessingTime.toFixed(0)}ms per test`);
  console.log(`Total Test Duration: ${(totalProcessingTime / 1000).toFixed(2)}s`);
  
  // Performance analysis
  console.log('\n⚡ PERFORMANCE ANALYSIS');
  console.log('='.repeat(60));
  if (avgProcessingTime < 100) {
    console.log('✅ Excellent performance - Average processing < 100ms');
  } else if (avgProcessingTime < 500) {
    console.log('✅ Good performance - Average processing < 500ms');
  } else {
    console.log('⚠️  Performance could be improved - Average processing > 500ms');
  }
  
  // Quality analysis
  console.log('\n🎯 QUALITY ANALYSIS');
  console.log('='.repeat(60));
  if (successRate >= 90) {
    console.log('✅ Excellent classification accuracy');
  } else if (successRate >= 75) {
    console.log('✅ Good classification accuracy');
  } else if (successRate >= 50) {
    console.log('⚠️  Moderate classification accuracy - needs improvement');
  } else {
    console.log('❌ Poor classification accuracy - major improvements needed');
  }
  
  if (failed > 0) {
    console.log('\n💡 IMPROVEMENT RECOMMENDATIONS');
    console.log('='.repeat(60));
    console.log('1. Review failed test cases for common patterns');
    console.log('2. Enhance breed detection algorithms');
    console.log('3. Improve confidence scoring accuracy');
    console.log('4. Add more training data for edge cases');
    console.log('5. Optimize processing speed for large datasets');
  }
  
  console.log('\n✅ Extended validation tests completed!');
  return { passed, failed, successRate, avgProcessingTime };
}

// Run the extended tests
runExtendedTests().catch(console.error);