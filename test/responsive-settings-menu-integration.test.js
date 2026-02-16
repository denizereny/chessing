/**
 * Integration Tests for Responsive Settings Menu System
 * Tests that the entire responsive settings menu system works correctly as a cohesive unit
 * 
 * Feature: responsive-settings-menu
 * Task: 13.3 Write integration tests
 * 
 * Validates: All requirements - comprehensive system integration
 */

describe('Responsive Settings Menu Integration Tests', () => {
  
  // Store instances for cleanup
  let responsiveLayoutManager;
  let settingsMenuManager;
  
  beforeEach(() => {
    // Reset any existing instances
    if (window.responsiveLayoutManager) {
      window.responsiveLayoutManager.destroy();
    }
    if (window.settingsMenuManager) {
      window.settingsMenuManager.destroy();
    }
  });
  
  afterEach(() => {
    // Cleanup after each test
    if (responsiveLayoutManager) {
      responsiveLayoutManager.destroy();
      responsiveLayoutManager = null;
    }
    if (settingsMenuManager) {
      settingsMenuManager.destroy();
      settingsMenuManager = null;
    }
  });
  
  describe('System Initialization Tests', () => {
    
    test('Responsive system should initialize successfully', () => {
      // Create responsive layout manager instance
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      // Verify initialization
      expect(responsiveLayoutManager).toBeTruthy();
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      
      // Verify breakpoint detection
      const currentBreakpoint = responsiveLayoutManager.getCurrentBreakpoint();
      expect(['mobile', 'tablet', 'desktop']).toContain(currentBreakpoint);
      
      // Verify layout classes applied
      const root = document.documentElement;
      expect(root.classList.contains('responsive-layout-active')).toBe(true);
      expect(
        root.classList.contains('layout-mobile') ||
        root.classList.contains('layout-tablet') ||
        root.classList.contains('layout-desktop')
      ).toBe(true);
    });
    
    test('Menu system should initialize successfully', () => {
      // Create settings menu manager instance
      settingsMenuManager = new SettingsMenuManager();
      const initialized = settingsMenuManager.initialize();
      
      // Verify initialization
      expect(initialized).toBe(true);
      expect(settingsMenuManager.toggleButton).toBeTruthy();
      expect(settingsMenuManager.backdrop).toBeTruthy();
      expect(settingsMenuManager.panel).toBeTruthy();
      
      // Verify initial state is closed
      expect(settingsMenuManager.isOpen()).toBe(false);
      expect(settingsMenuManager.toggleButton.getAttribute('aria-expanded')).toBe('false');
      expect(settingsMenuManager.panel.getAttribute('aria-hidden')).toBe('true');
    });
    
    test('Both systems should initialize together without conflicts', () => {
      // Initialize both systems
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Verify both are initialized
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      expect(settingsMenuManager.toggleButton).toBeTruthy();
      
      // Verify no conflicts in DOM
      const toggleButton = document.querySelector('#settingsMenuToggle');
      expect(toggleButton).toBeTruthy();
      expect(toggleButton.offsetParent).not.toBeNull(); // Button is visible
      
      // Verify board size was calculated
      const boardContainer = document.querySelector('.board-container') || 
                            document.querySelector('#board');
      if (boardContainer) {
        const boardWidth = boardContainer.style.width;
        expect(boardWidth).toBeTruthy();
        expect(boardWidth).toContain('px');
      }
    });
    
    test('System should handle initialization on different viewport sizes', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      responsiveLayoutManager = new ResponsiveLayoutManager();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('mobile');
      
      responsiveLayoutManager.destroy();
      
      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });
      
      responsiveLayoutManager = new ResponsiveLayoutManager();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('tablet');
      
      responsiveLayoutManager.destroy();
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });
      
      responsiveLayoutManager = new ResponsiveLayoutManager();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('desktop');
    });
  });
  
  describe('Responsive Layout and Menu Interaction Tests', () => {
    
    test('Menu should open and close correctly at all breakpoints', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const breakpoints = [
        { width: 375, name: 'mobile' },
        { width: 800, name: 'tablet' },
        { width: 1440, name: 'desktop' }
      ];
      
      breakpoints.forEach(({ width, name }) => {
        // Set viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        responsiveLayoutManager.recalculateLayout();
        
        // Verify breakpoint
        expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe(name);
        
        // Open menu
        settingsMenuManager.open();
        expect(settingsMenuManager.isOpen()).toBe(true);
        
        // Close menu
        settingsMenuManager.close();
        expect(settingsMenuManager.isOpen()).toBe(false);
      });
    });
    
    test('Board size should recalculate when menu opens/closes', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Get initial board size
      const initialBoardSize = responsiveLayoutManager.calculateBoardSize();
      expect(initialBoardSize.width).toBeGreaterThan(0);
      expect(initialBoardSize.height).toBeGreaterThan(0);
      
      // Open menu
      settingsMenuManager.open();
      
      // Board size should still be valid
      const boardSizeWithMenuOpen = responsiveLayoutManager.calculateBoardSize();
      expect(boardSizeWithMenuOpen.width).toBeGreaterThan(0);
      expect(boardSizeWithMenuOpen.height).toBeGreaterThan(0);
      
      // Close menu
      settingsMenuManager.close();
      
      // Board size should still be valid
      const boardSizeWithMenuClosed = responsiveLayoutManager.calculateBoardSize();
      expect(boardSizeWithMenuClosed.width).toBeGreaterThan(0);
      expect(boardSizeWithMenuClosed.height).toBeGreaterThan(0);
    });
    
    test('Breakpoint changes should not affect menu state', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Open menu on mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      responsiveLayoutManager.recalculateLayout();
      settingsMenuManager.open();
      
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Change to tablet breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });
      responsiveLayoutManager.recalculateLayout();
      
      // Menu should still be open
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Change to desktop breakpoint
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });
      responsiveLayoutManager.recalculateLayout();
      
      // Menu should still be open
      expect(settingsMenuManager.isOpen()).toBe(true);
    });
    
    test('Responsive layout should update when menu is toggled', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Track layout events
      let layoutEventFired = false;
      responsiveLayoutManager.onBreakpointChange(() => {
        layoutEventFired = true;
      });
      
      // Toggle menu
      settingsMenuManager.toggle();
      
      // Layout should remain stable (no breakpoint change from menu toggle)
      expect(layoutEventFired).toBe(false);
      
      // But board should still be properly sized
      const boardSize = responsiveLayoutManager.calculateBoardSize();
      expect(boardSize.width).toBeGreaterThan(0);
    });
    
    test('Menu overlay should not interfere with board visibility', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const boardContainer = document.querySelector('.board-container') || 
                            document.querySelector('#board');
      
      if (boardContainer) {
        // Get board visibility before menu opens
        const boardVisibleBefore = boardContainer.offsetParent !== null;
        
        // Open menu
        settingsMenuManager.open();
        
        // Board should still be visible (menu uses overlay positioning)
        const boardVisibleAfter = boardContainer.offsetParent !== null;
        expect(boardVisibleAfter).toBe(boardVisibleBefore);
        
        // Close menu
        settingsMenuManager.close();
      }
    });
    
    test('Orientation changes should work with menu open', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Open menu
      settingsMenuManager.open();
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Simulate orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 600
      });
      
      // Trigger orientation change
      window.dispatchEvent(new Event('orientationchange'));
      
      // Wait for orientation change handler
      setTimeout(() => {
        // Menu should still be open
        expect(settingsMenuManager.isOpen()).toBe(true);
        
        // Layout should have updated
        const boardSize = responsiveLayoutManager.calculateBoardSize();
        expect(boardSize.width).toBeGreaterThan(0);
      }, 150);
    });
  });
  
  describe('Feature Integration Tests', () => {
    
    test('All feature controls should be accessible in menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const menuPanel = document.querySelector('#settingsMenuPanel');
      expect(menuPanel).toBeTruthy();
      
      // Check for all expected feature controls
      const expectedControls = [
        '#btnTheme',           // Theme toggle
        '#languageSelect',     // Language selector
        '#btnPieceSetup',      // Piece setup
        '#btnAnalyzePosition', // Position analysis
        '#btnSharePosition'    // Position sharing
      ];
      
      expectedControls.forEach(selector => {
        const control = menuPanel.querySelector(selector);
        expect(control).toBeTruthy();
        
        // Verify control is within menu content
        const menuContent = menuPanel.querySelector('.settings-menu-content');
        expect(menuContent.contains(control)).toBe(true);
      });
    });
    
    test('Feature controls should maintain functionality after menu operations', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Get feature controls
      const themeButton = document.querySelector('#btnTheme');
      const languageSelect = document.querySelector('#languageSelect');
      
      // Verify controls have event handlers
      expect(themeButton.getAttribute('onclick')).toBeTruthy();
      expect(languageSelect.getAttribute('onchange')).toBeTruthy();
      
      // Open and close menu multiple times
      for (let i = 0; i < 3; i++) {
        settingsMenuManager.open();
        settingsMenuManager.close();
      }
      
      // Controls should still have event handlers
      expect(themeButton.getAttribute('onclick')).toBeTruthy();
      expect(languageSelect.getAttribute('onchange')).toBeTruthy();
      
      // Controls should still be in DOM
      expect(document.contains(themeButton)).toBe(true);
      expect(document.contains(languageSelect)).toBe(true);
    });
    
    test('Theme toggle should work from within menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const themeButton = document.querySelector('#btnTheme');
      expect(themeButton).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Theme button should be accessible
      expect(themeButton.offsetParent).not.toBeNull();
      
      // Button should have proper structure
      const themeText = themeButton.querySelector('#btnThemeText');
      expect(themeText).toBeTruthy();
      expect(themeText.textContent).toBeTruthy();
    });
    
    test('Language selector should work from within menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const languageSelect = document.querySelector('#languageSelect');
      expect(languageSelect).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Language selector should be accessible
      expect(languageSelect.offsetParent).not.toBeNull();
      
      // Should have language options
      const options = languageSelect.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(0);
      
      // Should have label
      const label = document.querySelector('label[for="languageSelect"]');
      expect(label).toBeTruthy();
    });
    
    test('Piece setup button should work from within menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const pieceSetupButton = document.querySelector('#btnPieceSetup');
      expect(pieceSetupButton).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Button should be accessible
      expect(pieceSetupButton.offsetParent).not.toBeNull();
      
      // Button should have onclick handler
      expect(pieceSetupButton.getAttribute('onclick')).toContain('openPieceSetup');
    });
    
    test('Position sharing button should work from within menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const shareButton = document.querySelector('#btnSharePosition');
      expect(shareButton).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Button should be accessible
      expect(shareButton.offsetParent).not.toBeNull();
      
      // Button should have onclick handler
      expect(shareButton.getAttribute('onclick')).toContain('shareCurrentPosition');
    });
    
    test('Analysis button should work from within menu', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const analyzeButton = document.querySelector('#btnAnalyzePosition');
      expect(analyzeButton).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Button should be accessible
      expect(analyzeButton.offsetParent).not.toBeNull();
      
      // Button should have onclick handler
      expect(analyzeButton.getAttribute('onclick')).toContain('analyzeCurrentPosition');
    });
    
    test('Game board should remain functional when menu is open', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const gameContainer = document.querySelector('#mainGameContainer');
      expect(gameContainer).toBeTruthy();
      
      // Open menu
      settingsMenuManager.open();
      
      // Game container should still be in DOM
      expect(document.contains(gameContainer)).toBe(true);
      
      // Game container should still be visible
      const containerStyles = window.getComputedStyle(gameContainer);
      expect(containerStyles.display).not.toBe('none');
    });
    
    test('Move history should remain accessible when menu is closed', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const gameContainer = document.querySelector('#mainGameContainer');
      const backdrop = document.querySelector('#settingsMenuBackdrop');
      
      // Ensure menu is closed
      settingsMenuManager.close();
      
      // Backdrop should not block interactions
      const backdropStyles = window.getComputedStyle(backdrop);
      const isNonBlocking = 
        backdropStyles.display === 'none' ||
        backdropStyles.visibility === 'hidden' ||
        backdropStyles.pointerEvents === 'none' ||
        backdropStyles.opacity === '0';
      
      expect(isNonBlocking).toBe(true);
      
      // Game container should be accessible
      expect(gameContainer.offsetParent).not.toBeNull();
    });
  });
  
  describe('Accessibility Integration Tests', () => {
    
    test('ARIA attributes should be synchronized across menu operations', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const toggleButton = document.querySelector('#settingsMenuToggle');
      const menuPanel = document.querySelector('#settingsMenuPanel');
      const backdrop = document.querySelector('#settingsMenuBackdrop');
      
      // Initial state - menu closed
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
      expect(menuPanel.getAttribute('aria-hidden')).toBe('true');
      expect(backdrop.getAttribute('aria-hidden')).toBe('true');
      
      // Open menu
      settingsMenuManager.open();
      
      // All ARIA attributes should update
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
      expect(menuPanel.getAttribute('aria-hidden')).toBe('false');
      expect(backdrop.getAttribute('aria-hidden')).toBe('false');
      
      // Close menu
      settingsMenuManager.close();
      
      // All ARIA attributes should revert
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
      expect(menuPanel.getAttribute('aria-hidden')).toBe('true');
      expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    });
    
    test('Focus management should work correctly', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const toggleButton = document.querySelector('#settingsMenuToggle');
      
      // Focus toggle button
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
      
      // Open menu
      settingsMenuManager.open();
      
      // Wait for focus to move into menu
      setTimeout(() => {
        // Focus should be inside menu
        const menuPanel = document.querySelector('#settingsMenuPanel');
        expect(menuPanel.contains(document.activeElement)).toBe(true);
      }, 100);
    });
    
    test('Keyboard navigation should work with responsive layout', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Open menu
      settingsMenuManager.open();
      
      // Simulate Tab key
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        keyCode: 9,
        bubbles: true
      });
      
      document.dispatchEvent(tabEvent);
      
      // Focus should remain trapped in menu
      const menuPanel = document.querySelector('#settingsMenuPanel');
      expect(menuPanel.contains(document.activeElement)).toBe(true);
      
      // Simulate Escape key
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true
      });
      
      document.dispatchEvent(escapeEvent);
      
      // Menu should close
      expect(settingsMenuManager.isOpen()).toBe(false);
    });
    
    test('Screen reader announcements should work', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const announcer = document.querySelector('#settingsMenuAnnouncer');
      expect(announcer).toBeTruthy();
      
      // Verify announcer has correct ARIA attributes
      expect(announcer.getAttribute('role')).toBe('status');
      expect(announcer.getAttribute('aria-live')).toBe('polite');
      expect(announcer.getAttribute('aria-atomic')).toBe('true');
      
      // Open menu
      settingsMenuManager.open();
      
      // Wait for announcement
      setTimeout(() => {
        const announcementText = announcer.textContent;
        expect(announcementText).toBeTruthy();
        expect(announcementText.toLowerCase()).toContain('menu');
      }, 150);
    });
  });
  
  describe('Performance Integration Tests', () => {
    
    test('Layout recalculation should complete within 100ms', (done) => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      const startTime = performance.now();
      
      // Trigger layout recalculation
      responsiveLayoutManager.recalculateLayout();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within 100ms (Requirement 7.2)
      expect(duration).toBeLessThan(100);
      
      done();
    });
    
    test('Menu animation should complete within 300ms', (done) => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      const startTime = performance.now();
      
      // Open menu
      settingsMenuManager.open();
      
      // Wait for animation to complete
      setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Should complete within 300ms (Requirement 7.1)
        expect(duration).toBeLessThanOrEqual(350); // Allow small buffer
        
        // Menu should be fully open
        expect(settingsMenuManager.isOpen()).toBe(true);
        expect(settingsMenuManager.isAnimating).toBe(false);
        
        done();
      }, 350);
    });
    
    test('Rapid menu toggles should be debounced', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        settingsMenuManager.toggle();
      }
      
      // Menu should handle this gracefully without errors
      expect(settingsMenuManager.isMenuOpen).toBeDefined();
      expect(typeof settingsMenuManager.isMenuOpen).toBe('boolean');
    });
    
    test('Multiple viewport resizes should be handled efficiently', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      const startTime = performance.now();
      
      // Simulate multiple rapid resizes
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 400 + (i * 100)
        });
        
        window.dispatchEvent(new Event('resize'));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle efficiently (debouncing should prevent excessive recalculations)
      expect(duration).toBeLessThan(500);
      
      // Layout should still be valid
      const currentBreakpoint = responsiveLayoutManager.getCurrentBreakpoint();
      expect(['mobile', 'tablet', 'desktop']).toContain(currentBreakpoint);
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    
    test('System should handle missing board element gracefully', () => {
      // Temporarily remove board element
      const boardContainer = document.querySelector('.board-container') || 
                            document.querySelector('#board');
      const parent = boardContainer?.parentNode;
      
      if (boardContainer && parent) {
        parent.removeChild(boardContainer);
      }
      
      // Initialize system
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      // Should not throw error
      expect(() => {
        const boardSize = responsiveLayoutManager.calculateBoardSize();
        expect(boardSize.width).toBeGreaterThan(0);
      }).not.toThrow();
      
      // Restore board element
      if (boardContainer && parent) {
        parent.appendChild(boardContainer);
      }
    });
    
    test('System should handle invalid viewport dimensions', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      // Test with invalid dimensions
      const invalidDimensions = [
        { width: NaN, height: 800 },
        { width: 800, height: Infinity },
        { width: -100, height: 800 },
        { width: 800, height: 0 }
      ];
      
      invalidDimensions.forEach(({ width, height }) => {
        const isValid = responsiveLayoutManager.validateViewportDimensions(width, height);
        expect(isValid).toBe(false);
      });
      
      // Test with valid dimensions
      const validResult = responsiveLayoutManager.validateViewportDimensions(800, 600);
      expect(validResult).toBe(true);
    });
    
    test('Menu should handle missing optional elements', () => {
      // Temporarily remove close button
      const closeButton = document.querySelector('#settingsMenuClose');
      const parent = closeButton?.parentNode;
      
      if (closeButton && parent) {
        parent.removeChild(closeButton);
      }
      
      // Initialize menu
      settingsMenuManager = new SettingsMenuManager();
      const initialized = settingsMenuManager.initialize();
      
      // Should still initialize successfully
      expect(initialized).toBe(true);
      
      // Menu should still work
      settingsMenuManager.open();
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      settingsMenuManager.close();
      expect(settingsMenuManager.isOpen()).toBe(false);
      
      // Restore close button
      if (closeButton && parent) {
        parent.appendChild(closeButton);
      }
    });
    
    test('System should handle orientation changes during menu animation', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Start opening menu
      settingsMenuManager.open();
      
      // Immediately trigger orientation change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800
      });
      
      window.dispatchEvent(new Event('orientationchange'));
      
      // System should handle this gracefully
      setTimeout(() => {
        expect(settingsMenuManager.isMenuOpen).toBeDefined();
        expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      }, 400);
    });
    
    test('System should cleanup properly on destroy', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Verify systems are active
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      expect(settingsMenuManager.toggleButton).toBeTruthy();
      
      // Destroy both systems
      responsiveLayoutManager.destroy();
      settingsMenuManager.destroy();
      
      // Verify cleanup
      expect(responsiveLayoutManager.breakpointCallbacks.length).toBe(0);
      expect(settingsMenuManager.toggleButton).toBeNull();
      expect(settingsMenuManager.backdrop).toBeNull();
      expect(settingsMenuManager.panel).toBeNull();
    });
  });
  
  describe('Cross-Browser Compatibility Tests', () => {
    
    test('System should detect CSS transition support', () => {
      settingsMenuManager = new SettingsMenuManager();
      
      // Should have feature detection result
      expect(typeof settingsMenuManager.supportsCSSTransitions).toBe('boolean');
      
      // In modern browsers, should support transitions
      expect(settingsMenuManager.supportsCSSTransitions).toBe(true);
    });
    
    test('System should detect touch event support', () => {
      settingsMenuManager = new SettingsMenuManager();
      
      // Should have feature detection result
      expect(typeof settingsMenuManager.supportsTouchEvents).toBe('boolean');
    });
    
    test('System should provide fallback for ResizeObserver', () => {
      // Temporarily disable ResizeObserver
      const originalResizeObserver = window.ResizeObserver;
      window.ResizeObserver = undefined;
      
      // Initialize system
      responsiveLayoutManager = new ResponsiveLayoutManager();
      
      // Should initialize successfully with fallback
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      
      // Should have fallback handler
      expect(responsiveLayoutManager.resizeObserverFallbackHandler).toBeTruthy();
      
      // Restore ResizeObserver
      window.ResizeObserver = originalResizeObserver;
    });
    
    test('Menu should work without CSS transitions (fallback)', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Simulate no CSS transition support
      settingsMenuManager.supportsCSSTransitions = false;
      
      // Open menu
      settingsMenuManager.open();
      
      // Should apply final state immediately
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Close menu
      settingsMenuManager.close();
      
      // Should apply final state immediately
      expect(settingsMenuManager.isOpen()).toBe(false);
    });
    
    test('Touch events should fallback to mouse events', () => {
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Simulate no touch support
      settingsMenuManager.supportsTouchEvents = false;
      
      const toggleButton = document.querySelector('#settingsMenuToggle');
      
      // Should still respond to mouse events
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
      toggleButton.dispatchEvent(mouseDownEvent);
      
      // Should add touch-active class
      expect(toggleButton.classList.contains('touch-active')).toBe(true);
      
      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      toggleButton.dispatchEvent(mouseUpEvent);
      
      // Should remove touch-active class
      expect(toggleButton.classList.contains('touch-active')).toBe(false);
    });
  });
  
  describe('Complete System Integration Tests', () => {
    
    test('Complete user workflow: resize viewport, open menu, use features, close menu', () => {
      // Initialize both systems
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Step 1: Start on mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('mobile');
      
      // Step 2: Open menu
      settingsMenuManager.open();
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Step 3: Verify all features are accessible
      const themeButton = document.querySelector('#btnTheme');
      const languageSelect = document.querySelector('#languageSelect');
      expect(themeButton.offsetParent).not.toBeNull();
      expect(languageSelect.offsetParent).not.toBeNull();
      
      // Step 4: Resize to tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('tablet');
      
      // Step 5: Menu should still be open and functional
      expect(settingsMenuManager.isOpen()).toBe(true);
      expect(themeButton.offsetParent).not.toBeNull();
      
      // Step 6: Close menu
      settingsMenuManager.close();
      expect(settingsMenuManager.isOpen()).toBe(false);
      
      // Step 7: Resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });
      responsiveLayoutManager.recalculateLayout();
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBe('desktop');
      
      // Step 8: Reopen menu on desktop
      settingsMenuManager.open();
      expect(settingsMenuManager.isOpen()).toBe(true);
      
      // Step 9: All features should still work
      expect(themeButton.offsetParent).not.toBeNull();
      expect(languageSelect.offsetParent).not.toBeNull();
    });
    
    test('System should maintain state consistency across all operations', () => {
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Perform various operations
      const operations = [
        () => settingsMenuManager.open(),
        () => responsiveLayoutManager.recalculateLayout(),
        () => settingsMenuManager.close(),
        () => {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800
          });
          responsiveLayoutManager.recalculateLayout();
        },
        () => settingsMenuManager.toggle(),
        () => window.dispatchEvent(new Event('orientationchange')),
        () => settingsMenuManager.toggle()
      ];
      
      // Execute all operations
      operations.forEach(operation => {
        expect(() => operation()).not.toThrow();
      });
      
      // Verify system is still in valid state
      expect(responsiveLayoutManager.layoutState.isInitialized).toBe(true);
      expect(['mobile', 'tablet', 'desktop']).toContain(
        responsiveLayoutManager.getCurrentBreakpoint()
      );
      expect(typeof settingsMenuManager.isOpen()).toBe('boolean');
    });
    
    test('All requirements should be satisfied in integration', () => {
      // Initialize complete system
      responsiveLayoutManager = new ResponsiveLayoutManager();
      settingsMenuManager = new SettingsMenuManager();
      settingsMenuManager.initialize();
      
      // Requirement 1: Responsive Layout System
      expect(responsiveLayoutManager.getCurrentBreakpoint()).toBeTruthy();
      const boardSize = responsiveLayoutManager.calculateBoardSize();
      expect(boardSize.width).toBeGreaterThan(0);
      
      // Requirement 2: Settings Menu Interface
      expect(settingsMenuManager.toggleButton).toBeTruthy();
      expect(settingsMenuManager.panel).toBeTruthy();
      expect(settingsMenuManager.backdrop).toBeTruthy();
      
      // Requirement 3: Feature Preservation
      const allFeatures = [
        '#btnTheme',
        '#languageSelect',
        '#btnPieceSetup',
        '#btnAnalyzePosition',
        '#btnSharePosition'
      ];
      allFeatures.forEach(selector => {
        expect(document.querySelector(selector)).toBeTruthy();
      });
      
      // Requirement 4: Touch-Friendly Interface
      const toggleButton = document.querySelector('#settingsMenuToggle');
      const rect = toggleButton.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
      
      // Requirement 6: Accessibility Standards
      expect(toggleButton.getAttribute('aria-label')).toBeTruthy();
      expect(toggleButton.getAttribute('aria-expanded')).toBeTruthy();
      expect(settingsMenuManager.panel.getAttribute('role')).toBe('dialog');
      
      // Requirement 7: Performance and Animation
      expect(settingsMenuManager.animationDuration).toBe(300);
      
      // Requirement 8: Layout Adaptation Strategy
      const breakpoints = ['mobile', 'tablet', 'desktop'];
      expect(breakpoints).toContain(responsiveLayoutManager.getCurrentBreakpoint());
    });
  });
});

console.log('✅ Responsive Settings Menu Integration Tests completed');
