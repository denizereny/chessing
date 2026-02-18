/**
 * Property-Based Test: In-Memory Analysis Only
 * Feature: adaptive-viewport-optimizer
 * Property 3: In-Memory Analysis Only
 * 
 * **Validates: Requirements 1.5**
 * 
 * For any viewport analysis operation, no files should be created on disk 
 * and no persistent storage should be used.
 */

// Import VisibilityDetector
let VisibilityDetector;
if (typeof require !== 'undefined') {
  try {
    VisibilityDetector = require('../../js/adaptive-viewport/visibility-detector.js');
  } catch (e) {
    // Will be loaded via script tag in browser
  }
}

/**
 * Run property-based test for in-memory analysis
 * @param {Object} fc - fast-check library instance
 * @returns {Promise<Object>} Test results
 */
async function runInMemoryAnalysisPropertyTest(fc) {
  if (!fc) {
    throw new Error('fast-check library is required');
  }

  console.log('\n=== Property Test: In-Memory Analysis Only ===\n');
  console.log('Testing that VisibilityDetector performs all analysis in-memory');
  console.log('without creating files or using persistent storage...\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  /**
   * Helper: Monitor storage operations
   */
  class StorageMonitor {
    constructor() {
      this.storageOperations = [];
      this.fileOperations = [];
      this.originalLocalStorage = null;
      this.originalSessionStorage = null;
      this.originalIndexedDB = null;
    }

    startMonitoring() {
      // Monitor localStorage
      if (typeof localStorage !== 'undefined') {
        this.originalLocalStorage = {
          setItem: localStorage.setItem.bind(localStorage),
          removeItem: localStorage.removeItem.bind(localStorage),
          clear: localStorage.clear.bind(localStorage)
        };

        localStorage.setItem = (...args) => {
          this.storageOperations.push({ type: 'localStorage.setItem', args });
          return this.originalLocalStorage.setItem(...args);
        };

        localStorage.removeItem = (...args) => {
          this.storageOperations.push({ type: 'localStorage.removeItem', args });
          return this.originalLocalStorage.removeItem(...args);
        };

        localStorage.clear = (...args) => {
          this.storageOperations.push({ type: 'localStorage.clear', args });
          return this.originalLocalStorage.clear(...args);
        };
      }

      // Monitor sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        this.originalSessionStorage = {
          setItem: sessionStorage.setItem.bind(sessionStorage),
          removeItem: sessionStorage.removeItem.bind(sessionStorage),
          clear: sessionStorage.clear.bind(sessionStorage)
        };

        sessionStorage.setItem = (...args) => {
          this.storageOperations.push({ type: 'sessionStorage.setItem', args });
          return this.originalSessionStorage.setItem(...args);
        };

        sessionStorage.removeItem = (...args) => {
          this.storageOperations.push({ type: 'sessionStorage.removeItem', args });
          return this.originalSessionStorage.removeItem(...args);
        };

        sessionStorage.clear = (...args) => {
          this.storageOperations.push({ type: 'sessionStorage.clear', args });
          return this.originalSessionStorage.clear(...args);
        };
      }

      // Monitor IndexedDB
      if (typeof indexedDB !== 'undefined') {
        this.originalIndexedDB = indexedDB.open.bind(indexedDB);
        
        indexedDB.open = (...args) => {
          this.storageOperations.push({ type: 'indexedDB.open', args });
          return this.originalIndexedDB(...args);
        };
      }
    }

    stopMonitoring() {
      // Restore localStorage
      if (this.originalLocalStorage) {
        localStorage.setItem = this.originalLocalStorage.setItem;
        localStorage.removeItem = this.originalLocalStorage.removeItem;
        localStorage.clear = this.originalLocalStorage.clear;
      }

      // Restore sessionStorage
      if (this.originalSessionStorage) {
        sessionStorage.setItem = this.originalSessionStorage.setItem;
        sessionStorage.removeItem = this.originalSessionStorage.removeItem;
        sessionStorage.clear = this.originalSessionStorage.clear;
      }

      // Restore IndexedDB
      if (this.originalIndexedDB) {
        indexedDB.open = this.originalIndexedDB;
      }
    }

    getStorageOperations() {
      return this.storageOperations;
    }

    hasStorageOperations() {
      return this.storageOperations.length > 0;
    }

    reset() {
      this.storageOperations = [];
      this.fileOperations = [];
    }
  }

  /**
   * Helper: Create test elements
   */
  function createTestElements(count, viewportWidth, viewportHeight) {
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.left = `${Math.random() * viewportWidth * 2 - viewportWidth / 2}px`;
      element.style.top = `${Math.random() * viewportHeight * 2 - viewportHeight / 2}px`;
      element.style.width = `${50 + Math.random() * 200}px`;
      element.style.height = `${50 + Math.random() * 200}px`;
      element.style.visibility = 'visible';
      element.style.display = 'block';
      element.className = `test-element-${i}`;
      
      document.body.appendChild(element);
      elements.push(element);
    }
    
    return elements;
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
   * Property 1: No storage operations during detector initialization
   */
  try {
    console.log('Property 1: No storage operations during detector initialization');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 1, max: 20 }),
          threshold: fc.double({ min: 0, max: 1 })
        }),
        async (config) => {
          const monitor = new StorageMonitor();
          monitor.startMonitoring();
          
          // Create test elements
          const elements = createTestElements(
            config.elementCount,
            window.innerWidth,
            window.innerHeight
          );
          
          try {
            // Create detector - this should not use storage
            const detector = new VisibilityDetector(elements, {
              threshold: config.threshold
            });
            
            // Wait for initialization
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check for storage operations
            const hasStorage = monitor.hasStorageOperations();
            
            // Clean up
            detector.destroy();
            monitor.stopMonitoring();
            cleanupElements(elements);
            
            if (hasStorage) {
              console.error(`Storage operations detected during initialization:`, 
                monitor.getStorageOperations());
              return false;
            }
            
            return true;
          } catch (error) {
            monitor.stopMonitoring();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 1: No storage during initialization',
      status: 'PASS'
    });
    console.log('✓ Property 1 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 1: No storage during initialization',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 1 failed:', error.message, '\n');
  }

  /**
   * Property 2: No storage operations during visibility detection
   */
  try {
    console.log('Property 2: No storage operations during visibility detection');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 5, max: 15 }),
          observationTime: fc.integer({ min: 100, max: 500 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(
            config.elementCount,
            window.innerWidth,
            window.innerHeight
          );
          
          // Create detector
          const detector = new VisibilityDetector(elements, { threshold: 0.1 });
          
          // Wait for initial setup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Start monitoring AFTER initialization
          const monitor = new StorageMonitor();
          monitor.startMonitoring();
          
          try {
            // Let detector observe for a period
            await new Promise(resolve => setTimeout(resolve, config.observationTime));
            
            // Get visibility data (should be in-memory)
            const visibilityMap = detector.getVisibilityMap();
            const invisibleElements = detector.getInvisibleElements();
            const visibleElements = detector.getVisibleElements();
            
            // Check for storage operations
            const hasStorage = monitor.hasStorageOperations();
            
            // Clean up
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            
            if (hasStorage) {
              console.error(`Storage operations detected during visibility detection:`,
                monitor.getStorageOperations());
              return false;
            }
            
            // Verify data was collected (in-memory)
            if (visibilityMap.size === 0 && elements.length > 0) {
              console.error('No visibility data collected - detector may not be working');
              return false;
            }
            
            return true;
          } catch (error) {
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 2: No storage during visibility detection',
      status: 'PASS'
    });
    console.log('✓ Property 2 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 2: No storage during visibility detection',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 2 failed:', error.message, '\n');
  }

  /**
   * Property 3: No storage operations during visibility refresh
   */
  try {
    console.log('Property 3: No storage operations during visibility refresh');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 3, max: 10 }),
          refreshCount: fc.integer({ min: 1, max: 5 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(
            config.elementCount,
            window.innerWidth,
            window.innerHeight
          );
          
          // Create detector
          const detector = new VisibilityDetector(elements, { threshold: 0.1 });
          
          // Wait for initial setup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Start monitoring
          const monitor = new StorageMonitor();
          monitor.startMonitoring();
          
          try {
            // Perform multiple refreshes
            for (let i = 0; i < config.refreshCount; i++) {
              detector.refresh();
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Check for storage operations
            const hasStorage = monitor.hasStorageOperations();
            
            // Clean up
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            
            if (hasStorage) {
              console.error(`Storage operations detected during refresh:`,
                monitor.getStorageOperations());
              return false;
            }
            
            return true;
          } catch (error) {
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 3: No storage during refresh',
      status: 'PASS'
    });
    console.log('✓ Property 3 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 3: No storage during refresh',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 3 failed:', error.message, '\n');
  }

  /**
   * Property 4: No storage operations during observe/unobserve
   */
  try {
    console.log('Property 4: No storage operations during observe/unobserve');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 5, max: 15 }),
          operationCount: fc.integer({ min: 3, max: 10 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(
            config.elementCount,
            window.innerWidth,
            window.innerHeight
          );
          
          // Create detector with no initial elements
          const detector = new VisibilityDetector([], { threshold: 0.1 });
          
          // Wait for initial setup
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Start monitoring
          const monitor = new StorageMonitor();
          monitor.startMonitoring();
          
          try {
            // Perform observe/unobserve operations
            for (let i = 0; i < config.operationCount; i++) {
              const element = elements[i % elements.length];
              
              // Observe
              detector.observe(element);
              await new Promise(resolve => setTimeout(resolve, 50));
              
              // Unobserve
              detector.unobserve(element);
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Check for storage operations
            const hasStorage = monitor.hasStorageOperations();
            
            // Clean up
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            
            if (hasStorage) {
              console.error(`Storage operations detected during observe/unobserve:`,
                monitor.getStorageOperations());
              return false;
            }
            
            return true;
          } catch (error) {
            monitor.stopMonitoring();
            detector.destroy();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 4: No storage during observe/unobserve',
      status: 'PASS'
    });
    console.log('✓ Property 4 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 4: No storage during observe/unobserve',
      status: 'FAIL',
      error: error.message
    });
    console.error('✗ Property 4 failed:', error.message, '\n');
  }

  /**
   * Property 5: Visibility data accessible in-memory
   */
  try {
    console.log('Property 5: Visibility data is accessible in-memory without storage');
    
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          elementCount: fc.integer({ min: 5, max: 20 })
        }),
        async (config) => {
          // Create test elements
          const elements = createTestElements(
            config.elementCount,
            window.innerWidth,
            window.innerHeight
          );
          
          // Create detector
          const detector = new VisibilityDetector(elements, { threshold: 0.1 });
          
          // Wait for observation
          await new Promise(resolve => setTimeout(resolve, 150));
          
          try {
            // Access visibility data - should be in-memory
            const visibilityMap = detector.getVisibilityMap();
            const invisibleElements = detector.getInvisibleElements();
            const visibleElements = detector.getVisibleElements();
            
            // Verify data is accessible
            const hasData = visibilityMap.size > 0;
            const totalElements = invisibleElements.length + visibleElements.length;
            
            // Clean up
            detector.destroy();
            cleanupElements(elements);
            
            // Data should be accessible in-memory
            if (!hasData) {
              console.error('Visibility data not accessible in-memory');
              return false;
            }
            
            // All elements should be accounted for
            if (totalElements !== config.elementCount) {
              console.error(`Element count mismatch: expected ${config.elementCount}, got ${totalElements}`);
              return false;
            }
            
            return true;
          } catch (error) {
            detector.destroy();
            cleanupElements(elements);
            throw error;
          }
        }
      ),
      { numRuns: 100, timeout: 30000 }
    );
    
    results.passed++;
    results.tests.push({
      name: 'Property 5: Visibility data accessible in-memory',
      status: 'PASS'
    });
    console.log('✓ Property 5 passed (100 iterations)\n');
    
  } catch (error) {
    results.failed++;
    results.tests.push({
      name: 'Property 5: Visibility data accessible in-memory',
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
  module.exports = { runInMemoryAnalysisPropertyTest };
}
