/**
 * Simple Test Runner for Mobile Optimization Manager
 * Validates core functionality without requiring external test frameworks
 */

// Mock DOM environment
global.document = {
  createElement: (tag) => ({
    className: '',
    style: { cssText: '', minWidth: '', minHeight: '', padding: '', transform: '' },
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    },
    addEventListener: () => {},
    appendChild: () => {},
    remove: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    textContent: '',
    innerHTML: '',
    dataset: {},
    parentNode: null,
    id: ''
  }),
  body: {
    appendChild: () => {}
  },
  head: {
    appendChild: () => {}
  },
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  elementFromPoint: () => null
};

global.window = {
  innerWidth: 375,
  innerHeight: 667,
  screen: {
    width: 375,
    height: 667,
    orientation: { type: 'portrait-primary' }
  },
  devicePixelRatio: 2,
  addEventListener: () => {},
  dispatchEvent: () => {},
  TouchEvent: function(type, options) {
    this.type = type;
    this.touches = options.touches || [];
    this.changedTouches = options.changedTouches || [];
    this.preventDefault = () => {};
  }
};

global.navigator = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  vibrate: function(pattern) {
    console.log(`📳 Haptic feedback: ${JSON.stringify(pattern)}`);
    return true;
  },
  maxTouchPoints: 5
};

global.screen = {
  width: 375,
  height: 667,
  orientation: { type: 'portrait-primary' }
};

// Mock translations
global.t = (key) => {
  const translations = {
    'piecePlaced': 'Piece placed!',
    'invalidMove': 'Invalid move!',
    'pieceRemoved': 'Piece removed!',
    'quickPlacement': 'Quick placement!',
    'noValidPlacement': 'No valid placement available!',
    'longPressForInfo': 'Long press for info'
  };
  return translations[key] || key;
};

// Mock setup board
global.setupBoard = Array(5).fill().map(() => Array(4).fill(null));
global.selectedPalettePiece = null;
global.TASLAR = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Mock functions
global.drawSetupBoard = () => console.log('drawSetupBoard called');

// Load the mobile optimization manager
const MobileOptimizationManager = require('./js/mobile-optimization-manager.js');

// Test runner
class SimpleTestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }
  
  test(name, testFn) {
    this.tests.push({ name, testFn });
  }
  
  async run() {
    console.log('🧪 Running Mobile Optimization Manager Tests...\n');
    
    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed === 0) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed');
    }
  }
}

// Create test runner
const runner = new SimpleTestRunner();

// Mock enhanced UI and drag & drop systems
const mockEnhancedUI = {
  animateElement: () => {},
  showSelectionFeedback: () => {},
  showSuccessAnimation: () => {},
  createParticleEffect: () => {},
  showEnhancedNotification: () => {},
  showDragFeedback: () => {},
  deviceType: 'mobile'
};

const mockDragDropSystem = {
  validateDrop: () => true,
  getValidationError: () => 'Test error',
  showDragGhost: () => {},
  updateDragGhost: () => {},
  hideDragGhost: () => {},
  feedbackElements: {
    dragGhost: { style: { left: '', top: '', opacity: '' } }
  }
};

// Test cases
runner.test('Mobile Optimization Manager should initialize correctly', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  if (!manager.deviceCapabilities) {
    throw new Error('Device capabilities not initialized');
  }
  
  if (!manager.touchState) {
    throw new Error('Touch state not initialized');
  }
  
  if (!manager.gestureSettings) {
    throw new Error('Gesture settings not initialized');
  }
  
  if (!manager.hapticPatterns) {
    throw new Error('Haptic patterns not initialized');
  }
  
  manager.cleanup();
});

runner.test('Should detect mobile device capabilities', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  if (!manager.deviceCapabilities.hasTouch) {
    throw new Error('Touch support not detected');
  }
  
  if (!manager.deviceCapabilities.hasHaptic) {
    throw new Error('Haptic support not detected');
  }
  
  if (!manager.deviceCapabilities.isMobile) {
    throw new Error('Mobile device not detected');
  }
  
  manager.cleanup();
});

runner.test('Should handle touch events correctly', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Create mock touch event
  const touchEvent = {
    touches: [{
      clientX: 100,
      clientY: 100,
      target: { classList: { contains: () => true }, dataset: { piece: 'K' } }
    }],
    preventDefault: () => {}
  };
  
  // Test touch start
  manager.handleTouchStart(touchEvent);
  
  if (!manager.touchState.isActive) {
    throw new Error('Touch state not activated');
  }
  
  if (manager.touchState.startPosition.x !== 100) {
    throw new Error('Touch start position not recorded correctly');
  }
  
  manager.cleanup();
});

runner.test('Should trigger haptic feedback correctly', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Test different haptic patterns
  const patterns = ['tap', 'doubleTap', 'success', 'error'];
  
  for (const pattern of patterns) {
    if (!manager.hapticPatterns[pattern]) {
      throw new Error(`Haptic pattern '${pattern}' not defined`);
    }
    
    // This should not throw an error
    manager.triggerHapticFeedback(pattern);
  }
  
  manager.cleanup();
});

runner.test('Should handle gesture recognition', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Test double tap detection
  manager.touchState.lastTap = Date.now() - 100;
  manager.touchState.tapCount = 1;
  
  const touchEvent = {
    touches: [{
      clientX: 100,
      clientY: 100,
      target: { classList: { contains: () => true }, dataset: { piece: 'K' } }
    }],
    preventDefault: () => {}
  };
  
  manager.handleTouchStart(touchEvent);
  
  if (manager.touchState.tapCount !== 2) {
    throw new Error('Double tap not detected correctly');
  }
  
  manager.cleanup();
});

runner.test('Should apply mobile UI adaptations', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Check if mobile CSS is applied
  const mobileStyles = document.getElementById('mobile-optimization-styles');
  if (!mobileStyles) {
    throw new Error('Mobile styles not applied');
  }
  
  // Check UI settings
  if (manager.uiSettings.minTouchTarget < 44) {
    throw new Error('Touch target size too small');
  }
  
  manager.cleanup();
});

runner.test('Should handle pinch gestures', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  const pinchEvent = {
    touches: [
      { clientX: 100, clientY: 100 },
      { clientX: 200, clientY: 200 }
    ],
    preventDefault: () => {}
  };
  
  manager.handleTouchStart(pinchEvent);
  
  if (!manager.touchState.isPinching) {
    throw new Error('Pinch gesture not detected');
  }
  
  if (manager.touchState.gestureStartDistance <= 0) {
    throw new Error('Pinch distance not calculated');
  }
  
  manager.cleanup();
});

runner.test('Should validate piece placement', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Mock square element
  const mockSquare = {
    dataset: { row: '0', col: '0' },
    classList: { add: () => {}, remove: () => {} }
  };
  
  // Set selected piece
  global.selectedPalettePiece = 'K';
  
  // This should not throw an error
  manager.handleSquareTap(mockSquare);
  
  // Check if piece was placed
  if (setupBoard[0][0] !== 'K') {
    throw new Error('Piece not placed correctly');
  }
  
  manager.cleanup();
});

runner.test('Should handle orientation changes', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  const originalOrientation = manager.deviceCapabilities.orientation;
  
  // Simulate orientation change
  manager.handleOrientationChange();
  
  // This should not throw an error and should update capabilities
  if (!manager.deviceCapabilities) {
    throw new Error('Device capabilities not updated after orientation change');
  }
  
  manager.cleanup();
});

runner.test('Should cleanup properly', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Cleanup should not throw an error
  manager.cleanup();
  
  // Touch state should be reset
  if (manager.touchState.isActive) {
    throw new Error('Touch state not reset after cleanup');
  }
});

// Property-based tests
runner.test('Property 20: Touch Interaction Support - All gestures should trigger haptic feedback', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  const gestures = ['tap', 'doubleTap', 'longPress', 'drag', 'pinch'];
  
  for (const gesture of gestures) {
    const pattern = manager.hapticPatterns[gesture];
    if (!pattern) {
      throw new Error(`Haptic pattern for '${gesture}' not defined`);
    }
    
    if (!Array.isArray(pattern)) {
      throw new Error(`Haptic pattern for '${gesture}' is not an array`);
    }
    
    if (pattern.length === 0) {
      throw new Error(`Haptic pattern for '${gesture}' is empty`);
    }
  }
  
  manager.cleanup();
});

runner.test('Property 21: Mobile Screen Adaptation - UI elements should meet minimum touch target size', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  if (manager.uiSettings.minTouchTarget < 44) {
    throw new Error('Minimum touch target size is below accessibility guidelines (44px)');
  }
  
  if (manager.uiSettings.enlargedPieceSize < 1.0) {
    throw new Error('Piece enlargement factor should be at least 1.0');
  }
  
  manager.cleanup();
});

runner.test('Property 22: Double Tap Piece Selection - Should handle double tap correctly', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  // Mock palette piece
  const mockPiece = {
    dataset: { piece: 'K' },
    classList: { contains: () => true }
  };
  
  // Mock finding first valid square
  manager.findFirstValidSquare = () => ({
    dataset: { row: '0', col: '0' }
  });
  
  // This should not throw an error
  manager.handlePaletteDoubleTab(mockPiece);
  
  // Check if piece was placed
  if (setupBoard[0][0] !== 'K') {
    throw new Error('Double tap quick placement failed');
  }
  
  manager.cleanup();
});

runner.test('Property 23: Haptic Feedback - Should work for all interaction types', () => {
  const manager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  
  const interactions = [
    'tap', 'doubleTap', 'longPress', 'success', 'error', 
    'warning', 'selection', 'drag', 'drop', 'invalid'
  ];
  
  for (const interaction of interactions) {
    const pattern = manager.hapticPatterns[interaction];
    if (!pattern) {
      throw new Error(`Haptic pattern for '${interaction}' not defined`);
    }
    
    // Should not throw an error
    manager.triggerHapticFeedback(interaction);
  }
  
  manager.cleanup();
});

// Run all tests
runner.run().then(() => {
  console.log('\n🏁 Mobile Optimization Manager testing complete!');
}).catch((error) => {
  console.error('Test runner error:', error);
});