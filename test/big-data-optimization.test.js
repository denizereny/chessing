/**
 * Unit Tests for Big Data Optimization System
 * 
 * Tests for handling 100+ position history with:
 * - Lazy loading and virtualization
 * - Memory management and garbage collection
 * - Performance optimization
 * 
 * Requirements: 8.5
 * Task: 9.3 Büyük veri optimizasyonu
 */

// Mock dependencies for testing
class MockHistoryManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.listeners = { positionAdded: [], positionChanged: [], historyCleared: [] };
  }
  
  addPosition(position, metadata = {}) {
    const id = `pos_${Date.now()}_${Math.random()}`;
    this.history.push({ position, metadata, id, timestamp: Date.now() });
    this.currentIndex = this.history.length - 1;
    this.notifyListeners('positionAdded', { position, id });
    return true;
  }
  
  getHistoryList() {
    return this.history.map((entry, index) => ({
      ...entry,
      index,
      isCurrent: index === this.currentIndex
    }));
  }
  
  getHistoryStatistics() {
    return {
      size: this.history.length,
      currentIndex: this.currentIndex,
      memoryUsage: this.history.length * 1000 // Approximate
    };
  }
  
  generatePositionId(position) {
    return `pos_${JSON.stringify(position).length}_${Date.now()}`;
  }
  
  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
    this.notifyListeners('historyCleared', {});
  }
}

class MockPerformanceMonitor {
  constructor() {
    this.measurements = [];
  }
  
  startMeasurement(type, id, metadata) {
    return id;
  }
  
  endMeasurement(id, data) {
    const measurement = {
      operationId: id,
      duration: Math.random() * 100,
      timestamp: Date.now(),
      ...data
    };
    this.measurements.push(measurement);
    return measurement;
  }
  
  getStatistics() {
    return {
      averageAnalysisTime: 50,
      totalOperations: this.measurements.length
    };
  }
}

// Test utilities
function createTestPosition() {
  return [
    ['r', 'n', 'b', 'q'],
    ['p', 'p', 'p', 'p'],
    [null, null, null, null],
    ['P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q']
  ];
}

function createRandomPosition() {
  const pieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];
  const position = Array(5).fill().map(() => Array(4).fill(null));
  
  // Add some random pieces
  for (let i = 0; i < 8; i++) {
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 4);
    if (position[row][col] === null) {
      position[row][col] = pieces[Math.floor(Math.random() * pieces.length)];
    }
  }
  
  return position;
}

// Test Suite
describe('Big Data Optimization System', () => {
  let historyManager;
  let performanceMonitor;
  let optimizationManager;
  
  beforeEach(() => {
    historyManager = new MockHistoryManager();
    performanceMonitor = new MockPerformanceMonitor();
    
    // Load the actual BigDataOptimizationManager
    if (typeof require !== 'undefined') {
      const BigDataOptimizationManager = require('../js/big-data-optimization.js');
      optimizationManager = new BigDataOptimizationManager(historyManager, performanceMonitor);
    } else if (typeof window !== 'undefined' && window.BigDataOptimizationManager) {
      optimizationManager = new window.BigDataOptimizationManager(historyManager, performanceMonitor);
    } else {
      throw new Error('BigDataOptimizationManager not available');
    }
  });
  
  afterEach(() => {
    if (optimizationManager) {
      optimizationManager.destroy();
    }
  });
  
  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(optimizationManager.config.maxMemoryPositions).toBe(50);
      expect(optimizationManager.config.virtualWindowSize).toBe(20);
      expect(optimizationManager.config.lazyLoadThreshold).toBe(100);
      expect(optimizationManager.config.compressionEnabled).toBe(true);
      expect(optimizationManager.config.indexingEnabled).toBe(true);
    });
    
    test('should initialize memory cache', () => {
      expect(optimizationManager.memoryCache).toBeDefined();
      expect(optimizationManager.memoryCache.size).toBe(0);
    });
    
    test('should initialize virtual state', () => {
      expect(optimizationManager.virtualState.startIndex).toBe(0);
      expect(optimizationManager.virtualState.endIndex).toBe(20);
      expect(optimizationManager.virtualState.itemHeight).toBe(60);
    });
  });
  
  describe('Memory Management', () => {
    test('should add positions to memory cache', () => {
      const position = createTestPosition();
      const metadata = { name: 'Test Position' };
      
      optimizationManager.addToMemoryCache(position, metadata);
      
      expect(optimizationManager.memoryCache.size).toBe(1);
    });
    
    test('should retrieve positions from memory cache', () => {
      const position = createTestPosition();
      const metadata = { name: 'Test Position' };
      
      optimizationManager.addToMemoryCache(position, metadata);
      const positionId = optimizationManager.generatePositionId(position);
      const cached = optimizationManager.getFromMemoryCache(positionId);
      
      expect(cached).toBeDefined();
      expect(cached.position).toEqual(position);
      expect(cached.metadata).toEqual(metadata);
    });
    
    test('should optimize memory when threshold exceeded', () => {
      // Add positions beyond threshold
      for (let i = 0; i < 60; i++) {
        const position = createRandomPosition();
        optimizationManager.addToMemoryCache(position, { name: `Position ${i}` });
      }
      
      expect(optimizationManager.shouldOptimizeMemory()).toBe(true);
      
      optimizationManager.optimizeMemory();
      
      expect(optimizationManager.memoryCache.size).toBeLessThanOrEqual(50);
    });
    
    test('should evict LRU items when cache is full', () => {
      const positions = [];
      
      // Fill cache beyond capacity
      for (let i = 0; i < 60; i++) {
        const position = createRandomPosition();
        positions.push(position);
        optimizationManager.addToMemoryCache(position, { name: `Position ${i}` });
      }
      
      optimizationManager.evictLRUItems();
      
      expect(optimizationManager.memoryCache.size).toBeLessThanOrEqual(50);
    });
  });
  
  describe('Compression System', () => {
    test('should compress positions when enabled', () => {
      const position = createTestPosition();
      const compressed = optimizationManager.compressor.compress(position);
      
      expect(compressed).toBeDefined();
      expect(compressed.data).toBeDefined();
      expect(compressed.originalSize).toBeGreaterThan(0);
      expect(compressed.compressedSize).toBeGreaterThan(0);
    });
    
    test('should decompress positions correctly', () => {
      const position = createTestPosition();
      const compressed = optimizationManager.compressor.compress(position);
      const decompressed = optimizationManager.compressor.decompress(compressed);
      
      expect(decompressed).toEqual(position);
    });
    
    test('should achieve compression ratio', () => {
      const position = Array(5).fill().map(() => Array(4).fill(null)); // Mostly empty
      const compressed = optimizationManager.compressor.compress(position);
      
      expect(compressed.compressedSize).toBeLessThan(compressed.originalSize);
    });
    
    test('should handle compression round-trip for multiple positions', () => {
      const positions = [];
      for (let i = 0; i < 10; i++) {
        positions.push(createRandomPosition());
      }
      
      positions.forEach(position => {
        const compressed = optimizationManager.compressor.compress(position);
        const decompressed = optimizationManager.compressor.decompress(compressed);
        expect(decompressed).toEqual(position);
      });
    });
  });
  
  describe('Lazy Loading', () => {
    beforeEach(async () => {
      // Add test positions to history
      for (let i = 0; i < 20; i++) {
        const position = createRandomPosition();
        historyManager.addPosition(position, { name: `Position ${i}` });
      }
    });
    
    test('should load position range', async () => {
      const positions = await optimizationManager.loadPositionRange(0, 5);
      
      expect(positions).toBeDefined();
      expect(positions.length).toBeGreaterThan(0);
    });
    
    test('should load position at specific index', async () => {
      const position = await optimizationManager.loadPositionAtIndex(5);
      
      expect(position).toBeDefined();
      expect(position.position).toBeDefined();
    });
    
    test('should preload adjacent positions', async () => {
      const positions = await optimizationManager.preloadAdjacentPositions(10, 3);
      
      expect(positions).toBeDefined();
      expect(Array.isArray(positions)).toBe(true);
    });
    
    test('should track loaded ranges', async () => {
      await optimizationManager.loadPositionRange(5, 10);
      
      expect(optimizationManager.isRangeLoaded(5, 10)).toBe(true);
      expect(optimizationManager.isRangeLoaded(15, 20)).toBe(false);
    });
    
    test('should handle batch loading', async () => {
      const batch = await optimizationManager.loadPositionBatch(0, 5);
      
      expect(batch).toBeDefined();
      expect(Array.isArray(batch)).toBe(true);
      expect(batch.length).toBeGreaterThan(0);
    });
  });
  
  describe('Virtualization', () => {
    test('should calculate visible range correctly', () => {
      const { startIndex, endIndex } = optimizationManager.virtualizer.calculateVisibleRange(
        120, // scrollTop
        400, // containerHeight
        60   // itemHeight
      );
      
      expect(startIndex).toBe(2); // Math.floor(120/60)
      expect(endIndex).toBeGreaterThan(startIndex);
    });
    
    test('should generate item styles for virtual positioning', () => {
      const style = optimizationManager.virtualizer.getItemStyle(5);
      
      expect(style.position).toBe('absolute');
      expect(style.top).toBe('300px'); // 5 * 60px
      expect(style.height).toBe('60px');
    });
    
    test('should calculate total height', () => {
      // Add some positions
      for (let i = 0; i < 10; i++) {
        historyManager.addPosition(createRandomPosition());
      }
      
      const totalHeight = optimizationManager.virtualizer.getTotalHeight();
      expect(totalHeight).toBe(600); // 10 * 60px
    });
    
    test('should update visible range on scroll', () => {
      optimizationManager.virtualizer.updateVisibleRange(240);
      
      expect(optimizationManager.virtualState.scrollTop).toBe(240);
      expect(optimizationManager.virtualState.startIndex).toBe(4);
    });
  });
  
  describe('Indexing and Search', () => {
    beforeEach(() => {
      // Add positions with metadata for searching
      const testData = [
        { position: createRandomPosition(), metadata: { name: 'Opening Position', tags: ['opening', 'test'] } },
        { position: createRandomPosition(), metadata: { name: 'Middlegame Position', tags: ['middlegame', 'tactical'] } },
        { position: createRandomPosition(), metadata: { name: 'Endgame Position', tags: ['endgame', 'study'] } }
      ];
      
      testData.forEach(({ position, metadata }) => {
        const id = optimizationManager.generatePositionId(position);
        optimizationManager.updatePositionIndex(id, position, metadata);
      });
    });
    
    test('should build position index', () => {
      optimizationManager.buildPositionIndex();
      expect(optimizationManager.indexCache.size).toBeGreaterThan(0);
    });
    
    test('should search positions by query', () => {
      const results = optimizationManager.indexer.searchPositions('opening');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].relevance).toBeGreaterThan(0);
    });
    
    test('should find similar positions', () => {
      const targetPosition = createRandomPosition();
      const results = optimizationManager.indexer.findSimilarPositions(targetPosition, 0.5);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
    
    test('should calculate position similarity', () => {
      const pieces1 = { 'K': 1, 'Q': 1, 'P': 4 };
      const pieces2 = { 'K': 1, 'Q': 1, 'P': 3, 'R': 1 };
      
      const similarity = optimizationManager.calculatePositionSimilarity(pieces1, pieces2);
      
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Garbage Collection', () => {
    test('should run garbage collection', () => {
      const initialGcRuns = optimizationManager.metrics.gcRuns;
      
      optimizationManager.runGarbageCollection();
      
      expect(optimizationManager.metrics.gcRuns).toBe(initialGcRuns + 1);
      expect(optimizationManager.metrics.lastGcTime).toBeGreaterThan(0);
    });
    
    test('should clean up expired cache entries', () => {
      // Add cache entry with old timestamp
      const position = createTestPosition();
      optimizationManager.addToMemoryCache(position, {});
      
      // Manually set old timestamp
      const positionId = optimizationManager.generatePositionId(position);
      const cached = optimizationManager.memoryCache.get(positionId);
      if (cached) {
        cached.lastAccessed = Date.now() - (31 * 60 * 1000); // 31 minutes ago
      }
      
      optimizationManager.cleanupExpiredCache();
      
      expect(optimizationManager.memoryCache.has(positionId)).toBe(false);
    });
    
    test('should clean up loaded ranges', () => {
      // Add many loaded ranges
      for (let i = 0; i < 15; i++) {
        optimizationManager.lazyLoadState.loadedRanges.push({
          startIndex: i * 10,
          endIndex: (i + 1) * 10
        });
      }
      
      optimizationManager.cleanupLoadedRanges();
      
      expect(optimizationManager.lazyLoadState.loadedRanges.length).toBeLessThanOrEqual(10);
    });
  });
  
  describe('Performance Metrics', () => {
    test('should track cache hit rate', () => {
      const position = createTestPosition();
      const positionId = optimizationManager.generatePositionId(position);
      
      // Add to cache
      optimizationManager.addToMemoryCache(position, {});
      
      // Access multiple times
      optimizationManager.getFromMemoryCache(positionId);
      optimizationManager.getFromMemoryCache(positionId);
      optimizationManager.getFromMemoryCache('nonexistent');
      
      optimizationManager.updateMemoryMetrics();
      
      expect(optimizationManager.metrics.cacheHitRate).toBeGreaterThan(0);
      expect(optimizationManager.metrics.cacheHitRate).toBeLessThanOrEqual(1);
    });
    
    test('should calculate memory usage', () => {
      const position = createTestPosition();
      optimizationManager.addToMemoryCache(position, { name: 'Test' });
      
      const memoryUsage = optimizationManager.calculateMemoryUsage();
      
      expect(memoryUsage).toBeGreaterThan(0);
    });
    
    test('should provide optimization statistics', () => {
      const stats = optimizationManager.getOptimizationStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.cacheSize).toBeDefined();
      expect(stats.indexSize).toBeDefined();
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.config).toBeDefined();
    });
  });
  
  describe('Configuration Management', () => {
    test('should update configuration', () => {
      const newConfig = {
        maxMemoryPositions: 100,
        compressionEnabled: false
      };
      
      optimizationManager.updateConfiguration(newConfig);
      
      expect(optimizationManager.config.maxMemoryPositions).toBe(100);
      expect(optimizationManager.config.compressionEnabled).toBe(false);
    });
    
    test('should maintain other config values when updating', () => {
      const originalVirtualWindowSize = optimizationManager.config.virtualWindowSize;
      
      optimizationManager.updateConfiguration({ maxMemoryPositions: 75 });
      
      expect(optimizationManager.config.virtualWindowSize).toBe(originalVirtualWindowSize);
      expect(optimizationManager.config.maxMemoryPositions).toBe(75);
    });
  });
  
  describe('Integration with History Manager', () => {
    test('should handle position added events', () => {
      const position = createTestPosition();
      const metadata = { name: 'Test Position' };
      
      historyManager.addPosition(position, metadata);
      
      // Should be added to optimization manager's cache
      expect(optimizationManager.memoryCache.size).toBeGreaterThan(0);
    });
    
    test('should provide virtual list data', () => {
      // Add some positions
      for (let i = 0; i < 10; i++) {
        historyManager.addPosition(createRandomPosition(), { name: `Position ${i}` });
      }
      
      const virtualData = optimizationManager.getVirtualListData();
      
      expect(virtualData).toBeDefined();
      expect(virtualData.startIndex).toBeDefined();
      expect(virtualData.endIndex).toBeDefined();
      expect(virtualData.totalHeight).toBeDefined();
    });
  });
  
  describe('Error Handling', () => {
    test('should handle compression errors gracefully', () => {
      // Test with invalid data
      const result = optimizationManager.compressor.decompress('invalid-data');
      
      expect(result).toBeNull();
    });
    
    test('should handle search errors gracefully', () => {
      // Test search with empty index
      optimizationManager.indexCache.clear();
      const results = optimizationManager.indexer.searchPositions('test');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
    
    test('should handle invalid position index gracefully', async () => {
      const position = await optimizationManager.loadPositionAtIndex(-1);
      
      expect(position).toBeNull();
    });
  });
  
  describe('Cleanup and Destruction', () => {
    test('should clear all caches', () => {
      // Add some data
      optimizationManager.addToMemoryCache(createTestPosition(), {});
      optimizationManager.updatePositionIndex('test', createTestPosition(), {});
      
      optimizationManager.clearCaches();
      
      expect(optimizationManager.memoryCache.size).toBe(0);
      expect(optimizationManager.indexCache.size).toBe(0);
    });
    
    test('should destroy properly', () => {
      const gcTimer = optimizationManager.gcTimer;
      
      optimizationManager.destroy();
      
      expect(optimizationManager.memoryCache.size).toBe(0);
      expect(optimizationManager.indexCache.size).toBe(0);
    });
  });
});

// Property-Based Tests for Big Data Optimization
describe('Big Data Optimization Property Tests', () => {
  let historyManager;
  let performanceMonitor;
  let optimizationManager;
  
  beforeEach(() => {
    historyManager = new MockHistoryManager();
    performanceMonitor = new MockPerformanceMonitor();
    
    if (typeof require !== 'undefined') {
      const BigDataOptimizationManager = require('../js/big-data-optimization.js');
      optimizationManager = new BigDataOptimizationManager(historyManager, performanceMonitor);
    } else if (typeof window !== 'undefined' && window.BigDataOptimizationManager) {
      optimizationManager = new window.BigDataOptimizationManager(historyManager, performanceMonitor);
    }
  });
  
  afterEach(() => {
    if (optimizationManager) {
      optimizationManager.destroy();
    }
  });
  
  /**
   * Property 28: Büyük Geçmiş Performansı
   * 100'den fazla pozisyon geçmişi için, sistem performans kaybı olmadan çalışmalıdır
   * **Validates: Requirements 8.5**
   */
  test('Property 28: Büyük Geçmiş Performansı - 100+ positions should not degrade performance', async () => {
    const positionCount = 150;
    const maxOperationTime = 100; // ms
    
    // Generate 150+ positions
    const startTime = performance.now();
    
    for (let i = 0; i < positionCount; i++) {
      const position = createRandomPosition();
      const metadata = { name: `Position ${i}`, description: `Test position ${i}` };
      
      const operationStart = performance.now();
      historyManager.addPosition(position, metadata);
      const operationTime = performance.now() - operationStart;
      
      // Each individual operation should be fast
      expect(operationTime).toBeLessThan(maxOperationTime);
      
      // Yield control occasionally to prevent blocking
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    
    const totalTime = performance.now() - startTime;
    const averageTimePerPosition = totalTime / positionCount;
    
    // Average time per position should be reasonable
    expect(averageTimePerPosition).toBeLessThan(10); // 10ms per position
    
    // Test virtual list performance with large dataset
    const virtualData = optimizationManager.getVirtualListData();
    expect(virtualData).toBeDefined();
    expect(virtualData.totalHeight).toBe(positionCount * 60); // 60px per item
    
    // Test scrolling performance
    const scrollStart = performance.now();
    await optimizationManager.handleVirtualScroll(5000); // Scroll to middle
    const scrollTime = performance.now() - scrollStart;
    
    expect(scrollTime).toBeLessThan(50); // Scrolling should be fast
    
    // Test memory usage is reasonable
    const stats = optimizationManager.getOptimizationStatistics();
    expect(stats.memoryUsage).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    
    // Test cache efficiency
    expect(stats.cacheHitRate).toBeGreaterThan(0.5); // At least 50% hit rate
  });
  
  test('Property 28: Memory optimization should maintain performance with large datasets', () => {
    // Add positions beyond memory threshold
    for (let i = 0; i < 200; i++) {
      const position = createRandomPosition();
      optimizationManager.addToMemoryCache(position, { name: `Position ${i}` });
    }
    
    // Memory optimization should keep cache size reasonable
    expect(optimizationManager.memoryCache.size).toBeLessThanOrEqual(optimizationManager.config.maxMemoryPositions);
    
    // Performance should remain good
    const startTime = performance.now();
    optimizationManager.optimizeMemory();
    const optimizationTime = performance.now() - startTime;
    
    expect(optimizationTime).toBeLessThan(100); // Optimization should be fast
  });
  
  test('Property 28: Compression should maintain performance with large datasets', () => {
    const positions = [];
    
    // Generate large dataset
    for (let i = 0; i < 100; i++) {
      positions.push(createRandomPosition());
    }
    
    // Test compression performance
    const startTime = performance.now();
    
    positions.forEach(position => {
      const compressed = optimizationManager.compressor.compress(position);
      const decompressed = optimizationManager.compressor.decompress(compressed);
      
      // Verify round-trip correctness
      expect(decompressed).toEqual(position);
    });
    
    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / positions.length;
    
    // Compression should be fast
    expect(averageTime).toBeLessThan(5); // Less than 5ms per position
  });
  
  test('Property 28: Virtual scrolling should handle large datasets efficiently', async () => {
    // Add large dataset
    for (let i = 0; i < 500; i++) {
      historyManager.addPosition(createRandomPosition(), { name: `Position ${i}` });
    }
    
    // Test virtual scrolling at different positions
    const scrollPositions = [0, 1000, 5000, 10000, 15000, 20000];
    
    for (const scrollTop of scrollPositions) {
      const startTime = performance.now();
      
      const virtualData = await optimizationManager.handleVirtualScroll(scrollTop);
      
      const scrollTime = performance.now() - startTime;
      
      // Each scroll operation should be fast
      expect(scrollTime).toBeLessThan(50);
      
      // Virtual data should be valid
      expect(virtualData.startIndex).toBeGreaterThanOrEqual(0);
      expect(virtualData.endIndex).toBeGreaterThan(virtualData.startIndex);
      expect(virtualData.totalHeight).toBe(500 * 60);
    }
  });
  
  test('Property 28: Garbage collection should maintain performance', () => {
    // Fill system with data
    for (let i = 0; i < 300; i++) {
      const position = createRandomPosition();
      optimizationManager.addToMemoryCache(position, { name: `Position ${i}` });
      optimizationManager.updatePositionIndex(`pos_${i}`, position, { name: `Position ${i}` });
    }
    
    // Test garbage collection performance
    const startTime = performance.now();
    optimizationManager.runGarbageCollection();
    const gcTime = performance.now() - startTime;
    
    // Garbage collection should be reasonably fast
    expect(gcTime).toBeLessThan(200);
    
    // Memory usage should be reduced
    const stats = optimizationManager.getOptimizationStatistics();
    expect(stats.cacheSize).toBeLessThanOrEqual(optimizationManager.config.maxMemoryPositions);
  });
});

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MockHistoryManager,
    MockPerformanceMonitor,
    createTestPosition,
    createRandomPosition
  };
}