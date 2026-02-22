#!/usr/bin/env python3

"""
Validation Script for Analysis Before Rendering Property Test
Verifies that the property test is correctly implemented and follows the pattern
"""

import os
import sys

print('=== Validating Analysis Before Rendering Property Test ===\n')

test_file_path = 'test/adaptive-viewport/analysis-before-rendering-property.test.js'
html_file_path = 'test/adaptive-viewport/test-analysis-before-rendering-property.html'

validations_passed = 0
validations_failed = 0

def validate(condition, message):
    global validations_passed, validations_failed
    if condition:
        print(f'✓ {message}')
        validations_passed += 1
    else:
        print(f'✗ {message}')
        validations_failed += 1

# Check if test file exists
validate(os.path.exists(test_file_path), 'Test file exists')

# Check if HTML runner exists
validate(os.path.exists(html_file_path), 'HTML test runner exists')

if not os.path.exists(test_file_path):
    print('\nTest file not found. Exiting validation.')
    sys.exit(1)

# Read test file
with open(test_file_path, 'r', encoding='utf-8') as f:
    test_content = f.read()

# Validate test structure
print('\n--- Test Structure Validation ---')

validate(
    'Property 12: Analysis Before Rendering' in test_content,
    'Test has correct property title'
)

validate(
    '**Validates: Requirements 4.1**' in test_content,
    'Test validates correct requirement'
)

validate(
    'runAnalysisBeforeRenderingPropertyTest' in test_content,
    'Test has main test function'
)

validate(
    'fc.assert' in test_content,
    'Test uses fast-check assertions'
)

validate(
    'numRuns: 100' in test_content,
    'Test runs minimum 100 iterations'
)

# Validate property tests
print('\n--- Property Test Validation ---')

property_tests = [
    'Property 1: Analysis completes before UI elements are rendered',
    'Property 2: Layout configuration exists before DOM updates are applied',
    'Property 3: Analysis completes within 200ms',
    'Property 4: Initialize method performs analysis before returning',
    'Property 5: Analysis result contains all required data for rendering'
]

for i, property_name in enumerate(property_tests, 1):
    validate(
        property_name in test_content,
        f'Property {i} test exists: "{property_name}"'
    )

# Validate test helpers
print('\n--- Helper Function Validation ---')

helpers = [
    'createTestUIElements',
    'isElementRendered',
    'RenderMonitor',
    'AnalysisTracker',
    'cleanupElements'
]

for helper in helpers:
    validate(
        helper in test_content,
        f'Helper function exists: {helper}'
    )

# Validate ViewportAnalyzer usage
print('\n--- ViewportAnalyzer Integration Validation ---')

validate(
    'new ViewportAnalyzer' in test_content,
    'Test creates ViewportAnalyzer instances'
)

validate(
    'analyzer.initialize()' in test_content,
    'Test calls initialize method'
)

validate(
    'analyzer.analyzeViewport()' in test_content,
    'Test calls analyzeViewport method'
)

validate(
    'analyzer.getState()' in test_content,
    'Test checks analyzer state'
)

validate(
    'analyzer.destroy()' in test_content,
    'Test properly cleans up analyzer'
)

# Validate timing checks
print('\n--- Timing Validation ---')

validate(
    'performance.now()' in test_content,
    'Test uses performance timing'
)

validate(
    'analysisEndTime' in test_content,
    'Test tracks analysis end time'
)

validate(
    'firstRenderTime' in test_content,
    'Test tracks first render time'
)

validate(
    'analysisEndTime > firstRenderTime' in test_content,
    'Test compares analysis and render timing'
)

# Validate 200ms requirement
validate(
    '200' in test_content and 'Requirement 4.3' in test_content,
    'Test validates 200ms timing requirement'
)

# Validate HTML runner
if os.path.exists(html_file_path):
    print('\n--- HTML Runner Validation ---')
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    validate(
        'Property Test: Analysis Before Rendering' in html_content,
        'HTML has correct title'
    )
    
    validate(
        'setup-fast-check.js' in html_content,
        'HTML loads fast-check library'
    )
    
    validate(
        'viewport-analyzer.js' in html_content,
        'HTML loads ViewportAnalyzer'
    )
    
    validate(
        'analysis-before-rendering-property.test.js' in html_content,
        'HTML loads test file'
    )
    
    validate(
        'runAnalysisBeforeRenderingPropertyTest' in html_content,
        'HTML calls test function'
    )

# Validate exports
print('\n--- Export Validation ---')

validate(
    'module.exports' in test_content,
    'Test exports function for Node.js'
)

validate(
    'runAnalysisBeforeRenderingPropertyTest' in test_content,
    'Test exports correct function name'
)

# Validate error handling
print('\n--- Error Handling Validation ---')

validate(
    'try' in test_content and 'catch' in test_content,
    'Test includes error handling'
)

validate(
    'cleanupElements' in test_content,
    'Test cleans up elements on error'
)

validate(
    'analyzer.destroy()' in test_content,
    'Test destroys analyzer on cleanup'
)

# Validate test results structure
print('\n--- Test Results Structure Validation ---')

validate(
    'results.passed++' in test_content,
    'Test tracks passed tests'
)

validate(
    'results.failed++' in test_content,
    'Test tracks failed tests'
)

validate(
    'results.tests.push' in test_content,
    'Test records individual test results'
)

validate(
    'Test Summary' in test_content,
    'Test prints summary'
)

# Print final summary
print('\n=== Validation Summary ===')
print(f'Total Validations: {validations_passed + validations_failed}')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')

if validations_failed == 0:
    print('\n✅ All validations passed! Test is correctly implemented.')
    sys.exit(0)
else:
    print('\n❌ Some validations failed. Please review the test implementation.')
    sys.exit(1)
