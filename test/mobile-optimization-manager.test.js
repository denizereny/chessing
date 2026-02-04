/**
 * Mobile Optimization Manager Tests
 * Tests for touch events, gesture recognition, haptic feedback, and mobile UI adaptations
 * 
 * Requirements: 7.1, 7.4, 7.5
 * Property Tests: 20, 21, 22, 23
 */

// Mock DOM environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="pieceSetupModal" class="hidden">
    <div class="piece-setup-content">
      <div class="palette-container">
        <div class="palette-piece" data-piece="K">♔</div>
        <div class="palette-piece" data-piece="Q">♕</div>
        <div class="palette-piece" data-piece="R">♖</div>
        <div class="palette-piece" data-piece="B">♗</div>
        <div class="palette-piece" data-piece="N">♘</div>
        <div class="palette-piece" data-piece="P">♙</div>
      </div>
      <div class="setup-board-container">
        <div id="setupBoard" class="setup-board">
          <div class="setup-square" data-row="0" data-col="0"></div>
          <div class="setup-square" data-row="0" data-col="1"></div>
          <div class="setup-square" data-row="0" data-col="2"></div>
          <div class="setup-square" data-row="0" data-col="3"></div>
          <div class="setup-square" data-row="1" data-col="0"></div>
          <div class="setup-square" data-row="1" data-col="1"></div>
          <div class="setup-square" data-row="1" data-col="2"></div>
          <div class="setup-square" data-row="1" data-col="3"></div>
        </div>
      </div>
      <div class="palette-tools">
        <button id="clearBoard">Clear</button>
        <button id="resetBoard">Reset</button>
      </div>
    </div>
  </div>
</body>
</html>
`, {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  vibrate: jest.fn(),
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
    'longPressForInfo': 'Long press for info',
    'squareOccupied': 'Square is already occupied!',
    'invalidPawnPosition': 'Pawns cannot be placed on this rank!',
    'tooManyPieces': 'Too many pieces!'
  };
  return translations[key] || key;
};

// Mock setup board
global.setupBoard = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null]
];

// Mock selected palette piece
global.selectedPalettePiece = null;

// Mock TASLAR (piece symbols)
global.TASLAR = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Mock functions
global.drawSetupBoard = jest.fn();

// Mock enhanced UI and drag & drop systems
const mockEnhancedUI = {
  animateElement: jest.fn(),
  showSelectionFeedback: jest.fn(),
  showSuccessAnimation: jest.fn(),
  createParticleEffect: jest.fn(),
  showEnhancedNotification: jest.fn(),
  showDragFeedback: jest.fn(),
  deviceType: 'mobile'
};

const mockDragDropSystem = {
  validateDrop: jest.fn(),
  getValidationError: jest.fn(),
  showDragGhost: jest.fn(),
  updateDragGhost: jest.fn(),
  hideDragGhost: jest.fn(),
  feedbackElements: {
    dragGhost: document.createElement('div')
  }
};

// Load the mobile optimization manager
const MobileOptimizationManager = require('../js/mobile-optimization-manager.js');

describe('Mobile Optimization Manager', () => {
  let mobileManager;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    navigator.vibrate.mockClear();
    
    // Reset setup board
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        setupBoard[i][j] = null;
      }
    }
    
    // Reset selected piece
    selectedPalettePiece = null;
    
    // Create mobile manager instance
    mobileManager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  });
  
  afterEach(() => {
    if (mobileManager) {
      mobileManager.cleanup();
    }
  });
  
  describe('Initialization', () => {
    test('should initialize with correct device capabilities', () => {
      expect(mobileManager.deviceCapabilities.hasTouch).toBe(true);
      expect(mobileManager.deviceCapabilities.hasHaptic).toBe(true);
      expect(mobileManager.deviceCapabilities.isMobile).toBe(true);
      expect(mobileManager.deviceCapabilities.isIOS).toBe(true);
    });
    
    test('should detect mobile device correctly', () => {
      expect(mobileManager.deviceCapabilities.isMobile).toBe(true);
      expect(mobileManager.deviceCapabilities.screenSize.width).toBe(375);
      expect(mobileManager.deviceCapabilities.screenSize.height).toBe(667);
    });
    
    test('should initialize touch event handlers', () => {
      expect(mobileManager.touchState).toBeDefined();
      expect(mobileManager.gestureSettings).toBeDefined();
      expect(mobileManager.hapticPatterns).toBeDefined();
    });
  });
  
  describe('Touch Event Handling', () => {
    test('should handle touch start correctly', () => {
      const touchEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 100,
          target: document.querySelector('.palette-piece')
        }]
      });
      
      mobileManager.handleTouchStart(touchEvent);
      
      expect(mobileManager.touchState.isActive).toBe(true);
      expect(mobileManager.touchState.startPosition.x).toBe(100);
      expect(mobileManager.touchState.startPosition.y).toBe(100);
      expect(navigator.vibrate).toHaveBeenCalledWith([10]);
    });
    
    test('should handle touch move and detect drag', () => {
      // Start touch
      const touchStartEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{
          clientX: 100,
          clientY: 100,
          target: document.querySelector('.palette-piece')
        }]
      });
      mobileManager.handleTouchStart(touchStartEvent);
      
      // Move touch beyond drag threshold
      const touchMoveEvent = new dom.window.TouchEvent('touchmove', {
        touches: [{
          clientX: 120,
          clientY: 120,
          target: document.querySelector('.palette-piece')
        }]
      });
      mobileManager.handleTouchMove(touchMoveEvent);
      
      expect(mobileManager.touchState.isDragging).toBe(true);
    });
    
    test('should handle touch end and perform tap', () => {
      const palettePiece = document.querySelector('.palette-piece');
      
      // Start and end touch quickly (tap)
      const touchStartEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, target: palettePiece }]
      });
      mobileManager.handleTouchStart(touchStartEvent);
      
      const touchEndEvent = new dom.window.TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100, target: palettePiece }]
      });
      mobileManager.handleTouchEnd(touchEndEvent);
      
      expect(palettePiece.classList.contains('selected')).toBe(true);
      expect(selectedPalettePiece).toBe('K');
    });
  });
  
  describe('Gesture Recognition', () => {
    test('should detect double tap gesture', () => {
      const palettePiece = document.querySelector('.palette-piece');
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      
      // First tap
      mobileManager.touchState.lastTap = Date.now() - 100;
      mobileManager.touchState.tapCount = 1;
      
      const touchEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, target: palettePiece }]
      });
      
      mobileManager.handleTouchStart(touchEvent);
      
      expect(mobileManager.touchState.tapCount).toBe(2);
      expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
    });
    
    test('should detect long press gesture', (done) => {
      const palettePiece = document.querySelector('.palette-piece');
      
      const touchEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, target: palettePiece }]
      });
      
      mobileManager.handleTouchStart(touchEvent);
      
      // Wait for long press threshold
      setTimeout(() => {
        expect(navigator.vibrate).toHaveBeenCalledWith([20]);
        expect(mockEnhancedUI.showEnhancedNotification).toHaveBeenCalled();
        done();
      }, mobileManager.gestureSettings.longPressThreshold + 50);
    });
    
    test('should handle pinch gesture', () => {
      const touchEvent = new dom.window.TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      });
      
      mobileManager.handleTouchStart(touchEvent);
      
      expect(mobileManager.touchState.isPinching).toBe(true);
      expect(mobileManager.touchState.gestureStartDistance).toBeGreaterThan(0);
    });
  });
  
  describe('Haptic Feedback', () => {
    test('should trigger haptic feedback for tap', () => {
      mobileManager.triggerHapticFeedback('tap');
      expect(navigator.vibrate).toHaveBeenCalledWith([10]);
    });
    
    test('should trigger haptic feedback for success', () => {
      mobileManager.triggerHapticFeedback('success');
      expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
    });
    
    test('should trigger haptic feedback for error', () => {
      mobileManager.triggerHapticFeedback('error');
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);
    });
    
    test('should not trigger haptic feedback when not supported', () => {
      // Temporarily disable haptic support
      mobileManager.deviceCapabilities.hasHaptic = false;
      
      mobileManager.triggerHapticFeedback('tap');
      expect(navigator.vibrate).not.toHaveBeenCalled();
      
      // Restore haptic support
      mobileManager.deviceCapabilities.hasHaptic = true;
    });
  });
  
  describe('Mobile UI Adaptations', () => {
    test('should apply mobile-specific CSS', () => {
      const mobileStyles = document.getElementById('mobile-optimization-styles');
      expect(mobileStyles).toBeTruthy();
      expect(mobileStyles.textContent).toContain('@media (max-width: 768px)');
    });
    
    test('should enlarge touch targets', () => {
      const palettePiece = document.querySelector('.palette-piece');
      expect(palettePiece.style.minWidth).toBe('44px');
      expect(palettePiece.style.minHeight).toBe('44px');
    });
    
    test('should create collapsible palette', () => {
      const collapsiblePalette = document.querySelector('.mobile-collapsible-palette');
      expect(collapsiblePalette).toBeTruthy();
      
      const handle = document.querySelector('.mobile-palette-handle');
      expect(handle).toBeTruthy();
    });
    
    test('should toggle collapsible palette', () => {
      const collapsiblePalette = document.querySelector('.mobile-collapsible-palette');
      const handle = document.querySelector('.mobile-palette-handle');
      
      // Initially collapsed
      expect(collapsiblePalette.classList.contains('expanded')).toBe(false);
      
      // Click to expand
      handle.click();
      expect(collapsiblePalette.classList.contains('expanded')).toBe(true);
      expect(navigator.vibrate).toHaveBeenCalled();
      
      // Click to collapse
      handle.click();
      expect(collapsiblePalette.classList.contains('expanded')).toBe(false);
    });
  });
  
  describe('Piece Placement', () => {
    test('should handle valid mobile placement', () => {
      const square = document.querySelector('.setup-square');
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      
      selectedPalettePiece = 'K';
      mobileManager.handleSquareTap(square);
      
      expect(setupBoard[0][0]).toBe('K');
      expect(mockEnhancedUI.showSuccessAnimation).toHaveBeenCalledWith(square);
      expect(navigator.vibrate).toHaveBeenCalledWith([10, 30, 10]);
    });
    
    test('should handle invalid mobile placement', () => {
      const square = document.querySelector('.setup-square');
      mockDragDropSystem.validateDrop.mockReturnValue(false);
      mockDragDropSystem.getValidationError.mockReturnValue('Invalid move!');
      
      selectedPalettePiece = 'K';
      mobileManager.handleSquareTap(square);
      
      expect(setupBoard[0][0]).toBe(null);
      expect(mockEnhancedUI.showEnhancedNotification).toHaveBeenCalledWith('Invalid move!', 'error', 3000);
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);
    });
    
    test('should handle quick placement via double tap', () => {
      const palettePiece = document.querySelector('.palette-piece');
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      
      // Mock finding first valid square
      mobileManager.findFirstValidSquare = jest.fn().mockReturnValue(document.querySelector('.setup-square'));
      
      mobileManager.handlePaletteDoubleTab(palettePiece);
      
      expect(setupBoard[0][0]).toBe('K');
      expect(mockEnhancedUI.showEnhancedNotification).toHaveBeenCalledWith('Quick placement!', 'success', 2000);
    });
  });
  
  describe('Touch Drag Operations', () => {
    test('should start touch drag from palette piece', () => {
      const palettePiece = document.querySelector('.palette-piece');
      
      mobileManager.startPalettePieceDrag(palettePiece);
      
      expect(mobileManager.touchState.selectedPiece).toBe('K');
      expect(mobileManager.touchState.selectedElement).toBe(palettePiece);
      expect(mockDragDropSystem.showDragGhost).toHaveBeenCalled();
    });
    
    test('should handle touch drop on valid square', () => {
      const square = document.querySelector('.setup-square');
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      
      mobileManager.touchState.selectedPiece = 'K';
      mobileManager.handleTouchDrop(square);
      
      expect(setupBoard[0][0]).toBe('K');
      expect(navigator.vibrate).toHaveBeenCalledWith([20]);
    });
    
    test('should handle invalid touch drop', () => {
      mockDragDropSystem.validateDrop.mockReturnValue(false);
      
      mobileManager.touchState.selectedPiece = 'K';
      mobileManager.touchState.selectedPosition = { row: 1, col: 1 };
      
      mobileManager.handleInvalidTouchDrop();
      
      expect(setupBoard[1][1]).toBe('K'); // Piece returned to original position
      expect(navigator.vibrate).toHaveBeenCalledWith([100]);
      expect(mockEnhancedUI.showEnhancedNotification).toHaveBeenCalledWith('Invalid move!', 'error', 2000);
    });
  });
  
  describe('Orientation and Viewport', () => {
    test('should handle orientation change', () => {
      const spy = jest.spyOn(mobileManager, 'detectDeviceCapabilities');
      
      // Simulate orientation change
      const orientationEvent = new dom.window.Event('orientationchange');
      window.dispatchEvent(orientationEvent);
      
      setTimeout(() => {
        expect(spy).toHaveBeenCalled();
        expect(navigator.vibrate).toHaveBeenCalledWith([15]);
      }, 150);
    });
    
    test('should optimize viewport for mobile', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeTruthy();
      expect(viewport.content).toContain('width=device-width');
      expect(viewport.content).toContain('initial-scale=1.0');
    });
  });
  
  describe('Cleanup', () => {
    test('should cleanup properly', () => {
      mobileManager.cleanup();
      
      const mobileStyles = document.getElementById('mobile-optimization-styles');
      expect(mobileStyles).toBeFalsy();
      
      expect(mobileManager.touchState.isActive).toBe(false);
    });
  });
});

// Property-Based Tests
describe('Mobile Optimization Properties', () => {
  let mobileManager;
  
  beforeEach(() => {
    mobileManager = new MobileOptimizationManager(mockEnhancedUI, mockDragDropSystem);
  });
  
  afterEach(() => {
    if (mobileManager) {
      mobileManager.cleanup();
    }
  });
  
  // Property 20: Dokunmatik Etkileşim Desteği
  describe('Property 20: Touch Interaction Support', () => {
    test('should respond appropriately to all touch gestures', () => {
      const gestures = ['tap', 'doubleTap', 'longPress', 'drag', 'pinch'];
      
      gestures.forEach(gesture => {
        const hapticPattern = mobileManager.hapticPatterns[gesture];
        expect(hapticPattern).toBeDefined();
        
        mobileManager.triggerHapticFeedback(gesture);
        expect(navigator.vibrate).toHaveBeenCalledWith(hapticPattern);
      });
    });
    
    test('should handle touch events on all interactive elements', () => {
      const interactiveElements = [
        '.palette-piece',
        '.setup-square',
        '.setup-piece'
      ];
      
      interactiveElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const touchEvent = new dom.window.TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100, target: element }]
          });
          
          expect(() => {
            mobileManager.handleTouchStart(touchEvent);
          }).not.toThrow();
          
          expect(mobileManager.touchState.isActive).toBe(true);
        }
      });
    });
  });
  
  // Property 21: Mobil Ekran Adaptasyonu
  describe('Property 21: Mobile Screen Adaptation', () => {
    test('should adapt UI elements for different mobile screen sizes', () => {
      const screenSizes = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11
        { width: 360, height: 640 }  // Android
      ];
      
      screenSizes.forEach(size => {
        // Mock screen size
        global.screen.width = size.width;
        global.screen.height = size.height;
        
        mobileManager.detectDeviceCapabilities();
        mobileManager.adaptUIForMobile();
        
        // Check that touch targets meet minimum size requirements
        const palettePieces = document.querySelectorAll('.palette-piece');
        palettePieces.forEach(piece => {
          const minWidth = parseInt(piece.style.minWidth);
          const minHeight = parseInt(piece.style.minHeight);
          
          expect(minWidth).toBeGreaterThanOrEqual(mobileManager.uiSettings.minTouchTarget);
          expect(minHeight).toBeGreaterThanOrEqual(mobileManager.uiSettings.minTouchTarget);
        });
      });
    });
    
    test('should scale pieces appropriately for mobile', () => {
      const palettePieces = document.querySelectorAll('.palette-piece');
      
      palettePieces.forEach(piece => {
        const transform = piece.style.transform;
        if (transform) {
          const scaleMatch = transform.match(/scale\(([^)]+)\)/);
          if (scaleMatch) {
            const scale = parseFloat(scaleMatch[1]);
            expect(scale).toBeGreaterThanOrEqual(mobileManager.uiSettings.enlargedPieceSize);
          }
        }
      });
    });
  });
  
  // Property 22: Çift Dokunma Taş Seçimi
  describe('Property 22: Double Tap Piece Selection', () => {
    test('should correctly handle double tap for piece selection', () => {
      const palettePiece = document.querySelector('.palette-piece');
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      
      // Mock finding first valid square
      mobileManager.findFirstValidSquare = jest.fn().mockReturnValue(document.querySelector('.setup-square'));
      
      // Simulate double tap
      mobileManager.touchState.lastTap = Date.now() - 100;
      mobileManager.touchState.tapCount = 1;
      
      const touchEvent = new dom.window.TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100, target: palettePiece }]
      });
      
      mobileManager.handleTouchStart(touchEvent);
      
      expect(mobileManager.touchState.tapCount).toBe(2);
      expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
    });
    
    test('should place piece on first valid square via double tap', () => {
      const palettePiece = document.querySelector('.palette-piece');
      const firstSquare = document.querySelector('.setup-square');
      
      mockDragDropSystem.validateDrop.mockReturnValue(true);
      mobileManager.findFirstValidSquare = jest.fn().mockReturnValue(firstSquare);
      
      mobileManager.handlePaletteDoubleTab(palettePiece);
      
      expect(setupBoard[0][0]).toBe('K');
      expect(mockEnhancedUI.showEnhancedNotification).toHaveBeenCalledWith('Quick placement!', 'success', 2000);
    });
  });
  
  // Property 23: Haptic Feedback
  describe('Property 23: Haptic Feedback', () => {
    test('should trigger haptic feedback for all appropriate mobile interactions', () => {
      const interactions = [
        { action: 'tap', pattern: [10] },
        { action: 'doubleTap', pattern: [10, 50, 10] },
        { action: 'longPress', pattern: [20] },
        { action: 'success', pattern: [10, 30, 10] },
        { action: 'error', pattern: [50, 100, 50] },
        { action: 'warning', pattern: [30, 50, 30] },
        { action: 'selection', pattern: [15] },
        { action: 'drag', pattern: [5] },
        { action: 'drop', pattern: [20] },
        { action: 'invalid', pattern: [100] }
      ];
      
      interactions.forEach(({ action, pattern }) => {
        navigator.vibrate.mockClear();
        mobileManager.triggerHapticFeedback(action);
        expect(navigator.vibrate).toHaveBeenCalledWith(pattern);
      });
    });
    
    test('should not trigger haptic feedback when device does not support it', () => {
      // Temporarily disable haptic support
      const originalHasHaptic = mobileManager.deviceCapabilities.hasHaptic;
      mobileManager.deviceCapabilities.hasHaptic = false;
      
      mobileManager.triggerHapticFeedback('tap');
      expect(navigator.vibrate).not.toHaveBeenCalled();
      
      // Restore haptic support
      mobileManager.deviceCapabilities.hasHaptic = originalHasHaptic;
    });
    
    test('should handle haptic feedback errors gracefully', () => {
      // Mock vibrate to throw an error
      navigator.vibrate.mockImplementation(() => {
        throw new Error('Vibration not allowed');
      });
      
      expect(() => {
        mobileManager.triggerHapticFeedback('tap');
      }).not.toThrow();
    });
  });
});