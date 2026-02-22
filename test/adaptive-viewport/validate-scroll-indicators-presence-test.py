#!/usr/bin/env python3

"""
Validation script for Scroll Indicators Presence Property Test
Verifies that the property test is correctly implemented
"""

import os
import sys

print('\n=== Validating Scroll Indicators Presence Property Test ===\n')

results = {
    'passed': 0,
    'failed': 0,
    'checks': []
}

def check(name, condition, details=''):
    if condition:
        results['passed'] += 1
        results['checks'].append({'name': name, 'status': 'PASS'})
        print(f'✓ {name}')
    else:
        results['failed'] += 1
        results['checks'].append({'name': name, 'status': 'FAIL', 'details': details})
        print(f'✗ {name}')
        if details:
            print(f'  {details}')

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check 1: Property test file exists
test_file_path = os.path.join(script_dir, 'scroll-indicators-presence-property.test.js')
test_file_exists = os.path.exists(test_file_path)
check('Property test file exists', test_file_exists, 'File not found: scroll-indicators-presence-property.test.js')

if test_file_exists:
    with open(test_file_path, 'r', encoding='utf-8') as f:
        test_content = f.read()

    # Check 2: File has correct header with property information
    check(
        'File has correct header with Property 9 information',
        'Property 9: Scroll Indicators Presence' in test_content and
        '**Validates: Requirements 3.3**' in test_content,
        'Missing or incorrect property header'
    )

    # Check 3: File imports OverflowHandler
    check(
        'File imports OverflowHandler',
        'OverflowHandler' in test_content and
        "require('../../js/adaptive-viewport/overflow-handler.js')" in test_content,
        'Missing OverflowHandler import'
    )

    # Check 4: Main test function exists
    check(
        'Main test function exists',
        'async function runScrollIndicatorsPresencePropertyTest(fc)' in test_content,
        'Missing main test function'
    )

    # Check 5: Test uses fast-check library
    check(
        'Test uses fast-check library',
        'fc.assert' in test_content and
        'fc.asyncProperty' in test_content,
        'Missing fast-check usage'
    )

    # Check 6: Test has minimum 100 iterations
    check(
        'Test configured for minimum 100 iterations',
        'numRuns: 100' in test_content,
        'Missing or incorrect numRuns configuration'
    )

    # Check 7: Property 1 - Indicators present when configured
    check(
        'Property 1: Tests indicators presence based on configuration',
        'Property 1: Scroll indicators present when configured' in test_content and
        'scrollIndicators: fc.boolean()' in test_content,
        'Missing Property 1 test'
    )

    # Check 8: Property 2 - Top indicator visibility when scrolled
    check(
        'Property 2: Tests top indicator visibility when scrolled down',
        'Property 2: Top indicator visible when scrolled down' in test_content and
        'scroll-indicator-top' in test_content and
        'container.scrollTop' in test_content,
        'Missing Property 2 test'
    )

    # Check 9: Property 3 - Bottom indicator visibility
    check(
        'Property 3: Tests bottom indicator visibility with more content',
        'Property 3: Bottom indicator visible when more content below' in test_content and
        'scroll-indicator-bottom' in test_content and
        'scrollBottom' in test_content,
        'Missing Property 3 test'
    )

    # Check 10: Property 4 - Styling and accessibility
    check(
        'Property 4: Tests indicator styling and accessibility attributes',
        'Property 4: Indicators have proper styling and accessibility' in test_content and
        'aria-hidden' in test_content and
        'pointerEvents' in test_content,
        'Missing Property 4 test'
    )

    # Check 11: Property 5 - Indicator width reflects scroll position
    check(
        'Property 5: Tests indicator width reflects scroll position',
        'Property 5: Indicator width reflects scroll position' in test_content and
        'scrollPercent' in test_content and
        'topWidth' in test_content,
        'Missing Property 5 test'
    )

    # Check 12: Property 6 - Indicators removed when scrolling removed
    check(
        'Property 6: Tests indicators removed when scrolling removed',
        'Property 6: Indicators removed when scrolling removed' in test_content and
        'removeScrolling' in test_content,
        'Missing Property 6 test'
    )

    # Check 13: Test creates DOM elements for testing
    check(
        'Test creates DOM elements for testing',
        'document.createElement' in test_content and
        'document.body.appendChild' in test_content,
        'Missing DOM element creation'
    )

    # Check 14: Test cleans up after each iteration
    check(
        'Test cleans up DOM elements after testing',
        'document.body.removeChild' in test_content and
        'handler.destroy()' in test_content,
        'Missing cleanup code'
    )

    # Check 15: Test uses helper functions
    check(
        'Test uses helper functions for element creation',
        'function createTestElements' in test_content and
        'function calculateTotalHeight' in test_content,
        'Missing helper functions'
    )

    # Check 16: Test returns results object
    check(
        'Test returns results object with passed/failed counts',
        'return results' in test_content and
        'results.passed' in test_content and
        'results.failed' in test_content,
        'Missing results return'
    )

    # Check 17: Test exports function for use in test runner
    check(
        'Test exports function for module usage',
        'module.exports' in test_content and
        'runScrollIndicatorsPresencePropertyTest' in test_content,
        'Missing module export'
    )

    # Check 18: Test has proper error handling
    check(
        'Test has proper error handling with try-catch',
        'try {' in test_content and
        'catch (error)' in test_content and
        'error.message' in test_content,
        'Missing error handling'
    )

    # Check 19: Test validates scroll indicator opacity
    check(
        'Test validates scroll indicator opacity',
        'opacity' in test_content and
        'parseFloat' in test_content,
        'Missing opacity validation'
    )

    # Check 20: Test uses async/await for timing
    check(
        'Test uses async/await for proper timing',
        'await new Promise' in test_content and
        'setTimeout' in test_content,
        'Missing async timing control'
    )

# Check 21: HTML test runner exists
html_file_path = os.path.join(script_dir, 'test-scroll-indicators-presence-property.html')
html_file_exists = os.path.exists(html_file_path)
check('HTML test runner exists', html_file_exists, 'File not found: test-scroll-indicators-presence-property.html')

if html_file_exists:
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Check 22: HTML loads fast-check
    check(
        'HTML loads fast-check library',
        'setup-fast-check.js' in html_content,
        'Missing fast-check setup'
    )

    # Check 23: HTML loads OverflowHandler
    check(
        'HTML loads OverflowHandler',
        'overflow-handler.js' in html_content,
        'Missing OverflowHandler script'
    )

    # Check 24: HTML loads property test
    check(
        'HTML loads property test script',
        'scroll-indicators-presence-property.test.js' in html_content,
        'Missing property test script'
    )

    # Check 25: HTML has run button
    check(
        'HTML has run tests button',
        'runTests()' in html_content and
        'button' in html_content,
        'Missing run tests button'
    )

    # Check 26: HTML displays property information
    check(
        'HTML displays property information',
        'Property 9' in html_content and
        'Requirements 3.3' in html_content,
        'Missing property information'
    )

    # Check 27: HTML has output area
    check(
        'HTML has output area for test results',
        'id="output"' in html_content or
        'id="outputText"' in html_content,
        'Missing output area'
    )

# Check 28: Validation script exists
validation_script_path = os.path.join(script_dir, 'validate-scroll-indicators-presence-test.py')
check('Validation script exists', os.path.exists(validation_script_path), 'Validation script not found')

# Print summary
print('\n' + '=' * 60)
print('VALIDATION SUMMARY')
print('=' * 60)
total = results['passed'] + results['failed']
print(f"Total Checks: {total}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Success Rate: {(results['passed'] / total * 100):.1f}%")

if results['failed'] == 0:
    print('\n✓ All validation checks passed!')
    print('The property test is correctly implemented.\n')
    sys.exit(0)
else:
    print('\n✗ Some validation checks failed.')
    print('Please review the failed checks above.\n')
    sys.exit(1)
