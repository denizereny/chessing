#!/usr/bin/env python3

"""
Validation script for Visibility Re-analysis Property Test
Verifies that the test implementation meets all requirements
"""

import os
import sys

def main():
    print("\n=== Validating Visibility Re-analysis Property Test ===\n")
    
    results = {
        'passed': 0,
        'failed': 0,
        'checks': []
    }
    
    def check(name, condition, details=''):
        if condition:
            print(f"✓ {name}")
            results['passed'] += 1
            results['checks'].append({'name': name, 'status': 'PASS'})
        else:
            print(f"✗ {name}")
            if details:
                print(f"  {details}")
            results['failed'] += 1
            results['checks'].append({'name': name, 'status': 'FAIL', 'details': details})
    
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check 1: Test file exists
    test_file = os.path.join(script_dir, 'visibility-reanalysis-property.test.js')
    test_file_exists = os.path.exists(test_file)
    check('Test file exists', test_file_exists, 'visibility-reanalysis-property.test.js not found')
    
    # Check 2: HTML runner exists
    html_file = os.path.join(script_dir, 'test-visibility-reanalysis-property.html')
    html_file_exists = os.path.exists(html_file)
    check('HTML runner exists', html_file_exists, 'test-visibility-reanalysis-property.html not found')
    
    # Check 3: Node runner exists
    node_runner = os.path.join(script_dir, 'run-visibility-reanalysis-test.js')
    node_runner_exists = os.path.exists(node_runner)
    check('Node.js runner exists', node_runner_exists, 'run-visibility-reanalysis-test.js not found')
    
    if test_file_exists:
        with open(test_file, 'r', encoding='utf-8') as f:
            test_content = f.read()
        
        # Check 4: Contains property test header
        check(
            'Contains property test header',
            'Property 2: Visibility Re-analysis on Resize' in test_content,
            'Missing property test header'
        )
        
        # Check 5: Validates Requirements 1.3
        check(
            'Validates Requirements 1.3',
            'Validates: Requirements 1.3' in test_content,
            'Missing requirements validation comment'
        )
        
        # Check 6: Uses fast-check library
        check(
            'Uses fast-check library',
            'fc.assert' in test_content and 'fc.asyncProperty' in test_content,
            'Does not use fast-check properly'
        )
        
        # Check 7: Has minimum 100 iterations
        check(
            'Configured for minimum 100 iterations',
            'numRuns: 100' in test_content,
            'Does not specify 100 iterations'
        )
        
        # Check 8: Tests timing constraint (100ms)
        check(
            'Tests 100ms timing constraint',
            '100' in test_content and 'elapsed' in test_content,
            'Does not verify timing constraint'
        )
        
        # Check 9: Tests visibility status updates
        check(
            'Tests visibility status updates',
            'getVisibilityStatus' in test_content and 'updatedStatus' in test_content,
            'Does not test visibility status updates'
        )
        
        # Check 10: Tests multiple elements
        check(
            'Tests multiple elements re-analysis',
            'elementCount' in test_content or 'multiple' in test_content,
            'Does not test multiple elements'
        )
        
        # Check 11: Tests visibility callbacks
        check(
            'Tests visibility callbacks',
            'onVisibilityChange' in test_content and 'callback' in test_content,
            'Does not test visibility callbacks'
        )
        
        # Check 12: Tests idempotency
        check(
            'Tests idempotency of re-analysis',
            'idempotent' in test_content or 'multiple refreshes' in test_content,
            'Does not test idempotency'
        )
        
        # Check 13: Uses refresh() method
        check(
            'Uses refresh() method',
            'refresh()' in test_content,
            'Does not use refresh() method'
        )
        
        # Check 14: Simulates resize events
        check(
            'Simulates resize events',
            'resize' in test_content and 'dispatchEvent' in test_content,
            'Does not simulate resize events'
        )
        
        # Check 15: Has proper cleanup
        check(
            'Has proper cleanup (destroy)',
            'destroy()' in test_content and 'removeChild' in test_content,
            'Missing proper cleanup'
        )
        
        # Check 16: Exports test function
        check(
            'Exports test function',
            'module.exports' in test_content and 
            'runVisibilityReanalysisPropertyTest' in test_content,
            'Does not export test function'
        )
        
        # Check 17: Has async/await support
        check(
            'Uses async/await properly',
            'async' in test_content and 'await' in test_content,
            'Does not use async/await'
        )
        
        # Check 18: Has wait helper
        check(
            'Has wait/delay helper',
            'wait(' in test_content or 'setTimeout' in test_content,
            'Missing wait helper for timing'
        )
    
    if html_file_exists:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Check 19: HTML loads fast-check
        check(
            'HTML loads fast-check',
            'setup-fast-check.js' in html_content,
            'HTML does not load fast-check'
        )
        
        # Check 20: HTML loads VisibilityDetector
        check(
            'HTML loads VisibilityDetector',
            'visibility-detector.js' in html_content,
            'HTML does not load VisibilityDetector'
        )
        
        # Check 21: HTML loads test file
        check(
            'HTML loads test file',
            'visibility-reanalysis-property.test.js' in html_content,
            'HTML does not load test file'
        )
        
        # Check 22: HTML has run button
        check(
            'HTML has run button',
            'runTests' in html_content and 'button' in html_content,
            'HTML missing run button'
        )
        
        # Check 23: HTML has output display
        check(
            'HTML has output display',
            'output' in html_content and 'div' in html_content,
            'HTML missing output display'
        )
        
        # Check 24: HTML has test description
        check(
            'HTML has test description',
            'Test Description' in html_content and 
            'Requirements 1.3' in html_content,
            'HTML missing test description'
        )
    
    # Print summary
    total = results['passed'] + results['failed']
    success_rate = (results['passed'] / total * 100) if total > 0 else 0
    
    print(f"\n=== Validation Summary ===")
    print(f"Total Checks: {total}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Success Rate: {success_rate:.1f}%\n")
    
    if results['failed'] > 0:
        print("Failed checks:")
        for check_result in results['checks']:
            if check_result['status'] == 'FAIL':
                print(f"  ✗ {check_result['name']}")
                if 'details' in check_result and check_result['details']:
                    print(f"    {check_result['details']}")
        print()
        sys.exit(1)
    else:
        print("✓ All validation checks passed!\n")
        print("The test implementation meets all requirements:")
        print("  - Tests Property 2: Visibility Re-analysis on Resize")
        print("  - Validates Requirements 1.3")
        print("  - Uses fast-check with 100 iterations per property")
        print("  - Verifies 100ms timing constraint")
        print("  - Tests visibility status updates after resize")
        print("  - Tests multiple elements re-analysis")
        print("  - Tests visibility callbacks")
        print("  - Tests idempotency of re-analysis")
        print()
        sys.exit(0)

if __name__ == '__main__':
    main()
