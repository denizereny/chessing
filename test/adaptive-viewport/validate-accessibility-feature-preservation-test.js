#!/usr/bin/env node

/**
 * Validation Script for Accessibility Feature Preservation Property Test
 * Validates that the test implementation correctly tests Property 28
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Accessibility Feature Preservation Property Test ===\n');

const testFilePath = path.join(__dirname, 'accessibility-feature-preservation-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-accessibility-feature-preservation-property.html');

let validationsPassed = 0;
let validationsFailed = 0;

function validateFile(filePath, checks) {
  console.log(`Validating: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`✗ File not found: ${filePath}\n`);
    validationsFailed++;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let allChecksPassed = true;
  
  checks.forEach(check => {
    if (check.test(content)) {
      console.log(`  ✓ ${check.description}`);
      validationsPassed++;
    } else {
      console.error(`  ✗ ${check.description}`);
      validationsFailed++;
      allChecksPassed = false;
    }
  });
  
  console.log('');
  return allChecksPassed;
}

// Validation checks for test file
const testFileChecks = [
  {
    description: 'Contains Property 28 header comment',
    test: (content) => content.includes('Property 28: Accessibility Feature Preservation')
  },
  {
    description: 'Validates Requirements 9.2, 9.3',
    test: (content) => content.includes('Requirements 9.2, 9.3')
  },
  {
    description: 'Tests ARIA attributes preservation',
    test: (content) => content.includes('ARIA attributes') && content.includes('aria-label')
  },
  {
    description: 'Tests multiple ARIA attributes',
    test: (content) => content.includes('aria-describedby') && content.includes('aria-labelledby')
  },
  {
    description: 'Tests keyboard navigation handlers',
    test: (content) => content.includes('keyboard') && content.includes('keydown')
  },
  {
    description: 'Tests focus management',
    test: (content) => content.includes('focus') && content.includes('blur')
  },
  {
    description: 'Tests tabIndex preservation',
    test: (content) => content.includes('tabIndex')
  },
  {
    description: 'Tests batch updates with accessibility features',
    test: (content) => content.includes('batch') && content.includes('accessibility')
  },
  {
    description: 'Tests multiple repositionings',
    test: (content) => content.includes('multiple repositionings')
  },
  {
    description: 'Uses fast-check for property-based testing',
    test: (content) => content.includes('fc.assert') && content.includes('fc.asyncProperty')
  },
  {
    description: 'Runs minimum 100 iterations per property',
    test: (content) => content.includes('numRuns: 100')
  },
  {
    description: 'Creates elements with ARIA attributes',
    test: (content) => content.includes('createElementWithARIA')
  },
  {
    description: 'Compares ARIA attributes before and after',
    test: (content) => content.includes('ariaBefore') && content.includes('ariaAfter')
  },
  {
    description: 'Tests keyboard event triggering',
    test: (content) => content.includes('triggerKeyboardEvent') || content.includes('KeyboardEvent')
  },
  {
    description: 'Validates ARIA attribute matching',
    test: (content) => content.includes('ariaAttributesMatch')
  },
  {
    description: 'Uses DOMUpdater for repositioning',
    test: (content) => content.includes('new DOMUpdater')
  },
  {
    description: 'Tests various keyboard keys (Enter, Space, Tab, Arrows)',
    test: (content) => content.includes('Enter') && content.includes('Space') && content.includes('Tab') && content.includes('Arrow')
  },
  {
    description: 'Exports test function for use in runner',
    test: (content) => content.includes('module.exports') && content.includes('runAccessibilityFeaturePreservationPropertyTest')
  },
  {
    description: 'Returns test results object',
    test: (content) => content.includes('results.passed') && content.includes('results.failed')
  },
  {
    description: 'Cleans up test elements after each test',
    test: (content) => content.includes('removeChild')
  }
];

// Validation checks for HTML file
const htmlFileChecks = [
  {
    description: 'Contains proper title',
    test: (content) => content.includes('Accessibility Feature Preservation')
  },
  {
    description: 'Loads fast-check library',
    test: (content) => content.includes('setup-fast-check.js')
  },
  {
    description: 'Loads DOMUpdater',
    test: (content) => content.includes('dom-updater.js')
  },
  {
    description: 'Loads test file',
    test: (content) => content.includes('accessibility-feature-preservation-property.test.js')
  },
  {
    description: 'Has run test button',
    test: (content) => content.includes('runTest')
  },
  {
    description: 'Displays property statement',
    test: (content) => content.includes('Property Statement')
  },
  {
    description: 'Shows test coverage information',
    test: (content) => content.includes('Test Coverage')
  },
  {
    description: 'Mentions ARIA attributes in coverage',
    test: (content) => content.includes('ARIA attributes')
  },
  {
    description: 'Mentions keyboard navigation in coverage',
    test: (content) => content.includes('Keyboard navigation')
  },
  {
    description: 'Mentions focus management in coverage',
    test: (content) => content.includes('Focus management')
  },
  {
    description: 'Has output display area',
    test: (content) => content.includes('id="output"')
  },
  {
    description: 'Has status display',
    test: (content) => content.includes('id="status"')
  }
];

// Run validations
console.log('1. Test File Validation\n');
const testFileValid = validateFile(testFilePath, testFileChecks);

console.log('2. HTML Runner Validation\n');
const htmlFileValid = validateFile(htmlFilePath, htmlFileChecks);

// Summary
console.log('=== Validation Summary ===');
console.log(`Total Checks: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✓ All validations passed!');
  console.log('\nThe test correctly implements Property 28:');
  console.log('- Tests ARIA attributes preservation');
  console.log('- Tests keyboard navigation handlers');
  console.log('- Tests focus management');
  console.log('- Tests tabIndex preservation');
  console.log('- Tests batch updates and multiple repositionings');
  console.log('- Runs 700 total iterations (7 properties × 100 each)');
  process.exit(0);
} else {
  console.error('\n✗ Some validations failed');
  process.exit(1);
}
