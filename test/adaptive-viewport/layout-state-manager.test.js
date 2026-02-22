/**
 * Unit Tests for LayoutStateManager
 * Tests state caching, management, and dimension caching
 * Requirements: 8.4, 10.5
 */

// Import dependencies
const LayoutStateManager = require('../../js/adaptive-viewport/layout-state-manager.js');
const AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');

/**
 * Mock DOM element for testing
 */
class MockElement {
  constructor(id = '', width = 100, height = 100) {
    this.id = id;
    this.className = '';
    this._boundingRect = {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height
    };
  }

  getBoundingClientRect() {
    return { ...this._boundingRect };
  }
}

/**
 * Create mock layout state
 */
function createMockState(timestamp = Date.now(), isValid = true) {
  return {
    timestamp,
    viewportDimensions: {
      width: 1024,
      height: 768
    },
    configuration: {
      boardSize: { width: 400, height: 400 },
      boardPosition: { x: 0, y: 0, width: 400, height: 400, transform: '', zIndex: 1 },
      elementPositions: new Map(),
      layoutStrategy: 'horizontal',
      requiresScrolling: false,
      scrollContainers: []
    },
    elementDimensions: new Map(),
    isValid
  };
}

/**
 * Test Suite
 */
describe('LayoutStateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new LayoutStateManager();
  });

  afterEach(() => {
    if (stateManager) {
      stateManager.destroy();
    }
  });

  describe('Constructor', () => {
    test('should create instance with default configuration', () => {
      expect(stateManager).toBeDefined();
      expect(stateManager.currentState).toBeNull();
      expect(stateManager.previousState).toBeNull();
      expect(stateManager.stateHistory).toEqual([]);
    });

    test('should initialize with cache enabled by default', () => {
      expect(stateManager.cacheEnabled).toBe(true);
    });

    test('should initialize with empty dimension cache', () => {
      expect(stateManager.dimensionCache.size).toBe(0);
    });

    test('should initialize cache statistics to zero', () => {
      expect(stateManager.cacheHits).toBe(0);
      expect(stateManager.cacheMisses).toBe(0);
    });

    test('should accept custom configuration', () => {
      const customManager = new LayoutStateManager({
        maxHistorySize: 5,
        enableCache: false
      });

      expect(customManager.maxHistorySize).toBe(5);
      expect(customManager.cacheEnabled).toBe(false);

      customManager.destroy();
    });
  });

  describe('saveState', () => {
    test('should save valid state', () => {
      const state = createMockState();
      stateManager.saveState(state);

      expect(stateManager.currentState).toBeDefined();
      expect(stateManager.currentState.timestamp).toBe(state.timestamp);
    });

    test('should not save null state', () => {
      stateManager.saveState(null);
      expect(stateManager.currentState).toBeNull();
    });

    test('should add timestamp if not provided', () => {
      const state = createMockState();
      delete state.timestamp;

      const beforeTime = Date.now();
      stateManager.saveState(state);
      const afterTime = Date.now();

      expect(stateManager.currentState.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(stateManager.currentState.timestamp).toBeLessThanOrEqual(afterTime);
    });

    test('should set isValid to true by default', () => {
      const state = createMockState();
      delete state.isValid;

      stateManager.saveState(state);

      expect(stateManager.currentState.isValid).toBe(true);
    });

    test('should move current state to previous on new save', () => {
      const state1 = createMockState(1000);
      const state2 = createMockState(2000);

      stateManager.saveState(state1);
      stateManager.saveState(state2);

      expect(stateManager.currentState.timestamp).toBe(2000);
      expect(stateManager.previousState.timestamp).toBe(1000);
    });

    test('should add previous state to history', () => {
      const state1 = createMockState(1000);
      const state2 = createMockState(2000);

      stateManager.saveState(state1);
      stateManager.saveState(state2);

      expect(stateManager.stateHistory.length).toBe(1);
      expect(stateManager.stateHistory[0].timestamp).toBe(1000);
    });

    test('should limit history size', () => {
      const manager = new LayoutStateManager({ maxHistorySize: 3 });

      for (let i = 0; i < 5; i++) {
        manager.saveState(createMockState(i * 1000));
      }

      expect(manager.stateHistory.length).toBe(3);
      expect(manager.stateHistory[0].timestamp).toBe(1000); // Oldest kept

      manager.destroy();
    });

    test('should not save invalid state structure', () => {
      const invalidState = { timestamp: Date.now() }; // Missing required fields

      stateManager.saveState(invalidState);

      expect(stateManager.currentState).toBeNull();
    });
  });

  describe('getState', () => {
    test('should return null when no state saved', () => {
      expect(stateManager.getState()).toBeNull();
    });

    test('should return current state', () => {
      const state = createMockState(1000);
      stateManager.saveState(state);

      const retrieved = stateManager.getState();

      expect(retrieved).toBeDefined();
      expect(retrieved.timestamp).toBe(1000);
    });

    test('should return copy of state, not reference', () => {
      const state = createMockState();
      stateManager.saveState(state);

      const retrieved = stateManager.getState();
      retrieved.timestamp = 9999;

      expect(stateManager.currentState.timestamp).not.toBe(9999);
    });
  });

  describe('getPreviousState', () => {
    test('should return null when no previous state', () => {
      expect(stateManager.getPreviousState()).toBeNull();
    });

    test('should return null after first state save', () => {
      stateManager.saveState(createMockState());
      expect(stateManager.getPreviousState()).toBeNull();
    });

    test('should return previous valid state', () => {
      const state1 = createMockState(1000, true);
      const state2 = createMockState(2000, true);

      stateManager.saveState(state1);
      stateManager.saveState(state2);

      const previous = stateManager.getPreviousState();

      expect(previous).toBeDefined();
      expect(previous.timestamp).toBe(1000);
    });

    test('should skip invalid previous state and search history', () => {
      const state1 = createMockState(1000, true);
      const state2 = createMockState(2000, false); // Invalid
      const state3 = createMockState(3000, true);

      stateManager.saveState(state1);
      stateManager.saveState(state2);
      stateManager.saveState(state3);

      const previous = stateManager.getPreviousState();

      expect(previous).toBeDefined();
      expect(previous.timestamp).toBe(1000); // Skips invalid state2
    });

    test('should return null if no valid state in history', () => {
      const state1 = createMockState(1000, false);
      const state2 = createMockState(2000, false);

      stateManager.saveState(state1);
      stateManager.saveState(state2);

      expect(stateManager.getPreviousState()).toBeNull();
    });

    test('should return copy of previous state', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      const previous = stateManager.getPreviousState();
      previous.timestamp = 9999;

      expect(stateManager.previousState.timestamp).toBe(1000);
    });
  });

  describe('getStateHistory', () => {
    test('should return empty array when no history', () => {
      expect(stateManager.getStateHistory()).toEqual([]);
    });

    test('should return all history when count not specified', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));
      stateManager.saveState(createMockState(3000));

      const history = stateManager.getStateHistory();

      expect(history.length).toBe(2); // Current and previous, so 2 in history
    });

    test('should return limited history when count specified', () => {
      for (let i = 0; i < 5; i++) {
        stateManager.saveState(createMockState(i * 1000));
      }

      const history = stateManager.getStateHistory(2);

      expect(history.length).toBe(2);
    });

    test('should return copy of history array', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      const history = stateManager.getStateHistory();
      history.push(createMockState(9999));

      expect(stateManager.stateHistory.length).toBe(1);
    });
  });

  describe('clearStateHistory', () => {
    test('should clear all history', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));
      stateManager.saveState(createMockState(3000));

      stateManager.clearStateHistory();

      expect(stateManager.stateHistory.length).toBe(0);
    });

    test('should not affect current state', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      stateManager.clearStateHistory();

      expect(stateManager.currentState).toBeDefined();
      expect(stateManager.currentState.timestamp).toBe(2000);
    });

    test('should not affect previous state', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      stateManager.clearStateHistory();

      expect(stateManager.previousState).toBeDefined();
      expect(stateManager.previousState.timestamp).toBe(1000);
    });
  });

  describe('invalidateCurrentState', () => {
    test('should mark current state as invalid', () => {
      stateManager.saveState(createMockState(1000, true));

      stateManager.invalidateCurrentState();

      expect(stateManager.currentState.isValid).toBe(false);
    });

    test('should do nothing if no current state', () => {
      expect(() => stateManager.invalidateCurrentState()).not.toThrow();
    });
  });

  describe('cacheElementDimensions', () => {
    test('should cache element dimensions', () => {
      const element = new MockElement('test', 200, 150);

      const rect = stateManager.cacheElementDimensions(element);

      expect(rect.width).toBe(200);
      expect(rect.height).toBe(150);
      expect(stateManager.dimensionCache.has(element)).toBe(true);
    });

    test('should throw error if element is null', () => {
      expect(() => stateManager.cacheElementDimensions(null))
        .toThrow('Element is required');
    });

    test('should return dimensions without caching if cache disabled', () => {
      stateManager.disableCache();
      const element = new MockElement('test', 200, 150);

      const rect = stateManager.cacheElementDimensions(element);

      expect(rect.width).toBe(200);
      expect(stateManager.dimensionCache.has(element)).toBe(false);
    });

    test('should store timestamp with cached dimensions', () => {
      const element = new MockElement('test');
      const beforeTime = Date.now();

      stateManager.cacheElementDimensions(element);

      const cached = stateManager.dimensionCache.get(element);
      expect(cached.timestamp).toBeGreaterThanOrEqual(beforeTime);
    });

    test('should update cache if element already cached', () => {
      const element = new MockElement('test', 100, 100);

      stateManager.cacheElementDimensions(element);
      element._boundingRect.width = 200;
      stateManager.cacheElementDimensions(element);

      const cached = stateManager.getCachedDimensions(element);
      expect(cached.width).toBe(200);
    });
  });

  describe('getCachedDimensions', () => {
    test('should return null for uncached element', () => {
      const element = new MockElement('test');

      expect(stateManager.getCachedDimensions(element)).toBeNull();
    });

    test('should return null if element is null', () => {
      expect(stateManager.getCachedDimensions(null)).toBeNull();
    });

    test('should return cached dimensions', () => {
      const element = new MockElement('test', 200, 150);

      stateManager.cacheElementDimensions(element);
      const cached = stateManager.getCachedDimensions(element);

      expect(cached.width).toBe(200);
      expect(cached.height).toBe(150);
    });

    test('should increment cache hits on hit', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.getCachedDimensions(element);

      expect(stateManager.cacheHits).toBe(1);
    });

    test('should increment cache misses on miss', () => {
      const element = new MockElement('test');

      stateManager.getCachedDimensions(element);

      expect(stateManager.cacheMisses).toBe(1);
    });

    test('should return null if cache disabled', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.disableCache();

      expect(stateManager.getCachedDimensions(element)).toBeNull();
    });
  });

  describe('getElementDimensions', () => {
    test('should return cached dimensions if available', () => {
      const element = new MockElement('test', 200, 150);

      stateManager.cacheElementDimensions(element);
      const dims = stateManager.getElementDimensions(element);

      expect(dims.width).toBe(200);
      expect(stateManager.cacheHits).toBe(1);
    });

    test('should cache and return dimensions if not cached', () => {
      const element = new MockElement('test', 200, 150);

      const dims = stateManager.getElementDimensions(element);

      expect(dims.width).toBe(200);
      expect(stateManager.dimensionCache.has(element)).toBe(true);
    });

    test('should throw error if element is null', () => {
      expect(() => stateManager.getElementDimensions(null))
        .toThrow('Element is required');
    });
  });

  describe('invalidateCache', () => {
    test('should clear entire cache when no element specified', () => {
      const element1 = new MockElement('test1');
      const element2 = new MockElement('test2');

      stateManager.cacheElementDimensions(element1);
      stateManager.cacheElementDimensions(element2);

      stateManager.invalidateCache();

      expect(stateManager.dimensionCache.size).toBe(0);
    });

    test('should clear specific element from cache', () => {
      const element1 = new MockElement('test1');
      const element2 = new MockElement('test2');

      stateManager.cacheElementDimensions(element1);
      stateManager.cacheElementDimensions(element2);

      stateManager.invalidateCache(element1);

      expect(stateManager.dimensionCache.has(element1)).toBe(false);
      expect(stateManager.dimensionCache.has(element2)).toBe(true);
    });

    test('should do nothing if element not in cache', () => {
      const element = new MockElement('test');

      expect(() => stateManager.invalidateCache(element)).not.toThrow();
    });

    test('should clear cache invalidation timer', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      expect(stateManager.cacheInvalidationTimer).toBeDefined();

      stateManager.invalidateCache();

      expect(stateManager.cacheInvalidationTimer).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    test('should return correct statistics', () => {
      const element1 = new MockElement('test1');
      const element2 = new MockElement('test2');

      stateManager.cacheElementDimensions(element1);
      stateManager.cacheElementDimensions(element2);
      stateManager.getCachedDimensions(element1); // Hit
      stateManager.getCachedDimensions(element2); // Hit
      stateManager.getCachedDimensions(new MockElement('test3')); // Miss

      const stats = stateManager.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.total).toBe(3);
      expect(stats.hitRate).toBeCloseTo(66.67, 1);
      expect(stats.enabled).toBe(true);
    });

    test('should return zero hit rate when no queries', () => {
      const stats = stateManager.getCacheStats();

      expect(stats.hitRate).toBe(0);
    });
  });

  describe('getCacheHitRate', () => {
    test('should return 0 when no cache queries', () => {
      expect(stateManager.getCacheHitRate()).toBe(0);
    });

    test('should return 100 when all hits', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.getCachedDimensions(element);
      stateManager.getCachedDimensions(element);

      expect(stateManager.getCacheHitRate()).toBe(100);
    });

    test('should return 0 when all misses', () => {
      stateManager.getCachedDimensions(new MockElement('test1'));
      stateManager.getCachedDimensions(new MockElement('test2'));

      expect(stateManager.getCacheHitRate()).toBe(0);
    });

    test('should return correct percentage for mixed hits/misses', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.getCachedDimensions(element); // Hit
      stateManager.getCachedDimensions(new MockElement('test2')); // Miss

      expect(stateManager.getCacheHitRate()).toBe(50);
    });
  });

  describe('resetCacheStats', () => {
    test('should reset hits and misses to zero', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.getCachedDimensions(element);
      stateManager.getCachedDimensions(new MockElement('test2'));

      stateManager.resetCacheStats();

      expect(stateManager.cacheHits).toBe(0);
      expect(stateManager.cacheMisses).toBe(0);
    });

    test('should not clear cache contents', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.resetCacheStats();

      expect(stateManager.dimensionCache.size).toBe(1);
    });
  });

  describe('enableCache / disableCache', () => {
    test('should enable caching', () => {
      stateManager.disableCache();
      stateManager.enableCache();

      expect(stateManager.cacheEnabled).toBe(true);
    });

    test('should disable caching and clear cache', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.disableCache();

      expect(stateManager.cacheEnabled).toBe(false);
      expect(stateManager.dimensionCache.size).toBe(0);
    });
  });

  describe('exportState / importState', () => {
    test('should export current state', () => {
      stateManager.saveState(createMockState(1000));

      const exported = stateManager.exportState();

      expect(exported.current).toBeDefined();
      expect(exported.current.timestamp).toBe(1000);
    });

    test('should export previous state', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      const exported = stateManager.exportState();

      expect(exported.previous).toBeDefined();
      expect(exported.previous.timestamp).toBe(1000);
    });

    test('should export history', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      const exported = stateManager.exportState();

      expect(exported.history).toBeDefined();
      expect(Array.isArray(exported.history)).toBe(true);
    });

    test('should export cache stats', () => {
      const exported = stateManager.exportState();

      expect(exported.cacheStats).toBeDefined();
      expect(exported.cacheStats.size).toBeDefined();
    });

    test('should import state successfully', () => {
      const data = {
        current: createMockState(1000),
        previous: createMockState(500),
        history: [createMockState(100)]
      };

      stateManager.importState(data);

      expect(stateManager.currentState.timestamp).toBe(1000);
      expect(stateManager.previousState.timestamp).toBe(500);
      expect(stateManager.stateHistory.length).toBe(1);
    });

    test('should handle null import data', () => {
      expect(() => stateManager.importState(null)).not.toThrow();
    });
  });

  describe('destroy', () => {
    test('should clear all state', () => {
      stateManager.saveState(createMockState(1000));
      stateManager.saveState(createMockState(2000));

      stateManager.destroy();

      expect(stateManager.currentState).toBeNull();
      expect(stateManager.previousState).toBeNull();
      expect(stateManager.stateHistory.length).toBe(0);
    });

    test('should clear dimension cache', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.destroy();

      expect(stateManager.dimensionCache.size).toBe(0);
    });

    test('should reset cache statistics', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.getCachedDimensions(element);

      stateManager.destroy();

      expect(stateManager.cacheHits).toBe(0);
      expect(stateManager.cacheMisses).toBe(0);
    });

    test('should clear cache invalidation timer', () => {
      const element = new MockElement('test');

      stateManager.cacheElementDimensions(element);
      stateManager.destroy();

      expect(stateManager.cacheInvalidationTimer).toBeNull();
    });
  });

  describe('Cache Hit Rate Requirement (Property 26)', () => {
    test('should achieve >80% cache hit rate after initial caching', () => {
      const elements = [];
      
      // Create and cache 10 elements
      for (let i = 0; i < 10; i++) {
        const element = new MockElement(`test${i}`, 100 + i * 10, 100 + i * 10);
        elements.push(element);
        stateManager.cacheElementDimensions(element);
      }

      // Query each element 10 times (should all be cache hits)
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          stateManager.getCachedDimensions(elements[i]);
        }
      }

      const hitRate = stateManager.getCacheHitRate();
      
      // After initial caching, all subsequent queries should be hits
      // 100 queries, all hits = 100% hit rate
      expect(hitRate).toBeGreaterThan(80);
    });

    test('should maintain high hit rate with mixed access patterns', () => {
      const elements = [];
      
      // Cache 5 elements
      for (let i = 0; i < 5; i++) {
        const element = new MockElement(`test${i}`);
        elements.push(element);
        stateManager.getElementDimensions(element); // This caches
      }

      // Access cached elements multiple times
      for (let i = 0; i < 20; i++) {
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        stateManager.getElementDimensions(randomElement);
      }

      const hitRate = stateManager.getCacheHitRate();
      
      // Should have high hit rate (>80%) after initial caching
      expect(hitRate).toBeGreaterThan(80);
    });
  });
});

// Export for test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { describe, test, expect, beforeEach, afterEach };
}

