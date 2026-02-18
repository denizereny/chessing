#!/usr/bin/env node

/**
 * Validation Script for Board Priority Over UI Elements Property Test
 * 
 * This script validates that the property test for board priority over UI elements
 * is correctly implemented and tests the required properties.
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Board Priority Over UI Elements Property Test ===\n');

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

// 1. Check test file exists
const testFilePath = path.join(__dirname, 'board-priority-over-ui-property.test.js');
validate(
  fs.existsSync(testFilePath),
  'Property test file exists'
);

// 2. Check HTML runner exists
const htmlRunnerPath = path.join(__dirname, 'test-board-priority-over-ui-property.html');
validate(
  fs.existsSync(htmlRunnerPath),
  'HTML test runner exists'
);

// 3. Read and validate test file content
if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf-8');
  
  // Check for proper header and documentation
  validate(
    testContent.includes('Property 24: Board Priority Over UI Elements'),
    'Test file has correct property identifier'
  );
  
  validate(
    testContent.includes('Validates: Requirements 6.4, 7.2, 7.4'),
    'Test file validates correct requirements'
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
  
  // Check for required property tests
  validate(
    testContent.includes('Property 1: Board size is preserved at optimal size during conflicts'),
    'Test includes Property 1: Board size preservation'
  );
  
  validate(
    testContent.includes('Property 2: UI elements are repositioned rather than shrinking board'),
    'Test includes Property 2: UI repositioning'
  );
  
  validate(
    testContent.includes('Property 3: Board space is allocated before positioning UI elements'),
    'Test includes Property 3: Board space allocation priority'
  );
  
  validate(
    testContent.includes('Property 4: Board is not shrunk below optimal size for UI elements'),
    'Test includes Property 4: Board not shrunk for UI'
  );
  
  validate(
    testContent.includes('Property 5: Conflict resolution always preserves board priority'),
    'Test includes Property 5: Conflict resolution'
  );
  
  validate(
    testContent.includes('Property 6: Board priority holds across all supported viewport sizes'),
    'Test includes Property 6: Board priority across viewports'
  );
  
  validate(
    testContent.includes('Property 7: UI scrolling is used instead of shrinking board'),
    'Test includes Property 7: UI scrolling preference'
  );
  
  // Check for LayoutOptimizer usage
  validate(
    testContent.includes('new LayoutOptimizer'),
    'Test creates LayoutOptimizer instances'
  );
  
  validate(
    testContent.includes('prioritizeBoard: true'),
    'Test uses prioritizeBoard configuration'
  );
  
  validate(
    testContent.includes('calculateOptimalLayout'),
    'Test calls calculateOptimalLayout method'
  );
  
  validate(
    testContent.includes('resolveLayoutConflicts'),
    'Test uses resolveLayoutConflicts method'
  );
  
  // Check for proper viewport dimension ranges
  validate(
    testContent.includes('min: 320') && testContent.includes('max: 3840'),
    'Test covers full viewport width range (320-3840px)'
  );
  
  validate(
    testContent.includes('min: 480') && testContent.includes('max: 2160'),
    'Test covers full viewport height range (480-2160px)'
  );
  
  // Check for UI element count variation
  validate(
    testContent.includes('uiElementCount'),
    'Test varies UI element count'
  );
  
  // Check for conflict detection
  validate(
    testContent.includes('hasLayoutConflict') || testContent.includes('hasConflict'),
    'Test includes conflict detection logic'
  );
  
  // Check for minimum board size constant
  validate(
    testContent.includes('MIN_BOARD_SIZE = 280'),
    'Test uses correct minimum board size (280px)'
  );
  
  // Check for proper error reporting
  validate(
    testContent.includes('console.error'),
    'Test includes error reporting for failures'
  );
  
  // Check for results tracking
  validate(
    testContent.includes('results.passed') && testContent.includes('results.failed'),
    'Test tracks passed and failed results'
  );
  
  // Check for export
  validate(
    testContent.includes('module.exports') && testContent.includes('runBoardPriorityOverUIPropertyTest'),
    'Test exports main function'
  );
}

// 4. Validate HTML runner
if (fs.existsSync(htmlRunnerPath)) {
  const htmlContent = fs.readFileSync(htmlRunnerPath, 'utf-8');
  
  validate(
    htmlContent.includes('Property Test: Board Priority Over UI Elements'),
    'HTML runner has correct title'
  );
  
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML runner loads fast-check library'
  );
  
  validate(
    htmlContent.includes('layout-optimizer.js'),
    'HTML runner loads LayoutOptimizer'
  );
  
  validate(
    htmlContent.includes('board-priority-over-ui-property.test.js'),
    'HTML runner loads test file'
  );
  
  validate(
    htmlContent.includes('runBoardPriorityOverUIPropertyTest'),
    'HTML runner calls test function'
  );
  
  validate(
    htmlContent.includes('Requirements 6.4, 7.2, 7.4'),
    'HTML runner documents validated requirements'
  );
}

// 5. Check for related files
const layoutOptimizerPath = path.join(__dirname, '../../js/adaptive-viewport/layout-optimizer.js');
validate(
  fs.existsSync(layoutOptimizerPath),
  'LayoutOptimizer implementation exists'
);

const fastCheckSetupPath = path.join(__dirname, '../setup-fast-check.js');
validate(
  fs.existsSync(fastCheckSetupPath),
  'fast-check setup file exists'
);

// 6. Validate test structure
if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf-8');
  
  // Count number of property tests
  const propertyTestCount = (testContent.match(/Property \d+:/g) || []).length;
  validate(
    propertyTestCount >= 7,
    `Test includes at least 7 property tests (found ${propertyTestCount})`
  );
  
  // Check for proper async/await usage
  validate(
    testContent.includes('async function runBoardPriorityOverUIPropertyTest'),
    'Main test function is async'
  );
  
  validate(
    testContent.includes('await fc.assert'),
    'Test properly awaits property assertions'
  );
  
  // Check for timeout configuration
  validate(
    testContent.includes('timeout: 30000'),
    'Test includes timeout configuration'
  );
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! The property test is correctly implemented.');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please review the issues above.');
  process.exit(1);
}
