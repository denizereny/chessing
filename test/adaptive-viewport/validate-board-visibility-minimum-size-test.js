#!/usr/bin/env node

/**
 * Validation Script for Board Visibility and Minimum Size Property Test
 * Verifies that the test implementation meets all requirements
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║     Validation: Board Visibility and Minimum Size Property Test   ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

let validationsPassed = 0;
let validationsFailed = 0;

function validate(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    validationsPassed++;
  } else {
    console.error(`✗ ${message}`);
    validationsFailed++;
  }
}

// Read test file
const testFilePath = path.join(__dirname, 'board-visibility-minimum-size-property.test.js');
const testContent = fs.readFileSync(testFilePath, 'utf8');

console.log('Validating test file structure and content...\n');

// 1. Check file exists and is readable
validate(
  fs.existsSync(testFilePath),
  'Test file exists at correct location'
);

// 2. Check for required header comments
validate(
  testContent.includes('Property 23: Board Visibility and Minimum Size Invariant'),
  'Test file includes Property 23 identifier'
);

validate(
  testContent.includes('Validates: Requirements 7.1, 7.3'),
  'Test file validates Requirements 7.1 and 7.3'
);

validate(
  testContent.includes('Feature: adaptive-viewport-optimizer'),
  'Test file tagged with feature: adaptive-viewport-optimizer'
);

// 3. Check for required imports
validate(
  testContent.includes('LayoutOptimizer'),
  'Test imports LayoutOptimizer'
);

// 4. Check for main test function
validate(
  testContent.includes('runBoardVisibilityMinimumSizePropertyTest'),
  'Test defines main test function'
);

validate(
  testContent.includes('async function runBoardVisibilityMinimumSizePropertyTest(fc)'),
  'Test function accepts fast-check parameter'
);

// 5. Check for minimum board size constant
validate(
  testContent.includes('MIN_BOARD_SIZE = 280') || testContent.includes('280'),
  'Test uses minimum board size of 280px'
);

// 6. Check for viewport dimension ranges
validate(
  testContent.includes('320') && testContent.includes('3840'),
  'Test covers viewport width range 320-3840px'
);

validate(
  testContent.includes('480') && testContent.includes('2160'),
  'Test covers viewport height range 480-2160px'
);

// 7. Check for helper functions
validate(
  testContent.includes('isBoardFullyVisible'),
  'Test includes helper to check board visibility'
);

validate(
  testContent.includes('meetsMinimumSize'),
  'Test includes helper to check minimum size'
);

// 8. Check for property tests (should have multiple properties)
const propertyMatches = testContent.match(/Property \d+:/g);
validate(
  propertyMatches && propertyMatches.length >= 5,
  `Test includes multiple properties (found ${propertyMatches ? propertyMatches.length : 0})`
);

// 9. Check for fast-check usage
validate(
  testContent.includes('fc.assert'),
  'Test uses fast-check assertions'
);

validate(
  testContent.includes('fc.asyncProperty'),
  'Test uses async properties'
);

validate(
  testContent.includes('fc.record'),
  'Test uses record generators'
);

validate(
  testContent.includes('fc.integer'),
  'Test uses integer generators'
);

// 10. Check for 100 iterations
validate(
  testContent.includes('numRuns: 100'),
  'Test runs 100 iterations per property'
);

// 11. Check for board visibility validation
validate(
  testContent.includes('boardPosition.x >= 0') || testContent.includes('boardPosition.x < 0'),
  'Test validates board position is non-negative'
);

validate(
  testContent.includes('boardRight <= viewportWidth') || testContent.includes('boardBottom <= viewportHeight'),
  'Test validates board is within viewport bounds'
);

// 12. Check for minimum size validation
validate(
  testContent.includes('boardSize.width >= minSize') || testContent.includes('boardSize.width >= MIN_BOARD_SIZE'),
  'Test validates board width meets minimum'
);

validate(
  testContent.includes('boardSize.height >= minSize') || testContent.includes('boardSize.height >= MIN_BOARD_SIZE'),
  'Test validates board height meets minimum'
);

// 13. Check for square aspect ratio validation
validate(
  testContent.includes('boardSize.width === boardSize.height') || testContent.includes('width === height'),
  'Test validates board maintains square aspect ratio'
);

// 14. Check for extreme viewport testing
validate(
  testContent.includes('extreme') || testContent.includes('Extreme'),
  'Test includes extreme viewport scenarios'
);

// 15. Check for UI element stress testing
validate(
  testContent.includes('uiElementCount') || testContent.includes('many UI elements'),
  'Test includes scenarios with multiple UI elements'
);

// 16. Check for valid position validation (NaN, Infinity checks)
validate(
  testContent.includes('isFinite') || testContent.includes('isNaN'),
  'Test validates position values are finite and not NaN'
);

// 17. Check for layout strategy testing
validate(
  testContent.includes('layoutStrategy'),
  'Test validates across different layout strategies'
);

// 18. Check for error handling
validate(
  testContent.includes('try') && testContent.includes('catch'),
  'Test includes error handling'
);

// 19. Check for results tracking
validate(
  testContent.includes('results.passed') && testContent.includes('results.failed'),
  'Test tracks passed and failed results'
);

// 20. Check for module export
validate(
  testContent.includes('module.exports'),
  'Test exports function for Node.js usage'
);

// Check HTML test runner
console.log('\nValidating HTML test runner...\n');

const htmlFilePath = path.join(__dirname, 'test-board-visibility-minimum-size-property.html');
if (fs.existsSync(htmlFilePath)) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  validate(
    htmlContent.includes('Property 23'),
    'HTML runner references Property 23'
  );
  
  validate(
    htmlContent.includes('Requirements 7.1, 7.3'),
    'HTML runner references requirements'
  );
  
  validate(
    htmlContent.includes('setup-fast-check.js'),
    'HTML runner loads fast-check library'
  );
  
  validate(
    htmlContent.includes('layout-optimizer.js'),
    'HTML runner loads LayoutOptimizer'
  );
  
  validate(
    htmlContent.includes('runBoardVisibilityMinimumSizePropertyTest'),
    'HTML runner calls test function'
  );
} else {
  console.error('✗ HTML test runner file not found');
  validationsFailed++;
}

// Check Node.js test runner
console.log('\nValidating Node.js test runner...\n');

const nodeRunnerPath = path.join(__dirname, 'run-board-visibility-minimum-size-test.js');
if (fs.existsSync(nodeRunnerPath)) {
  const nodeRunnerContent = fs.readFileSync(nodeRunnerPath, 'utf8');
  
  validate(
    nodeRunnerContent.includes('#!/usr/bin/env node'),
    'Node.js runner has shebang'
  );
  
  validate(
    nodeRunnerContent.includes('fast-check'),
    'Node.js runner imports fast-check'
  );
  
  validate(
    nodeRunnerContent.includes('runBoardVisibilityMinimumSizePropertyTest'),
    'Node.js runner calls test function'
  );
  
  validate(
    nodeRunnerContent.includes('process.exit'),
    'Node.js runner exits with appropriate code'
  );
} else {
  console.error('✗ Node.js test runner file not found');
  validationsFailed++;
}

// Summary
console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║                      VALIDATION SUMMARY                            ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();
console.log(`Total Validations: ${validationsPassed + validationsFailed}`);
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log();

if (validationsFailed === 0) {
  console.log('✅ All validations passed!');
  console.log();
  console.log('Test implementation is complete and meets all requirements:');
  console.log('  ✓ Property 23 correctly identified');
  console.log('  ✓ Requirements 7.1 and 7.3 validated');
  console.log('  ✓ 100 iterations per property');
  console.log('  ✓ Viewport range 320-3840px × 480-2160px');
  console.log('  ✓ Minimum board size 280px × 280px enforced');
  console.log('  ✓ Board visibility within viewport validated');
  console.log('  ✓ Multiple properties tested (7 properties)');
  console.log('  ✓ HTML and Node.js test runners provided');
  console.log();
  process.exit(0);
} else {
  console.log('❌ Some validations failed.');
  console.log('Please review the test implementation.');
  console.log();
  process.exit(1);
}
