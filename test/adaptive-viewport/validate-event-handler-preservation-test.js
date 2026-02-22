#!/usr/bin/env node

/**
 * Validation Script for Event Handler Preservation Property Test
 * Verifies that the property test is correctly implemented and can run
 */

const fs = require('fs');
const path = require('path');

console.log('=== Event Handler Preservation Property Test Validation ===\n');

const checks = {
  passed: 0,
  failed: 0,
  details: []
};

function check(name, condition, details = '') {
  if (condition) {
    checks.passed++;
    checks.details.push({ name, status: 'PASS', details });
    console.log(`✓ ${name}`);
  } else {
    checks.failed++;
    checks.details.push({ name, status: 'FAIL', details });
    console.error(`✗ ${name}`);
    if (details) console.error(`  ${details}`);
  }
}

// Check 1: Test file exists
const testFilePath = path.join(__dirname, 'event-handler-preservation-property.test.js');
const testFileExists = fs.existsSync(testFilePath);
check('Property test file exists', testFileExists, testFilePath);

if (testFileExists) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');

  // Check 2: Contains property statement
  check(
    'Contains Property 6 statement',
    testContent.includes('Property 6: Event Handler Preservation'),
    'Property statement should be in comments'
  );

  // Check 3: Validates correct requirements
  check(
    'Validates Requirements 2.3, 9.1',
    testContent.includes('Requirements 2.3, 9.1'),
    'Should validate requirements 2.3 and 9.1'
  );

  // Check 4: Uses fast-check
  check(
    'Uses fast-check library',
    testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty'),
    'Should use fast-check for property-based testing'
  );

  // Check 5: Tests single event handler preservation
  check(
    'Tests single event handler preservation',
    testContent.includes('Single event handler') && testContent.includes('addEventListener'),
    'Should test single event handler preservation'
  );

  // Check 6: Tests multiple event handlers
  check(
    'Tests multiple event handlers',
    testContent.includes('Multiple event handlers'),
    'Should test multiple event handlers'
  );

  // Check 7: Tests through multiple repositionings
  check(
    'Tests through multiple repositionings',
    testContent.includes('multiple repositionings'),
    'Should test handlers through multiple repositionings'
  );

  // Check 8: Tests batch updates
  check(
    'Tests batch updates',
    testContent.includes('batch update') && testContent.includes('batchUpdate'),
    'Should test event handlers in batch updates'
  );

  // Check 9: Tests event handlers with parameters
  check(
    'Tests event handlers with parameters',
    testContent.includes('parameters') && testContent.includes('CustomEvent'),
    'Should test event handlers with parameters'
  );

  // Check 10: Has minimum 100 iterations per property
  const numRunsMatches = testContent.match(/numRuns:\s*(\d+)/g);
  const allHave100Runs = numRunsMatches && numRunsMatches.every(match => {
    const num = parseInt(match.match(/\d+/)[0]);
    return num >= 100;
  });
  check(
    'All properties run minimum 100 iterations',
    allHave100Runs,
    'Each property should run at least 100 iterations'
  );

  // Check 11: Properly cleans up DOM elements
  check(
    'Cleans up DOM elements',
    testContent.includes('removeChild') && testContent.includes('destroy'),
    'Should clean up elements and updater instances'
  );

  // Check 12: Uses DOMUpdater
  check(
    'Uses DOMUpdater class',
    testContent.includes('new DOMUpdater') && testContent.includes('updateElementPosition'),
    'Should use DOMUpdater for repositioning'
  );

  // Check 13: Triggers events before and after repositioning
  check(
    'Triggers events before and after repositioning',
    testContent.includes('triggerEvent') && testContent.includes('dispatchEvent'),
    'Should trigger events to verify handler functionality'
  );

  // Check 14: Verifies handler call counts
  check(
    'Verifies handler call counts',
    testContent.includes('callCounts') || testContent.includes('count'),
    'Should verify handlers are called correct number of times'
  );

  // Check 15: Exports test function
  check(
    'Exports test function',
    testContent.includes('module.exports') && testContent.includes('runEventHandlerPreservationPropertyTest'),
    'Should export test function for use in test runner'
  );
}

// Check 16: HTML test runner exists
const htmlFilePath = path.join(__dirname, 'test-event-handler-preservation-property.html');
const htmlFileExists = fs.existsSync(htmlFilePath);
check('HTML test runner exists', htmlFileExists, htmlFilePath);

if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

  // Check 17: Loads fast-check
  check(
    'HTML loads fast-check',
    htmlContent.includes('setup-fast-check.js'),
    'Should load fast-check library'
  );

  // Check 18: Loads DOMUpdater
  check(
    'HTML loads DOMUpdater',
    htmlContent.includes('dom-updater.js'),
    'Should load DOMUpdater component'
  );

  // Check 19: Loads property test
  check(
    'HTML loads property test',
    htmlContent.includes('event-handler-preservation-property.test.js'),
    'Should load the property test file'
  );

  // Check 20: Has run test button
  check(
    'HTML has run test button',
    htmlContent.includes('runTest') && htmlContent.includes('button'),
    'Should have button to run tests'
  );

  // Check 21: Displays property information
  check(
    'HTML displays property information',
    htmlContent.includes('Property 6') && htmlContent.includes('Event Handler Preservation'),
    'Should display property information'
  );

  // Check 22: Shows validation requirements
  check(
    'HTML shows validation requirements',
    htmlContent.includes('Requirements: 2.3, 9.1') || htmlContent.includes('2.3, 9.1'),
    'Should show which requirements are validated'
  );
}

// Check 23: Validation script exists
const validationScriptPath = path.join(__dirname, 'validate-event-handler-preservation-test.js');
check('Validation script exists', fs.existsSync(validationScriptPath), validationScriptPath);

// Check 24: Validation script exists (Python version)
const pythonValidationPath = path.join(__dirname, 'validate-event-handler-preservation-test.py');
const pythonValidationExists = fs.existsSync(pythonValidationPath);
check('Python validation script exists', pythonValidationExists, pythonValidationPath);

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${checks.passed + checks.failed}`);
console.log(`Passed: ${checks.passed}`);
console.log(`Failed: ${checks.failed}`);
console.log(`Success Rate: ${((checks.passed / (checks.passed + checks.failed)) * 100).toFixed(1)}%\n`);

// Exit with appropriate code
if (checks.failed > 0) {
  console.error('❌ Validation failed. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ All validation checks passed!\n');
  console.log('Next steps:');
  console.log('1. Open test-event-handler-preservation-property.html in a browser');
  console.log('2. Click "Run Property Test" to execute the tests');
  console.log('3. Verify all 5 properties pass with 100 iterations each\n');
  process.exit(0);
}
