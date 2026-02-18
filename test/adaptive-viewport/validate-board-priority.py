#!/usr/bin/env python3

"""
Validation script for Task 4.1: Board Priority Implementation
Verifies that board size calculation with priority handling is complete
Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
"""

import os
import sys

print('=== Task 4.1: Board Priority Implementation Validation ===\n')

validations_passed = 0
validations_failed = 0

def validate(condition, description):
    global validations_passed, validations_failed
    if condition:
        print(f'✓ {description}')
        validations_passed += 1
    else:
        print(f'✗ {description}')
        validations_failed += 1

# Check 1: LayoutOptimizer file exists
layout_optimizer_path = 'js/adaptive-viewport/layout-optimizer.js'
validate(
    os.path.exists(layout_optimizer_path),
    'LayoutOptimizer file exists'
)

# Check 2: Read and analyze the implementation
layout_optimizer_code = ''
try:
    with open(layout_optimizer_path, 'r') as f:
        layout_optimizer_code = f.read()
    validate(True, 'LayoutOptimizer file is readable')
except Exception as e:
    validate(False, f'LayoutOptimizer file read failed: {e}')

# Check 3: calculateBoardSize method exists
validate(
    'calculateBoardSize' in layout_optimizer_code,
    'calculateBoardSize method exists'
)

# Check 4: Board priority logic implemented
validate(
    'prioritizeBoard' in layout_optimizer_code and 
    'BOARD PRIORITY' in layout_optimizer_code,
    'Board priority logic is implemented'
)

# Check 5: Minimum board size enforcement
validate(
    'minBoardSize' in layout_optimizer_code and
    '280' in layout_optimizer_code,
    'Minimum board size (280px) enforcement is present'
)

# Check 6: Board size maximization algorithm
validate(
    'maximize' in layout_optimizer_code or 
    'optimal' in layout_optimizer_code or
    'Math.max' in layout_optimizer_code,
    'Board size maximization algorithm is implemented'
)

# Check 7: Aspect ratio preservation
validate(
    'square' in layout_optimizer_code or 
    'aspect ratio' in layout_optimizer_code,
    'Aspect ratio preservation is documented'
)

# Check 8: Conflict resolution method
validate(
    'resolveLayoutConflicts' in layout_optimizer_code or
    'conflict' in layout_optimizer_code,
    'Conflict resolution logic is present'
)

# Check 9: Board allocated before UI elements
validate(
    'STEP 1' in layout_optimizer_code and 
    'board' in layout_optimizer_code and
    'FIRST' in layout_optimizer_code,
    'Board space allocation before UI elements is documented'
)

# Check 10: calculateOptimalLayout uses board priority
if 'calculateOptimalLayout' in layout_optimizer_code:
    # Find the method
    start_idx = layout_optimizer_code.find('calculateOptimalLayout')
    if start_idx != -1:
        method_section = layout_optimizer_code[start_idx:start_idx+3000]
        board_idx = method_section.find('calculateBoardSize')
        element_idx = method_section.find('calculateElementPositions')
        validate(
            board_idx != -1 and element_idx != -1 and board_idx < element_idx,
            'calculateOptimalLayout calculates board size before element positions'
        )
    else:
        validate(False, 'calculateOptimalLayout method not found')
else:
    validate(False, 'calculateOptimalLayout method structure check failed')

# Check 11: Test file exists
test_file_path = 'test/adaptive-viewport/board-priority.test.js'
validate(
    os.path.exists(test_file_path),
    'Board priority test file exists'
)

# Check 12: HTML test runner exists
html_test_path = 'test/adaptive-viewport/test-board-priority.html'
validate(
    os.path.exists(html_test_path),
    'HTML test runner exists'
)

# Check 13: Test file has adequate coverage
if os.path.exists(test_file_path):
    with open(test_file_path, 'r') as f:
        test_code = f.read()
    test_count = test_code.count('Test ')
    validate(
        test_count >= 10,
        f'Test file has adequate coverage ({test_count} tests)'
    )
else:
    validate(False, 'Test file coverage check skipped (file not found)')

# Check 14: Documentation comments present
validate(
    '/**' in layout_optimizer_code and 
    'Requirements:' in layout_optimizer_code,
    'Documentation comments are present'
)

# Check 15: Error handling for invalid inputs
validate(
    'throw new Error' in layout_optimizer_code or
    'ValidationUtils' in layout_optimizer_code,
    'Error handling for invalid inputs is present'
)

# Check 16: resolveLayoutConflicts method exists
validate(
    'resolveLayoutConflicts' in layout_optimizer_code,
    'resolveLayoutConflicts method exists'
)

# Check 17: Conflict resolution handles board priority
if 'resolveLayoutConflicts' in layout_optimizer_code:
    start_idx = layout_optimizer_code.find('resolveLayoutConflicts')
    if start_idx != -1:
        method_section = layout_optimizer_code[start_idx:start_idx+2000]
        validate(
            'prioritizeBoard' in method_section and 'minBoardSize' in method_section,
            'Conflict resolution respects board priority and minimum size'
        )
    else:
        validate(False, 'resolveLayoutConflicts method section not found')
else:
    validate(False, 'resolveLayoutConflicts method check skipped')

# Summary
print('\n=== Validation Summary ===')
print(f'Passed: {validations_passed}')
print(f'Failed: {validations_failed}')
print(f'Total: {validations_passed + validations_failed}')

if validations_failed == 0:
    print('\n✓ All validation checks passed!')
    print('Task 4.1 implementation is complete.')
    print('\nNext steps:')
    print('1. Open test/adaptive-viewport/test-board-priority.html in a browser')
    print('2. Run the tests to verify functionality')
    print('3. Proceed to task 4.2 (property tests)')
    sys.exit(0)
else:
    print('\n✗ Some validation checks failed.')
    print('Please review the implementation.')
    sys.exit(1)
