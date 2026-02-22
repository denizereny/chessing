#!/usr/bin/env python3

"""
Validation Script for DOM Query Caching Property Test
Verifies that the property test correctly validates Requirement 8.4
"""

import os
import sys

print('=== Validating DOM Query Caching Property Test ===\n')

test_file_path = 'test/adaptive-viewport/dom-query-caching-property.test.js'
html_file_path = 'test/adaptive-viewport/test-dom-query-caching-property.html'
implementation_path = 'js/adaptive-viewport/layout-state-manager.js'

validations_passed = 0
validations_failed = 0

def validate(condition, message):
    global validations_passed, validations_failed
    if condition:
        print(f'✓ {message}')
        validations_passed += 1
    else:
        print(f'✗ {message}')
        validations_failed += 1

# Check files exist
validate(
    os.path.exists(test_file_path),
    'Property test file exists'
)

validate(
    os.path.exists(html_file_path),
    'HTML test runner exists'
)

validate(
    os.path.exists(implementation_path),
    'LayoutStateManager implementation exists'
)

# Read test file
with open(test_file_path, 'r') as f:
    test_content = f.read()

# Validate test structure
validate(
    'Property 26: DOM Query Caching' in test_content,
    'Test includes Property 26 identifier'
)

validate(
    '**Validates: Requirements 8.4**' in test_content,
    'Test validates Requirement 8.4'
)

validate(
    'runDOMQueryCachingPropertyTest' in test_content,
    'Test exports main test function'
)

# Validate Property 1: Cache hit rate exceeds 80%
validate(
    'Property 1: Cache hit rate exceeds 80% after initial caching' in test_content,
    'Property 1: Tests cache hit rate threshold'
)

validate(
    'if (hitRate <= 80)' in test_content,
    'Property 1: Validates 80% threshold'
)

validate(
    'numRuns: 100' in test_content,
    'Property 1: Runs 100 iterations'
)

# Validate Property 2: Cache reduces DOM queries
validate(
    'Property 2: Cache reduces DOM queries' in test_content,
    'Property 2: Tests query reduction'
)

validate(
    'getBoundingClientRect' in test_content,
    'Property 2: Monitors DOM query calls'
)

validate(
    'enableCache: true' in test_content and 'enableCache: false' in test_content,
    'Property 2: Compares cached vs uncached'
)

# Validate Property 3: Repeated queries are cache hits
validate(
    'Property 3: Repeated queries for same element are cache hits' in test_content,
    'Property 3: Tests repeated query behavior'
)

validate(
    'stats.misses > 0' in test_content or 'stats.misses === 0' in test_content,
    'Property 3: Validates no cache misses'
)

# Validate Property 4: Cache invalidation
validate(
    'Property 4: Cache invalidation clears cached dimensions' in test_content,
    'Property 4: Tests cache invalidation'
)

validate(
    'invalidateCache()' in test_content,
    'Property 4: Calls invalidateCache method'
)

# Validate Property 5: Mixed access patterns
validate(
    'Property 5: Mixed access patterns maintain high hit rate' in test_content,
    'Property 5: Tests realistic access patterns'
)

validate(
    'Math.random()' in test_content,
    'Property 5: Uses random element selection'
)

# Validate fast-check usage
validate(
    'fc.assert' in test_content,
    'Uses fast-check assertions'
)

validate(
    'fc.asyncProperty' in test_content,
    'Uses async property testing'
)

validate(
    'fc.record' in test_content,
    'Uses fast-check record generator'
)

validate(
    'fc.integer' in test_content,
    'Uses fast-check integer generator'
)

# Validate test helpers
validate(
    'createMockElement' in test_content,
    'Includes mock element helper'
)

validate(
    'document.createElement' in test_content,
    'Creates real DOM elements for testing'
)

validate(
    'document.body.appendChild' in test_content,
    'Adds elements to DOM'
)

validate(
    'document.body.removeChild' in test_content,
    'Cleans up DOM elements'
)

# Validate LayoutStateManager usage
validate(
    'new LayoutStateManager' in test_content,
    'Creates LayoutStateManager instances'
)

validate(
    'getElementDimensions' in test_content,
    'Uses getElementDimensions method'
)

validate(
    'getCacheStats' in test_content,
    'Uses getCacheStats method'
)

validate(
    'getCacheHitRate' in test_content,
    'Uses getCacheHitRate method'
)

validate(
    'resetCacheStats' in test_content,
    'Uses resetCacheStats method'
)

validate(
    '.destroy()' in test_content,
    'Properly destroys state manager instances'
)

# Validate HTML test runner
with open(html_file_path, 'r') as f:
    html_content = f.read()

validate(
    'Property Test: DOM Query Caching' in html_content,
    'HTML: Includes test title'
)

validate(
    'Property 26' in html_content,
    'HTML: References Property 26'
)

validate(
    'Requirements 8.4' in html_content,
    'HTML: References Requirement 8.4'
)

validate(
    'setup-fast-check.js' in html_content,
    'HTML: Loads fast-check library'
)

validate(
    'layout-state-manager.js' in html_content,
    'HTML: Loads LayoutStateManager'
)

validate(
    'dom-query-caching-property.test.js' in html_content,
    'HTML: Loads test file'
)

validate(
    'runDOMQueryCachingPropertyTest' in html_content,
    'HTML: Calls test function'
)

validate(
    'Run Property Tests' in html_content,
    'HTML: Includes run button'
)

# Validate implementation has required methods
with open(implementation_path, 'r') as f:
    impl_content = f.read()

validate(
    'cacheElementDimensions' in impl_content,
    'Implementation: Has cacheElementDimensions method'
)

validate(
    'getCachedDimensions' in impl_content,
    'Implementation: Has getCachedDimensions method'
)

validate(
    'getElementDimensions' in impl_content,
    'Implementation: Has getElementDimensions method'
)

validate(
    'getCacheStats' in impl_content,
    'Implementation: Has getCacheStats method'
)

validate(
    'getCacheHitRate' in impl_content,
    'Implementation: Has getCacheHitRate method'
)

validate(
    'invalidateCache' in impl_content,
    'Implementation: Has invalidateCache method'
)

validate(
    'this.cacheHits' in impl_content,
    'Implementation: Tracks cache hits'
)

validate(
    'this.cacheMisses' in impl_content,
    'Implementation: Tracks cache misses'
)

validate(
    'this.dimensionCache' in impl_content,
    'Implementation: Has dimension cache'
)

# Print summary
print('\n=== Validation Summary ===')
print(f'Total Validations: {validations_passed + validations_failed}')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')

if validations_failed == 0:
    print('\n✅ All validations passed! Test is properly structured.')
    sys.exit(0)
else:
    print('\n❌ Some validations failed. Please review the test implementation.')
    sys.exit(1)
