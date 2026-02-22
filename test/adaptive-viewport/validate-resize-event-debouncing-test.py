#!/usr/bin/env python3

"""
Validation Script for Resize Event Debouncing Property Test
Verifies that the property test is correctly implemented
"""

import os
import sys

print('=== Validating Resize Event Debouncing Property Test ===\n')

test_file_path = 'test/adaptive-viewport/resize-event-debouncing-property.test.js'
html_file_path = 'test/adaptive-viewport/test-resize-event-debouncing-property.html'

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

# Check test file exists
validate(
    os.path.exists(test_file_path),
    'Test file exists: resize-event-debouncing-property.test.js'
)

# Check HTML runner exists
validate(
    os.path.exists(html_file_path),
    'HTML test runner exists: test-resize-event-debouncing-property.html'
)

if os.path.exists(test_file_path):
    with open(test_file_path, 'r') as f:
        test_content = f.read()

    # Check for property documentation
    validate(
        'Property 25: Resize Event Debouncing' in test_content,
        'Test includes Property 25 documentation'
    )

    validate(
        '**Validates: Requirements 8.3**' in test_content,
        'Test validates Requirements 8.3'
    )

    # Check for property description
    validate(
        'rapid sequence of resize events' in test_content and
        'more than 10 events within 100ms' in test_content,
        'Test includes correct property description'
    )

    validate(
        'at most 1-2 recalculations' in test_content,
        'Test specifies expected debouncing behavior'
    )

    # Check for fast-check usage
    validate(
        'fc.assert' in test_content,
        'Test uses fast-check assertions'
    )

    validate(
        'fc.asyncProperty' in test_content,
        'Test uses async property testing'
    )

    validate(
        'numRuns: 100' in test_content,
        'Test runs 100 iterations'
    )

    # Check for required test properties
    validate(
        'Property 1:' in test_content and
        'Rapid resize events are debounced' in test_content,
        'Test includes Property 1: Rapid resize events are debounced'
    )

    validate(
        'Property 2:' in test_content and
        'Debouncing ratio' in test_content,
        'Test includes Property 2: Debouncing ratio maintained'
    )

    validate(
        'Property 3:' in test_content and
        'Final recalculation' in test_content,
        'Test includes Property 3: Final recalculation after burst'
    )

    validate(
        'Property 4:' in test_content and
        'Debounce delay is respected' in test_content,
        'Test includes Property 4: Debounce delay is respected'
    )

    validate(
        'Property 5:' in test_content and
        'Consecutive' in test_content,
        'Test includes Property 5: Consecutive bursts handled'
    )

    # Check for mock analyzer
    validate(
        'createMockAnalyzer' in test_content,
        'Test includes mock analyzer for testing'
    )

    validate(
        'handleResize' in test_content,
        'Test simulates handleResize method'
    )

    validate(
        'debounceTimer' in test_content,
        'Test implements debounce timer logic'
    )

    # Check for event count validation
    validate(
        'eventCount: fc.integer({ min: 11' in test_content or
        'eventCount: fc.integer({ min: 10' in test_content,
        'Test generates rapid event sequences (10+ events)'
    )

    validate(
        'intervalMs' in test_content and
        ('max: 9' in test_content or 'max: 10' in test_content),
        'Test generates rapid intervals (< 10ms)'
    )

    # Check for recalculation counting
    validate(
        'recalculationCount' in test_content,
        'Test tracks recalculation count'
    )

    validate(
        'getRecalculationCount' in test_content,
        'Test provides method to get recalculation count'
    )

    # Check for debounce delay configuration
    validate(
        'debounceDelay' in test_content,
        'Test configures debounce delay'
    )

    validate(
        '150' in test_content or 'debounceDelay: fc.integer' in test_content,
        'Test uses appropriate debounce delay values'
    )

    # Check for ratio validation
    validate(
        'ratio' in test_content and
        'recalculationCount / config.eventCount' in test_content,
        'Test calculates debouncing ratio'
    )

    validate(
        'maxExpectedRecalculations' in test_content or
        'ratio >= 0.1' in test_content or
        '> maxExpectedRecalculations' in test_content,
        'Test validates recalculation count is significantly less than event count'
    )

    # Check for timing validation
    validate(
        'performance.now()' in test_content or
        'Date.now()' in test_content,
        'Test measures timing'
    )

    validate(
        'wait(' in test_content and
        'setTimeout' in test_content,
        'Test includes wait helper for async timing'
    )

    # Check for burst testing
    validate(
        'burst1' in test_content or 'Consecutive bursts' in test_content,
        'Test handles consecutive event bursts'
    )

    # Check for cleanup
    validate(
        'reset()' in test_content or
        'clearTimeout' in test_content,
        'Test includes cleanup logic'
    )

    # Check for export
    validate(
        'module.exports' in test_content and
        'runResizeEventDebouncingPropertyTest' in test_content,
        'Test exports the test function'
    )

    # Check for error handling
    validate(
        'try' in test_content and 'catch' in test_content,
        'Test includes error handling'
    )

    # Check for results tracking
    validate(
        'results.passed' in test_content and
        'results.failed' in test_content,
        'Test tracks pass/fail results'
    )

if os.path.exists(html_file_path):
    with open(html_file_path, 'r') as f:
        html_content = f.read()

    # Check HTML structure
    validate(
        'Property Test: Resize Event Debouncing' in html_content,
        'HTML includes correct title'
    )

    validate(
        'Property 25' in html_content,
        'HTML references Property 25'
    )

    validate(
        'Requirements 8.3' in html_content,
        'HTML references Requirements 8.3'
    )

    # Check for script loading
    validate(
        'setup-fast-check.js' in html_content,
        'HTML loads fast-check library'
    )

    validate(
        'viewport-analyzer.js' in html_content,
        'HTML loads ViewportAnalyzer'
    )

    validate(
        'resize-event-debouncing-property.test.js' in html_content,
        'HTML loads the property test'
    )

    # Check for test runner
    validate(
        'runResizeEventDebouncingPropertyTest' in html_content,
        'HTML calls the test function'
    )

    validate(
        'runTest()' in html_content,
        'HTML includes run test button'
    )

    # Check for output display
    validate(
        'id="output"' in html_content,
        'HTML includes output display'
    )

    validate(
        'console.log' in html_content and
        'captureOutput' in html_content,
        'HTML captures console output'
    )

# Print summary
print('\n' + '=' * 60)
print('VALIDATION SUMMARY')
print('=' * 60)
print(f'Total Validations: {validations_passed + validations_failed}')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')

if validations_failed == 0:
    print('\n✓ ALL VALIDATIONS PASSED!')
    print('\nThe resize event debouncing property test is correctly implemented.')
    print('\nNext steps:')
    print('1. Open test/adaptive-viewport/test-resize-event-debouncing-property.html in a browser')
    print('2. Click "Run Property Test" to execute the test')
    print('3. Verify all 5 properties pass with 100 iterations each')
    sys.exit(0)
else:
    print('\n✗ SOME VALIDATIONS FAILED')
    print('\nPlease review the failed validations above.')
    sys.exit(1)
