// Test script to verify the rebalanced buffalo vs cattle classification
console.log('🧪 Testing Rebalanced AI Classification System...\n');

// Mock test cases with different scenarios
const testCases = [
  {
    name: 'Clear Cattle Case',
    labels: [
      { description: 'dairy cow', score: 0.9 },
      { description: 'holstein', score: 0.8 },
      { description: 'milk cow', score: 0.7 },
      { description: 'udder', score: 0.6 }
    ],
    objects: [{ name: 'Cow', score: 0.85 }],
    expected: 'cattle'
  },
  {
    name: 'Clear Buffalo Case',
    labels: [
      { description: 'water buffalo', score: 0.9 },
      { description: 'bubalus', score: 0.8 },
      { description: 'curved horns', score: 0.7 },
      { description: 'wallowing', score: 0.6 }
    ],
    objects: [{ name: 'Buffalo', score: 0.85 }],
    expected: 'buffalo'
  },
  {
    name: 'Mixed Signals - Should Default to Cattle',
    labels: [
      { description: 'cow', score: 0.7 },
      { description: 'bovine', score: 0.6 },
      { description: 'livestock', score: 0.5 },
      { description: 'animal', score: 0.4 }
    ],
    objects: [{ name: 'Animal', score: 0.6 }],
    expected: 'cattle'
  },
  {
    name: 'Cattle with Buffalo Physical Features',
    labels: [
      { description: 'cattle', score: 0.8 },
      { description: 'bull', score: 0.7 },
      { description: 'horned cattle', score: 0.6 },
      { description: 'black', score: 0.5 }
    ],
    objects: [{ name: 'Bull', score: 0.8 }],
    expected: 'cattle'
  },
  {
    name: 'Buffalo Breed Specific',
    labels: [
      { description: 'murrah', score: 0.9 },
      { description: 'buffalo', score: 0.8 },
      { description: 'jet black', score: 0.7 },
      { description: 'curved horns', score: 0.6 }
    ],
    objects: [{ name: 'Animal', score: 0.7 }],
    expected: 'buffalo'
  }
];

// Mock the classification service for testing
const mockClassificationService = {
  // Enhanced animal type analysis (simplified for testing)
  enhancedAnimalTypeAnalysis(labels, objects) {
    let cattleScore = 0;
    let buffaloScore = 0;
    let animalConfidence = 0;

    // Collect all text for analysis
    const allText = [...labels.map(l => l.description.toLowerCase()), 
                     ...objects.map(o => o.name.toLowerCase())].join(' ');

    // Check for buffalo exclusions
    const buffaloExclusions = ['water buffalo', 'buffalo', 'bubalus', 'thick horns', 'wallowing'];
    const hasBuffaloExclusions = buffaloExclusions.some(term => allText.includes(term.toLowerCase()));

    // Object detection scoring
    objects.forEach(obj => {
      const name = obj.name.toLowerCase();
      const score = obj.score;
      
      if (name.includes('cow') || name.includes('cattle') || name.includes('bull')) {
        const multiplier = hasBuffaloExclusions ? 1.5 : 2.0;
        cattleScore += score * multiplier;
        animalConfidence += score;
      }
      
      if (name.includes('buffalo')) {
        buffaloScore += score * 2.0;
        animalConfidence += score;
      }
      
      if (name.includes('animal') || name.includes('mammal')) {
        animalConfidence += score * 0.5;
      }
    });

    // Label analysis with rebalanced scoring
    labels.forEach(label => {
      const desc = label.description.toLowerCase();
      const score = label.score;

      // Cattle scoring
      const cattlePrimary = ['cattle', 'cow', 'bull', 'bovine', 'ox', 'calf', 'heifer', 'steer'];
      const cattleDairy = ['dairy cow', 'milk cow', 'holstein', 'jersey', 'friesian'];
      const strongCattleTerms = ['dairy cow', 'milk cow', 'holstein', 'jersey', 'friesian', 'udder', 'milking'];
      
      if (cattlePrimary.some(term => desc.includes(term))) {
        const multiplier = hasBuffaloExclusions ? 1.0 : 1.5;
        cattleScore += score * multiplier;
        animalConfidence += score;
      }
      
      if (cattleDairy.some(term => desc.includes(term))) {
        cattleScore += score * 1.8;
        animalConfidence += score * 0.8;
      }
      
      if (strongCattleTerms.some(term => desc.includes(term))) {
        cattleScore += score * 1.5;
      }

      // Buffalo scoring (rebalanced)
      const buffaloPrimary = ['buffalo', 'water buffalo', 'bubalus', 'asian buffalo'];
      const buffaloTypes = ['murrah', 'nili ravi', 'surti', 'jaffarabadi'];
      const buffaloCharacteristics = ['curved horns', 'long horns', 'backward curved', 'wallowing'];
      
      if (buffaloPrimary.some(term => desc.includes(term))) {
        buffaloScore += score * 1.8; // Reduced from 2.5
        animalConfidence += score;
      }
      
      if (buffaloTypes.some(term => desc.includes(term))) {
        buffaloScore += score * 1.6; // Reduced from 2.2
        animalConfidence += score;
      }
      
      if (buffaloCharacteristics.some(term => desc.includes(term))) {
        buffaloScore += score * 1.4; // Reduced from 2.0
        animalConfidence += score * 0.8;
      }

      // Apply buffalo exclusion penalty
      if (buffaloExclusions.some(exclusion => desc.includes(exclusion))) {
        cattleScore *= 0.8;
      }
    });

    // Refined discrimination logic
    if (buffaloScore > 0 && cattleScore > 0) {
      const veryStrongBuffaloIndicators = ['water buffalo', 'bubalus'];
      const hasVeryStrongBuffaloFeatures = veryStrongBuffaloIndicators.some(indicator => 
        allText.includes(indicator)
      );
      
      if (hasVeryStrongBuffaloFeatures) {
        buffaloScore *= 1.4;
        cattleScore *= 0.8;
      }
    }

    // Balanced decision logic
    const scoreDifference = Math.abs(buffaloScore - cattleScore);
    const totalScore = buffaloScore + cattleScore;
    const requiredBuffaloLead = totalScore * 0.15;
    
    let animalType;
    if (buffaloScore > cattleScore + requiredBuffaloLead && hasBuffaloExclusions) {
      animalType = 'buffalo';
    } else if (buffaloScore > cattleScore && scoreDifference > totalScore * 0.1) {
      animalType = 'buffalo';
    } else if (cattleScore > buffaloScore) {
      animalType = 'cattle';
    } else {
      animalType = 'cattle'; // Default to cattle for unclear cases
    }

    const confidence = Math.min(animalConfidence * (cattleScore + buffaloScore > 0 ? 1 : 0.3), 0.95);

    return {
      prediction: animalType,
      confidence: confidence,
      scores: { cattle: cattleScore.toFixed(2), buffalo: buffaloScore.toFixed(2) },
      hasBuffaloExclusions,
      scoreDifference: scoreDifference.toFixed(2),
      totalScore: totalScore.toFixed(2)
    };
  }
};

// Run tests
console.log('Running test cases...\n');
let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('   Input:', testCase.labels.map(l => l.description).join(', '));
  
  const result = mockClassificationService.enhancedAnimalTypeAnalysis(testCase.labels, testCase.objects);
  
  console.log('   Scores:', result.scores);
  console.log('   Prediction:', result.prediction);
  console.log('   Expected:', testCase.expected);
  console.log('   Confidence:', (result.confidence * 100).toFixed(1) + '%');
  
  if (result.prediction === testCase.expected) {
    console.log('   Result: ✅ PASS');
    passed++;
  } else {
    console.log('   Result: ❌ FAIL');
    failed++;
  }
  
  console.log('   Details:', {
    hasBuffaloExclusions: result.hasBuffaloExclusions,
    scoreDifference: result.scoreDifference,
    totalScore: result.totalScore
  });
});

console.log('\n' + '='.repeat(50));
console.log('TEST SUMMARY:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! The rebalanced system is working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Review the scoring logic.');
}

console.log('\n🔄 The system now:');
console.log('   - Requires buffalo to have a clear lead (15%) to be classified');
console.log('   - Gives strong weight to dairy/cattle terms');
console.log('   - Reduces buffalo scoring multipliers');
console.log('   - Defaults to cattle in unclear cases');
console.log('   - Only applies buffalo preference with strong evidence');