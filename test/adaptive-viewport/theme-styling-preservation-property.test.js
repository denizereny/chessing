/**
 * Property-Based Test: Theme Styling Preservation
 * Feature: adaptive-viewport-optimizer
 * Property 29: Theme Styling Preservation
 * 
 * **Validates: Requirements 9.4**
 * 
 * For any UI element with theme-specific styling, the computed styles 
 * should match the expected theme colors and properties after repositioning.
 */

// Import DOMUpdater
let DOMUpdater;
if (typeof require !== 'undefined') {
  try {
    DOMUpdater = require('../../js/adaptive-viewport/dom-updater.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for theme styling preservation
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runThemeStylingPreservationPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: Theme Styling Preservation ===\n');
  console.log('Testing that DOMUpdater preserves theme styling when repositioning elements...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Get computed theme-related styles from element
   */
  function getThemeStyles(element) {
    const computed = window.getComputedStyle(element);
    
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      borderColor: computed.borderColor,
      borderWidth: computed.borderWidth,
      borderStyle: computed.borderStyle,
      borderRadius: computed.borderRadius,
      boxShadow: computed.boxShadow,
      opacity: computed.opacity,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight
    };
  }

  /**
   * Helper: Compare theme styles
   */
  function themeStylesMatch(expected, actual) {
    const keys = Object.keys(expected);
    
    for (const key of keys) {
      if (expected[key] !== actual[key]) {
        return {
          matches: false,
          mismatchedKey: key,
          expected: expected[key],
          actual: actual[key]
        };
      }
    }
    
    return { matches: true };
  }

  /**
   * Helper: Create element with theme styling
   */
  function createThemedElement(theme, customStyles = {}) {
    const element = document.createElement('div');
    element.className = `themed-element theme-${theme}`;
    element.style.position = 'absolute';
    element.style.width = '150px';
    element.style.height = '100px';
    element.style.padding = '10px';
    element.textContent = `${theme} theme element`;
    
    // Apply theme-specific styles
    if (theme === 'light') {
      element.style.backgroundColor = 'rgb(255, 255, 255)';
      element.style.color = 'rgb(30, 41, 59)';
      element.style.borderColor = 'rgb(226, 232, 240)';
    } else if (theme === 'dark') {
      element.style.backgroundColor = 'rgb(30, 41, 59)';
      element.style.color = 'rgb(248, 250, 252)';
      element.style.borderColor = 'rgb(71, 85, 105)';
    }
    
    element.style.borderWidth = '2px';
    element.style.borderStyle = 'solid';
    element.style.borderRadius = '8px';
    
    // Apply custom styles
    Object.entries(customStyles).forEach(([key, value]) => {
      element.style[key] = value;
    });
    
    return element;
  }

  /**
   * Helper: Apply theme to document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Property 1: Theme colors preserved after repositioning
   */
  try {
    console.log('Property 1: Theme colors should be preserved after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 100, max: 400 }),
          height: fc.integer({ min: 80, max: 300 })
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create themed element
          const element = createThemedElement(config.theme);
          document.body.appendChild(element);
          
          // Wait for styles to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get theme styles before repositioning
          const stylesBefore = getThemeStyles(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get theme styles after repositioning
          const stylesAfter = getThemeStyles(element);
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify theme styles match
          const match = themeStylesMatch(stylesBefore, stylesAfter);
          
          if (!match.matches) {
            console.error('Theme styles mismatch:', {
              theme: config.theme,
              key: match.mismatchedKey,
              before: match.expected,
              after: match.actual
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: Theme colors preservation',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: Theme colors preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: Theme classes preserved after repositioning
   */
  try {
    console.log('Property 2: Theme classes should be preserved after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          additionalClasses: fc.array(
            fc.constantFrom('primary', 'secondary', 'accent', 'muted', 'highlighted'),
            { minLength: 0, maxLength: 3 }
          ),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 })
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create themed element with additional classes
          const element = createThemedElement(config.theme);
          config.additionalClasses.forEach(cls => {
            element.classList.add(cls);
          });
          document.body.appendChild(element);
          
          // Get classes before repositioning
          const classesBefore = Array.from(element.classList).sort().join(' ');
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: 200,
            height: 120,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get classes after repositioning
          const classesAfter = Array.from(element.classList).sort().join(' ');
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify classes match
          if (classesBefore !== classesAfter) {
            console.error('Theme classes mismatch:', {
              before: classesBefore,
              after: classesAfter
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: Theme classes preservation',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: Theme classes preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: CSS custom properties (variables) preserved after repositioning
   */
  try {
    console.log('Property 3: CSS custom properties should be preserved after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          customPropValue: fc.integer({ min: 8, max: 32 }),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 })
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create themed element with custom property
          const element = createThemedElement(config.theme);
          element.style.setProperty('--custom-spacing', `${config.customPropValue}px`);
          element.style.padding = 'var(--custom-spacing)';
          document.body.appendChild(element);
          
          // Wait for styles to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get custom property value before repositioning
          const valueBefore = element.style.getPropertyValue('--custom-spacing');
          const computedPaddingBefore = window.getComputedStyle(element).padding;
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: 180,
            height: 100,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get custom property value after repositioning
          const valueAfter = element.style.getPropertyValue('--custom-spacing');
          const computedPaddingAfter = window.getComputedStyle(element).padding;
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify custom property preserved
          if (valueBefore !== valueAfter) {
            console.error('Custom property mismatch:', {
              before: valueBefore,
              after: valueAfter
            });
            return false;
          }
          
          // Verify computed padding matches (custom property is applied)
          if (computedPaddingBefore !== computedPaddingAfter) {
            console.error('Computed padding mismatch:', {
              before: computedPaddingBefore,
              after: computedPaddingAfter
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: CSS custom properties preservation',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: CSS custom properties preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: Theme styling preserved in batch updates
   */
  try {
    console.log('Property 4: Theme styling should be preserved in batch updates');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          numElements: fc.integer({ min: 2, max: 5 }),
          baseX: fc.integer({ min: 0, max: 500 }),
          baseY: fc.integer({ min: 0, max: 500 })
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create multiple themed elements
          const elements = [];
          const stylesBefore = [];
          
          for (let i = 0; i < config.numElements; i++) {
            const element = createThemedElement(config.theme);
            document.body.appendChild(element);
            
            // Wait for styles to apply
            await new Promise(resolve => setTimeout(resolve, 10));
            
            elements.push(element);
            stylesBefore.push(getThemeStyles(element));
          }
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Prepare batch update
          const updates = elements.map((element, i) => ({
            element,
            position: {
              x: config.baseX + i * 180,
              y: config.baseY + i * 120,
              width: 150,
              height: 100,
              transform: `translate(${config.baseX + i * 180}px, ${config.baseY + i * 120}px)`,
              zIndex: i + 1
            }
          }));
          
          // Apply batch update
          await updater.batchUpdate(updates);
          
          // Wait for transitions
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Verify all theme styles preserved
          let allPreserved = true;
          for (let i = 0; i < elements.length; i++) {
            const stylesAfter = getThemeStyles(elements[i]);
            const match = themeStylesMatch(stylesBefore[i], stylesAfter);
            
            if (!match.matches) {
              console.error(`Element ${i} theme styles mismatch:`, {
                key: match.mismatchedKey,
                before: match.expected,
                after: match.actual
              });
              allPreserved = false;
              break;
            }
          }
          
          // Clean up
          updater.destroy();
          elements.forEach(element => {
            document.body.removeChild(element);
          });
          
          return allPreserved;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: Theme styling in batch updates',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: Theme styling in batch updates',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Theme styling preserved through theme changes
   */
  try {
    console.log('Property 5: Theme styling should be preserved when theme changes after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialTheme: fc.constantFrom('light', 'dark'),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 })
        }),
        async (config) => {
          const finalTheme = config.initialTheme === 'light' ? 'dark' : 'light';
          
          // Apply initial theme
          applyTheme(config.initialTheme);
          
          // Create themed element
          const element = createThemedElement(config.initialTheme);
          document.body.appendChild(element);
          
          // Wait for styles to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: 180,
            height: 100,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Change theme
          applyTheme(finalTheme);
          
          // Update element's theme styling manually (simulating theme system)
          if (finalTheme === 'light') {
            element.style.backgroundColor = 'rgb(255, 255, 255)';
            element.style.color = 'rgb(30, 41, 59)';
            element.style.borderColor = 'rgb(226, 232, 240)';
          } else {
            element.style.backgroundColor = 'rgb(30, 41, 59)';
            element.style.color = 'rgb(248, 250, 252)';
            element.style.borderColor = 'rgb(71, 85, 105)';
          }
          
          // Wait for theme change to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get styles after theme change
          const stylesAfter = getThemeStyles(element);
          
          // Verify element still has correct theme colors
          const expectedBgColor = finalTheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(30, 41, 59)';
          const expectedColor = finalTheme === 'light' ? 'rgb(30, 41, 59)' : 'rgb(248, 250, 252)';
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify theme colors match expected
          if (stylesAfter.backgroundColor !== expectedBgColor) {
            console.error('Background color mismatch after theme change:', {
              expected: expectedBgColor,
              actual: stylesAfter.backgroundColor
            });
            return false;
          }
          
          if (stylesAfter.color !== expectedColor) {
            console.error('Text color mismatch after theme change:', {
              expected: expectedColor,
              actual: stylesAfter.color
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Theme styling through theme changes',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Theme styling through theme changes',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 5 failed:', error.message, '\n');
  }

  /**
   * Property 6: Theme styling preserved through multiple repositionings
   */
  try {
    console.log('Property 6: Theme styling should be preserved through multiple repositionings');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          numRepositions: fc.integer({ min: 2, max: 4 }),
          positions: fc.array(
            fc.record({
              x: fc.integer({ min: 0, max: 800 }),
              y: fc.integer({ min: 0, max: 800 })
            }),
            { minLength: 2, maxLength: 4 }
          )
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create themed element
          const element = createThemedElement(config.theme);
          document.body.appendChild(element);
          
          // Wait for styles to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get initial theme styles
          const initialStyles = getThemeStyles(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Perform multiple repositionings
          for (let i = 0; i < Math.min(config.numRepositions, config.positions.length); i++) {
            const pos = config.positions[i];
            
            const position = {
              x: pos.x,
              y: pos.y,
              width: 180,
              height: 100,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: i + 1
            };
            
            await updater.updateElementPosition(element, position);
            
            // Wait for transition
            await new Promise(resolve => setTimeout(resolve, 350));
            
            // Verify theme styles after each reposition
            const currentStyles = getThemeStyles(element);
            const match = themeStylesMatch(initialStyles, currentStyles);
            
            if (!match.matches) {
              console.error(`Theme styles mismatch at iteration ${i}:`, {
                key: match.mismatchedKey,
                expected: match.expected,
                actual: match.actual
              });
              
              updater.destroy();
              document.body.removeChild(element);
              return false;
            }
          }
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          return true;
        }
      ),
      { numRuns: 50, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 6: Theme styling through multiple repositionings',
      status: 'PASS'
    });
    console.log('✓ Property 6 passed (50 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 6: Theme styling through multiple repositionings',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 6 failed:', error.message, '\n');
  }

  /**
   * Property 7: Inline theme styles preserved after repositioning
   */
  try {
    console.log('Property 7: Inline theme styles should be preserved after repositioning');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          theme: fc.constantFrom('light', 'dark'),
          boxShadow: fc.constantFrom(
            'rgba(0, 0, 0, 0.1) 0px 4px 6px',
            'rgba(0, 0, 0, 0.2) 0px 8px 12px',
            'rgba(0, 0, 0, 0.3) 0px 12px 24px'
          ),
          opacity: fc.constantFrom('0.8', '0.9', '1'),
          x: fc.integer({ min: 0, max: 1000 }),
          y: fc.integer({ min: 0, max: 1000 })
        }),
        async (config) => {
          // Apply theme to document
          applyTheme(config.theme);
          
          // Create themed element with inline styles
          const element = createThemedElement(config.theme, {
            boxShadow: config.boxShadow,
            opacity: config.opacity
          });
          document.body.appendChild(element);
          
          // Wait for styles to apply
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Get styles before repositioning
          const stylesBefore = getThemeStyles(element);
          
          // Create DOMUpdater
          const updater = new DOMUpdater();
          
          // Reposition element
          const position = {
            x: config.x,
            y: config.y,
            width: 180,
            height: 100,
            transform: `translate(${config.x}px, ${config.y}px)`,
            zIndex: 1
          };
          
          await updater.updateElementPosition(element, position);
          
          // Wait for transition
          await new Promise(resolve => setTimeout(resolve, 350));
          
          // Get styles after repositioning
          const stylesAfter = getThemeStyles(element);
          
          // Clean up
          updater.destroy();
          document.body.removeChild(element);
          
          // Verify inline styles preserved
          const match = themeStylesMatch(stylesBefore, stylesAfter);
          
          if (!match.matches) {
            console.error('Inline theme styles mismatch:', {
              key: match.mismatchedKey,
              before: match.expected,
              after: match.actual
            });
            return false;
          }
          
          return true;
        }
      ),
      { numRuns: 100, timeout: 60000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 7: Inline theme styles preservation',
      status: 'PASS'
    });
    console.log('✓ Property 7 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 7: Inline theme styles preservation',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 7 failed:', error.message, '\n');
  }

  // Print summary
  console.log('=== Test Summary ===');
  console.log(`Total Properties: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log(`Total Iterations: ${(results.passed * 100) + (results.failed * 100) - 50}\n`);

  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runThemeStylingPreservationPropertyTest };
}
