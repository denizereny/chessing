#!/usr/bin/env python3

"""
Validation Script for Orientation Handling Property Test
Verifies that the property test is correctly implemented
"""

import os
import sys
import re

print('=== Validating Orientation Handling Property Test ===\n')

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
            print(f'  Details: {details}')
        results['failed'] += 1
        results['checks'].append({'name': name, 'status': 'FAIL', 'details': details})

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check 1: Test file exists
test_file_path = os.path.join(script_dir, 'orientation-handling-property.test.js')
test_file_exists = os.path.exists(test_file_path)
check('Test file exists', test_file_exists, 
      '' if test_file_exists else 'File not found: orientation-handling-property.test.js')

if not test_file_exists:
    print('\n❌ Cannot proceed with validation - test file not found')
    sys.exit(1)

# Check 2: HTML runner exists
html_file_path = os.path.join(script_dir, 'test-orientation-handling-property.html')
html_file_exists = os.path.exists(html_file_path)
check('HTML test runner exists', html_file_exists, 
      '' if html_file_exists else 'File not found: test-orientation-handling-property.html')

# Read test file content
with open(test_file_path, 'r', encoding='utf-8') as f:
    test_content = f.read()

# Check 3: Property 18 annotation present
has_property_18 = 'Property 18: Orientation Handling' in test_content
check('Property 18 annotation present', has_property_18, 
      'Missing "Property 18: Orientation Handling" annotation')

# Check 4: Validates Requirements 5.4
validates_req_54 = 'Validates: Requirements 5.4' in test_content
check('Validates Requirements 5.4', validates_req_54, 
      'Missing "Validates: Requirements 5.4" annotation')

# Check 5: Uses fast-check library
uses_fast_check = 'fc.assert' in test_content and 'fc.asyncProperty' in test_content
check('Uses fast-check library', uses_fast_check, 
      'Missing fast-check usage (fc.assert, fc.asyncProperty)')

# Check 6: Tests portrait orientation
tests_portrait = 'portrait' in test_content and 'viewportHeight > config.viewportWidth' in test_content
check('Tests portrait orientation', tests_portrait, 
      'Missing portrait orientation test logic')

# Check 7: Tests landscape orientation
tests_landscape = 'landscape' in test_content and 'viewportWidth > config.viewportHeight' in test_content
check('Tests landscape orientation', tests_landscape, 
      'Missing landscape orientation test logic')

# Check 8: Tests orientation change
tests_orientation_change = 'Orientation change' in test_content or 'orientation change' in test_content
check('Tests orientation change', tests_orientation_change, 
      'Missing orientation change test')

# Check 9: Minimum 100 iterations per property
num_runs_100 = re.findall(r'numRuns:\s*100', test_content)
has_enough_iterations = len(num_runs_100) >= 3
check('Minimum 100 iterations per property', has_enough_iterations, 
      '' if has_enough_iterations else 'Not all properties run 100 iterations')

# Check 10: Validates layout configuration
validates_layout = ('validateLayoutConfiguration' in test_content and
                   'boardSize' in test_content and
                   'boardPosition' in test_content and
                   'layoutStrategy' in test_content)
check('Validates layout configuration', validates_layout, 
      'Missing comprehensive layout validation')

# Check 11: Tests common mobile devices
tests_common_devices = 'iPhone' in test_content or 'iPad' in test_content or 'Android' in test_content
check('Tests common mobile devices', tests_common_devices, 
      'Missing common device orientation tests')

# Check 12: Checks minimum board size
checks_min_board_size = '280' in test_content and 'minSize' in test_content
check('Checks minimum board size (280px)', checks_min_board_size, 
      'Missing minimum board size validation')

# Check 13: Exports test function
exports_function = 'module.exports' in test_content and 'runOrientationHandlingPropertyTest' in test_content
check('Exports test function', exports_function, 
      'Missing module.exports for runOrientationHandlingPropertyTest')

# Check 14: Imports required components
imports_components = ('ViewportAnalyzer' in test_content and
                     'LayoutOptimizer' in test_content and
                     'AdaptiveViewportConstants' in test_content)
check('Imports required components', imports_components, 
      'Missing required component imports')

# Check 15: Creates mock analysis results
creates_mock_analysis = ('createMockAnalysisResult' in test_content and
                        'aspectRatio' in test_content and
                        'orientation' in test_content)
check('Creates mock analysis results', creates_mock_analysis, 
      'Missing mock analysis result creation')

# Check 16: Tests square viewports
tests_square_viewports = 'square' in test_content.lower()
check('Tests square viewports (edge case)', tests_square_viewports, 
      'Missing square viewport test')

# Check 17: Proper error handling
has_error_handling = 'try' in test_content and 'catch' in test_content and 'error.message' in test_content
check('Proper error handling', has_error_handling, 
      'Missing proper error handling')

# Check 18: Cleans up resources
cleans_up_resources = 'optimizer.destroy()' in test_content
check('Cleans up resources', cleans_up_resources, 
      'Missing resource cleanup (optimizer.destroy)')

# Check 19: Returns test results
returns_results = ('return results' in test_content and
                  'results.passed' in test_content and
                  'results.failed' in test_content)
check('Returns test results', returns_results, 
      'Missing proper test results return')

# Check 20: HTML runner loads dependencies
if html_file_exists:
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    loads_components = ('viewport-analyzer.js' in html_content and
                       'layout-optimizer.js' in html_content and
                       'setup-fast-check.js' in html_content)
    check('HTML runner loads dependencies', loads_components, 
          'Missing required script includes in HTML')
    
    has_run_button = 'runButton' in html_content and 'runTest' in html_content
    check('HTML runner has run button', has_run_button, 
          'Missing run button in HTML')
    
    has_output = 'output' in html_content and 'textContent' in html_content
    check('HTML runner has output display', has_output, 
          'Missing output display in HTML')

# Print summary
print('\n=== Validation Summary ===')
total = results['passed'] + results['failed']
print(f"Total Checks: {total}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
print(f"Success Rate: {(results['passed'] / total * 100):.1f}%\n")

if results['failed'] == 0:
    print('✅ All validation checks passed! The orientation handling property test is correctly implemented.\n')
    sys.exit(0)
else:
    print('❌ Some validation checks failed. Please review the issues above.\n')
    sys.exit(1)
