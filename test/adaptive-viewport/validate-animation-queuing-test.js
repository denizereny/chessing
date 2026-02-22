#!/usr/bin/env node

/**
 * Validation script for Animation Queuing Property Test
 * Verifies test implementation and runs basic checks
 */

const fs = require('fs');
const path = require('path');

console.log('=== Animation Queuing Property Test Validation ===\n');

// Check if test file exists
const testFile = path.join(__dirname, 'animation-queuing-property.test.js');
if (!fs.existsSync(testFile)) {
  console.error('❌ Test file not found:', testFile);
  process.exit(1);
}
console.log('✓ Test file exists');

// Check if HTML runner exists
const htmlFile = path.join(__dirname, 'test-animation-queuing-property.html');
if (!fs.existsSync(htmlFile)) {
  console.error('❌ HTML runner not found:', htmlFile);
  process.exit(1);
}
console.log('✓ HTML runner exists');

// Read and validate test file content
const testContent = fs.readFileSync(testFile, 'utf8');

// Check for required components
const requiredComponents = [
  'Property 27: Animation Queuing',
  'Validates: Requirements 8.5',
  'runAnimationQueuingPropertyTest',
  'fc.assert',
  'numRuns: 100',
  'DOMUpdater'
];

console.log('\nValidating test content...');
let allComponentsFound = true;

requiredComponents.forEach(component => {
  if (testContent.includes(component)) {
    console.log(`✓ Found: ${component}`);
  } else {
    console.error(`❌ Missing: ${component}`);
    allComponentsFound = false;
  }
});

// Check for all 6 properties
const properties = [
  'Property 1: Layout requests during animation are queued',
  'Property 2: Queued updates execute after animation completes',
  'Property 3: Animations are not interrupted by new requests',
  'Property 4: Batch updates queue correctly during animations',
  'Property 5: Layout configuration updates queue during animations',
  'Property 6: Queue processes in order (FIFO)'
];

console.log('\nValidating property tests...');
properties.forEach((prop, index) => {
  if (testContent.includes(prop)) {
    console.log(`✓ Property ${index + 1} implemented`);
  } else {
    console.error(`❌ Property ${index + 1} missing`);
    allComponentsFound = false;
  }
});

// Check for animation queuing specific tests
const queuingChecks = [
  'isAnimating()',
  'getQueuedUpdateCount()',
  'updateElementPosition',
  'batchUpdate',
  'applyLayout'
];

console.log('\nValidating animation queuing checks...');
queuingChecks.forEach(check => {
  if (testContent.includes(check)) {
    console.log(`✓ Uses: ${check}`);
  } else {
    console.error(`❌ Missing: ${check}`);
    allComponentsFound = false;
  }
});

// Validate HTML runner
const htmlContent = fs.readFileSync(htmlFile, 'utf8');

console.log('\nValidating HTML runner...');
const htmlRequirements = [
  'animation-queuing-property.test.js',
  'dom-updater.js',
  'setup-fast-check.js',
  'runAnimationQueuingPropertyTest'
];

htmlRequirements.forEach(req => {
  if (htmlContent.includes(req)) {
    console.log(`✓ HTML includes: ${req}`);
  } else {
    console.error(`❌ HTML missing: ${req}`);
    allComponentsFound = false;
  }
});

// Check for proper test structure
console.log('\nValidating test structure...');

const structureChecks = [
  { name: 'Async property tests', pattern: /fc\.asyncProperty/g },
  { name: 'Test cleanup', pattern: /cleanupTestElement/g },
  { name: 'Error handling', pattern: /try\s*{[\s\S]*?}\s*catch/g },
  { name: 'Promise handling', pattern: /await/g },
  { name: 'Test results tracking', pattern: /results\.passed/g }
];

structureChecks.forEach(check => {
  const matches = testContent.match(check.pattern);
  if (matches && matches.length > 0) {
    console.log(`✓ ${check.name}: ${matches.length} instances`);
  } else {
    console.error(`❌ ${check.name}: not found`);
    allComponentsFound = false;
  }
});

// Summary
console.log('\n=== Validation Summary ===');
if (allComponentsFound) {
  console.log('✅ All validation checks passed!');
  console.log('\nTest Implementation Summary:');
  console.log('- Property 27: Animation Queuing');
  console.log('- Validates: Requirements 8.5');
  console.log('- 6 property tests implemented');
  console.log('- 100 iterations per property');
  console.log('- Tests animation queuing, interruption prevention, and FIFO ordering');
  console.log('\nTo run the test:');
  console.log('1. Open test-animation-queuing-property.html in a browser');
  console.log('2. Click "Run Property Test"');
  console.log('3. Wait for all 600 iterations to complete');
  process.exit(0);
} else {
  console.error('❌ Validation failed. Please fix the issues above.');
  process.exit(1);
}
