#!/usr/bin/env python3
"""
Validate Test Suite Completeness
Checks that all required test files exist and are properly structured
"""

import os
import re
from pathlib import Path

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
BOLD = '\033[1m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BOLD}{BLUE}{'=' * 70}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'=' * 70}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def check_file_exists(filepath):
    """Check if a file exists and return its size"""
    path = Path(filepath)
    if path.exists():
        size = path.stat().st_size
        return True, size
    return False, 0

def count_tests_in_file(filepath):
    """Count the number of tests in a JavaScript test file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Count test() and fc.assert() calls
            test_count = len(re.findall(r'\btest\s*\(', content))
            property_count = len(re.findall(r'fc\.assert\s*\(', content))
            describe_count = len(re.findall(r'\bdescribe\s*\(', content))
            return test_count, property_count, describe_count
    except Exception as e:
        return 0, 0, 0

def validate_test_file(filepath, expected_properties=None):
    """Validate a test file's structure and content"""
    exists, size = check_file_exists(filepath)
    
    if not exists:
        print_error(f"File not found: {filepath}")
        return False
    
    if size == 0:
        print_error(f"File is empty: {filepath}")
        return False
    
    test_count, property_count, describe_count = count_tests_in_file(filepath)
    
    print_success(f"Found: {filepath}")
    print(f"   Size: {size:,} bytes")
    print(f"   Test blocks: {test_count}")
    print(f"   Property tests: {property_count}")
    print(f"   Describe blocks: {describe_count}")
    
    if expected_properties and property_count < expected_properties:
        print_warning(f"   Expected at least {expected_properties} property tests, found {property_count}")
    
    return True

def validate_html_runner(filepath):
    """Validate an HTML test runner file"""
    exists, size = check_file_exists(filepath)
    
    if not exists:
        print_error(f"HTML runner not found: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Check for test script includes
            has_test_script = '<script src="test/' in content
            has_fastcheck = 'fast-check' in content or 'fc.' in content
            
            print_success(f"Found: {filepath}")
            print(f"   Size: {size:,} bytes")
            print(f"   Includes test scripts: {'Yes' if has_test_script else 'No'}")
            print(f"   Uses fast-check: {'Yes' if has_fastcheck else 'No'}")
            
            return True
    except Exception as e:
        print_error(f"Error reading {filepath}: {e}")
        return False

def main():
    print_header("🔍 TEST SUITE COMPLETENESS VALIDATION")
    print_info("Checking all responsive settings menu test files...")
    
    results = {
        'test_files': [],
        'html_runners': [],
        'missing': []
    }
    
    # Define expected test files
    test_files = [
        ('test/responsive-settings-menu-properties.test.js', 19),  # 19 properties
        ('test/responsive-settings-menu-integration.test.js', None),
        ('test/responsive-settings-menu-feature-preservation.test.js', None),
        ('test/responsive-settings-menu-aria.test.js', None),
        ('test/responsive-settings-menu-animations.test.js', None),
        ('test/board-size-calculation.test.js', None),
    ]
    
    html_runners = [
        'test-responsive-settings-menu-properties.html',
        'test-responsive-settings-menu-integration.html',
        'test-feature-preservation.html',
        'test-aria-attributes.html',
        'test-responsive-menu-checkpoint-6.html',
        'test-board-size-calculation.html',
    ]
    
    # Validate test files
    print_header("📝 JavaScript Test Files")
    for filepath, expected_props in test_files:
        print()
        if validate_test_file(filepath, expected_props):
            results['test_files'].append(filepath)
        else:
            results['missing'].append(filepath)
    
    # Validate HTML runners
    print_header("🌐 HTML Test Runners")
    for filepath in html_runners:
        print()
        if validate_html_runner(filepath):
            results['html_runners'].append(filepath)
        else:
            results['missing'].append(filepath)
    
    # Check for implementation files
    print_header("🔧 Implementation Files")
    impl_files = [
        'js/responsive-layout-manager.js',
        'js/settings-menu-manager.js',
        'css/responsive-settings-menu.css',
    ]
    
    for filepath in impl_files:
        print()
        exists, size = check_file_exists(filepath)
        if exists:
            print_success(f"Found: {filepath} ({size:,} bytes)")
        else:
            print_error(f"Missing: {filepath}")
            results['missing'].append(filepath)
    
    # Print summary
    print_header("📊 VALIDATION SUMMARY")
    
    total_expected = len(test_files) + len(html_runners) + len(impl_files)
    total_found = len(results['test_files']) + len(results['html_runners'])
    total_found += sum(1 for f in impl_files if check_file_exists(f)[0])
    
    print(f"\n{BOLD}Files Status:{RESET}")
    print(f"  Expected: {total_expected}")
    print(f"  {GREEN}Found:    {total_found}{RESET}")
    print(f"  {RED}Missing:  {len(results['missing'])}{RESET}")
    
    print(f"\n{BOLD}Test Files:{RESET}")
    print(f"  {GREEN}✅ {len(results['test_files'])}/{len(test_files)} JavaScript test files{RESET}")
    print(f"  {GREEN}✅ {len(results['html_runners'])}/{len(html_runners)} HTML test runners{RESET}")
    
    if results['missing']:
        print(f"\n{BOLD}{RED}Missing Files:{RESET}")
        for filepath in results['missing']:
            print(f"  {RED}❌ {filepath}{RESET}")
    
    # Final status
    print_header("🎯 FINAL STATUS")
    
    if len(results['missing']) == 0:
        print_success("All test files are present and properly structured!")
        print()
        print_info("Test suites are ready for execution.")
        print_info("These are browser-based tests that need to be run in a web browser.")
        print()
        print(f"{BOLD}To run the tests:{RESET}")
        print("  1. Open each HTML test runner in a web browser")
        print("  2. Click the 'Run Tests' button")
        print("  3. Verify all tests pass")
        print()
        print(f"{BOLD}Test Runners to Execute:{RESET}")
        for runner in html_runners:
            print(f"  • {runner}")
        return 0
    else:
        print_error(f"{len(results['missing'])} file(s) are missing!")
        print_info("Please ensure all required files are present.")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
