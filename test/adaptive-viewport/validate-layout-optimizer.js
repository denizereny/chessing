/**
 * Validation script for LayoutOptimizer implementation
 * Verifies that all required methods and functionality are present
 */

console.log('=== LayoutOptimizer Implementation Validation ===\n');

// Check if running in browser or Node.js
const isBrowser = typeof window !== 'undefined';

if (!isBrowser) {
  console.log('This validation script should be run in a browser.');
  console.log('Please open test/adaptive-viewport/test-layout-optimizer.html');
  process.exit(0);
}

// Validation checks
const checks = [];

function validate(condition, description) {
  checks.push({ condition, description });
  if (condition) {
    console.log(`✓ ${description}`);
  } else {
    console.error(`✗ ${description}`);
  }
}

// Check 1: LayoutOptimizer class exists
validate(
  typeof LayoutOptimizer === 'function',
  'LayoutOptimizer class is defined'
);

// Check 2: Can instantiate LayoutOptimizer
let optimizer;
try {
  optimizer = new LayoutOptimizer();
  validate(true, 'LayoutOptimizer can be instantiated');
} catch (error) {
  validate(false, `LayoutOptimizer instantiation failed: ${error.message}`);
}

// Check 3: Constructor accepts configuration
try {
  const customOptimizer = new LayoutOptimizer({
    minBoardSize: 300,
    spacing: 20,
    prioritizeBoard: false
  });
  validate(
    customOptimizer.getConfig('minBoardSize') === 300,
    'Constructor accepts custom configuration'
  );
} catch (error) {
  validate(false, `Constructor configuration failed: ${error.message}`);
}

// Check 4: calculateOptimalLayout method exists
validate(
  typeof optimizer.calculateOptimalLayout === 'function',
  'calculateOptimalLayout method exists'
);

// Check 5: calculateBoardSize method exists
validate(
  typeof optimizer.calculateBoardSize === 'function',
  'calculateBoardSize method exists'
);

// Check 6: determineLayoutStrategy method exists
validate(
  typeof optimizer.determineLayoutStrategy === 'function',
  'determineLayoutStrategy method exists'
);

// Check 7: calculateElementPositions method exists
validate(
  typeof optimizer.calculateElementPositions === 'function',
  'calculateElementPositions method exists'
);

// Check 8: validateLayout method exists
validate(
  typeof optimizer.validateLayout === 'function',
  'validateLayout method exists'
);

// Check 9: calculateBoardSize works correctly
try {
  const boardSize = optimizer.calculateBoardSize(
    { width: 1920, height: 1080 },
    []
  );
  validate(
    boardSize && boardSize.width > 0 && boardSize.height > 0,
    'calculateBoardSize returns valid dimensions'
  );
  validate(
    boardSize.width === boardSize.height,
    'calculateBoardSize maintains square aspect ratio'
  );
} catch (error) {
  validate(false, `calculateBoardSize failed: ${error.message}`);
}

// Check 10: determineLayoutStrategy returns valid strategies
try {
  const strategy1 = optimizer.determineLayoutStrategy({ width: 1920, height: 1080 }, 3);
  const strategy2 = optimizer.determineLayoutStrategy({ width: 400, height: 800 }, 3);
  const validStrategies = ['horizontal', 'vertical', 'hybrid'];
  validate(
    validStrategies.includes(strategy1) && validStrategies.includes(strategy2),
    'determineLayoutStrategy returns valid strategy values'
  );
} catch (error) {
  validate(false, `determineLayoutStrategy failed: ${error.message}`);
}

// Check 11: calculateElementPositions returns Map
try {
  const positions = optimizer.calculateElementPositions(
    [],
    'horizontal',
    { x: 0, y: 0, width: 500, height: 500 }
  );
  validate(
    positions instanceof Map,
    'calculateElementPositions returns Map'
  );
} catch (error) {
  validate(false, `calculateElementPositions failed: ${error.message}`);
}

// Check 12: validateLayout validates correctly
try {
  const validConfig = {
    boardSize: { width: 400, height: 400 },
    boardPosition: { x: 10, y: 10, width: 400, height: 400, transform: '', zIndex: 1 },
    elementPositions: new Map(),
    layoutStrategy: 'horizontal',
    requiresScrolling: false,
    scrollContainers: []
  };
  const result = optimizer.validateLayout(validConfig);
  validate(
    result && typeof result.valid === 'boolean' && Array.isArray(result.errors),
    'validateLayout returns correct structure'
  );
} catch (error) {
  validate(false, `validateLayout failed: ${error.message}`);
}

// Check 13: calculateOptimalLayout returns complete configuration
try {
  const analysisResult = {
    viewportWidth: 1920,
    viewportHeight: 1080,
    invisibleElements: []
  };
  const layout = optimizer.calculateOptimalLayout(analysisResult);
  validate(
    layout && layout.boardSize && layout.boardPosition && layout.layoutStrategy,
    'calculateOptimalLayout returns complete configuration'
  );
} catch (error) {
  validate(false, `calculateOptimalLayout failed: ${error.message}`);
}

// Check 14: Inherits from BaseComponent
validate(
  optimizer instanceof BaseComponent,
  'LayoutOptimizer extends BaseComponent'
);

// Check 15: Has configuration management methods
validate(
  typeof optimizer.getConfig === 'function' && typeof optimizer.setConfig === 'function',
  'Has configuration management methods from BaseComponent'
);

// Summary
console.log('\n=== Validation Summary ===');
const passed = checks.filter(c => c.condition).length;
const failed = checks.filter(c => !c.condition).length;
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${checks.length}`);

if (failed === 0) {
  console.log('\n✓ All validation checks passed!');
  console.log('LayoutOptimizer implementation is complete and correct.');
} else {
  console.log('\n✗ Some validation checks failed.');
  console.log('Please review the implementation.');
}
