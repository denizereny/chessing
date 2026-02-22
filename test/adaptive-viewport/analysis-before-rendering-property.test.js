/**
 * Property-Based Test: Analysis Before Rendering
 * Feature: adaptive-viewport-optimizer
 * Property 12: Analysis Before Rendering
 * 
 * **Validates: Requirements 4.1**
 * 
 * For any page load, viewport analysis should complete and layout configuration 
 * should be calculated before UI elements are rendered to the DOM.
 */

// Import ViewportAnalyzer
let ViewportAnalyzer;
if (typeof require !== 'undefined') {
  try {
    ViewportAnalyzer = require('../../js/adaptive-viewport/viewport-analyzer.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for analysis before rendering
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runAnalysisBeforeRenderingPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Analysis Before Rendering ===\n');
  console.log('Testing that viewport analysis completes and layout configuration is calculated');
  console.log('before UI elements are rendered to the DOM...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Create test UI elements (not yet rendered)
   */
  function createTestUIElements(count) {
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.className = `test-ui-element-${i}`;
      element.style.position = 'absolute';
      element.style.width = `${100 + Math.random() * 200}px`;
      element.style.height = `${50 + Math.random() * 100}px`;
      element.style.visibility = 'hidden'; // Start hidden
      element.style.display = 'none'; // Not rendered yet
      element.setAttribute('data-test-element', 'true');
      
      elements.push(element);
    }
    
    return elements;
  }

  /**
   * Helper: Check if element is rendered in DOM
   */
  function isElementRendered(element) {
    // Element is considered rendered if:
    // 1. It's in the document
    // 2. It has computed styles applied
    // 3. It's visible (not display:none)
    
    if (!document.body.contains(element)) {
      return false;
    }
    
    const computedStyle = window.getComputedStyle(element);
    const isVisible = computedStyle.display !== 'none' && 
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0';
    
    return isVisible;
  }

  /**
   * Helper: Monitor DOM mutations to track when elements are rendered
   */
  class RenderMonitor {
    constructor() {
      this.renderEvents = [];
      this.observer = null;
    }

    startMonitoring(elements) {
      this.renderEvents = [];
      
      // Create MutationObserver to watch for style changes
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            
            const element = mutation.target;
            if (element.hasAttribute('data-test-element')) {
              const isRendered = isElementRendered(element);
              
              if (isRendered) {
                this.renderEvents.push({
                  element,
                  timestamp: performance.now(),
                  type: 'rendered'
                });
              }
            }
          }
        });
      });

      // Observe all test elements
      elements.forEach(element => {
        if (element.parentNode) {
          this.observer.observe(element, {
            attributes: true,
            attributeOldValue: true
          });
        }
      });
    }

    stopMonitoring() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }

    getRenderEvents() {
      return this.renderEvents;
    }

    getFirstRenderTime() {
      if (this.renderEvents.length === 0) {
        return null;
      }
      return Math.min(...this.renderEvents.map(e => e.timestamp));
    }
  }

  /**
   * Helper: Mock ViewportAnalyzer that tracks analysis timing
   */
  class AnalysisTracker {
    constructor() {
      this.analysisStartTime = null;
      this.analysisEndTime = null;
      this.layoutCalculationTime = null;
      this.analysisCompleted = false;
      this.layoutCalculated = false;
    }

    async trackAnalysis(analyzer) {
      // Track when analysis starts
      this.analysisStartTime = performance.now();
      
      // Perform analysis
      const result = await analyzer.analyzeViewport();
      
      // Track when analysis completes
      this.analysisEndTime = performance.now();
      this.analysisCompleted = true;
      
      // Check if layout was calculated
      const state = analyzer.getState();
      if (state && state.configuration) {
        this.layoutCalculationTime = this.analysisEndTime;
        this.layoutCalculated = true;
      }
      
      return result;
    }

    getAnalysisDuration() {
      if (!this.analysisStartTime || !this.analysisEndTime) {
        return null;
      }
      return this.analysisEndTime - this.analysisStartTime;
    }

    wasAnalysisCompleted() {
      return this.analysisCompleted;
    }

    wasLayoutCalculated() {
      return this.layoutCalculated;
    }
  }

  /**
   * Helper: Clean up test elements
   */
  function cleanupElements(elements) {
    elements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
  }

  /**
   * Property 1: Analysis completes before any UI elements are rendered
   */
  try {
    console.log('Property 1: Analysis completes before UI elements are rendered');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 10 }),
          viewportWidth: fc.integer({ min: 320, max: 1920 }),
          viewportHeight: fc.integer({ min: 480, max: 1080 })
        }),
        async (config) => {
          // Create test elements (not rendered yet)
          const elements = createTestUIElements(config.elementCount);
          
          // Add elements to DOM but keep them hidden
          elements.forEach(element => {
            document.body.appendChild(element);
          });
          
          // Create render monitor
          const renderMonitor = new RenderMonitor();
          renderMonitor.startMonitoring(elements);
          
          // Create analysis tracker
          const tracker = new AnalysisTracker();
          
          try {
            // Create analyzer (simulating page load initialization)
            const analyzer = new ViewportAnalyzer({
              debounceDelay: 150,
              minBoardSize: 280,
              spacing: 16
            });
            
            // Track analysis
            await tracker.trackAnalysis(analyzer);
            
            // Now "render" elements (simulate applying layout)
            const renderStartTime = performance.now();
            elements.forEach(element => {
              element.style.display = 'block';
              element.style.visibility = 'visible';
            });
            
            // Wait for render to complete
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const firstRenderTime = renderMonitor.getFirstRenderTime() || renderStartTime;
            
            // Clean up
            renderMonitor.stopMonitoring();
            analyzer.destroy();
            cleanupElements(elements);
            
            // Verify analysis completed
            if (!tracker.wasAnalysisCompleted()) {
              console.error('Analysis did not complete');
              return false;
            }
            
            // Verify layout was calculated
            if (!tracker.wasLayoutCalculated()) {
              console.error('Layout configuration was not calculated');
              return false;
            }
            
            // Verify analysis completed before rendering
            const analysisEndTime = tracker.analysisEndTime;
            if (analysisEndTime > firstRenderTime) {
              console.error(
                `Analysis completed AFTER rendering: ` +
                `analysis=${analysisEndTime.toFixed(2)}ms, render=${firstRenderTime.toFixed(2)}ms`
              );
              return false;
            }
            
            return true;
            
          } catch (error) {
            renderMonitor.stopMonitoring();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Analysis completes before rendering',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Analysis completes before rendering',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Layout configuration exists before DOM updates
   */
  try {
    console.log('Property 2: Layout configuration exists before DOM updates are applied');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 8 }),
          debounceDelay: fc.integer({ min: 100, max: 200 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestUIElements(config.elementCount);
          elements.forEach(element => document.body.appendChild(element));
          
          try {
            // Create analyzer
            const analyzer = new ViewportAnalyzer({
              debounceDelay: config.debounceDelay,
              minBoardSize: 280,
              spacing: 16
            });
            
            // Initialize (which performs analysis)
            await analyzer.initialize();
            
            // Check if state exists with configuration
            const state = analyzer.getState();
            
            // Clean up
            analyzer.destroy();
            cleanupElements(elements);
            
            // Verify state exists
            if (!state) {
              console.error('No state saved after initialization');
              return false;
            }
            
            // Verify configuration exists
            if (!state.configuration) {
              console.error('No layout configuration in state');
              return false;
            }
            
            // Verify configuration has required properties
            const config = state.configuration;
            if (!config.boardSize || !config.boardPosition || !config.layoutStrategy) {
              console.error('Layout configuration is incomplete');
              return false;
            }
            
            return true;
            
          } catch (error) {
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Layout configuration exists before DOM updates',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Layout configuration exists before DOM updates',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: Analysis timing is within acceptable bounds (< 200ms)
   */
  try {
    console.log('Property 3: Analysis completes within 200ms (Requirement 4.3)');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 1, max: 12 }),
          minBoardSize: fc.integer({ min: 280, max: 400 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestUIElements(config.elementCount);
          elements.forEach(element => document.body.appendChild(element));
          
          try {
            // Create analyzer
            const analyzer = new ViewportAnalyzer({
              debounceDelay: 150,
              minBoardSize: config.minBoardSize,
              spacing: 16
            });
            
            // Track analysis timing
            const tracker = new AnalysisTracker();
            await tracker.trackAnalysis(analyzer);
            
            const duration = tracker.getAnalysisDuration();
            
            // Clean up
            analyzer.destroy();
            cleanupElements(elements);
            
            // Verify analysis completed within 200ms
            const maxDuration = 200; // Requirement 4.3
            if (duration > maxDuration) {
              console.error(
                `Analysis took too long: ${duration.toFixed(2)}ms (max: ${maxDuration}ms)`
              );
              return false;
            }
            
            return true;
            
          } catch (error) {
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: Analysis completes within 200ms',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: Analysis completes within 200ms',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Initialize method performs analysis before returning
   */
  try {
    console.log('Property 4: Initialize method performs analysis before returning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 2, max: 10 }),
          spacing: fc.integer({ min: 8, max: 24 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestUIElements(config.elementCount);
          elements.forEach(element => document.body.appendChild(element));
          
          try {
            // Create analyzer
            const analyzer = new ViewportAnalyzer({
              debounceDelay: 150,
              minBoardSize: 280,
              spacing: config.spacing
            });
            
            // Track state before initialization
            const stateBefore = analyzer.getState();
            
            // Initialize
            await analyzer.initialize();
            
            // Track state after initialization
            const stateAfter = analyzer.getState();
            
            // Clean up
            analyzer.destroy();
            cleanupElements(elements);
            
            // Verify no state before initialization
            if (stateBefore !== null) {
              console.error('State exists before initialization');
              return false;
            }
            
            // Verify state exists after initialization
            if (!stateAfter) {
              console.error('No state after initialization');
              return false;
            }
            
            // Verify state has valid configuration
            if (!stateAfter.configuration || !stateAfter.viewportDimensions) {
              console.error('State is incomplete after initialization');
              return false;
            }
            
            return true;
            
          } catch (error) {
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Initialize performs analysis before returning',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Initialize performs analysis before returning',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Analysis result contains all required data for rendering
   */
  try {
    console.log('Property 5: Analysis result contains all required data for rendering');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 1, max: 10 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestUIElements(config.elementCount);
          elements.forEach(element => document.body.appendChild(element));
          
          try {
            // Create analyzer
            const analyzer = new ViewportAnalyzer({
              debounceDelay: 150,
              minBoardSize: 280,
              spacing: 16
            });
            
            // Perform analysis
            const analysisResult = await analyzer.analyzeViewport();
            
            // Clean up
            analyzer.destroy();
            cleanupElements(elements);
            
            // Verify analysis result exists
            if (!analysisResult) {
              console.error('No analysis result returned');
              return false;
            }
            
            // Verify required properties exist
            const requiredProps = [
              'viewportWidth',
              'viewportHeight',
              'aspectRatio',
              'orientation',
              'availableSpace',
              'boardDimensions',
              'layoutStrategy'
            ];
            
            for (const prop of requiredProps) {
              if (!(prop in analysisResult)) {
                console.error(`Missing required property: ${prop}`);
                return false;
              }
            }
            
            // Verify viewport dimensions are valid
            if (analysisResult.viewportWidth <= 0 || analysisResult.viewportHeight <= 0) {
              console.error('Invalid viewport dimensions');
              return false;
            }
            
            // Verify board dimensions are valid
            if (!analysisResult.boardDimensions.width || !analysisResult.boardDimensions.height) {
              console.error('Invalid board dimensions');
              return false;
            }
            
            // Verify layout strategy is valid
            const validStrategies = ['horizontal', 'vertical', 'hybrid'];
            if (!validStrategies.includes(analysisResult.layoutStrategy)) {
              console.error(`Invalid layout strategy: ${analysisResult.layoutStrategy}`);
              return false;
            }
            
            return true;
            
          } catch (error) {
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Analysis result contains required data',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Analysis result contains required data',
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
  console.log(`Total Iterations: ${(results.passed + results.failed) * 100}\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAnalysisBeforeRenderingPropertyTest };
}
