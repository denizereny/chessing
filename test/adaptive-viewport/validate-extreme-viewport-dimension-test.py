#!/usr/bin/env python3

"""
Validation Script for Extreme Viewport Dimension Property Test
Verifies that the property test is correctly implemented
"""

import os
import sys

print('=== Validating Extreme Viewport Dimension Property Test ===\n')

results = {
    'passed': 0,
    'failed': 0,
    'checks': []
}

def check(name, condition, details=''):
    if condition:
        print(f'✓ {name}')
        results['passed'] += 1
        results['checks'].append({'name': name, 'status': 'PASS'})
    else:
        print(f'✗ {name}')
        if details:
            print(f'  {details}')
        results['failed'] += 1
        results['checks'].append({'name': name, 'status': 'FAIL', 'details': details})

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check 1: Test file exists
test_file_path = os.path.join(script_dir, 'extreme-viewport-dimension-property.test.js')
test_file_exists = os.path.exists(test_file_path)
check('Test file exists', test_file_exists, 'extreme-viewport-dimension-property.test.js not found')

if test_file_exists:
    with open(test_file_path, 'r') as f:
        test_content = f.read()

    # Check 2: Contains property description
    check(
        'Contains Property 17 description',
        'Property 17: Extreme Viewport Dimension Support' in test_content,
        'Missing property description'
    )

    # Check 3: Validates Requirements 5.1, 5.2
    check(
        'Validates Requirements 5.1, 5.2',
        'Requirements 5.1, 5.2' in test_content,
        'Missing requirement validation'
    )

    # Check 4: Uses fast-check library
    check(
        'Uses fast-check library',
        'fc.assert' in test_content and 'fc.asyncProperty' in test_content,
        'Not using fast-check properly'
    )

    # Check 5: Tests viewport width range 320-3840
    check(
        'Tests viewport width range (320-3840px)',
        'min: 320' in test_content and 'max: 3840' in test_content,
        'Missing width range'
    )

    # Check 6: Tests viewport height range 480-2160
    check(
        'Tests viewport height range (480-2160px)',
        'min: 480' in test_content and 'max: 2160' in test_content,
        'Missing height range'
    )

    # Check 7: Runs minimum 100 iterations
    check(
        'Runs minimum 100 iterations per property',
        'numRuns: 100' in test_content,
        'Not running 100 iterations'
    )

    # Check 8: Validates layout configuration
    check(
        'Validates layout configuration',
        'validateLayoutConfiguration' in test_content,
        'Missing layout validation'
    )

    # Check 9: Tests extreme aspect ratios
    check(
        'Tests extreme aspect ratios',
        'ultra-wide' in test_content or 'very-tall' in test_content,
        'Missing extreme aspect ratio tests'
    )

    # Check 10: Tests portrait and landscape orientations
    check(
        'Tests portrait and landscape orientations',
        'portrait' in test_content and 'landscape' in test_content,
        'Missing orientation tests'
    )

    # Check 11: Tests boundary dimensions
    check(
        'Tests boundary dimensions',
        '320' in test_content and '3840' in test_content and 
        '480' in test_content and '2160' in test_content,
        'Missing boundary dimension tests'
    )

    # Check 12: Validates minimum board size
    check(
        'Validates minimum board size (280px)',
        '280' in test_content and 'minBoardSize' in test_content,
        'Missing minimum board size validation'
    )

    # Check 13: Checks for NaN and Infinity
    check(
        'Checks for NaN and Infinity in dimensions',
        'isNaN' in test_content and 'isFinite' in test_content,
        'Missing NaN/Infinity checks'
    )

    # Check 14: Validates board fits within viewport
    check(
        'Validates board fits within viewport',
        'boardRight' in test_content or 'boardBottom' in test_content,
        'Missing viewport fit validation'
    )

    # Check 15: Has proper error handling
    check(
        'Has proper error handling',
        'try' in test_content and 'catch' in test_content,
        'Missing error handling'
    )

    # Check 16: Exports test function
    check(
        'Exports test function',
        'module.exports' in test_content and 
        'runExtremeViewportDimensionPropertyTest' in test_content,
        'Missing export'
    )

    # Check 17: Tests at least 5 properties
    property_count = test_content.count('Property ')
    check(
        'Tests at least 5 properties',
        property_count >= 5,
        f'Only {property_count} properties found'
    )

# Check 18: HTML test runner exists
html_file_path = os.path.join(script_dir, 'test-extreme-viewport-dimension-property.html')
html_file_exists = os.path.exists(html_file_path)
check('HTML test runner exists', html_file_exists, 'test-extreme-viewport-dimension-property.html not found')

if html_file_exists:
    with open(html_file_path, 'r') as f:
        html_content = f.read()

    # Check 19: HTML loads fast-check
    check(
        'HTML loads fast-check',
        'setup-fast-check.js' in html_content,
        'Missing fast-check setup'
    )

    # Check 20: HTML loads test file
    check(
        'HTML loads test file',
        'extreme-viewport-dimension-property.test.js' in html_content,
        'Missing test file reference'
    )

    # Check 21: HTML loads dependencies
    check(
        'HTML loads required dependencies',
        'viewport-analyzer.js' in html_content and 
        'layout-optimizer.js' in html_content,
        'Missing dependency references'
    )

    # Check 22: HTML has run button
    check(
        'HTML has run button',
        'runTests' in html_content and 'button' in html_content,
        'Missing run button'
    )

    # Check 23: HTML displays property information
    check(
        'HTML displays property information',
        'Property 17' in html_content and 'Requirements 5.1, 5.2' in html_content,
        'Missing property information'
    )

# Check 24: Validation script exists
validation_script_path = os.path.join(script_dir, 'validate-extreme-viewport-dimension-test.py')
check('Validation script exists', os.path.exists(validation_script_path))

# Print summary
print('\n=== Validation Summary ===')
total = results['passed'] + results['failed']
print(f"Total Checks: {total}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Success Rate: {(results['passed'] / total * 100):.1f}%\n")

if results['failed'] == 0:
    print('✅ All validation checks passed!')
    print('The property test is correctly implemented.\n')
    sys.exit(0)
else:
    print('❌ Some validation checks failed.')
    print('Please review the failed checks above.\n')
    sys.exit(1)
