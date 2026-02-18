#!/usr/bin/env node

/**
 * Validation Script for Content-Aware Breakpoints Property Test
 * Verifies that the test file is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Content-Aware Breakpoints Property Test Implementation\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function pass(message) {
  console.log(`✅ ${message}`);
  checks.passed++;
}

function fail(message) {
  console.error(`❌ ${message}`);
  checks.failed++;
}

function warn(message) {
  console.warn(`⚠️  ${message}`);
  checks.warnings++;
}

// Check 1: Test file exists
const testFile = path.join(__dirname, 'content-aware-breakpoints-property.test.js');
if (fs.existsSync(testFile)) {
  pass('Test file exists: content-aware-breakpoints-property.test.js');
} else {
  fail('Test file not found: content-aware-breakpoints-property.test.js');
  process.exit(1);
}

// Check 2: HTML runner exists
const htmlFile = path.join(__dirname, 'test-content-aware-breakpoints-property.html');
if (fs.existsSync(htmlFile)) {
  pass('HTML test runner exists: test-content-aware-breakpoints-property.html');
} else {
  fail('HTML test runner not found: test-content-aware-breakpoints-property.html');
}

// Check 3: Node.js runner exists
const nodeRunner = path.join(__dirname, 'run-content-aware-breakpoints-test.js');
if (fs.existsSync(nodeRunner)) {
  pass('Node.js test runner exists: run-content-aware-breakpoints-test.js');
} else {
  warn('Node.js test runner not found: run-content-aware-breakpoints-test.js');
}

// Read test file content
const testContent = fs.readFileSync(testFile, 'utf8');

// Check 4: Property annotation
if (testContent.includes('Property 19: Content-Aware Breakpoints')) {
  pass('Test has correct property annotation');
} else {
  fail('Test missing property annotation');
}

// Check 5: Requirements validation
if (testContent.includes('Validates: Requirements 6.1')) {
  pass('Test validates correct requirement (6.1)');
} else {
  fail('Test does not validate requirement 6.1');
}

// Check 6: fast-check usage
if (testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty')) {
  pass('Test uses fast-check library correctly');
} else {
  fail('Test does not use fast-check properly');
}

// Check 7: Minimum iterations (100)
const numRunsMatches = testContent.match(/numRuns:\s*(\d+)/g);
if (numRunsMatches && numRunsMatches.length > 0) {
  const allHave100 = numRunsMatches.every(match => {
    const num = parseInt(match.match(/\d+/)[0]);
    return num >= 100;
  });
  if (allHave100) {
    pass(`Test runs minimum 100 iterations per property (found ${numRunsMatches.length} properties)`);
  } else {
    fail('Some properties run less than 100 iterations');
  }
} else {
  fail('Could not find numRuns configuration');
}

// Check 8: Multiple properties tested
const propertyTests = testContent.match(/Property \d+:/g);
if (propertyTests && propertyTests.length >= 3) {
  pass(`Test includes ${propertyTests.length} distinct properties`);
} else {
  warn(`Test includes only ${propertyTests ? propertyTests.length : 0} properties (recommended: 3+)`);
}

// Check 9: Content-aware logic
const contentAwareChecks = [
  'calculateContentBasedBreakpoint',
  'isLayoutStrategyContentAware',
  'element dimensions',
  'board size'
];

let contentAwareCount = 0;
contentAwareChecks.forEach(check => {
  if (testContent.toLowerCase().includes(check.toLowerCase())) {
    contentAwareCount++;
  }
});

if (contentAwareCount >= 3) {
  pass('Test includes content-aware breakpoint logic');
} else {
  warn('Test may not fully verify content-aware behavior');
}

// Check 10: Proper cleanup
if (testContent.includes('document.body.removeChild') && testContent.includes('destroy')) {
  pass('Test includes proper cleanup of DOM elements');
} else {
  warn('Test may not properly clean up DOM elements');
}

// Check 11: Error handling
if (testContent.includes('try') && testContent.includes('catch')) {
  pass('Test includes error handling');
} else {
  warn('Test may not handle errors properly');
}

// Check 12: Export for module usage
if (testContent.includes('module.exports')) {
  pass('Test exports function for module usage');
} else {
  warn('Test does not export function (may not work in Node.js)');
}

// Check 13: Validates non-fixed breakpoints
if (testContent.includes('768') || testContent.includes('1024')) {
  if (testContent.includes('!==') || testContent.includes('filter')) {
    pass('Test explicitly avoids standard fixed breakpoints');
  } else {
    warn('Test mentions standard breakpoints but may not avoid them');
  }
} else {
  warn('Test does not explicitly check for non-fixed breakpoints');
}

// Check 14: Tests element dimension variations
if (testContent.includes('elementWidth') && testContent.includes('boardSize')) {
  pass('Test varies element dimensions and board size');
} else {
  fail('Test does not vary element dimensions');
}

// Check 15: Tests visibility impact
if (testContent.includes('invisibleElements') || testContent.includes('visibility')) {
  pass('Test considers element visibility');
} else {
  fail('Test does not consider element visibility');
}

// Read HTML file content
const htmlContent = fs.readFileSync(htmlFile, 'utf8');

// Check 16: HTML loads dependencies
const requiredScripts = [
  'setup-fast-check.js',
  'layout-optimizer.js',
  'visibility-detector.js',
  'content-aware-breakpoints-property.test.js'
];

let scriptsLoaded = 0;
requiredScripts.forEach(script => {
  if (htmlContent.includes(script)) {
    scriptsLoaded++;
  }
});

if (scriptsLoaded === requiredScripts.length) {
  pass('HTML runner loads all required dependencies');
} else {
  fail(`HTML runner missing ${requiredScripts.length - scriptsLoaded} dependencies`);
}

// Check 17: HTML has run button
if (htmlContent.includes('runTest()') && htmlContent.includes('button')) {
  pass('HTML runner has interactive controls');
} else {
  warn('HTML runner may not have interactive controls');
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(60));

if (checks.failed > 0) {
  console.log('\n❌ Validation failed. Please fix the issues above.');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('\n⚠️  Validation passed with warnings. Consider addressing them.');
  process.exit(0);
} else {
  console.log('\n✅ All validation checks passed!');
  process.exit(0);
}
