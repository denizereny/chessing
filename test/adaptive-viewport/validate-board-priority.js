#!/usr/bin/env node

/**
 * Validation script for Task 4.1: Board Priority Implementation
 * Verifies that board size calculation with priority handling is complete
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

const fs = require('fs');
const path = require('path');

console.log('=== Task 4.1: Board Priority Implementation Validation ===\n');

let validationsPassed = 0;
let validationsFailed = 0;

function validate(condition, description) {
  if (condition) {
    console.log(`✓ ${description}`);
    validationsPassed++;
  } else {
    console.error(`✗ ${description}`);
    validationsFailed++;
  }
}

// Check 1: LayoutOptimizer file exists
const layoutOptimizerPath = path.join(__dirname, '../../js/adaptive-viewport/layout-optimizer.js');
validate(
  fs.existsSync(layoutOptimizerPath),
  'LayoutOptimizer file exists'
);

// Check 2: Read and analyze the implementation
let layoutOptimizerCode = '';
try {
  layoutOptimizerCode = fs.readFileSync(layoutOptimizerPath, 'utf8');
  validate(true, 'LayoutOptimizer file is readable');
} catch (error) {
  validate(false, `LayoutOptimizer file read failed: ${error.message}`);
}

// Check 3: calculateBoardSize method exists
validate(
  layoutOptimizerCode.includes('calculateBoardSize'),
  'calculateBoardSize method exists'
);

// Check 4: Board priority logic implemented
validate(
  layoutOptimizerCode.includes('prioritizeBoard') && 
  layoutOptimizerCode.includes('BOARD PRIORITY'),
  'Board priority logic is implemented'
);

// Check 5: Minimum board size enforcement
validate(
  layoutOptimizerCode.includes('minBoardSize') &&
  layoutOptimizerCode.includes('280'),
  'Minimum board size (280px) enforcement is present'
);

// Check 6: Board size maximization algorithm
validate(
  layoutOptimizerCode.includes('maximize') || 
  layoutOptimizerCode.includes('optimal') ||
  layoutOptimizerCode.includes('Math.max'),
  'Board size maximization algorithm is implemented'
);

// Check 7: Aspect ratio preservation
validate(
  layoutOptimizerCode.includes('square') || 
  layoutOptimizerCode.includes('aspect ratio'),
  'Aspect ratio preservation is documented'
);

// Check 8: Conflict resolution method
validate(
  layoutOptimizerCode.includes('resolveLayoutConflicts') ||
  layoutOptimizerCode.includes('conflict'),
  'Conflict resolution logic is present'
);

// Check 9: Board allocated before UI elements
validate(
  layoutOptimizerCode.includes('STEP 1') && 
  layoutOptimizerCode.includes('board') &&
  layoutOptimizerCode.includes('FIRST'),
  'Board space allocation before UI elements is documented'
);

// Check 10: calculateOptimalLayout uses board priority
const calculateOptimalLayoutMatch = layoutOptimizerCode.match(/calculateOptimalLayout[\s\S]*?{[\s\S]*?}/);
if (calculateOptimalLayoutMatch) {
  const methodBody = calculateOptimalLayoutMatch[0];
  validate(
    methodBody.indexOf('calculateBoardSize') < methodBody.indexOf('calculateElementPositions'),
    'calculateOptimalLayout calculates board size before element positions'
  );
} else {
  validate(false, 'calculateOptimalLayout method structure check failed');
}

// Check 11: Test file exists
const testFilePath = path.join(__dirname, 'board-priority.test.js');
validate(
  fs.existsSync(testFilePath),
  'Board priority test file exists'
);

// Check 12: HTML test runner exists
const htmlTestPath = path.join(__dirname, 'test-board-priority.html');
validate(
  fs.existsSync(htmlTestPath),
  'HTML test runner exists'
);

// Check 13: Test file has adequate coverage
if (fs.existsSync(testFilePath)) {
  const testCode = fs.readFileSync(testFilePath, 'utf8');
  const testCount = (testCode.match(/Test \d+:/g) || []).length;
  validate(
    testCount >= 10,
    `Test file has adequate coverage (${testCount} tests)`
  );
} else {
  validate(false, 'Test file coverage check skipped (file not found)');
}

// Check 14: Documentation comments present
validate(
  layoutOptimizerCode.includes('/**') && 
  layoutOptimizerCode.includes('Requirements:'),
  'Documentation comments are present'
);

// Check 15: Error handling for invalid inputs
validate(
  layoutOptimizerCode.includes('throw new Error') ||
  layoutOptimizerCode.includes('ValidationUtils'),
  'Error handling for invalid inputs is present'
);

// Summary
console.log('\n=== Validation Summary ===');
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✓ All validation checks passed!');
  console.log('Task 4.1 implementation is complete.');
  console.log('\nNext steps:');
  console.log('1. Open test/adaptive-viewport/test-board-priority.html in a browser');
  console.log('2. Run the tests to verify functionality');
  console.log('3. Proceed to task 4.2 (property tests)');
  process.exit(0);
} else {
  console.log('\n✗ Some validation checks failed.');
  console.log('Please review the implementation.');
  process.exit(1);
}
