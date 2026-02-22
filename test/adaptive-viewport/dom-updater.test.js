/**
 * Unit Tests for DOMUpdater
 * Tests DOM manipulation, transitions, and layout application
 */

// Import dependencies
const DOMUpdater = require('../../js/adaptive-viewport/dom-updater.js');
const AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');

/**
 * Mock DOM environment for testing
 */
class MockElement {
  constructor(id = '') {
    this.id = id;
    this.className = '';
    this.style = {};
    this.children = [];
    this.parentElement = null;
    this.eventListeners = {};
    this._boundingRect = { left: 0, top: 0, width: 100, height: 100 };
  }

  getBoundingClientRect() {
    return { ...this._boundingRect };
  }

  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
  }

  querySelector(selector) {
    if (selector === '.scroll-indicator') {
      return this.children.find(c => c.className.includes('scroll-indicator'));
    }
    return null;
  }

  insertBefore(newNode, referenceNode) {
    const index = this.children.indexOf(referenceNode);
    if (index >= 0) {
      this.children.splice(index, 0, newNode);
    } else {
      this.children.unshift(newNode);
    }
    newNode.parentElement = this;
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
    }
  }
}

// Mock window and document
global.window = {
  getComputedStyle: (element) => ({
    transform: element.style.transform || '',
    zIndex: element.style.zIndex || '0'
  }),
  requestAnimationFrame: (callback) => {
    setTimeout(callback, 0);
    return 1;
  }
};

global.document = {
  createElement: (tag) => new MockElement(),
  querySelector: (selector) => {
    if (selector === '#board' || selector === '.board') {
      return new MockElement('board');
    }
    if (selector === '.adaptive-scroll-container') {
      return null;
    }
    return null;
  }
};

/**
 * Test Suite
 */
describe('DOMUpdater', () => {
  let domUpdater;

  beforeEach(() => {
    domUpdater = new DOMUpdater();
  });

  afterEach(() => {
    if (domUpdater) {
      domUpdater.destroy();
    }
  });

  describe('Constructor', () => {
    test('should create instance with default configuration', () => {
      expect(domUpdater).toBeDefined();
      expect(domUpdater.getConfig('transitionDuration')).toBe(300);
      expect(domUpdater.getConfig('useTransforms')).toBe(true);
    });

    test('should accept custom configuration', () => {
      const customUpdater = new DOMUpdater({
        transitionDuration: 500,
        useTransforms: false
      });

      expect(customUpdater.getConfig('transitionDuration')).toBe(500);
      expect(customUpdater.getConfig('useTransforms')).toBe(false);

      customUpdater.destroy();
    });

    test('should initialize empty original positions map', () => {
      expect(domUpdater.originalPositions.size).toBe(0);
    });

    test('should initialize empty animating elements set', () => {
      expect(domUpdater.animatingElements.size).toBe(0);
    });

    test('should initialize empty update queue', () => {
      expect(domUpdater.updateQueue.length).toBe(0);
    });
  });

  describe('updateElementPosition', () => {
    test('should update element position with valid position', async () => {
      const element = new MockElement('test-element');
      const position = {
        x: 100,
        y: 200,
        width: 300,
        height: 400,
        transform: 'translate(100px, 200px)',
        zIndex: 5
      };

      await domUpdater.updateElementPosition(element, position);

      expect(element.style.transform).toBe('translate(100px, 200px)');
      expect(element.style.width).toBe('300px');
      expect(element.style.height).toBe('400px');
      expect(element.style.zIndex).toBe(5);
    });

    test('should throw error if element is null', async () => {
      const position = { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 0 };

      await expect(domUpdater.updateElementPosition(null, position))
        .rejects.toThrow('Element is required');
    });

    test('should throw error if position is invalid', async () => {
      const element = new MockElement('test-element');
      const invalidPosition = { x: -10, y: 0, width: 100, height: 100, transform: '', zIndex: 0 };

      await expect(domUpdater.updateElementPosition(element, invalidPosition))
        .rejects.toThrow('Invalid position');
    });

    test('should store original position on first update', async () => {
      const element = new MockElement('test-element');
      element._boundingRect = { left: 50, top: 60, width: 100, height: 100 };
      
      const position = { x: 100, y: 200, width: 300, height: 400, transform: '', zIndex: 0 };

      await domUpdater.updateElementPosition(element, position);

      expect(domUpdater.originalPositions.has(element)).toBe(true);
      const original = domUpdater.originalPositions.get(element);
      expect(original.x).toBe(50);
      expect(original.y).toBe(60);
    });

    test('should apply transition styles', async () => {
      const element = new MockElement('test-element');
      const position = { x: 100, y: 200, width: 300, height: 400, transform: '', zIndex: 0 };

      await domUpdater.updateElementPosition(element, position);

      expect(element.style.transition).toBeDefined();
      expect(element.style.transition).toContain('300ms');
    });

    test('should mark element as animating during transition', async () => {
      const element = new MockElement('test-element');
      const position = { x: 100, y: 200, width: 300, height: 400, transform: '', zIndex: 0 };

      const promise = domUpdater.updateElementPosition(element, position);
      
      // Check immediately - should be animating
      expect(domUpdater.animatingElements.has(element)).toBe(true);

      await promise;

      // After completion - should not be animating
      expect(domUpdater.animatingElements.has(element)).toBe(false);
    });

    test('should use absolute positioning when useTransforms is false', async () => {
      const customUpdater = new DOMUpdater({ useTransforms: false });
      const element = new MockElement('test-element');
      const position = { x: 100, y: 200, width: 300, height: 400, transform: '', zIndex: 0 };

      await customUpdater.updateElementPosition(element, position);

      expect(element.style.position).toBe('absolute');
      expect(element.style.left).toBe('100px');
      expect(element.style.top).toBe('200px');

      customUpdater.destroy();
    });
  });

  describe('batchUpdate', () => {
    test('should apply multiple updates in single batch', async () => {
      const element1 = new MockElement('element1');
      const element2 = new MockElement('element2');
      const element3 = new MockElement('element3');

      const updates = [
        { element: element1, position: { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 1 } },
        { element: element2, position: { x: 100, y: 0, width: 100, height: 100, transform: '', zIndex: 2 } },
        { element: element3, position: { x: 200, y: 0, width: 100, height: 100, transform: '', zIndex: 3 } }
      ];

      await domUpdater.batchUpdate(updates);

      expect(element1.style.width).toBe('100px');
      expect(element2.style.width).toBe('100px');
      expect(element3.style.width).toBe('100px');
    });

    test('should handle empty updates array', async () => {
      await expect(domUpdater.batchUpdate([])).resolves.toBeUndefined();
    });

    test('should throw error if update missing element', async () => {
      const updates = [
        { position: { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } }
      ];

      await expect(domUpdater.batchUpdate(updates))
        .rejects.toThrow('Update missing element');
    });

    test('should throw error if update has invalid position', async () => {
      const element = new MockElement('test');
      const updates = [
        { element, position: { x: -10, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } }
      ];

      await expect(domUpdater.batchUpdate(updates))
        .rejects.toThrow('Invalid position');
    });

    test('should store original positions for all elements', async () => {
      const element1 = new MockElement('element1');
      const element2 = new MockElement('element2');

      const updates = [
        { element: element1, position: { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } },
        { element: element2, position: { x: 100, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } }
      ];

      await domUpdater.batchUpdate(updates);

      expect(domUpdater.originalPositions.has(element1)).toBe(true);
      expect(domUpdater.originalPositions.has(element2)).toBe(true);
    });

    test('should mark batch in progress during update', async () => {
      const element = new MockElement('test');
      const updates = [
        { element, position: { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } }
      ];

      const promise = domUpdater.batchUpdate(updates);
      
      // Should be in progress immediately
      expect(domUpdater.batchInProgress).toBe(true);

      await promise;

      // Should be complete after
      expect(domUpdater.batchInProgress).toBe(false);
    });
  });

  describe('applyLayout', () => {
    test('should apply complete layout configuration', async () => {
      const element1 = new MockElement('element1');
      const element2 = new MockElement('element2');

      const configuration = {
        boardPosition: { x: 0, y: 0, width: 400, height: 400, transform: '', zIndex: 1 },
        elementPositions: new Map([
          [element1, { x: 420, y: 0, width: 200, height: 100, transform: '', zIndex: 2 }],
          [element2, { x: 420, y: 120, width: 200, height: 100, transform: '', zIndex: 3 }]
        ]),
        layoutStrategy: 'horizontal',
        requiresScrolling: false,
        scrollContainers: []
      };

      await domUpdater.applyLayout(configuration);

      expect(element1.style.width).toBe('200px');
      expect(element2.style.width).toBe('200px');
    });

    test('should throw error if configuration is null', async () => {
      await expect(domUpdater.applyLayout(null))
        .rejects.toThrow('Configuration is required');
    });

    test('should throw error if configuration is invalid', async () => {
      const invalidConfig = {
        boardPosition: { x: -10, y: 0, width: 400, height: 400, transform: '', zIndex: 1 },
        elementPositions: new Map(),
        layoutStrategy: 'horizontal',
        requiresScrolling: false,
        scrollContainers: []
      };

      await expect(domUpdater.applyLayout(invalidConfig))
        .rejects.toThrow('Invalid layout configuration');
    });

    test('should handle configuration without board position', async () => {
      const element = new MockElement('element');
      const configuration = {
        elementPositions: new Map([
          [element, { x: 0, y: 0, width: 200, height: 100, transform: '', zIndex: 1 }]
        ]),
        layoutStrategy: 'vertical',
        requiresScrolling: false,
        scrollContainers: []
      };

      await expect(domUpdater.applyLayout(configuration)).resolves.toBeUndefined();
    });

    test('should handle configuration without element positions', async () => {
      const configuration = {
        boardPosition: { x: 0, y: 0, width: 400, height: 400, transform: '', zIndex: 1 },
        layoutStrategy: 'horizontal',
        requiresScrolling: false,
        scrollContainers: []
      };

      await expect(domUpdater.applyLayout(configuration)).resolves.toBeUndefined();
    });
  });

  describe('revertToDefault', () => {
    test('should revert elements to original positions', async () => {
      const element = new MockElement('test');
      element._boundingRect = { left: 50, top: 60, width: 100, height: 100 };

      // Apply new position
      const newPosition = { x: 200, y: 300, width: 150, height: 150, transform: '', zIndex: 5 };
      await domUpdater.updateElementPosition(element, newPosition);

      // Revert to original
      await domUpdater.revertToDefault([element]);

      // Should be back to original position
      expect(element.style.transform).toContain('50');
      expect(element.style.transform).toContain('60');
    });

    test('should revert all elements if no array provided', async () => {
      const element1 = new MockElement('element1');
      const element2 = new MockElement('element2');

      await domUpdater.updateElementPosition(element1, { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 });
      await domUpdater.updateElementPosition(element2, { x: 200, y: 200, width: 100, height: 100, transform: '', zIndex: 0 });

      expect(domUpdater.originalPositions.size).toBe(2);

      await domUpdater.revertToDefault();

      expect(domUpdater.originalPositions.size).toBe(0);
    });

    test('should handle empty elements array', async () => {
      await expect(domUpdater.revertToDefault([])).resolves.toBeUndefined();
    });

    test('should only revert specified elements', async () => {
      const element1 = new MockElement('element1');
      const element2 = new MockElement('element2');

      await domUpdater.updateElementPosition(element1, { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 });
      await domUpdater.updateElementPosition(element2, { x: 200, y: 200, width: 100, height: 100, transform: '', zIndex: 0 });

      await domUpdater.revertToDefault([element1]);

      expect(domUpdater.originalPositions.has(element1)).toBe(false);
      expect(domUpdater.originalPositions.has(element2)).toBe(true);
    });
  });

  describe('Animation State', () => {
    test('isAnimating should return true during animation', async () => {
      const element = new MockElement('test');
      const position = { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 };

      const promise = domUpdater.updateElementPosition(element, position);
      
      expect(domUpdater.isAnimating()).toBe(true);

      await promise;

      expect(domUpdater.isAnimating()).toBe(false);
    });

    test('isAnimating should return true during batch update', async () => {
      const element = new MockElement('test');
      const updates = [
        { element, position: { x: 0, y: 0, width: 100, height: 100, transform: '', zIndex: 0 } }
      ];

      const promise = domUpdater.batchUpdate(updates);
      
      expect(domUpdater.isAnimating()).toBe(true);

      await promise;

      expect(domUpdater.isAnimating()).toBe(false);
    });

    test('getQueuedUpdateCount should return queue length', () => {
      expect(domUpdater.getQueuedUpdateCount()).toBe(0);

      domUpdater.updateQueue.push({ element: new MockElement(), position: {} });
      expect(domUpdater.getQueuedUpdateCount()).toBe(1);
    });

    test('clearQueue should empty update queue', () => {
      domUpdater.updateQueue.push({ element: new MockElement(), position: {} });
      domUpdater.updateQueue.push({ element: new MockElement(), position: {} });

      expect(domUpdater.getQueuedUpdateCount()).toBe(2);

      domUpdater.clearQueue();

      expect(domUpdater.getQueuedUpdateCount()).toBe(0);
    });
  });

  describe('Event Handler Preservation', () => {
    test('should preserve event handlers after position update', async () => {
      const element = new MockElement('test');
      let clickCount = 0;
      const clickHandler = () => clickCount++;

      element.addEventListener('click', clickHandler);

      const position = { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 };
      await domUpdater.updateElementPosition(element, position);

      // Simulate click
      element.eventListeners.click.forEach(handler => handler());

      expect(clickCount).toBe(1);
    });

    test('should preserve multiple event handlers', async () => {
      const element = new MockElement('test');
      let clickCount = 0;
      let mouseoverCount = 0;

      element.addEventListener('click', () => clickCount++);
      element.addEventListener('mouseover', () => mouseoverCount++);

      const position = { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 };
      await domUpdater.updateElementPosition(element, position);

      // Simulate events
      element.eventListeners.click.forEach(handler => handler());
      element.eventListeners.mouseover.forEach(handler => handler());

      expect(clickCount).toBe(1);
      expect(mouseoverCount).toBe(1);
    });
  });

  describe('Theme Styling Preservation', () => {
    test('should preserve element classes after position update', async () => {
      const element = new MockElement('test');
      element.className = 'theme-dark button-primary';

      const position = { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 };
      await domUpdater.updateElementPosition(element, position);

      expect(element.className).toBe('theme-dark button-primary');
    });

    test('should preserve element ID after position update', async () => {
      const element = new MockElement('my-special-element');

      const position = { x: 100, y: 100, width: 100, height: 100, transform: '', zIndex: 0 };
      await domUpdater.updateElementPosition(element, position);

      expect(element.id).toBe('my-special-element');
    });
  });

  describe('Destroy', () => {
    test('should clear all state on destroy', () => {
      const element = new MockElement('test');
      domUpdater.originalPositions.set(element, {});
      domUpdater.animatingElements.add(element);
      domUpdater.updateQueue.push({});

      domUpdater.destroy();

      expect(domUpdater.originalPositions.size).toBe(0);
      expect(domUpdater.animatingElements.size).toBe(0);
      expect(domUpdater.updateQueue.length).toBe(0);
    });
  });
});

// Export for test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { describe, test, expect, beforeEach, afterEach };
}
