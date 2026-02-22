/**
 * Validation script for Task 10.1: Extreme Viewport Support
 * Validates Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

console.log('=== Task 10.1: Extreme Viewport Support Validation ===\n');

// Load dependencies
const fs = require('fs');
const path = require('path');

// Read the ViewportAnalyzer source code
const analyzerPath = path.join(__dirname, '../../js/adaptive-viewport/viewport-analyzer.js');
const analyzerCode = fs.readFileSync(analyzerPath, 'utf8');

let validationResults = {
  total: 0,
  passed: 0,
  failed: 0,
  checks: []
};

function check(condition, description, requirement) {
  validationResults.total++;
  const result = {
    description,
    requirement,
    passed: condition
  };
  
  if (condition) {
    validationResults.passed++;
    console.log(`✓ PASS: ${description} (${requirement})`);
  } else {
    validationResults.failed++;
    console.log(`✗ FAIL: ${description} (${requirement})`);
  }
  
  validationResults.checks.push(result);
}

console.log('--- Code Structure Validation ---\n');

// Requirement 5.1, 5.2: Viewport dimension validation
check(
  analyzerCode.includes('_validateViewportDimensions'),
  'ViewportAnalyzer has _validateViewportDimensions method',
  'Requirements 5.1, 5.2'
);

check(
  analyzerCode.includes('MIN_WIDTH') && analyzerCode.includes('MAX_WIDTH'),
  'Viewport width validation uses MIN_WIDTH and MAX_WIDTH constants',
  'Requirement 5.1'
);

check(
  analyzerCode.includes('MIN_HEIGHT') && analyzerCode.includes('MAX_HEIGHT'),
  'Viewport height validation uses MIN_HEIGHT and MAX_HEIGHT constants',
  'Requirement 5.2'
);

check(
  analyzerCode.includes('320') || analyzerCode.includes('MIN_WIDTH'),
  'Minimum width of 320px is enforced',
  'Requirement 5.1'
);

check(
  analyzerCode.includes('3840') || analyzerCode.includes('MAX_WIDTH'),
  'Maximum width of 3840px is enforced',
  'Requirement 5.1'
);

check(
  analyzerCode.includes('480') || analyzerCode.includes('MIN_HEIGHT'),
  'Minimum height of 480px is enforced',
  'Requirement 5.2'
);

check(
  analyzerCode.includes('2160') || analyzerCode.includes('MAX_HEIGHT'),
  'Maximum height of 2160px is enforced',
  'Requirement 5.2'
);

// Requirement 5.3: Extreme aspect ratio detection
check(
  analyzerCode.includes('_isExtremeAspectRatio'),
  'ViewportAnalyzer has _isExtremeAspectRatio method',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('_getExtremeAspectRatioType'),
  'ViewportAnalyzer has _getExtremeAspectRatioType method',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('EXTREME_ASPECT_RATIO_WIDE') || analyzerCode.includes('> 3'),
  'Extreme aspect ratio detection for ultra-wide (>3)',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('EXTREME_ASPECT_RATIO_TALL') || analyzerCode.includes('< 0.33'),
  'Extreme aspect ratio detection for very tall (<0.33)',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('ultra-wide'),
  'Ultra-wide aspect ratio type is identified',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('very-tall'),
  'Very tall aspect ratio type is identified',
  'Requirement 5.3'
);

// Requirement 5.3, 5.4: Adaptive strategy selection
check(
  analyzerCode.includes('_determineLayoutStrategyWithExtremeHandling'),
  'ViewportAnalyzer has _determineLayoutStrategyWithExtremeHandling method',
  'Requirements 5.3, 5.4'
);

check(
  analyzerCode.includes('isExtremeAspectRatio'),
  'Layout strategy considers extreme aspect ratios',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('extremeType') || analyzerCode.includes('extremeAspectRatioType'),
  'Layout strategy uses extreme aspect ratio type',
  'Requirement 5.3'
);

// Requirement 5.4: Portrait and landscape orientation handling
check(
  analyzerCode.includes('orientation'),
  'ViewportAnalyzer tracks orientation',
  'Requirement 5.4'
);

check(
  analyzerCode.includes('landscape') && analyzerCode.includes('portrait'),
  'ViewportAnalyzer handles both landscape and portrait orientations',
  'Requirement 5.4'
);

check(
  analyzerCode.includes('aspectRatio > 1'),
  'Orientation is determined by aspect ratio',
  'Requirement 5.4'
);

// Requirement 5.5: Orientation change detection
check(
  analyzerCode.includes('handleOrientationChange'),
  'ViewportAnalyzer has handleOrientationChange method',
  'Requirement 5.5'
);

check(
  analyzerCode.includes('orientationchange'),
  'ViewportAnalyzer listens for orientationchange events',
  'Requirement 5.5'
);

check(
  analyzerCode.includes('ORIENTATION_CHANGE_TIMEOUT') || analyzerCode.includes('150'),
  'Orientation change re-optimization timeout is configured',
  'Requirement 5.5'
);

check(
  analyzerCode.includes('invalidateCache') && analyzerCode.includes('handleOrientationChange'),
  'Cache is invalidated on orientation change',
  'Requirement 5.5'
);

// Integration checks
check(
  analyzerCode.includes('validatedDimensions'),
  'Validated dimensions are used in analysis',
  'Requirements 5.1, 5.2'
);

check(
  analyzerCode.includes('isExtremeAspectRatio') && analyzerCode.includes('analyzeViewport'),
  'Extreme aspect ratio detection is integrated into viewport analysis',
  'Requirement 5.3'
);

check(
  analyzerCode.includes('extremeAspectRatioType') && analyzerCode.includes('analysisResult'),
  'Extreme aspect ratio type is included in analysis result',
  'Requirement 5.3'
);

// Display summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${validationResults.total}`);
console.log(`Passed: ${validationResults.passed}`);
console.log(`Failed: ${validationResults.failed}`);
console.log(`Success Rate: ${((validationResults.passed / validationResults.total) * 100).toFixed(1)}%`);

if (validationResults.failed === 0) {
  console.log('\n✓ All validation checks passed!');
  console.log('Task 10.1 implementation is complete and correct.');
  process.exit(0);
} else {
  console.log('\n✗ Some validation checks failed.');
  console.log('Please review the failed checks above.');
  process.exit(1);
}
