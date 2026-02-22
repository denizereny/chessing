#!/usr/bin/env node

/**
 * Validation Script for Extreme Viewport Dimension Property Test
 * Verifies that the property test is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Extreme Viewport Dimension Property Test ===\n');

const results = {
  passed: 0,
  failed: 0,
  checks: []
};

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✓ ${name}`);
    results.passed++;
    results.checks.push({ name, status: 'PASS' });
  } else {
    console.error(`✗ ${name}`);
    if (details) console.error(`  ${details}`);
    results.failed++;
    results.checks.push({ name, status: 'FAIL', details });
  }
}

// Check 1: Test file exists
const testFilePath = path.join(__dirname, 'extreme-viewport-dimension-property.test.js');
const testFileExists = fs.existsSync(testFilePath);
check('Test file exists', testFileExists, 'extreme-viewport-dimension-property.test.js not found');

if (testFileExists) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Check 2: Contains property description
  check(
    'Contains Property 17 description',
    testContent.includes('Property 17: Extreme Viewport Dimension Support'),
    'Missing property description'
  );

  // Check 3: Validates Requirements 5.1, 5.2
  check(
    'Validates Requirements 5.1, 5.2',
    testContent.includes('Requirements 5.1, 5.2'),
    'Missing requirement validation'
  );

  // Check 4: Uses fast-check library
  check(
    'Uses fast-check library',
    testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty'),
    'Not using fast-check properly'
  );

  // Check 5: Tests viewport width range 320-3840
  check(
    'Tests viewport width range (320-3840px)',
    testContent.includes('min: 320') && testContent.includes('max: 3840'),
    'Missing width range'
  );

  // Check 6: Tests viewport height range 480-2160
  check(
    'Tests viewport height range (480-2160px)',
    testContent.includes('min: 480') && testContent.includes('max: 2160'),
    'Missing height range'
  );

  // Check 7: Runs minimum 100 iterations
  check(
    'Runs minimum 100 iterations per property',
    testContent.includes('numRuns: 100'),
    'Not running 100 iterations'
  );

  // Check 8: Validates layout configuration
  check(
    'Validates layout configuration',
    testContent.includes('validateLayoutConfiguration'),
    'Missing layout validation'
  );

  // Check 9: Tests extreme aspect ratios
  check(
    'Tests extreme aspect ratios',
    testContent.includes('ultra-wide') || testContent.includes('very-tall'),
    'Missing extreme aspect ratio tests'
  );

  // Check 10: Tests portrait and landscape orientations
  check(
    'Tests portrait and landscape orientations',
    testContent.includes('portrait') && testContent.includes('landscape'),
    'Missing orientation tests'
  );

  // Check 11: Tests boundary dimensions
  check(
    'Tests boundary dimensions',
    testContent.includes('320') && testContent.includes('3840') && 
    testContent.includes('480') && testContent.includes('2160'),
    'Missing boundary dimension tests'
  );

  // Check 12: Validates minimum board size
  check(
    'Validates minimum board size (280px)',
    testContent.includes('280') && testContent.includes('minBoardSize'),
    'Missing minimum board size validation'
  );

  // Check 13: Checks for NaN and Infinity
  check(
    'Checks for NaN and Infinity in dimensions',
    testContent.includes('isNaN') && testContent.includes('isFinite'),
    'Missing NaN/Infinity checks'
  );

  // Check 14: Validates board fits within viewport
  check(
    'Validates board fits within viewport',
    testContent.includes('boardRight') || testContent.includes('boardBottom'),
    'Missing viewport fit validation'
  );

  // Check 15: Has proper error handling
  check(
    'Has proper error handling',
    testContent.includes('try') && testContent.includes('catch'),
    'Missing error handling'
  );

  // Check 16: Exports test function
  check(
    'Exports test function',
    testContent.includes('module.exports') && 
    testContent.includes('runExtremeViewportDimensionPropertyTest'),
    'Missing export'
  );

  // Check 17: Tests at least 5 properties
  const propertyMatches = testContent.match(/Property \d+:/g);
  check(
    'Tests at least 5 properties',
    propertyMatches && propertyMatches.length >= 5,
    `Only ${propertyMatches ? propertyMatches.length : 0} properties found`
  );
}

// Check 18: HTML test runner exists
const htmlFilePath = path.join(__dirname, 'test-extreme-viewport-dimension-property.html');
const htmlFileExists = fs.existsSync(htmlFilePath);
check('HTML test runner exists', htmlFileExists, 'test-extreme-viewport-dimension-property.html not found');

if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Check 19: HTML loads fast-check
  check(
    'HTML loads fast-check',
    htmlContent.includes('setup-fast-check.js'),
    'Missing fast-check setup'
  );

  // Check 20: HTML loads test file
  check(
    'HTML loads test file',
    htmlContent.includes('extreme-viewport-dimension-property.test.js'),
    'Missing test file reference'
  );

  // Check 21: HTML loads dependencies
  check(
    'HTML loads required dependencies',
    htmlContent.includes('viewport-analyzer.js') && 
    htmlContent.includes('layout-optimizer.js'),
    'Missing dependency references'
  );

  // Check 22: HTML has run button
  check(
    'HTML has run button',
    htmlContent.includes('runTests') && htmlContent.includes('button'),
    'Missing run button'
  );

  // Check 23: HTML displays property information
  check(
    'HTML displays property information',
    htmlContent.includes('Property 17') && htmlContent.includes('Requirements 5.1, 5.2'),
    'Missing property information'
  );
}

// Check 24: Validation script exists
const validationScriptPath = path.join(__dirname, 'validate-extreme-viewport-dimension-test.js');
check('Validation script exists', fs.existsSync(validationScriptPath));

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

if (results.failed === 0) {
  console.log('✅ All validation checks passed!');
  console.log('The property test is correctly implemented.\n');
  process.exit(0);
} else {
  console.error('❌ Some validation checks failed.');
  console.error('Please review the failed checks above.\n');
  process.exit(1);
}
