/**
 * Unit Tests for Error Handling and Fallbacks
 * Tests API unavailability fallback and calculation error fallback
 * Validates: Requirements 10.1, 10.2
 */

describe('Error Handling and Fallbacks', () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  afterEach(() => {
    errorHandler.clearErrorLog();
  });

  describe('API Unavailability Fallback (Task 12.2)', () => {
    it('should detect IntersectionObserver unavailability', () => {
      const error = new Error('IntersectionObserver is not defined');
      const result = errorHandler.handleError(error, 'visibility-detection');

      expect(result.usePolyfill).toBe(true);
      expect(result.fallbackMethod).toBe('viewport-dimensions');
    });

    it('should detect ResizeObserver unavailability', () => {
      const error = new Error('ResizeObserver is not supported');
      const result = errorHandler.handleError(error, 'resize-detection');

      expect(result.usePolyfill).toBe(true);
      expect(result.fallbackMethod).toBe('viewport-dimensions');
    });

    it('should detect requestAnimationFrame unavailability', () => {
      const error = new Error('requestAnimationFrame is not available');
      const result = errorHandler.handleError(error, 'animation');

      expect(result.usePolyfill).toBe(true);
      expect(result.fallbackMethod).toBe('viewport-dimensions');
    });

    it('should provide requestAnimationFrame fallback', () => {
      const fallback = errorHandler.getRequestAnimationFrameFallback();
      
      expect(typeof fallback).toBe('function');
      
      // Test fallback works
      let called = false;
      const id = fallback(() => {
        called = true;
      });
      
      expect(typeof id).toBe('number');
      
      // Wait for callback
      setTimeout(() => {
        expect(called).toBe(true);
      }, 20);
    });

    it('should provide cancelAnimationFrame fallback', () => {
      const cancelFallback = errorHandler.getCancelAnimationFrameFallback();
      
      expect(typeof cancelFallback).toBe('function');
      
      // Test fallback works
      let called = false;
      const fallback = errorHandler.getRequestAnimationFrameFallback();
      const id = fallback(() => {
        called = true;
      });
      
      cancelFallback(id);
      
      // Wait to ensure callback wasn't called
      setTimeout(() => {
        expect(called).toBe(false);
      }, 20);
    });

    it('should check IntersectionObserver availability', () => {
      const isAvailable = errorHandler.isIntersectionObserverAvailable();
      
      // Should return boolean
      expect(typeof isAvailable).toBe('boolean');
      
      // In modern browsers, should be available
      if (typeof IntersectionObserver !== 'undefined') {
        expect(isAvailable).toBe(true);
      }
    });

    it('should check ResizeObserver availability', () => {
      const isAvailable = errorHandler.isResizeObserverAvailable();
      
      expect(typeof isAvailable).toBe('boolean');
    });

    it('should check requestAnimationFrame availability', () => {
      const isAvailable = errorHandler.isRequestAnimationFrameAvailable();
      
      expect(typeof isAvailable).toBe('boolean');
      
      // Should be available in modern browsers
      if (typeof requestAnimationFrame !== 'undefined') {
        expect(isAvailable).toBe(true);
      }
    });

    it('should log API unavailability errors', () => {
      const error = new Error('IntersectionObserver is not defined');
      errorHandler.handleError(error, 'visibility-detection');

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe('API_UNAVAILABLE');
      expect(log[0].context).toBe('visibility-detection');
    });
  });

  describe('Calculation Error Fallback (Task 12.3)', () => {
    it('should detect NaN in calculations', () => {
      const error = new Error('Calculation resulted in NaN');
      const result = errorHandler.handleError(error, 'layout-calculation');

      expect(result.layoutStrategy).toBe('horizontal');
      expect(result.boardSize).toEqual({ width: 400, height: 400 });
      expect(result.useStandardBreakpoints).toBe(true);
    });

    it('should detect Infinity in calculations', () => {
      const error = new Error('Value is Infinity');
      const result = errorHandler.handleError(error, 'board-size-calculation');

      expect(result.layoutStrategy).toBe('horizontal');
      expect(result.useStandardBreakpoints).toBe(true);
    });

    it('should detect invalid dimensions', () => {
      const error = new Error('Invalid dimensions provided');
      const result = errorHandler.handleError(error, 'dimension-validation');

      expect(result.layoutStrategy).toBe('horizontal');
      expect(result.boardSize.width).toBeGreaterThan(0);
      expect(result.boardSize.height).toBeGreaterThan(0);
    });

    it('should apply default layout on calculation errors', () => {
      const result = errorHandler.applyDefaultLayout();

      expect(result.layoutStrategy).toBe('horizontal');
      expect(result.boardSize).toEqual({ width: 400, height: 400 });
      expect(result.useStandardBreakpoints).toBe(true);
      expect(result.message).toContain('default layout');
    });

    it('should log calculation errors', () => {
      const error = new Error('Calculation error: invalid input');
      errorHandler.handleError(error, 'layout-optimization');

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe('CALCULATION_ERROR');
    });

    it('should handle multiple calculation errors', () => {
      const errors = [
        new Error('NaN detected'),
        new Error('Infinity detected'),
        new Error('Invalid calculation')
      ];

      errors.forEach((error, index) => {
        errorHandler.handleError(error, `calculation-${index}`);
      });

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(3);
      expect(log.every(entry => entry.type === 'CALCULATION_ERROR')).toBe(true);
    });
  });

  describe('DOM Error Handling', () => {
    it('should skip problematic elements', () => {
      const element = document.createElement('div');
      element.id = 'problematic-element';
      
      const error = new Error('Element not found in DOM');
      error.element = element;
      
      const result = errorHandler.handleError(error, 'dom-update');

      expect(result.skipElement).toBe(true);
      expect(result.element).toBe(element);
    });

    it('should log DOM errors', () => {
      const error = new Error('querySelector failed');
      errorHandler.handleError(error, 'element-selection');

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe('DOM_ERROR');
    });
  });

  describe('Performance Error Handling', () => {
    it('should use cached layout on performance errors', () => {
      const error = new Error('Operation timeout');
      const result = errorHandler.handleError(error, 'layout-calculation');

      expect(result.useCached).toBe(true);
      expect(result.message).toContain('cached');
    });

    it('should log performance errors', () => {
      const error = new Error('Performance threshold exceeded');
      errorHandler.handleError(error, 'optimization');

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].type).toBe('PERFORMANCE_ERROR');
    });
  });

  describe('Error Categorization', () => {
    it('should categorize API errors correctly', () => {
      const error = new Error('IntersectionObserver not supported');
      const type = errorHandler.categorizeError(error);
      expect(type).toBe('API_UNAVAILABLE');
    });

    it('should categorize calculation errors correctly', () => {
      const error = new Error('Result is NaN');
      const type = errorHandler.categorizeError(error);
      expect(type).toBe('CALCULATION_ERROR');
    });

    it('should categorize DOM errors correctly', () => {
      const error = new Error('Element not found');
      const type = errorHandler.categorizeError(error);
      expect(type).toBe('DOM_ERROR');
    });

    it('should categorize performance errors correctly', () => {
      const error = new Error('Operation timeout');
      const type = errorHandler.categorizeError(error);
      expect(type).toBe('PERFORMANCE_ERROR');
    });

    it('should categorize unknown errors', () => {
      const error = new Error('Something went wrong');
      const type = errorHandler.categorizeError(error);
      expect(type).toBe('UNKNOWN');
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics', () => {
      errorHandler.handleError(new Error('NaN detected'), 'calc-1');
      errorHandler.handleError(new Error('Infinity detected'), 'calc-2');
      errorHandler.handleError(new Error('IntersectionObserver missing'), 'api-1');

      const stats = errorHandler.getErrorStats();
      expect(stats.total).toBe(3);
      expect(stats.byType.CALCULATION_ERROR).toBe(2);
      expect(stats.byType.API_UNAVAILABLE).toBe(1);
    });

    it('should track errors by context', () => {
      errorHandler.handleError(new Error('Error 1'), 'context-a');
      errorHandler.handleError(new Error('Error 2'), 'context-a');
      errorHandler.handleError(new Error('Error 3'), 'context-b');

      const stats = errorHandler.getErrorStats();
      expect(stats.byContext['context-a']).toBe(2);
      expect(stats.byContext['context-b']).toBe(1);
    });
  });

  describe('Error Log Management', () => {
    it('should maintain error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-context');

      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].message).toBe('Test error');
      expect(log[0].context).toBe('test-context');
    });

    it('should clear error log', () => {
      errorHandler.handleError(new Error('Error 1'), 'context-1');
      errorHandler.handleError(new Error('Error 2'), 'context-2');

      expect(errorHandler.getErrorLog().length).toBe(2);

      errorHandler.clearErrorLog();

      expect(errorHandler.getErrorLog().length).toBe(0);
    });

    it('should limit log size', () => {
      // Add more than maxLogSize errors
      for (let i = 0; i < 150; i++) {
        errorHandler.handleError(new Error(`Error ${i}`), `context-${i}`);
      }

      const log = errorHandler.getErrorLog();
      expect(log.length).toBeLessThanOrEqual(100);
    });
  });
});
