#!/usr/bin/env python3

"""
Validation Script for Scroll Removal When Unnecessary Property Test
Verifies that the property test is correctly implemented
"""

import os
import sys

def validate_file(file_path, checks):
    """Validate a file against a list of checks"""
    print(f"Validating: {os.path.basename(file_path)}")
    
    if not os.path.exists(file_path):
        print(f"  ✗ File does not exist: {file_path}")
        return 0, 1
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    passed = 0
    failed = 0
    
    for description, test_func in checks:
        if test_func(content):
            print(f"  ✓ {description}")
            passed += 1
        else:
            print(f"  ✗ {description}")
            failed += 1
    
    print()
    return passed, failed

def main():
    print("=== Validating Scroll Removal When Unnecessary Property Test ===\n")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_file_path = os.path.join(script_dir, 'scroll-removal-unnecessary-property.test.js')
    html_file_path = os.path.join(script_dir, 'test-scroll-removal-unnecessary-property.html')
    
    # Validation checks for test file
    test_file_checks = [
        ("Contains Property 11 header comment", 
         lambda c: "Property 11: Scroll Removal When Unnecessary" in c),
        ("Validates Requirements 3.5", 
         lambda c: "**Validates: Requirements 3.5**" in c),
        ("Imports OverflowHandler", 
         lambda c: "OverflowHandler" in c),
        ("Exports test function", 
         lambda c: "runScrollRemovalUnnecessaryPropertyTest" in c),
        ("Uses fast-check library", 
         lambda c: "fc.assert" in c and "fc.asyncProperty" in c),
        ("Tests 100 iterations (numRuns: 100)", 
         lambda c: "numRuns: 100" in c),
        ("Property 1: Scrolling removed when maxHeight increases", 
         lambda c: "Property 1: Scrolling removed when maxHeight increases to fit content" in c),
        ("Property 2: Event listeners removed", 
         lambda c: "Property 2: Event listeners removed when scrolling removed" in c),
        ("Property 3: Container no longer tracked", 
         lambda c: "Property 3: Container no longer tracked after scroll removal" in c),
        ("Property 4: Scroll removal is idempotent", 
         lambda c: "Property 4: Scroll removal is idempotent" in c),
        ("Property 5: Elements remain in container", 
         lambda c: "Property 5: Elements remain in container after scroll removal" in c),
        ("Property 6: needsScrolling returns false", 
         lambda c: "Property 6: needsScrolling returns false when content fits" in c),
        ("Tests removeScrolling method", 
         lambda c: "handler.removeScrolling(container)" in c),
        ("Verifies overflow styles are cleared", 
         lambda c: "overflowY" in c and "maxHeight" in c),
        ("Verifies scroll indicators are removed", 
         lambda c: "scroll-indicator" in c),
        ("Verifies event handlers are removed", 
         lambda c: "_scrollHandler" in c and "_touchStartHandler" in c),
        ("Uses createTestElements helper", 
         lambda c: "function createTestElements" in c),
        ("Uses calculateTotalHeight helper", 
         lambda c: "function calculateTotalHeight" in c),
        ("Includes proper cleanup (destroy and removeChild)", 
         lambda c: "destroy()" in c and "removeChild" in c),
        ("Returns test results object", 
         lambda c: "return results" in c),
    ]
    
    # Validation checks for HTML file
    html_file_checks = [
        ("Contains proper title", 
         lambda c: "Property Test: Scroll Removal When Unnecessary" in c),
        ("References Property 11", 
         lambda c: "Property 11" in c),
        ("Validates Requirements 3.5", 
         lambda c: "Requirements 3.5" in c),
        ("Loads fast-check library", 
         lambda c: "setup-fast-check.js" in c),
        ("Loads OverflowHandler", 
         lambda c: "overflow-handler.js" in c),
        ("Loads property test file", 
         lambda c: "scroll-removal-unnecessary-property.test.js" in c),
        ("Has run test button", 
         lambda c: "run-test-btn" in c and "runTest()" in c),
        ("Has test output area", 
         lambda c: "test-output" in c),
        ("Calls runScrollRemovalUnnecessaryPropertyTest", 
         lambda c: "runScrollRemovalUnnecessaryPropertyTest" in c),
        ("Displays test results", 
         lambda c: "results.passed" in c and "results.failed" in c),
    ]
    
    # Run validations
    print("Validating Test File:\n")
    test_passed, test_failed = validate_file(test_file_path, test_file_checks)
    
    print("Validating HTML Test Runner:\n")
    html_passed, html_failed = validate_file(html_file_path, html_file_checks)
    
    # Calculate totals
    total_passed = test_passed + html_passed
    total_failed = test_failed + html_failed
    total_checks = total_passed + total_failed
    
    # Print summary
    print("=== Validation Summary ===")
    print(f"Total Checks: {total_checks}")
    print(f"Passed: {total_passed}")
    print(f"Failed: {total_failed}")
    print(f"Success Rate: {(total_passed / total_checks * 100):.1f}%\n")
    
    if total_failed == 0:
        print("✅ All validations passed! Test implementation is correct.\n")
        return 0
    else:
        print("❌ Some validations failed. Please review the implementation.\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
