#!/usr/bin/env python3

"""
Validation script for visibility classification property test
Verifies test structure and requirements without running full test suite
"""

import os
import sys

print('=== Validating Visibility Classification Property Test ===\n')

results = {
    'passed': 0,
    'failed': 0,
    'checks': []
}

def check(name, condition, details=''):
    """Check a condition and record result"""
    if condition:
        results['passed'] += 1
        results['checks'].append({'name': name, 'status': 'PASS'})
        print(f'✓ {name}')
        if details:
            print(f'  {details}')
    else:
        results['failed'] += 1
        results['checks'].append({'name': name, 'status': 'FAIL'})
        print(f'✗ {name}')
        if details:
            print(f'  {details}')

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Check 1: Test file exists
test_file = os.path.join(script_dir, 'visibility-classification-property.test.js')
check(
    'Test file exists',
    os.path.exists(test_file),
    f'Path: {test_file}'
)

# Check 2: HTML runner exists
html_runner = os.path.join(script_dir, 'test-visibility-classification-property.html')
check(
    'HTML test runner exists',
    os.path.exists(html_runner),
    f'Path: {html_runner}'
)

# Check 3: Documentation exists
doc_file = os.path.join(script_dir, 'TASK_2.2_VISIBILITY_CLASSIFICATION_PROPERTY_TEST.md')
check(
    'Documentation file exists',
    os.path.exists(doc_file),
    f'Path: {doc_file}'
)

# Check 4: Test file contains required properties
if os.path.exists(test_file):
    with open(test_file, 'r', encoding='utf-8') as f:
        test_content = f.read()
    
    check(
        'Test validates Requirements 1.1, 1.2',
        'Requirements 1.1, 1.2' in test_content,
        'Found requirement validation comment'
    )
    
    check(
        'Test uses fast-check library',
        'fast-check' in test_content or 'fc.assert' in test_content,
        'Found fast-check usage'
    )
    
    check(
        'Test has Property 1: Visibility classification',
        'Property 1' in test_content and 'intersecting viewport' in test_content,
        'Found Property 1 test'
    )
    
    check(
        'Test has Property 2: Elements outside viewport',
        'Property 2' in test_content and 'outside viewport' in test_content,
        'Found Property 2 test'
    )
    
    check(
        'Test has Property 3: Elements within viewport',
        'Property 3' in test_content and 'within viewport' in test_content,
        'Found Property 3 test'
    )
    
    check(
        'Test has Property 4: Partially visible elements',
        'Property 4' in test_content and 'Partially visible' in test_content,
        'Found Property 4 test'
    )
    
    check(
        'Test runs 100 iterations per property',
        'numRuns: 100' in test_content,
        'Found numRuns: 100 configuration'
    )
    
    check(
        'Test uses asyncProperty for async testing',
        'asyncProperty' in test_content,
        'Found asyncProperty usage for IntersectionObserver'
    )
    
    check(
        'Test includes oracle function',
        'elementIntersectsViewport' in test_content,
        'Found oracle function for expected behavior'
    )
    
    check(
        'Test creates actual DOM elements',
        'createElement' in test_content and 'appendChild' in test_content,
        'Found DOM element creation'
    )
    
    check(
        'Test uses VisibilityDetector',
        'new VisibilityDetector' in test_content,
        'Found VisibilityDetector instantiation'
    )
    
    check(
        'Test cleans up resources',
        'destroy()' in test_content and 'removeChild' in test_content,
        'Found cleanup code'
    )

# Check 5: HTML runner contains required elements
if os.path.exists(html_runner):
    with open(html_runner, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    check(
        'HTML runner loads fast-check from CDN',
        'fast-check' in html_content and 'cdn.jsdelivr.net' in html_content,
        'Found fast-check CDN link'
    )
    
    check(
        'HTML runner loads VisibilityDetector',
        'visibility-detector.js' in html_content,
        'Found VisibilityDetector script'
    )
    
    check(
        'HTML runner loads test file',
        'visibility-classification-property.test.js' in html_content,
        'Found test file script'
    )
    
    check(
        'HTML runner has run button',
        'runTests' in html_content or 'Run' in html_content,
        'Found run button'
    )
    
    check(
        'HTML runner displays viewport info',
        'viewport' in html_content and 'innerWidth' in html_content,
        'Found viewport display'
    )

# Check 6: Documentation contains required sections
if os.path.exists(doc_file):
    with open(doc_file, 'r', encoding='utf-8') as f:
        doc_content = f.read()
    
    check(
        'Documentation describes all 4 properties',
        all(f'Property {i}' in doc_content for i in range(1, 5)),
        'Found all property descriptions'
    )
    
    check(
        'Documentation mentions 400 total test cases',
        '400' in doc_content,
        'Found total test case count'
    )
    
    check(
        'Documentation validates Requirements 1.1, 1.2',
        '1.1' in doc_content and '1.2' in doc_content,
        'Found requirement validation'
    )
    
    check(
        'Documentation includes how to run tests',
        'How to Run' in doc_content,
        'Found test execution instructions'
    )

# Print summary
print('\n=== Validation Summary ===')
total = results['passed'] + results['failed']
print(f"Total Checks: {total}")
print(f"Passed: {results['passed']}")
print(f"Failed: {results['failed']}")
if total > 0:
    success_rate = (results['passed'] / total) * 100
    print(f"Success Rate: {success_rate:.1f}%\n")

if results['failed'] == 0:
    print('✅ All validation checks passed!')
    print('\nThe property test is properly structured and ready to run.')
    print('Open test/adaptive-viewport/test-visibility-classification-property.html in a browser to execute tests.\n')
    sys.exit(0)
else:
    print('❌ Some validation checks failed.')
    print('Please review the failed checks above.\n')
    sys.exit(1)
