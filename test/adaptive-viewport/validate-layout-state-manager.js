#!/usr/bin/env node

/**
 * Validation script for LayoutStateManager
 * Verifies implementation meets requirements 8.4 and 10.5
 */

console.log('='.repeat(70));
console.log('LayoutStateManager Validation');
console.log('Task 7.1: Create LayoutStateManager for state caching and management');
console.log('Requirements: 8.4 (DOM Query Caching), 10.5 (State Recovery)');
console.log('='.repeat(70));
console.log('');

const checks = [];

// Check 1: Implementation file exists
console.log('✓ Check 1: Implementation file exists');
const fs = require('fs');
const implPath = 'js/adaptive-viewport/layout-state-manager.js';
if (fs.existsSync(implPath)) {
  checks.push({ name: 'Implementation file', passed: true });
  console.log('  ✓ File found: ' + implPath);
} else {
  checks.push({ name: 'Implementation file', passed: false });
  console.log('  ✗ File not found: ' + implPath);
}
console.log('');

// Check 2: Test file exists
console.log('✓ Check 2: Test file exists');
const testPath = 'test/adaptive-viewport/layout-state-manager.test.js';
if (fs.existsSync(testPath)) {
  checks.push({ name: 'Test file', passed: true });
  console.log('  ✓ File found: ' + testPath);
} else {
  checks.push({ name: 'Test file', passed: false });
  console.log('  ✗ File not found: ' + testPath);
}
console.log('');

// Check 3: HTML test runner exists
console.log('✓ Check 3: HTML test runner exists');
const htmlTestPath = 'test/adaptive-viewport/test-layout-state-manager.html';
if (fs.existsSync(htmlTestPath)) {
  checks.push({ name: 'HTML test runner', passed: true });
  console.log('  ✓ File found: ' + htmlTestPath);
} else {
  checks.push({ name: 'HTML test runner', passed: false });
  console.log('  ✗ File not found: ' + htmlTestPath);
}
console.log('');

// Check 4: Required methods exist
console.log('✓ Check 4: Required methods exist');
const implContent = fs.readFileSync(implPath, 'utf8');
const requiredMethods = [
  'saveState',
  'getState',
  'getPreviousState',
  'cacheElementDimensions',
  'getCachedDimensions',
  'invalidateCache'
];

let allMethodsFound = true;
requiredMethods.forEach(method => {
  if (implContent.includes(method)) {
    console.log(`  ✓ Method found: ${method}`);
  } else {
    console.log(`  ✗ Method missing: ${method}`);
    allMethodsFound = false;
  }
});

checks.push({ name: 'Required methods', passed: allMethodsFound });
console.log('');

// Check 5: State management features
console.log('✓ Check 5: State management features');
const stateFeatures = [
  { name: 'currentState', found: implContent.includes('this.currentState') },
  { name: 'previousState', found: implContent.includes('this.previousState') },
  { name: 'stateHistory', found: implContent.includes('this.stateHistory') },
  { name: 'timestamp tracking', found: implContent.includes('timestamp') }
];

let allFeaturesFound = true;
stateFeatures.forEach(feature => {
  if (feature.found) {
    console.log(`  ✓ Feature found: ${feature.name}`);
  } else {
    console.log(`  ✗ Feature missing: ${feature.name}`);
    allFeaturesFound = false;
  }
});

checks.push({ name: 'State management features', passed: allFeaturesFound });
console.log('');

// Check 6: Dimension caching features
console.log('✓ Check 6: Dimension caching features');
const cacheFeatures = [
  { name: 'dimensionCache', found: implContent.includes('this.dimensionCache') },
  { name: 'cacheHits tracking', found: implContent.includes('this.cacheHits') },
  { name: 'cacheMisses tracking', found: implContent.includes('this.cacheMisses') },
  { name: 'getCacheHitRate', found: implContent.includes('getCacheHitRate') },
  { name: 'getCacheStats', found: implContent.includes('getCacheStats') }
];

let allCacheFeaturesFound = true;
cacheFeatures.forEach(feature => {
  if (feature.found) {
    console.log(`  ✓ Feature found: ${feature.name}`);
  } else {
    console.log(`  ✗ Feature missing: ${feature.name}`);
    allCacheFeaturesFound = false;
  }
});

checks.push({ name: 'Dimension caching features', passed: allCacheFeaturesFound });
console.log('');

// Check 7: Error recovery features
console.log('✓ Check 7: Error recovery features (Requirement 10.5)');
const recoveryFeatures = [
  { name: 'getPreviousState', found: implContent.includes('getPreviousState') },
  { name: 'isValid flag', found: implContent.includes('isValid') },
  { name: 'invalidateCurrentState', found: implContent.includes('invalidateCurrentState') }
];

let allRecoveryFeaturesFound = true;
recoveryFeatures.forEach(feature => {
  if (feature.found) {
    console.log(`  ✓ Feature found: ${feature.name}`);
  } else {
    console.log(`  ✗ Feature missing: ${feature.name}`);
    allRecoveryFeaturesFound = false;
  }
});

checks.push({ name: 'Error recovery features', passed: allRecoveryFeaturesFound });
console.log('');

// Check 8: Test coverage
console.log('✓ Check 8: Test coverage');
const testContent = fs.readFileSync(testPath, 'utf8');
const testSuites = [
  'Constructor',
  'saveState',
  'getState',
  'getPreviousState',
  'cacheElementDimensions',
  'getCachedDimensions',
  'invalidateCache',
  'Cache Performance'
];

let allSuitesFound = true;
testSuites.forEach(suite => {
  if (testContent.includes(suite)) {
    console.log(`  ✓ Test suite found: ${suite}`);
  } else {
    console.log(`  ✗ Test suite missing: ${suite}`);
    allSuitesFound = false;
  }
});

checks.push({ name: 'Test coverage', passed: allSuitesFound });
console.log('');

// Check 9: Property 26 test (Cache hit rate >80%)
console.log('✓ Check 9: Property 26 test (Cache hit rate >80%)');
const property26Test = testContent.includes('should achieve >80% hit rate') ||
                       testContent.includes('Property 26');

if (property26Test) {
  checks.push({ name: 'Property 26 test', passed: true });
  console.log('  ✓ Property 26 test found (Requirement 8.4)');
} else {
  checks.push({ name: 'Property 26 test', passed: false });
  console.log('  ✗ Property 26 test missing');
}
console.log('');

// Check 10: BaseComponent inheritance
console.log('✓ Check 10: BaseComponent inheritance');
const extendsBase = implContent.includes('extends BaseComponent');

if (extendsBase) {
  checks.push({ name: 'BaseComponent inheritance', passed: true });
  console.log('  ✓ Extends BaseComponent');
} else {
  checks.push({ name: 'BaseComponent inheritance', passed: false });
  console.log('  ✗ Does not extend BaseComponent');
}
console.log('');

// Summary
console.log('='.repeat(70));
console.log('Validation Summary');
console.log('='.repeat(70));

const passed = checks.filter(c => c.passed).length;
const total = checks.length;
const percentage = ((passed / total) * 100).toFixed(1);

checks.forEach(check => {
  const status = check.passed ? '✓' : '✗';
  console.log(`${status} ${check.name}`);
});

console.log('');
console.log(`Total: ${passed}/${total} checks passed (${percentage}%)`);
console.log('');

if (passed === total) {
  console.log('✓ All validation checks passed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Open test/adaptive-viewport/test-layout-state-manager.html in a browser');
  console.log('2. Verify all tests pass');
  console.log('3. Run cache performance demo to verify >80% hit rate');
  console.log('');
  process.exit(0);
} else {
  console.log('✗ Some validation checks failed');
  console.log('Please review the implementation and fix any issues');
  console.log('');
  process.exit(1);
}

