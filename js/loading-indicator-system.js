/**
 * Loading Indicator System for Enhanced Piece Setup
 * 
 * Provides comprehensive loading indicators for operations longer than 1 second:
 * - Progress bars and spinner animations
 * - Operation cancellation capability
 * - User feedback and status updates
 * - Integration with performance monitoring
 * 
 * Requirements: 8.4
 */

class LoadingIndicatorSystem {
  constructor() {
    // Active loading operations
    this.activeOperations = new Map();
    
    // Loading indicator elements
    this.elements = {
      overlay: null,
      container: null,
      spinner: null,
      progressBar: null,
      progressFill: null,
      statusText: null,
      cancelButton: null,
      operationsList: null
    };
    
    // Configuration
    this.config = {
      showThreshold: 1000,        // Show indicator after 1 second
      updateInterval: 100,        // Update progress every 100ms
      fadeInDuration: 300,        // Fade in animation duration
      fadeOutDuration: 200,       // Fade out animation duration
      maxConcurrentOperations: 5, // Maximum concurrent operations to display
      autoHideDelay: 1000         // Auto-hide delay after completion
    };
    
    // Operation types and their configurations
    this.operationTypes = {
      analysis: {
        label: 'Analyzing position...',
        icon: '🔍',
        color: '#4f46e5',
        estimatedDuration: 500,
        cancellable: true
      },
      preset: {
        label: 'Loading preset...',
        icon: '📋',
        color: '#059669',
        estimatedDuration: 200,
        cancellable: false
      },
      sharing: {
        label: 'Generating share code...',
        icon: '🔗',
        color: '#0891b2',
        estimatedDuration: 300,
        cancellable: true
      },
      validation: {
        label: 'Validating position...',
        icon: '✅',
        color: '#dc2626',
        estimatedDuration: 150,
        cancellable: false
      },
      export: {
        label: 'Exporting data...',
        icon: '💾',
        color: '#7c3aed',
        estimatedDuration: 800,
        cancellable: true
      },
      import: {
        label: 'Importing data...',
        icon: '📥',
        color: '#ea580c',
        estimatedDuration: 600,
        cancellable: true
      },
      general: {
        label: 'Processing...',
        icon: '⚡',
        color: '#6b7280',
        estimatedDuration: 1000,
        cancellable: true
      }
    };
    
    // Event handlers
    this.eventHandlers = {
      onCancel: new Map(),
      onProgress: new Map(),
      onComplete: new Map(),
      onError: new Map()
    };
    
    // Initialize the system
    this.initialize();
  }
  
  /**
   * Initialize the loading indicator system
   */
  initialize() {
    console.log('🔄 Initializing Loading Indicator System...');
    
    // Create DOM elements
    this.createElements();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize styles
    this.initializeStyles();
    
    console.log('✨ Loading Indicator System initialized successfully');
  }
  
  /**
   * Create DOM elements for loading indicators
   */
  createElements() {
    // Create overlay
    this.elements.overlay = document.createElement('div');
    this.elements.overlay.id = 'loadingOverlay';
    this.elements.overlay.className = 'loading-overlay';
    this.elements.overlay.style.display = 'none';
    
    // Create container
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'loading-container';
    
    // Create spinner
    this.elements.spinner = document.createElement('div');
    this.elements.spinner.className = 'loading-spinner';
    this.elements.spinner.innerHTML = `
      <div class="spinner-ring"></div>
      <div class="spinner-icon">⚡</div>
    `;
    
    // Create progress bar
    this.elements.progressBar = document.createElement('div');
    this.elements.progressBar.className = 'loading-progress-bar';
    
    this.elements.progressFill = document.createElement('div');
    this.elements.progressFill.className = 'loading-progress-fill';
    this.elements.progressBar.appendChild(this.elements.progressFill);
    
    // Create status text
    this.elements.statusText = document.createElement('div');
    this.elements.statusText.className = 'loading-status-text';
    this.elements.statusText.textContent = 'Loading...';
    
    // Create cancel button
    this.elements.cancelButton = document.createElement('button');
    this.elements.cancelButton.className = 'loading-cancel-button';
    this.elements.cancelButton.innerHTML = '❌ Cancel';
    this.elements.cancelButton.style.display = 'none';
    
    // Create operations list for multiple operations
    this.elements.operationsList = document.createElement('div');
    this.elements.operationsList.className = 'loading-operations-list';
    this.elements.operationsList.style.display = 'none';
    
    // Assemble the structure
    this.elements.container.appendChild(this.elements.spinner);
    this.elements.container.appendChild(this.elements.progressBar);
    this.elements.container.appendChild(this.elements.statusText);
    this.elements.container.appendChild(this.elements.cancelButton);
    this.elements.container.appendChild(this.elements.operationsList);
    
    this.elements.overlay.appendChild(this.elements.container);
    
    // Add to document
    document.body.appendChild(this.elements.overlay);
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Cancel button click
    this.elements.cancelButton.addEventListener('click', () => {
      this.cancelCurrentOperation();
    });
    
    // Escape key to cancel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.cancelCurrentOperation();
      }
    });
    
    // Prevent clicks on overlay from propagating
    this.elements.overlay.addEventListener('click', (e) => {
      if (e.target === this.elements.overlay) {
        // Optional: allow clicking overlay to cancel
        // this.cancelCurrentOperation();
      }
    });
  }
  
  /**
   * Initialize CSS styles
   */
  initializeStyles() {
    const styleId = 'loading-indicator-styles';
    
    // Remove existing styles if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create style element
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .loading-overlay.visible {
        opacity: 1;
      }
      
      .loading-container {
        background: var(--bg-primary, #ffffff);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
        min-width: 300px;
        max-width: 400px;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .loading-overlay.visible .loading-container {
        transform: scale(1);
      }
      
      .loading-spinner {
        position: relative;
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
      }
      
      .spinner-ring {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 4px solid rgba(79, 70, 229, 0.2);
        border-top: 4px solid #4f46e5;
        border-radius: 50%;
        animation: loading-spin 1s linear infinite;
      }
      
      .spinner-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        animation: loading-pulse 2s ease-in-out infinite;
      }
      
      .loading-progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(79, 70, 229, 0.1);
        border-radius: 4px;
        margin: 16px 0;
        overflow: hidden;
      }
      
      .loading-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        border-radius: 4px;
        width: 0%;
        transition: width 0.3s ease;
        position: relative;
      }
      
      .loading-progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: loading-shimmer 2s infinite;
      }
      
      .loading-status-text {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary, #1f2937);
        margin: 16px 0;
        min-height: 24px;
      }
      
      .loading-cancel-button {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 16px;
        transition: all 0.2s ease;
      }
      
      .loading-cancel-button:hover {
        background: #dc2626;
        transform: translateY(-1px);
      }
      
      .loading-cancel-button:active {
        transform: translateY(0);
      }
      
      .loading-operations-list {
        margin-top: 20px;
        text-align: left;
      }
      
      .loading-operation-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(79, 70, 229, 0.05);
        border-radius: 8px;
        margin: 4px 0;
        font-size: 14px;
      }
      
      .loading-operation-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .loading-operation-progress {
        width: 60px;
        height: 4px;
        background: rgba(79, 70, 229, 0.2);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .loading-operation-progress-fill {
        height: 100%;
        background: #4f46e5;
        width: 0%;
        transition: width 0.3s ease;
      }
      
      @keyframes loading-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes loading-pulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
      }
      
      @keyframes loading-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .loading-container {
          background: var(--bg-primary, #1f2937);
          color: var(--text-primary, #f9fafb);
        }
        
        .loading-status-text {
          color: var(--text-primary, #f9fafb);
        }
      }
      
      /* Mobile responsive */
      @media (max-width: 480px) {
        .loading-container {
          margin: 20px;
          padding: 24px;
          min-width: auto;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
        }
        
        .spinner-icon {
          font-size: 20px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Start a loading operation
   * @param {string} operationType - Type of operation (analysis, preset, etc.)
   * @param {Object} options - Operation options
   * @returns {string} Operation ID
   */
  startOperation(operationType = 'general', options = {}) {
    const operationId = `${operationType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const operationConfig = this.operationTypes[operationType] || this.operationTypes.general;
    
    const operation = {
      id: operationId,
      type: operationType,
      startTime: Date.now(),
      config: { ...operationConfig, ...options },
      progress: 0,
      status: 'starting',
      cancellable: options.cancellable !== undefined ? options.cancellable : operationConfig.cancellable,
      cancelled: false,
      completed: false,
      error: null,
      metadata: options.metadata || {}
    };
    
    // Store the operation
    this.activeOperations.set(operationId, operation);
    
    // Show loading indicator after threshold
    setTimeout(() => {
      if (this.activeOperations.has(operationId) && !operation.completed) {
        this.showLoadingIndicator(operationId);
      }
    }, this.config.showThreshold);
    
    // Start progress simulation if no custom progress handler
    if (!options.customProgress) {
      this.simulateProgress(operationId);
    }
    
    console.log(`🔄 Started loading operation: ${operationType} (${operationId})`);
    
    return operationId;
  }
  
  /**
   * Update operation progress
   * @param {string} operationId - Operation ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} status - Optional status message
   */
  updateProgress(operationId, progress, status = null) {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.cancelled || operation.completed) {
      return;
    }
    
    operation.progress = Math.max(0, Math.min(100, progress));
    if (status) {
      operation.status = status;
    }
    
    // Update UI if visible
    if (this.isVisible() && this.getCurrentOperationId() === operationId) {
      this.updateUI(operation);
    }
    
    // Trigger progress event
    const handler = this.eventHandlers.onProgress.get(operationId);
    if (handler) {
      handler(operation.progress, operation.status);
    }
  }
  
  /**
   * Complete an operation
   * @param {string} operationId - Operation ID
   * @param {*} result - Operation result
   */
  completeOperation(operationId, result = null) {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.completed) {
      return;
    }
    
    operation.completed = true;
    operation.progress = 100;
    operation.status = 'completed';
    operation.result = result;
    operation.endTime = Date.now();
    operation.duration = operation.endTime - operation.startTime;
    
    console.log(`✅ Completed loading operation: ${operation.type} (${operationId}) in ${operation.duration}ms`);
    
    // Update UI
    if (this.isVisible() && this.getCurrentOperationId() === operationId) {
      this.updateUI(operation);
      
      // Auto-hide after delay
      setTimeout(() => {
        if (this.activeOperations.size <= 1) {
          this.hideLoadingIndicator();
        } else {
          this.showNextOperation();
        }
      }, this.config.autoHideDelay);
    }
    
    // Trigger complete event
    const handler = this.eventHandlers.onComplete.get(operationId);
    if (handler) {
      handler(result, operation);
    }
    
    // Clean up after a delay
    setTimeout(() => {
      this.activeOperations.delete(operationId);
      this.eventHandlers.onCancel.delete(operationId);
      this.eventHandlers.onProgress.delete(operationId);
      this.eventHandlers.onComplete.delete(operationId);
      this.eventHandlers.onError.delete(operationId);
    }, 5000);
  }
  
  /**
   * Fail an operation with error
   * @param {string} operationId - Operation ID
   * @param {Error|string} error - Error object or message
   */
  failOperation(operationId, error) {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.completed) {
      return;
    }
    
    operation.completed = true;
    operation.error = error;
    operation.status = 'error';
    operation.endTime = Date.now();
    operation.duration = operation.endTime - operation.startTime;
    
    console.error(`❌ Failed loading operation: ${operation.type} (${operationId})`, error);
    
    // Update UI
    if (this.isVisible() && this.getCurrentOperationId() === operationId) {
      this.updateUI(operation);
      
      // Auto-hide after longer delay for errors
      setTimeout(() => {
        if (this.activeOperations.size <= 1) {
          this.hideLoadingIndicator();
        } else {
          this.showNextOperation();
        }
      }, this.config.autoHideDelay * 2);
    }
    
    // Trigger error event
    const handler = this.eventHandlers.onError.get(operationId);
    if (handler) {
      handler(error, operation);
    }
  }
  
  /**
   * Cancel an operation
   * @param {string} operationId - Operation ID
   */
  cancelOperation(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (!operation || operation.completed || !operation.cancellable) {
      return false;
    }
    
    operation.cancelled = true;
    operation.status = 'cancelled';
    operation.endTime = Date.now();
    operation.duration = operation.endTime - operation.startTime;
    
    console.log(`🚫 Cancelled loading operation: ${operation.type} (${operationId})`);
    
    // Trigger cancel event
    const handler = this.eventHandlers.onCancel.get(operationId);
    if (handler) {
      handler(operation);
    }
    
    // Update UI
    if (this.isVisible() && this.getCurrentOperationId() === operationId) {
      if (this.activeOperations.size <= 1) {
        this.hideLoadingIndicator();
      } else {
        this.showNextOperation();
      }
    }
    
    return true;
  }
  
  /**
   * Cancel current operation
   */
  cancelCurrentOperation() {
    const currentId = this.getCurrentOperationId();
    if (currentId) {
      this.cancelOperation(currentId);
    }
  }
  
  /**
   * Show loading indicator
   * @param {string} operationId - Operation ID to show
   */
  showLoadingIndicator(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return;
    }
    
    // Update UI with operation details
    this.updateUI(operation);
    
    // Show overlay
    this.elements.overlay.style.display = 'flex';
    
    // Trigger fade in animation
    requestAnimationFrame(() => {
      this.elements.overlay.classList.add('visible');
    });
    
    // Update multiple operations display
    this.updateOperationsList();
  }
  
  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    if (!this.isVisible()) {
      return;
    }
    
    // Trigger fade out animation
    this.elements.overlay.classList.remove('visible');
    
    // Hide after animation
    setTimeout(() => {
      this.elements.overlay.style.display = 'none';
    }, this.config.fadeOutDuration);
  }
  
  /**
   * Update UI with operation details
   * @param {Object} operation - Operation object
   */
  updateUI(operation) {
    const config = operation.config;
    
    // Update spinner icon and color
    const spinnerIcon = this.elements.spinner.querySelector('.spinner-icon');
    const spinnerRing = this.elements.spinner.querySelector('.spinner-ring');
    
    if (spinnerIcon) {
      spinnerIcon.textContent = config.icon;
    }
    
    if (spinnerRing) {
      spinnerRing.style.borderTopColor = config.color;
    }
    
    // Update progress bar
    this.elements.progressFill.style.width = `${operation.progress}%`;
    this.elements.progressFill.style.background = `linear-gradient(90deg, ${config.color}, ${this.adjustColor(config.color, 20)})`;
    
    // Update status text
    let statusText = config.label;
    if (operation.status === 'completed') {
      statusText = '✅ Completed!';
    } else if (operation.status === 'error') {
      statusText = '❌ Error occurred';
    } else if (operation.status === 'cancelled') {
      statusText = '🚫 Cancelled';
    } else if (typeof operation.status === 'string' && operation.status !== 'starting') {
      statusText = operation.status;
    }
    
    this.elements.statusText.textContent = statusText;
    
    // Update cancel button
    if (operation.cancellable && !operation.completed && !operation.cancelled) {
      this.elements.cancelButton.style.display = 'block';
    } else {
      this.elements.cancelButton.style.display = 'none';
    }
  }
  
  /**
   * Update operations list for multiple concurrent operations
   */
  updateOperationsList() {
    const activeOps = Array.from(this.activeOperations.values())
      .filter(op => !op.completed && !op.cancelled)
      .slice(0, this.config.maxConcurrentOperations);
    
    if (activeOps.length <= 1) {
      this.elements.operationsList.style.display = 'none';
      return;
    }
    
    this.elements.operationsList.style.display = 'block';
    this.elements.operationsList.innerHTML = '';
    
    activeOps.forEach(operation => {
      const item = document.createElement('div');
      item.className = 'loading-operation-item';
      
      const info = document.createElement('div');
      info.className = 'loading-operation-info';
      info.innerHTML = `
        <span>${operation.config.icon}</span>
        <span>${operation.config.label}</span>
      `;
      
      const progress = document.createElement('div');
      progress.className = 'loading-operation-progress';
      
      const progressFill = document.createElement('div');
      progressFill.className = 'loading-operation-progress-fill';
      progressFill.style.width = `${operation.progress}%`;
      progressFill.style.background = operation.config.color;
      
      progress.appendChild(progressFill);
      
      item.appendChild(info);
      item.appendChild(progress);
      
      this.elements.operationsList.appendChild(item);
    });
  }
  
  /**
   * Show next operation in queue
   */
  showNextOperation() {
    const nextOperation = Array.from(this.activeOperations.values())
      .find(op => !op.completed && !op.cancelled);
    
    if (nextOperation) {
      this.updateUI(nextOperation);
      this.updateOperationsList();
    } else {
      this.hideLoadingIndicator();
    }
  }
  
  /**
   * Simulate progress for operations without custom progress
   * @param {string} operationId - Operation ID
   */
  simulateProgress(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return;
    }
    
    const estimatedDuration = operation.config.estimatedDuration;
    const updateInterval = this.config.updateInterval;
    const totalUpdates = estimatedDuration / updateInterval;
    let currentUpdate = 0;
    
    const progressInterval = setInterval(() => {
      if (!this.activeOperations.has(operationId) || operation.cancelled || operation.completed) {
        clearInterval(progressInterval);
        return;
      }
      
      currentUpdate++;
      const progress = Math.min(95, (currentUpdate / totalUpdates) * 100);
      
      this.updateProgress(operationId, progress);
      
      if (progress >= 95) {
        clearInterval(progressInterval);
      }
    }, updateInterval);
  }
  
  /**
   * Set event handler for operation
   * @param {string} operationId - Operation ID
   * @param {string} eventType - Event type (cancel, progress, complete, error)
   * @param {Function} handler - Event handler function
   */
  setEventHandler(operationId, eventType, handler) {
    if (this.eventHandlers[`on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`]) {
      this.eventHandlers[`on${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`].set(operationId, handler);
    }
  }
  
  /**
   * Get current operation ID being displayed
   * @returns {string|null} Current operation ID
   */
  getCurrentOperationId() {
    const activeOps = Array.from(this.activeOperations.values())
      .filter(op => !op.completed && !op.cancelled);
    
    return activeOps.length > 0 ? activeOps[0].id : null;
  }
  
  /**
   * Check if loading indicator is visible
   * @returns {boolean} True if visible
   */
  isVisible() {
    return this.elements.overlay.style.display !== 'none';
  }
  
  /**
   * Get active operations count
   * @returns {number} Number of active operations
   */
  getActiveOperationsCount() {
    return Array.from(this.activeOperations.values())
      .filter(op => !op.completed && !op.cancelled).length;
  }
  
  /**
   * Get operation status
   * @param {string} operationId - Operation ID
   * @returns {Object|null} Operation status
   */
  getOperationStatus(operationId) {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      return null;
    }
    
    return {
      id: operation.id,
      type: operation.type,
      progress: operation.progress,
      status: operation.status,
      cancellable: operation.cancellable,
      cancelled: operation.cancelled,
      completed: operation.completed,
      error: operation.error,
      duration: operation.endTime ? operation.endTime - operation.startTime : Date.now() - operation.startTime
    };
  }
  
  /**
   * Clear all operations
   */
  clearAllOperations() {
    // Cancel all active operations
    Array.from(this.activeOperations.keys()).forEach(operationId => {
      this.cancelOperation(operationId);
    });
    
    // Clear maps
    this.activeOperations.clear();
    Object.values(this.eventHandlers).forEach(map => map.clear());
    
    // Hide indicator
    this.hideLoadingIndicator();
    
    console.log('🧹 Cleared all loading operations');
  }
  
  /**
   * Adjust color brightness
   * @param {string} color - Hex color
   * @param {number} percent - Brightness adjustment percentage
   * @returns {string} Adjusted color
   */
  adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  
  /**
   * Cleanup method
   */
  cleanup() {
    // Clear all operations
    this.clearAllOperations();
    
    // Remove DOM elements
    if (this.elements.overlay && this.elements.overlay.parentNode) {
      this.elements.overlay.parentNode.removeChild(this.elements.overlay);
    }
    
    // Remove styles
    const styleElement = document.getElementById('loading-indicator-styles');
    if (styleElement) {
      styleElement.remove();
    }
    
    console.log('🧹 Loading Indicator System cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingIndicatorSystem;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.LoadingIndicatorSystem = LoadingIndicatorSystem;
}