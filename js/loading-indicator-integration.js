/**
 * Loading Indicator Integration Utilities
 * 
 * Provides integration between the Loading Indicator System and existing components:
 * - Performance Monitor integration
 * - Easy wrapper functions for common operations
 * - Automatic threshold-based indicator display
 * - Enhanced user feedback
 * 
 * Requirements: 8.4
 */

class LoadingIndicatorIntegration {
  constructor() {
    this.loadingSystem = null;
    this.performanceMonitor = null;
    this.initialized = false;
    
    // Integration configuration
    this.config = {
      autoShowThreshold: 1000,     // Auto-show after 1 second
      performanceIntegration: true, // Integrate with performance monitor
      userFeedback: true,          // Show user feedback messages
      debugMode: false             // Enable debug logging
    };
    
    // Operation tracking
    this.operationMap = new Map(); // Maps performance operation IDs to loading operation IDs
    
    this.initialize();
  }
  
  /**
   * Initialize the integration system
   */
  initialize() {
    if (this.initialized) {
      return;
    }
    
    console.log('🔗 Initializing Loading Indicator Integration...');
    
    // Initialize loading indicator system
    this.loadingSystem = new LoadingIndicatorSystem();
    
    // Get performance monitor if available
    if (typeof window !== 'undefined' && window.PerformanceMonitor) {
      this.performanceMonitor = window.performanceMonitor || new window.PerformanceMonitor();
      this.setupPerformanceIntegration();
    }
    
    // Setup global wrapper functions
    this.setupGlobalWrappers();
    
    this.initialized = true;
    console.log('✨ Loading Indicator Integration initialized successfully');
  }
  
  /**
   * Setup integration with performance monitor
   */
  setupPerformanceIntegration() {
    if (!this.performanceMonitor || !this.config.performanceIntegration) {
      return;
    }
    
    console.log('📊 Setting up Performance Monitor integration...');
    
    // Hook into performance monitor methods
    this.hookPerformanceMonitor();
  }
  
  /**
   * Hook into performance monitor methods
   */
  hookPerformanceMonitor() {
    const originalStartMeasurement = this.performanceMonitor.startMeasurement.bind(this.performanceMonitor);
    const originalEndMeasurement = this.performanceMonitor.endMeasurement.bind(this.performanceMonitor);
    
    // Hook start measurement
    this.performanceMonitor.startMeasurement = (operationType, operationId, metadata = {}) => {
      const result = originalStartMeasurement(operationType, operationId, metadata);
      
      // Start loading indicator if operation might be long
      const estimatedDuration = this.getEstimatedDuration(operationType, metadata);
      if (estimatedDuration >= this.config.autoShowThreshold) {
        const loadingId = this.loadingSystem.startOperation(operationType, {
          label: this.getOperationLabel(operationType, metadata),
          estimatedDuration,
          metadata: { performanceOperationId: operationId, ...metadata }
        });
        
        this.operationMap.set(operationId, loadingId);
        
        if (this.config.debugMode) {
          console.log(`🔗 Linked performance operation ${operationId} to loading operation ${loadingId}`);
        }
      }
      
      return result;
    };
    
    // Hook end measurement
    this.performanceMonitor.endMeasurement = (operationId, additionalData = {}) => {
      const result = originalEndMeasurement(operationId, additionalData);
      
      // Complete loading indicator if exists
      const loadingId = this.operationMap.get(operationId);
      if (loadingId) {
        if (result && result.withinTarget) {
          this.loadingSystem.completeOperation(loadingId, result);
        } else if (result) {
          // Show performance warning but still complete
          this.loadingSystem.updateProgress(loadingId, 100, `⚠️ Completed (${result.duration.toFixed(0)}ms)`);
          setTimeout(() => {
            this.loadingSystem.completeOperation(loadingId, result);
          }, 1000);
        }
        
        this.operationMap.delete(operationId);
      }
      
      return result;
    };
  }
  
  /**
   * Setup global wrapper functions
   */
  setupGlobalWrappers() {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Global loading indicator functions
    window.showLoadingIndicator = this.showLoadingIndicator.bind(this);
    window.hideLoadingIndicator = this.hideLoadingIndicator.bind(this);
    window.updateLoadingProgress = this.updateLoadingProgress.bind(this);
    window.withLoadingIndicator = this.withLoadingIndicator.bind(this);
    
    console.log('🌐 Global loading indicator functions registered');
  }
  
  /**
   * Show loading indicator
   * @param {string} operationType - Type of operation
   * @param {Object} options - Options
   * @returns {string} Operation ID
   */
  showLoadingIndicator(operationType = 'general', options = {}) {
    return this.loadingSystem.startOperation(operationType, options);
  }
  
  /**
   * Hide loading indicator
   * @param {string} operationId - Operation ID
   */
  hideLoadingIndicator(operationId) {
    if (operationId) {
      this.loadingSystem.completeOperation(operationId);
    } else {
      this.loadingSystem.clearAllOperations();
    }
  }
  
  /**
   * Update loading progress
   * @param {string} operationId - Operation ID
   * @param {number} progress - Progress percentage
   * @param {string} status - Status message
   */
  updateLoadingProgress(operationId, progress, status) {
    this.loadingSystem.updateProgress(operationId, progress, status);
  }
  
  /**
   * Wrap a function with loading indicator
   * @param {Function} fn - Function to wrap
   * @param {string} operationType - Operation type
   * @param {Object} options - Options
   * @returns {Function} Wrapped function
   */
  withLoadingIndicator(fn, operationType = 'general', options = {}) {
    return async (...args) => {
      const operationId = this.loadingSystem.startOperation(operationType, options);
      
      try {
        // Set up cancellation if supported
        if (options.cancellable && typeof fn.cancel === 'function') {
          this.loadingSystem.setEventHandler(operationId, 'cancel', () => {
            fn.cancel();
          });
        }
        
        const result = await fn(...args);
        this.loadingSystem.completeOperation(operationId, result);
        return result;
      } catch (error) {
        this.loadingSystem.failOperation(operationId, error);
        throw error;
      }
    };
  }
  
  /**
   * Wrap analysis operations with loading indicator
   * @param {Function} analysisFunction - Analysis function to wrap
   * @param {Object} options - Options
   * @returns {Function} Wrapped analysis function
   */
  wrapAnalysisOperation(analysisFunction, options = {}) {
    return this.withLoadingIndicator(analysisFunction, 'analysis', {
      label: 'Analyzing position...',
      icon: '🔍',
      estimatedDuration: 500,
      cancellable: true,
      ...options
    });
  }
  
  /**
   * Wrap preset loading operations with loading indicator
   * @param {Function} presetFunction - Preset function to wrap
   * @param {Object} options - Options
   * @returns {Function} Wrapped preset function
   */
  wrapPresetOperation(presetFunction, options = {}) {
    return this.withLoadingIndicator(presetFunction, 'preset', {
      label: 'Loading preset...',
      icon: '📋',
      estimatedDuration: 200,
      cancellable: false,
      ...options
    });
  }
  
  /**
   * Wrap sharing operations with loading indicator
   * @param {Function} sharingFunction - Sharing function to wrap
   * @param {Object} options - Options
   * @returns {Function} Wrapped sharing function
   */
  wrapSharingOperation(sharingFunction, options = {}) {
    return this.withLoadingIndicator(sharingFunction, 'sharing', {
      label: 'Generating share code...',
      icon: '🔗',
      estimatedDuration: 300,
      cancellable: true,
      ...options
    });
  }
  
  /**
   * Wrap validation operations with loading indicator
   * @param {Function} validationFunction - Validation function to wrap
   * @param {Object} options - Options
   * @returns {Function} Wrapped validation function
   */
  wrapValidationOperation(validationFunction, options = {}) {
    return this.withLoadingIndicator(validationFunction, 'validation', {
      label: 'Validating position...',
      icon: '✅',
      estimatedDuration: 150,
      cancellable: false,
      ...options
    });
  }
  
  /**
   * Create a progress-aware operation wrapper
   * @param {Function} operation - Operation function
   * @param {string} operationType - Operation type
   * @param {Object} options - Options
   * @returns {Function} Progress-aware wrapper
   */
  createProgressAwareOperation(operation, operationType, options = {}) {
    return async (...args) => {
      const operationId = this.loadingSystem.startOperation(operationType, {
        customProgress: true,
        ...options
      });
      
      // Create progress callback
      const updateProgress = (progress, status) => {
        this.loadingSystem.updateProgress(operationId, progress, status);
      };
      
      try {
        const result = await operation(updateProgress, ...args);
        this.loadingSystem.completeOperation(operationId, result);
        return result;
      } catch (error) {
        this.loadingSystem.failOperation(operationId, error);
        throw error;
      }
    };
  }
  
  /**
   * Get estimated duration for operation type
   * @param {string} operationType - Operation type
   * @param {Object} metadata - Operation metadata
   * @returns {number} Estimated duration in milliseconds
   */
  getEstimatedDuration(operationType, metadata = {}) {
    // Use metadata hint if available
    if (metadata.estimatedDuration) {
      return metadata.estimatedDuration;
    }
    
    // Default estimates based on operation type
    const estimates = {
      drag: 50,
      analysis: 500,
      preset: 200,
      sharing: 300,
      validation: 150,
      export: 800,
      import: 600,
      general: 1000
    };
    
    return estimates[operationType] || estimates.general;
  }
  
  /**
   * Get operation label
   * @param {string} operationType - Operation type
   * @param {Object} metadata - Operation metadata
   * @returns {string} Operation label
   */
  getOperationLabel(operationType, metadata = {}) {
    // Use metadata label if available
    if (metadata.label) {
      return metadata.label;
    }
    
    // Default labels based on operation type
    const labels = {
      drag: 'Moving piece...',
      analysis: 'Analyzing position...',
      preset: 'Loading preset...',
      sharing: 'Generating share code...',
      validation: 'Validating position...',
      export: 'Exporting data...',
      import: 'Importing data...',
      general: 'Processing...'
    };
    
    return labels[operationType] || labels.general;
  }
  
  /**
   * Monitor long-running operation
   * @param {Promise} promise - Promise to monitor
   * @param {string} operationType - Operation type
   * @param {Object} options - Options
   * @returns {Promise} Monitored promise
   */
  async monitorLongOperation(promise, operationType = 'general', options = {}) {
    const startTime = Date.now();
    let operationId = null;
    
    // Start loading indicator after threshold
    const timeoutId = setTimeout(() => {
      operationId = this.loadingSystem.startOperation(operationType, options);
    }, this.config.autoShowThreshold);
    
    try {
      const result = await promise;
      const duration = Date.now() - startTime;
      
      // Clear timeout if operation completed quickly
      clearTimeout(timeoutId);
      
      // Complete loading indicator if it was shown
      if (operationId) {
        this.loadingSystem.completeOperation(operationId, result);
      }
      
      // Log performance info
      if (this.config.debugMode) {
        console.log(`⚡ Operation ${operationType} completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (operationId) {
        this.loadingSystem.failOperation(operationId, error);
      }
      
      throw error;
    }
  }
  
  /**
   * Batch operation with progress tracking
   * @param {Array} operations - Array of operations
   * @param {string} operationType - Operation type
   * @param {Object} options - Options
   * @returns {Promise} Batch result
   */
  async batchOperationWithProgress(operations, operationType = 'general', options = {}) {
    const operationId = this.loadingSystem.startOperation(operationType, {
      label: `Processing ${operations.length} items...`,
      customProgress: true,
      ...options
    });
    
    const results = [];
    const total = operations.length;
    
    try {
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const progress = ((i + 1) / total) * 100;
        
        this.loadingSystem.updateProgress(operationId, progress, `Processing item ${i + 1} of ${total}...`);
        
        const result = await operation();
        results.push(result);
      }
      
      this.loadingSystem.completeOperation(operationId, results);
      return results;
    } catch (error) {
      this.loadingSystem.failOperation(operationId, error);
      throw error;
    }
  }
  
  /**
   * Get loading system instance
   * @returns {LoadingIndicatorSystem} Loading system instance
   */
  getLoadingSystem() {
    return this.loadingSystem;
  }
  
  /**
   * Get performance monitor instance
   * @returns {PerformanceMonitor|null} Performance monitor instance
   */
  getPerformanceMonitor() {
    return this.performanceMonitor;
  }
  
  /**
   * Enable debug mode
   * @param {boolean} enabled - Enable debug mode
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled;
    console.log(`🐛 Loading Indicator Integration debug mode: ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get integration statistics
   * @returns {Object} Integration statistics
   */
  getStatistics() {
    return {
      initialized: this.initialized,
      loadingSystemActive: this.loadingSystem ? this.loadingSystem.getActiveOperationsCount() : 0,
      performanceMonitorAvailable: !!this.performanceMonitor,
      operationMappings: this.operationMap.size,
      config: { ...this.config }
    };
  }
  
  /**
   * Cleanup method
   */
  cleanup() {
    // Clear operation mappings
    this.operationMap.clear();
    
    // Cleanup loading system
    if (this.loadingSystem) {
      this.loadingSystem.cleanup();
    }
    
    // Remove global functions
    if (typeof window !== 'undefined') {
      delete window.showLoadingIndicator;
      delete window.hideLoadingIndicator;
      delete window.updateLoadingProgress;
      delete window.withLoadingIndicator;
    }
    
    this.initialized = false;
    console.log('🧹 Loading Indicator Integration cleaned up');
  }
}

// Create global instance
let loadingIndicatorIntegration = null;

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadingIndicatorIntegration = new LoadingIndicatorIntegration();
    });
  } else {
    loadingIndicatorIntegration = new LoadingIndicatorIntegration();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingIndicatorIntegration;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LoadingIndicatorIntegration = LoadingIndicatorIntegration;
  
  // Make global instance available
  Object.defineProperty(window, 'loadingIndicatorIntegration', {
    get: () => loadingIndicatorIntegration,
    configurable: true
  });
}