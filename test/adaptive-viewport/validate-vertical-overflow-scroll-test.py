#!/usr/bin/env python3

"""
Validation script for vertical overflow scroll property test
Verifies test structure and completeness
"""

import os
import sys

def validate(condition, message):
    """Validate a condition and print result"""
    if condition:
        print(f"✓ {message}")
        return True
    else:
        print(f"✗ {message}")
        return False

def main():
    print("\n=== Validating Vertical Overflow Scroll Property Test ===\n")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_file = os.path.join(script_dir, 'vertical-overflow-scroll-property.test.js')
    html_file = os.path.join(script_dir, 'test-vertical-overflow-scroll-property.html')
    
    validations_passed = 0
    validations_failed = 0
    
    # Check test file exists
    if validate(os.path.exists(test_file), 'Test file exists'):
        validations_passed += 1
    else:
        validations_failed += 1
        print(f"  Expected: {test_file}")
    
    # Check HTML runner exists
    if validate(os.path.exists(html_file), 'HTML test runner exists'):
        validations_passed += 1
    else:
        validations_failed += 1
        print(f"  Expected: {html_file}")
    
    if os.path.exists(test_file):
        with open(test_file, 'r', encoding='utf-8') as f:
            test_content = f.read()
        
        # Check for required header information
        checks = [
            ('Property 8: Vertical Overflow Creates Scroll Container' in test_content,
             'Test has correct property title'),
            ('**Validates: Requirements 3.1**' in test_content,
             'Test validates correct requirement'),
            ('Feature: adaptive-viewport-optimizer' in test_content,
             'Test has correct feature tag'),
            ('async function runVerticalOverflowScrollPropertyTest(fc)' in test_content,
             'Test has main async function'),
            ('fc.assert' in test_content,
             'Test uses fast-check assertions'),
            ('fc.asyncProperty' in test_content,
             'Test uses async properties'),
            ('numRuns: 100' in test_content,
             'Test runs minimum 100 iterations'),
            ('Property 1:' in test_content,
             'Test includes Property 1'),
            ('Property 2:' in test_content,
             'Test includes Property 2'),
            ('Property 3:' in test_content,
             'Test includes Property 3'),
            ('Property 4:' in test_content,
             'Test includes Property 4'),
            ('Property 5:' in test_content,
             'Test includes Property 5'),
            ('Container should be scrollable when content exceeds maxHeight' in test_content,
             'Property 1: Scrollable container creation'),
            ('Container should have smooth scroll behavior when configured' in test_content,
             'Property 2: Smooth scroll behavior'),
            ('All elements should be contained within scroll container' in test_content,
             'Property 3: Element containment'),
            ('Container should have proper ARIA attributes' in test_content,
             'Property 4: ARIA attributes'),
            ('Vertical stacking should maintain minimum spacing' in test_content,
             'Property 5: Minimum spacing'),
            ('new OverflowHandler' in test_content,
             'Test creates OverflowHandler instances'),
            ('createScrollContainer' in test_content,
             'Test calls createScrollContainer method'),
            ('handler.destroy()' in test_content,
             'Test includes cleanup with destroy()'),
            ('document.body.removeChild(container)' in test_content,
             'Test removes elements from DOM'),
            ('function createTestElements' in test_content,
             'Test has createTestElements helper'),
            ('function calculateTotalHeight' in test_content,
             'Test has calculateTotalHeight helper'),
            ('catch (error)' in test_content,
             'Test includes error handling'),
            ('results.passed++' in test_content,
             'Test tracks passed results'),
            ('results.failed++' in test_content,
             'Test tracks failed results'),
            ('module.exports' in test_content,
             'Test exports function for Node.js'),
            ('Test Summary' in test_content,
             'Test prints summary'),
            ('Success Rate' in test_content,
             'Test calculates success rate'),
        ]
        
        for condition, message in checks:
            if validate(condition, message):
                validations_passed += 1
            else:
                validations_failed += 1
    
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Check HTML structure
        html_checks = [
            ('<!DOCTYPE html>' in html_content,
             'HTML has DOCTYPE declaration'),
            ('Property Test: Vertical Overflow Scroll Container' in html_content,
             'HTML has correct title'),
            ('setup-fast-check.js' in html_content,
             'HTML loads fast-check setup'),
            ('overflow-handler.js' in html_content,
             'HTML loads OverflowHandler'),
            ('vertical-overflow-scroll-property.test.js' in html_content,
             'HTML loads test file'),
            ('id="runTests"' in html_content,
             'HTML has run tests button'),
            ('id="output"' in html_content,
             'HTML has output div'),
            ('id="status"' in html_content,
             'HTML has status indicator'),
            ('Property 8:' in html_content,
             'HTML displays property number'),
            ('Requirements 3.1' in html_content,
             'HTML displays requirement validation'),
            ('Long-Running Test Warning' in html_content,
             'HTML includes performance warning'),
            ('runVerticalOverflowScrollPropertyTest(fc)' in html_content,
             'HTML calls test function'),
        ]
        
        for condition, message in html_checks:
            if validate(condition, message):
                validations_passed += 1
            else:
                validations_failed += 1
    
    # Print summary
    print('\n=== Validation Summary ===')
    print(f'Total Validations: {validations_passed + validations_failed}')
    print(f'Passed: {validations_passed}')
    print(f'Failed: {validations_failed}')
    
    if validations_failed == 0:
        print('\n✅ All validations passed! Test is ready to run.\n')
        return 0
    else:
        print('\n❌ Some validations failed. Please review the test implementation.\n')
        return 1

if __name__ == '__main__':
    sys.exit(main())
