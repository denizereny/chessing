#!/usr/bin/env node

/**
 * Validation script for visibility classification property test
 * Verifies test structure and requirements without running full test suite
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Visibility Classification Property Test ===\n');

const results = {
  passed: 0,
  failed: 0,
  checks: []
};

function check(name, condition, details = '') {
  if (condition) {
    results.passed++;
    results.checks.push({ name, status: 'PASS' });
    console.log(`✓ ${name}`);
    if (details) console.log(`  ${details}`);
  } else {
    results.failed++;
    results.checks.push({ name, status: 'FAIL' });
    console.log(`✗ ${name}`);
    if (details) console.log(`  ${details}`);
  }
}

// Check 1: Test file exists
const testFile = path.join(__dirname, 'visibility-classification-property.test.js');
check(
  'Test file exists',
  fs.existsSync(testFile),
  `Path: ${testFile}`
);

// Check 2: HTML runner exists
const htmlRunner = path.join(__dirname, 'test-visibility-classification-property.html');
check(
  'HTML test runner exists',
  fs.existsSync(htmlRunner),
  `Path: ${htmlRunner}`
);

// Check 3: Documentation exists
const docFile = path.join(__dirname, 'TASK_2.2_VISIBILITY_CLASSIFICATION_PROPERTY_TEST.md');
check(
  'Documentation file exists',
  fs.existsSync(docFile),
  `Path: ${docFile}`
);

// Check 4: Test file contains required properties
if (fs.existsSync(testFile)) {
  const testContent = fs.readFileSync(testFile, 'utf8');
  
  check(
    'Test validates Requirements 1.1, 1.2',
    testContent.includes('Requirements 1.1, 1.2'),
    'Found requirement validation comment'
  );
  
  check(
    'Test uses fast-check library',
    testContent.includes('fast-check') || testContent.includes('fc.assert'),
    'Found fast-check usage'
  );
  
  check(
    'Test has Property 1: Visibility classification',
    testContent.includes('Property 1') && testContent.includes('intersecting viewport'),
    'Found Property 1 test'
  );
  
  check(
    'Test has Property 2: Elements outside viewport',
    testContent.includes('Property 2') && testContent.includes('outside viewport'),
    'Found Property 2 test'
  );
  
  check(
    'Test has Property 3: Elements within viewport',
    testContent.includes('Property 3') && testContent.includes('within viewport'),
    'Found Property 3 test'
  );
  
  check(
    'Test has Property 4: Partially visible elements',
    testContent.includes('Property 4') && testContent.includes('Partially visible'),
    'Found Property 4 test'
  );
  
  check(
    'Test runs 100 iterations per property',
    testContent.includes('numRuns: 100'),
    'Found numRuns: 100 configuration'
  );
  
  check(
    'Test uses asyncProperty for async testing',
    testContent.includes('asyncProperty'),
    'Found asyncProperty usage for IntersectionObserver'
  );
  
  check(
    'Test includes oracle function',
    testContent.includes('elementIntersectsViewport'),
    'Found oracle function for expected behavior'
  );
  
  check(
    'Test creates actual DOM elements',
    testContent.includes('createElement') && testContent.includes('appendChild'),
    'Found DOM element creation'
  );
  
  check(
    'Test uses VisibilityDetector',
    testContent.includes('new VisibilityDetector'),
    'Found VisibilityDetector instantiation'
  );
  
  check(
    'Test cleans up resources',
    testContent.includes('destroy()') && testContent.includes('removeChild'),
    'Found cleanup code'
  );
}

// Check 5: HTML runner contains required elements
if (fs.existsSync(htmlRunner)) {
  const htmlContent = fs.readFileSync(htmlRunner, 'utf8');
  
  check(
    'HTML runner loads fast-check from CDN',
    htmlContent.includes('fast-check') && htmlContent.includes('cdn.jsdelivr.net'),
    'Found fast-check CDN link'
  );
  
  check(
    'HTML runner loads VisibilityDetector',
    htmlContent.includes('visibility-detector.js'),
    'Found VisibilityDetector script'
  );
  
  check(
    'HTML runner loads test file',
    htmlContent.includes('visibility-classification-property.test.js'),
    'Found test file script'
  );
  
  check(
    'HTML runner has run button',
    htmlContent.includes('runTests') || htmlContent.includes('Run'),
    'Found run button'
  );
  
  check(
    'HTML runner displays viewport info',
    htmlContent.includes('viewport') && htmlContent.includes('innerWidth'),
    'Found viewport display'
  );
}

// Check 6: Documentation contains required sections
if (fs.existsSync(docFile)) {
  const docContent = fs.readFileSync(docFile, 'utf8');
  
  check(
    'Documentation describes all 4 properties',
    docContent.includes('Property 1') && 
    docContent.includes('Property 2') &&
    docContent.includes('Property 3') &&
    docContent.includes('Property 4'),
    'Found all property descriptions'
  );
  
  check(
    'Documentation mentions 400 total test cases',
    docContent.includes('400'),
    'Found total test case count'
  );
  
  check(
    'Documentation validates Requirements 1.1, 1.2',
    docContent.includes('1.1') && docContent.includes('1.2'),
    'Found requirement validation'
  );
  
  check(
    'Documentation includes how to run tests',
    docContent.includes('How to Run'),
    'Found test execution instructions'
  );
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

if (results.failed === 0) {
  console.log('✅ All validation checks passed!');
  console.log('\nThe property test is properly structured and ready to run.');
  console.log('Open test/adaptive-viewport/test-visibility-classification-property.html in a browser to execute tests.\n');
  process.exit(0);
} else {
  console.log('❌ Some validation checks failed.');
  console.log('Please review the failed checks above.\n');
  process.exit(1);
}
