/**
 * Big Data Integration Module
 * 
 * Integrates BigDataOptimizationManager with existing systems
 * Provides seamless upgrade path for handling 100+ positions
 * 
 * Requirements: 8.5
 * Task: 9.3 Büyük veri optimizasyonu
 */

class BigDataIntegration {
  constructor() {
    this.isInitialized = false;
    this.optimizationManager = null;
    this.virtualList = null;
    this.performanceMonitor = null;
    this.historyManager = null;
    
    // Configuration
    this.config = {
      enableOptimization: true,
      optimizationThreshold: 50,  // Enable optimization after 50 positions
      autoUpgrade: true,          // Automatically upgrade when threshold is reached
      virtualListEnabled: true,   // Enable virtual list UI
      compressionEnabled: true,   // Enable position compression
      indexingEnabled: true       // Enable search indexing
    };
    
    // State tracking
    this.state = {
      isOptimized: false,
      positionCount: 0,
      lastOptimizationCheck: 0,
      performanceMetrics: {
        averageOperationTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0
      }
    };
    
    // Event handlers
    this.handlers = {
      positionAdded: this.handlePositionAdded.bind(this),
      positionChanged: this.handlePositionChanged.bind(this),
      historyCleared: this.handleHistoryCleared.bind(this),
      performanceIssue: this.handlePerformanceIssue.bind(this)
    };
  }
  
  /**
   * Initialize big data integration
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('Big Data Integration already initialized');
      return;
    }
    
    console.log('🚀 Initializing Big Data Integration...');
    
    try {
      // Find existing managers
      await this.findExistingManagers();
      
      // Check if optimization is needed
      await this.checkOptimizationNeed();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize optimization if needed
      if (this.shouldEnableOptimization()) {
        await this.enableOptimization();
      }
      
      this.isInitialized = true;
      console.log('✨ Big Data Integration initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Big Data Integration:', error);
      throw error;
    }
  }
  
  /**
   * Find existing managers in the system
   */
  async findExistingManagers() {
    // Find history manager
    if (typeof window !== 'undefined') {
      // Check global instances
      this.historyManager = window.positionHistoryManager || 
                           window.historyManager ||
                           this.findHistoryManagerInstance();
      
      this.performanceMonitor = window.performanceMonitor ||
                               window.PerformanceMonitor ||
                               this.findPerformanceMonitorInstance();
    }
    
    if (!this.historyManager) {
      console.warn('⚠️ Position History Manager not found, creating new instance');
      this.historyManager = new PositionHistoryManager();
    }
    
    if (!this.performanceMonitor) {
      console.warn('⚠️ Performance Monitor not found, creating new instance');
      this.performanceMonitor = new PerformanceMonitor();
    }
    
    console.log('📋 Found existing managers:', {
      historyManager: !!this.historyManager,
      performanceMonitor: !!this.performanceMonitor
    });
  }
  
  /**
   * Find history manager instance
   */
  findHistoryManagerInstance() {
    // Look for history manager in common locations
    const possibleLocations = [
      'pieceSetupModal.historyManager',
      'enhancedPieceSetup.historyManager',
      'game.historyManager'
    ];
    
    for (const location of possibleLocations) {
      const manager = this.getNestedProperty(window, location);
      if (manager && typeof manager.addPosition === 'function') {
        console.log(`📍 Found history manager at: ${location}`);
        return manager;
      }
    }
    
    return null;
  }
  
  /**
   * Find performance monitor instance
   */
  findPerformanceMonitorInstance() {
    // Look for performance monitor in common locations
    const possibleLocations = [
      'pieceSetupModal.performanceMonitor',
      'enhancedPieceSetup.performanceMonitor',
      'game.performanceMonitor'
    ];
    
    for (const location of possibleLocations) {
      const monitor = this.getNestedProperty(window, location);
      if (monitor && typeof monitor.startMeasurement === 'function') {
        console.log(`📍 Found performance monitor at: ${location}`);
        return monitor;
      }
    }
    
    return null;
  }
  
  /**
   * Get nested property from object
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
  
  /**
   * Check if optimization is needed
   */
  async checkOptimizationNeed() {
    if (!this.historyManager) {
      return false;
    }
    
    const stats = this.historyManager.getHistoryStatistics();
    this.state.positionCount = stats.size;
    
    console.log(`📊 Current position count: ${this.state.positionCount}`);
    
    // Check performance metrics
    if (this.performanceMonitor) {
      const perfStats = this.performanceMonitor.getStatistics();
      this.state.performanceMetrics = {
        averageOperationTime: perfStats.averageAnalysisTime || 0,
        memoryUsage: this.calculateMemoryUsage(),
        cacheHitRate: 0
      };
    }
    
    return this.shouldEnableOptimization();
  }
  
  /**
   * Check if optimization should be enabled
   */
  shouldEnableOptimization() {
    if (!this.config.enableOptimization) {
      return false;
    }
    
    // Check position count threshold
    if (this.state.positionCount >= this.config.optimizationThreshold) {
      console.log(`🎯 Position count (${this.state.positionCount}) exceeds threshold (${this.config.optimizationThreshold})`);
      return true;
    }
    
    // Check performance issues
    if (this.state.performanceMetrics.averageOperationTime > 100) {
      console.log(`🐌 Performance issues detected (${this.state.performanceMetrics.averageOperationTime}ms avg)`);
      return true;
    }
    
    // Check memory usage
    if (this.state.performanceMetrics.memoryUsage > 1000000) { // 1MB
      console.log(`💾 High memory usage detected (${this.state.performanceMetrics.memoryUsage} bytes)`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Enable big data optimization
   */
  async enableOptimization() {
    if (this.state.isOptimized) {
      console.log('✅ Optimization already enabled');
      return;
    }
    
    console.log('🚀 Enabling big data optimization...');
    
    try {
      // Create optimization manager
      this.optimizationManager = new BigDataOptimizationManager(
        this.historyManager,
        this.performanceMonitor
      );
      
      // Update configuration
      this.optimizationManager.updateConfiguration({
        compressionEnabled: this.config.compressionEnabled,
        indexingEnabled: this.config.indexingEnabled
      });
      
      // Create virtual list if UI container exists
      if (this.config.virtualListEnabled) {
        await this.createVirtualList();
      }
      
      // Hook into existing UI
      this.hookIntoExistingUI();
      
      this.state.isOptimized = true;
      
      console.log('✨ Big data optimization enabled successfully');
      
      // Emit optimization enabled event
      this.emitEvent('optimizationEnabled', {
        positionCount: this.state.positionCount,
        optimizationManager: this.optimizationManager
      });
      
    } catch (error) {
      console.error('❌ Failed to enable optimization:', error);
      throw error;
    }
  }
  
  /**
   * Create virtual list UI
   */
  async createVirtualList() {
    // Find history list container
    const container = this.findHistoryListContainer();
    
    if (!container) {
      console.warn('⚠️ History list container not found, virtual list disabled');
      return;
    }
    
    console.log('📱 Creating virtual history list...');
    
    // Create virtual list
    this.virtualList = new VirtualHistoryList(container, this.optimizationManager, {
      itemHeight: 60,
      containerHeight: container.clientHeight || 400,
      loadingIndicator: true
    });
    
    // Setup virtual list event handlers
    this.setupVirtualListEvents();
    
    console.log('✨ Virtual history list created');
  }
  
  /**
   * Find history list container
   */
  findHistoryListContainer() {
    // Common selectors for history list containers
    const selectors = [
      '.history-list-container',
      '.position-history-list',
      '#historyList',
      '.history-panel .list-container',
      '[data-history-list]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`📍 Found history list container: ${selector}`);
        return element;
      }
    }
    
    // Create container if not found
    console.log('🔧 Creating history list container');
    const container = document.createElement('div');
    container.className = 'virtual-history-list-container';
    container.style.height = '400px';
    
    // Try to append to common parent containers
    const parentSelectors = [
      '.history-panel',
      '.piece-setup-modal',
      '#pieceSetupModal .modal-body',
      '.enhanced-piece-setup'
    ];
    
    for (const selector of parentSelectors) {
      const parent = document.querySelector(selector);
      if (parent) {
        parent.appendChild(container);
        console.log(`📍 Created container in: ${selector}`);
        return container;
      }
    }
    
    return null;
  }
  
  /**
   * Setup virtual list event handlers
   */
  setupVirtualListEvents() {
    if (!this.virtualList) return;
    
    // Handle item clicks
    this.virtualList.addEventListener('itemClick', (event) => {
      const { index, positionId } = event.detail;
      console.log(`📱 Virtual list item clicked: ${index} (${positionId})`);
      
      // Jump to position
      if (this.historyManager) {
        this.historyManager.jumpToPosition(index);
      }
    });
    
    // Handle item double-clicks
    this.virtualList.addEventListener('itemDoubleClick', (event) => {
      const { index, positionId } = event.detail;
      console.log(`📱 Virtual list item double-clicked: ${index} (${positionId})`);
      
      // Load position and close modal (if applicable)
      if (this.historyManager) {
        const position = this.historyManager.jumpToPosition(index);
        if (position) {
          this.emitEvent('positionSelected', { position, index, positionId });
        }
      }
    });
  }
  
  /**
   * Hook into existing UI
   */
  hookIntoExistingUI() {
    // Hook into existing history navigation buttons
    this.hookHistoryButtons();
    
    // Hook into existing position display
    this.hookPositionDisplay();
    
    // Hook into existing modal events
    this.hookModalEvents();
  }
  
  /**
   * Hook into history navigation buttons
   */
  hookHistoryButtons() {
    const buttons = {
      undo: document.querySelector('[data-action="undo"], .undo-button, #undoButton'),
      redo: document.querySelector('[data-action="redo"], .redo-button, #redoButton'),
      clear: document.querySelector('[data-action="clear-history"], .clear-history-button')
    };
    
    // Enhance undo button
    if (buttons.undo) {
      const originalClick = buttons.undo.onclick;
      buttons.undo.onclick = (e) => {
        if (this.optimizationManager) {
          // Use optimized undo
          const position = this.historyManager.undo();
          if (position && this.virtualList) {
            this.virtualList.scrollToCurrent();
          }
        } else if (originalClick) {
          originalClick.call(buttons.undo, e);
        }
      };
    }
    
    // Enhance redo button
    if (buttons.redo) {
      const originalClick = buttons.redo.onclick;
      buttons.redo.onclick = (e) => {
        if (this.optimizationManager) {
          // Use optimized redo
          const position = this.historyManager.redo();
          if (position && this.virtualList) {
            this.virtualList.scrollToCurrent();
          }
        } else if (originalClick) {
          originalClick.call(buttons.redo, e);
        }
      };
    }
    
    // Enhance clear button
    if (buttons.clear) {
      const originalClick = buttons.clear.onclick;
      buttons.clear.onclick = (e) => {
        if (this.optimizationManager) {
          // Clear optimized data
          this.optimizationManager.clearCaches();
          if (this.virtualList) {
            this.virtualList.refresh();
          }
        }
        if (originalClick) {
          originalClick.call(buttons.clear, e);
        }
      };
    }
  }
  
  /**
   * Hook into position display updates
   */
  hookPositionDisplay() {
    // This would hook into the main board display to update when positions change
    // Implementation depends on the existing board rendering system
  }
  
  /**
   * Hook into modal events
   */
  hookModalEvents() {
    // Hook into modal open/close events
    const modal = document.querySelector('#pieceSetupModal, .piece-setup-modal');
    if (modal) {
      // Listen for modal show events
      modal.addEventListener('show', () => {
        if (this.virtualList) {
          setTimeout(() => {
            this.virtualList.refresh();
            this.virtualList.scrollToCurrent();
          }, 100);
        }
      });
      
      // Listen for modal hide events
      modal.addEventListener('hide', () => {
        if (this.optimizationManager) {
          // Run garbage collection when modal closes
          this.optimizationManager.forceGarbageCollection();
        }
      });
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.historyManager) {
      this.historyManager.addEventListener('positionAdded', this.handlers.positionAdded);
      this.historyManager.addEventListener('positionChanged', this.handlers.positionChanged);
      this.historyManager.addEventListener('historyCleared', this.handlers.historyCleared);
    }
    
    if (this.performanceMonitor) {
      // Listen for performance issues
      this.performanceMonitor.addEventListener?.('performanceIssue', this.handlers.performanceIssue);
    }
  }
  
  /**
   * Handle position added event
   */
  handlePositionAdded(event) {
    this.state.positionCount++;
    
    // Check if we should enable optimization
    if (!this.state.isOptimized && this.config.autoUpgrade && this.shouldEnableOptimization()) {
      console.log('🎯 Auto-enabling optimization due to position count');
      this.enableOptimization().catch(error => {
        console.error('Failed to auto-enable optimization:', error);
      });
    }
    
    // Update virtual list if available
    if (this.virtualList) {
      this.virtualList.refresh();
    }
  }
  
  /**
   * Handle position changed event
   */
  handlePositionChanged(event) {
    // Update virtual list current position
    if (this.virtualList) {
      this.virtualList.scrollToCurrent();
    }
  }
  
  /**
   * Handle history cleared event
   */
  handleHistoryCleared(event) {
    this.state.positionCount = 0;
    
    // Clear optimization caches
    if (this.optimizationManager) {
      this.optimizationManager.clearCaches();
    }
    
    // Refresh virtual list
    if (this.virtualList) {
      this.virtualList.refresh();
    }
  }
  
  /**
   * Handle performance issue event
   */
  handlePerformanceIssue(event) {
    console.warn('⚠️ Performance issue detected:', event);
    
    // Consider enabling optimization if not already enabled
    if (!this.state.isOptimized && this.config.autoUpgrade) {
      console.log('🎯 Auto-enabling optimization due to performance issue');
      this.enableOptimization().catch(error => {
        console.error('Failed to auto-enable optimization:', error);
      });
    }
  }
  
  /**
   * Calculate memory usage
   */
  calculateMemoryUsage() {
    if (!this.historyManager) return 0;
    
    const stats = this.historyManager.getHistoryStatistics();
    return stats.memoryUsage || 0;
  }
  
  /**
   * Get integration statistics
   */
  getStatistics() {
    const stats = {
      isInitialized: this.isInitialized,
      isOptimized: this.state.isOptimized,
      positionCount: this.state.positionCount,
      config: { ...this.config },
      performanceMetrics: { ...this.state.performanceMetrics }
    };
    
    if (this.optimizationManager) {
      stats.optimization = this.optimizationManager.getOptimizationStatistics();
    }
    
    if (this.virtualList) {
      stats.virtualList = {
        visibleRange: this.virtualList.getVisibleRange(),
        totalHeight: this.virtualList.virtualizer?.getTotalHeight() || 0
      };
    }
    
    return stats;
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.optimizationManager) {
      this.optimizationManager.updateConfiguration(newConfig);
    }
    
    console.log('⚙️ Integration configuration updated:', newConfig);
  }
  
  /**
   * Force optimization enable
   */
  async forceEnableOptimization() {
    if (this.state.isOptimized) {
      console.log('✅ Optimization already enabled');
      return;
    }
    
    console.log('🔧 Force enabling optimization...');
    await this.enableOptimization();
  }
  
  /**
   * Disable optimization
   */
  disableOptimization() {
    if (!this.state.isOptimized) {
      console.log('✅ Optimization already disabled');
      return;
    }
    
    console.log('🔧 Disabling optimization...');
    
    // Destroy optimization manager
    if (this.optimizationManager) {
      this.optimizationManager.destroy();
      this.optimizationManager = null;
    }
    
    // Destroy virtual list
    if (this.virtualList) {
      this.virtualList.destroy();
      this.virtualList = null;
    }
    
    this.state.isOptimized = false;
    
    console.log('✨ Optimization disabled');
    
    // Emit optimization disabled event
    this.emitEvent('optimizationDisabled', {
      positionCount: this.state.positionCount
    });
  }
  
  /**
   * Emit custom event
   */
  emitEvent(eventName, data) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent(`bigDataIntegration:${eventName}`, {
        detail: data
      });
      window.dispatchEvent(event);
    }
  }
  
  /**
   * Cleanup and destroy
   */
  destroy() {
    console.log('🗑️ Destroying Big Data Integration...');
    
    // Remove event listeners
    if (this.historyManager) {
      this.historyManager.removeEventListener('positionAdded', this.handlers.positionAdded);
      this.historyManager.removeEventListener('positionChanged', this.handlers.positionChanged);
      this.historyManager.removeEventListener('historyCleared', this.handlers.historyCleared);
    }
    
    // Disable optimization
    this.disableOptimization();
    
    this.isInitialized = false;
    
    console.log('✨ Big Data Integration destroyed');
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.bigDataIntegration = new BigDataIntegration();
      window.bigDataIntegration.initialize().catch(error => {
        console.error('Failed to initialize Big Data Integration:', error);
      });
    });
  } else {
    // DOM is already ready
    window.bigDataIntegration = new BigDataIntegration();
    window.bigDataIntegration.initialize().catch(error => {
      console.error('Failed to initialize Big Data Integration:', error);
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BigDataIntegration;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BigDataIntegration = BigDataIntegration;
}