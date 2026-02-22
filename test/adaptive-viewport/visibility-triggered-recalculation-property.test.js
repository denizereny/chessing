/**
 * Property Test: Visibility-Triggered Recalculation
 * Feature: adaptive-viewport-optimizer, Property 20: Visibility-Triggered Recalculation
 * 
 * Property: For any element that transitions from visible to invisible (or vice versa),
 * a layout recalculation should be triggered regardless of viewport size.
 * 
 * Validates: Requirements 6.2
 */

describe('Property 20: Visibility-Triggered Recalculation', () => {
  let breakpointManager;
  let testContainer;

  beforeEach(() => {
    // Create test container
    testContainer = document.createElement('div');
    testContainer.id = 'test-container';
    testContainer.style.position = 'relative';
    testContainer.style.width = '1000px';
    testContainer.style.height = '800px';
    document.body.appendChild(testContainer);

    // Initialize breakpoint manager
    breakpointManager = new AdaptiveBreakpointManager({
      minSpacing: 16,
      recalculationThreshold: 0.1
    });
  });

  afterEach(() => {
    if (testContainer && testContainer.parentNode) {
      testContainer.parentNode.removeChild(testContainer);
    }
  });

  /**
   * Property Test: Visibility change triggers recalculation
   */
  it('should trigger recalculation when element visibility changes', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        // Generate random viewport dimensions
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          elementCount: fc.integer({ min: 1, max: 10 }),
          visibilityChanges: fc.array(
            fc.record({
              elementIndex: fc.integer({ min: 0, max: 9 }),
              newVisibility: fc.boolean()
            }),
            { minLength: 1, maxLength: 5 }
          )
        }),
        (config) => {
          // Create test elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = document.createElement('div');
            element.id = `test-element-${i}`;
            element.className = 'test-ui-element';
            element.style.width = '200px';
            element.style.height = '50px';
            element.style.position = 'absolute';
            element.style.left = `${i * 220}px`;
            element.style.top = '0px';
            testContainer.appendChild(element);
            elements.push(element);
          }

          // Calculate initial breakpoints
          const initialBreakpoints = breakpointManager.calculateBreakpoints(
            elements,
            { width: config.viewportWidth, height: config.viewportHeight }
          );

          // Track recalculation triggers
          let recalculationCount = 0;
          breakpointManager.registerVisibilityChangeCallback(() => {
            recalculationCount++;
          });

          // Apply visibility changes
          config.visibilityChanges.forEach(change => {
            const elementIndex = change.elementIndex % config.elementCount;
            const element = elements[elementIndex];

            // Trigger visibility change
            const wasTriggered = breakpointManager.onVisibilityChange(
              element,
              change.newVisibility,
              { width: config.viewportWidth, height: config.viewportHeight }
            );

            // Property: Visibility change should trigger recalculation
            // (unless it's not actually a change from previous state)
            if (wasTriggered) {
              // Recalculation was triggered
              expect(recalculationCount).toBeGreaterThan(0);
            }
          });

          // Clean up
          elements.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Recalculation happens regardless of viewport size
   */
  it('should trigger recalculation regardless of viewport size', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 })
        }),
        (viewport) => {
          // Create a test element
          const element = document.createElement('div');
          element.id = 'test-element';
          element.style.width = '200px';
          element.style.height = '50px';
          testContainer.appendChild(element);

          // Set initial visibility state
          breakpointManager.onVisibilityChange(element, true, viewport);

          // Track if recalculation is triggered
          let recalculationTriggered = false;
          breakpointManager.registerVisibilityChangeCallback(() => {
            recalculationTriggered = true;
          });

          // Change visibility
          const wasTriggered = breakpointManager.onVisibilityChange(element, false, viewport);

          // Property: Recalculation should be triggered regardless of viewport size
          expect(wasTriggered).toBe(true);
          expect(recalculationTriggered).toBe(true);

          // Clean up
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: No recalculation if visibility doesn't actually change
   */
  it('should not trigger recalculation if visibility state is unchanged', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          initialVisibility: fc.boolean()
        }),
        (config) => {
          // Create a test element
          const element = document.createElement('div');
          element.id = 'test-element';
          element.style.width = '200px';
          element.style.height = '50px';
          testContainer.appendChild(element);

          const viewport = {
            width: config.viewportWidth,
            height: config.viewportHeight
          };

          // Set initial visibility state
          breakpointManager.onVisibilityChange(element, config.initialVisibility, viewport);

          // Track recalculation
          let recalculationCount = 0;
          breakpointManager.registerVisibilityChangeCallback(() => {
            recalculationCount++;
          });

          // Set same visibility state again
          const wasTriggered = breakpointManager.onVisibilityChange(
            element,
            config.initialVisibility,
            viewport
          );

          // Property: No recalculation should be triggered if state is unchanged
          expect(wasTriggered).toBe(false);
          expect(recalculationCount).toBe(0);

          // Clean up
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Multiple visibility changes trigger multiple recalculations
   */
  it('should trigger recalculation for each actual visibility change', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          changeCount: fc.integer({ min: 2, max: 10 })
        }),
        (config) => {
          // Create a test element
          const element = document.createElement('div');
          element.id = 'test-element';
          element.style.width = '200px';
          element.style.height = '50px';
          testContainer.appendChild(element);

          const viewport = {
            width: config.viewportWidth,
            height: config.viewportHeight
          };

          // Track recalculations
          let recalculationCount = 0;
          breakpointManager.registerVisibilityChangeCallback(() => {
            recalculationCount++;
          });

          // Alternate visibility state
          let currentVisibility = false;
          for (let i = 0; i < config.changeCount; i++) {
            currentVisibility = !currentVisibility;
            breakpointManager.onVisibilityChange(element, currentVisibility, viewport);
          }

          // Property: Each actual change should trigger a recalculation
          expect(recalculationCount).toBe(config.changeCount);

          // Clean up
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Breakpoint cache is invalidated on visibility change
   */
  it('should invalidate breakpoint cache when visibility changes', () => {
    if (typeof fc === 'undefined') {
      pending('fast-check not available');
      return;
    }

    fc.assert(
      fc.property(
        fc.record({
          viewportWidth: fc.integer({ min: 320, max: 3840 }),
          viewportHeight: fc.integer({ min: 480, max: 2160 }),
          elementCount: fc.integer({ min: 2, max: 5 })
        }),
        (config) => {
          // Create test elements
          const elements = [];
          for (let i = 0; i < config.elementCount; i++) {
            const element = document.createElement('div');
            element.id = `test-element-${i}`;
            element.style.width = '200px';
            element.style.height = '50px';
            testContainer.appendChild(element);
            elements.push(element);
          }

          const viewport = {
            width: config.viewportWidth,
            height: config.viewportHeight
          };

          // Calculate initial breakpoints
          const initialBreakpoints = breakpointManager.calculateBreakpoints(elements, viewport);
          const initialBreakpointCount = initialBreakpoints.length;

          // Change visibility of first element
          breakpointManager.onVisibilityChange(elements[0], false, viewport);

          // Get breakpoints after visibility change
          const currentBreakpoints = breakpointManager.getBreakpoints();

          // Property: Breakpoint cache should be invalidated (empty) after visibility change
          // New breakpoints will be calculated on next calculateBreakpoints call
          expect(currentBreakpoints.length).toBe(0);

          // Clean up
          elements.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
