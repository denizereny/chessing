#!/usr/bin/env node

/**
 * Validation Script for Board Size Maximization Property Test
 * Verifies that the property test is correctly implemented and can run
 */

const path = require('path');
const fs = require('fs');

console.log('=== Validating Board Size Maximization Property Test ===\n');

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

// Check if test file exists
const testFilePath = path.join(__dirname, 'board-size-maximization-property.test.js');
validate(
  fs.existsSync(testFilePath),
  'Test file exists: board-size-maximization-property.test.js'
);

// Check if HTML runner exists
const htmlRunnerPath = path.join(__dirname, 'test-board-size-maximization-property.html');
validate(
  fs.existsSync(htmlRunnerPath),
  'HTML test runner exists: test-board-size-maximization-property.html'
);

// Check if LayoutOptimizer exists
const layoutOptimizerPath = path.join(__dirname, '../../js/adaptive-viewport/layout-optimizer.js');
validate(
  fs.existsSync(layoutOptimizerPath),
  'LayoutOptimizer implementation exists'
);

// Load and check test file structure
try {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  validate(
    testContent.includes('Property 22: Board Size Maximization'),
    'Test file contains correct property identifier'
  );
  
  validate(
    testContent.includes('Validates: Requirements 6.5, 7.5'),
    'Test file validates correct requirements'
  );
  
  validate(
    testContent.includes('runBoardSizeMaximizationPropertyTest'),
    'Test file exports main test function'
  );
  
  validate(
    testContent.includes('fc.assert'),
    'Test file uses fast-check assertions'
  );
  
  validate(
    testContent.includes('numRuns: 100'),
    'Test file runs minimum 100 iterations per property'
  );
  
  // Count number of properties tested
  const propertyMatches = testContent.match(/Property \d+:/g);
  const propertyCount = propertyMatches ? propertyMatches.length : 0;
  validate(
    propertyCount >= 5,
    `Test file contains ${propertyCount} properties (expected at least 5)`
  );
  
  // Check for key test scenarios
  validate(
    testContent.includes('minimum size constraint') || testContent.includes('minimum constraint'),
    'Test includes minimum size constraint validation'
  );
  
  validate(
    testContent.includes('maximized within viewport') || testContent.includes('viewport bounds'),
    'Test includes viewport bounds validation'
  );
  
  validate(
    testContent.includes('prioritizeBoard'),
    'Test validates board priority mode'
  );
  
  validate(
    testContent.includes('aspect ratio') || testContent.includes('square'),
    'Test validates square aspect ratio maintenance'
  );
  
  validate(
    testContent.includes('monotonically') || testContent.includes('increases'),
    'Test validates monotonic size increase with viewport'
  );
  
} catch (error) {
  console.error(`✗ Error reading test file: ${error.message}`);
  validationsFailed++;
}

// Check HTML runner structure
try {
  const htmlContent = fs.readFileSync(htmlRunnerPath, 'utf8');
  
  validate(
    htmlContent.includes('Board Size Maximization'),
    'HTML runner has correct title'
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
    htmlContent.includes('board-size-maximization-property.test.js'),
    'HTML runner loads test file'
  );
  
  validate(
    htmlContent.includes('runBoardSizeMaximizationPropertyTest'),
    'HTML runner calls test function'
  );
  
} catch (error) {
  console.error(`✗ Error reading HTML runner: ${error.message}`);
  validationsFailed++;
}

// Try to load and run a basic test
console.log('\n--- Running Basic Functionality Test ---\n');

try {
  // Load dependencies
  const LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
  
  // Create optimizer instance
  const optimizer = new LayoutOptimizer({
    minBoardSize: 280,
    spacing: 16,
    prioritizeBoard: true
  });
  
  validate(
    optimizer !== null && optimizer !== undefined,
    'LayoutOptimizer can be instantiated'
  );
  
  // Test basic board size calculation
  const boardSize = optimizer.calculateBoardSize(
    { width: 1000, height: 800 },
    []
  );
  
  validate(
    boardSize.width >= 280 && boardSize.height >= 280,
    `Board size meets minimum (${boardSize.width}x${boardSize.height})`
  );
  
  validate(
    boardSize.width === boardSize.height,
    'Board maintains square aspect ratio'
  );
  
  // Test optimal layout calculation
  const layout = optimizer.calculateOptimalLayout({
    viewportWidth: 1200,
    viewportHeight: 900,
    invisibleElements: []
  });
  
  validate(
    layout.boardSize !== undefined && layout.boardPosition !== undefined,
    'Optimal layout includes board size and position'
  );
  
  validate(
    layout.layoutStrategy !== undefined,
    'Optimal layout includes layout strategy'
  );
  
  // Test board size maximization with different viewport sizes
  const smallLayout = optimizer.calculateOptimalLayout({
    viewportWidth: 600,
    viewportHeight: 700,
    invisibleElements: []
  });
  
  const largeLayout = optimizer.calculateOptimalLayout({
    viewportWidth: 1600,
    viewportHeight: 1200,
    invisibleElements: []
  });
  
  validate(
    largeLayout.boardSize.width >= smallLayout.boardSize.width,
    `Board size increases with viewport (small: ${smallLayout.boardSize.width}, large: ${largeLayout.boardSize.width})`
  );
  
  // Test board priority
  const optimizerWithPriority = new LayoutOptimizer({
    minBoardSize: 280,
    spacing: 16,
    prioritizeBoard: true
  });
  
  const optimizerWithoutPriority = new LayoutOptimizer({
    minBoardSize: 280,
    spacing: 16,
    prioritizeBoard: false
  });
  
  const layoutWithPriority = optimizerWithPriority.calculateOptimalLayout({
    viewportWidth: 800,
    viewportHeight: 700,
    invisibleElements: []
  });
  
  const layoutWithoutPriority = optimizerWithoutPriority.calculateOptimalLayout({
    viewportWidth: 800,
    viewportHeight: 700,
    invisibleElements: []
  });
  
  validate(
    layoutWithPriority.boardSize.width >= layoutWithoutPriority.boardSize.width,
    `Board priority mode produces larger board (with: ${layoutWithPriority.boardSize.width}, without: ${layoutWithoutPriority.boardSize.width})`
  );
  
  console.log('\n✓ Basic functionality tests passed');
  
} catch (error) {
  console.error(`\n✗ Basic functionality test failed: ${error.message}`);
  console.error(error.stack);
  validationsFailed++;
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Passed: ${validationsPassed}`);
console.log(`Failed: ${validationsFailed}`);
console.log(`Total: ${validationsPassed + validationsFailed}`);

if (validationsFailed === 0) {
  console.log('\n✓ All validations passed! Test is ready to run.');
  console.log('\nTo run the property test:');
  console.log('1. Open test-board-size-maximization-property.html in a browser');
  console.log('2. Click "Run Property Tests" button');
  console.log('3. Wait for 100 iterations per property to complete');
  process.exit(0);
} else {
  console.log('\n✗ Some validations failed. Please review the errors above.');
  process.exit(1);
}
