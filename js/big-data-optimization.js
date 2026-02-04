/**
 * Big Data Optimization System for Enhanced Piece Setup
 * 
 * Handles 100+ position history efficiently with:
 * - Lazy loading and virtualization
 * - Memory management and garbage collection
 * - Performance optimization for large datasets
 * 
 * Requirements: 8.5
 * Task: 9.3 Büyük veri optimizasyonu
 */

class BigDataOptimizationManager {
  constructor(historyManager, performanceMonitor) {
    this.historyManager = historyManager;
    this.performanceMonitor = performanceMonitor;
    
    // Configuration for big data handling
    this.config = {
      maxMemoryPositions: 50,        // Keep only 50 positions in memory
      virtualWindowSize: 20,         // Show 20 items in virtual list
      lazyLoadThreshold: 100,        // Start lazy loading after 100 positions
      gcInterval: 30000,             // Garbage collection every 30 seconds
      compressionEnabled: true,      // Enable position compression
      indexingEnabled: true,         // Enable position indexing for fast search
      batchSize: 10                  // Process positions in batches of 10
    };
    
    // Memory management
    this.memoryCache = new Map();
    this.compressionCache = new Map();
    this.indexCache = new Map();
    
    // Virtual scrolling state
    this.virtualState = {
      startIndex: 0,
      endIndex: this.config.virtualWindowSize,
      scrollTop: 0,
      itemHeight: 60,
      containerHeight: 400
    };
    
    // Lazy loading state
    this.lazyLoadState = {
      isLoading: false,
      loadedRanges: [],
      pendingRequests: new Set()
    };
    
    // Performance tracking
    this.metrics = {
      memoryUsage: 0,
      compressionRatio: 0,
      cacheHitRate: 0,
      totalCacheRequests: 0,
      cacheHits: 0,
      gcRuns: 0,
      lastGcTime: 0
    };
    
    // Initialize optimization system
    this.initialize();
  }
  
  /**
   * Initialize the big data optimization system
   */
  initialize() {
    console.log('🚀 Initializing Big Data Optimization Manager...');
    
    // Setup memory management
    this.setupMemoryManagement();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Setup virtualization
    this.setupVirtualization();
    
    // Setup compression
    this.setupCompression();
    
    // Setup indexing
    this.setupIndexing();
    
    // Start garbage collection timer
    this.startGarbageCollection();
    
    console.log('✨ Big Data Optimization Manager initialized');
  }
  
  /**
   * Setup memory management system
   */
  setupMemoryManagement() {
    // Override history manager's addPosition to use memory management
    const originalAddPosition = this.historyManager.addPosition.bind(this.historyManager);
    
    this.historyManager.addPosition = (position, metadata = {}) => {
      // Check if we need to optimize memory before adding
      if (this.shouldOptimizeMemory()) {
        this.optimizeMemory();
      }
      
      const result = originalAddPosition(position, metadata);
      
      if (result) {
        // Add to memory cache with compression if enabled
        this.addToMemoryCache(position, metadata);
        
        // Update memory metrics
        this.updateMemoryMetrics();
      }
      
      return result;
    };
    
    console.log('💾 Memory management system setup complete');
  }
  
  /**
   * Setup lazy loading system
   */
  setupLazyLoading() {
    // Create lazy loading interface
    this.lazyLoader = {
      loadRange: async (startIndex, endIndex) => {
        return this.loadPositionRange(startIndex, endIndex);
      },
      
      preloadAdjacent: async (currentIndex, windowSize = 5) => {
        return this.preloadAdjacentPositions(currentIndex, windowSize);
      },
      
      isRangeLoaded: (startIndex, endIndex) => {
        return this.isRangeLoaded(startIndex, endIndex);
      }
    };
    
    console.log('⚡ Lazy loading system setup complete');
  }
  
  /**
   * Setup virtualization system
   */
  setupVirtualization() {
    this.virtualizer = {
      calculateVisibleRange: (scrollTop, containerHeight, itemHeight) => {
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + Math.ceil(containerHeight / itemHeight) + 2,
          this.getTotalItemCount()
        );
        
        return { startIndex, endIndex };
      },
      
      getItemStyle: (index) => {
        return {
          position: 'absolute',
          top: `${index * this.virtualState.itemHeight}px`,
          height: `${this.virtualState.itemHeight}px`,
          width: '100%'
        };
      },
      
      getTotalHeight: () => {
        return this.getTotalItemCount() * this.virtualState.itemHeight;
      },
      
      updateVisibleRange: (scrollTop) => {
        const { startIndex, endIndex } = this.virtualizer.calculateVisibleRange(
          scrollTop,
          this.virtualState.containerHeight,
          this.virtualState.itemHeight
        );
        
        this.virtualState.startIndex = startIndex;
        this.virtualState.endIndex = endIndex;
        this.virtualState.scrollTop = scrollTop;
        
        // Trigger lazy loading for visible range
        this.ensureRangeLoaded(startIndex, endIndex);
      }
    };
    
    console.log('📱 Virtualization system setup complete');
  }
  
  /**
   * Setup compression system
   */
  setupCompression() {
    if (!this.config.compressionEnabled) {
      console.log('🗜️ Compression disabled');
      return;
    }
    
    this.compressor = {
      compress: (position) => {
        return this.compressPosition(position);
      },
      
      decompress: (compressedData) => {
        return this.decompressPosition(compressedData);
      },
      
      getCompressionRatio: () => {
        return this.metrics.compressionRatio;
      }
    };
    
    console.log('🗜️ Compression system setup complete');
  }
  
  /**
   * Setup indexing system for fast search
   */
  setupIndexing() {
    if (!this.config.indexingEnabled) {
      console.log('🔍 Indexing disabled');
      return;
    }
    
    this.indexer = {
      buildIndex: () => {
        return this.buildPositionIndex();
      },
      
      searchPositions: (query) => {
        return this.searchPositions(query);
      },
      
      findSimilarPositions: (position, threshold = 0.8) => {
        return this.findSimilarPositions(position, threshold);
      }
    };
    
    // Build initial index
    this.buildPositionIndex();
    
    console.log('🔍 Indexing system setup complete');
  }
  
  /**
   * Start garbage collection timer
   */
  startGarbageCollection() {
    this.gcTimer = setInterval(() => {
      this.runGarbageCollection();
    }, this.config.gcInterval);
    
    console.log(`🗑️ Garbage collection scheduled every ${this.config.gcInterval}ms`);
  }
  
  /**
   * Check if memory optimization is needed
   */
  shouldOptimizeMemory() {
    const memoryUsage = this.calculateMemoryUsage();
    const maxMemory = this.config.maxMemoryPositions * 1000; // Approximate bytes per position
    
    return memoryUsage > maxMemory || this.memoryCache.size > this.config.maxMemoryPositions;
  }
  
  /**
   * Optimize memory usage
   */
  optimizeMemory() {
    const startTime = performance.now();
    
    console.log('🧹 Starting memory optimization...');
    
    // Remove least recently used items from cache
    this.evictLRUItems();
    
    // Compress old positions
    this.compressOldPositions();
    
    // Clean up unused indexes
    this.cleanupIndexes();
    
    // Update metrics
    this.metrics.memoryUsage = this.calculateMemoryUsage();
    
    const duration = performance.now() - startTime;
    console.log(`✨ Memory optimization completed in ${duration.toFixed(2)}ms`);
    
    // Track performance if monitor is available
    if (this.performanceMonitor) {
      this.performanceMonitor.endMeasurement('memory-optimization', {
        memoryUsage: this.metrics.memoryUsage,
        cacheSize: this.memoryCache.size
      });
    }
  }
  
  /**
   * Add position to memory cache
   */
  addToMemoryCache(position, metadata) {
    const positionId = this.generatePositionId(position);
    const timestamp = Date.now();
    
    // Compress position if enabled
    const data = this.config.compressionEnabled ? 
      this.compressor.compress(position) : position;
    
    this.memoryCache.set(positionId, {
      data,
      metadata,
      timestamp,
      accessCount: 1,
      lastAccessed: timestamp,
      compressed: this.config.compressionEnabled
    });
    
    // Update index if enabled
    if (this.config.indexingEnabled) {
      this.updatePositionIndex(positionId, position, metadata);
    }
  }
  
  /**
   * Get position from memory cache
   */
  getFromMemoryCache(positionId) {
    this.metrics.totalCacheRequests++;
    
    const cached = this.memoryCache.get(positionId);
    if (cached) {
      this.metrics.cacheHits++;
      
      // Update access statistics
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      
      // Decompress if needed
      const position = cached.compressed ? 
        this.compressor.decompress(cached.data) : cached.data;
      
      return {
        position,
        metadata: cached.metadata
      };
    }
    
    return null;
  }
  
  /**
   * Load position range with lazy loading
   */
  async loadPositionRange(startIndex, endIndex) {
    if (this.lazyLoadState.isLoading) {
      return [];
    }
    
    const requestId = `${startIndex}-${endIndex}`;
    if (this.lazyLoadState.pendingRequests.has(requestId)) {
      return [];
    }
    
    this.lazyLoadState.isLoading = true;
    this.lazyLoadState.pendingRequests.add(requestId);
    
    try {
      const positions = [];
      const batchSize = this.config.batchSize;
      
      // Process in batches to avoid blocking UI
      for (let i = startIndex; i < endIndex; i += batchSize) {
        const batchEnd = Math.min(i + batchSize, endIndex);
        const batch = await this.loadPositionBatch(i, batchEnd);
        positions.push(...batch);
        
        // Yield control to prevent blocking
        await this.yieldControl();
      }
      
      // Mark range as loaded
      this.lazyLoadState.loadedRanges.push({ startIndex, endIndex });
      
      return positions;
      
    } finally {
      this.lazyLoadState.isLoading = false;
      this.lazyLoadState.pendingRequests.delete(requestId);
    }
  }
  
  /**
   * Load a batch of positions
   */
  async loadPositionBatch(startIndex, endIndex) {
    const positions = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const position = await this.loadPositionAtIndex(i);
      if (position) {
        positions.push(position);
      }
    }
    
    return positions;
  }
  
  /**
   * Load position at specific index
   */
  async loadPositionAtIndex(index) {
    // Try to get from history manager first
    const historyList = this.historyManager.getHistoryList();
    
    if (index < historyList.length) {
      const entry = historyList[index];
      
      // Check memory cache first
      const cached = this.getFromMemoryCache(entry.id);
      if (cached) {
        return {
          ...entry,
          position: cached.position,
          metadata: cached.metadata
        };
      }
      
      // Load from storage if not in cache
      return entry;
    }
    
    return null;
  }
  
  /**
   * Preload adjacent positions for smooth scrolling
   */
  async preloadAdjacentPositions(currentIndex, windowSize) {
    const startIndex = Math.max(0, currentIndex - windowSize);
    const endIndex = Math.min(
      this.getTotalItemCount(),
      currentIndex + windowSize
    );
    
    // Load positions that aren't already loaded
    const promises = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.isPositionLoaded(i)) {
        promises.push(this.loadPositionAtIndex(i));
      }
    }
    
    return Promise.all(promises);
  }
  
  /**
   * Check if range is loaded
   */
  isRangeLoaded(startIndex, endIndex) {
    return this.lazyLoadState.loadedRanges.some(range => 
      range.startIndex <= startIndex && range.endIndex >= endIndex
    );
  }
  
  /**
   * Check if position is loaded
   */
  isPositionLoaded(index) {
    return this.lazyLoadState.loadedRanges.some(range => 
      index >= range.startIndex && index < range.endIndex
    );
  }
  
  /**
   * Ensure range is loaded
   */
  async ensureRangeLoaded(startIndex, endIndex) {
    if (!this.isRangeLoaded(startIndex, endIndex)) {
      return this.loadPositionRange(startIndex, endIndex);
    }
    return [];
  }
  
  /**
   * Compress position data
   */
  compressPosition(position) {
    try {
      // Simple compression: convert to string and use basic encoding
      const positionString = JSON.stringify(position);
      
      // Use a simple run-length encoding for repeated null values
      const compressed = positionString
        .replace(/null,null,null,null/g, 'N4')
        .replace(/null,null,null/g, 'N3')
        .replace(/null,null/g, 'N2')
        .replace(/null/g, 'N');
      
      // Calculate compression ratio
      const originalSize = positionString.length;
      const compressedSize = compressed.length;
      this.metrics.compressionRatio = compressedSize / originalSize;
      
      return {
        data: compressed,
        originalSize,
        compressedSize,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.warn('Failed to compress position:', error);
      return { data: JSON.stringify(position), originalSize: 0, compressedSize: 0 };
    }
  }
  
  /**
   * Decompress position data
   */
  decompressPosition(compressedData) {
    try {
      if (typeof compressedData === 'string') {
        // Legacy uncompressed data
        return JSON.parse(compressedData);
      }
      
      // Decompress the data
      const decompressed = compressedData.data
        .replace(/N4/g, 'null,null,null,null')
        .replace(/N3/g, 'null,null,null')
        .replace(/N2/g, 'null,null')
        .replace(/N/g, 'null');
      
      return JSON.parse(decompressed);
      
    } catch (error) {
      console.warn('Failed to decompress position:', error);
      return null;
    }
  }
  
  /**
   * Build position index for fast search
   */
  buildPositionIndex() {
    console.log('🔍 Building position index...');
    
    const startTime = performance.now();
    const historyList = this.historyManager.getHistoryList();
    
    this.indexCache.clear();
    
    historyList.forEach((entry, index) => {
      this.updatePositionIndex(entry.id, entry.position, entry.metadata || {});
    });
    
    const duration = performance.now() - startTime;
    console.log(`✨ Position index built in ${duration.toFixed(2)}ms`);
  }
  
  /**
   * Update position index
   */
  updatePositionIndex(positionId, position, metadata) {
    // Create searchable text from position and metadata
    const searchableText = [
      metadata.name || '',
      metadata.description || '',
      ...(metadata.tags || []),
      this.positionToSearchableString(position)
    ].join(' ').toLowerCase();
    
    // Create piece count index
    const pieceCount = this.countPieces(position);
    
    // Store in index
    this.indexCache.set(positionId, {
      searchableText,
      pieceCount,
      metadata,
      timestamp: Date.now()
    });
  }
  
  /**
   * Search positions by query
   */
  searchPositions(query) {
    const searchQuery = query.toLowerCase();
    const results = [];
    
    for (const [positionId, indexData] of this.indexCache) {
      if (indexData.searchableText.includes(searchQuery)) {
        results.push({
          positionId,
          relevance: this.calculateRelevance(searchQuery, indexData.searchableText),
          metadata: indexData.metadata,
          pieceCount: indexData.pieceCount
        });
      }
    }
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  }
  
  /**
   * Find similar positions
   */
  findSimilarPositions(targetPosition, threshold = 0.8) {
    const targetPieceCount = this.countPieces(targetPosition);
    const results = [];
    
    for (const [positionId, indexData] of this.indexCache) {
      const similarity = this.calculatePositionSimilarity(
        targetPieceCount,
        indexData.pieceCount
      );
      
      if (similarity >= threshold) {
        results.push({
          positionId,
          similarity,
          metadata: indexData.metadata,
          pieceCount: indexData.pieceCount
        });
      }
    }
    
    return results.sort((a, b) => b.similarity - a.similarity);
  }
  
  /**
   * Run garbage collection
   */
  runGarbageCollection() {
    const startTime = performance.now();
    
    console.log('🗑️ Running garbage collection...');
    
    // Clean up expired cache entries
    this.cleanupExpiredCache();
    
    // Clean up loaded ranges that are no longer needed
    this.cleanupLoadedRanges();
    
    // Clean up pending requests
    this.cleanupPendingRequests();
    
    // Update metrics
    this.metrics.gcRuns++;
    this.metrics.lastGcTime = Date.now();
    
    const duration = performance.now() - startTime;
    console.log(`✨ Garbage collection completed in ${duration.toFixed(2)}ms`);
  }
  
  /**
   * Evict least recently used items from cache
   */
  evictLRUItems() {
    const maxItems = this.config.maxMemoryPositions;
    
    if (this.memoryCache.size <= maxItems) {
      return;
    }
    
    // Sort by last accessed time
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest items
    const itemsToRemove = entries.length - maxItems;
    for (let i = 0; i < itemsToRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
    
    console.log(`🧹 Evicted ${itemsToRemove} LRU items from cache`);
  }
  
  /**
   * Compress old positions
   */
  compressOldPositions() {
    if (!this.config.compressionEnabled) {
      return;
    }
    
    const compressionAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    let compressedCount = 0;
    
    for (const [id, cached] of this.memoryCache) {
      if (!cached.compressed && (now - cached.timestamp) > compressionAge) {
        const compressed = this.compressor.compress(cached.data);
        cached.data = compressed;
        cached.compressed = true;
        compressedCount++;
      }
    }
    
    if (compressedCount > 0) {
      console.log(`🗜️ Compressed ${compressedCount} old positions`);
    }
  }
  
  /**
   * Clean up indexes
   */
  cleanupIndexes() {
    // Remove index entries for positions no longer in history
    const historyList = this.historyManager.getHistoryList();
    const activeIds = new Set(historyList.map(entry => entry.id));
    
    let removedCount = 0;
    for (const [id] of this.indexCache) {
      if (!activeIds.has(id)) {
        this.indexCache.delete(id);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🔍 Cleaned up ${removedCount} index entries`);
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  cleanupExpiredCache() {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    let removedCount = 0;
    
    for (const [id, cached] of this.memoryCache) {
      if ((now - cached.lastAccessed) > maxAge) {
        this.memoryCache.delete(id);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }
  }
  
  /**
   * Clean up loaded ranges
   */
  cleanupLoadedRanges() {
    // Keep only recent loaded ranges
    const maxRanges = 10;
    if (this.lazyLoadState.loadedRanges.length > maxRanges) {
      this.lazyLoadState.loadedRanges = this.lazyLoadState.loadedRanges.slice(-maxRanges);
    }
  }
  
  /**
   * Clean up pending requests
   */
  cleanupPendingRequests() {
    // Clear any stale pending requests
    this.lazyLoadState.pendingRequests.clear();
  }
  
  /**
   * Helper methods
   */
  
  generatePositionId(position) {
    return this.historyManager.generatePositionId(position);
  }
  
  getTotalItemCount() {
    return this.historyManager.getHistoryStatistics().size;
  }
  
  calculateMemoryUsage() {
    let usage = 0;
    
    // Calculate cache memory usage
    for (const [id, cached] of this.memoryCache) {
      usage += JSON.stringify(cached).length * 2; // Approximate UTF-16 encoding
    }
    
    // Add index memory usage
    for (const [id, indexData] of this.indexCache) {
      usage += JSON.stringify(indexData).length * 2;
    }
    
    return usage;
  }
  
  updateMemoryMetrics() {
    this.metrics.memoryUsage = this.calculateMemoryUsage();
    this.metrics.cacheHitRate = this.metrics.totalCacheRequests > 0 ? 
      this.metrics.cacheHits / this.metrics.totalCacheRequests : 0;
  }
  
  positionToSearchableString(position) {
    return position.flat().filter(piece => piece !== null).join('');
  }
  
  countPieces(position) {
    const count = {};
    position.flat().forEach(piece => {
      if (piece) {
        count[piece] = (count[piece] || 0) + 1;
      }
    });
    return count;
  }
  
  calculateRelevance(query, text) {
    const queryWords = query.split(' ').filter(word => word.length > 0);
    let relevance = 0;
    
    queryWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = text.match(regex);
      if (matches) {
        relevance += matches.length;
      }
    });
    
    return relevance;
  }
  
  calculatePositionSimilarity(pieces1, pieces2) {
    const allPieces = new Set([...Object.keys(pieces1), ...Object.keys(pieces2)]);
    let similarity = 0;
    let totalPieces = 0;
    
    for (const piece of allPieces) {
      const count1 = pieces1[piece] || 0;
      const count2 = pieces2[piece] || 0;
      similarity += Math.min(count1, count2);
      totalPieces += Math.max(count1, count2);
    }
    
    return totalPieces > 0 ? similarity / totalPieces : 0;
  }
  
  async yieldControl() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
  
  /**
   * Public API methods
   */
  
  /**
   * Get virtual list data for UI rendering
   */
  getVirtualListData() {
    const { startIndex, endIndex } = this.virtualState;
    const totalHeight = this.virtualizer.getTotalHeight();
    
    return {
      startIndex,
      endIndex,
      totalHeight,
      itemHeight: this.virtualState.itemHeight,
      visibleItems: this.getVisibleItems(startIndex, endIndex)
    };
  }
  
  /**
   * Get visible items for current virtual window
   */
  async getVisibleItems(startIndex, endIndex) {
    // Ensure range is loaded
    await this.ensureRangeLoaded(startIndex, endIndex);
    
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      const item = await this.loadPositionAtIndex(i);
      if (item) {
        items.push({
          ...item,
          virtualIndex: i,
          style: this.virtualizer.getItemStyle(i)
        });
      }
    }
    
    return items;
  }
  
  /**
   * Handle virtual scroll event
   */
  async handleVirtualScroll(scrollTop) {
    this.virtualizer.updateVisibleRange(scrollTop);
    
    // Preload adjacent items for smooth scrolling
    const currentIndex = Math.floor(scrollTop / this.virtualState.itemHeight);
    await this.preloadAdjacentPositions(currentIndex, 5);
    
    return this.getVirtualListData();
  }
  
  /**
   * Get optimization statistics
   */
  getOptimizationStatistics() {
    return {
      ...this.metrics,
      cacheSize: this.memoryCache.size,
      indexSize: this.indexCache.size,
      loadedRanges: this.lazyLoadState.loadedRanges.length,
      pendingRequests: this.lazyLoadState.pendingRequests.size,
      virtualState: { ...this.virtualState },
      config: { ...this.config }
    };
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration updated:', newConfig);
  }
  
  /**
   * Force garbage collection
   */
  forceGarbageCollection() {
    this.runGarbageCollection();
  }
  
  /**
   * Clear all caches
   */
  clearCaches() {
    this.memoryCache.clear();
    this.compressionCache.clear();
    this.indexCache.clear();
    this.lazyLoadState.loadedRanges = [];
    this.lazyLoadState.pendingRequests.clear();
    
    console.log('🧹 All caches cleared');
  }
  
  /**
   * Cleanup and destroy
   */
  destroy() {
    // Clear garbage collection timer
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    
    // Clear all caches
    this.clearCaches();
    
    console.log('🗑️ Big Data Optimization Manager destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BigDataOptimizationManager;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BigDataOptimizationManager = BigDataOptimizationManager;
}