#!/usr/bin/env node

/**
 * Validation script for Horizontal Overflow Repositioning Property Test
 * Verifies that the property test file exists and is properly structured
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Horizontal Overflow Repositioning Property Test ===\n');

const testFilePath = path.join(__dirname, 'horizontal-overflow-repositioning-property.test.js');
const htmlRunnerPath = path.join(__dirname, 'test-horizontal-overflow-repositioning-property.html');

let validationPassed = true;

// Check if test file exists
console.log('1. Checking if test file exists...');
if (fs.existsSync(testFilePath)) {
  console.log('   ✓ Test file exists:', testFilePath);
} else {
  console.error('   ✗ Test file not found:', testFilePath);
  validationPassed = false;
}

// Check if HTML runner exists
console.log('\n2. Checking if HTML test runner exists...');
if (fs.existsSync(htmlRunnerPath)) {
  console.log('   ✓ HTML runner exists:', htmlRunnerPath);
} else {
  console.error('   ✗ HTML runner not found:', htmlRunnerPath);
  validationPassed = false;
}

// Read and validate test file content
console.log('\n3. Validating test file content...');
if (fs.existsSync(testFilePath)) {
  const content = fs.readFileSync(testFilePath, 'utf8');
  
  // Check for required components
  const checks = [
    { name: 'Property 4 header comment', pattern: /Property 4: Horizontal Overflow Triggers Vertical Repositioning/ },
    { name: 'Requirements validation', pattern: /Validates: Requirements 2\.1/ },
    { name: 'Main test function', pattern: /runHorizontalOverflowRepositioningPropertyTest/ },
    { name: 'fast-check usage', pattern: /fc\.assert/ },
    { name: 'LayoutOptimizer import', pattern: /LayoutOptimizer/ },
    { name: 'VisibilityDetector import', pattern: /VisibilityDetector/ },
    { name: 'Property 1: Horizontal overflow repositioning', pattern: /Property 1: Elements overflowing horizontally/ },
    { name: 'Property 2: Multiple elements', pattern: /Property 2: Multiple horizontally overflowing/ },
    { name: 'Property 3: Layout strategy', pattern: /Property 3: Layout strategy changes/ },
    { name: 'Property 4: Minimum spacing', pattern: /Property 4: Repositioned elements maintain minimum spacing/ },
    { name: '100 iterations config', pattern: /numRuns: 100/ },
    { name: 'Module export', pattern: /module\.exports/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(content)) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.error(`   ✗ Missing: ${check.name}`);
      validationPassed = false;
    }
  });
  
  // Count number of properties tested
  const propertyMatches = content.match(/Property \d+:/g);
  const propertyCount = propertyMatches ? propertyMatches.length : 0;
  console.log(`\n   Found ${propertyCount} properties being tested`);
  
  if (propertyCount >= 4) {
    console.log('   ✓ Sufficient property coverage (4+ properties)');
  } else {
    console.warn('   ⚠ Limited property coverage (less than 4 properties)');
  }
}

// Validate HTML runner content
console.log('\n4. Validating HTML runner content...');
if (fs.existsSync(htmlRunnerPath)) {
  const htmlContent = fs.readFileSync(htmlRunnerPath, 'utf8');
  
  const htmlChecks = [
    { name: 'Title includes property test', pattern: /Property Test: Horizontal Overflow/ },
    { name: 'fast-check setup script', pattern: /setup-fast-check\.js/ },
    { name: 'LayoutOptimizer script', pattern: /layout-optimizer\.js/ },
    { name: 'VisibilityDetector script', pattern: /visibility-detector\.js/ },
    { name: 'Test script inclusion', pattern: /horizontal-overflow-repositioning-property\.test\.js/ },
    { name: 'Run tests function', pattern: /runHorizontalOverflowRepositioningPropertyTest/ },
    { name: 'Requirements 2.1 reference', pattern: /Requirements 2\.1/ }
  ];
  
  htmlChecks.forEach(check => {
    if (check.pattern.test(htmlContent)) {
      console.log(`   ✓ ${check.name}`);
    } else {
      console.error(`   ✗ Missing: ${check.name}`);
      validationPassed = false;
    }
  });
}

// Check dependencies exist
console.log('\n5. Checking dependencies...');
const dependencies = [
  '../../js/adaptive-viewport/layout-optimizer.js',
  '../../js/adaptive-viewport/visibility-detector.js',
  '../../js/adaptive-viewport/constants.js',
  '../../js/adaptive-viewport/types.js',
  '../adaptive-viewport/setup-fast-check.js'
];

dependencies.forEach(dep => {
  const depPath = path.join(__dirname, dep);
  if (fs.existsSync(depPath)) {
    console.log(`   ✓ ${dep}`);
  } else {
    console.error(`   ✗ Missing dependency: ${dep}`);
    validationPassed = false;
  }
});

// Final summary
console.log('\n' + '='.repeat(60));
if (validationPassed) {
  console.log('✓ VALIDATION PASSED');
  console.log('\nThe horizontal overflow repositioning property test is properly structured.');
  console.log('\nTo run the test:');
  console.log('  1. Open test-horizontal-overflow-repositioning-property.html in a browser');
  console.log('  2. Click "Run Property Tests"');
  console.log('  3. Verify all 4 properties pass with 100 iterations each');
  process.exit(0);
} else {
  console.error('✗ VALIDATION FAILED');
  console.error('\nSome validation checks failed. Please review the errors above.');
  process.exit(1);
}
