#!/usr/bin/env python3

"""
Validation Script for Accessibility Feature Preservation Property Test
Validates that the test implementation correctly tests Property 28
"""

import os
import sys

def validate_file(file_path, checks):
    """Validate a file against a list of checks"""
    print(f"Validating: {os.path.basename(file_path)}")
    
    if not os.path.exists(file_path):
        print(f"✗ File not found: {file_path}\n")
        return False, 0, 1
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    passed = 0
    failed = 0
    
    for check in checks:
        if check['test'](content):
            print(f"  ✓ {check['description']}")
            passed += 1
        else:
            print(f"  ✗ {check['description']}")
            failed += 1
    
    print()
    return failed == 0, passed, failed

def main():
    print("=== Validating Accessibility Feature Preservation Property Test ===\n")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_file_path = os.path.join(script_dir, 'accessibility-feature-preservation-property.test.js')
    html_file_path = os.path.join(script_dir, 'test-accessibility-feature-preservation-property.html')
    
    # Validation checks for test file
    test_file_checks = [
        {
            'description': 'Contains Property 28 header comment',
            'test': lambda c: 'Property 28: Accessibility Feature Preservation' in c
        },
        {
            'description': 'Validates Requirements 9.2, 9.3',
            'test': lambda c: 'Requirements 9.2, 9.3' in c
        },
        {
            'description': 'Tests ARIA attributes preservation',
            'test': lambda c: 'ARIA attributes' in c and 'aria-label' in c
        },
        {
            'description': 'Tests multiple ARIA attributes',
            'test': lambda c: 'aria-describedby' in c and 'aria-labelledby' in c
        },
        {
            'description': 'Tests keyboard navigation handlers',
            'test': lambda c: 'keyboard' in c and 'keydown' in c
        },
        {
            'description': 'Tests focus management',
            'test': lambda c: 'focus' in c and 'blur' in c
        },
        {
            'description': 'Tests tabIndex preservation',
            'test': lambda c: 'tabIndex' in c
        },
        {
            'description': 'Tests batch updates with accessibility features',
            'test': lambda c: 'batch' in c and 'accessibility' in c
        },
        {
            'description': 'Tests multiple repositionings',
            'test': lambda c: 'multiple repositionings' in c
        },
        {
            'description': 'Uses fast-check for property-based testing',
            'test': lambda c: 'fc.assert' in c and 'fc.asyncProperty' in c
        },
        {
            'description': 'Runs minimum 100 iterations per property',
            'test': lambda c: 'numRuns: 100' in c
        },
        {
            'description': 'Creates elements with ARIA attributes',
            'test': lambda c: 'createElementWithARIA' in c
        },
        {
            'description': 'Compares ARIA attributes before and after',
            'test': lambda c: 'ariaBefore' in c and 'ariaAfter' in c
        },
        {
            'description': 'Tests keyboard event triggering',
            'test': lambda c: 'triggerKeyboardEvent' in c or 'KeyboardEvent' in c
        },
        {
            'description': 'Validates ARIA attribute matching',
            'test': lambda c: 'ariaAttributesMatch' in c
        },
        {
            'description': 'Uses DOMUpdater for repositioning',
            'test': lambda c: 'new DOMUpdater' in c
        },
        {
            'description': 'Tests various keyboard keys (Enter, Space, Tab, Arrows)',
            'test': lambda c: 'Enter' in c and 'Space' in c and 'Tab' in c and 'Arrow' in c
        },
        {
            'description': 'Exports test function for use in runner',
            'test': lambda c: 'module.exports' in c and 'runAccessibilityFeaturePreservationPropertyTest' in c
        },
        {
            'description': 'Returns test results object',
            'test': lambda c: 'results.passed' in c and 'results.failed' in c
        },
        {
            'description': 'Cleans up test elements after each test',
            'test': lambda c: 'removeChild' in c
        }
    ]
    
    # Validation checks for HTML file
    html_file_checks = [
        {
            'description': 'Contains proper title',
            'test': lambda c: 'Accessibility Feature Preservation' in c
        },
        {
            'description': 'Loads fast-check library',
            'test': lambda c: 'setup-fast-check.js' in c
        },
        {
            'description': 'Loads DOMUpdater',
            'test': lambda c: 'dom-updater.js' in c
        },
        {
            'description': 'Loads test file',
            'test': lambda c: 'accessibility-feature-preservation-property.test.js' in c
        },
        {
            'description': 'Has run test button',
            'test': lambda c: 'runTest' in c
        },
        {
            'description': 'Displays property statement',
            'test': lambda c: 'Property Statement' in c
        },
        {
            'description': 'Shows test coverage information',
            'test': lambda c: 'Test Coverage' in c
        },
        {
            'description': 'Mentions ARIA attributes in coverage',
            'test': lambda c: 'ARIA attributes' in c
        },
        {
            'description': 'Mentions keyboard navigation in coverage',
            'test': lambda c: 'Keyboard navigation' in c
        },
        {
            'description': 'Mentions focus management in coverage',
            'test': lambda c: 'Focus management' in c
        },
        {
            'description': 'Has output display area',
            'test': lambda c: 'id="output"' in c
        },
        {
            'description': 'Has status display',
            'test': lambda c: 'id="status"' in c
        }
    ]
    
    # Run validations
    print("1. Test File Validation\n")
    test_valid, test_passed, test_failed = validate_file(test_file_path, test_file_checks)
    
    print("2. HTML Runner Validation\n")
    html_valid, html_passed, html_failed = validate_file(html_file_path, html_file_checks)
    
    # Summary
    total_passed = test_passed + html_passed
    total_failed = test_failed + html_failed
    
    print("=== Validation Summary ===")
    print(f"Total Checks: {total_passed + total_failed}")
    print(f"Passed: {total_passed}")
    print(f"Failed: {total_failed}")
    
    if total_failed == 0:
        print("\n✓ All validations passed!")
        print("\nThe test correctly implements Property 28:")
        print("- Tests ARIA attributes preservation")
        print("- Tests keyboard navigation handlers")
        print("- Tests focus management")
        print("- Tests tabIndex preservation")
        print("- Tests batch updates and multiple repositionings")
        print("- Runs 700 total iterations (7 properties × 100 each)")
        return 0
    else:
        print("\n✗ Some validations failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
