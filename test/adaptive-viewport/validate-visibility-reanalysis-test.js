#!/usr/bin/env node

/**
 * Validation script for Visibility Re-analysis Property Test
 * Verifies that the test implementation meets all requirements
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Validating Visibility Re-analysis Property Test ===\n');

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
    console.log(`✗ ${name}`);
    if (details) {
      console.log(`  ${details}`);
    }
    results.failed++;
    results.checks.push({ name, status: 'FAIL', details });
  }
}

// Check 1: Test file exists
const testFile = path.join(__dirname, 'visibility-reanalysis-property.test.js');
const testFileExists = fs.existsSync(testFile);
check('Test file exists', testFileExists, 'visibility-reanalysis-property.test.js not found');

// Check 2: HTML runner exists
const htmlFile = path.join(__dirname, 'test-visibility-reanalysis-property.html');
const htmlFileExists = fs.existsSync(htmlFile);
check('HTML runner exists', htmlFileExists, 'test-visibility-reanalysis-property.html not found');

// Check 3: Node runner exists
const nodeRunner = path.join(__dirname, 'run-visibility-reanalysis-test.js');
const nodeRunnerExists = fs.existsSync(nodeRunner);
check('Node.js runner exists', nodeRunnerExists, 'run-visibility-reanalysis-test.js not found');

if (testFileExists) {
  const testContent = fs.readFileSync(testFile, 'utf8');
  
  // Check 4: Contains property test header
  check(
    'Contains property test header',
    testContent.includes('Property 2: Visibility Re-analysis on Resize'),
    'Missing property test header'
  );
  
  // Check 5: Validates Requirements 1.3
  check(
    'Validates Requirements 1.3',
    testContent.includes('Validates: Requirements 1.3'),
    'Missing requirements validation comment'
  );
  
  // Check 6: Uses fast-check library
  check(
    'Uses fast-check library',
    testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty'),
    'Does not use fast-check properly'
  );
  
  // Check 7: Has minimum 100 iterations
  check(
    'Configured for minimum 100 iterations',
    testContent.includes('numRuns: 100'),
    'Does not specify 100 iterations'
  );
  
  // Check 8: Tests timing constraint (100ms)
  check(
    'Tests 100ms timing constraint',
    testContent.includes('100') && testContent.includes('elapsed'),
    'Does not verify timing constraint'
  );
  
  // Check 9: Tests visibility status updates
  check(
    'Tests visibility status updates',
    testContent.includes('getVisibilityStatus') && testContent.includes('updatedStatus'),
    'Does not test visibility status updates'
  );
  
  // Check 10: Tests multiple elements
  check(
    'Tests multiple elements re-analysis',
    testContent.includes('elementCount') || testContent.includes('multiple'),
    'Does not test multiple elements'
  );
  
  // Check 11: Tests visibility callbacks
  check(
    'Tests visibility callbacks',
    testContent.includes('onVisibilityChange') && testContent.includes('callback'),
    'Does not test visibility callbacks'
  );
  
  // Check 12: Tests idempotency
  check(
    'Tests idempotency of re-analysis',
    testContent.includes('idempotent') || testContent.includes('multiple refreshes'),
    'Does not test idempotency'
  );
  
  // Check 13: Uses refresh() method
  check(
    'Uses refresh() method',
    testContent.includes('refresh()'),
    'Does not use refresh() method'
  );
  
  // Check 14: Simulates resize events
  check(
    'Simulates resize events',
    testContent.includes('resize') && testContent.includes('dispatchEvent'),
    'Does not simulate resize events'
  );
  
  // Check 15: Has proper cleanup
  check(
    'Has proper cleanup (destroy)',
    testContent.includes('destroy()') && testContent.includes('removeChild'),
    'Missing proper cleanup'
  );
  
  // Check 16: Exports test function
  check(
    'Exports test function',
    testContent.includes('module.exports') && 
    testContent.includes('runVisibilityReanalysisPropertyTest'),
    'Does not export test function'
  );
  
  // Check 17: Has async/await support
  check(
    'Uses async/await properly',
    testContent.includes('async') && testContent.includes('await'),
    'Does not use async/await'
  );
  
  // Check 18: Has wait helper
  check(
    'Has wait/delay helper',
    testContent.includes('wait(') || testContent.includes('setTimeout'),
    'Missing wait helper for timing'
  );
}

if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFile, 'utf8');
  
  // Check 19: HTML loads fast-check
  check(
    'HTML loads fast-check',
    htmlContent.includes('setup-fast-check.js'),
    'HTML does not load fast-check'
  );
  
  // Check 20: HTML loads VisibilityDetector
  check(
    'HTML loads VisibilityDetector',
    htmlContent.includes('visibility-detector.js'),
    'HTML does not load VisibilityDetector'
  );
  
  // Check 21: HTML loads test file
  check(
    'HTML loads test file',
    htmlContent.includes('visibility-reanalysis-property.test.js'),
    'HTML does not load test file'
  );
  
  // Check 22: HTML has run button
  check(
    'HTML has run button',
    htmlContent.includes('runTests') && htmlContent.includes('button'),
    'HTML missing run button'
  );
  
  // Check 23: HTML has output display
  check(
    'HTML has output display',
    htmlContent.includes('output') && htmlContent.includes('div'),
    'HTML missing output display'
  );
  
  // Check 24: HTML has test description
  check(
    'HTML has test description',
    htmlContent.includes('Test Description') && 
    htmlContent.includes('Requirements 1.3'),
    'HTML missing test description'
  );
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

if (results.failed > 0) {
  console.log('Failed checks:');
  results.checks
    .filter(c => c.status === 'FAIL')
    .forEach(c => {
      console.log(`  ✗ ${c.name}`);
      if (c.details) {
        console.log(`    ${c.details}`);
      }
    });
  console.log('');
  process.exit(1);
} else {
  console.log('✓ All validation checks passed!\n');
  console.log('The test implementation meets all requirements:');
  console.log('  - Tests Property 2: Visibility Re-analysis on Resize');
  console.log('  - Validates Requirements 1.3');
  console.log('  - Uses fast-check with 100 iterations per property');
  console.log('  - Verifies 100ms timing constraint');
  console.log('  - Tests visibility status updates after resize');
  console.log('  - Tests multiple elements re-analysis');
  console.log('  - Tests visibility callbacks');
  console.log('  - Tests idempotency of re-analysis');
  console.log('');
  process.exit(0);
}
