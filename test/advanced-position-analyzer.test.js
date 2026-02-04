/**
 * Unit Tests for Advanced Position Analyzer
 * 
 * Tests all requirements:
 * - 3.1: Material balance calculation (P=1, N=3, B=3, R=5, Q=9)
 * - 3.2: Piece activity evaluation (mobile piece count)
 * - 3.3: King safety analysis (check status, escape squares)
 * - 3.4: Center control calculation (center squares: d2, d3, e2, e3)
 */

// Mock environment for testing
if (typeof window === 'undefined') {
  global.window = undefined;
  global.module = { exports: {} };
  
  // Load the analyzer
  const fs = require('fs');
  const analyzerCode = fs.readFileSync('js/advanced-position-analyzer.js', 'utf8');
  eval(analyzerCode);
  global.AdvancedPositionAnalyzer = module.exports;
}

// Test suite
class AdvancedPositionAnalyzerTests {
  constructor() {
    this.analyzer = new AdvancedPositionAnalyzer();
    this.testResults = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }
  
  // Test helper methods
  assert(condition, message) {
    this.totalTests++;
    if (condition) {
      this.passedTests++;
      this.testResults.push(`✅ ${message}`);
      return true;
    } else {
      this.testResults.push(`❌ ${message}`);
      return false;
    }
  }
  
  assertEqual(actual, expected, message) {
    return this.assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
  }
  
  assertNotNull(value, message) {
    return this.assert(value !== null && value !== undefined, message);
  }
  
  // Test positions
  getTestPositions() {
    return {
      starting: [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ],
      materialAdvantage: [
        [null, "q", "k", null],
        [null, "p", null, null],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ],
      endgame: [
        [null, null, "k", null],
        [null, null, null, null],
        [null, null, null, null],
        ["P", null, null, null],
        ["R", null, "K", null]
      ],
      checkPosition: [
        [null, null, "k", null],
        [null, null, null, null],
        [null, null, "Q", null],
        [null, null, null, null],
        [null, null, "K", null]
      ],
      centerControl: [
        [null, null, "k", null],
        [null, null, null, null],
        [null, null, "N", null],
        [null, null, null, null],
        [null, null, "K", null]
      ]
    };
  }
  
  // Requirement 3.1: Material balance calculation
  testMaterialBalanceCalculation() {
    console.log('\n🧮 Testing Material Balance Calculation (Requirement 3.1)');
    
    const positions = this.getTestPositions();
    
    // Test starting position (should be equal)
    const startingAnalysis = this.analyzer.analyzePosition(positions.starting);
    this.assertNotNull(startingAnalysis.materialBalance, 'Material balance analysis exists');
    this.assertEqual(startingAnalysis.materialBalance.balance, 0, 'Starting position has equal material');
    this.assertEqual(startingAnalysis.materialBalance.advantage, 'equal', 'Starting position advantage is equal');
    
    // Test material advantage position
    const advantageAnalysis = this.analyzer.analyzePosition(positions.materialAdvantage);
    this.assert(advantageAnalysis.materialBalance.balance > 0, 'White has material advantage');
    this.assertEqual(advantageAnalysis.materialBalance.advantage, 'white', 'White advantage detected');
    
    // Test piece values (P=1, N=3, B=3, R=5, Q=9)
    this.assertEqual(this.analyzer.pieceValues.p, 1, 'Pawn value is 1');
    this.assertEqual(this.analyzer.pieceValues.n, 3, 'Knight value is 3');
    this.assertEqual(this.analyzer.pieceValues.b, 3, 'Bishop value is 3');
    this.assertEqual(this.analyzer.pieceValues.r, 5, 'Rook value is 5');
    this.assertEqual(this.analyzer.pieceValues.q, 9, 'Queen value is 9');
    
    // Test endgame material calculation
    const endgameAnalysis = this.analyzer.analyzePosition(positions.endgame);
    const expectedBalance = 5 + 1; // Rook + Pawn for white
    this.assertEqual(endgameAnalysis.materialBalance.balance, expectedBalance, 'Endgame material balance correct');
  }
  
  // Requirement 3.2: Piece activity evaluation
  testPieceActivityEvaluation() {
    console.log('\n🏃 Testing Piece Activity Evaluation (Requirement 3.2)');
    
    const positions = this.getTestPositions();
    
    // Test starting position activity
    const startingAnalysis = this.analyzer.analyzePosition(positions.starting);
    this.assertNotNull(startingAnalysis.pieceActivity, 'Piece activity analysis exists');
    this.assertNotNull(startingAnalysis.pieceActivity.white, 'White activity data exists');
    this.assertNotNull(startingAnalysis.pieceActivity.black, 'Black activity data exists');
    
    // Check mobile piece counts
    this.assert(startingAnalysis.pieceActivity.white.mobilePieces >= 0, 'White mobile pieces count is valid');
    this.assert(startingAnalysis.pieceActivity.black.mobilePieces >= 0, 'Black mobile pieces count is valid');
    
    // Test endgame activity (fewer pieces should have fewer mobile pieces)
    const endgameAnalysis = this.analyzer.analyzePosition(positions.endgame);
    this.assert(endgameAnalysis.pieceActivity.white.mobilePieces <= startingAnalysis.pieceActivity.white.mobilePieces, 
                'Endgame has fewer or equal mobile pieces than starting position');
    
    // Test total moves calculation
    this.assert(startingAnalysis.pieceActivity.white.totalMoves >= startingAnalysis.pieceActivity.white.mobilePieces,
                'Total moves >= mobile pieces for white');
    this.assert(startingAnalysis.pieceActivity.black.totalMoves >= startingAnalysis.pieceActivity.black.mobilePieces,
                'Total moves >= mobile pieces for black');
  }
  
  // Requirement 3.3: King safety analysis
  testKingSafetyAnalysis() {
    console.log('\n👑 Testing King Safety Analysis (Requirement 3.3)');
    
    const positions = this.getTestPositions();
    
    // Test starting position king safety
    const startingAnalysis = this.analyzer.analyzePosition(positions.starting);
    this.assertNotNull(startingAnalysis.kingSafety, 'King safety analysis exists');
    this.assertNotNull(startingAnalysis.kingSafety.white, 'White king safety data exists');
    this.assertNotNull(startingAnalysis.kingSafety.black, 'Black king safety data exists');
    
    // Check king positions are found
    this.assertNotNull(startingAnalysis.kingSafety.white.position, 'White king position found');
    this.assertNotNull(startingAnalysis.kingSafety.black.position, 'Black king position found');
    
    // Check check status
    this.assertEqual(typeof startingAnalysis.kingSafety.white.inCheck, 'boolean', 'White check status is boolean');
    this.assertEqual(typeof startingAnalysis.kingSafety.black.inCheck, 'boolean', 'Black check status is boolean');
    
    // Test check position
    const checkAnalysis = this.analyzer.analyzePosition(positions.checkPosition);
    this.assert(checkAnalysis.kingSafety.black.inCheck, 'Black king in check detected');
    
    // Test escape squares calculation
    this.assert(typeof startingAnalysis.kingSafety.white.escapeSquares === 'number', 'White escape squares is number');
    this.assert(typeof startingAnalysis.kingSafety.black.escapeSquares === 'number', 'Black escape squares is number');
    this.assert(startingAnalysis.kingSafety.white.escapeSquares >= 0, 'White escape squares >= 0');
    this.assert(startingAnalysis.kingSafety.black.escapeSquares >= 0, 'Black escape squares >= 0');
    
    // Test safety status
    const validStatuses = ['safe', 'moderate', 'restricted', 'dangerous', 'critical', 'check'];
    this.assert(validStatuses.includes(startingAnalysis.kingSafety.white.status), 'White king status is valid');
    this.assert(validStatuses.includes(startingAnalysis.kingSafety.black.status), 'Black king status is valid');
  }
  
  // Requirement 3.4: Center control calculation
  testCenterControlCalculation() {
    console.log('\n🎯 Testing Center Control Calculation (Requirement 3.4)');
    
    const positions = this.getTestPositions();
    
    // Test center squares definition (d2, d3, e2, e3)
    this.assertEqual(this.analyzer.centerSquares.length, 4, 'Four center squares defined');
    
    // Verify center square coordinates (converted to array indices)
    const expectedCenterSquares = [
      { row: 3, col: 3 }, // d2
      { row: 2, col: 3 }, // d3
      { row: 3, col: 0 }, // e2
      { row: 2, col: 0 }  // e3
    ];
    
    for (let i = 0; i < 4; i++) {
      this.assertEqual(this.analyzer.centerSquares[i].row, expectedCenterSquares[i].row, 
                     `Center square ${i} row correct`);
      this.assertEqual(this.analyzer.centerSquares[i].col, expectedCenterSquares[i].col, 
                     `Center square ${i} col correct`);
    }
    
    // Test center control analysis
    const startingAnalysis = this.analyzer.analyzePosition(positions.starting);
    this.assertNotNull(startingAnalysis.centerControl, 'Center control analysis exists');
    this.assert(typeof startingAnalysis.centerControl.white === 'number', 'White center control is number');
    this.assert(typeof startingAnalysis.centerControl.black === 'number', 'Black center control is number');
    this.assertEqual(startingAnalysis.centerControl.totalCenterSquares, 4, 'Total center squares is 4');
    
    // Test center control advantage
    const validAdvantages = ['white', 'black', 'equal'];
    this.assert(validAdvantages.includes(startingAnalysis.centerControl.advantage), 'Center control advantage is valid');
    
    // Test center control position
    const centerAnalysis = this.analyzer.analyzePosition(positions.centerControl);
    this.assert(centerAnalysis.centerControl.white >= 0, 'White center control >= 0');
    this.assert(centerAnalysis.centerControl.black >= 0, 'Black center control >= 0');
    this.assert(centerAnalysis.centerControl.white + centerAnalysis.centerControl.black <= 4, 
                'Total controlled squares <= 4');
  }
  
  // Test performance requirements
  testPerformanceRequirements() {
    console.log('\n⚡ Testing Performance Requirements');
    
    const positions = this.getTestPositions();
    const iterations = 10;
    
    // Test analysis performance (Requirement: < 500ms)
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      this.analyzer.analyzePosition(positions.starting);
    }
    
    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;
    
    this.assert(avgTime < 500, `Analysis performance meets requirement (${avgTime.toFixed(2)}ms < 500ms)`);
    
    // Test cache functionality
    const cacheStats = this.analyzer.getCacheStats();
    this.assert(cacheStats.size > 0, 'Analysis cache is working');
    
    // Test cache improves performance
    const cachedStartTime = performance.now();
    this.analyzer.analyzePosition(positions.starting); // Should be cached
    const cachedEndTime = performance.now();
    const cachedTime = cachedEndTime - cachedStartTime;
    
    this.assert(cachedTime < avgTime, `Cache improves performance (${cachedTime.toFixed(2)}ms < ${avgTime.toFixed(2)}ms)`);
  }
  
  // Test error handling
  testErrorHandling() {
    console.log('\n🛡️ Testing Error Handling');
    
    // Test invalid position
    const invalidPosition = [
      ["r", "q", "k"],  // Wrong dimensions
      ["p", "p", "p"]
    ];
    
    const invalidAnalysis = this.analyzer.analyzePosition(invalidPosition);
    this.assert(invalidAnalysis.error, 'Invalid position error detected');
    this.assertNotNull(invalidAnalysis.message, 'Error message provided');
    
    // Test null position
    const nullAnalysis = this.analyzer.analyzePosition(null);
    this.assert(nullAnalysis.error, 'Null position error detected');
    
    // Test empty position
    const emptyPosition = [];
    const emptyAnalysis = this.analyzer.analyzePosition(emptyPosition);
    this.assert(emptyAnalysis.error, 'Empty position error detected');
  }
  
  // Test comprehensive analysis report
  testAnalysisReport() {
    console.log('\n📊 Testing Analysis Report Generation');
    
    const positions = this.getTestPositions();
    const report = this.analyzer.generateAnalysisReport(positions.starting);
    
    this.assertNotNull(report, 'Analysis report generated');
    this.assertNotNull(report.summary, 'Report summary exists');
    this.assertNotNull(report.details, 'Report details exist');
    this.assertNotNull(report.recommendations, 'Report recommendations exist');
    this.assertNotNull(report.positionType, 'Report position type exists');
    this.assertNotNull(report.timestamp, 'Report timestamp exists');
    
    // Test summary is a string
    this.assertEqual(typeof report.summary, 'string', 'Summary is a string');
    this.assert(report.summary.length > 0, 'Summary is not empty');
    
    // Test recommendations is an array
    this.assert(Array.isArray(report.recommendations), 'Recommendations is an array');
  }
  
  // Run all tests
  runAllTests() {
    console.log('🧠 Advanced Position Analyzer Test Suite');
    console.log('========================================');
    
    this.testMaterialBalanceCalculation();
    this.testPieceActivityEvaluation();
    this.testKingSafetyAnalysis();
    this.testCenterControlCalculation();
    this.testPerformanceRequirements();
    this.testErrorHandling();
    this.testAnalysisReport();
    
    console.log('\n📊 Test Results');
    console.log('===============');
    console.log(`Passed: ${this.passedTests}/${this.totalTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('🎉 All tests passed! Advanced Position Analyzer is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the results above.');
    }
    
    // Print detailed results
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(result => console.log(result));
    
    return {
      passed: this.passedTests,
      total: this.totalTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      allPassed: this.passedTests === this.totalTests,
      results: this.testResults
    };
  }
}

// Run tests if this is the main module
if (typeof require !== 'undefined' && require.main === module) {
  const testSuite = new AdvancedPositionAnalyzerTests();
  testSuite.runAllTests();
} else if (typeof window !== 'undefined') {
  // Browser environment
  window.AdvancedPositionAnalyzerTests = AdvancedPositionAnalyzerTests;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedPositionAnalyzerTests;
}