#!/usr/bin/env node

/**
 * Validation Script for Applied Layout Matching Property Test
 * Validates that the property test is correctly implemented and can run
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Applied Layout Matching Property Test ===\n');

let validationsPassed = 0;
let validationsFailed = 0;

/**
 * Validation 1: Check test file exists
 */
console.log('Validation 1: Checking test file exists...');
const testFilePath = path.join(__dirname, 'applied-layout-matching-property.test.js');
if (fs.existsSync(testFilePath)) {
  console.log('✓ Test file exists\n');
  validationsPassed++;
} else {
  console.error('✗ Test file not found\n');
  validationsFailed++;
}

/**
 * Validation 2: Check HTML runner exists
 */
console.log('Validation 2: Checking HTML test runner exists...');
const htmlFilePath = path.join(__dirname, 'test-applied-layout-matching-property.html');
if (fs.existsSync(htmlFilePath)) {
  console.log('✓ HTML test runner exists\n');
  validationsPassed++;
} else {
  console.error('✗ HTML test runner not found\n');
  validationsFailed++;
}

/**
 * Validation 3: Check test file structure
 */
console.log('Validation 3: Checking test file structure...');
const testContent = fs.readFileSync(testFilePath, 'utf8');

const requiredElements = [
  { name: 'Property 13 comment', pattern: /Property 13: Applied Layout Matches Calculated Layout/ },
  { name: 'Requirements validation', pattern: /Validates: Requirements 4\.2/ },
  { name: 'Test function export', pattern: /runAppliedLayoutMatchingPropertyTest/ },
  { name: 'fast-check usage', pattern: /fc\.assert/ },
  { name: 'Position tolerance constant', pattern: /POSITION_TOLERANCE\s*=\s*1/ },
  { name: 'Property 1 test', pattern: /Property 1:.*Single element/ },
  { name: 'Property 2 test', pattern: /Property 2:.*Multiple elements/ },
  { name: 'Property 3 test', pattern: /Property 3:.*Complete layout/ },
  { name: 'Property 4 test', pattern: /Property 4:.*Multiple updates/ },
  { name: 'Property 5 test', pattern: /Property 5:.*1px tolerance/ },
  { name: 'Position matching function', pattern: /positionsMatch/ },
  { name: 'DOMUpdater usage', pattern: /new DOMUpdater/ },
  { name: 'Async property tests', pattern: /fc\.asyncProperty/ },
  { name: 'Test cleanup', pattern: /cleanupElements/ }
];

let structureValid = true;
requiredElements.forEach(({ name, pattern }) => {
  if (pattern.test(testContent)) {
    console.log(`  ✓ ${name} found`);
  } else {
    console.error(`  ✗ ${name} missing`);
    structureValid = false;
  }
});

if (structureValid) {
  console.log('✓ Test file structure is valid\n');
  validationsPassed++;
} else {
  console.error('✗ Test file structure is incomplete\n');
  validationsFailed++;
}

/**
 * Validation 4: Check HTML runner structure
 */
console.log('Validation 4: Checking HTML runner structure...');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

const requiredHTMLElements = [
  { name: 'Property 13 title', pattern: /Property 13.*Applied Layout Matches Calculated Layout/ },
  { name: 'Requirements reference', pattern: /Requirements 4\.2/ },
  { name: 'fast-check script', pattern: /setup-fast-check\.js/ },
  { name: 'DOMUpdater script', pattern: /dom-updater\.js/ },
  { name: 'Test script', pattern: /applied-layout-matching-property\.test\.js/ },
  { name: 'Run button', pattern: /id="runTests"/ },
  { name: 'Output area', pattern: /id="output"/ },
  { name: 'Status area', pattern: /id="status"/ },
  { name: 'Test area', pattern: /id="test-area"/ },
  { name: 'Test function call', pattern: /runAppliedLayoutMatchingPropertyTest/ }
];

let htmlValid = true;
requiredHTMLElements.forEach(({ name, pattern }) => {
  if (pattern.test(htmlContent)) {
    console.log(`  ✓ ${name} found`);
  } else {
    console.error(`  ✗ ${name} missing`);
    htmlValid = false;
  }
});

if (htmlValid) {
  console.log('✓ HTML runner structure is valid\n');
  validationsPassed++;
} else {
  console.error('✗ HTML runner structure is incomplete\n');
  validationsFailed++;
}

/**
 * Validation 5: Check test configuration
 */
console.log('Validation 5: Checking test configuration...');

const configChecks = [
  { name: '100 iterations for Property 1', pattern: /numRuns:\s*100.*Property 1/s },
  { name: '100 iterations for Property 2', pattern: /numRuns:\s*100.*Property 2/s },
  { name: '100 iterations for Property 3', pattern: /numRuns:\s*100.*Property 3/s },
  { name: '50 iterations for Property 4', pattern: /numRuns:\s*50.*Property 4/s },
  { name: '100 iterations for Property 5', pattern: /numRuns:\s*100.*Property 5/s },
  { name: '60 second timeout', pattern: /timeout:\s*60000/ },
  { name: '1px tolerance', pattern: /POSITION_TOLERANCE\s*=\s*1/ }
];

let configValid = true;
configChecks.forEach(({ name, pattern }) => {
  if (pattern.test(testContent)) {
    console.log(`  ✓ ${name} configured`);
  } else {
    console.error(`  ✗ ${name} not configured`);
    configValid = false;
  }
});

if (configValid) {
  console.log('✓ Test configuration is valid\n');
  validationsPassed++;
} else {
  console.error('✗ Test configuration is incomplete\n');
  validationsFailed++;
}

/**
 * Validation 6: Check property test coverage
 */
console.log('Validation 6: Checking property test coverage...');

const propertyTests = [
  { name: 'Single element position matching', pattern: /Property 1:.*Single element.*position.*match/i },
  { name: 'Batch update position matching', pattern: /Property 2:.*Multiple elements.*batch/i },
  { name: 'Complete layout configuration', pattern: /Property 3:.*Complete layout.*configuration/i },
  { name: 'Multiple updates accuracy', pattern: /Property 4:.*Multiple updates.*accuracy/i },
  { name: 'Tolerance boundary test', pattern: /Property 5:.*1px tolerance/i }
];

let coverageValid = true;
propertyTests.forEach(({ name, pattern }) => {
  if (pattern.test(testContent)) {
    console.log(`  ✓ ${name} tested`);
  } else {
    console.error(`  ✗ ${name} not tested`);
    coverageValid = false;
  }
});

if (coverageValid) {
  console.log('✓ Property test coverage is complete\n');
  validationsPassed++;
} else {
  console.error('✗ Property test coverage is incomplete\n');
  validationsFailed++;
}

/**
 * Validation 7: Check dependencies
 */
console.log('Validation 7: Checking dependencies...');

const dependencies = [
  { name: 'DOMUpdater', path: '../../js/adaptive-viewport/dom-updater.js' },
  { name: 'LayoutOptimizer', path: '../../js/adaptive-viewport/layout-optimizer.js' },
  { name: 'Constants', path: '../../js/adaptive-viewport/constants.js' },
  { name: 'Types', path: '../../js/adaptive-viewport/types.js' }
];

let depsValid = true;
dependencies.forEach(({ name, path: depPath }) => {
  const fullPath = path.join(__dirname, depPath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✓ ${name} exists`);
  } else {
    console.error(`  ✗ ${name} not found at ${depPath}`);
    depsValid = false;
  }
});

if (depsValid) {
  console.log('✓ All dependencies exist\n');
  validationsPassed++;
} else {
  console.error('✗ Some dependencies are missing\n');
  validationsFailed++;
}

/**
 * Print summary
 */
console.log('='.repeat(60));
console.log('Validation Summary');
console.log('='.repeat(60));
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Success Rate: ${((validationsPassed / (validationsPassed + validationsFailed)) * 100).toFixed(1)}%`);
console.log('');

if (validationsFailed === 0) {
  console.log('✅ All validations passed! Test is ready to run.');
  console.log('');
  console.log('To run the test:');
  console.log('  1. Open test-applied-layout-matching-property.html in a browser');
  console.log('  2. Click "Run Property Tests"');
  console.log('  3. Wait for all 450 iterations to complete');
  console.log('');
  process.exit(0);
} else {
  console.error('❌ Some validations failed. Please fix the issues above.');
  console.log('');
  process.exit(1);
}
