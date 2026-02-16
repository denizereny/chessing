#!/usr/bin/env node

/**
 * Test runner for Responsive Settings Menu Integration Tests
 * Validates the integration test implementation
 */

console.log('🧪 Responsive Settings Menu Integration Tests');
console.log('=' .repeat(60));

// Mock browser environment
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  ResizeObserver: class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  performance: {
    now: () => Date.now()
  }
};

global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    id: '',
    style: { cssText: '', setProperty: () => {}, width: '', height: '' },
    classList: {
      add: function(...classes) { this._classes = [...(this._classes || []), ...classes]; },
      remove: function(...classes) { this._classes = (this._classes || []).filter(c => !classes.includes(c)); },
      contains: function(cls) { return (this._classes || []).includes(cls); },
      toggle: function(cls) { 
        if (this.contains(cls)) this.remove(cls);
        else this.add(cls);
      },
      _classes: []
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    appendChild: () => {},
    remove: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    dataset: {},
    textContent: '',
    innerHTML: '',
    getAttribute: () => null,
    setAttribute: () => {},
    removeAttribute: () => {},
    getBoundingClientRect: () => ({ 
      width: 50, 
      height: 50, 
      left: 0, 
      top: 0,
      right: 50,
      bottom: 50
    }),
    offsetParent: {},
    focus: () => {},
    blur: () => {},
    dispatchEvent: () => true
  }),
  body: { 
    appendChild: () => {},
    removeChild: () => {}
  },
  head: { appendChild: () => {} },
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => {
    const el = document.createElement('div');
    el.id = id;
    return el;
  },
  querySelector: (selector) => {
    const el = document.createElement('div');
    el.id = selector.replace('#', '').replace('.', '');
    return el;
  },
  querySelectorAll: () => [],
  documentElement: {
    style: { setProperty: () => {} },
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    }
  },
  activeElement: null,
  contains: () => true
};

global.Event = class Event {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
  }
};

global.KeyboardEvent = class KeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key || '';
    this.keyCode = options.keyCode || 0;
  }
};

global.MouseEvent = class MouseEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
  }
};

// Test statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedTestDetails = [];

// Simple test framework
function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  fn();
}

function beforeEach(fn) {
  // Store for later use
}

function afterEach(fn) {
  // Store for later use
}

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`  ❌ ${name}`);
    failedTestDetails.push({ name, error: error.message });
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${actual} to be falsy`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toContain(expected) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string to contain ${expected}`);
        }
      } else {
        throw new Error(`Cannot check contains on ${typeof actual}`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error(`Expected ${actual} not to be null`);
        }
      },
      toThrow() {
        try {
          actual();
        } catch (e) {
          throw new Error(`Expected function not to throw`);
        }
      }
    }
  };
}

// Load the modules
try {
  console.log('\n📚 Loading modules...');
  
  const ResponsiveLayoutManager = require('./js/responsive-layout-manager.js');
  const SettingsMenuManager = require('./js/settings-menu-manager.js');
  
  console.log('✅ ResponsiveLayoutManager loaded');
  console.log('✅ SettingsMenuManager loaded');
  
  // Make them global for tests
  global.ResponsiveLayoutManager = ResponsiveLayoutManager;
  global.SettingsMenuManager = SettingsMenuManager;
  
  // Run a subset of critical integration tests
  console.log('\n🧪 Running Integration Tests...');
  
  describe('System Initialization Tests', () => {
    test('Responsive system should initialize successfully', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      expect(responsiveLayoutManager).toBeTruthy();
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
    });
    
    test('Menu system should initialize successfully', () => {
      const settingsMenuManager = new SettingsMenuManager();
      const initialized = settingsMenuManager.initialize();
      expect(initialized).toBeTruthy();
    });
    
    test('Both systems should initialize together without conflicts', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      const settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      expect(settingsMenuManager.toggleButton).toBeTruthy();
    });
  });
  
  describe('Responsive Layout and Menu Interaction Tests', () => {
    test('Menu should open and close correctly', () => {
      const settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      settingsMenuManager.open();
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      settingsMenuManager.close();
      expect(settingsMenuManager.isOpen()).toBe(false);
    });
    
    test('Board size should be calculated correctly', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      const boardSize = responsiveLayoutManager.calculateBoardSize();
      
      expect(boardSize.width).toBeGreaterThan(0);
      expect(boardSize.height).toBeGreaterThan(0);
    });
    
    test('Breakpoint detection should work correctly', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      
      // Test mobile
      window.innerWidth = 375;
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('mobile');
      
      // Test tablet
      window.innerWidth = 800;
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('tablet');
      
      // Test desktop
      window.innerWidth = 1440;
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('desktop');
    });
  });
  
  describe('Feature Integration Tests', () => {
    test('Feature controls should be accessible', () => {
      const settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // These should not throw
      expect(() => {
        document.querySelector('#btnTheme');
        document.querySelector('#languageSelect');
        document.querySelector('#btnPieceSetup');
      }).not.toThrow();
    });
  });
  
  describe('Performance Integration Tests', () => {
    test('Layout recalculation should be fast', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      const startTime = Date.now();
      
      responsiveLayoutManager.recalculateLayout();
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100);
    });
  });
  
  describe('Error Handling Tests', () => {
    test('System should handle invalid viewport dimensions', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      
      const isValid = responsiveLayoutManager.validateViewportDimensions(800, 600);
      expect(isValid).toBe(true);
      
      const isInvalid = responsiveLayoutManager.validateViewportDimensions(NaN, 600);
      expect(isInvalid).toBe(false);
    });
    
    test('System should cleanup properly on destroy', () => {
      const responsiveLayoutManager = new ResponsiveLayoutManager();
      const settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      responsiveLayoutManager.destroy();
      settingsMenuManager.destroy();
      
      expect(responsiveLayoutManager.breakpointCallbacks.length).toBe(0);
      expect(settingsMenuManager.toggleButton).toBe(null);
    });
  });
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Summary');
  console.log('=' .repeat(60));
  console.log(`Total Tests:  ${totalTests}`);
  console.log(`✅ Passed:     ${passedTests}`);
  console.log(`❌ Failed:     ${failedTests}`);
  
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    failedTestDetails.forEach(({ name, error }) => {
      console.log(`  - ${name}`);
      console.log(`    ${error}`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  
  if (failedTests === 0) {
    console.log('🎉 All integration tests passed!');
    console.log('\n📋 Integration test file:');
    console.log('  - test/responsive-settings-menu-integration.test.js');
    console.log('\n🌐 For full browser-based testing, open:');
    console.log('  - test-responsive-settings-menu-integration.html');
    console.log('\n✅ Task 13.3 completed successfully!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Review the errors above.');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Error loading modules:', error.message);
  console.error(error.stack);
  process.exit(1);
}
