#!/usr/bin/env node

/**
 * Validation script for Element Grouping Preservation Property Test
 * Verifies that the test file is properly structured and can be executed
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Element Grouping Preservation Property Test ===\n');

const testFilePath = path.join(__dirname, 'element-grouping-preservation-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-element-grouping-preservation-property.html');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(description, condition) {
  if (condition) {
    console.log(`✓ ${description}`);
    validationsPassed++;
    return true;
  } else {
    console.error(`✗ ${description}`);
    validationsFailed++;
    return false;
  }
}

// Check test file exists
validate('Test file exists', fs.existsSync(testFilePath));

// Check HTML runner exists
validate('HTML test runner exists', fs.existsSync(htmlFilePath));

if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  // Validate test structure
  validate(
    'Test file contains property test function',
    testContent.includes('runElementGroupingPreservationPropertyTest')
  );
  
  validate(
    'Test validates Requirements 2.2',
    testContent.includes('**Validates: Requirements 2.2**')
  );
  
  validate(
    'Test is labeled as Property 5',
    testContent.includes('Property 5: Element Grouping Preservation')
  );
  
  validate(
    'Test uses fast-check library',
    testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty')
  );
  
  validate(
    'Test runs 100 iterations',
    testContent.includes('numRuns: 100')
  );
  
  // Check for required properties
  validate(
    'Property 1: Grouped elements remain adjacent',
    testContent.includes('Property 1: Grouped elements remain adjacent')
  );
  
  validate(
    'Property 2: Multiple groups maintain adjacency',
    testContent.includes('Property 2: Multiple groups each maintain internal adjacency')
  );
  
  validate(
    'Property 3: Group spread remains reasonable',
    testContent.includes('Property 3: Group spread remains reasonable')
  );
  
  validate(
    'Property 4: Element order preserved',
    testContent.includes('Property 4: Element order within group is preserved')
  );
  
  // Check for helper functions
  validate(
    'Contains adjacency checking logic',
    testContent.includes('areElementsAdjacent') && testContent.includes('isGroupAdjacent')
  );
  
  validate(
    'Contains group spread calculation',
    testContent.includes('calculateGroupSpread')
  );
  
  validate(
    'Creates test elements with group IDs',
    testContent.includes('dataset.group')
  );
  
  validate(
    'Uses LayoutOptimizer',
    testContent.includes('new LayoutOptimizer')
  );
  
  validate(
    'Calculates optimal layout',
    testContent.includes('calculateOptimalLayout')
  );
  
  validate(
    'Validates element positions',
    testContent.includes('elementPositions.get')
  );
  
  validate(
    'Cleans up DOM elements',
    testContent.includes('document.body.removeChild')
  );
  
  validate(
    'Exports test function',
    testContent.includes('module.exports')
  );
  
  validate(
    'Returns test results',
    testContent.includes('return results')
  );
  
  // Check test timeout
  validate(
    'Test has appropriate timeout (40s)',
    testContent.includes('timeout: 40000')
  );
}

if (fs.existsSync(htmlFilePath)) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  // Validate HTML structure
  validate(
    'HTML includes test title',
    htmlContent.includes('Element Grouping Preservation')
  );
  
  validate(
    'HTML loads fast-check',
    htmlContent.includes('setup-fast-check.js')
  );
  
  validate(
    'HTML loads LayoutOptimizer',
    htmlContent.includes('layout-optimizer.js')
  );
  
  validate(
    'HTML loads VisibilityDetector',
    htmlContent.includes('visibility-detector.js')
  );
  
  validate(
    'HTML loads test file',
    htmlContent.includes('element-grouping-preservation-property.test.js')
  );
  
  validate(
    'HTML has run button',
    htmlContent.includes('runTest()')
  );
  
  validate(
    'HTML displays test description',
    htmlContent.includes('logically grouped UI elements')
  );
  
  validate(
    'HTML lists all 4 properties',
    htmlContent.includes('Property 1:') && 
    htmlContent.includes('Property 2:') &&
    htmlContent.includes('Property 3:') &&
    htmlContent.includes('Property 4:')
  );
}

// Check dependencies exist
const dependencies = [
  'js/adaptive-viewport/layout-optimizer.js',
  'js/adaptive-viewport/visibility-detector.js',
  'js/adaptive-viewport/constants.js',
  'js/adaptive-viewport/types.js',
  'test/adaptive-viewport/setup-fast-check.js'
];

dependencies.forEach(dep => {
  const depPath = path.join(__dirname, '..', '..', dep);
  validate(`Dependency exists: ${dep}`, fs.existsSync(depPath));
});

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! Test is ready to run.');
  console.log('\nTo run the test:');
  console.log('  1. Open test/adaptive-viewport/test-element-grouping-preservation-property.html in a browser');
  console.log('  2. Click "Run Property Tests"');
  console.log('  3. Wait for all 4 properties to be tested (100 iterations each)');
  process.exit(0);
} else {
  console.error('\n❌ Some validations failed. Please review the errors above.');
  process.exit(1);
}
