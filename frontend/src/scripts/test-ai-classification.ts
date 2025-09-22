#!/usr/bin/env node
// Test script for AI classification validation

import { aiClassification } from '../lib/services/ai-classification-test-adapter';
import { 
  runValidationSuite, 
  generateImprovementReport,
  TestCase,
  TEST_CASES
} from '../lib/services/ai-validation';

// Mock Vision API response structure for testing
function createMockVisionResponse(labels: Array<{ description: string; score: number }>) {
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

// Wrapper function to test with mock data
async function testClassificationWithMockData(mockLabels: Array<{ description: string; score: number }>) {
  const mockVisionResponse = createMockVisionResponse(mockLabels);
  
  try {
    // We need to mock the Vision API call
    const originalClassify = aiClassification.classifyImage;
    
    // Create a test version that uses mock data
    const testClassify = async (imageData: string) => {
      const startTime = Date.now();
      
      // Process the mock Vision API response
      const result = await aiClassification.processVisionResponse(mockVisionResponse);
      
      return {
        ...result,
        processing_time: (Date.now() - startTime) / 1000
      };
    };

    // Call with mock data
    return await testClassify('data:image/jpeg;base64,mock-data');
    
  } catch (error) {
    console.error('Classification error:', error);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting AI Classification Validation Tests...\n');
  
  try {
    // Run the validation suite
    const validationResults = await runValidationSuite(testClassificationWithMockData);
    
    // Generate and display report
    const report = generateImprovementReport(validationResults);
    
    console.log('📊 VALIDATION RESULTS');
    console.log('=' .repeat(50));
    console.log(report.summary);
    console.log();
    
    // Show detailed results
    console.log('📋 DETAILED TEST RESULTS');
    console.log('=' .repeat(50));
    
    validationResults.results.forEach((testResult, index) => {
      const { testCase, result, validation } = testResult;
      const status = validation.isValid ? '✅ PASS' : '❌ FAIL';
      
      console.log(`${index + 1}. ${status} - ${testCase.description}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      } else {
        console.log(`   Animal: ${result.animal_type?.prediction || 'N/A'} (${(result.animal_type?.confidence * 100).toFixed(1)}%)`);
        console.log(`   Breed: ${result.breed?.prediction || 'N/A'} (${(result.breed?.confidence * 100).toFixed(1)}%)`);
        
        if (result.breed?.top_3?.length) {
          console.log(`   Top 3: ${result.breed.top_3.map((b: any) => `${b.breed} (${(b.score * 100).toFixed(1)}%)`).join(', ')}`);
        }
      }
      
      if (validation.issues.length > 0) {
        console.log(`   Issues: ${validation.issues.join(', ')}`);
      }
      
      if (validation.suggestions.length > 0) {
        console.log(`   Suggestions: ${validation.suggestions.join(', ')}`);
      }
      
      console.log();
    });
    
    // Show critical issues and recommendations
    if (report.criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES');
      console.log('=' .repeat(50));
      report.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      console.log();
    }
    
    if (report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('=' .repeat(50));
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.log();
    }
    
    // Test individual breeds
    console.log('🔬 INDIVIDUAL BREED TESTS');
    console.log('=' .repeat(50));
    
    await testIndividualBreeds();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Test individual breeds with specific characteristics
async function testIndividualBreeds() {
  const breedTests = [
    {
      breed: 'Gir',
      labels: [
        { description: 'cattle', score: 0.95 },
        { description: 'reddish brown', score: 0.80 },
        { description: 'white patches', score: 0.75 },
        { description: 'drooping ears', score: 0.70 },
        { description: 'curved horns', score: 0.65 }
      ]
    },
    {
      breed: 'Holstein',
      labels: [
        { description: 'cattle', score: 0.98 },
        { description: 'black and white', score: 0.90 },
        { description: 'large size', score: 0.85 },
        { description: 'dairy cow', score: 0.80 }
      ]
    },
    {
      breed: 'Jersey',
      labels: [
        { description: 'cattle', score: 0.92 },
        { description: 'brown', score: 0.85 },
        { description: 'small size', score: 0.80 },
        { description: 'fawn colored', score: 0.75 }
      ]
    }
  ];

  for (const test of breedTests) {
    try {
      const result = await testClassificationWithMockData(test.labels);
      
      console.log(`${test.breed} Test:`);
      console.log(`  Predicted: ${result.breed?.prediction || 'None'}`);
      console.log(`  Confidence: ${(result.breed?.confidence * 100 || 0).toFixed(1)}%`);
      
      if (result.breed?.top_3) {
        const isCorrect = result.breed.top_3.some((b: any) => 
          b.breed.toLowerCase().includes(test.breed.toLowerCase())
        );
        console.log(`  Correct in top 3: ${isCorrect ? '✅' : '❌'}`);
        console.log(`  Top 3: ${result.breed.top_3.map((b: any) => `${b.breed} (${(b.score * 100).toFixed(1)}%)`).join(', ')}`);
      }
      
      console.log();
    } catch (error) {
      console.error(`  Error testing ${test.breed}:`, error);
    }
  }
}

// Performance benchmarking
async function runPerformanceTests() {
  console.log('⚡ PERFORMANCE TESTS');
  console.log('=' .repeat(50));
  
  const testSizes = [
    { name: 'Small dataset', labelCount: 5 },
    { name: 'Medium dataset', labelCount: 15 },
    { name: 'Large dataset', labelCount: 30 }
  ];
  
  for (const testSize of testSizes) {
    const mockLabels = Array.from({ length: testSize.labelCount }, (_, i) => ({
      description: `label_${i}`,
      score: Math.random() * 0.5 + 0.5
    }));
    
    const startTime = Date.now();
    
    try {
      await testClassificationWithMockData(mockLabels);
      const duration = Date.now() - startTime;
      
      console.log(`${testSize.name} (${testSize.labelCount} labels): ${duration}ms`);
    } catch (error) {
      console.error(`${testSize.name} failed:`, error);
    }
  }
  
  console.log();
}

// Run all tests
async function main() {
  await runTests();
  await runPerformanceTests();
  
  console.log('✅ All tests completed!');
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { runTests, testClassificationWithMockData, testIndividualBreeds };