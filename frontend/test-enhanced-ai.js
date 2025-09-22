#!/usr/bin/env node

console.log('🧪 Testing Enhanced AI System Setup...\n');

const fs = require('fs');
const path = require('path');

// Check if directories exist
const requiredDirs = [
  'data/training',
  'data/validated', 
  'data/rejected',
  'src/components/training',
  'scripts'
];

let allGood = true;

console.log('📁 Checking directory structure:');
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    allGood = false;
  }
});

// Check if files exist
const requiredFiles = [
  'src/components/training/DataCollectionForm.tsx',
  'src/pages/api/training-data.ts',
  'scripts/quality_control.py',
  'src/lib/services/enhanced-ai-classification.ts'
];

console.log('\n📄 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

if (allGood) {
  console.log('\n🎉 Enhanced AI system setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Integrate enhanced service in classify page');
  console.log('  2. Add data collection form to UI');
  console.log('  3. Start collecting training data');
  console.log('  4. Run: python3 scripts/quality_control.py');
  console.log('\n🎯 Target: 85% accuracy with Stage 1 enhancements');
} else {
  console.log('\n⚠️  Setup incomplete. Please check missing files/directories.');
}
