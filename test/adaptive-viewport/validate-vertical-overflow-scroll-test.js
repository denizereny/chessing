#!/usr/bin/env node

/**
 * Validation script for vertical overflow scroll property test
 * Verifies test structure and completeness
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Validating Vertical Overflow Scroll Property Test ===\n');

const testFilePath = path.join(__dirname, 'vertical-overflow-scroll-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-vertical-overflow-scroll-property.html');

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
validate(fs.existsSync(testFilePath), 'Test file exists');

// Check HTML runner exists
validate(fs.existsSync(htmlFilePath), 'HTML test runner exists');

if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  // Check for required header information
  validate(
    testContent.includes('Property 8: Vertical Overflow Creates Scroll Container'),
    'Test has correct property title'
  );
  
  validate(
    testContent.includes('**Validates: Requirements 3.1**'),
    'Test validates correct requirement'
  );
  
  validate(
    testContent.includes('Feature: adaptive-viewport-optimizer'),
    'Test has correct feature tag'
  );
  
  // Check for main test function
  validate(
    testContent.includes('async function runVerticalOverflowScrollPropertyTest(fc)'),
    'Test has main async function'
  );
  
  // Check for fast-check usage
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
    'Test runs minimum 100 iterations'
  );
  
  // Check for all 5 properties
  const propertyCount = (testContent.match(/Property \d+:/g) || []).length;
  validate(
    propertyCount >= 5,
    `Test includes at least 5 properties (found ${propertyCount})`
  );
  
  // Check for specific property tests
  validate(
    testContent.includes('Container should be scrollable when content exceeds maxHeight'),
    'Property 1: Scrollable container creation'
  );
  
  validate(
    testContent.includes('Container should have smooth scroll behavior when configured'),
    'Property 2: Smooth scroll behavior'
  );
  
  validate(
    testContent.includes('All elements should be contained within scroll container'),
    'Property 3: Element containment'
  );
  
  validate(
    testContent.includes('Container should have proper ARIA attributes'),
    'Property 4: ARIA attributes'
  );
  
  validate(
    testContent.includes('Vertical stacking should maintain minimum spacing'),
    'Property 5: Minimum spacing'
  );
  
  // Check for OverflowHandler usage
  validate(
    testContent.includes('new OverflowHandler'),
    'Test creates OverflowHandler instances'
  );
  
  validate(
    testContent.includes('createScrollContainer'),
    'Test calls createScrollContainer method'
  );
  
  // Check for proper cleanup
  validate(
    testContent.includes('handler.destroy()'),
    'Test includes cleanup with destroy()'
  );
  
  validate(
    testContent.includes('document.body.removeChild(container)'),
    'Test removes elements from DOM'
  );
  
  // Check for helper functions
  validate(
    testContent.includes('function createTestElements'),
    'Test has createTestElements helper'
  );
  
  validate(
    testContent.includes('function calculateTotalHeight'),
    'Test has calculateTotalHeight helper'
  );
  
  // Check for proper error handling
  validate(
    testContent.includes('catch (error)'),
    'Test includes error handling'
  );
  
  // Check for results tracking
  validate(
    testContent.includes('results.passed++'),
    'Test tracks passed results'
  );
  
  validate(
    testContent.includes('results.failed++'),
    'Test tracks failed results'
  );
  
  // Check for module exports
  validate(
    testContent.includes('module.exports'),
    'Test exports function for Node.js'
  );
  
  // Check for test summary
  validate(
    testContent.includes('Test Summary'),
    'Test prints summary'
  );
  
  validate(
    testContent.includes('Success Rate'),
    'Test calculates success rate'
  );
}

if (fs.existsSync(htmlFilePath)) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Check HTML structure
  validate(
    htmlContent.includes('<!DOCTYPE html>'),
    'HTML has DOCTYPE declaration'
  );
  
  validate(
    htmlContent.includes('Property Test: Vertical Overflow Scroll Container'),
    'HTML has correct title'
  );
  
  // Check for required scripts
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML loads fast-check setup'
  );
  
  validate(
    htmlContent.includes('overflow-handler.js'),
    'HTML loads OverflowHandler'
  );
  
  validate(
    htmlContent.includes('vertical-overflow-scroll-property.test.js'),
    'HTML loads test file'
  );
  
  // Check for UI elements
  validate(
    htmlContent.includes('id="runTests"'),
    'HTML has run tests button'
  );
  
  validate(
    htmlContent.includes('id="output"'),
    'HTML has output div'
  );
  
  validate(
    htmlContent.includes('id="status"'),
    'HTML has status indicator'
  );
  
  // Check for test information
  validate(
    htmlContent.includes('Property 8:'),
    'HTML displays property number'
  );
  
  validate(
    htmlContent.includes('Requirements 3.1'),
    'HTML displays requirement validation'
  );
  
  // Check for warning
  validate(
    htmlContent.includes('Long-Running Test Warning'),
    'HTML includes performance warning'
  );
  
  // Check for test execution
  validate(
    htmlContent.includes('runVerticalOverflowScrollPropertyTest(fc)'),
    'HTML calls test function'
  );
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! Test is ready to run.\n');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please review the test implementation.\n');
  process.exit(1);
}
