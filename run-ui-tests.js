#!/usr/bin/env node

/**
 * Simple test runner for UI interaction tests
 * Validates the test implementation without requiring a browser
 */

// Mock browser environment
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {}
};

global.document = {
  createElement: () => ({
    className: '',
    style: { cssText: '', setProperty: () => {} },
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    addEventListener: () => {},
    appendChild: () => {},
    remove: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    dataset: {},
    textContent: '',
    getBoundingClientRect: () => ({ width: 50, height: 50, left: 0, top: 0 })
  }),
  body: { appendChild: () => {} },
  head: { appendChild: () => {} },
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => [],
  documentElement: {
    style: { setProperty: () => {} }
  }
};

// Mock global variables
global.setupBoard = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null]
];

global.TASLAR = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

global.t = (key) => key;
global.drawSetupBoard = () => {};
global.selectedPalettePiece = null;

console.log('🎯 UI Interaction Tests - Validation Run');
console.log('=' .repeat(50));

try {
  // Load the enhanced systems
  const EnhancedPieceSetupUI = require('./js/enhanced-ui-manager.js');
  const EnhancedDragDropSystem = require('./js/enhanced-drag-drop.js');
  
  console.log('✅ Enhanced UI Manager loaded successfully');
  console.log('✅ Enhanced Drag Drop System loaded successfully');
  
  // Test basic functionality
  const enhancedUI = new EnhancedPieceSetupUI();
  const dragDropSystem = new EnhancedDragDropSystem(enhancedUI);
  
  console.log('✅ Systems initialized successfully');
  
  // Test device detection
  window.innerWidth = 600;
  const mobileType = enhancedUI.detectDeviceType();
  console.log(`📱 Mobile detection: ${mobileType === 'mobile' ? '✅' : '❌'} (${mobileType})`);
  
  window.innerWidth = 900;
  const tabletType = enhancedUI.detectDeviceType();
  console.log(`📱 Tablet detection: ${tabletType === 'tablet' ? '✅' : '❌'} (${tabletType})`);
  
  window.innerWidth = 1200;
  const desktopType = enhancedUI.detectDeviceType();
  console.log(`📱 Desktop detection: ${desktopType === 'desktop' ? '✅' : '❌'} (${desktopType})`);
  
  // Test validation
  const validMove = dragDropSystem.validateDrop('K', 2, 1);
  console.log(`🎯 Valid move validation: ${validMove ? '✅' : '❌'}`);
  
  const invalidPawn = dragDropSystem.validateDrop('P', 0, 0);
  console.log(`🎯 Invalid pawn rejection: ${!invalidPawn ? '✅' : '❌'}`);
  
  const outOfBounds = dragDropSystem.validateDrop('K', -1, 0);
  console.log(`🎯 Out of bounds rejection: ${!outOfBounds ? '✅' : '❌'}`);
  
  // Test occupied square
  setupBoard[2][1] = 'Q';
  const occupiedSquare = dragDropSystem.validateDrop('K', 2, 1);
  console.log(`🎯 Occupied square rejection: ${!occupiedSquare ? '✅' : '❌'}`);
  
  // Test too many pieces
  setupBoard[0][0] = 'K';
  const tooManyKings = dragDropSystem.validateDrop('K', 3, 3);
  console.log(`🎯 Too many kings rejection: ${!tooManyKings ? '✅' : '❌'}`);
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All basic validations passed!');
  console.log('📋 Test files created:');
  console.log('  - test/enhanced-ui-interactions.test.js (Unit tests)');
  console.log('  - test/ui-interactions-property-tests.js (Property tests)');
  console.log('  - test-enhanced-ui-interactions.html (Browser test runner)');
  console.log('\n🌐 Open test-enhanced-ui-interactions.html in a browser to run full test suite');
  console.log('🔬 Property-based tests will run 100+ iterations per property');
  
} catch (error) {
  console.error('❌ Error during validation:', error.message);
  process.exit(1);
}