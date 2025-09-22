#!/usr/bin/env node

// Simple test runner for AI classification validation
const fs = require('fs');
const path = require('path');

// Mock the AI classification for testing
const mockClassification = {
  async processVisionResponse(visionResponse) {
    // Extract data from mock response
    const labels = visionResponse.responses[0].labelAnnotations || [];
    const objects = visionResponse.responses[0].localizedObjectAnnotations || [];
    const colors = visionResponse.responses[0].imagePropertiesAnnotation?.dominantColors?.colors || [];

    console.log('Processing labels:', labels.map(l => `${l.description} (${l.score})`));
    
    // Simple animal type detection
    let cattleScore = 0;
    let buffaloScore = 0;
    
    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      if (desc.includes('cattle') || desc.includes('cow') || desc.includes('bull')) {
        cattleScore += label.score;
      }
      if (desc.includes('buffalo')) {
        buffaloScore += label.score;
      }
    });

    objects.forEach(obj => {
      const name = obj.name.toLowerCase();
      if (name.includes('cattle') || name.includes('cow') || name.includes('bull')) {
        cattleScore += obj.score * 2;
      }
      if (name.includes('buffalo')) {
        buffaloScore += obj.score * 2;
      }
    });

    const animalType = cattleScore > buffaloScore ? 'cattle' : 'buffalo';
    const animalConfidence = Math.min((cattleScore + buffaloScore) * 0.8, 0.95);

    // Simple breed detection
    const breeds = animalType === 'cattle' 
      ? ['Gir', 'Holstein', 'Jersey', 'Sahiwal', 'Tharparkar']
      : ['Murrah', 'Nili Ravi', 'Surti', 'Jaffarabadi'];

    // Check for breed-specific keywords
    let detectedBreed = breeds[0]; // default
    let breedConfidence = 0.5;

    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      
      // Check for specific breed mentions
      if (desc.includes('gir')) {
        detectedBreed = 'Gir';
        breedConfidence = Math.max(breedConfidence, label.score * 0.9);
      }
      if (desc.includes('holstein') || desc.includes('friesian')) {
        detectedBreed = 'Holstein';
        breedConfidence = Math.max(breedConfidence, label.score * 0.9);
      }
      if (desc.includes('jersey')) {
        detectedBreed = 'Jersey';
        breedConfidence = Math.max(breedConfidence, label.score * 0.9);
      }
      if (desc.includes('murrah')) {
        detectedBreed = 'Murrah';
        breedConfidence = Math.max(breedConfidence, label.score * 0.9);
      }
      
      // Color-based detection
      if (animalType === 'cattle') {
        if (desc.includes('reddish') || desc.includes('red')) {
          if (desc.includes('white')) {
            detectedBreed = 'Gir';
            breedConfidence = Math.max(breedConfidence, label.score * 0.7);
          }
        }
        if (desc.includes('black') && desc.includes('white')) {
          detectedBreed = 'Holstein';
          breedConfidence = Math.max(breedConfidence, label.score * 0.8);
        }
        if (desc.includes('brown') || desc.includes('fawn')) {
          detectedBreed = 'Jersey';
          breedConfidence = Math.max(breedConfidence, label.score * 0.7);
        }
      }
    });

    // Generate top 3
    const otherBreeds = breeds.filter(b => b !== detectedBreed);
    const top3 = [
      { breed: detectedBreed, score: breedConfidence },
      { breed: otherBreeds[0], score: breedConfidence - 0.15 },
      { breed: otherBreeds[1], score: breedConfidence - 0.25 }
    ];

    return {
      animal_type: {
        prediction: animalType,
        confidence: animalConfidence,
        confidence_level: animalConfidence > 0.7 ? 'high' : animalConfidence > 0.5 ? 'medium' : 'low'
      },
      breed: {
        prediction: detectedBreed,
        confidence: breedConfidence,
        confidence_level: breedConfidence > 0.7 ? 'high' : breedConfidence > 0.5 ? 'medium' : 'low',
        top_3: top3,
        needs_verification: breedConfidence < 0.75
      },
      age: {
        prediction: 'adult',
        confidence: 0.6,
        confidence_level: 'medium'
      },
      gender: {
        prediction: 'female',
        confidence: 0.5,
        confidence_level: 'low'
      },
      health: {
        prediction: 'healthy',
        confidence: 0.8,
        confidence_level: 'high'
      },
      processing_time: 0.5
    };
  }
};

// Test cases
const testCases = [
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
        .filter(l => ['cattle', 'cow', 'buffalo', 'bovine'].includes(l.description.toLowerCase()))
        .map(label => ({
          name: label.description,
          score: label.score,
          boundingPoly: {
            normalizedVertices: [
              { x: 0.1, y: 0.1 },
              { x: 0.9, y: 0.1 },
              { x: 0.9, y: 0.9 },
              { x: 0.1, y: 0.9 }
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
      },
      textAnnotations: []
    }]
  };
}

function validateResult(result, testCase) {
  const issues = [];
  const suggestions = [];
  let confidence = 1.0;

  // Check animal type
  if (result.animal_type.prediction !== testCase.expectedAnimalType) {
    issues.push(`Expected ${testCase.expectedAnimalType}, got ${result.animal_type.prediction}`);
    confidence -= 0.5;
  }

  // Check breed if expected
  if (testCase.expectedBreed) {
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
        suggestions.push('Correct breed found in top 3 - consider adjusting scoring algorithm');
      } else {
        suggestions.push('Expected breed not in top 3 - review breed detection logic');
      }
    }
  }

  return {
    isValid: issues.length === 0,
    confidence: Math.max(confidence, 0),
    issues,
    suggestions
  };
}

async function runTests() {
  console.log('🚀 Starting AI Classification Validation Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  console.log('📋 TEST RESULTS');
  console.log('='.repeat(50));
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    
    try {
      // Create mock vision response
      const mockVisionResponse = createMockVisionResponse(testCase.mockLabels);
      
      // Process with mock classification
      const result = await mockClassification.processVisionResponse(mockVisionResponse);
      
      // Validate result
      const validation = validateResult(result, testCase);
      
      const status = validation.isValid ? '✅ PASS' : '❌ FAIL';
      console.log(`${i + 1}. ${status} - ${testCase.description}`);
      
      console.log(`   Animal: ${result.animal_type?.prediction || 'N/A'} (${(result.animal_type?.confidence * 100).toFixed(1)}%)`);
      console.log(`   Breed: ${result.breed?.prediction || 'N/A'} (${(result.breed?.confidence * 100).toFixed(1)}%)`);
      
      if (result.breed?.top_3?.length) {
        console.log(`   Top 3: ${result.breed.top_3.map(b => `${b.breed} (${(b.score * 100).toFixed(1)}%)`).join(', ')}`);
      }
      
      if (validation.issues.length > 0) {
        console.log(`   Issues: ${validation.issues.join(', ')}`);
      }
      
      if (validation.suggestions.length > 0) {
        console.log(`   Suggestions: ${validation.suggestions.join(', ')}`);
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
  
  const total = passed + failed;
  const successRate = (passed / total) * 100;
  
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Success Rate: ${successRate.toFixed(1)}% (${passed}/${total} tests passed)`);
  console.log(`Failed: ${failed}`);
  
  if (successRate < 100) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('='.repeat(50));
    console.log('1. Review breed detection algorithms for failed test cases');
    console.log('2. Enhance keyword matching for breed characteristics');
    console.log('3. Improve confidence scoring accuracy');
    console.log('4. Add more specific breed detection patterns');
  }
  
  console.log('\n✅ Test validation completed!');
}

// Run the tests
runTests().catch(console.error);