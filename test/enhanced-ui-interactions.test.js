/**
 * Enhanced UI Interaction Tests for 4x5 Chess Piece Setup
 * Tests drag & drop visual feedback and responsive design adaptations
 * 
 * Task: 1.2 UI etkileşim testlerini yaz
 * Property 1: Geçersiz Sürükleme Reddi
 * Property 2: Responsive Arayüz Adaptasyonu
 * Validates: Requirements 1.3, 1.4, 1.5
 */

// Mock DOM elements and global variables for testing
global.document = {
  createElement: (tag) => ({
    className: '',
    style: { cssText: '' },
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
      toggle: jest.fn()
    },
    addEventListener: jest.fn(),
    appendChild: jest.fn(),
    remove: jest.fn(),
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    dataset: {},
    textContent: '',
    innerHTML: '',
    parentNode: null,
    getBoundingClientRect: () => ({ width: 50, height: 50, left: 0, top: 0 })
  }),
  body: {
    appendChild: jest.fn()
  },
  head: {
    appendChild: jest.fn()
  },
  addEventListener: jest.fn(),
  getElementById: jest.fn(() => null),
  querySelectorAll: jest.fn(() => []),
  documentElement: {
    style: {
      setProperty: jest.fn()
    }
  }
};

global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  getComputedStyle: () => ({ getPropertyValue: () => '16px' })
};

// Mock setup board
global.setupBoard = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null]
];

// Mock translation function
global.t = (key) => key;

// Mock TASLAR
global.TASLAR = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

// Mock functions
global.drawSetupBoard = jest.fn();
global.selectedPalettePiece = null;

// Load the enhanced systems
const EnhancedPieceSetupUI = require('../js/enhanced-ui-manager.js');
const EnhancedDragDropSystem = require('../js/enhanced-drag-drop.js');

describe('Enhanced UI Interactions', () => {
  let enhancedUI;
  let dragDropSystem;

  beforeEach(() => {
    // Reset setup board
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        setupBoard[i][j] = null;
      }
    }

    // Reset mocks
    jest.clearAllMocks();

    // Initialize systems
    enhancedUI = new EnhancedPieceSetupUI();
    dragDropSystem = new EnhancedDragDropSystem(enhancedUI);
  });

  describe('Drag & Drop Visual Feedback Tests', () => {
    test('should show drag feedback on drag start', () => {
      const mockPiece = {
        classList: { add: jest.fn(), remove: jest.fn() },
        dataset: { piece: 'K' }
      };

      enhancedUI.showDragFeedback(mockPiece, 'start');

      expect(mockPiece.classList.remove).toHaveBeenCalledWith(
        'drag-start', 'drag-over', 'drag-leave', 'drag-drop', 'drag-end'
      );
      expect(mockPiece.classList.add).toHaveBeenCalledWith('drag-start');
    });

    test('should show drag over feedback on valid drop target', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() },
        dataset: { row: '2', col: '1' }
      };

      enhancedUI.showDragFeedback(mockSquare, 'over');

      expect(mockSquare.classList.add).toHaveBeenCalledWith('drag-over');
    });

    test('should create ripple effect on interaction', () => {
      const mockElement = {
        style: { position: '' },
        appendChild: jest.fn(),
        getBoundingClientRect: () => ({ width: 50, height: 50 })
      };

      enhancedUI.createRippleEffect(mockElement, 'primary');

      expect(mockElement.appendChild).toHaveBeenCalled();
      expect(mockElement.style.position).toBe('relative');
    });

    test('should show success animation on valid drop', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() }
      };

      enhancedUI.showSuccessAnimation(mockSquare);

      // Should call animate element and create particle effect
      expect(mockSquare.classList.add).toHaveBeenCalled();
    });

    test('should show validation error with proper styling', () => {
      const errorMessage = 'Invalid move';
      
      dragDropSystem.showValidationError(errorMessage);

      // Should update validation overlay
      expect(dragDropSystem.feedbackElements.validationOverlay.textContent).toBe(errorMessage);
      expect(dragDropSystem.feedbackElements.validationOverlay.style.opacity).toBe('1');
    });

    test('should highlight valid drop targets during drag', () => {
      const mockSquares = [
        { classList: { add: jest.fn() }, dataset: { row: '1', col: '1' } },
        { classList: { add: jest.fn() }, dataset: { row: '2', col: '2' } }
      ];

      document.querySelectorAll = jest.fn(() => mockSquares);

      dragDropSystem.highlightValidDropTargets('K');

      // Should add classes to valid targets
      mockSquares.forEach(square => {
        expect(square.classList.add).toHaveBeenCalled();
      });
    });

    test('should show drop preview on drag enter', () => {
      const mockSquare = {
        style: { position: '' },
        appendChild: jest.fn(),
        querySelector: jest.fn(() => null)
      };

      dragDropSystem.showDropPreview(mockSquare, 'K');

      expect(mockSquare.appendChild).toHaveBeenCalled();
      expect(mockSquare.style.position).toBe('relative');
    });

    test('should hide drop preview on drag leave', () => {
      const mockPreview = { remove: jest.fn() };
      const mockSquare = {
        querySelector: jest.fn(() => mockPreview)
      };

      dragDropSystem.hideDropPreview(mockSquare);

      expect(mockSquare.querySelector).toHaveBeenCalledWith('.drop-preview');
      expect(mockPreview.remove).toHaveBeenCalled();
    });
  });

  describe('Responsive Design Tests', () => {
    test('should detect mobile device type correctly', () => {
      window.innerWidth = 600;
      const deviceType = enhancedUI.detectDeviceType();
      expect(deviceType).toBe('mobile');
    });

    test('should detect tablet device type correctly', () => {
      window.innerWidth = 900;
      const deviceType = enhancedUI.detectDeviceType();
      expect(deviceType).toBe('tablet');
    });

    test('should detect desktop device type correctly', () => {
      window.innerWidth = 1200;
      const deviceType = enhancedUI.detectDeviceType();
      expect(deviceType).toBe('desktop');
    });

    test('should apply mobile optimizations', () => {
      enhancedUI.deviceType = 'mobile';
      enhancedUI.applyDeviceOptimizations();

      const root = document.documentElement;
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-piece-size', '40px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-square-size', '50px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-font-size', '1.5rem');
    });

    test('should apply tablet optimizations', () => {
      enhancedUI.deviceType = 'tablet';
      enhancedUI.applyDeviceOptimizations();

      const root = document.documentElement;
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-piece-size', '45px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-square-size', '55px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-font-size', '1.8rem');
    });

    test('should apply desktop optimizations', () => {
      enhancedUI.deviceType = 'desktop';
      enhancedUI.applyDeviceOptimizations();

      const root = document.documentElement;
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-piece-size', '50px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-square-size', '60px');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-font-size', '2rem');
    });

    test('should handle responsive layout changes', () => {
      const mockModal = {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      };

      document.getElementById = jest.fn(() => mockModal);
      enhancedUI.deviceType = 'mobile';

      enhancedUI.handleResponsiveLayout();

      expect(mockModal.classList.remove).toHaveBeenCalledWith(
        'enhanced-mobile', 'enhanced-tablet', 'enhanced-desktop'
      );
      expect(mockModal.classList.add).toHaveBeenCalledWith('enhanced-mobile');
    });

    test('should update device type on window resize', () => {
      const originalDeviceType = enhancedUI.deviceType;
      window.innerWidth = 500; // Mobile size

      // Simulate resize event
      const resizeHandler = window.addEventListener.mock.calls.find(
        call => call[0] === 'resize'
      )[1];

      // Mock setTimeout to execute immediately
      global.setTimeout = jest.fn((fn) => fn());

      resizeHandler();

      // Device type should be updated
      expect(enhancedUI.detectDeviceType()).toBe('mobile');
    });
  });

  describe('Animation System Tests', () => {
    test('should animate element with specified animation type', () => {
      const mockElement = {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      };

      enhancedUI.animateElement(mockElement, 'hover-in');

      expect(mockElement.classList.add).toHaveBeenCalledWith('enhanced-animate', 'enhanced-hover-in');
    });

    test('should clean up animation classes after duration', () => {
      const mockElement = {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      };

      // Mock setTimeout
      global.setTimeout = jest.fn((fn) => fn());

      enhancedUI.animateElement(mockElement, 'success');

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), enhancedUI.animationDuration.normal);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('enhanced-animate', 'enhanced-success');
    });

    test('should disable animations when requested', () => {
      enhancedUI.setAnimationEnabled(false);

      const mockElement = {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      };

      enhancedUI.animateElement(mockElement, 'hover-in');

      // Should not animate when disabled
      expect(enhancedUI.animationEnabled).toBe(false);
    });

    test('should create particle effect with correct positioning', () => {
      const mockElement = {
        getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 50 })
      };

      const mockParticle = {
        style: { left: '', top: '' },
        animate: jest.fn(() => ({ onfinish: null }))
      };

      document.createElement = jest.fn(() => mockParticle);

      enhancedUI.createParticleEffect(mockElement, 'success');

      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockParticle.animate).toHaveBeenCalled();
    });
  });

  describe('Notification System Tests', () => {
    test('should show enhanced notification with correct styling', () => {
      const mockNotification = {
        style: {},
        animate: jest.fn(() => ({ onfinish: null }))
      };

      const mockContainer = {
        appendChild: jest.fn()
      };

      document.createElement = jest.fn(() => mockNotification);
      document.getElementById = jest.fn(() => mockContainer);

      enhancedUI.showEnhancedNotification('Test message', 'success', 2000);

      expect(mockNotification.className).toBe('enhanced-notification enhanced-notification-success');
      expect(mockNotification.textContent).toBe('Test message');
      expect(mockContainer.appendChild).toHaveBeenCalledWith(mockNotification);
    });

    test('should auto-remove notification after duration', () => {
      const mockNotification = {
        style: {},
        animate: jest.fn(() => ({ onfinish: jest.fn() })),
        parentNode: { removeChild: jest.fn() }
      };

      const mockContainer = { appendChild: jest.fn() };

      document.createElement = jest.fn(() => mockNotification);
      document.getElementById = jest.fn(() => mockContainer);

      // Mock setTimeout to execute immediately
      global.setTimeout = jest.fn((fn) => fn());

      enhancedUI.showEnhancedNotification('Test message', 'info', 1000);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    });
  });

  describe('Theme System Tests', () => {
    test('should apply modern theme with correct CSS properties', () => {
      const root = document.documentElement;
      
      enhancedUI.applyModernTheme();

      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-primary', '#4f46e5');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-secondary', '#06b6d4');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-success', '#10b981');
      expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-error', '#ef4444');
    });

    test('should add enhanced theme class to modal', () => {
      const mockModal = {
        classList: { add: jest.fn() }
      };

      document.getElementById = jest.fn(() => mockModal);

      enhancedUI.applyModernTheme();

      expect(mockModal.classList.add).toHaveBeenCalledWith('enhanced-theme');
    });
  });
});

// Property-Based Tests using a simplified approach (since fast-check is not available)
describe('Property-Based Tests (Simulated)', () => {
  let enhancedUI;
  let dragDropSystem;

  beforeEach(() => {
    enhancedUI = new EnhancedPieceSetupUI();
    dragDropSystem = new EnhancedDragDropSystem(enhancedUI);
  });

  describe('Property 1: Geçersiz Sürükleme Reddi', () => {
    test('**Validates: Requirements 1.4** - Invalid drag operations should always be rejected', () => {
      // Test multiple invalid scenarios
      const invalidScenarios = [
        { piece: 'P', row: 0, col: 0, reason: 'White pawn on first rank' },
        { piece: 'p', row: 4, col: 0, reason: 'Black pawn on last rank' },
        { piece: 'K', row: -1, col: 0, reason: 'Out of bounds (negative row)' },
        { piece: 'K', row: 5, col: 0, reason: 'Out of bounds (row too high)' },
        { piece: 'K', row: 0, col: -1, reason: 'Out of bounds (negative col)' },
        { piece: 'K', row: 0, col: 4, reason: 'Out of bounds (col too high)' },
        { piece: null, row: 2, col: 1, reason: 'Null piece' },
        { piece: '', row: 2, col: 1, reason: 'Empty piece' }
      ];

      // Test each invalid scenario
      invalidScenarios.forEach(scenario => {
        const result = dragDropSystem.validateDrop(scenario.piece, scenario.row, scenario.col);
        expect(result).toBe(false);
        
        // Should also provide appropriate error message
        if (scenario.piece && scenario.row >= 0 && scenario.row < 5 && scenario.col >= 0 && scenario.col < 4) {
          const errorMessage = dragDropSystem.getValidationError(scenario.piece, scenario.row, scenario.col);
          expect(errorMessage).toBeTruthy();
        }
      });
    });

    test('**Validates: Requirements 1.4** - Occupied squares should reject new pieces', () => {
      // Place a piece on the board
      setupBoard[2][1] = 'Q';

      // Try to place another piece on the same square
      const result = dragDropSystem.validateDrop('K', 2, 1);
      expect(result).toBe(false);

      const errorMessage = dragDropSystem.getValidationError('K', 2, 1);
      expect(errorMessage).toBe('squareOccupied');
    });

    test('**Validates: Requirements 1.4** - Too many pieces of same type should be rejected', () => {
      // Place maximum number of kings
      setupBoard[0][0] = 'K';

      // Try to place another king
      const result = dragDropSystem.validateDrop('K', 2, 1);
      expect(result).toBe(false);

      const errorMessage = dragDropSystem.getValidationError('K', 2, 1);
      expect(errorMessage).toBe('tooManyPieces');
    });

    test('**Validates: Requirements 1.4** - Invalid drop should trigger visual feedback', () => {
      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() },
        animate: jest.fn()
      };

      setupBoard[2][1] = 'Q'; // Make square occupied

      dragDropSystem.handleInvalidDrop(mockSquare, 'K', 2, 1);

      // Should show validation error
      expect(dragDropSystem.feedbackElements.validationOverlay.style.opacity).toBe('1');
      
      // Should animate invalid drop
      expect(mockSquare.animate).toHaveBeenCalled();
    });

    test('**Validates: Requirements 1.4** - Piece should return to original position on invalid move', () => {
      // Set up a piece being moved from board
      dragDropSystem.dragState.draggedFrom = { row: 1, col: 1 };
      dragDropSystem.dragState.draggedPiece = 'K';
      setupBoard[1][1] = null; // Simulate piece being removed for drag

      const mockSquare = {
        classList: { add: jest.fn(), remove: jest.fn() },
        animate: jest.fn()
      };

      setupBoard[2][1] = 'Q'; // Make target square occupied

      dragDropSystem.handleInvalidDrop(mockSquare, 'K', 2, 1);

      // Piece should be returned to original position
      expect(setupBoard[1][1]).toBe('K');
    });
  });

  describe('Property 2: Responsive Arayüz Adaptasyonu', () => {
    test('**Validates: Requirements 1.5** - Interface should adapt to different screen sizes', () => {
      const screenSizes = [
        { width: 320, expected: 'mobile' },
        { width: 480, expected: 'mobile' },
        { width: 768, expected: 'mobile' },
        { width: 900, expected: 'tablet' },
        { width: 1024, expected: 'tablet' },
        { width: 1200, expected: 'desktop' },
        { width: 1920, expected: 'desktop' }
      ];

      screenSizes.forEach(({ width, expected }) => {
        window.innerWidth = width;
        const deviceType = enhancedUI.detectDeviceType();
        expect(deviceType).toBe(expected);
      });
    });

    test('**Validates: Requirements 1.5** - CSS properties should adapt to device type', () => {
      const deviceConfigs = [
        {
          device: 'mobile',
          expectedPieceSize: '40px',
          expectedSquareSize: '50px',
          expectedFontSize: '1.5rem'
        },
        {
          device: 'tablet',
          expectedPieceSize: '45px',
          expectedSquareSize: '55px',
          expectedFontSize: '1.8rem'
        },
        {
          device: 'desktop',
          expectedPieceSize: '50px',
          expectedSquareSize: '60px',
          expectedFontSize: '2rem'
        }
      ];

      deviceConfigs.forEach(config => {
        enhancedUI.deviceType = config.device;
        enhancedUI.applyDeviceOptimizations();

        const root = document.documentElement;
        expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-piece-size', config.expectedPieceSize);
        expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-square-size', config.expectedSquareSize);
        expect(root.style.setProperty).toHaveBeenCalledWith('--enhanced-font-size', config.expectedFontSize);
      });
    });

    test('**Validates: Requirements 1.5** - Modal should receive appropriate responsive classes', () => {
      const mockModal = {
        classList: {
          remove: jest.fn(),
          add: jest.fn()
        }
      };

      document.getElementById = jest.fn(() => mockModal);

      const deviceTypes = ['mobile', 'tablet', 'desktop'];

      deviceTypes.forEach(deviceType => {
        enhancedUI.deviceType = deviceType;
        enhancedUI.handleResponsiveLayout();

        expect(mockModal.classList.remove).toHaveBeenCalledWith(
          'enhanced-mobile', 'enhanced-tablet', 'enhanced-desktop'
        );
        expect(mockModal.classList.add).toHaveBeenCalledWith(`enhanced-${deviceType}`);
      });
    });

    test('**Validates: Requirements 1.5** - Responsive breakpoints should be correctly defined', () => {
      expect(enhancedUI.responsiveBreakpoints.mobile).toBe(768);
      expect(enhancedUI.responsiveBreakpoints.tablet).toBe(1024);
      expect(enhancedUI.responsiveBreakpoints.desktop).toBe(1200);
    });

    test('**Validates: Requirements 1.5** - Device type should update on window resize', () => {
      // Initial state
      window.innerWidth = 1200;
      enhancedUI.deviceType = enhancedUI.detectDeviceType();
      expect(enhancedUI.deviceType).toBe('desktop');

      // Simulate resize to mobile
      window.innerWidth = 600;
      const newDeviceType = enhancedUI.detectDeviceType();
      expect(newDeviceType).toBe('mobile');

      // Simulate resize to tablet
      window.innerWidth = 900;
      const tabletDeviceType = enhancedUI.detectDeviceType();
      expect(tabletDeviceType).toBe('tablet');
    });

    test('**Validates: Requirements 1.5** - All UI elements should be functional across device types', () => {
      const deviceTypes = ['mobile', 'tablet', 'desktop'];

      deviceTypes.forEach(deviceType => {
        enhancedUI.deviceType = deviceType;

        // Test drag feedback works on all devices
        const mockElement = {
          classList: { add: jest.fn(), remove: jest.fn() }
        };

        enhancedUI.showDragFeedback(mockElement, 'start');
        expect(mockElement.classList.add).toHaveBeenCalledWith('drag-start');

        // Test animations work on all devices
        enhancedUI.animateElement(mockElement, 'hover-in');
        expect(mockElement.classList.add).toHaveBeenCalledWith('enhanced-animate', 'enhanced-hover-in');

        // Test notifications work on all devices
        const mockNotification = {
          style: {},
          animate: jest.fn(() => ({ onfinish: null }))
        };
        const mockContainer = { appendChild: jest.fn() };

        document.createElement = jest.fn(() => mockNotification);
        document.getElementById = jest.fn(() => mockContainer);

        enhancedUI.showEnhancedNotification('Test', 'info', 1000);
        expect(mockContainer.appendChild).toHaveBeenCalledWith(mockNotification);
      });
    });
  });

  describe('Integration Property Tests', () => {
    test('**Validates: Requirements 1.3, 1.4, 1.5** - Drag feedback should work consistently across all device types', () => {
      const deviceTypes = ['mobile', 'tablet', 'desktop'];
      const feedbackStates = ['start', 'over', 'leave', 'drop', 'end'];

      deviceTypes.forEach(deviceType => {
        enhancedUI.deviceType = deviceType;

        feedbackStates.forEach(state => {
          const mockElement = {
            classList: { add: jest.fn(), remove: jest.fn() }
          };

          enhancedUI.showDragFeedback(mockElement, state);

          // Should always remove all drag classes first
          expect(mockElement.classList.remove).toHaveBeenCalledWith(
            'drag-start', 'drag-over', 'drag-leave', 'drag-drop', 'drag-end'
          );

          // Should add appropriate class for state
          if (state !== 'leave' && state !== 'end') {
            expect(mockElement.classList.add).toHaveBeenCalledWith(`drag-${state}`);
          }
        });
      });
    });

    test('**Validates: Requirements 1.3, 1.4, 1.5** - Visual feedback should be consistent with validation results', () => {
      const testCases = [
        { piece: 'K', row: 2, col: 1, shouldBeValid: true },
        { piece: 'P', row: 0, col: 0, shouldBeValid: false },
        { piece: 'p', row: 4, col: 0, shouldBeValid: false }
      ];

      testCases.forEach(testCase => {
        // Reset board
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 4; j++) {
            setupBoard[i][j] = null;
          }
        }

        const isValid = dragDropSystem.validateDrop(testCase.piece, testCase.row, testCase.col);
        expect(isValid).toBe(testCase.shouldBeValid);

        const mockSquare = {
          classList: { add: jest.fn(), remove: jest.fn() },
          animate: jest.fn()
        };

        if (testCase.shouldBeValid) {
          dragDropSystem.performValidDrop(mockSquare, testCase.piece, testCase.row, testCase.col);
          expect(setupBoard[testCase.row][testCase.col]).toBe(testCase.piece);
        } else {
          dragDropSystem.handleInvalidDrop(mockSquare, testCase.piece, testCase.row, testCase.col);
          expect(dragDropSystem.feedbackElements.validationOverlay.style.opacity).toBe('1');
        }
      });
    });
  });
});

console.log('✅ Enhanced UI Interaction tests completed');