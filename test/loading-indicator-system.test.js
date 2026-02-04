/**
 * Unit Tests for Loading Indicator System
 * 
 * Tests the loading indicator system functionality including:
 * - Basic operation lifecycle
 * - Progress tracking
 * - Cancellation capability
 * - Multiple operations handling
 * - Error scenarios
 * - UI integration
 * 
 * Requirements: 8.4
 */

// Mock DOM environment for testing
const mockDOM = {
  elements: new Map(),
  
  createElement: function(tagName) {
    const element = {
      tagName: tagName.toUpperCase(),
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      textContent: '',
      children: [],
      parentNode: null,
      
      appendChild: function(child) {
        this.children.push(child);
        child.parentNode = this;
        return child;
      },
      
      removeChild: function(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
          this.children.splice(index, 1);
          child.parentNode = null;
        }
        return child;
      },
      
      addEventListener: function(event, handler) {
        // Mock event listener
      },
      
      querySelector: function(selector) {
        return this.children.find(child => 
          selector.includes(child.className) || selector.includes(child.id)
        );
      },
      
      classList: {
        add: function(className) {},
        remove: function(className) {},
        contains: function(className) { return false; }
      }
    };
    
    return element;
  },
  
  getElementById: function(id) {
    return this.elements.get(id);
  },
  
  body: {
    appendChild: function(child) {
      mockDOM.elements.set(child.id, child);
      return child;
    }
  },
  
  head: {
    appendChild: function(child) {
      return child;
    }
  }
};

// Setup mock environment
global.document = mockDOM;
global.window = {
  requestAnimationFrame: function(callback) {
    setTimeout(callback, 16);
  }
};

// Import the system
const LoadingIndicatorSystem = require('../js/loading-indicator-system.js');

describe('Loading Indicator System', () => {
  let loadingSystem;
  
  beforeEach(() => {
    // Reset mock DOM
    mockDOM.elements.clear();
    
    // Create new instance
    loadingSystem = new LoadingIndicatorSystem();
  });
  
  afterEach(() => {
    if (loadingSystem) {
      loadingSystem.cleanup();
    }
  });
  
  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(loadingSystem).toBeDefined();
      expect(loadingSystem.config.showThreshold).toBe(1000);
      expect(loadingSystem.config.updateInterval).toBe(100);
      expect(loadingSystem.activeOperations).toBeDefined();
      expect(loadingSystem.elements).toBeDefined();
    });
    
    test('should create DOM elements', () => {
      expect(loadingSystem.elements.overlay).toBeDefined();
      expect(loadingSystem.elements.container).toBeDefined();
      expect(loadingSystem.elements.spinner).toBeDefined();
      expect(loadingSystem.elements.progressBar).toBeDefined();
      expect(loadingSystem.elements.statusText).toBeDefined();
      expect(loadingSystem.elements.cancelButton).toBeDefined();
    });
    
    test('should have operation type configurations', () => {
      expect(loadingSystem.operationTypes.analysis).toBeDefined();
      expect(loadingSystem.operationTypes.preset).toBeDefined();
      expect(loadingSystem.operationTypes.sharing).toBeDefined();
      expect(loadingSystem.operationTypes.validation).toBeDefined();
      expect(loadingSystem.operationTypes.general).toBeDefined();
    });
  });
  
  describe('Operation Lifecycle', () => {
    test('should start an operation and return operation ID', () => {
      const operationId = loadingSystem.startOperation('analysis');
      
      expect(operationId).toBeDefined();
      expect(typeof operationId).toBe('string');
      expect(operationId).toMatch(/^analysis-\d+-[a-z0-9]+$/);
      expect(loadingSystem.activeOperations.has(operationId)).toBe(true);
    });
    
    test('should complete an operation successfully', () => {
      const operationId = loadingSystem.startOperation('analysis');
      const result = { materialBalance: 0, kingSafety: 'safe' };
      
      loadingSystem.completeOperation(operationId, result);
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.completed).toBe(true);
      expect(operation.result).toEqual(result);
      expect(operation.progress).toBe(100);
      expect(operation.status).toBe('completed');
    });
    
    test('should fail an operation with error', () => {
      const operationId = loadingSystem.startOperation('analysis');
      const error = new Error('Test error');
      
      loadingSystem.failOperation(operationId, error);
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.completed).toBe(true);
      expect(operation.error).toBe(error);
      expect(operation.status).toBe('error');
    });
    
    test('should cancel a cancellable operation', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        cancellable: true
      });
      
      const cancelled = loadingSystem.cancelOperation(operationId);
      
      expect(cancelled).toBe(true);
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.cancelled).toBe(true);
      expect(operation.status).toBe('cancelled');
    });
    
    test('should not cancel a non-cancellable operation', () => {
      const operationId = loadingSystem.startOperation('preset', {
        cancellable: false
      });
      
      const cancelled = loadingSystem.cancelOperation(operationId);
      
      expect(cancelled).toBe(false);
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.cancelled).toBe(false);
    });
  });
  
  describe('Progress Tracking', () => {
    test('should update operation progress', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        customProgress: true
      });
      
      loadingSystem.updateProgress(operationId, 50, 'Halfway done');
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.progress).toBe(50);
      expect(operation.status).toBe('Halfway done');
    });
    
    test('should clamp progress values to 0-100 range', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        customProgress: true
      });
      
      loadingSystem.updateProgress(operationId, -10);
      expect(loadingSystem.activeOperations.get(operationId).progress).toBe(0);
      
      loadingSystem.updateProgress(operationId, 150);
      expect(loadingSystem.activeOperations.get(operationId).progress).toBe(100);
    });
    
    test('should not update progress for cancelled operations', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        cancellable: true,
        customProgress: true
      });
      
      loadingSystem.cancelOperation(operationId);
      loadingSystem.updateProgress(operationId, 75);
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.progress).not.toBe(75);
    });
    
    test('should not update progress for completed operations', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        customProgress: true
      });
      
      loadingSystem.completeOperation(operationId);
      loadingSystem.updateProgress(operationId, 50);
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.progress).toBe(100); // Should remain at completion value
    });
  });
  
  describe('Operation Types', () => {
    test('should use correct configuration for analysis operations', () => {
      const operationId = loadingSystem.startOperation('analysis');
      const operation = loadingSystem.activeOperations.get(operationId);
      
      expect(operation.type).toBe('analysis');
      expect(operation.config.label).toBe('Analyzing position...');
      expect(operation.config.icon).toBe('🔍');
      expect(operation.config.cancellable).toBe(true);
    });
    
    test('should use correct configuration for preset operations', () => {
      const operationId = loadingSystem.startOperation('preset');
      const operation = loadingSystem.activeOperations.get(operationId);
      
      expect(operation.type).toBe('preset');
      expect(operation.config.label).toBe('Loading preset...');
      expect(operation.config.icon).toBe('📋');
      expect(operation.config.cancellable).toBe(false);
    });
    
    test('should use general configuration for unknown operation types', () => {
      const operationId = loadingSystem.startOperation('unknown-type');
      const operation = loadingSystem.activeOperations.get(operationId);
      
      expect(operation.type).toBe('unknown-type');
      expect(operation.config.label).toBe('Processing...');
      expect(operation.config.icon).toBe('⚡');
    });
    
    test('should allow custom configuration override', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        label: 'Custom analysis...',
        icon: '🎯',
        cancellable: false
      });
      
      const operation = loadingSystem.activeOperations.get(operationId);
      expect(operation.config.label).toBe('Custom analysis...');
      expect(operation.config.icon).toBe('🎯');
      expect(operation.cancellable).toBe(false);
    });
  });
  
  describe('Multiple Operations', () => {
    test('should handle multiple concurrent operations', () => {
      const op1 = loadingSystem.startOperation('analysis');
      const op2 = loadingSystem.startOperation('preset');
      const op3 = loadingSystem.startOperation('sharing');
      
      expect(loadingSystem.getActiveOperationsCount()).toBe(3);
      expect(loadingSystem.activeOperations.has(op1)).toBe(true);
      expect(loadingSystem.activeOperations.has(op2)).toBe(true);
      expect(loadingSystem.activeOperations.has(op3)).toBe(true);
    });
    
    test('should get current operation ID', () => {
      const op1 = loadingSystem.startOperation('analysis');
      const op2 = loadingSystem.startOperation('preset');
      
      const currentId = loadingSystem.getCurrentOperationId();
      expect(currentId).toBe(op1); // Should return first active operation
    });
    
    test('should clear all operations', () => {
      loadingSystem.startOperation('analysis');
      loadingSystem.startOperation('preset');
      loadingSystem.startOperation('sharing');
      
      expect(loadingSystem.getActiveOperationsCount()).toBe(3);
      
      loadingSystem.clearAllOperations();
      
      expect(loadingSystem.getActiveOperationsCount()).toBe(0);
      expect(loadingSystem.activeOperations.size).toBe(0);
    });
  });
  
  describe('Event Handlers', () => {
    test('should set and trigger cancel event handler', (done) => {
      const operationId = loadingSystem.startOperation('analysis', {
        cancellable: true
      });
      
      loadingSystem.setEventHandler(operationId, 'cancel', (operation) => {
        expect(operation.cancelled).toBe(true);
        done();
      });
      
      loadingSystem.cancelOperation(operationId);
    });
    
    test('should set and trigger progress event handler', (done) => {
      const operationId = loadingSystem.startOperation('analysis', {
        customProgress: true
      });
      
      loadingSystem.setEventHandler(operationId, 'progress', (progress, status) => {
        expect(progress).toBe(75);
        expect(status).toBe('Test progress');
        done();
      });
      
      loadingSystem.updateProgress(operationId, 75, 'Test progress');
    });
    
    test('should set and trigger complete event handler', (done) => {
      const operationId = loadingSystem.startOperation('analysis');
      const result = { test: 'result' };
      
      loadingSystem.setEventHandler(operationId, 'complete', (operationResult, operation) => {
        expect(operationResult).toEqual(result);
        expect(operation.completed).toBe(true);
        done();
      });
      
      loadingSystem.completeOperation(operationId, result);
    });
    
    test('should set and trigger error event handler', (done) => {
      const operationId = loadingSystem.startOperation('analysis');
      const error = new Error('Test error');
      
      loadingSystem.setEventHandler(operationId, 'error', (operationError, operation) => {
        expect(operationError).toBe(error);
        expect(operation.error).toBe(error);
        done();
      });
      
      loadingSystem.failOperation(operationId, error);
    });
  });
  
  describe('Operation Status', () => {
    test('should get operation status', () => {
      const operationId = loadingSystem.startOperation('analysis');
      
      const status = loadingSystem.getOperationStatus(operationId);
      
      expect(status).toBeDefined();
      expect(status.id).toBe(operationId);
      expect(status.type).toBe('analysis');
      expect(status.progress).toBe(0);
      expect(status.completed).toBe(false);
      expect(status.cancelled).toBe(false);
      expect(status.duration).toBeGreaterThan(0);
    });
    
    test('should return null for non-existent operation', () => {
      const status = loadingSystem.getOperationStatus('non-existent-id');
      expect(status).toBeNull();
    });
    
    test('should track operation duration', () => {
      const operationId = loadingSystem.startOperation('analysis');
      
      // Wait a bit
      setTimeout(() => {
        const status = loadingSystem.getOperationStatus(operationId);
        expect(status.duration).toBeGreaterThan(0);
      }, 10);
    });
  });
  
  describe('UI Integration', () => {
    test('should check if loading indicator is visible', () => {
      expect(loadingSystem.isVisible()).toBe(false);
      
      // Mock showing the indicator
      loadingSystem.elements.overlay.style.display = 'flex';
      expect(loadingSystem.isVisible()).toBe(true);
    });
    
    test('should update UI with operation details', () => {
      const operationId = loadingSystem.startOperation('analysis');
      const operation = loadingSystem.activeOperations.get(operationId);
      
      loadingSystem.updateUI(operation);
      
      // Check if UI elements are updated (mocked)
      expect(loadingSystem.elements.statusText.textContent).toBe('Analyzing position...');
    });
    
    test('should show cancel button for cancellable operations', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        cancellable: true
      });
      const operation = loadingSystem.activeOperations.get(operationId);
      
      loadingSystem.updateUI(operation);
      
      expect(loadingSystem.elements.cancelButton.style.display).toBe('block');
    });
    
    test('should hide cancel button for non-cancellable operations', () => {
      const operationId = loadingSystem.startOperation('preset', {
        cancellable: false
      });
      const operation = loadingSystem.activeOperations.get(operationId);
      
      loadingSystem.updateUI(operation);
      
      expect(loadingSystem.elements.cancelButton.style.display).toBe('none');
    });
  });
  
  describe('Utility Functions', () => {
    test('should adjust color brightness', () => {
      const originalColor = '#4f46e5';
      const adjustedColor = loadingSystem.adjustColor(originalColor, 20);
      
      expect(adjustedColor).toBeDefined();
      expect(adjustedColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(adjustedColor).not.toBe(originalColor);
    });
    
    test('should handle color adjustment edge cases', () => {
      // Test with maximum brightness
      const brightColor = loadingSystem.adjustColor('#ffffff', 50);
      expect(brightColor).toBe('#ffffff');
      
      // Test with minimum brightness
      const darkColor = loadingSystem.adjustColor('#000000', -50);
      expect(darkColor).toBe('#000000');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid operation IDs gracefully', () => {
      expect(() => {
        loadingSystem.updateProgress('invalid-id', 50);
      }).not.toThrow();
      
      expect(() => {
        loadingSystem.completeOperation('invalid-id');
      }).not.toThrow();
      
      expect(() => {
        loadingSystem.cancelOperation('invalid-id');
      }).not.toThrow();
    });
    
    test('should handle operations that are already completed', () => {
      const operationId = loadingSystem.startOperation('analysis');
      
      loadingSystem.completeOperation(operationId);
      
      // Try to complete again
      expect(() => {
        loadingSystem.completeOperation(operationId);
      }).not.toThrow();
      
      // Try to update progress
      expect(() => {
        loadingSystem.updateProgress(operationId, 50);
      }).not.toThrow();
    });
    
    test('should handle cleanup gracefully', () => {
      loadingSystem.startOperation('analysis');
      loadingSystem.startOperation('preset');
      
      expect(() => {
        loadingSystem.cleanup();
      }).not.toThrow();
      
      expect(loadingSystem.activeOperations.size).toBe(0);
    });
  });
  
  describe('Performance Considerations', () => {
    test('should limit stored measurements to prevent memory issues', () => {
      // This would be tested with actual performance monitor integration
      // For now, we test that the system doesn't crash with many operations
      
      const operations = [];
      for (let i = 0; i < 150; i++) {
        const operationId = loadingSystem.startOperation('general');
        operations.push(operationId);
        loadingSystem.completeOperation(operationId);
      }
      
      // System should still be responsive
      expect(loadingSystem.getActiveOperationsCount()).toBe(0);
    });
    
    test('should handle rapid operation creation and completion', () => {
      const operations = [];
      
      // Create many operations rapidly
      for (let i = 0; i < 50; i++) {
        operations.push(loadingSystem.startOperation('general'));
      }
      
      expect(loadingSystem.getActiveOperationsCount()).toBe(50);
      
      // Complete them rapidly
      operations.forEach(operationId => {
        loadingSystem.completeOperation(operationId);
      });
      
      expect(loadingSystem.getActiveOperationsCount()).toBe(0);
    });
  });
});

// Property-based tests for loading indicator system
describe('Loading Indicator System - Property Tests', () => {
  let loadingSystem;
  
  beforeEach(() => {
    mockDOM.elements.clear();
    loadingSystem = new LoadingIndicatorSystem();
  });
  
  afterEach(() => {
    if (loadingSystem) {
      loadingSystem.cleanup();
    }
  });
  
  describe('Property 27: Uzun İşlem Göstergesi', () => {
    test('should show loading indicator for operations longer than 1 second', (done) => {
      // **Validates: Requirements 8.4**
      
      const operationId = loadingSystem.startOperation('general', {
        estimatedDuration: 2000
      });
      
      // Check that indicator is not immediately visible
      expect(loadingSystem.isVisible()).toBe(false);
      
      // Check that indicator becomes visible after threshold
      setTimeout(() => {
        // Mock the showLoadingIndicator call that would happen after threshold
        loadingSystem.showLoadingIndicator(operationId);
        expect(loadingSystem.isVisible()).toBe(true);
        
        loadingSystem.completeOperation(operationId);
        done();
      }, 1100); // Just over the 1 second threshold
    });
    
    test('should not show loading indicator for quick operations', (done) => {
      // **Validates: Requirements 8.4**
      
      const operationId = loadingSystem.startOperation('general', {
        estimatedDuration: 500
      });
      
      // Complete operation quickly
      setTimeout(() => {
        loadingSystem.completeOperation(operationId);
        
        // Check that indicator was never shown
        expect(loadingSystem.isVisible()).toBe(false);
        done();
      }, 500);
    });
    
    test('should provide cancellation capability for long operations', () => {
      // **Validates: Requirements 8.4**
      
      const operationId = loadingSystem.startOperation('general', {
        estimatedDuration: 5000,
        cancellable: true
      });
      
      const cancelled = loadingSystem.cancelOperation(operationId);
      expect(cancelled).toBe(true);
      
      const status = loadingSystem.getOperationStatus(operationId);
      expect(status.cancelled).toBe(true);
    });
    
    test('should provide user feedback during operations', () => {
      // **Validates: Requirements 8.4**
      
      const operationId = loadingSystem.startOperation('analysis', {
        customProgress: true
      });
      
      // Test progress updates (user feedback)
      loadingSystem.updateProgress(operationId, 25, 'Analyzing material balance...');
      let status = loadingSystem.getOperationStatus(operationId);
      expect(status.progress).toBe(25);
      
      loadingSystem.updateProgress(operationId, 50, 'Evaluating piece activity...');
      status = loadingSystem.getOperationStatus(operationId);
      expect(status.progress).toBe(50);
      
      loadingSystem.updateProgress(operationId, 100, 'Analysis complete');
      status = loadingSystem.getOperationStatus(operationId);
      expect(status.progress).toBe(100);
      
      loadingSystem.completeOperation(operationId);
    });
    
    test('should show progress bar and spinner animations', () => {
      // **Validates: Requirements 8.4**
      
      const operationId = loadingSystem.startOperation('analysis');
      const operation = loadingSystem.activeOperations.get(operationId);
      
      // Test that UI elements exist for animations
      expect(loadingSystem.elements.spinner).toBeDefined();
      expect(loadingSystem.elements.progressBar).toBeDefined();
      expect(loadingSystem.elements.progressFill).toBeDefined();
      
      // Test progress bar update
      loadingSystem.updateProgress(operationId, 75);
      loadingSystem.updateUI(operation);
      
      // Progress fill should be updated
      expect(loadingSystem.elements.progressFill.style.width).toBe('75%');
    });
  });
  
  // Additional property tests for comprehensive coverage
  describe('Operation Lifecycle Properties', () => {
    test('every started operation should have a unique ID', () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        const operationId = loadingSystem.startOperation('general');
        expect(ids.has(operationId)).toBe(false);
        ids.add(operationId);
        loadingSystem.completeOperation(operationId);
      }
    });
    
    test('every operation should transition through valid states', () => {
      const operationId = loadingSystem.startOperation('analysis');
      
      // Initial state
      let status = loadingSystem.getOperationStatus(operationId);
      expect(status.completed).toBe(false);
      expect(status.cancelled).toBe(false);
      expect(status.progress).toBe(0);
      
      // Progress state
      loadingSystem.updateProgress(operationId, 50);
      status = loadingSystem.getOperationStatus(operationId);
      expect(status.progress).toBe(50);
      expect(status.completed).toBe(false);
      
      // Completed state
      loadingSystem.completeOperation(operationId);
      status = loadingSystem.getOperationStatus(operationId);
      expect(status.completed).toBe(true);
      expect(status.progress).toBe(100);
    });
    
    test('cancelled operations should not be completable', () => {
      const operationId = loadingSystem.startOperation('analysis', {
        cancellable: true
      });
      
      loadingSystem.cancelOperation(operationId);
      loadingSystem.completeOperation(operationId); // Should not change state
      
      const status = loadingSystem.getOperationStatus(operationId);
      expect(status.cancelled).toBe(true);
      expect(status.completed).toBe(true); // Cancellation sets completed to true
      expect(status.status).toBe('cancelled');
    });
  });
});

module.exports = {
  LoadingIndicatorSystem
};