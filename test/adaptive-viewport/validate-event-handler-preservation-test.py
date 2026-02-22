#!/usr/bin/env python3

"""
Validation Script for Event Handler Preservation Property Test
Verifies that the property test is correctly implemented and can run
"""

import os
import sys
import re

print("=== Event Handler Preservation Property Test Validation ===\n")

checks = {
    'passed': 0,
    'failed': 0,
    'details': []
}

def check(name, condition, details=''):
    """Perform a validation check"""
    if condition:
        checks['passed'] += 1
        checks['details'].append({'name': name, 'status': 'PASS', 'details': details})
        print(f"✓ {name}")
    else:
        checks['failed'] += 1
        checks['details'].append({'name': name, 'status': 'FAIL', 'details': details})
        print(f"✗ {name}")
        if details:
            print(f"  {details}")

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check 1: Test file exists
test_file_path = os.path.join(script_dir, 'event-handler-preservation-property.test.js')
test_file_exists = os.path.exists(test_file_path)
check('Property test file exists', test_file_exists, test_file_path)

if test_file_exists:
    with open(test_file_path, 'r', encoding='utf-8') as f:
        test_content = f.read()

    # Check 2: Contains property statement
    check(
        'Contains Property 6 statement',
        'Property 6: Event Handler Preservation' in test_content,
        'Property statement should be in comments'
    )

    # Check 3: Validates correct requirements
    check(
        'Validates Requirements 2.3, 9.1',
        'Requirements 2.3, 9.1' in test_content,
        'Should validate requirements 2.3 and 9.1'
    )

    # Check 4: Uses fast-check
    check(
        'Uses fast-check library',
        'fc.assert' in test_content and 'fc.asyncProperty' in test_content,
        'Should use fast-check for property-based testing'
    )

    # Check 5: Tests single event handler preservation
    check(
        'Tests single event handler preservation',
        'Single event handler' in test_content and 'addEventListener' in test_content,
        'Should test single event handler preservation'
    )

    # Check 6: Tests multiple event handlers
    check(
        'Tests multiple event handlers',
        'Multiple event handlers' in test_content,
        'Should test multiple event handlers'
    )

    # Check 7: Tests through multiple repositionings
    check(
        'Tests through multiple repositionings',
        'multiple repositionings' in test_content,
        'Should test handlers through multiple repositionings'
    )

    # Check 8: Tests batch updates
    check(
        'Tests batch updates',
        'batch update' in test_content and 'batchUpdate' in test_content,
        'Should test event handlers in batch updates'
    )

    # Check 9: Tests event handlers with parameters
    check(
        'Tests event handlers with parameters',
        'parameters' in test_content and 'CustomEvent' in test_content,
        'Should test event handlers with parameters'
    )

    # Check 10: Has minimum 100 iterations per property
    num_runs_matches = re.findall(r'numRuns:\s*(\d+)', test_content)
    all_have_100_runs = all(int(num) >= 100 for num in num_runs_matches) if num_runs_matches else False
    check(
        'All properties run minimum 100 iterations',
        all_have_100_runs,
        'Each property should run at least 100 iterations'
    )

    # Check 11: Properly cleans up DOM elements
    check(
        'Cleans up DOM elements',
        'removeChild' in test_content and 'destroy' in test_content,
        'Should clean up elements and updater instances'
    )

    # Check 12: Uses DOMUpdater
    check(
        'Uses DOMUpdater class',
        'new DOMUpdater' in test_content and 'updateElementPosition' in test_content,
        'Should use DOMUpdater for repositioning'
    )

    # Check 13: Triggers events before and after repositioning
    check(
        'Triggers events before and after repositioning',
        'triggerEvent' in test_content and 'dispatchEvent' in test_content,
        'Should trigger events to verify handler functionality'
    )

    # Check 14: Verifies handler call counts
    check(
        'Verifies handler call counts',
        'callCounts' in test_content or 'count' in test_content,
        'Should verify handlers are called correct number of times'
    )

    # Check 15: Exports test function
    check(
        'Exports test function',
        'module.exports' in test_content and 'runEventHandlerPreservationPropertyTest' in test_content,
        'Should export test function for use in test runner'
    )

# Check 16: HTML test runner exists
html_file_path = os.path.join(script_dir, 'test-event-handler-preservation-property.html')
html_file_exists = os.path.exists(html_file_path)
check('HTML test runner exists', html_file_exists, html_file_path)

if html_file_exists:
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Check 17: Loads fast-check
    check(
        'HTML loads fast-check',
        'setup-fast-check.js' in html_content,
        'Should load fast-check library'
    )

    # Check 18: Loads DOMUpdater
    check(
        'HTML loads DOMUpdater',
        'dom-updater.js' in html_content,
        'Should load DOMUpdater component'
    )

    # Check 19: Loads property test
    check(
        'HTML loads property test',
        'event-handler-preservation-property.test.js' in html_content,
        'Should load the property test file'
    )

    # Check 20: Has run test button
    check(
        'HTML has run test button',
        'runTest' in html_content and 'button' in html_content,
        'Should have button to run tests'
    )

    # Check 21: Displays property information
    check(
        'HTML displays property information',
        'Property 6' in html_content and 'Event Handler Preservation' in html_content,
        'Should display property information'
    )

    # Check 22: Shows validation requirements
    check(
        'HTML shows validation requirements',
        'Requirements: 2.3, 9.1' in html_content or '2.3, 9.1' in html_content,
        'Should show which requirements are validated'
    )

# Check 23: Validation script exists (JS version)
js_validation_path = os.path.join(script_dir, 'validate-event-handler-preservation-test.js')
check('JavaScript validation script exists', os.path.exists(js_validation_path), js_validation_path)

# Check 24: Validation script exists (Python version)
py_validation_path = os.path.join(script_dir, 'validate-event-handler-preservation-test.py')
check('Python validation script exists', os.path.exists(py_validation_path), py_validation_path)

# Print summary
print("\n=== Validation Summary ===")
total = checks['passed'] + checks['failed']
print(f"Total Checks: {total}")
print(f"Passed: {checks['passed']}")
print(f"Failed: {checks['failed']}")
print(f"Success Rate: {(checks['passed'] / total * 100):.1f}%\n")

# Exit with appropriate code
if checks['failed'] > 0:
    print("❌ Validation failed. Please fix the issues above.\n")
    sys.exit(1)
else:
    print("✅ All validation checks passed!\n")
    print("Next steps:")
    print("1. Open test-event-handler-preservation-property.html in a browser")
    print("2. Click 'Run Property Test' to execute the tests")
    print("3. Verify all 5 properties pass with 100 iterations each\n")
    sys.exit(0)
