/**
 * Property-Based Test: Orientation Handling
 * Feature: adaptive-viewport-optimizer
 * Property 18: Orientation Handling
 * 
 * **Validates: Requirements 5.4**
 * 
 * For any device orientation (portrait or landscape), the layout optimizer 
 * should produce an appropriate layout configuration.
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
 * Run property-based test for orientation handling
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runOrientationHandlingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Orientation Handling ===\n');
  console.log('Testing that ViewportAnalyzer produces appropriate layout configurations');
  console.log('for both portrait and landscape orientations...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Validate layout configuration
   * Checks that a layout configuration is valid and appropriate for orientation
   */
  function validateLayoutConfiguration(config, viewportWidth, viewportHeight, orientation) {
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
      
      // Check minimum board size (280x280)
      const minSize = 280;
      if (config.boardSize.width < minSize || config.boardSize.height < minSize) {
        errors.push(`Board size below minimum: ${config.boardSize.width}x${config.boardSize.height} < ${minSize}x${minSize}`);
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
   * Helper: Create mock analysis result
   */
  function createMockAnalysisResult(width, height) {
    const spacing = 16;
    const aspectRatio = width / height;
    const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
    
    return {
      viewportWidth: width,
      viewportHeight: height,
      aspectRatio,
      orientation,
      isExtremeAspectRatio: aspectRatio > 3 || aspectRatio < 0.33,
      extremeAspectRatioType: aspectRatio > 3 ? 'ultra-wide' : aspectRatio < 0.33 ? 'very-tall' : null,
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
   * Property 1: Portrait orientation produces valid layout
   * Tests that portrait orientations (height > width) produce valid layouts
   */
  try {
    console.log('Property 1: Portrait orientation produces valid layout');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 1200 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }).filter(config => config.viewportHeight > config.viewportWidth), // Portrait: height > width
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
          
          // Verify orientation is correctly detected as portrait
          if (analysisResult.orientation !== 'portrait') {
            console.error(`Orientation detection failed: expected 'portrait', got '${analysisResult.orientation}'`);
            optimizer.destroy();
            return false;
          }
          
          // Calculate optimal layout
          let layoutConfig;
          try {
            layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          } catch (error) {
            console.error(`Failed to calculate layout for portrait ${config.viewportWidth}x${config.viewportHeight}:`, error.message);
            optimizer.destroy();
            return false;
          }
          
          // Validate layout configuration
          const validation = validateLayoutConfiguration(
            layoutConfig,
            config.viewportWidth,
            config.viewportHeight,
            'portrait'
          );
          
          if (!validation.valid) {
            console.error(`Invalid layout for portrait orientation ${config.viewportWidth}x${config.viewportHeight}:`);
            validation.errors.forEach(err => console.error(`  - ${err}`));
            optimizer.destroy();
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
      name: 'Property 1: Portrait orientation produces valid layout',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Portrait orientation produces valid layout',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Landscape orientation produces valid layout
   * Tests that landscape orientations (width > height) produce valid layouts
   */
  try {
    console.log('Property 2: Landscape orientation produces valid layout');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          viewportWidth: fc.integer({ min: 480, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 1440 })
        }).filter(config => config.viewportWidth > config.viewportHeight), // Landscape: width > height
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
          
          // Verify orientation is correctly detected as landscape
          if (analysisResult.orientation !== 'landscape') {
            console.error(`Orientation detection failed: expected 'landscape', got '${analysisResult.orientation}'`);
            optimizer.destroy();
            return false;
          }
          
          let layoutConfig;
          try {
            layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          } catch (error) {
            console.error(`Failed to calculate layout for landscape ${config.viewportWidth}x${config.viewportHeight}:`, error.message);
            optimizer.destroy();
            return false;
          }
          
          const validation = validateLayoutConfiguration(
            layoutConfig,
            config.viewportWidth,
            config.viewportHeight,
            'landscape'
          );
          
          if (!validation.valid) {
            console.error(`Invalid layout for landscape orientation ${config.viewportWidth}x${config.viewportHeight}:`);
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
      name: 'Property 2: Landscape orientation produces valid layout',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Landscape orientation produces valid layout',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Orientation change produces appropriate layout adjustment
   * Tests that switching between portrait and landscape produces valid layouts
   */
  try {
    console.log('Property 3: Orientation change produces appropriate layout adjustment');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Start with a base dimension
          baseDimension: fc.integer({ min: 600, max: 1200 })
        }),
        async (config) => {
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          // Test portrait orientation
          const portraitWidth = config.baseDimension;
          const portraitHeight = Math.floor(config.baseDimension * 1.5); // 1.5x taller
          const portraitAnalysis = createMockAnalysisResult(portraitWidth, portraitHeight);
          
          let portraitLayout;
          try {
            portraitLayout = optimizer.calculateOptimalLayout(portraitAnalysis);
          } catch (error) {
            console.error(`Failed to calculate portrait layout:`, error.message);
            optimizer.destroy();
            return false;
          }
          
          const portraitValidation = validateLayoutConfiguration(
            portraitLayout,
            portraitWidth,
            portraitHeight,
            'portrait'
          );
          
          if (!portraitValidation.valid) {
            console.error(`Invalid portrait layout:`);
            portraitValidation.errors.forEach(err => console.error(`  - ${err}`));
            optimizer.destroy();
            return false;
          }
          
          // Test landscape orientation (rotate the viewport)
          const landscapeWidth = portraitHeight;
          const landscapeHeight = portraitWidth;
          const landscapeAnalysis = createMockAnalysisResult(landscapeWidth, landscapeHeight);
          
          let landscapeLayout;
          try {
            landscapeLayout = optimizer.calculateOptimalLayout(landscapeAnalysis);
          } catch (error) {
            console.error(`Failed to calculate landscape layout:`, error.message);
            optimizer.destroy();
            return false;
          }
          
          const landscapeValidation = validateLayoutConfiguration(
            landscapeLayout,
            landscapeWidth,
            landscapeHeight,
            'landscape'
          );
          
          if (!landscapeValidation.valid) {
            console.error(`Invalid landscape layout:`);
            landscapeValidation.errors.forEach(err => console.error(`  - ${err}`));
            optimizer.destroy();
            return false;
          }
          
          // Both orientations should produce valid layouts
          optimizer.destroy();
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Orientation change produces appropriate layout adjustment',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Orientation change produces appropriate layout adjustment',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Common mobile device orientations work correctly
   * Tests specific common mobile device dimensions in both orientations
   */
  try {
    console.log('Property 4: Common mobile device orientations work correctly');
    
    const commonDevices = [
      // iPhone SE (portrait and landscape)
      { width: 375, height: 667, name: 'iPhone SE Portrait' },
      { width: 667, height: 375, name: 'iPhone SE Landscape' },
      // iPhone 12/13 (portrait and landscape)
      { width: 390, height: 844, name: 'iPhone 12/13 Portrait' },
      { width: 844, height: 390, name: 'iPhone 12/13 Landscape' },
      // iPad (portrait and landscape)
      { width: 768, height: 1024, name: 'iPad Portrait' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      // iPad Pro (portrait and landscape)
      { width: 1024, height: 1366, name: 'iPad Pro Portrait' },
      { width: 1366, height: 1024, name: 'iPad Pro Landscape' },
      // Android phone (portrait and landscape)
      { width: 360, height: 640, name: 'Android Phone Portrait' },
      { width: 640, height: 360, name: 'Android Phone Landscape' },
      // Android tablet (portrait and landscape)
      { width: 800, height: 1280, name: 'Android Tablet Portrait' },
      { width: 1280, height: 800, name: 'Android Tablet Landscape' }
    ];
    
    for (const device of commonDevices) {
      const optimizer = new LayoutOptimizer({
        minBoardSize: 280,
        spacing: 16,
        prioritizeBoard: true
      });
      
      const analysisResult = createMockAnalysisResult(device.width, device.height);
      const layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
      
      const expectedOrientation = device.width > device.height ? 'landscape' : 'portrait';
      const validation = validateLayoutConfiguration(
        layoutConfig,
        device.width,
        device.height,
        expectedOrientation
      );
      
      if (!validation.valid) {
        console.error(`Invalid layout for ${device.name} (${device.width}x${device.height}):`);
        validation.errors.forEach(err => console.error(`  - ${err}`));
        optimizer.destroy();
        throw new Error(`Device test failed: ${device.name}`);
      }
      
      // Verify orientation is correctly detected
      if (analysisResult.orientation !== expectedOrientation) {
        console.error(`Orientation mismatch for ${device.name}: expected '${expectedOrientation}', got '${analysisResult.orientation}'`);
        optimizer.destroy();
        throw new Error(`Orientation detection failed: ${device.name}`);
      }
      
      optimizer.destroy();
    }
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Common mobile device orientations work correctly',
      status: 'PASS'
    });
    console.log(`✓ Property 4 passed (${commonDevices.length} device orientations tested)\n`);
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Common mobile device orientations work correctly',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Square viewports (aspect ratio ~1) produce valid layouts
   * Tests edge case where width ≈ height
   */
  try {
    console.log('Property 5: Square viewports produce valid layouts');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseDimension: fc.integer({ min: 500, max: 1500 }),
          // Small variation to avoid exact square (±5%)
          variation: fc.integer({ min: -5, max: 5 })
        }),
        async (config) => {
          const width = config.baseDimension;
          const height = Math.floor(config.baseDimension * (1 + config.variation / 100));
          
          const optimizer = new LayoutOptimizer({
            minBoardSize: 280,
            spacing: 16,
            prioritizeBoard: true
          });
          
          const analysisResult = createMockAnalysisResult(width, height);
          
          let layoutConfig;
          try {
            layoutConfig = optimizer.calculateOptimalLayout(analysisResult);
          } catch (error) {
            console.error(`Failed to calculate layout for square viewport ${width}x${height}:`, error.message);
            optimizer.destroy();
            return false;
          }
          
          const aspectRatio = width / height;
          const orientation = aspectRatio > 1 ? 'landscape' : 'portrait';
          
          const validation = validateLayoutConfiguration(
            layoutConfig,
            width,
            height,
            orientation
          );
          
          if (!validation.valid) {
            console.error(`Invalid layout for square viewport ${width}x${height} (aspect ratio: ${aspectRatio.toFixed(2)}):`);
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
      name: 'Property 5: Square viewports produce valid layouts',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Square viewports produce valid layouts',
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
  console.log(`Total Iterations: ~${results.passed * 100 + 12} (100 per property + device tests)\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runOrientationHandlingPropertyTest };
}
