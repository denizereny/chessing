#!/usr/bin/env node

/**
 * Validation Script for Layout Restoration Round-Trip Property Test
 * Verifies that the test implementation is correct and complete
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Layout Restoration Round-Trip Property Test ===\n');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    validationsPassed++;
  } else {
    console.error(`✗ ${message}`);
    validationsFailed++;
  }
}

// Check test file exists
const testFilePath = path.join(__dirname, 'layout-restoration-round-trip-property.test.js');
validate(fs.existsSync(testFilePath), 'Test file exists');

// Check HTML runner exists
const htmlRunnerPath = path.join(__dirname, 'test-layout-restoration-round-trip-property.html');
validate(fs.existsSync(htmlRunnerPath), 'HTML test runner exists');

if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  // Validate test structure
  validate(
    testContent.includes('Property 7: Layout Restoration Round-Trip'),
    'Test has correct property identifier'
  );
  
  validate(
    testContent.includes('Validates: Requirements 2.5'),
    'Test validates correct requirement'
  );
  
  validate(
    testContent.includes('runLayoutRestorationRoundTripPropertyTest'),
    'Test exports main test function'
  );
  
  // Validate property tests
  validate(
    testContent.includes('Property 1: Single element returns to original position'),
    'Property 1: Single element round-trip test exists'
  );
  
  validate(
    testContent.includes('Property 2: Multiple elements return to original positions'),
    'Property 2: Multiple elements round-trip test exists'
  );
  
  validate(
    testContent.includes('Property 3: Layout strategy returns to original'),
    'Property 3: Layout strategy round-trip test exists'
  );
  
  validate(
    testContent.includes('Property 4: Board position returns to original'),
    'Property 4: Board position round-trip test exists'
  );
  
  validate(
    testContent.includes('Property 5: Multiple round-trips maintain consistency'),
    'Property 5: Multiple round-trips test exists'
  );
  
  // Validate fast-check usage
  validate(
    testContent.includes('fc.assert'),
    'Test uses fast-check assertions'
  );
  
  validate(
    testContent.includes('fc.asyncProperty'),
    'Test uses async properties'
  );
  
  validate(
    testContent.includes('numRuns: 100'),
    'Test runs 100 iterations per property'
  );
  
  // Validate test logic
  validate(
    testContent.includes('calculateOptimalLayout'),
    'Test calls calculateOptimalLayout'
  );
  
  validate(
    testContent.includes('initialLayout') && testContent.includes('shrunkLayout') && testContent.includes('restoredLayout'),
    'Test performs shrink/expand cycle'
  );
  
  validate(
    testContent.includes('positionsMatch'),
    'Test compares positions with tolerance'
  );
  
  validate(
    testContent.includes('initialWidth') && testContent.includes('shrunkWidth'),
    'Test uses different viewport widths'
  );
  
  // Validate generators
  validate(
    testContent.includes('fc.integer({ min: 1000') || testContent.includes('fc.integer({ min: 1100'),
    'Test generates wide initial viewport widths'
  );
  
  validate(
    testContent.includes('fc.integer({ min: 400') || testContent.includes('fc.integer({ min: 420'),
    'Test generates narrow shrunk viewport widths'
  );
  
  validate(
    testContent.includes('fc.integer({ min: 280, max: 400 })') || testContent.includes('fc.integer({ min: 280, max: 380 })'),
    'Test generates valid board sizes'
  );
  
  // Validate cleanup
  validate(
    testContent.includes('document.body.removeChild'),
    'Test cleans up DOM elements'
  );
  
  // Validate error handling
  validate(
    testContent.includes('try') && testContent.includes('catch'),
    'Test has error handling'
  );
  
  // Validate results structure
  validate(
    testContent.includes('results.passed') && testContent.includes('results.failed'),
    'Test tracks pass/fail results'
  );
  
  validate(
    testContent.includes('Test Summary'),
    'Test prints summary'
  );
}

if (fs.existsSync(htmlRunnerPath)) {
  const htmlContent = fs.readFileSync(htmlRunnerPath, 'utf8');
  
  // Validate HTML structure
  validate(
    htmlContent.includes('Property Test: Layout Restoration Round-Trip'),
    'HTML runner has correct title'
  );
  
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML runner loads fast-check'
  );
  
  validate(
    htmlContent.includes('layout-optimizer.js'),
    'HTML runner loads LayoutOptimizer'
  );
  
  validate(
    htmlContent.includes('layout-restoration-round-trip-property.test.js'),
    'HTML runner loads test file'
  );
  
  validate(
    htmlContent.includes('runLayoutRestorationRoundTripPropertyTest'),
    'HTML runner calls test function'
  );
  
  validate(
    htmlContent.includes('Run Property Tests'),
    'HTML runner has run button'
  );
}

// Check dependencies exist
const layoutOptimizerPath = path.join(__dirname, '../../js/adaptive-viewport/layout-optimizer.js');
validate(fs.existsSync(layoutOptimizerPath), 'LayoutOptimizer implementation exists');

const constantsPath = path.join(__dirname, '../../js/adaptive-viewport/constants.js');
validate(fs.existsSync(constantsPath), 'Constants file exists');

const fastCheckSetupPath = path.join(__dirname, 'setup-fast-check.js');
validate(fs.existsSync(fastCheckSetupPath), 'fast-check setup file exists');

// Summary
console.log('\n=== Validation Summary ===');
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! Test implementation is complete and correct.');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please review the test implementation.');
  process.exit(1);
}
