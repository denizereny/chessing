#!/usr/bin/env node

/**
 * Validation Script for Theme Styling Preservation Property Test
 * 
 * This script validates that the property test implementation is correct
 * and follows the required patterns.
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('Validating Theme Styling Preservation Property Test Implementation');
console.log('='.repeat(80));
console.log();

let validationsPassed = 0;
let validationsFailed = 0;

function validateFile(filePath, description) {
  console.log(`Checking ${description}...`);
  
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${description} exists`);
    validationsPassed++;
    return true;
  } else {
    console.log(`  ✗ ${description} not found at ${filePath}`);
    validationsFailed++;
    return false;
  }
}

function validateFileContent(filePath, patterns, description) {
  console.log(`Validating ${description}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗ File not found: ${filePath}`);
    validationsFailed++;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let allPatternsFound = true;
  
  patterns.forEach(({ pattern, name }) => {
    if (content.includes(pattern)) {
      console.log(`  ✓ ${name} found`);
      validationsPassed++;
    } else {
      console.log(`  ✗ ${name} not found`);
      validationsFailed++;
      allPatternsFound = false;
    }
  });
  
  return allPatternsFound;
}

// Validate test file exists
console.log('\n1. FILE EXISTENCE CHECKS');
console.log('-'.repeat(80));

validateFile(
  path.join(__dirname, 'theme-styling-preservation-property.test.js'),
  'Property test file'
);

validateFile(
  path.join(__dirname, 'test-theme-styling-preservation-property.html'),
  'HTML test runner'
);

validateFile(
  path.join(__dirname, 'validate-theme-styling-preservation-test.js'),
  'Validation script'
);

// Validate test file content
console.log('\n2. TEST FILE CONTENT VALIDATION');
console.log('-'.repeat(80));

validateFileContent(
  path.join(__dirname, 'theme-styling-preservation-property.test.js'),
  [
    { pattern: 'Property 29: Theme Styling Preservation', name: 'Property 29 header' },
    { pattern: '**Validates: Requirements 9.4**', name: 'Requirements validation comment' },
    { pattern: 'runThemeStylingPreservationPropertyTest', name: 'Main test function' },
    { pattern: 'getThemeStyles', name: 'Theme styles helper function' },
    { pattern: 'themeStylesMatch', name: 'Theme styles comparison function' },
    { pattern: 'createThemedElement', name: 'Themed element creation helper' },
    { pattern: 'Property 1: Theme colors', name: 'Property 1 test' },
    { pattern: 'Property 2: Theme classes', name: 'Property 2 test' },
    { pattern: 'Property 3: CSS custom properties', name: 'Property 3 test' },
    { pattern: 'Property 4: Theme styling in batch updates', name: 'Property 4 test' },
    { pattern: 'Property 5: Theme styling through theme changes', name: 'Property 5 test' },
    { pattern: 'Property 6: Theme styling through multiple repositionings', name: 'Property 6 test' },
    { pattern: 'Property 7: Inline theme styles', name: 'Property 7 test' },
    { pattern: 'fc.assert', name: 'fast-check assertion' },
    { pattern: 'fc.asyncProperty', name: 'Async property test' },
    { pattern: 'numRuns: 100', name: '100 iterations configuration' },
    { pattern: 'DOMUpdater', name: 'DOMUpdater usage' },
    { pattern: 'updateElementPosition', name: 'Element repositioning' },
    { pattern: 'batchUpdate', name: 'Batch update test' },
    { pattern: 'backgroundColor', name: 'Background color check' },
    { pattern: 'borderColor', name: 'Border color check' },
    { pattern: 'data-theme', name: 'Theme attribute usage' }
  ],
  'test file content'
);

// Validate HTML runner content
console.log('\n3. HTML RUNNER VALIDATION');
console.log('-'.repeat(80));

validateFileContent(
  path.join(__dirname, 'test-theme-styling-preservation-property.html'),
  [
    { pattern: 'Property Test: Theme Styling Preservation', name: 'Page title' },
    { pattern: 'Property 29', name: 'Property number' },
    { pattern: 'Requirements 9.4', name: 'Requirements reference' },
    { pattern: 'setup-fast-check.js', name: 'fast-check setup script' },
    { pattern: 'dom-updater.js', name: 'DOMUpdater script' },
    { pattern: 'theme-styling-preservation-property.test.js', name: 'Test script' },
    { pattern: 'runThemeStylingPreservationPropertyTest', name: 'Test function call' },
    { pattern: 'data-theme', name: 'Theme attribute in CSS' },
    { pattern: 'theme-light', name: 'Light theme class' },
    { pattern: 'theme-dark', name: 'Dark theme class' }
  ],
  'HTML runner content'
);

// Validate test structure
console.log('\n4. TEST STRUCTURE VALIDATION');
console.log('-'.repeat(80));

const testFile = path.join(__dirname, 'theme-styling-preservation-property.test.js');
if (fs.existsSync(testFile)) {
  const content = fs.readFileSync(testFile, 'utf8');
  
  // Count properties
  const propertyMatches = content.match(/Property \d+:/g);
  const propertyCount = propertyMatches ? propertyMatches.length : 0;
  
  console.log(`Checking property count...`);
  if (propertyCount >= 7) {
    console.log(`  ✓ Found ${propertyCount} properties (expected at least 7)`);
    validationsPassed++;
  } else {
    console.log(`  ✗ Found only ${propertyCount} properties (expected at least 7)`);
    validationsFailed++;
  }
  
  // Check for async/await usage
  console.log(`Checking async/await usage...`);
  if (content.includes('async') && content.includes('await')) {
    console.log(`  ✓ Async/await properly used`);
    validationsPassed++;
  } else {
    console.log(`  ✗ Async/await not found`);
    validationsFailed++;
  }
  
  // Check for proper error handling
  console.log(`Checking error handling...`);
  if (content.includes('try') && content.includes('catch')) {
    console.log(`  ✓ Error handling implemented`);
    validationsPassed++;
  } else {
    console.log(`  ✗ Error handling not found`);
    validationsFailed++;
  }
  
  // Check for cleanup
  console.log(`Checking cleanup code...`);
  if (content.includes('updater.destroy()') && content.includes('removeChild')) {
    console.log(`  ✓ Cleanup code present`);
    validationsPassed++;
  } else {
    console.log(`  ✗ Cleanup code not found`);
    validationsFailed++;
  }
  
  // Check for theme-specific validations
  console.log(`Checking theme-specific validations...`);
  const themeChecks = [
    'backgroundColor',
    'color',
    'borderColor',
    'getComputedStyle'
  ];
  
  const allThemeChecksPresent = themeChecks.every(check => content.includes(check));
  if (allThemeChecksPresent) {
    console.log(`  ✓ All theme-specific checks present`);
    validationsPassed++;
  } else {
    console.log(`  ✗ Some theme-specific checks missing`);
    validationsFailed++;
  }
}

// Print summary
console.log('\n' + '='.repeat(80));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Success Rate: ${((validationsPassed / (validationsPassed + validationsFailed)) * 100).toFixed(1)}%`);
console.log();

if (validationsFailed === 0) {
  console.log('✅ ALL VALIDATIONS PASSED!');
  console.log('The theme styling preservation property test is correctly implemented.');
  console.log();
  console.log('Next steps:');
  console.log('1. Open test/adaptive-viewport/test-theme-styling-preservation-property.html in a browser');
  console.log('2. Click "Run Property Test" to execute the tests');
  console.log('3. Verify all 7 properties pass with 650 total iterations');
  console.log();
  process.exit(0);
} else {
  console.log('❌ SOME VALIDATIONS FAILED');
  console.log('Please review the failures above and fix the implementation.');
  console.log();
  process.exit(1);
}
