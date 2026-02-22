/**
 * Property-Based Test: Extreme Viewport Dimension Support
 * Feature: adaptive-viewport-optimizer
 * Property 17: Extreme Viewport Dimension Support
 * 
 * **Validates: Requirements 5.1, 5.2**
 * 
 * For any viewport width between 320px and 3840px and height between 480px and 
 * 2160px, the layout optimizer should produce a valid layout configuration.
 */

// Import dependencies
let ViewportAnalyzer, LayoutOptimizer, AdaptiveViewportConstants;
if (typeof require !== 'undefined') {
  try {
    ViewportAnalyzer = require('../../js/adaptive-viewport/viewport-analyzer.js');
    LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');
    AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for extreme viewport dimension support
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runExtremeViewportDimensionPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Extreme Viewport Dimension Support ===\n');
  console.log('Testing that ViewportAnalyzer produces valid layout configurations');
  console.log('for all viewport dimensions from 320x480 to 3840x2160...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Validate layout configuration
   * Checks that a layout configuration is valid
   */
  function validateLayoutConfiguration(config, viewportWidth, viewportHeight) {
    const errors = [];

    // Check that config exists
    if (!config) {
      errors.push('Layout configuration is null or undefined');
      return { valid: false, errors };
    }

    // Check board size exists and is valid
    if (!config.boardSize) {
      errors.push('Missing boardSize');
    } else {
      if (typeof config.boardSize.width !== 'number' || config.boardSize.width <= 0) {
        errors.push(`Invalid board width: ${config.boardSize.width}`);
      }
      if (typeof config.boardSize.height !== 'number' || config.boardSize.height <= 0) {
        errors.push(`Invalid board height: ${config.boardSize.height}`);
      }
      if (isNaN(config.boardSize.width) || isNaN(config.boardSize.height)) {
        errors.push('Board dimensions contain NaN');
      }
      if (!isFinite(config.boardSize.width) || !isFinite(config.boardSize.height)) {
        errors.push('Board dimensions contain Infinity');
      }
    }

    // Check board position exists and is valid
    if (!config.boardPosition) {
      errors.push('Missing boardPosition');
    } else {
      if (typeof config.boardPosition.x !== 'number' || config.boardPosition.x < 0) {
        errors.push(`Invalid board x position: ${config.boardPosition.x}`);
      }
      if (typeof config.boardPosition.y !== 'number' || config.boardPosition.y < 0) {
        errors.push(`Invalid board y position: ${config.boardPosition.y}`);
      }
      if (isNaN(config.boardPosition.x) || isNaN(config.boardPosition.y)) {
        errors.push('Board position contains NaN');
      }
      if (!isFinite(config.boardPosition.x) || !isFinite(config.boardPosition.y)) {
        errors.push('Board position contains Infinity');
      }
    }

    // Check layout strategy is valid
    if (!config.layoutStrategy) {
      errors.push('Missing layoutStrategy');
    } else {
      const validStrategies = ['horizontal', 'vertical', 'hybrid'];
      if (!validStrategies.includes(config.layoutStrategy)) {
        errors.push(`Invalid layout strategy: ${config.layoutStrategy}`);
      }
    }

    // Check element positions map exists
    if (!config.elementPositions) {
      errors.push('Missing elementPositions');
    } else if (!(config.elementPositions instanceof Map)) {
      errors.push('elementPositions is not a Map');
    }

    // Check requiresScrolling is boolean
    if (typeof config.requiresScrolling !== 'boolean') {
      errors.push('requiresScrolling is not a boolean');
    }

    // Check scrollContainers is array
    if (!Array.isArray(config.scrollContainers)) {
      errors.push('scrollContainers is not an array');
    }

    // Validate board fits within viewport (with some tolerance for spacing)
    if (config.boardSize && config.boardPosition) {
      const boardRight = config.boardPosition.x + config.boardSize.width;
      const boardBottom = config.boardPosition.y + config.boardSize.height;
      
      // Allow some tolerance for spacing (32px margin)
      const maxWidth = viewportWidth + 32;
      const maxHeight = viewportHeight + 32;
      
      if (boardRight > maxWidth) {
        errors.push(`Board extends beyond viewport width: ${boardRight} > ${maxWidth}`);
      }
      if (boardBottom > maxHeight) {
        errors.push(`Board extends beyond viewport height: ${boardBottom} > ${maxHeight}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper: Mock viewport dimensions
   * Creates a mock window object with specified dimensions
   */
  function mockViewport(width, height) {
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Store original values
    const original = {
      width: originalWidth,
      height: originalHeight,
      restore: () => {
        // Note: We can't actually change window.innerWidth/innerHeight
        // This is just for tracking
      }
    };
    
    return original;
  }

  /**
   * Helper: Create mock analysis result
   */
  function createMockAnalysisResult(width, height) {
    const spacing = 16;
    return {
      viewportWidth: width,
      viewportHeight: height,
      aspectRatio: width / height,
      orientation: width > height ? 'landscape' : 'portrait',
      isExtremeAspectRatio: (width / height) > 3 || (width / height) < 0.33,
      extremeAspectRatioType: (width / height) > 3 ? 'ultra-wide' : (width / height) < 0.33 ? 'very-tall' : null,
      availableSpace: {
        width: width - spacing * 2,
        height: height - spacing * 2
      },
      invisibleElements: [],
      boardDimensions: { width: 400, height: 400 },
      layoutStrategy: 'horizontal',
      timestamp: Date.now()
    };
  }

  /**
   * Property 1: Valid layout for all supported viewport dimensions
   * Tests the full range of supported dimensions (320-3840 x 480-2160)
   */
  try {
    console.log('Property 1: Valid layout configuration for all supported viewport dimensions');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }),
        async (config) => {
          // Create layout optimizer
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Create mock analysis result
          const analysisResult = createMockAnalysisResult(
            config.viewportWidth,
            config.viewportHeight
          );
          
          // Calculate optimal layout
          let layoutConfig;
          try {
            layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          } catch (error) {
            console.error(`Failed to calculate layout for ${config.viewportWidth}x${config.viewportHeight}:`, error.message);
            return false;
          }
          
          // Validate layout configuration
          const validation = validateLayoutConfiguration(
            layoutConfig,
            config.viewportWidth,
            config.viewportHeight
          );
          
          if (!validation.valid) {
            console.error(`Invalid layout for ${config.viewportWidth}x${config.viewportHeight}:`);
            validation.errors.forEach(err => console.error(`  - ${err}`));
            return false;
          }
          
          // Cleanup
          optimizer.destroy();
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Valid layout for all supported dimensions',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Valid layout for all supported dimensions',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Minimum board size maintained across all dimensions
   * Ensures board is always at least 280x280px
   */
  try {
    console.log('Property 2: Minimum board size maintained (280x280px)');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }),
        async (config) => {
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          const analysisResult = createMockAnalysisResult(
            config.viewportWidth,
            config.viewportHeight
          );
          
          const layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          
          // Check minimum board size
          const minSize = 280;
          if (layoutConfig.boardSize.width < minSize || layoutConfig.boardSize.height < minSize) {
            console.error(`Board size below minimum for ${config.viewportWidth}x${config.viewportHeight}: ` +
              `${layoutConfig.boardSize.width}x${layoutConfig.boardSize.height} < ${minSize}x${minSize}`);
            optimizer.destroy();
            return false;
          }
          
          optimizer.destroy();
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Minimum board size maintained',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Minimum board size maintained',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Extreme aspect ratios handled correctly
   * Tests ultra-wide (>3) and very-tall (<0.33) aspect ratios
   */
  try {
    console.log('Property 3: Extreme aspect ratios produce valid layouts');
    
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Ultra-wide displays (aspect ratio > 3)
          fc.record({
            viewportWidth: fc.integer({ min: 2000, max: 3840 }),
            viewportHeight: fc.integer({ min: 480, max: 800 })
          }).filter(config => (config.viewportWidth / config.viewportHeight) > 3),
          
          // Very tall displays (aspect ratio < 0.33)
          fc.record({
            viewportWidth: fc.integer({ min: 320, max: 600 }),
            viewportHeight: fc.integer({ min: 1200, max: 2160 })
          }).filter(config => (config.viewportWidth / config.viewportHeight) < 0.33)
        ),
        async (config) => {
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          const analysisResult = createMockAnalysisResult(
            config.viewportWidth,
            config.viewportHeight
          );
          
          const layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          
          // Validate layout
          const validation = validateLayoutConfiguration(
            layoutConfig,
            config.viewportWidth,
            config.viewportHeight
          );
          
          if (!validation.valid) {
            const aspectRatio = (config.viewportWidth / config.viewportHeight).toFixed(2);
            console.error(`Invalid layout for extreme aspect ratio ${aspectRatio} ` +
              `(${config.viewportWidth}x${config.viewportHeight}):`);
            validation.errors.forEach(err => console.error(`  - ${err}`));
            optimizer.destroy();
            return false;
          }
          
          optimizer.destroy();
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Extreme aspect ratios handled correctly',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Extreme aspect ratios handled correctly',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Portrait and landscape orientations both supported
   */
  try {
    console.log('Property 4: Both portrait and landscape orientations produce valid layouts');
    
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Portrait orientation (height > width)
          fc.record({
            viewportWidth: fc.integer({ min: 320, max: 1200 }),
            viewportHeight: fc.integer({ min: 480, max: 2160 })
          }).filter(config => config.viewportHeight > config.viewportWidth),
          
          // Landscape orientation (width > height)
          fc.record({
            viewportWidth: fc.integer({ min: 480, max: 3840 }),
            viewportHeight: fc.integer({ min: 480, max: 1440 })
          }).filter(config => config.viewportWidth > config.viewportHeight)
        ),
        async (config) => {
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          const analysisResult = createMockAnalysisResult(
            config.viewportWidth,
            config.viewportHeight
          );
          
          const layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          
          // Validate layout
          const validation = validateLayoutConfiguration(
            layoutConfig,
            config.viewportWidth,
            config.viewportHeight
          );
          
          if (!validation.valid) {
            const orientation = config.viewportWidth > config.viewportHeight ? 'landscape' : 'portrait';
            console.error(`Invalid layout for ${orientation} orientation ` +
              `(${config.viewportWidth}x${config.viewportHeight}):`);
            validation.errors.forEach(err => console.error(`  - ${err}`));
            optimizer.destroy();
            return false;
          }
          
          optimizer.destroy();
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Portrait and landscape orientations supported',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Portrait and landscape orientations supported',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Boundary dimensions (320x480 and 3840x2160) work correctly
   */
  try {
    console.log('Property 5: Boundary dimensions produce valid layouts');
    
    const boundaryTests = [
      { width: 320, height: 480, name: 'Minimum dimensions' },
      { width: 3840, height: 2160, name: 'Maximum dimensions' },
      { width: 320, height: 2160, name: 'Min width, max height' },
      { width: 3840, height: 480, name: 'Max width, min height' }
    ];
    
    for (const test of boundaryTests) {
      const optimizer = new LayoutOptimizer({
        minBoardSize: 280,
        spacing: 16,
        prioritizeBoard: true
      });
      
      const analysisResult = createMockAnalysisResult(test.width, test.height);
      const layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
      
      const validation = validateLayoutConfiguration(layoutConfig, test.width, test.height);
      
      if (!validation.valid) {
        console.error(`Invalid layout for ${test.name} (${test.width}x${test.height}):`);
        validation.errors.forEach(err => console.error(`  - ${err}`));
        optimizer.destroy();
        throw new Error(`Boundary test failed: ${test.name}`);
      }
      
      optimizer.destroy();
    }
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Boundary dimensions work correctly',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (4 boundary cases tested)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Boundary dimensions work correctly',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  // Print summary
  console.log('=== Test Summary ===');
  console.log(`Total Properties: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log(`Total Iterations: ~${results.passed * 100 + 4} (100 per property + boundary tests)\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runExtremeViewportDimensionPropertyTest };
}
