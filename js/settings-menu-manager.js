/**
 * Settings Menu Manager
 * 
 * Manages the responsive settings menu system including:
 * - Menu open/close/toggle functionality
 * - Click handlers for toggle button and backdrop
 * - Menu state management
 * - Animation coordination
 * - Keyboard navigation and accessibility
 * 
 * Requirements: 2.2, 2.4, 2.5, 2.7
 */

class SettingsMenuManager {
  constructor(options = {}) {
    // Element selectors
    this.toggleButtonSelector = options.toggleButtonSelector || '#settingsMenuToggle';
    this.backdropSelector = options.backdropSelector || '#settingsMenuBackdrop';
    this.panelSelector = options.panelSelector || '#settingsMenuPanel';
    this.closeButtonSelector = options.closeButtonSelector || '#settingsMenuClose';
    this.contentSelector = options.contentSelector || '.settings-menu-content';
    this.announcerSelector = options.announcerSelector || '#settingsMenuAnnouncer';
    
    // Animation settings
    this.animationDuration = options.animationDuration || 300;
    
    // Debouncing settings (Requirement 5.6: Add debouncing for rapid toggle clicks)
    this.toggleDebounceDelay = options.toggleDebounceDelay || 50; // 50ms debounce
    this.toggleDebounceTimer = null;
    
    // State
    this.isMenuOpen = false;
    this.isAnimating = false;
    this.focusTrapActive = false;
    
    // Elements (will be set during initialization)
    this.toggleButton = null;
    this.backdrop = null;
    this.panel = null;
    this.closeButton = null;
    this.content = null;
    this.announcer = null;
    
    // Store focusable elements for focus trapping
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    
    // Store the element that had focus before menu opened
    this.previouslyFocusedElement = null;
    
    // Bound event handlers (for proper removal)
    this.boundHandleToggleClick = this.handleToggleClick.bind(this);
    this.boundHandleBackdropClick = this.handleBackdropClick.bind(this);
    this.boundHandleCloseClick = this.handleCloseClick.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleFocusTrap = this.handleFocusTrap.bind(this);
    
    // Feature detection flags
    this.supportsCSSTransitions = this.detectCSSTransitionSupport();
    this.supportsTouchEvents = this.detectTouchEventSupport();
  }
  
  /**
   * Initialize the settings menu system
   * Sets up DOM references and event listeners
   */
  initialize() {
    // Get DOM elements
    this.toggleButton = document.querySelector(this.toggleButtonSelector);
    this.backdrop = document.querySelector(this.backdropSelector);
    this.panel = document.querySelector(this.panelSelector);
    this.closeButton = document.querySelector(this.closeButtonSelector);
    this.content = document.querySelector(this.contentSelector);
    this.announcer = document.querySelector(this.announcerSelector);
    
    // Validate required elements
    if (!this.toggleButton) {
      console.error('SettingsMenuManager: Toggle button not found');
      return false;
    }
    
    if (!this.backdrop) {
      console.error('SettingsMenuManager: Backdrop not found');
      return false;
    }
    
    if (!this.panel) {
      console.error('SettingsMenuManager: Panel not found');
      return false;
    }
    
    // Announcer is optional but recommended for accessibility
    if (!this.announcer) {
      console.warn('SettingsMenuManager: Announcer element not found - screen reader announcements will be limited');
    }
    
    // Log feature detection results
    console.log('🔍 Feature detection:');
    console.log('  - CSS Transitions:', this.supportsCSSTransitions ? '✅' : '❌ (using fallback)');
    console.log('  - Touch Events:', this.supportsTouchEvents ? '✅' : '❌ (using mouse events)');
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initialize focusable elements list
    this.updateFocusableElements();
    
    // Ensure menu starts in closed state
    this.ensureClosedState();
    
    return true;
  }
  
  /**
   * Detect CSS transition support
   * Requirement 5.5: Add CSS transition fallback
   * @returns {boolean}
   */
  detectCSSTransitionSupport() {
    const testElement = document.createElement('div');
    const transitionProperties = [
      'transition',
      'WebkitTransition',
      'MozTransition',
      'OTransition',
      'msTransition'
    ];
    
    for (const property of transitionProperties) {
      if (testElement.style[property] !== undefined) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Detect touch event support
   * Requirement 5.5: Add touch event fallback
   * @returns {boolean}
   */
  detectTouchEventSupport() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }
  
  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Toggle button click
    this.toggleButton.addEventListener('click', this.boundHandleToggleClick);
    
    // Backdrop click
    this.backdrop.addEventListener('click', this.boundHandleBackdropClick);
    
    // Close button click (if exists)
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.boundHandleCloseClick);
    }
    
    // Keyboard events
    document.addEventListener('keydown', this.boundHandleKeyDown);
    
    // Touch event handling - Requirements 4.4, 4.5
    this.setupTouchEventHandling();
  }
  
  /**
   * Setup touch event handling for interactive elements
   * Provides immediate visual feedback on touch (active states)
   * Requirements: 4.4, 4.5, 5.5 (touch event fallback)
   */
  setupTouchEventHandling() {
    // Add touch event listeners to toggle button
    this.setupTouchFeedback(this.toggleButton);
    
    // Add touch event listeners to close button
    if (this.closeButton) {
      this.setupTouchFeedback(this.closeButton);
    }
    
    // Add touch event listeners to all interactive elements in menu content
    if (this.content) {
      // Find all interactive elements
      const interactiveSelectors = [
        'button',
        'a',
        'select',
        'input[type="button"]',
        'input[type="submit"]',
        '.btn',
        '.extra-btn',
        '.menu-control-btn'
      ];
      
      const interactiveElements = this.content.querySelectorAll(interactiveSelectors.join(','));
      
      interactiveElements.forEach(element => {
        this.setupTouchFeedback(element);
      });
    }
  }
  
  /**
   * Setup touch feedback for a specific element
   * Requirement 5.5: Add touch event fallback (use mouse events)
   * @param {HTMLElement} element - The element to add touch feedback to
   */
  setupTouchFeedback(element) {
    if (!element) return;
    
    // Determine which events to use based on touch support
    const startEvent = this.supportsTouchEvents ? 'touchstart' : 'mousedown';
    const endEvent = this.supportsTouchEvents ? 'touchend' : 'mouseup';
    const cancelEvent = this.supportsTouchEvents ? 'touchcancel' : 'mouseleave';
    
    // Handle start event - add active state immediately
    element.addEventListener(startEvent, (event) => {
      // Add active class for visual feedback
      element.classList.add('touch-active');
      
      // For buttons and links, add pressed state
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        element.style.transform = 'scale(0.98)';
        element.style.transition = 'transform 0.1s ease';
      }
      
      // Provide haptic feedback if available (only for touch events)
      if (this.supportsTouchEvents && navigator.vibrate) {
        navigator.vibrate(10); // Short vibration (10ms)
      }
    }, { passive: true });
    
    // Handle end event - remove active state
    element.addEventListener(endEvent, (event) => {
      // Remove active class
      element.classList.remove('touch-active');
      
      // Reset transform
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        element.style.transform = '';
      }
    }, { passive: true });
    
    // Handle cancel event - remove active state if touch/mouse is cancelled
    element.addEventListener(cancelEvent, (event) => {
      // Remove active class
      element.classList.remove('touch-active');
      
      // Reset transform
      if (element.tagName === 'BUTTON' || element.tagName === 'A') {
        element.style.transform = '';
      }
    }, { passive: true });
  }
  
  /**
   * Handle toggle button click
   */
  handleToggleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Requirement 5.6: Add debouncing for rapid toggle clicks
    if (this.toggleDebounceTimer) {
      clearTimeout(this.toggleDebounceTimer);
    }
    
    this.toggleDebounceTimer = setTimeout(() => {
      this.toggle();
      this.toggleDebounceTimer = null;
    }, this.toggleDebounceDelay);
  }
  
  /**
   * Handle backdrop click
   */
  handleBackdropClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
  
  /**
   * Handle close button click
   */
  handleCloseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
  
  /**
   * Handle keyboard events
   */
  handleKeyDown(event) {
    // Only handle keyboard events when menu is open
    if (!this.isMenuOpen) {
      return;
    }
    
    // Escape key closes menu
    if (event.key === 'Escape' || event.keyCode === 27) {
      event.preventDefault();
      this.close();
      return;
    }
    
    // Tab key for focus trapping
    if (event.key === 'Tab' || event.keyCode === 9) {
      this.handleFocusTrap(event);
    }
  }
  
  /**
   * Handle focus trapping within menu
   */
  handleFocusTrap(event) {
    if (!this.focusTrapActive || this.focusableElements.length === 0) {
      return;
    }
    
    const isTabPressed = event.key === 'Tab' || event.keyCode === 9;
    
    if (!isTabPressed) {
      return;
    }
    
    // Update focusable elements in case DOM changed
    this.updateFocusableElements();
    
    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement.focus();
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement.focus();
      }
    }
  }
  
  /**
   * Update the list of focusable elements within the menu
   */
  updateFocusableElements() {
    if (!this.panel) {
      return;
    }
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    
    this.focusableElements = Array.from(
      this.panel.querySelectorAll(focusableSelectors.join(','))
    ).filter(element => {
      // Filter out hidden elements
      return element.offsetParent !== null;
    });
    
    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null;
  }
  
  /**
   * Announce a message to screen readers
   * @param {string} message - The message to announce
   */
  announce(message) {
    if (!this.announcer) {
      return;
    }
    
    // Clear previous announcement
    this.announcer.textContent = '';
    
    // Set new announcement after a brief delay to ensure it's read
    setTimeout(() => {
      this.announcer.textContent = message;
    }, 100);
  }
  
  /**
   * Open the settings menu
   */
  open() {
    // Prevent opening if already open or animating
    if (this.isMenuOpen || this.isAnimating) {
      return;
    }
    
    // Set animating state
    this.isAnimating = true;
    
    // Store currently focused element
    this.previouslyFocusedElement = document.activeElement;
    
    // Update state
    this.isMenuOpen = true;
    
    // Update ARIA attributes
    this.toggleButton.setAttribute('aria-expanded', 'true');
    this.panel.setAttribute('aria-hidden', 'false');
    this.backdrop.setAttribute('aria-hidden', 'false');
    
    // Announce to screen readers
    this.announce('Settings menu opened');
    
    // Add active class to backdrop
    this.backdrop.classList.add('active');
    
    // Requirement 5.5: CSS transition fallback
    if (!this.supportsCSSTransitions) {
      // Apply final state immediately without animation
      this.applyOpenStateFallback();
    }
    
    // Update focusable elements
    this.updateFocusableElements();
    
    // Enable focus trap
    this.focusTrapActive = true;
    
    // Focus first focusable element in menu
    setTimeout(() => {
      if (this.firstFocusableElement) {
        this.firstFocusableElement.focus();
      } else if (this.closeButton) {
        this.closeButton.focus();
      }
    }, 50);
    
    // Clear animating state after animation completes
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }
  
  /**
   * Apply open state without CSS transitions (fallback)
   * Requirement 5.5: Apply final state immediately when transitions not supported
   */
  applyOpenStateFallback() {
    console.log('⚠️ Applying open state without CSS transitions (fallback)');
    
    // Apply final styles directly
    if (this.panel) {
      this.panel.style.transform = 'translateX(0)';
      this.panel.style.opacity = '1';
      this.panel.style.visibility = 'visible';
    }
    
    if (this.backdrop) {
      this.backdrop.style.opacity = '1';
      this.backdrop.style.visibility = 'visible';
    }
  }
  
  /**
   * Close the settings menu
   */
  close() {
    // Prevent closing if already closed or animating
    if (!this.isMenuOpen || this.isAnimating) {
      return;
    }
    
    // Set animating state
    this.isAnimating = true;
    
    // Update state
    this.isMenuOpen = false;
    
    // Update ARIA attributes
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.panel.setAttribute('aria-hidden', 'true');
    this.backdrop.setAttribute('aria-hidden', 'true');
    
    // Announce to screen readers
    this.announce('Settings menu closed');
    
    // Remove active class from backdrop
    this.backdrop.classList.remove('active');
    
    // Requirement 5.5: CSS transition fallback
    if (!this.supportsCSSTransitions) {
      // Apply final state immediately without animation
      this.applyClosedStateFallback();
    }
    
    // Disable focus trap
    this.focusTrapActive = false;
    
    // Restore focus to previously focused element
    if (this.previouslyFocusedElement && this.previouslyFocusedElement.focus) {
      this.previouslyFocusedElement.focus();
    } else {
      // Fallback to toggle button
      this.toggleButton.focus();
    }
    
    // Clear animating state after animation completes
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }
  
  /**
   * Apply closed state without CSS transitions (fallback)
   * Requirement 5.5: Apply final state immediately when transitions not supported
   */
  applyClosedStateFallback() {
    console.log('⚠️ Applying closed state without CSS transitions (fallback)');
    
    // Apply final styles directly
    if (this.panel) {
      this.panel.style.transform = 'translateX(100%)';
      this.panel.style.opacity = '0';
      this.panel.style.visibility = 'hidden';
    }
    
    if (this.backdrop) {
      this.backdrop.style.opacity = '0';
      this.backdrop.style.visibility = 'hidden';
    }
  }
  
  /**
   * Toggle menu state (open/close)
   */
  toggle() {
    if (this.isMenuOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Check if menu is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.isMenuOpen;
  }
  
  /**
   * Ensure menu is in closed state (useful for initialization)
   */
  ensureClosedState() {
    this.isMenuOpen = false;
    this.isAnimating = false;
    this.focusTrapActive = false;
    
    // Set ARIA attributes to closed state
    if (this.toggleButton) {
      this.toggleButton.setAttribute('aria-expanded', 'false');
    }
    
    if (this.panel) {
      this.panel.setAttribute('aria-hidden', 'true');
    }
    
    if (this.backdrop) {
      this.backdrop.setAttribute('aria-hidden', 'true');
      this.backdrop.classList.remove('active');
    }
  }
  
  /**
   * Register a control element to be included in the menu
   * This method can be used to dynamically add controls to the menu
   * @param {HTMLElement} controlElement - The control element to register
   */
  registerControl(controlElement) {
    if (!controlElement || !this.content) {
      console.error('SettingsMenuManager: Invalid control element or content container');
      return false;
    }
    
    // Append control to menu content
    this.content.appendChild(controlElement);
    
    // Add touch event handling to the new control
    this.setupTouchFeedback(controlElement);
    
    // If the control contains interactive elements, add touch handling to them too
    const interactiveSelectors = [
      'button',
      'a',
      'select',
      'input[type="button"]',
      'input[type="submit"]',
      '.btn',
      '.extra-btn',
      '.menu-control-btn'
    ];
    
    const interactiveElements = controlElement.querySelectorAll(interactiveSelectors.join(','));
    interactiveElements.forEach(element => {
      this.setupTouchFeedback(element);
    });
    
    // Update focusable elements
    this.updateFocusableElements();
    
    return true;
  }
  
  /**
   * Setup keyboard navigation
   * This is called automatically during initialization
   */
  setupKeyboardNavigation() {
    // Keyboard navigation is already set up in setupEventListeners
    // This method is provided for API completeness
    this.updateFocusableElements();
  }
  
  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    // Clear debounce timer
    if (this.toggleDebounceTimer) {
      clearTimeout(this.toggleDebounceTimer);
      this.toggleDebounceTimer = null;
    }
    
    // Remove event listeners
    if (this.toggleButton) {
      this.toggleButton.removeEventListener('click', this.boundHandleToggleClick);
    }
    
    if (this.backdrop) {
      this.backdrop.removeEventListener('click', this.boundHandleBackdropClick);
    }
    
    if (this.closeButton) {
      this.closeButton.removeEventListener('click', this.boundHandleCloseClick);
    }
    
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    
    // Close menu if open
    if (this.isMenuOpen) {
      this.close();
    }
    
    // Clear references
    this.toggleButton = null;
    this.backdrop = null;
    this.panel = null;
    this.closeButton = null;
    this.content = null;
    this.announcer = null;
    this.focusableElements = [];
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;
    this.previouslyFocusedElement = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SettingsMenuManager;
}
