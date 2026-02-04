/**
 * Mobile Optimization Manager for 4x5 Chess Piece Setup
 * Provides comprehensive mobile optimization with touch events, gestures, and haptic feedback
 * 
 * Requirements: 7.1, 7.4, 7.5
 * - Touch event handler system (tap, drag, pinch, double-tap)
 * - Gesture recognition algorithms
 * - Haptic feedback integration (navigator.vibrate API)
 * - Touch-friendly UI adaptations
 */

class MobileOptimizationManager {
  constructor(enhancedUI, dragDropSystem, responsiveLayout) {
    this.enhancedUI = enhancedUI;
    this.dragDropSystem = dragDropSystem;
    this.responsiveLayout = responsiveLayout;
    
    // Touch state management
    this.touchState = {
      isActive: false,
      startTime: 0,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      lastTap: 0,
      tapCount: 0,
      activeTouch: null,
      touchedElement: null,
      isDragging: false,
      isPinching: false,
      gestureStartDistance: 0,
      gestureCurrentDistance: 0
    };
    
    // Gesture recognition settings
    this.gestureSettings = {
      tapThreshold: 10, // pixels
      longPressThreshold: 500, // milliseconds
      doubleTapThreshold: 300, // milliseconds
      dragThreshold: 15, // pixels
      pinchThreshold: 20, // pixels
      swipeThreshold: 50, // pixels
      swipeVelocityThreshold: 0.5 // pixels per millisecond
    };
    
    // Haptic feedback patterns
    this.hapticPatterns = {
      tap: [10],
      doubleTap: [10, 50, 10],
      longPress: [20],
      success: [10, 30, 10],
      error: [50, 100, 50],
      warning: [30, 50, 30],
      selection: [15],
      drag: [5],
      drop: [20],
      invalid: [100]
    };
    
    // Touch-friendly UI settings
    this.uiSettings = {
      minTouchTarget: 44, // minimum touch target size in pixels
      touchPadding: 8, // additional padding for touch targets
      enlargedPieceSize: 1.2, // scale factor for mobile pieces
      collapsiblePalette: true,
      gestureHints: true
    };
    
    // Device capabilities
    this.deviceCapabilities = {
      hasTouch: 'ontouchstart' in window,
      hasHaptic: 'vibrate' in navigator,
      hasPointerEvents: 'onpointerdown' in window,
      hasGestureEvents: 'ongesturestart' in window,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    };
    
    // Gesture recognition state
    this.gestureRecognizer = {
      currentGesture: null,
      gestureHistory: [],
      recognitionTimeout: null
    };
    
    // Initialize mobile optimization
    this.initialize();
  }
  
  /**
   * Initialize mobile optimization system
   */
  initialize() {
    console.log('📱 Initializing Mobile Optimization Manager...');
    
    // Check device capabilities
    this.detectDeviceCapabilities();
    
    // Initialize touch event handlers
    this.initializeTouchEvents();
    
    // Initialize gesture recognition
    this.initializeGestureRecognition();
    
    // Apply mobile UI adaptations
    this.adaptUIForMobile();
    
    // Setup haptic feedback
    this.initializeHapticFeedback();
    
    // Initialize mobile-specific features
    this.initializeMobileFeatures();
    
    console.log('✨ Mobile Optimization Manager initialized successfully');
    console.log('📊 Device capabilities:', this.deviceCapabilities);
  }
  
  /**
   * Detect and log device capabilities
   */
  detectDeviceCapabilities() {
    // Enhanced touch detection
    this.deviceCapabilities.hasTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    
    // Enhanced haptic detection
    this.deviceCapabilities.hasHaptic = (
      'vibrate' in navigator &&
      typeof navigator.vibrate === 'function'
    );
    
    // Screen size detection
    this.deviceCapabilities.screenSize = {
      width: window.screen.width,
      height: window.screen.height,
      ratio: window.devicePixelRatio || 1
    };
    
    // Orientation detection
    this.deviceCapabilities.orientation = screen.orientation?.type || 'unknown';
    
    console.log('📱 Device capabilities detected:', this.deviceCapabilities);
  }
  
  /**
   * Initialize touch event handlers
   */
  initializeTouchEvents() {
    if (!this.deviceCapabilities.hasTouch) {
      console.log('📱 Touch not supported, skipping touch event initialization');
      return;
    }
    
    console.log('👆 Initializing touch event handlers...');
    
    // Use passive listeners for better performance
    const passiveOptions = { passive: false };
    
    // Global touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), passiveOptions);
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), passiveOptions);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), passiveOptions);
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), passiveOptions);
    
    // Prevent default touch behaviors that interfere with drag & drop
    document.addEventListener('touchstart', this.preventDefaultTouch.bind(this), { passive: false });
    document.addEventListener('touchmove', this.preventDefaultTouch.bind(this), { passive: false });
    
    // Initialize piece-specific touch handlers
    this.initializePieceTouchHandlers();
    
    // Initialize board touch handlers
    this.initializeBoardTouchHandlers();
    
    console.log('✅ Touch event handlers initialized');
  }
  
  /**
   * Initialize piece-specific touch handlers
   */
  initializePieceTouchHandlers() {
    // Palette pieces touch handling
    document.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('palette-piece')) {
        this.handlePalettePieceTouch(e);
      }
    });
    
    // Board pieces touch handling
    document.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('setup-piece')) {
        this.handleBoardPieceTouch(e);
      }
    });
  }
  
  /**
   * Initialize board touch handlers
   */
  initializeBoardTouchHandlers() {
    // Setup squares touch handling
    document.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('setup-square')) {
        this.handleSquareTouch(e);
      }
    });
  }
  
  /**
   * Handle touch start events
   */
  handleTouchStart(e) {
    const touch = e.touches[0];
    const currentTime = Date.now();
    
    // Update touch state
    this.touchState.isActive = true;
    this.touchState.startTime = currentTime;
    this.touchState.startPosition = { x: touch.clientX, y: touch.clientY };
    this.touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
    this.touchState.activeTouch = touch;
    this.touchState.touchedElement = e.target;
    this.touchState.isDragging = false;
    
    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      this.handlePinchStart(e);
    }
    
    // Detect double tap
    if (currentTime - this.touchState.lastTap < this.gestureSettings.doubleTapThreshold) {
      this.touchState.tapCount++;
      if (this.touchState.tapCount === 2) {
        this.handleDoubleTap(e);
        return;
      }
    } else {
      this.touchState.tapCount = 1;
    }
    
    this.touchState.lastTap = currentTime;
    
    // Start long press detection
    this.startLongPressDetection(e);
    
    // Provide haptic feedback for touch start
    this.triggerHapticFeedback('tap');
    
    console.log('👆 Touch start:', { x: touch.clientX, y: touch.clientY, target: e.target.className });
  }
  
  /**
   * Handle touch move events
   */
  handleTouchMove(e) {
    if (!this.touchState.isActive) return;
    
    const touch = e.touches[0];
    this.touchState.currentPosition = { x: touch.clientX, y: touch.clientY };
    
    // Calculate movement distance
    const deltaX = touch.clientX - this.touchState.startPosition.x;
    const deltaY = touch.clientY - this.touchState.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2) {
      this.handlePinchMove(e);
      return;
    }
    
    // Start drag if threshold exceeded
    if (!this.touchState.isDragging && distance > this.gestureSettings.dragThreshold) {
      this.startTouchDrag(e);
    }
    
    // Continue drag if active
    if (this.touchState.isDragging) {
      this.continueTouchDrag(e);
    }
    
    // Cancel long press if moved too much
    if (distance > this.gestureSettings.tapThreshold) {
      this.cancelLongPressDetection();
    }
  }
  
  /**
   * Handle touch end events
   */
  handleTouchEnd(e) {
    if (!this.touchState.isActive) return;
    
    const currentTime = Date.now();
    const touchDuration = currentTime - this.touchState.startTime;
    
    // Handle drag end
    if (this.touchState.isDragging) {
      this.endTouchDrag(e);
    } else {
      // Handle tap if no drag occurred
      const deltaX = this.touchState.currentPosition.x - this.touchState.startPosition.x;
      const deltaY = this.touchState.currentPosition.y - this.touchState.startPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance <= this.gestureSettings.tapThreshold) {
        this.handleTap(e);
      }
    }
    
    // Handle pinch end
    if (this.touchState.isPinching) {
      this.handlePinchEnd(e);
    }
    
    // Clean up touch state
    this.resetTouchState();
    
    console.log('👆 Touch end after', touchDuration, 'ms');
  }
  
  /**
   * Handle touch cancel events
   */
  handleTouchCancel(e) {
    console.log('👆 Touch cancelled');
    
    // Clean up any active operations
    if (this.touchState.isDragging) {
      this.cancelTouchDrag(e);
    }
    
    this.cancelLongPressDetection();
    this.resetTouchState();
  }
  
  /**
   * Handle palette piece touch
   */
  handlePalettePieceTouch(e) {
    const piece = e.target;
    const pieceType = piece.dataset.piece;
    
    console.log('👆 Palette piece touched:', pieceType);
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(piece, 'touch-feedback');
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('selection');
    
    // Store for potential drag operation
    this.touchState.selectedPiece = pieceType;
    this.touchState.selectedElement = piece;
  }
  
  /**
   * Handle board piece touch
   */
  handleBoardPieceTouch(e) {
    const piece = e.target;
    const pieceType = piece.dataset.piece;
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    console.log('👆 Board piece touched:', pieceType, 'at', row, col);
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(piece, 'touch-feedback');
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('selection');
    
    // Store for potential drag operation
    this.touchState.selectedPiece = pieceType;
    this.touchState.selectedElement = piece;
    this.touchState.selectedPosition = { row, col };
  }
  
  /**
   * Handle square touch
   */
  handleSquareTouch(e) {
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    console.log('👆 Square touched:', row, col);
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(square, 'touch-feedback');
    }
    
    // Store for potential placement
    this.touchState.targetSquare = square;
    this.touchState.targetPosition = { row, col };
  }
  
  /**
   * Handle tap gesture
   */
  handleTap(e) {
    const target = e.target;
    
    console.log('👆 Tap detected on:', target.className);
    
    // Handle palette piece tap (selection)
    if (target.classList.contains('palette-piece')) {
      this.handlePalettePieceTap(target);
    }
    
    // Handle square tap (placement)
    else if (target.classList.contains('setup-square')) {
      this.handleSquareTap(target);
    }
    
    // Handle board piece tap (selection for moving)
    else if (target.classList.contains('setup-piece')) {
      this.handleBoardPieceTap(target);
    }
    
    // Provide haptic feedback
    this.triggerHapticFeedback('tap');
  }
  
  /**
   * Handle double tap gesture
   */
  handleDoubleTap(e) {
    const target = e.target;
    
    console.log('👆 Double tap detected on:', target.className);
    
    // Handle palette piece double tap (quick placement)
    if (target.classList.contains('palette-piece')) {
      this.handlePaletteDoubleTab(target);
    }
    
    // Handle square double tap (clear)
    else if (target.classList.contains('setup-square')) {
      this.handleSquareDoubleTap(target);
    }
    
    // Provide haptic feedback
    this.triggerHapticFeedback('doubleTap');
    
    // Prevent single tap from firing
    this.touchState.tapCount = 0;
  }
  
  /**
   * Handle palette piece tap
   */
  handlePalettePieceTap(piece) {
    const pieceType = piece.dataset.piece;
    
    // Remove previous selection
    document.querySelectorAll('.palette-piece.selected').forEach(p => {
      p.classList.remove('selected');
      if (this.enhancedUI) {
        this.enhancedUI.animateElement(p, 'deselect');
      }
    });
    
    // Select current piece
    piece.classList.add('selected');
    selectedPalettePiece = pieceType;
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showSelectionFeedback(piece);
      this.enhancedUI.animateElement(piece, 'select');
    }
    
    // Show placement hints
    this.showMobilePlacementHints(pieceType);
    
    // Haptic feedback
    this.triggerHapticFeedback('selection');
    
    console.log('📱 Mobile piece selection:', pieceType);
  }
  
  /**
   * Handle square tap (placement)
   */
  handleSquareTap(square) {
    if (!selectedPalettePiece) return;
    
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Validate placement using drag & drop system
    if (this.dragDropSystem && !this.dragDropSystem.validateDrop(selectedPalettePiece, row, col)) {
      this.handleInvalidMobilePlacement(square, selectedPalettePiece, row, col);
      return;
    }
    
    // Perform valid placement
    this.performMobilePlacement(square, selectedPalettePiece, row, col);
  }
  
  /**
   * Handle board piece tap (selection for moving)
   */
  handleBoardPieceTap(piece) {
    const pieceType = piece.dataset.piece;
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Select piece for moving
    selectedPalettePiece = pieceType;
    
    // Remove piece from current position
    setupBoard[row][col] = null;
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(square, 'piece-selected-for-move');
    }
    
    // Show placement hints
    this.showMobilePlacementHints(pieceType);
    
    // Redraw board
    drawSetupBoard();
    this.reinitializeMobileHandlers();
    
    // Haptic feedback
    this.triggerHapticFeedback('selection');
    
    console.log('📱 Mobile piece selected for moving:', pieceType, 'from', row, col);
  }
  
  /**
   * Handle palette piece double tap (quick placement)
   */
  handlePaletteDoubleTab(piece) {
    const pieceType = piece.dataset.piece;
    
    // Find first available valid square
    const validSquare = this.findFirstValidSquare(pieceType);
    
    if (validSquare) {
      this.performMobilePlacement(validSquare, pieceType, 
        parseInt(validSquare.dataset.row), 
        parseInt(validSquare.dataset.col)
      );
      
      // Enhanced feedback for quick placement
      if (this.enhancedUI) {
        this.enhancedUI.showEnhancedNotification(
          t('quickPlacement') || 'Quick placement!', 
          'success', 
          2000
        );
      }
    } else {
      // No valid placement found
      this.triggerHapticFeedback('error');
      if (this.enhancedUI) {
        this.enhancedUI.showEnhancedNotification(
          t('noValidPlacement') || 'No valid placement available!', 
          'warning', 
          2000
        );
      }
    }
    
    console.log('📱 Quick placement attempt for:', pieceType);
  }
  
  /**
   * Handle square double tap (clear)
   */
  handleSquareDoubleTap(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    if (setupBoard[row][col] !== null) {
      // Clear the square
      setupBoard[row][col] = null;
      
      // Visual feedback
      if (this.enhancedUI) {
        this.enhancedUI.animateElement(square, 'piece-removed');
        this.enhancedUI.showEnhancedNotification(
          t('pieceRemoved') || 'Piece removed!', 
          'info', 
          1500
        );
      }
      
      // Redraw board
      drawSetupBoard();
      this.reinitializeMobileHandlers();
      
      // Haptic feedback
      this.triggerHapticFeedback('warning');
      
      console.log('📱 Square cleared via double tap:', row, col);
    }
  }
  
  /**
   * Start long press detection
   */
  startLongPressDetection(e) {
    this.cancelLongPressDetection(); // Cancel any existing detection
    
    this.longPressTimeout = setTimeout(() => {
      this.handleLongPress(e);
    }, this.gestureSettings.longPressThreshold);
  }
  
  /**
   * Cancel long press detection
   */
  cancelLongPressDetection() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }
  
  /**
   * Handle long press gesture
   */
  handleLongPress(e) {
    const target = this.touchState.touchedElement;
    
    console.log('👆 Long press detected on:', target.className);
    
    // Handle palette piece long press (show info)
    if (target.classList.contains('palette-piece')) {
      this.showPieceInfo(target);
    }
    
    // Handle square long press (show square info)
    else if (target.classList.contains('setup-square')) {
      this.showSquareInfo(target);
    }
    
    // Handle board piece long press (show piece options)
    else if (target.classList.contains('setup-piece')) {
      this.showPieceOptions(target);
    }
    
    // Provide haptic feedback
    this.triggerHapticFeedback('longPress');
  }
  
  /**
   * Start touch drag operation
   */
  startTouchDrag(e) {
    this.touchState.isDragging = true;
    
    const target = this.touchState.touchedElement;
    
    console.log('👆 Starting touch drag on:', target.className);
    
    // Cancel long press detection
    this.cancelLongPressDetection();
    
    // Handle different drag sources
    if (target.classList.contains('palette-piece')) {
      this.startPalettePieceDrag(target);
    } else if (target.classList.contains('setup-piece')) {
      this.startBoardPieceDrag(target);
    }
    
    // Provide haptic feedback
    this.triggerHapticFeedback('drag');
  }
  
  /**
   * Continue touch drag operation
   */
  continueTouchDrag(e) {
    if (!this.touchState.isDragging) return;
    
    const touch = e.touches[0];
    
    // Update drag ghost position if available
    if (this.dragDropSystem && this.dragDropSystem.feedbackElements.dragGhost) {
      this.dragDropSystem.updateDragGhost(touch.clientX, touch.clientY);
    }
    
    // Find element under touch
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Handle drag over effects
    if (elementUnder && elementUnder.classList.contains('setup-square')) {
      this.handleTouchDragOver(elementUnder);
    }
  }
  
  /**
   * End touch drag operation
   */
  endTouchDrag(e) {
    if (!this.touchState.isDragging) return;
    
    console.log('👆 Ending touch drag');
    
    const touch = e.changedTouches[0];
    const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Handle drop
    if (elementUnder && elementUnder.classList.contains('setup-square')) {
      this.handleTouchDrop(elementUnder);
    } else {
      // Invalid drop - return to original position
      this.handleInvalidTouchDrop();
    }
    
    // Clean up drag state
    this.touchState.isDragging = false;
    
    // Hide drag ghost
    if (this.dragDropSystem) {
      this.dragDropSystem.hideDragGhost();
    }
  }
  
  /**
   * Cancel touch drag operation
   */
  cancelTouchDrag(e) {
    console.log('👆 Cancelling touch drag');
    
    // Return piece to original position if needed
    if (this.touchState.selectedPosition) {
      const { row, col } = this.touchState.selectedPosition;
      setupBoard[row][col] = this.touchState.selectedPiece;
    }
    
    // Clean up drag state
    this.touchState.isDragging = false;
    
    // Hide drag ghost
    if (this.dragDropSystem) {
      this.dragDropSystem.hideDragGhost();
    }
    
    // Redraw board
    drawSetupBoard();
    this.reinitializeMobileHandlers();
    
    // Haptic feedback
    this.triggerHapticFeedback('error');
  }
  
  /**
   * Handle touch drag over square
   */
  handleTouchDragOver(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Validate drop using drag & drop system
    if (this.dragDropSystem) {
      const isValid = this.dragDropSystem.validateDrop(this.touchState.selectedPiece, row, col);
      
      if (isValid) {
        square.classList.add('valid-drop-target');
        square.classList.remove('invalid-drop-target');
      } else {
        square.classList.add('invalid-drop-target');
        square.classList.remove('valid-drop-target');
      }
    }
  }
  
  /**
   * Handle touch drop on square
   */
  handleTouchDrop(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Validate drop
    if (this.dragDropSystem && !this.dragDropSystem.validateDrop(this.touchState.selectedPiece, row, col)) {
      this.handleInvalidTouchDrop();
      return;
    }
    
    // Perform valid drop
    this.performMobilePlacement(square, this.touchState.selectedPiece, row, col);
    
    // Haptic feedback
    this.triggerHapticFeedback('drop');
  }
  
  /**
   * Handle invalid touch drop
   */
  handleInvalidTouchDrop() {
    console.log('👆 Invalid touch drop');
    
    // Return piece to original position if it was moved
    if (this.touchState.selectedPosition) {
      const { row, col } = this.touchState.selectedPosition;
      setupBoard[row][col] = this.touchState.selectedPiece;
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('invalid');
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showEnhancedNotification(
        t('invalidMove') || 'Invalid move!', 
        'error', 
        2000
      );
    }
    
    // Redraw board
    drawSetupBoard();
    this.reinitializeMobileHandlers();
  }
  
  /**
   * Perform mobile placement with enhanced feedback
   */
  performMobilePlacement(square, pieceType, row, col) {
    // Place piece on board
    setupBoard[row][col] = pieceType;
    
    // Enhanced success animation
    if (this.enhancedUI) {
      this.enhancedUI.showSuccessAnimation(square);
      this.enhancedUI.createParticleEffect(square, 'success');
      this.enhancedUI.showEnhancedNotification(
        t('piecePlaced') || 'Piece placed!', 
        'success', 
        1500
      );
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('success');
    
    // Redraw board and reinitialize
    drawSetupBoard();
    this.reinitializeMobileHandlers();
    
    console.log('📱 Mobile placement successful:', pieceType, 'at', row, col);
  }
  
  /**
   * Handle invalid mobile placement
   */
  handleInvalidMobilePlacement(square, pieceType, row, col) {
    const errorMessage = this.dragDropSystem ? 
      this.dragDropSystem.getValidationError(pieceType, row, col) :
      (t('invalidMove') || 'Invalid move!');
    
    // Visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(square, 'invalid-placement');
      this.enhancedUI.showEnhancedNotification(errorMessage, 'error', 3000);
    }
    
    // Haptic feedback
    this.triggerHapticFeedback('error');
    
    console.log('📱 Invalid mobile placement:', errorMessage);
  }
  
  /**
   * Initialize pinch gesture handling
   */
  handlePinchStart(e) {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    this.touchState.isPinching = true;
    this.touchState.gestureStartDistance = this.calculateDistance(touch1, touch2);
    
    console.log('👆 Pinch gesture started');
  }
  
  /**
   * Handle pinch gesture movement
   */
  handlePinchMove(e) {
    if (!this.touchState.isPinching || e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    this.touchState.gestureCurrentDistance = this.calculateDistance(touch1, touch2);
    
    const scale = this.touchState.gestureCurrentDistance / this.touchState.gestureStartDistance;
    
    // Handle zoom/scale gestures
    if (Math.abs(scale - 1) > 0.1) {
      this.handlePinchZoom(scale);
    }
  }
  
  /**
   * Handle pinch gesture end
   */
  handlePinchEnd(e) {
    this.touchState.isPinching = false;
    this.touchState.gestureStartDistance = 0;
    this.touchState.gestureCurrentDistance = 0;
    
    console.log('👆 Pinch gesture ended');
  }
  
  /**
   * Handle pinch zoom gesture
   */
  handlePinchZoom(scale) {
    console.log('👆 Pinch zoom:', scale);
    
    // Apply zoom to board if supported
    const modal = document.getElementById('pieceSetupModal');
    if (modal) {
      const currentScale = parseFloat(modal.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || 1);
      const newScale = Math.max(0.5, Math.min(2, currentScale * scale));
      
      modal.style.transform = `scale(${newScale})`;
      modal.style.transformOrigin = 'center center';
      
      // Haptic feedback for zoom
      this.triggerHapticFeedback('selection');
    }
  }
  
  /**
   * Calculate distance between two touch points
   */
  calculateDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Initialize gesture recognition system
   */
  initializeGestureRecognition() {
    console.log('🤲 Initializing gesture recognition...');
    
    // Initialize gesture patterns
    this.gesturePatterns = {
      swipeLeft: { direction: 'left', threshold: this.gestureSettings.swipeThreshold },
      swipeRight: { direction: 'right', threshold: this.gestureSettings.swipeThreshold },
      swipeUp: { direction: 'up', threshold: this.gestureSettings.swipeThreshold },
      swipeDown: { direction: 'down', threshold: this.gestureSettings.swipeThreshold }
    };
    
    console.log('✅ Gesture recognition initialized');
  }
  
  /**
   * Initialize haptic feedback system
   */
  initializeHapticFeedback() {
    if (!this.deviceCapabilities.hasHaptic) {
      console.log('📳 Haptic feedback not supported');
      return;
    }
    
    console.log('📳 Initializing haptic feedback...');
    
    // Test haptic feedback
    this.triggerHapticFeedback('tap');
    
    console.log('✅ Haptic feedback initialized');
  }
  
  /**
   * Trigger haptic feedback with pattern
   */
  triggerHapticFeedback(pattern) {
    if (!this.deviceCapabilities.hasHaptic) return;
    
    const vibrationPattern = this.hapticPatterns[pattern];
    if (vibrationPattern) {
      try {
        navigator.vibrate(vibrationPattern);
        console.log('📳 Haptic feedback:', pattern);
      } catch (error) {
        console.warn('📳 Haptic feedback failed:', error);
      }
    }
  }
  
  /**
   * Adapt UI for mobile devices
   */
  adaptUIForMobile() {
    if (!this.deviceCapabilities.isMobile) {
      console.log('📱 Not a mobile device, skipping mobile UI adaptations');
      return;
    }
    
    console.log('📱 Adapting UI for mobile...');
    
    // Apply mobile-specific CSS
    this.applyMobileCSS();
    
    // Enlarge touch targets
    this.enlargeTouchTargets();
    
    // Setup collapsible palette
    this.setupCollapsiblePalette();
    
    // Add gesture hints
    this.addGestureHints();
    
    // Optimize for mobile viewport
    this.optimizeViewport();
    
    console.log('✅ Mobile UI adaptations applied');
  }
  
  /**
   * Apply mobile-specific CSS
   */
  applyMobileCSS() {
    const style = document.createElement('style');
    style.id = 'mobile-optimization-styles';
    style.textContent = this.getMobileCSS();
    document.head.appendChild(style);
  }
  
  /**
   * Get mobile-specific CSS
   */
  getMobileCSS() {
    return `
      /* Mobile Optimization Styles */
      @media (max-width: 768px) {
        .enhanced-mobile .piece-setup-content {
          padding: 1rem;
          margin: 0.5rem;
          max-height: 95vh;
          overflow-y: auto;
        }
        
        .enhanced-mobile .palette-piece {
          min-width: ${this.uiSettings.minTouchTarget}px;
          min-height: ${this.uiSettings.minTouchTarget}px;
          padding: ${this.uiSettings.touchPadding}px;
          margin: 4px;
          font-size: 1.5rem;
          border-radius: 8px;
          transform: scale(${this.uiSettings.enlargedPieceSize});
        }
        
        .enhanced-mobile .setup-square {
          min-width: ${this.uiSettings.minTouchTarget}px;
          min-height: ${this.uiSettings.minTouchTarget}px;
          border-width: 2px;
          border-radius: 4px;
        }
        
        .enhanced-mobile .setup-piece {
          font-size: 1.8rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .enhanced-mobile .palette-tools button {
          min-width: ${this.uiSettings.minTouchTarget}px;
          min-height: ${this.uiSettings.minTouchTarget}px;
          padding: 12px 16px;
          margin: 4px;
          font-size: 1rem;
          border-radius: 8px;
        }
        
        .mobile-collapsible-palette {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(30, 27, 75, 0.95);
          backdrop-filter: blur(10px);
          border-top: 2px solid var(--enhanced-primary);
          transform: translateY(calc(100% - 60px));
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }
        
        .mobile-collapsible-palette.expanded {
          transform: translateY(0);
        }
        
        .mobile-palette-handle {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--enhanced-primary), var(--enhanced-secondary));
          color: white;
          font-weight: bold;
          cursor: pointer;
          user-select: none;
        }
        
        .mobile-gesture-hint {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          z-index: 1001;
          animation: mobile-hint-fade 3s ease-out forwards;
        }
        
        @keyframes mobile-hint-fade {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .mobile-touch-feedback {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--enhanced-primary) 0%, transparent 70%);
          pointer-events: none;
          animation: mobile-touch-ripple 0.6s ease-out;
        }
        
        @keyframes mobile-touch-ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        
        /* Touch-friendly drag states */
        .enhanced-mobile .valid-drop-target {
          border-width: 3px;
          transform: scale(1.1);
          box-shadow: 0 0 20px var(--enhanced-success);
        }
        
        .enhanced-mobile .invalid-drop-target {
          border-width: 3px;
          transform: scale(1.05);
          box-shadow: 0 0 20px var(--enhanced-error);
        }
        
        .enhanced-mobile .placement-hint {
          border-width: 3px;
          background: rgba(6, 182, 212, 0.2);
        }
        
        .enhanced-mobile .placement-hint::after {
          font-size: 1rem;
          top: 4px;
          right: 4px;
        }
      }
      
      /* Landscape orientation optimizations */
      @media (max-width: 768px) and (orientation: landscape) {
        .enhanced-mobile .piece-setup-content {
          display: flex;
          flex-direction: row;
          max-height: 90vh;
        }
        
        .enhanced-mobile .setup-board-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .enhanced-mobile .palette-container {
          width: 200px;
          overflow-y: auto;
        }
      }
      
      /* High DPI display optimizations */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .enhanced-mobile .palette-piece,
        .enhanced-mobile .setup-piece {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      }
    `;
  }
  
  /**
   * Enlarge touch targets for better accessibility
   */
  enlargeTouchTargets() {
    // Enlarge palette pieces
    document.querySelectorAll('.palette-piece').forEach(piece => {
      piece.style.minWidth = this.uiSettings.minTouchTarget + 'px';
      piece.style.minHeight = this.uiSettings.minTouchTarget + 'px';
      piece.style.padding = this.uiSettings.touchPadding + 'px';
    });
    
    // Enlarge setup squares
    document.querySelectorAll('.setup-square').forEach(square => {
      square.style.minWidth = this.uiSettings.minTouchTarget + 'px';
      square.style.minHeight = this.uiSettings.minTouchTarget + 'px';
    });
    
    // Enlarge buttons
    document.querySelectorAll('.palette-tools button').forEach(button => {
      button.style.minWidth = this.uiSettings.minTouchTarget + 'px';
      button.style.minHeight = this.uiSettings.minTouchTarget + 'px';
      button.style.padding = '12px 16px';
    });
  }
  
  /**
   * Setup collapsible palette for mobile
   */
  setupCollapsiblePalette() {
    if (!this.uiSettings.collapsiblePalette) return;
    
    const paletteContainer = document.querySelector('.palette-container');
    if (!paletteContainer) return;
    
    // Create collapsible wrapper
    const collapsibleWrapper = document.createElement('div');
    collapsibleWrapper.className = 'mobile-collapsible-palette';
    
    // Create handle
    const handle = document.createElement('div');
    handle.className = 'mobile-palette-handle';
    handle.innerHTML = '⬆️ Piece Palette ⬆️';
    
    // Move palette into collapsible wrapper
    paletteContainer.parentNode.insertBefore(collapsibleWrapper, paletteContainer);
    collapsibleWrapper.appendChild(handle);
    collapsibleWrapper.appendChild(paletteContainer);
    
    // Add toggle functionality
    handle.addEventListener('click', () => {
      collapsibleWrapper.classList.toggle('expanded');
      handle.innerHTML = collapsibleWrapper.classList.contains('expanded') ? 
        '⬇️ Hide Palette ⬇️' : '⬆️ Piece Palette ⬆️';
      
      // Haptic feedback
      this.triggerHapticFeedback('tap');
    });
    
    // Auto-collapse after piece selection
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('palette-piece')) {
        setTimeout(() => {
          collapsibleWrapper.classList.remove('expanded');
          handle.innerHTML = '⬆️ Piece Palette ⬆️';
        }, 1000);
      }
    });
  }
  
  /**
   * Add gesture hints for mobile users
   */
  addGestureHints() {
    if (!this.uiSettings.gestureHints) return;
    
    const hints = [
      'Tap to select pieces',
      'Double-tap to quick place',
      'Long press for options',
      'Drag to move pieces',
      'Pinch to zoom'
    ];
    
    hints.forEach((hint, index) => {
      setTimeout(() => {
        this.showGestureHint(hint);
      }, index * 4000);
    });
  }
  
  /**
   * Show gesture hint
   */
  showGestureHint(text) {
    const hint = document.createElement('div');
    hint.className = 'mobile-gesture-hint';
    hint.textContent = text;
    
    document.body.appendChild(hint);
    
    // Remove after animation
    setTimeout(() => {
      if (hint.parentNode) {
        hint.parentNode.removeChild(hint);
      }
    }, 3000);
  }
  
  /**
   * Optimize viewport for mobile
   */
  optimizeViewport() {
    // Ensure viewport meta tag is set correctly
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes';
    
    // Prevent zoom on input focus (iOS)
    if (this.deviceCapabilities.isIOS) {
      document.addEventListener('focusin', (e) => {
        if (e.target.tagName === 'INPUT') {
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        }
      });
      
      document.addEventListener('focusout', (e) => {
        if (e.target.tagName === 'INPUT') {
          viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes';
        }
      });
    }
  }
  
  /**
   * Show mobile placement hints
   */
  showMobilePlacementHints(pieceType) {
    // Clear previous hints
    document.querySelectorAll('.mobile-placement-hint').forEach(hint => {
      hint.classList.remove('mobile-placement-hint');
    });
    
    // Show hints for valid placements
    document.querySelectorAll('.setup-square').forEach(square => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      if (this.dragDropSystem && this.dragDropSystem.validateDrop(pieceType, row, col)) {
        square.classList.add('mobile-placement-hint', 'placement-hint');
      }
    });
  }
  
  /**
   * Find first valid square for piece placement
   */
  findFirstValidSquare(pieceType) {
    const squares = document.querySelectorAll('.setup-square');
    
    for (const square of squares) {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      if (this.dragDropSystem && this.dragDropSystem.validateDrop(pieceType, row, col)) {
        return square;
      }
    }
    
    return null;
  }
  
  /**
   * Show piece information on long press
   */
  showPieceInfo(piece) {
    const pieceType = piece.dataset.piece;
    const pieceName = TASLAR[pieceType] || pieceType;
    
    if (this.enhancedUI) {
      this.enhancedUI.showEnhancedNotification(
        `${pieceName} - ${t('longPressForInfo') || 'Long press for info'}`, 
        'info', 
        3000
      );
    }
  }
  
  /**
   * Show square information on long press
   */
  showSquareInfo(square) {
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const piece = setupBoard[row][col];
    
    let message = `Square ${String.fromCharCode(97 + col)}${5 - row}`;
    if (piece) {
      message += ` - ${TASLAR[piece] || piece}`;
    }
    
    if (this.enhancedUI) {
      this.enhancedUI.showEnhancedNotification(message, 'info', 2000);
    }
  }
  
  /**
   * Show piece options on long press
   */
  showPieceOptions(piece) {
    const pieceType = piece.dataset.piece;
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // For now, just show piece info
    // In future, could show context menu with move/delete options
    this.showPieceInfo(piece);
  }
  
  /**
   * Start palette piece drag
   */
  startPalettePieceDrag(piece) {
    const pieceType = piece.dataset.piece;
    
    // Show drag ghost if drag & drop system is available
    if (this.dragDropSystem) {
      this.dragDropSystem.showDragGhost(piece, 
        this.touchState.currentPosition.x, 
        this.touchState.currentPosition.y
      );
    }
    
    // Store drag information
    this.touchState.selectedPiece = pieceType;
    this.touchState.selectedElement = piece;
    
    console.log('📱 Started palette piece drag:', pieceType);
  }
  
  /**
   * Start board piece drag
   */
  startBoardPieceDrag(piece) {
    const pieceType = piece.dataset.piece;
    const square = piece.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Remove piece from board
    setupBoard[row][col] = null;
    
    // Show drag ghost if drag & drop system is available
    if (this.dragDropSystem) {
      this.dragDropSystem.showDragGhost(piece, 
        this.touchState.currentPosition.x, 
        this.touchState.currentPosition.y
      );
    }
    
    // Store drag information
    this.touchState.selectedPiece = pieceType;
    this.touchState.selectedElement = piece;
    this.touchState.selectedPosition = { row, col };
    
    // Redraw board to show piece removal
    drawSetupBoard();
    this.reinitializeMobileHandlers();
    
    console.log('📱 Started board piece drag:', pieceType, 'from', row, col);
  }
  
  /**
   * Prevent default touch behaviors that interfere with drag & drop
   */
  preventDefaultTouch(e) {
    // Prevent default for piece setup elements
    if (e.target.closest('.piece-setup-content')) {
      // Allow scrolling on the modal content
      if (e.target.closest('.piece-setup-content') && e.touches.length === 1) {
        // Only prevent default for interactive elements
        if (e.target.classList.contains('palette-piece') || 
            e.target.classList.contains('setup-square') || 
            e.target.classList.contains('setup-piece')) {
          e.preventDefault();
        }
      }
    }
  }
  
  /**
   * Reset touch state
   */
  resetTouchState() {
    this.touchState.isActive = false;
    this.touchState.startTime = 0;
    this.touchState.startPosition = { x: 0, y: 0 };
    this.touchState.currentPosition = { x: 0, y: 0 };
    this.touchState.activeTouch = null;
    this.touchState.touchedElement = null;
    this.touchState.isDragging = false;
    this.touchState.isPinching = false;
    this.touchState.selectedPiece = null;
    this.touchState.selectedElement = null;
    this.touchState.selectedPosition = null;
    this.touchState.targetSquare = null;
    this.touchState.targetPosition = null;
    
    // Cancel long press detection
    this.cancelLongPressDetection();
  }
  
  /**
   * Reinitialize mobile handlers after board changes
   */
  reinitializeMobileHandlers() {
    console.log('🔄 Reinitializing mobile handlers...');
    
    // Clean up touch state
    this.resetTouchState();
    
    // Re-apply mobile UI adaptations
    if (this.deviceCapabilities.isMobile) {
      this.enlargeTouchTargets();
    }
  }
  
  /**
   * Initialize mobile-specific features
   */
  initializeMobileFeatures() {
    // Orientation change handling
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Visibility change handling (for battery optimization)
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Add mobile-specific keyboard shortcuts
    this.initializeMobileKeyboardShortcuts();
  }
  
  /**
   * Handle orientation change
   */
  handleOrientationChange() {
    console.log('📱 Orientation changed');
    
    // Update device capabilities
    this.detectDeviceCapabilities();
    
    // Re-apply mobile UI adaptations
    this.adaptUIForMobile();
    
    // Haptic feedback
    this.triggerHapticFeedback('selection');
  }
  
  /**
   * Handle visibility change for battery optimization
   */
  handleVisibilityChange() {
    if (document.hidden) {
      console.log('📱 App hidden, pausing mobile optimizations');
      // Pause any ongoing animations or timers
    } else {
      console.log('📱 App visible, resuming mobile optimizations');
      // Resume optimizations
    }
  }
  
  /**
   * Initialize mobile keyboard shortcuts
   */
  initializeMobileKeyboardShortcuts() {
    // Add support for external keyboards on mobile devices
    document.addEventListener('keydown', (e) => {
      if (!this.deviceCapabilities.isMobile) return;
      
      switch (e.key) {
        case 'Escape':
          // Close collapsible palette
          const palette = document.querySelector('.mobile-collapsible-palette');
          if (palette && palette.classList.contains('expanded')) {
            palette.classList.remove('expanded');
            this.triggerHapticFeedback('tap');
          }
          break;
        
        case ' ':
          // Toggle palette
          const paletteHandle = document.querySelector('.mobile-palette-handle');
          if (paletteHandle) {
            paletteHandle.click();
          }
          break;
      }
    });
  }
  
  /**
   * Get mobile optimization status
   */
  getOptimizationStatus() {
    return {
      isActive: this.deviceCapabilities.isMobile,
      hasTouch: this.deviceCapabilities.hasTouch,
      hasHaptic: this.deviceCapabilities.hasHaptic,
      deviceType: this.enhancedUI?.deviceType || 'unknown',
      touchState: this.touchState.isActive,
      gesturesEnabled: true,
      uiAdaptationsApplied: this.deviceCapabilities.isMobile
    };
  }
  
  /**
   * Cleanup method for removing event listeners and elements
   */
  cleanup() {
    // Remove mobile-specific styles
    const mobileStyles = document.getElementById('mobile-optimization-styles');
    if (mobileStyles) {
      mobileStyles.remove();
    }
    
    // Remove collapsible palette
    const collapsiblePalette = document.querySelector('.mobile-collapsible-palette');
    if (collapsiblePalette) {
      collapsiblePalette.remove();
    }
    
    // Cancel any ongoing timeouts
    this.cancelLongPressDetection();
    
    // Reset touch state
    this.resetTouchState();
    
    console.log('🧹 Mobile Optimization Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileOptimizationManager;
}

// Make available globally
window.MobileOptimizationManager = MobileOptimizationManager;