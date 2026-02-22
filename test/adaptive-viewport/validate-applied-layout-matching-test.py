#!/usr/bin/env python3

"""
Validation Script for Applied Layout Matching Property Test
Validates that the property test is correctly implemented and can run
"""

import os
import re
import sys

def main():
    print("=== Validating Applied Layout Matching Property Test ===\n")
    
    validations_passed = 0
    validations_failed = 0
    
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Validation 1: Check test file exists
    print("Validation 1: Checking test file exists...")
    test_file = os.path.join(script_dir, "applied-layout-matching-property.test.js")
    if os.path.exists(test_file):
        print("✓ Test file exists\n")
        validations_passed += 1
    else:
        print("✗ Test file not found\n")
        validations_failed += 1
        return validations_passed, validations_failed
    
    # Validation 2: Check HTML runner exists
    print("Validation 2: Checking HTML test runner exists...")
    html_file = os.path.join(script_dir, "test-applied-layout-matching-property.html")
    if os.path.exists(html_file):
        print("✓ HTML test runner exists\n")
        validations_passed += 1
    else:
        print("✗ HTML test runner not found\n")
        validations_failed += 1
    
    # Read test file content
    with open(test_file, 'r', encoding='utf-8') as f:
        test_content = f.read()
    
    # Validation 3: Check test file structure
    print("Validation 3: Checking test file structure...")
    
    required_elements = [
        ("Property 13 comment", r"Property 13: Applied Layout Matches Calculated Layout"),
        ("Requirements validation", r"Validates: Requirements 4\.2"),
        ("Test function export", r"runAppliedLayoutMatchingPropertyTest"),
        ("fast-check usage", r"fc\.assert"),
        ("Position tolerance constant", r"POSITION_TOLERANCE\s*=\s*1"),
        ("Property 1 test", r"Property 1:.*Single element"),
        ("Property 2 test", r"Property 2:.*Multiple elements"),
        ("Property 3 test", r"Property 3:.*Complete layout"),
        ("Property 4 test", r"Property 4:.*Multiple updates"),
        ("Property 5 test", r"Property 5:.*1px tolerance"),
        ("Position matching function", r"positionsMatch"),
        ("DOMUpdater usage", r"new DOMUpdater"),
        ("Async property tests", r"fc\.asyncProperty"),
        ("Test cleanup", r"cleanupElements")
    ]
    
    structure_valid = True
    for name, pattern in required_elements:
        if re.search(pattern, test_content):
            print(f"  ✓ {name} found")
        else:
            print(f"  ✗ {name} missing")
            structure_valid = False
    
    if structure_valid:
        print("✓ Test file structure is valid\n")
        validations_passed += 1
    else:
        print("✗ Test file structure is incomplete\n")
        validations_failed += 1
    
    # Read HTML file content
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Validation 4: Check HTML runner structure
    print("Validation 4: Checking HTML runner structure...")
    
    required_html_elements = [
        ("Property 13 title", r"Property 13.*Applied Layout Matches Calculated Layout"),
        ("Requirements reference", r"Requirements 4\.2"),
        ("fast-check script", r"setup-fast-check\.js"),
        ("DOMUpdater script", r"dom-updater\.js"),
        ("Test script", r"applied-layout-matching-property\.test\.js"),
        ("Run button", r'id="runTests"'),
        ("Output area", r'id="output"'),
        ("Status area", r'id="status"'),
        ("Test area", r'id="test-area"'),
        ("Test function call", r"runAppliedLayoutMatchingPropertyTest")
    ]
    
    html_valid = True
    for name, pattern in required_html_elements:
        if re.search(pattern, html_content):
            print(f"  ✓ {name} found")
        else:
            print(f"  ✗ {name} missing")
            html_valid = False
    
    if html_valid:
        print("✓ HTML runner structure is valid\n")
        validations_passed += 1
    else:
        print("✗ HTML runner structure is incomplete\n")
        validations_failed += 1
    
    # Validation 5: Check test configuration
    print("Validation 5: Checking test configuration...")
    
    config_checks = [
        ("100 iterations for Property 1", r"numRuns:\s*100.*Property 1"),
        ("100 iterations for Property 2", r"numRuns:\s*100.*Property 2"),
        ("100 iterations for Property 3", r"numRuns:\s*100.*Property 3"),
        ("50 iterations for Property 4", r"numRuns:\s*50.*Property 4"),
        ("100 iterations for Property 5", r"numRuns:\s*100.*Property 5"),
        ("60 second timeout", r"timeout:\s*60000"),
        ("1px tolerance", r"POSITION_TOLERANCE\s*=\s*1")
    ]
    
    config_valid = True
    for name, pattern in config_checks:
        if re.search(pattern, test_content, re.DOTALL):
            print(f"  ✓ {name} configured")
        else:
            print(f"  ✗ {name} not configured")
            config_valid = False
    
    if config_valid:
        print("✓ Test configuration is valid\n")
        validations_passed += 1
    else:
        print("✗ Test configuration is incomplete\n")
        validations_failed += 1
    
    # Validation 6: Check property test coverage
    print("Validation 6: Checking property test coverage...")
    
    property_tests = [
        ("Single element position matching", r"Property 1:.*Single element.*position.*match"),
        ("Batch update position matching", r"Property 2:.*Multiple elements.*batch"),
        ("Complete layout configuration", r"Property 3:.*Complete layout.*configuration"),
        ("Multiple updates accuracy", r"Property 4:.*Multiple updates.*accuracy"),
        ("Tolerance boundary test", r"Property 5:.*1px tolerance")
    ]
    
    coverage_valid = True
    for name, pattern in property_tests:
        if re.search(pattern, test_content, re.IGNORECASE):
            print(f"  ✓ {name} tested")
        else:
            print(f"  ✗ {name} not tested")
            coverage_valid = False
    
    if coverage_valid:
        print("✓ Property test coverage is complete\n")
        validations_passed += 1
    else:
        print("✗ Property test coverage is incomplete\n")
        validations_failed += 1
    
    # Validation 7: Check dependencies
    print("Validation 7: Checking dependencies...")
    
    dependencies = [
        ("DOMUpdater", "../../js/adaptive-viewport/dom-updater.js"),
        ("LayoutOptimizer", "../../js/adaptive-viewport/layout-optimizer.js"),
        ("Constants", "../../js/adaptive-viewport/constants.js"),
        ("Types", "../../js/adaptive-viewport/types.js")
    ]
    
    deps_valid = True
    for name, dep_path in dependencies:
        full_path = os.path.join(script_dir, dep_path)
        if os.path.exists(full_path):
            print(f"  ✓ {name} exists")
        else:
            print(f"  ✗ {name} not found at {dep_path}")
            deps_valid = False
    
    if deps_valid:
        print("✓ All dependencies exist\n")
        validations_passed += 1
    else:
        print("✗ Some dependencies are missing\n")
        validations_failed += 1
    
    # Print summary
    print("=" * 60)
    print("Validation Summary")
    print("=" * 60)
    print(f"Total Validations: {validations_passed + validations_failed}")
    print(f"Passed: {validations_passed}")
    print(f"Failed: {validations_failed}")
    print(f"Success Rate: {(validations_passed / (validations_passed + validations_failed) * 100):.1f}%")
    print()
    
    if validations_failed == 0:
        print("✅ All validations passed! Test is ready to run.")
        print()
        print("To run the test:")
        print("  1. Open test-applied-layout-matching-property.html in a browser")
        print("  2. Click 'Run Property Tests'")
        print("  3. Wait for all 450 iterations to complete")
        print()
        return 0
    else:
        print("❌ Some validations failed. Please fix the issues above.")
        print()
        return 1

if __name__ == "__main__":
    sys.exit(main())
