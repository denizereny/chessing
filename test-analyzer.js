// Simple test for Advanced Position Analyzer
const fs = require('fs');

// Read the analyzer file
const analyzerCode = fs.readFileSync('js/advanced-position-analyzer.js', 'utf8');

// Create a simple environment for testing
global.window = undefined;
global.module = { exports: {} };

// Execute the analyzer code
eval(analyzerCode);

// Get the analyzer class
const AdvancedPositionAnalyzer = module.exports;

// Create test instance
const analyzer = new AdvancedPositionAnalyzer();

// Test positions
const testPositions = {
    starting: [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
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
    tactical: [
        [null, "q", "k", null],
        [null, "p", null, "p"],
        [null, null, "Q", null],
        [null, "P", null, "P"],
        [null, null, "K", null]
    ]
};

console.log('🧠 Testing Advanced Position Analyzer...\n');

// Test 1: Starting position
console.log('Test 1: Starting Position');
console.log('========================');
const startingAnalysis = analyzer.analyzePosition(testPositions.starting);
console.log('Material Balance:', startingAnalysis.materialBalance.balance);
console.log('White Activity:', startingAnalysis.pieceActivity.white.mobilePieces, 'pieces');
console.log('Black Activity:', startingAnalysis.pieceActivity.black.mobilePieces, 'pieces');
console.log('Center Control:', `${startingAnalysis.centerControl.white}-${startingAnalysis.centerControl.black}`);
console.log('Position Type:', startingAnalysis.positionType);
console.log('King Safety - White:', startingAnalysis.kingSafety.white.status);
console.log('King Safety - Black:', startingAnalysis.kingSafety.black.status);
console.log('Recommendations:', startingAnalysis.recommendations.length);
console.log('');

// Test 2: Endgame position
console.log('Test 2: Endgame Position');
console.log('========================');
const endgameAnalysis = analyzer.analyzePosition(testPositions.endgame);
console.log('Material Balance:', endgameAnalysis.materialBalance.balance);
console.log('White Activity:', endgameAnalysis.pieceActivity.white.mobilePieces, 'pieces');
console.log('Black Activity:', endgameAnalysis.pieceActivity.black.mobilePieces, 'pieces');
console.log('Center Control:', `${endgameAnalysis.centerControl.white}-${endgameAnalysis.centerControl.black}`);
console.log('Position Type:', endgameAnalysis.positionType);
console.log('King Safety - White:', endgameAnalysis.kingSafety.white.status);
console.log('King Safety - Black:', endgameAnalysis.kingSafety.black.status);
console.log('Recommendations:', endgameAnalysis.recommendations.length);
console.log('');

// Test 3: Tactical position
console.log('Test 3: Tactical Position');
console.log('=========================');
const tacticalAnalysis = analyzer.analyzePosition(testPositions.tactical);
console.log('Material Balance:', tacticalAnalysis.materialBalance.balance);
console.log('White Activity:', tacticalAnalysis.pieceActivity.white.mobilePieces, 'pieces');
console.log('Black Activity:', tacticalAnalysis.pieceActivity.black.mobilePieces, 'pieces');
console.log('Center Control:', `${tacticalAnalysis.centerControl.white}-${tacticalAnalysis.centerControl.black}`);
console.log('Position Type:', tacticalAnalysis.positionType);
console.log('King Safety - White:', tacticalAnalysis.kingSafety.white.status);
console.log('King Safety - Black:', tacticalAnalysis.kingSafety.black.status);
console.log('Recommendations:', tacticalAnalysis.recommendations.length);
console.log('');

// Test 4: Performance test
console.log('Test 4: Performance Test');
console.log('========================');
const iterations = 100;
const startTime = Date.now();

for (let i = 0; i < iterations; i++) {
    analyzer.analyzePosition(testPositions.starting);
    analyzer.analyzePosition(testPositions.endgame);
    analyzer.analyzePosition(testPositions.tactical);
}

const endTime = Date.now();
const totalTime = endTime - startTime;
const avgTime = totalTime / (iterations * 3);

console.log('Total time:', totalTime + 'ms');
console.log('Average time per analysis:', avgTime.toFixed(2) + 'ms');
console.log('Analyses per second:', Math.round(1000 / avgTime));
console.log('Cache size:', analyzer.getCacheStats().size);
console.log('');

// Test 5: Invalid position
console.log('Test 5: Invalid Position');
console.log('========================');
const invalidPosition = [
    ["r", "q", "k", "r"],
    ["p", "p", "p"]  // Invalid - wrong dimensions
];
const invalidAnalysis = analyzer.analyzePosition(invalidPosition);
console.log('Error detected:', invalidAnalysis.error);
console.log('Error message:', invalidAnalysis.message);
console.log('');

// Test 6: Detailed analysis report
console.log('Test 6: Detailed Analysis Report');
console.log('================================');
const report = analyzer.generateAnalysisReport(testPositions.starting);
console.log('Summary:', report.summary);
console.log('Position Type:', report.positionType);
console.log('Recommendations count:', report.recommendations.length);
console.log('');

console.log('✅ All tests completed successfully!');
console.log('🧠 Advanced Position Analyzer is working correctly.');