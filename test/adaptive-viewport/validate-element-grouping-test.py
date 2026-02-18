#!/usr/bin/env python3

"""
Validation script for Element Grouping Preservation Property Test
Verifies that the test file is properly structured and can be executed
"""

import os
import sys

print('=== Validating Element Grouping Preservation Property Test ===\n')

test_file_path = 'test/adaptive-viewport/element-grouping-preservation-property.test.js'
html_file_path = 'test/adaptive-viewport/test-element-grouping-preservation-property.html'

validations_passed = 0
validations_failed = 0

def validate(description, condition):
    global validations_passed, validations_failed
    if condition:
        print(f'✓ {description}')
        validations_passed += 1
        return True
    else:
        print(f'✗ {description}')
        validations_failed += 1
        return False

# Check test file exists
validate('Test file exists', os.path.exists(test_file_path))

# Check HTML runner exists
validate('HTML test runner exists', os.path.exists(html_file_path))

if os.path.exists(test_file_path):
    with open(test_file_path, 'r', encoding='utf-8') as f:
        test_content = f.read()
    
    # Validate test structure
    validate(
        'Test file contains property test function',
        'runElementGroupingPreservationPropertyTest' in test_content
    )
    
    validate(
        'Test validates Requirements 2.2',
        '**Validates: Requirements 2.2**' in test_content
    )
    
    validate(
        'Test is labeled as Property 5',
        'Property 5: Element Grouping Preservation' in test_content
    )
    
    validate(
        'Test uses fast-check library',
        'fc.assert' in test_content and 'fc.asyncProperty' in test_content
    )
    
    validate(
        'Test runs 100 iterations',
        'numRuns: 100' in test_content
    )
    
    # Check for required properties
    validate(
        'Property 1: Grouped elements remain adjacent',
        'Property 1: Grouped elements remain adjacent' in test_content
    )
    
    validate(
        'Property 2: Multiple groups maintain adjacency',
        'Property 2: Multiple groups each maintain internal adjacency' in test_content
    )
    
    validate(
        'Property 3: Group spread remains reasonable',
        'Property 3: Group spread remains reasonable' in test_content
    )
    
    validate(
        'Property 4: Element order preserved',
        'Property 4: Element order within group is preserved' in test_content
    )
    
    # Check for helper functions
    validate(
        'Contains adjacency checking logic',
        'areElementsAdjacent' in test_content and 'isGroupAdjacent' in test_content
    )
    
    validate(
        'Contains group spread calculation',
        'calculateGroupSpread' in test_content
    )
    
    validate(
        'Creates test elements with group IDs',
        'dataset.group' in test_content
    )
    
    validate(
        'Uses LayoutOptimizer',
        'new LayoutOptimizer' in test_content
    )
    
    validate(
        'Calculates optimal layout',
        'calculateOptimalLayout' in test_content
    )
    
    validate(
        'Validates element positions',
        'elementPositions.get' in test_content
    )
    
    validate(
        'Cleans up DOM elements',
        'document.body.removeChild' in test_content
    )
    
    validate(
        'Exports test function',
        'module.exports' in test_content
    )
    
    validate(
        'Returns test results',
        'return results' in test_content
    )
    
    # Check test timeout
    validate(
        'Test has appropriate timeout (40s)',
        'timeout: 40000' in test_content
    )

if os.path.exists(html_file_path):
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Validate HTML structure
    validate(
        'HTML includes test title',
        'Element Grouping Preservation' in html_content
    )
    
    validate(
        'HTML loads fast-check',
        'setup-fast-check.js' in html_content
    )
    
    validate(
        'HTML loads LayoutOptimizer',
        'layout-optimizer.js' in html_content
    )
    
    validate(
        'HTML loads VisibilityDetector',
        'visibility-detector.js' in html_content
    )
    
    validate(
        'HTML loads test file',
        'element-grouping-preservation-property.test.js' in html_content
    )
    
    validate(
        'HTML has run button',
        'runTest()' in html_content
    )
    
    validate(
        'HTML displays test description',
        'logically grouped UI elements' in html_content
    )
    
    validate(
        'HTML lists all 4 properties',
        'Property 1:' in html_content and 
        'Property 2:' in html_content and
        'Property 3:' in html_content and
        'Property 4:' in html_content
    )

# Check dependencies exist
dependencies = [
    'js/adaptive-viewport/layout-optimizer.js',
    'js/adaptive-viewport/visibility-detector.js',
    'js/adaptive-viewport/constants.js',
    'js/adaptive-viewport/types.js',
    'test/adaptive-viewport/setup-fast-check.js'
]

for dep in dependencies:
    validate(f'Dependency exists: {dep}', os.path.exists(dep))

# Print summary
print('\n=== Validation Summary ===')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')
print(f'Total: {validations_passed + validations_failed}')

if validations_failed == 0:
    print('\n✅ All validations passed! Test is ready to run.')
    print('\nTo run the test:')
    print('  1. Open test/adaptive-viewport/test-element-grouping-preservation-property.html in a browser')
    print('  2. Click "Run Property Tests"')
    print('  3. Wait for all 4 properties to be tested (100 iterations each)')
    sys.exit(0)
else:
    print('\n❌ Some validations failed. Please review the errors above.')
    sys.exit(1)
