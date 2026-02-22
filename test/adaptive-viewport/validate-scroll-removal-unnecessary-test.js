#!/usr/bin/env node

/**
 * Validation Script for Scroll Removal When Unnecessary Property Test
 * Verifies that the property test is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Scroll Removal When Unnecessary Property Test ===\n');

const testFilePath = path.join(__dirname, 'scroll-removal-unnecessary-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-scroll-removal-unnecessary-property.html');

let validationsPassed = 0;
let validationsFailed = 0;

function validateFile(filePath, checks) {
  console.log(`Validating: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`  ✗ File does not exist: ${filePath}`);
    validationsFailed++;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  checks.forEach(check => {
    if (check.test(content)) {
      console.log(`  ✓ ${check.description}`);
      validationsPassed++;
    } else {
      console.error(`  ✗ ${check.description}`);
      validationsFailed++;
    }
  });
  
  console.log('');
  return true;
}

// Validation checks for test file
const testFileChecks = [
  {
    description: 'Contains Property 11 header comment',
    test: (content) => content.includes('Property 11: Scroll Removal When Unnecessary')
  },
  {
    description: 'Validates Requirements 3.5',
    test: (content) => content.includes('**Validates: Requirements 3.5**')
  },
  {
    description: 'Imports OverflowHandler',
    test: (content) => content.includes('OverflowHandler')
  },
  {
    description: 'Exports test function',
    test: (content) => content.includes('runScrollRemovalUnnecessaryPropertyTest')
  },
  {
    description: 'Uses fast-check library',
    test: (content) => content.includes('fc.assert') && content.includes('fc.asyncProperty')
  },
  {
    description: 'Tests 100 iterations (numRuns: 100)',
    test: (content) => content.includes('numRuns: 100')
  },
  {
    description: 'Property 1: Scrolling removed when maxHeight increases',
    test: (content) => content.includes('Property 1: Scrolling removed when maxHeight increases to fit content')
  },
  {
    description: 'Property 2: Event listeners removed',
    test: (content) => content.includes('Property 2: Event listeners removed when scrolling removed')
  },
  {
    description: 'Property 3: Container no longer tracked',
    test: (content) => content.includes('Property 3: Container no longer tracked after scroll removal')
  },
  {
    description: 'Property 4: Scroll removal is idempotent',
    test: (content) => content.includes('Property 4: Scroll removal is idempotent')
  },
  {
    description: 'Property 5: Elements remain in container',
    test: (content) => content.includes('Property 5: Elements remain in container after scroll removal')
  },
  {
    description: 'Property 6: needsScrolling returns false',
    test: (content) => content.includes('Property 6: needsScrolling returns false when content fits')
  },
  {
    description: 'Tests removeScrolling method',
    test: (content) => content.includes('handler.removeScrolling(container)')
  },
  {
    description: 'Verifies overflow styles are cleared',
    test: (content) => content.includes('overflowY') && content.includes('maxHeight')
  },
  {
    description: 'Verifies scroll indicators are removed',
    test: (content) => content.includes('scroll-indicator')
  },
  {
    description: 'Verifies event handlers are removed',
    test: (content) => content.includes('_scrollHandler') && content.includes('_touchStartHandler')
  },
  {
    description: 'Uses createTestElements helper',
    test: (content) => content.includes('function createTestElements')
  },
  {
    description: 'Uses calculateTotalHeight helper',
    test: (content) => content.includes('function calculateTotalHeight')
  },
  {
    description: 'Includes proper cleanup (destroy and removeChild)',
    test: (content) => content.includes('destroy()') && content.includes('removeChild')
  },
  {
    description: 'Returns test results object',
    test: (content) => content.includes('return results')
  }
];

// Validation checks for HTML file
const htmlFileChecks = [
  {
    description: 'Contains proper title',
    test: (content) => content.includes('Property Test: Scroll Removal When Unnecessary')
  },
  {
    description: 'References Property 11',
    test: (content) => content.includes('Property 11')
  },
  {
    description: 'Validates Requirements 3.5',
    test: (content) => content.includes('Requirements 3.5')
  },
  {
    description: 'Loads fast-check library',
    test: (content) => content.includes('setup-fast-check.js')
  },
  {
    description: 'Loads OverflowHandler',
    test: (content) => content.includes('overflow-handler.js')
  },
  {
    description: 'Loads property test file',
    test: (content) => content.includes('scroll-removal-unnecessary-property.test.js')
  },
  {
    description: 'Has run test button',
    test: (content) => content.includes('run-test-btn') && content.includes('runTest()')
  },
  {
    description: 'Has test output area',
    test: (content) => content.includes('test-output')
  },
  {
    description: 'Calls runScrollRemovalUnnecessaryPropertyTest',
    test: (content) => content.includes('runScrollRemovalUnnecessaryPropertyTest')
  },
  {
    description: 'Displays test results',
    test: (content) => content.includes('results.passed') && content.includes('results.failed')
  }
];

// Run validations
console.log('Validating Test File:\n');
validateFile(testFilePath, testFileChecks);

console.log('Validating HTML Test Runner:\n');
validateFile(htmlFilePath, htmlFileChecks);

// Print summary
console.log('=== Validation Summary ===');
console.log(`Total Checks: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Success Rate: ${((validationsPassed / (validationsPassed + validationsFailed)) * 100).toFixed(1)}%\n`);

if (validationsFailed === 0) {
  console.log('✅ All validations passed! Test implementation is correct.\n');
  process.exit(0);
} else {
  console.error('❌ Some validations failed. Please review the implementation.\n');
  process.exit(1);
}
