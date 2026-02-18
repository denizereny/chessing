/**
 * Unit Tests for LayoutOptimizer
 * Tests core layout calculation logic
 */

// Import dependencies
const LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
const AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');

/**
 * Test suite for LayoutOptimizer
 */
function runLayoutOptimizerTests() {
  console.log('=== LayoutOptimizer Unit Tests ===\n');

  let passCount = 0;
  let failCount = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ ${testName}`);
      passCount++;
    } else {
      console.error(`✗ ${testName}`);
      failCount++;
    }
  }

  function assertThrows(fn, testName) {
    try {
      fn();
      console.error(`✗ ${testName} (expected error but none thrown)`);
      failCount++;
    } catch (error) {
      console.log(`✓ ${testName}`);
      passCount++;
    }
  }

  // Test 1: Constructor with default configuration
  try {
    const optimizer = new LayoutOptimizer();
    assert(
      optimizer.getConfig('minBoardSize') === 280,
      'Constructor sets default minBoardSize to 280'
    );
    assert(
      optimizer.getConfig('spacing') === 16,
      'Constructor sets default spacing to 16'
    );
    assert(
      optimizer.getConfig('prioritizeBoard') === true,
      'Constructor sets default prioritizeBoard to true'
    );
  } catch (error) {
    console.error('✗ Constructor test failed:', error.message);
    failCount++;
  }

  // Test 2: Constructor with custom configuration
  try {
    const optimizer = new LayoutOptimizer({
      minBoardSize: 300,
      spacing: 20,
      prioritizeBoard: false
    });
    assert(
      optimizer.getConfig('minBoardSize') === 300,
      'Constructor accepts custom minBoardSize'
    );
    assert(
      optimizer.getConfig('spacing') === 20,
      'Constructor accepts custom spacing'
    );
    assert(
      optimizer.getConfig('prioritizeBoard') === false,
      'Constructor accepts custom prioritizeBoard'
    );
  } catch (error) {
    console.error('✗ Custom constructor test failed:', error.message);
    failCount++;
  }

  // Test 3: calculateBoardSize with ample space
  try {
    const optimizer = new LayoutOptimizer();
    const boardSize = optimizer.calculateBoardSize(
      { width: 1920, height: 1080 },
      []
    );
    assert(
      boardSize.width >= 280 && boardSize.height >= 280,
      'calculateBoardSize returns minimum board size'
    );
    assert(
      boardSize.width === boardSize.height,
      'calculateBoardSize maintains square aspect ratio'
    );
  } catch (error) {
    console.error('✗ calculateBoardSize test failed:', error.message);
    failCount++;
  }

  // Test 4: calculateBoardSize with constrained space
  try {
    const optimizer = new LayoutOptimizer({ minBoardSize: 280 });
    const boardSize = optimizer.calculateBoardSize(
      { width: 400, height: 600 },
      []
    );
    assert(
      boardSize.width >= 280,
      'calculateBoardSize respects minimum size in constrained space'
    );
    assert(
      boardSize.width <= 400,
      'calculateBoardSize does not exceed available width'
    );
  } catch (error) {
    console.error('✗ calculateBoardSize constrained test failed:', error.message);
    failCount++;
  }

  // Test 5: calculateBoardSize with invalid dimensions
  try {
    const optimizer = new LayoutOptimizer();
    assertThrows(
      () => optimizer.calculateBoardSize({ width: -100, height: 500 }, []),
      'calculateBoardSize throws error for negative dimensions'
    );
  } catch (error) {
    console.error('✗ calculateBoardSize validation test failed:', error.message);
    failCount++;
  }

  // Test 6: determineLayoutStrategy for wide viewport
  try {
    const optimizer = new LayoutOptimizer();
    const strategy = optimizer.determineLayoutStrategy(
      { width: 1920, height: 1080 },
      3
    );
    assert(
      strategy === 'horizontal',
      'determineLayoutStrategy returns horizontal for wide viewport'
    );
  } catch (error) {
    console.error('✗ determineLayoutStrategy wide test failed:', error.message);
    failCount++;
  }

  // Test 7: determineLayoutStrategy for narrow viewport
  try {
    const optimizer = new LayoutOptimizer();
    const strategy = optimizer.determineLayoutStrategy(
      { width: 400, height: 800 },
      3
    );
    assert(
      strategy === 'vertical',
      'determineLayoutStrategy returns vertical for narrow viewport'
    );
  } catch (error) {
    console.error('✗ determineLayoutStrategy narrow test failed:', error.message);
    failCount++;
  }

  // Test 8: determineLayoutStrategy for ultra-wide viewport
  try {
    const optimizer = new LayoutOptimizer();
    const strategy = optimizer.determineLayoutStrategy(
      { width: 3840, height: 1080 },
      3
    );
    assert(
      strategy === 'horizontal',
      'determineLayoutStrategy returns horizontal for ultra-wide viewport'
    );
  } catch (error) {
    console.error('✗ determineLayoutStrategy ultra-wide test failed:', error.message);
    failCount++;
  }

  // Test 9: calculateElementPositions with empty array
  try {
    const optimizer = new LayoutOptimizer();
    const positions = optimizer.calculateElementPositions(
      [],
      'horizontal',
      { x: 0, y: 0, width: 500, height: 500 }
    );
    assert(
      positions.size === 0,
      'calculateElementPositions returns empty map for empty array'
    );
  } catch (error) {
    console.error('✗ calculateElementPositions empty test failed:', error.message);
    failCount++;
  }

  // Test 10: validateLayout with valid configuration
  try {
    const optimizer = new LayoutOptimizer();
    const config = {
      boardSize: { width: 400, height: 400 },
      boardPosition: { x: 10, y: 10, width: 400, height: 400, transform: '', zIndex: 1 },
      elementPositions: new Map(),
      layoutStrategy: 'horizontal',
      requiresScrolling: false,
      scrollContainers: []
    };
    const result = optimizer.validateLayout(config);
    assert(
      result.valid === true,
      'validateLayout returns valid for correct configuration'
    );
    assert(
      result.errors.length === 0,
      'validateLayout returns no errors for correct configuration'
    );
  } catch (error) {
    console.error('✗ validateLayout valid test failed:', error.message);
    failCount++;
  }

  // Test 11: validateLayout with invalid board size
  try {
    const optimizer = new LayoutOptimizer({ minBoardSize: 280 });
    const config = {
      boardSize: { width: 200, height: 200 },
      boardPosition: { x: 10, y: 10, width: 200, height: 200, transform: '', zIndex: 1 },
      elementPositions: new Map(),
      layoutStrategy: 'horizontal',
      requiresScrolling: false,
      scrollContainers: []
    };
    const result = optimizer.validateLayout(config);
    assert(
      result.valid === false,
      'validateLayout returns invalid for board below minimum size'
    );
    assert(
      result.errors.length > 0,
      'validateLayout returns errors for board below minimum size'
    );
  } catch (error) {
    console.error('✗ validateLayout invalid board test failed:', error.message);
    failCount++;
  }

  // Test 12: validateLayout with null configuration
  try {
    const optimizer = new LayoutOptimizer();
    const result = optimizer.validateLayout(null);
    assert(
      result.valid === false,
      'validateLayout returns invalid for null configuration'
    );
    assert(
      result.errors.length > 0,
      'validateLayout returns errors for null configuration'
    );
  } catch (error) {
    console.error('✗ validateLayout null test failed:', error.message);
    failCount++;
  }

  // Test 13: validateLayout with invalid layout strategy
  try {
    const optimizer = new LayoutOptimizer();
    const config = {
      boardSize: { width: 400, height: 400 },
      boardPosition: { x: 10, y: 10, width: 400, height: 400, transform: '', zIndex: 1 },
      elementPositions: new Map(),
      layoutStrategy: 'invalid-strategy',
      requiresScrolling: false,
      scrollContainers: []
    };
    const result = optimizer.validateLayout(config);
    assert(
      result.valid === false,
      'validateLayout returns invalid for invalid layout strategy'
    );
  } catch (error) {
    console.error('✗ validateLayout invalid strategy test failed:', error.message);
    failCount++;
  }

  // Test 14: calculateOptimalLayout with valid analysis
  try {
    const optimizer = new LayoutOptimizer();
    const analysisResult = {
      viewportWidth: 1920,
      viewportHeight: 1080,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    assert(
      layout !== null && layout !== undefined,
      'calculateOptimalLayout returns layout configuration'
    );
    assert(
      layout.boardSize !== undefined,
      'calculateOptimalLayout includes board size'
    );
    assert(
      layout.layoutStrategy !== undefined,
      'calculateOptimalLayout includes layout strategy'
    );
  } catch (error) {
    console.error('✗ calculateOptimalLayout test failed:', error.message);
    failCount++;
  }

  // Test 15: calculateOptimalLayout with null analysis
  try {
    const optimizer = new LayoutOptimizer();
    assertThrows(
      () => optimizer.calculateOptimalLayout(null),
      'calculateOptimalLayout throws error for null analysis'
    );
  } catch (error) {
    console.error('✗ calculateOptimalLayout null test failed:', error.message);
    failCount++;
  }

  // Test 16: calculateOptimalLayout with invalid viewport
  try {
    const optimizer = new LayoutOptimizer();
    assertThrows(
      () => optimizer.calculateOptimalLayout({
        viewportWidth: -100,
        viewportHeight: 1080,
        invisibleElements: []
      }),
      'calculateOptimalLayout throws error for invalid viewport'
    );
  } catch (error) {
    console.error('✗ calculateOptimalLayout invalid viewport test failed:', error.message);
    failCount++;
  }

  // Test 17: Board size maximization
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const boardSize = optimizer.calculateBoardSize(
      { width: 1000, height: 1000 },
      []
    );
    assert(
      boardSize.width > 280,
      'Board size is maximized when space is available'
    );
  } catch (error) {
    console.error('✗ Board size maximization test failed:', error.message);
    failCount++;
  }

  // Test 18: Minimum spacing enforcement
  try {
    const optimizer = new LayoutOptimizer({ spacing: 16 });
    assert(
      optimizer.getConfig('spacing') >= 16,
      'Minimum spacing of 16px is enforced'
    );
  } catch (error) {
    console.error('✗ Minimum spacing test failed:', error.message);
    failCount++;
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${passCount + failCount}`);

  return {
    passed: passCount,
    failed: failCount,
    total: passCount + failCount
  };
}

// Run tests if executed directly
if (require.main === module) {
  const results = runLayoutOptimizerTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = { runLayoutOptimizerTests };
