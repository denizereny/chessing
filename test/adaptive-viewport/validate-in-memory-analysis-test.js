#!/usr/bin/env node

/**
 * Validation Script for In-Memory Analysis Property Test
 * Verifies that the test implementation is correct and complete
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('In-Memory Analysis Property Test Validation');
console.log('='.repeat(70));
console.log();

let validationsPassed = 0;
let validationsFailed = 0;
const issues = [];

/**
 * Validation 1: Test file exists and is readable
 */
console.log('Validation 1: Checking test file existence...');
const testFile = path.join(__dirname, 'in-memory-analysis-property.test.js');

if (fs.existsSync(testFile)) {
  console.log('  ✓ Test file exists');
  validationsPassed++;
} else {
  console.log('  ✗ Test file not found');
  issues.push('Test file missing: in-memory-analysis-property.test.js');
  validationsFailed++;
}

/**
 * Validation 2: HTML runner exists
 */
console.log('Validation 2: Checking HTML runner existence...');
const htmlRunner = path.join(__dirname, 'test-in-memory-analysis-property.html');

if (fs.existsSync(htmlRunner)) {
  console.log('  ✓ HTML runner exists');
  validationsPassed++;
} else {
  console.log('  ✗ HTML runner not found');
  issues.push('HTML runner missing: test-in-memory-analysis-property.html');
  validationsFailed++;
}

/**
 * Validation 3: Test file contains required property tests
 */
console.log('Validation 3: Checking test file content...');
if (fs.existsSync(testFile)) {
  const testContent = fs.readFileSync(testFile, 'utf8');
  
  const requiredElements = [
    { name: 'Property 1: No storage during initialization', pattern: /Property 1.*No storage.*initialization/i },
    { name: 'Property 2: No storage during visibility detection', pattern: /Property 2.*No storage.*visibility detection/i },
    { name: 'Property 3: No storage during refresh', pattern: /Property 3.*No storage.*refresh/i },
    { name: 'Property 4: No storage during observe/unobserve', pattern: /Property 4.*No storage.*observe/i },
    { name: 'Property 5: Visibility data accessible in-memory', pattern: /Property 5.*Visibility data.*in-memory/i },
    { name: 'StorageMonitor class', pattern: /class StorageMonitor/i },
    { name: 'localStorage monitoring', pattern: /localStorage\.setItem/i },
    { name: 'sessionStorage monitoring', pattern: /sessionStorage\.setItem/i },
    { name: 'IndexedDB monitoring', pattern: /indexedDB\.open/i },
    { name: 'fast-check assertions', pattern: /fc\.assert/i },
    { name: 'Validates Requirements 1.5', pattern: /Validates.*Requirements 1\.5/i }
  ];
  
  let allElementsFound = true;
  requiredElements.forEach(element => {
    if (testContent.match(element.pattern)) {
      console.log(`  ✓ Found: ${element.name}`);
    } else {
      console.log(`  ✗ Missing: ${element.name}`);
      issues.push(`Test file missing: ${element.name}`);
      allElementsFound = false;
    }
  });
  
  if (allElementsFound) {
    validationsPassed++;
  } else {
    validationsFailed++;
  }
} else {
  console.log('  ⊘ Skipped (test file not found)');
  validationsFailed++;
}

/**
 * Validation 4: HTML runner contains required elements
 */
console.log('Validation 4: Checking HTML runner content...');
if (fs.existsSync(htmlRunner)) {
  const htmlContent = fs.readFileSync(htmlRunner, 'utf8');
  
  const requiredElements = [
    { name: 'Property 3 title', pattern: /Property 3.*In-Memory Analysis/i },
    { name: 'Requirements 1.5 reference', pattern: /Requirements 1\.5/i },
    { name: 'fast-check script', pattern: /setup-fast-check\.js/i },
    { name: 'VisibilityDetector script', pattern: /visibility-detector\.js/i },
    { name: 'Test script', pattern: /in-memory-analysis-property\.test\.js/i },
    { name: 'Run test button', pattern: /runTest\(\)/i },
    { name: 'Test description', pattern: /in-memory.*without.*storage/i }
  ];
  
  let allElementsFound = true;
  requiredElements.forEach(element => {
    if (htmlContent.match(element.pattern)) {
      console.log(`  ✓ Found: ${element.name}`);
    } else {
      console.log(`  ✗ Missing: ${element.name}`);
      issues.push(`HTML runner missing: ${element.name}`);
      allElementsFound = false;
    }
  });
  
  if (allElementsFound) {
    validationsPassed++;
  } else {
    validationsFailed++;
  }
} else {
  console.log('  ⊘ Skipped (HTML runner not found)');
  validationsFailed++;
}

/**
 * Validation 5: Test runner script exists
 */
console.log('Validation 5: Checking test runner script...');
const runnerScript = path.join(__dirname, 'run-in-memory-analysis-test.js');

if (fs.existsSync(runnerScript)) {
  console.log('  ✓ Test runner script exists');
  validationsPassed++;
} else {
  console.log('  ✗ Test runner script not found');
  issues.push('Test runner script missing: run-in-memory-analysis-test.js');
  validationsFailed++;
}

/**
 * Validation 6: VisibilityDetector implementation exists
 */
console.log('Validation 6: Checking VisibilityDetector implementation...');
const detectorFile = path.join(__dirname, '../../js/adaptive-viewport/visibility-detector.js');

if (fs.existsSync(detectorFile)) {
  console.log('  ✓ VisibilityDetector implementation exists');
  
  const detectorContent = fs.readFileSync(detectorFile, 'utf8');
  
  // Check that it doesn't use storage
  const storagePatterns = [
    { name: 'localStorage usage', pattern: /localStorage\.(setItem|getItem|removeItem)/i, shouldNotExist: true },
    { name: 'sessionStorage usage', pattern: /sessionStorage\.(setItem|getItem|removeItem)/i, shouldNotExist: true },
    { name: 'IndexedDB usage', pattern: /indexedDB\.open/i, shouldNotExist: true },
    { name: 'File system access', pattern: /fs\.(writeFile|readFile|createWriteStream)/i, shouldNotExist: true }
  ];
  
  let noStorageUsed = true;
  storagePatterns.forEach(pattern => {
    const found = detectorContent.match(pattern.pattern);
    if (pattern.shouldNotExist && found) {
      console.log(`  ⚠ Warning: Found ${pattern.name} in implementation`);
      issues.push(`VisibilityDetector may use storage: ${pattern.name}`);
      noStorageUsed = false;
    }
  });
  
  if (noStorageUsed) {
    console.log('  ✓ No storage operations found in implementation');
    validationsPassed++;
  } else {
    console.log('  ⚠ Storage operations detected in implementation');
    validationsFailed++;
  }
} else {
  console.log('  ✗ VisibilityDetector implementation not found');
  issues.push('VisibilityDetector implementation missing');
  validationsFailed++;
}

/**
 * Validation 7: Test structure follows pattern
 */
console.log('Validation 7: Checking test structure...');
if (fs.existsSync(testFile)) {
  const testContent = fs.readFileSync(testFile, 'utf8');
  
  const structureChecks = [
    { name: '100 iterations per property', pattern: /numRuns:\s*100/i },
    { name: 'Async property tests', pattern: /fc\.asyncProperty/i },
    { name: 'Test cleanup', pattern: /detector\.destroy\(\)/i },
    { name: 'Element cleanup', pattern: /cleanupElements/i },
    { name: 'Results tracking', pattern: /results\.(passed|failed)/i },
    { name: 'Test summary', pattern: /Test Summary/i }
  ];
  
  let allChecksPass = true;
  structureChecks.forEach(check => {
    if (testContent.match(check.pattern)) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ Missing: ${check.name}`);
      issues.push(`Test structure issue: ${check.name}`);
      allChecksPass = false;
    }
  });
  
  if (allChecksPass) {
    validationsPassed++;
  } else {
    validationsFailed++;
  }
} else {
  console.log('  ⊘ Skipped (test file not found)');
  validationsFailed++;
}

/**
 * Print Summary
 */
console.log();
console.log('='.repeat(70));
console.log('Validation Summary');
console.log('='.repeat(70));
console.log();
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log();

if (validationsFailed === 0) {
  console.log('✅ ALL VALIDATIONS PASSED');
  console.log();
  console.log('The in-memory analysis property test is correctly implemented and ready to run.');
  console.log();
  console.log('Next Steps:');
  console.log('  1. Run the test using the HTML runner');
  console.log('  2. Verify all 5 properties pass');
  console.log('  3. Confirm no storage operations are detected');
  console.log('  4. Mark task 2.4 as complete');
  console.log();
  process.exit(0);
} else {
  console.log('❌ SOME VALIDATIONS FAILED');
  console.log();
  console.log('Issues Found:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  console.log();
  console.log('Please fix the issues above before running the test.');
  console.log();
  process.exit(1);
}
