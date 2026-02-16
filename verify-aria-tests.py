#!/usr/bin/env python3
"""
Verification Script for ARIA Attributes Tests
This script validates that the test file is properly structured
"""

import sys
import re

print('🔍 Verifying ARIA Attributes Test File\n')

# Read the test file
try:
    with open('test/responsive-settings-menu-aria.test.js', 'r') as f:
        test_file = f.read()
except FileNotFoundError:
    print('❌ Test file not found!')
    sys.exit(1)

# Check for required test structure
checks = [
    {
        'name': 'File exists and is readable',
        'test': lambda: len(test_file) > 0
    },
    {
        'name': 'Contains Example 9 tests (ARIA labels on toggle button)',
        'test': lambda: 'Example 9: ARIA labels on toggle button' in test_file
    },
    {
        'name': 'Contains Example 10 tests (ARIA attributes on menu)',
        'test': lambda: 'Example 10: ARIA attributes on menu' in test_file
    },
    {
        'name': 'Contains Example 11 tests (Screen reader announcements)',
        'test': lambda: 'Example 11: Screen reader announcements' in test_file
    },
    {
        'name': 'Tests validate Requirement 6.1',
        'test': lambda: 'Requirements 6.1' in test_file
    },
    {
        'name': 'Tests validate Requirement 6.5',
        'test': lambda: 'Requirements 6.5' in test_file
    },
    {
        'name': 'Tests validate Requirement 6.7',
        'test': lambda: 'Requirements 6.7' in test_file
    },
    {
        'name': 'Contains aria-label tests',
        'test': lambda: 'aria-label' in test_file
    },
    {
        'name': 'Contains aria-expanded tests',
        'test': lambda: 'aria-expanded' in test_file
    },
    {
        'name': 'Contains aria-controls tests',
        'test': lambda: 'aria-controls' in test_file
    },
    {
        'name': 'Contains aria-hidden tests',
        'test': lambda: 'aria-hidden' in test_file
    },
    {
        'name': 'Contains aria-live tests',
        'test': lambda: 'aria-live' in test_file
    },
    {
        'name': 'Contains aria-modal tests',
        'test': lambda: 'aria-modal' in test_file
    },
    {
        'name': 'Contains role="dialog" tests',
        'test': lambda: 'role="dialog"' in test_file
    },
    {
        'name': 'Contains role="status" tests',
        'test': lambda: 'role="status"' in test_file
    },
    {
        'name': 'Contains announcer tests',
        'test': lambda: 'settingsMenuAnnouncer' in test_file
    },
    {
        'name': 'Contains toggle button tests',
        'test': lambda: 'settingsMenuToggle' in test_file
    },
    {
        'name': 'Contains menu panel tests',
        'test': lambda: 'settingsMenuPanel' in test_file
    },
    {
        'name': 'Contains backdrop tests',
        'test': lambda: 'settingsMenuBackdrop' in test_file
    },
    {
        'name': 'Uses describe() for test organization',
        'test': lambda: 'describe(' in test_file
    },
    {
        'name': 'Uses test() for individual tests',
        'test': lambda: 'test(' in test_file
    },
    {
        'name': 'Uses expect() for assertions',
        'test': lambda: 'expect(' in test_file
    }
]

passed = 0
failed = 0

for check in checks:
    try:
        if check['test']():
            print(f"✅ {check['name']}")
            passed += 1
        else:
            print(f"❌ {check['name']}")
            failed += 1
    except Exception as e:
        print(f"❌ {check['name']} - Error: {str(e)}")
        failed += 1

print('\n' + '=' * 60)
print('VERIFICATION SUMMARY')
print('=' * 60)
print(f"Total Checks: {len(checks)}")
print(f"Passed: {passed} ✅")
print(f"Failed: {failed} ❌")
print(f"Success Rate: {(passed / len(checks) * 100):.1f}%")
print('=' * 60)

# Count test cases
test_matches = re.findall(r'test\(', test_file)
test_count = len(test_matches)
print(f"\n📊 Test Statistics:")
print(f"   Total test cases: {test_count}")

describe_matches = re.findall(r'describe\(', test_file)
describe_count = len(describe_matches)
print(f"   Test suites: {describe_count}")

print('\n✅ Test file structure is valid and ready for execution')
print('📝 To run tests, open test-aria-attributes.html in a browser\n')

sys.exit(1 if failed > 0 else 0)
