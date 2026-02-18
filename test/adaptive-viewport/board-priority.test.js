/**
 * Unit Tests for Board Priority and Conflict Resolution
 * Tests task 4.1: Board size calculation with priority handling
 * Validates Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

// Import dependencies
const LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');

/**
 * Test suite for board priority features
 */
function runBoardPriorityTests() {
  console.log('=== Board Priority and Conflict Resolution Tests ===\n');

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

  // Test 1: Board space allocated before UI elements
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const analysisResult = {
      viewportWidth: 800,
      viewportHeight: 600,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    
    // Board should be calculated first and get priority
    assert(
      layout.boardSize.width >= 280 && layout.boardSize.height >= 280,
      'Board space allocated before UI elements with minimum size enforced'
    );
  } catch (error) {
    console.error('✗ Board space allocation test failed:', error.message);
    failCount++;
  }

  // Test 2: Minimum board size enforcement (280px × 280px)
  try {
    const optimizer = new LayoutOptimizer({ minBoardSize: 280 });
    const boardSize = optimizer.calculateBoardSize(
      { width: 320, height: 480 }, // Very small viewport
      []
    );
    
    assert(
      boardSize.width >= 280 && boardSize.height >= 280,
      'Minimum board size of 280px × 280px is enforced even in small viewport'
    );
  } catch (error) {
    console.error('✗ Minimum board size test failed:', error.message);
    failCount++;
  }

  // Test 3: Board size maximization algorithm
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const boardSize1 = optimizer.calculateBoardSize(
      { width: 1920, height: 1080 },
      []
    );
    const boardSize2 = optimizer.calculateBoardSize(
      { width: 800, height: 600 },
      []
    );
    
    assert(
      boardSize1.width > boardSize2.width,
      'Board size is maximized based on available space'
    );
    assert(
      boardSize1.width <= 1080, // Limited by height
      'Board size respects viewport constraints'
    );
  } catch (error) {
    console.error('✗ Board size maximization test failed:', error.message);
    failCount++;
  }

  // Test 4: Aspect ratio preservation (square board)
  try {
    const optimizer = new LayoutOptimizer();
    const boardSize = optimizer.calculateBoardSize(
      { width: 1920, height: 1080 },
      []
    );
    
    assert(
      boardSize.width === boardSize.height,
      'Board maintains square aspect ratio (width === height)'
    );
  } catch (error) {
    console.error('✗ Aspect ratio preservation test failed:', error.message);
    failCount++;
  }

  // Test 5: Conflict resolution - board priority over UI
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true, minBoardSize: 280 });
    
    // Simulate conflict: small viewport with UI elements
    const boardSize = optimizer.calculateBoardSize(
      { width: 400, height: 500 },
      [{}, {}, {}] // Mock UI elements
    );
    
    assert(
      boardSize.width >= 280 && boardSize.height >= 280,
      'Board size is preserved at minimum even when UI elements conflict'
    );
  } catch (error) {
    console.error('✗ Conflict resolution test failed:', error.message);
    failCount++;
  }

  // Test 6: resolveLayoutConflicts method - no conflict scenario
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const result = optimizer.resolveLayoutConflicts(
      { width: 400, height: 400 },
      [],
      { width: 1920, height: 1080 }
    );
    
    assert(
      result.conflictResolved === false,
      'No conflict detected when space is ample'
    );
    assert(
      result.requiresScrolling === false,
      'No scrolling required when no conflict'
    );
  } catch (error) {
    console.error('✗ resolveLayoutConflicts no-conflict test failed:', error.message);
    failCount++;
  }

  // Test 7: resolveLayoutConflicts method - conflict with board priority
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true, minBoardSize: 280 });
    const result = optimizer.resolveLayoutConflicts(
      { width: 280, height: 280 },
      [{}, {}, {}], // Mock UI elements
      { width: 400, height: 500 }
    );
    
    assert(
      result.conflictResolved === true,
      'Conflict is detected and resolved'
    );
    assert(
      result.boardSize.width >= 280,
      'Board size is preserved during conflict resolution'
    );
    assert(
      result.uiStrategy === 'vertical' || result.uiStrategy === 'vertical-scroll',
      'UI elements are repositioned vertically when conflict occurs'
    );
  } catch (error) {
    console.error('✗ resolveLayoutConflicts conflict test failed:', error.message);
    failCount++;
  }

  // Test 8: Board priority in calculateOptimalLayout
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const analysisResult = {
      viewportWidth: 600,
      viewportHeight: 700,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    
    // Board should be positioned first
    assert(
      layout.boardPosition !== undefined,
      'Board position is calculated in optimal layout'
    );
    assert(
      layout.boardSize.width >= 280,
      'Board size meets minimum in optimal layout'
    );
  } catch (error) {
    console.error('✗ Board priority in calculateOptimalLayout test failed:', error.message);
    failCount++;
  }

  // Test 9: UI elements forced to scroll when board takes priority
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true, minBoardSize: 280 });
    const analysisResult = {
      viewportWidth: 400,
      viewportHeight: 500,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    
    // With small viewport and board priority, UI may need scrolling
    assert(
      layout.requiresScrolling !== undefined,
      'Scrolling requirement is determined'
    );
    assert(
      layout.boardSize.width >= 280,
      'Board maintains minimum size even if UI needs scrolling'
    );
  } catch (error) {
    console.error('✗ UI scrolling with board priority test failed:', error.message);
    failCount++;
  }

  // Test 10: Board maximization with prioritizeBoard=true
  try {
    const optimizerPriority = new LayoutOptimizer({ prioritizeBoard: true });
    const optimizerNoPriority = new LayoutOptimizer({ prioritizeBoard: false });
    
    const boardSizePriority = optimizerPriority.calculateBoardSize(
      { width: 1000, height: 1000 },
      [{}, {}, {}]
    );
    const boardSizeNoPriority = optimizerNoPriority.calculateBoardSize(
      { width: 1000, height: 1000 },
      [{}, {}, {}]
    );
    
    assert(
      boardSizePriority.width >= boardSizeNoPriority.width,
      'Board is larger when prioritizeBoard=true'
    );
  } catch (error) {
    console.error('✗ Board maximization comparison test failed:', error.message);
    failCount++;
  }

  // Test 11: Conflict resolution preserves minimum board size
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true, minBoardSize: 280 });
    const result = optimizer.resolveLayoutConflicts(
      { width: 250, height: 250 }, // Below minimum
      [{}, {}, {}],
      { width: 400, height: 500 }
    );
    
    assert(
      result.boardSize.width >= 280,
      'Conflict resolution enforces minimum board size'
    );
  } catch (error) {
    console.error('✗ Conflict resolution minimum size test failed:', error.message);
    failCount++;
  }

  // Test 12: Board position calculated after board size
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const analysisResult = {
      viewportWidth: 1920,
      viewportHeight: 1080,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    
    assert(
      layout.boardPosition.x >= 0 && layout.boardPosition.y >= 0,
      'Board position is valid (non-negative coordinates)'
    );
    assert(
      layout.boardPosition.width === layout.boardSize.width,
      'Board position dimensions match board size'
    );
  } catch (error) {
    console.error('✗ Board position calculation test failed:', error.message);
    failCount++;
  }

  // Test 13: Available space for UI calculated after board allocation
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const analysisResult = {
      viewportWidth: 1000,
      viewportHeight: 800,
      invisibleElements: []
    };
    const layout = optimizer.calculateOptimalLayout(analysisResult);
    
    // UI elements should be positioned in space remaining after board
    assert(
      layout.elementPositions !== undefined,
      'Element positions are calculated after board allocation'
    );
  } catch (error) {
    console.error('✗ Available space calculation test failed:', error.message);
    failCount++;
  }

  // Test 14: Extreme case - viewport barely fits minimum board
  try {
    const optimizer = new LayoutOptimizer({ minBoardSize: 280 });
    const boardSize = optimizer.calculateBoardSize(
      { width: 300, height: 300 },
      []
    );
    
    assert(
      boardSize.width >= 280 && boardSize.width <= 300,
      'Board fits in minimal viewport'
    );
  } catch (error) {
    console.error('✗ Extreme minimal viewport test failed:', error.message);
    failCount++;
  }

  // Test 15: Board priority with multiple UI elements
  try {
    const optimizer = new LayoutOptimizer({ prioritizeBoard: true });
    const mockElements = [{}, {}, {}, {}, {}]; // 5 UI elements
    const boardSize = optimizer.calculateBoardSize(
      { width: 800, height: 600 },
      mockElements
    );
    
    assert(
      boardSize.width >= 280,
      'Board maintains minimum size even with many UI elements'
    );
  } catch (error) {
    console.error('✗ Multiple UI elements test failed:', error.message);
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
  const results = runBoardPriorityTests();
  process.exit(results.failed > 0 ? 1 : 0);
}

module.exports = { runBoardPriorityTests };
