/**
 * Performance Monitoring System for Enhanced Piece Setup
 * 
 * Monitors and tracks performance metrics for:
 * - Drag operations (target: <16ms)
 * - Analysis operations (target: <500ms) 
 * - Preset loading (target: <200ms)
 * 
 * Uses Performance API for accurate measurements
 * Requirements: 8.1, 8.2, 8.3
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      dragOperations: [],
      analysisOperations: [],
      presetLoading: [],
      generalOperations: []
    };
    
    // Performance targets (in milliseconds)
    this.targets = {
      dragOperation: 16,    // 60fps requirement
      analysisOperation: 500,
      presetLoading: 200,
      longOperation: 1000   // Show loading indicator threshold
    };
    
    // Statistics tracking
    this.stats = {
      totalDragOperations: 0,
      totalAnalysisOperations: 0,
      totalPresetLoads: 0,
      averageDragTime: 0,
      averageAnalysisTime: 0,
      averagePresetTime: 0,
      performanceIssues: []
    };
    
    // Active measurements
    this.activeMeasurements = new Map();
    
    // Performance observers
    this.observers = [];
    
    // Initialize performance monitoring
    this.initialize();
  }
  
  /**
   * Initialize performance monitoring system
   */
  initialize() {
    console.log('⚡ Initializing Performance Monitor...');
    
    // Check Performance API support
    if (!this.isPerformanceAPISupported()) {
      console.warn('⚠️ Performance API not fully supported, using fallback timing');
    }
    
    // Setup performance observers if supported
    this.setupPerformanceObservers();
    
    // Initialize monitoring hooks
    this.initializeMonitoringHooks();
    
    console.log('✨ Performance Monitor initialized successfully');
  }
  
  /**
   * Check if Performance API is supported
   */
  isPerformanceAPISupported() {
    return typeof performance !== 'undefined' && 
           typeof performance.now === 'function' &&
           typeof performance.mark === 'function' &&
           typeof performance.measure === 'function';
  }
  
  /**
   * Setup performance observers for automatic monitoring
   */
  setupPerformanceObservers() {
    if (typeof PerformanceObserver === 'undefined') {
      console.log('📊 PerformanceObserver not supported, using manual monitoring');
      return;
    }
    
    try {
      // Observe measure entries
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processMeasureEntry(entry);
        }
      });
      
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);
      
      console.log('📊 Performance observers setup successfully');
    } catch (error) {
      console.warn('⚠️ Failed to setup performance observers:', error);
    }
  }
  
  /**
   * Initialize monitoring hooks for existing systems
   */
  initializeMonitoringHooks() {
    // Hook into drag operations
    this.hookDragOperations();
    
    // Hook into analysis operations
    this.hookAnalysisOperations();
    
    // Hook into preset loading
    this.hookPresetLoading();
  }
  
  /**
   * Start measuring a performance operation
   * @param {string} operationType - Type of operation (drag, analysis, preset, general)
   * @param {string} operationId - Unique identifier for this operation
   * @param {Object} metadata - Additional metadata about the operation
   */
  startMeasurement(operationType, operationId, metadata = {}) {
    const startTime = this.getHighResolutionTime();
    const markName = `${operationType}-${operationId}-start`;
    
    // Create performance mark if supported
    if (this.isPerformanceAPISupported()) {
      try {
        performance.mark(markName);
      } catch (error) {
        console.warn('Failed to create performance mark:', error);
      }
    }
    
    // Store measurement data
    this.activeMeasurements.set(operationId, {
      type: operationType,
      startTime,
      markName,
      metadata
    });
    
    return operationId;
  }
  
  /**
   * End measuring a performance operation
   * @param {string} operationId - Operation identifier from startMeasurement
   * @param {Object} additionalData - Additional data to store with the measurement
   */
  endMeasurement(operationId, additionalData = {}) {
    const endTime = this.getHighResolutionTime();
    const measurement = this.activeMeasurements.get(operationId);
    
    if (!measurement) {
      console.warn(`No active measurement found for operation: ${operationId}`);
      return null;
    }
    
    const duration = endTime - measurement.startTime;
    const endMarkName = `${measurement.type}-${operationId}-end`;
    const measureName = `${measurement.type}-${operationId}`;
    
    // Create performance measure if supported
    if (this.isPerformanceAPISupported()) {
      try {
        performance.mark(endMarkName);
        performance.measure(measureName, measurement.markName, endMarkName);
      } catch (error) {
        console.warn('Failed to create performance measure:', error);
      }
    }
    
    // Create measurement result
    const result = {
      operationId,
      type: measurement.type,
      duration,
      startTime: measurement.startTime,
      endTime,
      metadata: { ...measurement.metadata, ...additionalData },
      timestamp: Date.now(),
      withinTarget: this.isWithinTarget(measurement.type, duration)
    };
    
    // Store the measurement
    this.storeMeasurement(result);
    
    // Clean up active measurement
    this.activeMeasurements.delete(operationId);
    
    // Check for performance issues
    this.checkPerformanceIssue(result);
    
    return result;
  }
  
  /**
   * Measure a drag operation
   * @param {Function} operation - The drag operation to measure
   * @param {Object} metadata - Metadata about the drag operation
   */
  async measureDragOperation(operation, metadata = {}) {
    const operationId = `drag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startMeasurement('drag', operationId, metadata);
    
    try {
      const result = await operation();
      const measurement = this.endMeasurement(operationId, { success: true, result });
      
      // Log performance warning if drag is too slow
      if (measurement && measurement.duration > this.targets.dragOperation) {
        console.warn(`🐌 Slow drag operation: ${measurement.duration.toFixed(2)}ms (target: ${this.targets.dragOperation}ms)`);
      }
      
      return { result, measurement };
    } catch (error) {
      this.endMeasurement(operationId, { success: false, error: error.message });
      throw error;
    }
  }
  
  /**
   * Measure an analysis operation
   * @param {Function} operation - The analysis operation to measure
   * @param {Object} metadata - Metadata about the analysis
   */
  async measureAnalysisOperation(operation, metadata = {}) {
    const operationId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startMeasurement('analysis', operationId, metadata);
    
    try {
      const result = await operation();
      const measurement = this.endMeasurement(operationId, { success: true, result });
      
      // Log performance warning if analysis is too slow
      if (measurement && measurement.duration > this.targets.analysisOperation) {
        console.warn(`🐌 Slow analysis operation: ${measurement.duration.toFixed(2)}ms (target: ${this.targets.analysisOperation}ms)`);
      }
      
      return { result, measurement };
    } catch (error) {
      this.endMeasurement(operationId, { success: false, error: error.message });
      throw error;
    }
  }
  
  /**
   * Measure a preset loading operation
   * @param {Function} operation - The preset loading operation to measure
   * @param {Object} metadata - Metadata about the preset loading
   */
  async measurePresetLoading(operation, metadata = {}) {
    const operationId = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.startMeasurement('preset', operationId, metadata);
    
    try {
      const result = await operation();
      const measurement = this.endMeasurement(operationId, { success: true, result });
      
      // Log performance warning if preset loading is too slow
      if (measurement && measurement.duration > this.targets.presetLoading) {
        console.warn(`🐌 Slow preset loading: ${measurement.duration.toFixed(2)}ms (target: ${this.targets.presetLoading}ms)`);
      }
      
      return { result, measurement };
    } catch (error) {
      this.endMeasurement(operationId, { success: false, error: error.message });
      throw error;
    }
  }
  
  /**
   * Get high resolution time
   */
  getHighResolutionTime() {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    } else {
      return Date.now();
    }
  }
  
  /**
   * Check if duration is within target for operation type
   */
  isWithinTarget(operationType, duration) {
    switch (operationType) {
      case 'drag':
        return duration <= this.targets.dragOperation;
      case 'analysis':
        return duration <= this.targets.analysisOperation;
      case 'preset':
        return duration <= this.targets.presetLoading;
      default:
        return true;
    }
  }
  
  /**
   * Store measurement in appropriate metrics array
   */
  storeMeasurement(measurement) {
    switch (measurement.type) {
      case 'drag':
        this.metrics.dragOperations.push(measurement);
        this.stats.totalDragOperations++;
        break;
      case 'analysis':
        this.metrics.analysisOperations.push(measurement);
        this.stats.totalAnalysisOperations++;
        break;
      case 'preset':
        this.metrics.presetLoading.push(measurement);
        this.stats.totalPresetLoads++;
        break;
      default:
        this.metrics.generalOperations.push(measurement);
        break;
    }
    
    // Update statistics
    this.updateStatistics();
    
    // Limit stored measurements to prevent memory issues
    this.limitStoredMeasurements();
  }
  
  /**
   * Check for performance issues and log warnings
   */
  checkPerformanceIssue(measurement) {
    if (!measurement.withinTarget) {
      const issue = {
        type: measurement.type,
        operationId: measurement.operationId,
        duration: measurement.duration,
        target: this.getTargetForType(measurement.type),
        timestamp: measurement.timestamp,
        metadata: measurement.metadata
      };
      
      this.stats.performanceIssues.push(issue);
      
      // Log warning
      console.warn(`⚠️ Performance issue detected:`, {
        type: measurement.type,
        duration: `${measurement.duration.toFixed(2)}ms`,
        target: `${issue.target}ms`,
        operationId: measurement.operationId
      });
      
      // Limit stored issues
      if (this.stats.performanceIssues.length > 100) {
        this.stats.performanceIssues = this.stats.performanceIssues.slice(-50);
      }
    }
  }
  
  /**
   * Get target time for operation type
   */
  getTargetForType(operationType) {
    switch (operationType) {
      case 'drag': return this.targets.dragOperation;
      case 'analysis': return this.targets.analysisOperation;
      case 'preset': return this.targets.presetLoading;
      default: return this.targets.longOperation;
    }
  }
  
  /**
   * Update performance statistics
   */
  updateStatistics() {
    // Calculate average drag time
    if (this.metrics.dragOperations.length > 0) {
      const totalDragTime = this.metrics.dragOperations.reduce((sum, m) => sum + m.duration, 0);
      this.stats.averageDragTime = totalDragTime / this.metrics.dragOperations.length;
    }
    
    // Calculate average analysis time
    if (this.metrics.analysisOperations.length > 0) {
      const totalAnalysisTime = this.metrics.analysisOperations.reduce((sum, m) => sum + m.duration, 0);
      this.stats.averageAnalysisTime = totalAnalysisTime / this.metrics.analysisOperations.length;
    }
    
    // Calculate average preset time
    if (this.metrics.presetLoading.length > 0) {
      const totalPresetTime = this.metrics.presetLoading.reduce((sum, m) => sum + m.duration, 0);
      this.stats.averagePresetTime = totalPresetTime / this.metrics.presetLoading.length;
    }
  }
  
  /**
   * Limit stored measurements to prevent memory issues
   */
  limitStoredMeasurements() {
    const maxMeasurements = 100;
    
    if (this.metrics.dragOperations.length > maxMeasurements) {
      this.metrics.dragOperations = this.metrics.dragOperations.slice(-maxMeasurements / 2);
    }
    
    if (this.metrics.analysisOperations.length > maxMeasurements) {
      this.metrics.analysisOperations = this.metrics.analysisOperations.slice(-maxMeasurements / 2);
    }
    
    if (this.metrics.presetLoading.length > maxMeasurements) {
      this.metrics.presetLoading = this.metrics.presetLoading.slice(-maxMeasurements / 2);
    }
    
    if (this.metrics.generalOperations.length > maxMeasurements) {
      this.metrics.generalOperations = this.metrics.generalOperations.slice(-maxMeasurements / 2);
    }
  }
  
  /**
   * Hook into drag operations for automatic monitoring
   */
  hookDragOperations() {
    // Hook into enhanced drag & drop system if available
    if (typeof window !== 'undefined' && window.EnhancedDragDropSystem) {
      const originalHandleDrop = window.EnhancedDragDropSystem.prototype.handleSquareDrop;
      const self = this;
      
      window.EnhancedDragDropSystem.prototype.handleSquareDrop = function(e) {
        const startTime = self.getHighResolutionTime();
        const result = originalHandleDrop.call(this, e);
        const endTime = self.getHighResolutionTime();
        
        // Record the measurement
        const measurement = {
          operationId: `drag-drop-${Date.now()}`,
          type: 'drag',
          duration: endTime - startTime,
          startTime,
          endTime,
          metadata: { operation: 'drop', element: e.target.tagName },
          timestamp: Date.now(),
          withinTarget: self.isWithinTarget('drag', endTime - startTime)
        };
        
        self.storeMeasurement(measurement);
        self.checkPerformanceIssue(measurement);
        
        return result;
      };
    }
  }
  
  /**
   * Hook into analysis operations for automatic monitoring
   */
  hookAnalysisOperations() {
    // Hook into advanced position analyzer if available
    if (typeof window !== 'undefined' && window.AdvancedPositionAnalyzer) {
      const originalAnalyzePosition = window.AdvancedPositionAnalyzer.prototype.analyzePosition;
      const self = this;
      
      window.AdvancedPositionAnalyzer.prototype.analyzePosition = function(position) {
        const startTime = self.getHighResolutionTime();
        const result = originalAnalyzePosition.call(this, position);
        const endTime = self.getHighResolutionTime();
        
        // Record the measurement
        const measurement = {
          operationId: `analysis-${Date.now()}`,
          type: 'analysis',
          duration: endTime - startTime,
          startTime,
          endTime,
          metadata: { operation: 'position-analysis' },
          timestamp: Date.now(),
          withinTarget: self.isWithinTarget('analysis', endTime - startTime)
        };
        
        self.storeMeasurement(measurement);
        self.checkPerformanceIssue(measurement);
        
        return result;
      };
    }
  }
  
  /**
   * Hook into preset loading for automatic monitoring
   */
  hookPresetLoading() {
    // Hook into extended preset manager if available
    if (typeof window !== 'undefined' && window.ExtendedPresetManager) {
      const originalGetPresetById = window.ExtendedPresetManager.prototype.getPresetById;
      const self = this;
      
      window.ExtendedPresetManager.prototype.getPresetById = function(presetId) {
        const startTime = self.getHighResolutionTime();
        const result = originalGetPresetById.call(this, presetId);
        const endTime = self.getHighResolutionTime();
        
        // Record the measurement
        const measurement = {
          operationId: `preset-load-${Date.now()}`,
          type: 'preset',
          duration: endTime - startTime,
          startTime,
          endTime,
          metadata: { operation: 'preset-load', presetId },
          timestamp: Date.now(),
          withinTarget: self.isWithinTarget('preset', endTime - startTime)
        };
        
        self.storeMeasurement(measurement);
        self.checkPerformanceIssue(measurement);
        
        return result;
      };
    }
  }
  
  /**
   * Process performance measure entries from PerformanceObserver
   */
  processMeasureEntry(entry) {
    // Extract operation type and ID from entry name
    const nameParts = entry.name.split('-');
    if (nameParts.length >= 2) {
      const operationType = nameParts[0];
      const operationId = nameParts.slice(1, -1).join('-');
      
      // Only process our own measurements
      if (['drag', 'analysis', 'preset'].includes(operationType)) {
        console.log(`📊 Performance entry: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    }
  }
  
  /**
   * Get performance statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      targets: this.targets,
      measurementCounts: {
        drag: this.metrics.dragOperations.length,
        analysis: this.metrics.analysisOperations.length,
        preset: this.metrics.presetLoading.length,
        general: this.metrics.generalOperations.length
      }
    };
  }
  
  /**
   * Get recent measurements
   */
  getRecentMeasurements(type = null, limit = 10) {
    let measurements = [];
    
    if (type) {
      measurements = this.metrics[type + 'Operations'] || [];
    } else {
      measurements = [
        ...this.metrics.dragOperations,
        ...this.metrics.analysisOperations,
        ...this.metrics.presetLoading,
        ...this.metrics.generalOperations
      ].sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return measurements.slice(0, limit);
  }
  
  /**
   * Get performance issues
   */
  getPerformanceIssues(limit = 20) {
    return this.stats.performanceIssues
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Clear all performance data
   */
  clearData() {
    this.metrics = {
      dragOperations: [],
      analysisOperations: [],
      presetLoading: [],
      generalOperations: []
    };
    
    this.stats = {
      totalDragOperations: 0,
      totalAnalysisOperations: 0,
      totalPresetLoads: 0,
      averageDragTime: 0,
      averageAnalysisTime: 0,
      averagePresetTime: 0,
      performanceIssues: []
    };
    
    this.activeMeasurements.clear();
    
    console.log('🧹 Performance data cleared');
  }
  
  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.getStatistics();
    const recentIssues = this.getPerformanceIssues(10);
    
    const report = {
      timestamp: Date.now(),
      summary: {
        totalOperations: stats.totalDragOperations + stats.totalAnalysisOperations + stats.totalPresetLoads,
        averageTimes: {
          drag: `${stats.averageDragTime.toFixed(2)}ms`,
          analysis: `${stats.averageAnalysisTime.toFixed(2)}ms`,
          preset: `${stats.averagePresetTime.toFixed(2)}ms`
        },
        performanceIssues: stats.performanceIssues.length,
        targetsStatus: {
          drag: stats.averageDragTime <= this.targets.dragOperation ? '✅' : '❌',
          analysis: stats.averageAnalysisTime <= this.targets.analysisOperation ? '✅' : '❌',
          preset: stats.averagePresetTime <= this.targets.presetLoading ? '✅' : '❌'
        }
      },
      details: stats,
      recentIssues: recentIssues
    };
    
    return report;
  }
  
  /**
   * Log performance report to console
   */
  logReport() {
    const report = this.generateReport();
    
    console.group('⚡ Performance Monitor Report');
    console.log('📊 Summary:', report.summary);
    console.log('🎯 Targets Status:', report.summary.targetsStatus);
    
    if (report.recentIssues.length > 0) {
      console.warn('⚠️ Recent Performance Issues:', report.recentIssues);
    } else {
      console.log('✅ No recent performance issues');
    }
    
    console.groupEnd();
    
    return report;
  }
  
  /**
   * Cleanup method
   */
  cleanup() {
    // Disconnect performance observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect performance observer:', error);
      }
    });
    
    this.observers = [];
    this.activeMeasurements.clear();
    
    console.log('🧹 Performance Monitor cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
}