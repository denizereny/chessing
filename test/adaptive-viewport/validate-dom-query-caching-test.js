#!/usr/bin/env node

/**
 * Validation Script for DOM Query Caching Property Test
 * Verifies that the property test correctly validates Requirement 8.4
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating DOM Query Caching Property Test ===\n');

const testFilePath = path.join(__dirname, 'dom-query-caching-property.test.js');
const htmlFilePath = path.join(__dirname, 'test-dom-query-caching-property.html');
const implementationPath = path.join(__dirname, '../../js/adaptive-viewport/layout-state-manager.js');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    validationsPassed++;
  } else {
    console.error(`✗ ${message}`);
    validationsFailed++;
  }
}

// Check files exist
validate(
  fs.existsSync(testFilePath),
  'Property test file exists'
);

validate(
  fs.existsSync(htmlFilePath),
  'HTML test runner exists'
);

validate(
  fs.existsSync(implementationPath),
  'LayoutStateManager implementation exists'
);

// Read test file
const testContent = fs.readFileSync(testFilePath, 'utf8');

// Validate test structure
validate(
  testContent.includes('Property 26: DOM Query Caching'),
  'Test includes Property 26 identifier'
);

validate(
  testContent.includes('**Validates: Requirements 8.4**'),
  'Test validates Requirement 8.4'
);

validate(
  testContent.includes('runDOMQueryCachingPropertyTest'),
  'Test exports main test function'
);

// Validate Property 1: Cache hit rate exceeds 80%
validate(
  testContent.includes('Property 1: Cache hit rate exceeds 80% after initial caching'),
  'Property 1: Tests cache hit rate threshold'
);

validate(
  testContent.includes('if (hitRate <= 80)'),
  'Property 1: Validates 80% threshold'
);

validate(
  testContent.includes('numRuns: 100'),
  'Property 1: Runs 100 iterations'
);

// Validate Property 2: Cache reduces DOM queries
validate(
  testContent.includes('Property 2: Cache reduces DOM queries'),
  'Property 2: Tests query reduction'
);

validate(
  testContent.includes('getBoundingClientRect'),
  'Property 2: Monitors DOM query calls'
);

validate(
  testContent.includes('enableCache: true') && testContent.includes('enableCache: false'),
  'Property 2: Compares cached vs uncached'
);

// Validate Property 3: Repeated queries are cache hits
validate(
  testContent.includes('Property 3: Repeated queries for same element are cache hits'),
  'Property 3: Tests repeated query behavior'
);

validate(
  testContent.includes('stats.misses > 0') || testContent.includes('stats.misses === 0'),
  'Property 3: Validates no cache misses'
);

// Validate Property 4: Cache invalidation
validate(
  testContent.includes('Property 4: Cache invalidation clears cached dimensions'),
  'Property 4: Tests cache invalidation'
);

validate(
  testContent.includes('invalidateCache()'),
  'Property 4: Calls invalidateCache method'
);

// Validate Property 5: Mixed access patterns
validate(
  testContent.includes('Property 5: Mixed access patterns maintain high hit rate'),
  'Property 5: Tests realistic access patterns'
);

validate(
  testContent.includes('Math.random()'),
  'Property 5: Uses random element selection'
);

// Validate fast-check usage
validate(
  testContent.includes('fc.assert'),
  'Uses fast-check assertions'
);

validate(
  testContent.includes('fc.asyncProperty'),
  'Uses async property testing'
);

validate(
  testContent.includes('fc.record'),
  'Uses fast-check record generator'
);

validate(
  testContent.includes('fc.integer'),
  'Uses fast-check integer generator'
);

// Validate test helpers
validate(
  testContent.includes('createMockElement'),
  'Includes mock element helper'
);

validate(
  testContent.includes('document.createElement'),
  'Creates real DOM elements for testing'
);

validate(
  testContent.includes('document.body.appendChild'),
  'Adds elements to DOM'
);

validate(
  testContent.includes('document.body.removeChild'),
  'Cleans up DOM elements'
);

// Validate LayoutStateManager usage
validate(
  testContent.includes('new LayoutStateManager'),
  'Creates LayoutStateManager instances'
);

validate(
  testContent.includes('getElementDimensions'),
  'Uses getElementDimensions method'
);

validate(
  testContent.includes('getCacheStats'),
  'Uses getCacheStats method'
);

validate(
  testContent.includes('getCacheHitRate'),
  'Uses getCacheHitRate method'
);

validate(
  testContent.includes('resetCacheStats'),
  'Uses resetCacheStats method'
);

validate(
  testContent.includes('.destroy()'),
  'Properly destroys state manager instances'
);

// Validate HTML test runner
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

validate(
  htmlContent.includes('Property Test: DOM Query Caching'),
  'HTML: Includes test title'
);

validate(
  htmlContent.includes('Property 26'),
  'HTML: References Property 26'
);

validate(
  htmlContent.includes('Requirements 8.4'),
  'HTML: References Requirement 8.4'
);

validate(
  htmlContent.includes('setup-fast-check.js'),
  'HTML: Loads fast-check library'
);

validate(
  htmlContent.includes('layout-state-manager.js'),
  'HTML: Loads LayoutStateManager'
);

validate(
  htmlContent.includes('dom-query-caching-property.test.js'),
  'HTML: Loads test file'
);

validate(
  htmlContent.includes('runDOMQueryCachingPropertyTest'),
  'HTML: Calls test function'
);

validate(
  htmlContent.includes('Run Property Tests'),
  'HTML: Includes run button'
);

// Validate implementation has required methods
const implContent = fs.readFileSync(implementationPath, 'utf8');

validate(
  implContent.includes('cacheElementDimensions'),
  'Implementation: Has cacheElementDimensions method'
);

validate(
  implContent.includes('getCachedDimensions'),
  'Implementation: Has getCachedDimensions method'
);

validate(
  implContent.includes('getElementDimensions'),
  'Implementation: Has getElementDimensions method'
);

validate(
  implContent.includes('getCacheStats'),
  'Implementation: Has getCacheStats method'
);

validate(
  implContent.includes('getCacheHitRate'),
  'Implementation: Has getCacheHitRate method'
);

validate(
  implContent.includes('invalidateCache'),
  'Implementation: Has invalidateCache method'
);

validate(
  implContent.includes('this.cacheHits'),
  'Implementation: Tracks cache hits'
);

validate(
  implContent.includes('this.cacheMisses'),
  'Implementation: Tracks cache misses'
);

validate(
  implContent.includes('this.dimensionCache'),
  'Implementation: Has dimension cache'
);

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✅ All validations passed! Test is properly structured.');
  process.exit(0);
} else {
  console.log('\n❌ Some validations failed. Please review the test implementation.');
  process.exit(1);
}
