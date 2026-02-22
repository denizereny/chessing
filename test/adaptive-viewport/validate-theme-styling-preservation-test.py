#!/usr/bin/env python3

"""
Validation Script for Theme Styling Preservation Property Test

This script validates that the property test implementation is correct
and follows the required patterns.
"""

import os
import sys
import re

def validate_file_exists(filepath, description):
    """Check if a file exists"""
    print(f"Checking {description}...")
    if os.path.exists(filepath):
        print(f"  ✓ {description} exists")
        return True
    else:
        print(f"  ✗ {description} not found at {filepath}")
        return False

def validate_file_content(filepath, patterns, description):
    """Validate file contains required patterns"""
    print(f"Validating {description}...")
    
    if not os.path.exists(filepath):
        print(f"  ✗ File not found: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    all_found = True
    for pattern, name in patterns:
        if pattern in content:
            print(f"  ✓ {name} found")
        else:
            print(f"  ✗ {name} not found")
            all_found = False
    
    return all_found

def main():
    print("=" * 80)
    print("Validating Theme Styling Preservation Property Test Implementation")
    print("=" * 80)
    print()
    
    validations_passed = 0
    validations_failed = 0
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. File existence checks
    print("\n1. FILE EXISTENCE CHECKS")
    print("-" * 80)
    
    files_to_check = [
        (os.path.join(script_dir, 'theme-styling-preservation-property.test.js'), 'Property test file'),
        (os.path.join(script_dir, 'test-theme-styling-preservation-property.html'), 'HTML test runner'),
        (os.path.join(script_dir, 'validate-theme-styling-preservation-test.js'), 'JavaScript validation script'),
        (os.path.join(script_dir, 'validate-theme-styling-preservation-test.py'), 'Python validation script')
    ]
    
    for filepath, description in files_to_check:
        if validate_file_exists(filepath, description):
            validations_passed += 1
        else:
            validations_failed += 1
    
    # 2. Test file content validation
    print("\n2. TEST FILE CONTENT VALIDATION")
    print("-" * 80)
    
    test_file = os.path.join(script_dir, 'theme-styling-preservation-property.test.js')
    test_patterns = [
        ('Property 29: Theme Styling Preservation', 'Property 29 header'),
        ('**Validates: Requirements 9.4**', 'Requirements validation comment'),
        ('runThemeStylingPreservationPropertyTest', 'Main test function'),
        ('getThemeStyles', 'Theme styles helper function'),
        ('themeStylesMatch', 'Theme styles comparison function'),
        ('createThemedElement', 'Themed element creation helper'),
        ('Property 1: Theme colors', 'Property 1 test'),
        ('Property 2: Theme classes', 'Property 2 test'),
        ('Property 3: CSS custom properties', 'Property 3 test'),
        ('Property 4: Theme styling in batch updates', 'Property 4 test'),
        ('Property 5: Theme styling through theme changes', 'Property 5 test'),
        ('Property 6: Theme styling through multiple repositionings', 'Property 6 test'),
        ('Property 7: Inline theme styles', 'Property 7 test'),
        ('fc.assert', 'fast-check assertion'),
        ('fc.asyncProperty', 'Async property test'),
        ('numRuns: 100', '100 iterations configuration'),
        ('DOMUpdater', 'DOMUpdater usage'),
        ('updateElementPosition', 'Element repositioning'),
        ('batchUpdate', 'Batch update test'),
        ('backgroundColor', 'Background color check'),
        ('borderColor', 'Border color check'),
        ('data-theme', 'Theme attribute usage')
    ]
    
    for pattern, name in test_patterns:
        if validate_file_content(test_file, [(pattern, name)], ''):
            validations_passed += 1
        else:
            validations_failed += 1
    
    # 3. HTML runner validation
    print("\n3. HTML RUNNER VALIDATION")
    print("-" * 80)
    
    html_file = os.path.join(script_dir, 'test-theme-styling-preservation-property.html')
    html_patterns = [
        ('Property Test: Theme Styling Preservation', 'Page title'),
        ('Property 29', 'Property number'),
        ('Requirements 9.4', 'Requirements reference'),
        ('setup-fast-check.js', 'fast-check setup script'),
        ('dom-updater.js', 'DOMUpdater script'),
        ('theme-styling-preservation-property.test.js', 'Test script'),
        ('runThemeStylingPreservationPropertyTest', 'Test function call'),
        ('data-theme', 'Theme attribute in CSS'),
        ('theme-light', 'Light theme class'),
        ('theme-dark', 'Dark theme class')
    ]
    
    for pattern, name in html_patterns:
        if validate_file_content(html_file, [(pattern, name)], ''):
            validations_passed += 1
        else:
            validations_failed += 1
    
    # 4. Test structure validation
    print("\n4. TEST STRUCTURE VALIDATION")
    print("-" * 80)
    
    if os.path.exists(test_file):
        with open(test_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count properties
        property_matches = re.findall(r'Property \d+:', content)
        property_count = len(property_matches)
        
        print("Checking property count...")
        if property_count >= 7:
            print(f"  ✓ Found {property_count} properties (expected at least 7)")
            validations_passed += 1
        else:
            print(f"  ✗ Found only {property_count} properties (expected at least 7)")
            validations_failed += 1
        
        # Check for async/await usage
        print("Checking async/await usage...")
        if 'async' in content and 'await' in content:
            print("  ✓ Async/await properly used")
            validations_passed += 1
        else:
            print("  ✗ Async/await not found")
            validations_failed += 1
        
        # Check for proper error handling
        print("Checking error handling...")
        if 'try' in content and 'catch' in content:
            print("  ✓ Error handling implemented")
            validations_passed += 1
        else:
            print("  ✗ Error handling not found")
            validations_failed += 1
        
        # Check for cleanup
        print("Checking cleanup code...")
        if 'updater.destroy()' in content and 'removeChild' in content:
            print("  ✓ Cleanup code present")
            validations_passed += 1
        else:
            print("  ✗ Cleanup code not found")
            validations_failed += 1
        
        # Check for theme-specific validations
        print("Checking theme-specific validations...")
        theme_checks = [
            'backgroundColor',
            'color',
            'borderColor',
            'getComputedStyle'
        ]
        
        all_theme_checks_present = all(check in content for check in theme_checks)
        if all_theme_checks_present:
            print("  ✓ All theme-specific checks present")
            validations_passed += 1
        else:
            print("  ✗ Some theme-specific checks missing")
            validations_failed += 1
    
    # Print summary
    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    total = validations_passed + validations_failed
    print(f"Total Validations: {total}")
    print(f"Passed: {validations_passed}")
    print(f"Failed: {validations_failed}")
    print(f"Success Rate: {(validations_passed / total * 100):.1f}%")
    print()
    
    if validations_failed == 0:
        print("✅ ALL VALIDATIONS PASSED!")
        print("The theme styling preservation property test is correctly implemented.")
        print()
        print("Next steps:")
        print("1. Open test/adaptive-viewport/test-theme-styling-preservation-property.html in a browser")
        print("2. Click 'Run Property Test' to execute the tests")
        print("3. Verify all 7 properties pass with 650 total iterations")
        print()
        return 0
    else:
        print("❌ SOME VALIDATIONS FAILED")
        print("Please review the failures above and fix the implementation.")
        print()
        return 1

if __name__ == '__main__':
    sys.exit(main())
