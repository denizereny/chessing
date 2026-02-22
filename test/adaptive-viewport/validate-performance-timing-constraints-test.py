#!/usr/bin/env python3

"""
Validation Script: Performance Timing Constraints Property Test

This script validates that the property test for performance timing constraints
is correctly implemented and follows the project patterns.
"""

import os
import sys

print('=' * 70)
print('Validating Performance Timing Constraints Property Test')
print('=' * 70)
print()

validations_passed = 0
validations_failed = 0

def validate(description, condition, details=''):
    global validations_passed, validations_failed
    if condition:
        print(f'✓ {description}')
        validations_passed += 1
    else:
        print(f'✗ {description}')
        if details:
            print(f'  Details: {details}')
        validations_failed += 1

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check test file exists
test_file_path = os.path.join(script_dir, 'performance-timing-constraints-property.test.js')
test_file_exists = os.path.exists(test_file_path)
validate('Test file exists', test_file_exists, test_file_path)

if test_file_exists:
    with open(test_file_path, 'r') as f:
        test_content = f.read()

    # Check header documentation
    validate(
        'Test has proper header documentation',
        'Property 14: Performance Timing Constraints' in test_content and
        '**Validates: Requirements 1.3, 4.3, 5.5, 8.1**' in test_content
    )

    # Check property statement
    validate(
        'Property statement is present',
        'For any layout operation' in test_content and
        'within its specified time threshold' in test_content
    )

    # Check all four requirements are validated
    validate(
        'Validates Requirement 1.3 (resize within 100ms)',
        'Requirement 1.3' in test_content and
        'RESIZE: 100' in test_content
    )

    validate(
        'Validates Requirement 4.3 (initial load within 200ms)',
        'Requirement 4.3' in test_content and
        'INITIAL_LOAD: 200' in test_content
    )

    validate(
        'Validates Requirement 5.5 (orientation change within 150ms)',
        'Requirement 5.5' in test_content and
        'ORIENTATION_CHANGE: 150' in test_content
    )

    validate(
        'Validates Requirement 8.1 (layout recalc within 100ms)',
        'Requirement 8.1' in test_content and
        'LAYOUT_RECALC: 100' in test_content
    )

    # Check fast-check usage
    validate(
        'Uses fast-check library',
        'fc.assert' in test_content and
        'fc.asyncProperty' in test_content
    )

    # Check minimum 100 iterations
    validate(
        'Runs minimum 100 iterations',
        'numRuns: 100' in test_content
    )

    # Check property tests are present
    property_tests = [
        'Property 1: Initial viewport analysis within 200ms',
        'Property 2: Resize analysis within 100ms',
        'Property 3: Orientation change within 150ms',
        'Property 4: Layout recalculation within 100ms',
        'Property 5: Consistent performance across viewport sizes',
        'Property 6: Multiple consecutive operations maintain performance'
    ]

    for i, property_name in enumerate(property_tests, 1):
        validate(
            f'Property {i} test is implemented',
            property_name in test_content
        )

    # Check performance measurement
    validate(
        'Uses performance.now() for timing',
        'performance.now()' in test_content
    )

    validate(
        'Measures operation duration',
        'measureOperation' in test_content or
        ('startTime' in test_content and 'endTime' in test_content)
    )

    # Check threshold validation
    validate(
        'Validates against thresholds',
        'THRESHOLDS' in test_content and
        'duration >' in test_content and
        'threshold' in test_content
    )

    # Check ViewportAnalyzer usage
    validate(
        'Uses ViewportAnalyzer',
        'new ViewportAnalyzer' in test_content
    )

    validate(
        'Tests initialize method',
        'analyzer.initialize()' in test_content
    )

    validate(
        'Tests analyzeViewport method',
        'analyzer.analyzeViewport()' in test_content
    )

    validate(
        'Tests handleOrientationChange method',
        'handleOrientationChange' in test_content
    )

    # Check cleanup
    validate(
        'Cleans up test elements',
        'cleanupTestElements' in test_content or
        'removeChild' in test_content
    )

    validate(
        'Destroys analyzer after tests',
        'analyzer.destroy()' in test_content
    )

    # Check error handling
    validate(
        'Has try-catch blocks',
        'try {' in test_content and
        '} catch' in test_content
    )

    # Check result tracking
    validate(
        'Tracks test results',
        'results.passed' in test_content and
        'results.failed' in test_content
    )

    # Check summary output
    validate(
        'Prints test summary',
        'Test Summary' in test_content and
        'Total Properties' in test_content
    )

    # Check export
    validate(
        'Exports test function',
        'module.exports' in test_content and
        'runPerformanceTimingConstraintsPropertyTest' in test_content
    )

# Check HTML test runner exists
html_file_path = os.path.join(script_dir, 'test-performance-timing-constraints-property.html')
html_file_exists = os.path.exists(html_file_path)
validate('HTML test runner exists', html_file_exists, html_file_path)

if html_file_exists:
    with open(html_file_path, 'r') as f:
        html_content = f.read()

    # Check HTML structure
    validate(
        'HTML has proper title',
        'Performance Timing Constraints' in html_content
    )

    validate(
        'HTML loads fast-check',
        'setup-fast-check.js' in html_content
    )

    validate(
        'HTML loads test file',
        'performance-timing-constraints-property.test.js' in html_content
    )

    validate(
        'HTML loads ViewportAnalyzer',
        'viewport-analyzer.js' in html_content
    )

    validate(
        'HTML has run test button',
        'runTest' in html_content and
        'button' in html_content
    )

    validate(
        'HTML displays requirements',
        'Requirement 1.3' in html_content and
        'Requirement 4.3' in html_content and
        'Requirement 5.5' in html_content and
        'Requirement 8.1' in html_content
    )

    validate(
        'HTML shows performance thresholds',
        '100ms' in html_content and
        '200ms' in html_content and
        '150ms' in html_content
    )

# Check validation script exists
validation_script_path = os.path.join(script_dir, 'validate-performance-timing-constraints-test.py')
validate('Validation script exists', os.path.exists(validation_script_path))

# Print summary
print()
print('=' * 70)
print('Validation Summary')
print('=' * 70)
total = validations_passed + validations_failed
print(f'Total Validations: {total}')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')
print(f'Success Rate: {(validations_passed / total * 100):.1f}%')
print()

if validations_failed == 0:
    print('✅ All validations passed! The property test is correctly implemented.')
    sys.exit(0)
else:
    print('❌ Some validations failed. Please review the implementation.')
    sys.exit(1)
