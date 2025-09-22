const fs = require('fs');
const path = require('path');

// Sample training data for demonstration
const sampleTrainingData = [
  {
    id: 'sample_001',
    labels: {
      animalType: 'cattle',
      breed: 'Gir',
      age: 'adult',
      gender: 'female',
      healthCondition: 'good'
    },
    physicalAttributes: {
      bodyColor: ['red', 'white'],
      hornType: 'curved',
      bodySize: 'medium',
      bodyCondition: 'normal',
      distinctiveFeatures: ['dished face', 'pendulous ears']
    },
    breedSpecificTraits: {
      milkingCapability: 'high',
      humpPresence: true,
      facialFeatures: ['dished face'],
      earType: 'drooping',
      tailType: 'normal'
    },
    locationData: {
      region: 'Saurashtra',
      state: 'Gujarat',
      climate: 'subtropical',
      farmType: 'dairy'
    },
    expertValidation: {
      validatedBy: 'Dr. Rajesh Patel, Veterinary Expert',
      confidenceLevel: 'high',
      notes: 'Excellent example of Gir breed characteristics with typical dished face and pendulous ears.'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample_002',
    labels: {
      animalType: 'buffalo',
      breed: 'Murrah',
      age: 'adult',
      gender: 'female',
      healthCondition: 'excellent'
    },
    physicalAttributes: {
      bodyColor: ['black'],
      hornType: 'curved',
      bodySize: 'large',
      bodyCondition: 'well-fed',
      distinctiveFeatures: ['hump', 'dewlap']
    },
    breedSpecificTraits: {
      milkingCapability: 'very-high',
      humpPresence: false,
      facialFeatures: ['straight profile'],
      earType: 'normal',
      tailType: 'normal'
    },
    locationData: {
      region: 'Haryana',
      state: 'Haryana',
      climate: 'subtropical',
      farmType: 'dairy'
    },
    expertValidation: {
      validatedBy: 'Dr. Sunita Sharma, Animal Husbandry Expert',
      confidenceLevel: 'very-high',
      notes: 'Prime example of Murrah buffalo with excellent body condition and high milk production potential.'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample_003',
    labels: {
      animalType: 'cattle',
      breed: 'Sahiwal',
      age: 'young',
      gender: 'male',
      healthCondition: 'good'
    },
    physicalAttributes: {
      bodyColor: ['red', 'brown'],
      hornType: 'small',
      bodySize: 'medium',
      bodyCondition: 'normal',
      distinctiveFeatures: ['hump', 'dewlap']
    },
    breedSpecificTraits: {
      milkingCapability: 'high',
      humpPresence: true,
      facialFeatures: ['straight profile'],
      earType: 'drooping',
      tailType: 'normal'
    },
    locationData: {
      region: 'Punjab',
      state: 'Punjab',
      climate: 'subtropical',
      farmType: 'mixed'
    },
    expertValidation: {
      validatedBy: 'Prof. Amarjit Singh, Punjab Agricultural University',
      confidenceLevel: 'high',
      notes: 'Young Sahiwal bull showing good breed characteristics and growth potential.'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample_004',
    labels: {
      animalType: 'buffalo',
      breed: 'Surti',
      age: 'adult',
      gender: 'female',
      healthCondition: 'good'
    },
    physicalAttributes: {
      bodyColor: ['black', 'gray'],
      hornType: 'curved',
      bodySize: 'medium',
      bodyCondition: 'normal',
      distinctiveFeatures: ['facial markings']
    },
    breedSpecificTraits: {
      milkingCapability: 'high',
      humpPresence: false,
      facialFeatures: ['straight profile'],
      earType: 'normal',
      tailType: 'normal'
    },
    locationData: {
      region: 'South Gujarat',
      state: 'Gujarat',
      climate: 'tropical',
      farmType: 'dairy'
    },
    expertValidation: {
      validatedBy: 'Dr. Kiran Patel, Gujarat Veterinary College',
      confidenceLevel: 'high',
      notes: 'Typical Surti buffalo with good milking potential and adapted to tropical climate.'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample_005',
    labels: {
      animalType: 'cattle',
      breed: 'Red Sindhi',
      age: 'adult',
      gender: 'female',
      healthCondition: 'excellent'
    },
    physicalAttributes: {
      bodyColor: ['red'],
      hornType: 'small',
      bodySize: 'medium',
      bodyCondition: 'well-fed',
      distinctiveFeatures: ['dewlap']
    },
    breedSpecificTraits: {
      milkingCapability: 'high',
      humpPresence: true,
      facialFeatures: ['straight profile'],
      earType: 'normal',
      tailType: 'normal'
    },
    locationData: {
      region: 'Tharparkar',
      state: 'Rajasthan',
      climate: 'arid',
      farmType: 'dairy'
    },
    expertValidation: {
      validatedBy: 'Dr. Mohan Lal, Rajasthan Agricultural University',
      confidenceLevel: 'very-high',
      notes: 'Excellent Red Sindhi cow, well-adapted to arid conditions with high milk yield.'
    },
    createdAt: new Date().toISOString()
  }
];

// Calculate training statistics
function generateTrainingStats(data) {
  const animalTypeDistribution = {};
  const breedDistribution = {};
  let expertValidatedCount = 0;

  data.forEach(item => {
    // Animal type distribution
    animalTypeDistribution[item.labels.animalType] = 
      (animalTypeDistribution[item.labels.animalType] || 0) + 1;
    
    // Breed distribution
    breedDistribution[item.labels.breed] = 
      (breedDistribution[item.labels.breed] || 0) + 1;
    
    // Expert validation count
    if (item.expertValidation.validatedBy) {
      expertValidatedCount++;
    }
  });

  const expertValidatedPercentage = (expertValidatedCount / data.length) * 100;
  
  // Calculate data quality score based on completeness and validation
  let qualityScore = 0;
  qualityScore += expertValidatedPercentage * 0.4; // 40% for expert validation
  qualityScore += 30; // 30% for complete labels (all samples have complete labels)
  qualityScore += 20; // 20% for physical attributes completeness
  qualityScore += 10; // 10% for location data completeness

  const recommendedNextSteps = [];
  
  if (data.length < 100) {
    recommendedNextSteps.push(`Collect ${100 - data.length} more training samples to reach minimum training threshold`);
  }
  
  if (expertValidatedPercentage < 80) {
    recommendedNextSteps.push('Increase expert validation percentage to improve data quality');
  }
  
  const breedCount = Object.keys(breedDistribution).length;
  if (breedCount < 10) {
    recommendedNextSteps.push(`Add more breed diversity - currently covering ${breedCount} breeds`);
  }
  
  if (data.length >= 100 && expertValidatedPercentage >= 80) {
    recommendedNextSteps.push('Ready to start model training with current dataset');
    recommendedNextSteps.push('Consider data augmentation techniques to expand dataset');
  }

  return {
    totalSamples: data.length,
    dataQuality: {
      totalSamples: data.length,
      animalTypeDistribution,
      breedDistribution,
      expertValidatedPercentage,
      dataQualityScore: Math.round(qualityScore)
    },
    recommendedNextSteps
  };
}

// Generate the sample data files
function generateSampleData() {
  const outputDir = path.join(__dirname, '..', 'public', 'sample-training-data');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write sample training data
  fs.writeFileSync(
    path.join(outputDir, 'sample-training-data.json'),
    JSON.stringify(sampleTrainingData, null, 2)
  );

  // Generate and write training statistics
  const stats = generateTrainingStats(sampleTrainingData);
  fs.writeFileSync(
    path.join(outputDir, 'training-statistics.json'),
    JSON.stringify(stats, null, 2)
  );

  console.log('✅ Sample training data generated successfully!');
  console.log(`📊 Generated ${sampleTrainingData.length} sample training records`);
  console.log(`🎯 Data quality score: ${stats.dataQuality.dataQualityScore}/100`);
  console.log(`👨‍⚕️ Expert validated: ${stats.dataQuality.expertValidatedPercentage}%`);
  console.log(`🐄 Animal types: ${Object.keys(stats.dataQuality.animalTypeDistribution).join(', ')}`);
  console.log(`🏷️ Breeds covered: ${Object.keys(stats.dataQuality.breedDistribution).join(', ')}`);
  console.log('\n📁 Files created:');
  console.log(`   - ${path.join(outputDir, 'sample-training-data.json')}`);
  console.log(`   - ${path.join(outputDir, 'training-statistics.json')}`);
}

// Run the generator
if (require.main === module) {
  generateSampleData();
}

module.exports = { sampleTrainingData, generateTrainingStats, generateSampleData };