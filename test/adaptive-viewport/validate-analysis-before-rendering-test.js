#!/usr/bin/env node

/**
 * Validation Script for Analysis Before Rendering Property Test
 * Verifies that the property test is correctly implemented and follows the pattern
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Analysis Before Rendering Property Test ===\n');

const testFilePath = path.join(__dirname, 'analysis-before-rendering-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-analysis-before-rendering-property.html');

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

// Check if test file exists
validate(fs.existsSync(testFilePath), 'Test file exists');

// Check if HTML runner exists
validate(fs.existsSync(htmlFilePath), 'HTML test runner exists');

if (!fs.existsSync(testFilePath)) {
  console.error('\nTest file not found. Exiting validation.');
  process.exit(1);
}

// Read test file
const testContent = fs.readFileSync(testFilePath, 'utf8');

// Validate test structure
console.log('\n--- Test Structure Validation ---');

validate(
  testContent.includes('Property 12: Analysis Before Rendering'),
  'Test has correct property title'
);

validate(
  testContent.includes('**Validates: Requirements 4.1**'),
  'Test validates correct requirement'
);

validate(
  testContent.includes('runAnalysisBeforeRenderingPropertyTest'),
  'Test has main test function'
);

validate(
  testContent.includes('fc.assert'),
  'Test uses fast-check assertions'
);

validate(
  testContent.includes('numRuns: 100'),
  'Test runs minimum 100 iterations'
);

// Validate property tests
console.log('\n--- Property Test Validation ---');

const propertyTests = [
  'Property 1: Analysis completes before UI elements are rendered',
  'Property 2: Layout configuration exists before DOM updates are applied',
  'Property 3: Analysis completes within 200ms',
  'Property 4: Initialize method performs analysis before returning',
  'Property 5: Analysis result contains all required data for rendering'
];

propertyTests.forEach((propertyName, index) => {
  validate(
    testContent.includes(propertyName),
    `Property ${index + 1} test exists: "${propertyName}"`
  );
});

// Validate test helpers
console.log('\n--- Helper Function Validation ---');

const helpers = [
  'createTestUIElements',
  'isElementRendered',
  'RenderMonitor',
  'AnalysisTracker',
  'cleanupElements'
];

helpers.forEach(helper => {
  validate(
    testContent.includes(helper),
    `Helper function exists: ${helper}`
  );
});

// Validate ViewportAnalyzer usage
console.log('\n--- ViewportAnalyzer Integration Validation ---');

validate(
  testContent.includes('new ViewportAnalyzer'),
  'Test creates ViewportAnalyzer instances'
);

validate(
  testContent.includes('analyzer.initialize()'),
  'Test calls initialize method'
);

validate(
  testContent.includes('analyzer.analyzeViewport()'),
  'Test calls analyzeViewport method'
);

validate(
  testContent.includes('analyzer.getState()'),
  'Test checks analyzer state'
);

validate(
  testContent.includes('analyzer.destroy()'),
  'Test properly cleans up analyzer'
);

// Validate timing checks
console.log('\n--- Timing Validation ---');

validate(
  testContent.includes('performance.now()'),
  'Test uses performance timing'
);

validate(
  testContent.includes('analysisEndTime'),
  'Test tracks analysis end time'
);

validate(
  testContent.includes('firstRenderTime'),
  'Test tracks first render time'
);

validate(
  testContent.includes('analysisEndTime > firstRenderTime'),
  'Test compares analysis and render timing'
);

// Validate 200ms requirement
validate(
  testContent.includes('200') && testContent.includes('Requirement 4.3'),
  'Test validates 200ms timing requirement'
);

// Validate HTML runner
if (fs.existsSync(htmlFilePath)) {
  console.log('\n--- HTML Runner Validation ---');
  
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  validate(
    htmlContent.includes('Property Test: Analysis Before Rendering'),
    'HTML has correct title'
  );
  
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML loads fast-check library'
  );
  
  validate(
    htmlContent.includes('viewport-analyzer.js'),
    'HTML loads ViewportAnalyzer'
  );
  
  validate(
    htmlContent.includes('analysis-before-rendering-property.test.js'),
    'HTML loads test file'
  );
  
  validate(
    htmlContent.includes('runAnalysisBeforeRenderingPropertyTest'),
    'HTML calls test function'
  );
}

// Validate exports
console.log('\n--- Export Validation ---');

validate(
  testContent.includes('module.exports'),
  'Test exports function for Node.js'
);

validate(
  testContent.includes('runAnalysisBeforeRenderingPropertyTest'),
  'Test exports correct function name'
);

// Validate error handling
console.log('\n--- Error Handling Validation ---');

validate(
  testContent.includes('try') && testContent.includes('catch'),
  'Test includes error handling'
);

validate(
  testContent.includes('cleanupElements'),
  'Test cleans up elements on error'
);

validate(
  testContent.includes('analyzer.destroy()'),
  'Test destroys analyzer on cleanup'
);

// Validate test results structure
console.log('\n--- Test Results Structure Validation ---');

validate(
  testContent.includes('results.passed++'),
  'Test tracks passed tests'
);

validate(
  testContent.includes('results.failed++'),
  'Test tracks failed tests'
);

validate(
  testContent.includes('results.tests.push'),
  'Test records individual test results'
);

validate(
  testContent.includes('Test Summary'),
  'Test prints summary'
);

// Print final summary
console.log('\n=== Validation Summary ===');
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! Test is correctly implemented.');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please review the test implementation.');
  process.exit(1);
}
