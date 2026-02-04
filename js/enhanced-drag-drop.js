/**
 * Enhanced Drag & Drop System for 4x5 Chess Piece Setup
 * Provides advanced visual feedback, validation, and smooth animations
 * 
 * Requirements: 1.3, 1.4
 * - Görsel geri bildirim mekanizması ekle
 * - Geçersiz sürükleme işlemlerini reddet
 * - Smooth animasyonlar ekle
 */

class EnhancedDragDropSystem {
  constructor(enhancedUI) {
    this.enhancedUI = enhancedUI;
    this.dragState = {
      isDragging: false,
      draggedPiece: null,
      draggedFrom: null,
      draggedElement: null,
      validDropTargets: [],
      invalidDropTargets: []
    };
    
    // Drag validation rules
    this.validationRules = {
      maxPiecesPerType: {
        'K': 1, 'k': 1, // Only one king per side
        'Q': 1, 'q': 1, // Only one queen per side
        'R': 2, 'r': 2, // Max 2 rooks per side
        'B': 2, 'b': 2, // Max 2 bishops per side
        'N': 2, 'n': 2, // Max 2 knights per side
        'P': 4, 'p': 4  // Max 4 pawns per side
      },
      invalidPawnRows: {
        'P': [0], // White pawns can't be on first rank
        'p': [4]  // Black pawns can't be on last rank
      }
    };
    
    // Animation settings
    this.animationSettings = {
      dragStart: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      dragEnd: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      invalidDrop: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
      validDrop: { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
    };
    
    // Visual feedback elements
    this.feedbackElements = {
      dragGhost: null,
      dropIndicators: [],
      validationOverlay: null
    };
    
    this.initialize();
  }
  
  /**
   * Initialize the enhanced drag & drop system
   */
  initialize() {
    console.log('🎯 Initializing Enhanced Drag & Drop System...');
    
    this.createFeedbackElements();
    this.setupEventListeners();
    this.initializeDragDropHandlers();
    
    console.log('✨ Enhanced Drag & Drop System initialized successfully');
  }
  
  /**
   * Create visual feedback elements
   */
  createFeedbackElements() {
    // Create drag ghost element
    this.feedbackElements.dragGhost = document.createElement('div');
    this.feedbackElements.dragGhost.className = 'enhanced-drag-ghost';
    this.feedbackElements.dragGhost.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 10000;
      opacity: 0;
      transform: scale(1.2);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(this.feedbackElements.dragGhost);
    
    // Create validation overlay
    this.feedbackElements.validationOverlay = document.createElement('div');
    this.feedbackElements.validationOverlay.className = 'enhanced-validation-overlay';
    this.feedbackElements.validationOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: bold;
      z-index: 10001;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    document.body.appendChild(this.feedbackElements.validationOverlay);
  }
  
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Global mouse move for drag ghost
    document.addEventListener('mousemove', (e) => {
      if (this.dragState.isDragging && this.feedbackElements.dragGhost) {
        this.updateDragGhost(e.clientX, e.clientY);
      }
    });
    
    // Global drag end cleanup
    document.addEventListener('dragend', () => {
      this.cleanupDragState();
    });
    
    // Escape key to cancel drag
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dragState.isDragging) {
        this.cancelDrag();
      }
    });
  }
  
  /**
   * Initialize drag & drop handlers for piece setup
   */
  initializeDragDropHandlers() {
    this.initializePalettePieces();
    this.initializeSetupSquares();
    this.initializeBoardPieces();
    this.initializeTrashZone();
  }
  
  /**
   * Initialize palette pieces drag functionality
   */
  initializePalettePieces() {
    document.querySelectorAll('.palette-piece').forEach(piece => {
      // Enhanced drag start
      piece.addEventListener('dragstart', (e) => {
        this.handlePaletteDragStart(e);
      });
      
      // Enhanced click selection
      piece.addEventListener('click', (e) => {
        this.handlePaletteClick(e);
      });
      
      // Hover effects
      piece.addEventListener('mouseenter', (e) => {
        if (!this.dragState.isDragging) {
          this.showPiecePreview(e.target);
        }
      });
      
      piece.addEventListener('mouseleave', (e) => {
        this.hidePiecePreview(e.target);
      });
    });
  }
  
  /**
   * Initialize setup board squares
   */
  initializeSetupSquares() {
    document.querySelectorAll('.setup-square').forEach(square => {
      // Enhanced drag over
      square.addEventListener('dragover', (e) => {
        this.handleSquareDragOver(e);
      });
      
      // Enhanced drag enter
      square.addEventListener('dragenter', (e) => {
        this.handleSquareDragEnter(e);
      });
      
      // Enhanced drag leave
      square.addEventListener('dragleave', (e) => {
        this.handleSquareDragLeave(e);
      });
      
      // Enhanced drop
      square.addEventListener('drop', (e) => {
        this.handleSquareDrop(e);
      });
      
      // Enhanced click placement
      square.addEventListener('click', (e) => {
        this.handleSquareClick(e);
      });
    });
  }
  
  /**
   * Initialize board pieces drag functionality
   */
  initializeBoardPieces() {
    document.querySelectorAll('.setup-piece').forEach(piece => {
      piece.addEventListener('dragstart', (e) => {
        this.handleBoardPieceDragStart(e);
      });
    });
  }
  
  /**
   * Initialize trash zone functionality
   */
  initializeTrashZone() {
    const trashZone = document.getElementById('trashZone');
    if (trashZone) {
      trashZone.addEventListener('dragover', (e) => {
        this.handleTrashDragOver(e);
      });
      
      trashZone.addEventListener('dragleave', (e) => {
        this.handleTrashDragLeave(e);
      });
      
      trashZone.addEventListener('drop', (e) => {
        this.handleTrashDrop(e);
      });
    }
  }
  
  /**
   * Handle palette piece drag start
   */
  handlePaletteDragStart(e) {
    const pieceType = e.target.dataset.piece;
    
    this.dragState.isDragging = true;
    this.dragState.draggedPiece = pieceType;
    this.dragState.draggedFrom = 'palette';
    this.dragState.draggedElement = e.target;
    
    // Set drag data
    e.dataTransfer.setData('text/plain', pieceType);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create custom drag image
    this.createDragImage(e);
    
    // Show drag ghost
    this.showDragGhost(e.target, e.clientX, e.clientY);
    
    // Highlight valid drop targets
    this.highlightValidDropTargets(pieceType);
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showDragFeedback(e.target, 'start');
      this.enhancedUI.createRippleEffect(e.target, 'primary');
    }
    
    console.log(`🎯 Started dragging palette piece: ${pieceType}`);
  }
  
  /**
   * Handle palette piece click selection
   */
  handlePaletteClick(e) {
    // Remove previous selection
    document.querySelectorAll('.palette-piece.selected').forEach(p => {
      p.classList.remove('selected');
      if (this.enhancedUI) {
        this.enhancedUI.animateElement(p, 'deselect');
      }
    });
    
    // Select current piece
    e.target.classList.add('selected');
    selectedPalettePiece = e.target.dataset.piece;
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showSelectionFeedback(e.target);
      this.enhancedUI.animateElement(e.target, 'select');
    }
    
    // Show placement hints
    this.showPlacementHints(selectedPalettePiece);
    
    console.log(`🎯 Selected palette piece: ${selectedPalettePiece}`);
  }
  
  /**
   * Handle square drag over
   */
  handleSquareDragOver(e) {
    e.preventDefault();
    
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Validate drop
    const isValid = this.validateDrop(this.dragState.draggedPiece, row, col);
    
    if (isValid) {
      e.dataTransfer.dropEffect = 'copy';
      square.classList.add('valid-drop-target');
      square.classList.remove('invalid-drop-target');
      
      // Enhanced visual feedback
      if (this.enhancedUI) {
        this.enhancedUI.showDragFeedback(square, 'over');
      }
    } else {
      e.dataTransfer.dropEffect = 'none';
      square.classList.add('invalid-drop-target');
      square.classList.remove('valid-drop-target');
      
      // Show validation error
      this.showValidationError(this.getValidationError(this.dragState.draggedPiece, row, col));
    }
  }
  
  /**
   * Handle square drag enter
   */
  handleSquareDragEnter(e) {
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Add hover effect for valid drops
    if (this.validateDrop(this.dragState.draggedPiece, row, col)) {
      square.classList.add('drag-hover');
      
      // Show piece preview
      this.showDropPreview(square, this.dragState.draggedPiece);
    }
  }
  
  /**
   * Handle square drag leave
   */
  handleSquareDragLeave(e) {
    const square = e.target;
    square.classList.remove('valid-drop-target', 'invalid-drop-target', 'drag-hover');
    
    // Hide validation error
    this.hideValidationError();
    
    // Hide drop preview
    this.hideDropPreview(square);
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showDragFeedback(square, 'leave');
    }
  }
  
  /**
   * Handle square drop
   */
  handleSquareDrop(e) {
    e.preventDefault();
    
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    const pieceType = e.dataTransfer.getData('text/plain');
    
    // Clean up visual states
    square.classList.remove('valid-drop-target', 'invalid-drop-target', 'drag-hover');
    this.hideValidationError();
    this.hideDropPreview(square);
    
    // Validate drop
    if (!this.validateDrop(pieceType, row, col)) {
      this.handleInvalidDrop(square, pieceType, row, col);
      return;
    }
    
    // Perform valid drop
    this.performValidDrop(square, pieceType, row, col);
  }
  
  /**
   * Handle square click placement
   */
  handleSquareClick(e) {
    if (!selectedPalettePiece) return;
    
    const square = e.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    // Validate placement
    if (!this.validateDrop(selectedPalettePiece, row, col)) {
      this.handleInvalidPlacement(square, selectedPalettePiece, row, col);
      return;
    }
    
    // Perform valid placement
    this.performValidPlacement(square, selectedPalettePiece, row, col);
  }
  
  /**
   * Handle board piece drag start
   */
  handleBoardPieceDragStart(e) {
    const pieceType = e.target.dataset.piece;
    const square = e.target.parentElement;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);
    
    this.dragState.isDragging = true;
    this.dragState.draggedPiece = pieceType;
    this.dragState.draggedFrom = { row, col };
    this.dragState.draggedElement = e.target;
    
    // Set drag data
    e.dataTransfer.setData('text/plain', pieceType);
    e.dataTransfer.effectAllowed = 'move';
    
    // Remove piece from current position
    setupBoard[row][col] = null;
    
    // Create custom drag image
    this.createDragImage(e);
    
    // Show drag ghost
    this.showDragGhost(e.target, e.clientX, e.clientY);
    
    // Highlight valid drop targets
    this.highlightValidDropTargets(pieceType);
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.showDragFeedback(e.target, 'start');
      this.enhancedUI.animateElement(square, 'piece-removed');
    }
    
    console.log(`🎯 Started moving board piece: ${pieceType} from ${row},${col}`);
  }
  
  /**
   * Handle trash zone drag over
   */
  handleTrashDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const trashZone = e.target.closest('.trash-zone') || e.target;
    trashZone.classList.add('drag-over', 'delete-ready');
    
    // Enhanced visual feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(trashZone, 'trash-ready');
    }
  }
  
  /**
   * Handle trash zone drag leave
   */
  handleTrashDragLeave(e) {
    const trashZone = e.target.closest('.trash-zone') || e.target;
    trashZone.classList.remove('drag-over', 'delete-ready');
  }
  
  /**
   * Handle trash zone drop
   */
  handleTrashDrop(e) {
    e.preventDefault();
    
    const trashZone = e.target.closest('.trash-zone') || e.target;
    trashZone.classList.remove('drag-over', 'delete-ready');
    
    // Enhanced delete animation
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(trashZone, 'delete-success');
      this.enhancedUI.createParticleEffect(trashZone, 'delete');
      this.enhancedUI.showEnhancedNotification(
        t('pieceDeleted') || 'Piece deleted!', 
        'warning', 
        2000
      );
    }
    
    // Redraw board and reinitialize
    drawSetupBoard();
    this.initializeDragDropHandlers();
    
    console.log('🗑️ Piece deleted via enhanced drag & drop');
  }
  
  /**
   * Validate if a piece can be dropped at a specific position
   */
  validateDrop(pieceType, row, col) {
    if (!pieceType || row < 0 || row >= 5 || col < 0 || col >= 4) {
      return false;
    }
    
    // Check if square is already occupied
    if (setupBoard[row][col] !== null) {
      return false;
    }
    
    // Check pawn placement rules
    if (this.validationRules.invalidPawnRows[pieceType]) {
      if (this.validationRules.invalidPawnRows[pieceType].includes(row)) {
        return false;
      }
    }
    
    // Check piece count limits
    const currentCount = this.countPieceType(pieceType);
    const maxAllowed = this.validationRules.maxPiecesPerType[pieceType];
    
    if (maxAllowed && currentCount >= maxAllowed) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get validation error message
   */
  getValidationError(pieceType, row, col) {
    if (setupBoard[row][col] !== null) {
      return t('squareOccupied') || 'Square is already occupied!';
    }
    
    if (this.validationRules.invalidPawnRows[pieceType]?.includes(row)) {
      return t('invalidPawnPosition') || 'Pawns cannot be placed on this rank!';
    }
    
    const currentCount = this.countPieceType(pieceType);
    const maxAllowed = this.validationRules.maxPiecesPerType[pieceType];
    
    if (maxAllowed && currentCount >= maxAllowed) {
      return t('tooManyPieces') || `Too many ${pieceType} pieces!`;
    }
    
    return t('invalidMove') || 'Invalid move!';
  }
  
  /**
   * Count pieces of a specific type on the board
   */
  countPieceType(pieceType) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        if (setupBoard[i][j] === pieceType) {
          count++;
        }
      }
    }
    return count;
  }
  
  /**
   * Handle invalid drop with animation
   */
  handleInvalidDrop(square, pieceType, row, col) {
    const errorMessage = this.getValidationError(pieceType, row, col);
    
    // Show validation error with animation
    this.showValidationError(errorMessage);
    
    // Animate invalid drop
    this.animateInvalidDrop(square);
    
    // Enhanced feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(square, 'invalid-drop');
      this.enhancedUI.showEnhancedNotification(errorMessage, 'error', 3000);
    }
    
    // Return piece to original position if it was moved
    if (this.dragState.draggedFrom && typeof this.dragState.draggedFrom === 'object') {
      const { row: fromRow, col: fromCol } = this.dragState.draggedFrom;
      setupBoard[fromRow][fromCol] = pieceType;
    }
    
    console.log(`❌ Invalid drop: ${errorMessage}`);
  }
  
  /**
   * Handle invalid placement with animation
   */
  handleInvalidPlacement(square, pieceType, row, col) {
    const errorMessage = this.getValidationError(pieceType, row, col);
    
    // Show validation error
    this.showValidationError(errorMessage);
    
    // Animate invalid placement
    this.animateInvalidDrop(square);
    
    // Enhanced feedback
    if (this.enhancedUI) {
      this.enhancedUI.animateElement(square, 'invalid-placement');
      this.enhancedUI.showEnhancedNotification(errorMessage, 'error', 3000);
    }
    
    console.log(`❌ Invalid placement: ${errorMessage}`);
  }
  
  /**
   * Perform valid drop with animation
   */
  performValidDrop(square, pieceType, row, col) {
    // Place piece on board
    setupBoard[row][col] = pieceType;
    
    // Enhanced success animation
    if (this.enhancedUI) {
      this.enhancedUI.showSuccessAnimation(square);
      this.enhancedUI.createParticleEffect(square, 'success');
      this.enhancedUI.showEnhancedNotification(
        t('piecePlaced') || 'Piece placed!', 
        'success', 
        2000
      );
    }
    
    // Redraw board and reinitialize
    drawSetupBoard();
    this.initializeDragDropHandlers();
    
    console.log(`✅ Valid drop: ${pieceType} at ${row},${col}`);
  }
  
  /**
   * Perform valid placement with animation
   */
  performValidPlacement(square, pieceType, row, col) {
    // Place piece on board
    setupBoard[row][col] = pieceType;
    
    // Enhanced success animation
    if (this.enhancedUI) {
      this.enhancedUI.showSuccessAnimation(square);
      this.enhancedUI.createRippleEffect(square, 'success');
      this.enhancedUI.showEnhancedNotification(
        t('piecePlaced') || 'Piece placed!', 
        'success', 
        2000
      );
    }
    
    // Redraw board and reinitialize
    drawSetupBoard();
    this.initializeDragDropHandlers();
    
    console.log(`✅ Valid placement: ${pieceType} at ${row},${col}`);
  }
  
  /**
   * Create custom drag image
   */
  createDragImage(e) {
    const dragImage = e.target.cloneNode(true);
    dragImage.style.cssText = `
      transform: scale(1.2) rotate(5deg);
      opacity: 0.8;
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
    `;
    
    // Set custom drag image
    e.dataTransfer.setDragImage(dragImage, 25, 25);
  }
  
  /**
   * Show drag ghost element
   */
  showDragGhost(element, x, y) {
    const ghost = this.feedbackElements.dragGhost;
    ghost.textContent = element.textContent;
    ghost.style.cssText += `
      left: ${x - 25}px;
      top: ${y - 25}px;
      opacity: 0.9;
      background: linear-gradient(135deg, var(--enhanced-primary), var(--enhanced-secondary));
      color: white;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    `;
  }
  
  /**
   * Update drag ghost position
   */
  updateDragGhost(x, y) {
    const ghost = this.feedbackElements.dragGhost;
    ghost.style.left = `${x - 25}px`;
    ghost.style.top = `${y - 25}px`;
  }
  
  /**
   * Hide drag ghost
   */
  hideDragGhost() {
    this.feedbackElements.dragGhost.style.opacity = '0';
  }
  
  /**
   * Highlight valid drop targets
   */
  highlightValidDropTargets(pieceType) {
    document.querySelectorAll('.setup-square').forEach(square => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      if (this.validateDrop(pieceType, row, col)) {
        square.classList.add('potential-drop-target');
        this.dragState.validDropTargets.push(square);
      } else {
        square.classList.add('invalid-potential-target');
        this.dragState.invalidDropTargets.push(square);
      }
    });
  }
  
  /**
   * Show placement hints for selected piece
   */
  showPlacementHints(pieceType) {
    // Clear previous hints
    document.querySelectorAll('.placement-hint').forEach(hint => {
      hint.classList.remove('placement-hint');
    });
    
    // Show hints for valid placements
    document.querySelectorAll('.setup-square').forEach(square => {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      if (this.validateDrop(pieceType, row, col)) {
        square.classList.add('placement-hint');
      }
    });
  }
  
  /**
   * Show piece preview on hover
   */
  showPiecePreview(element) {
    element.style.transform = 'translateY(-2px) scale(1.05)';
    element.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
  }
  
  /**
   * Hide piece preview
   */
  hidePiecePreview(element) {
    element.style.transform = '';
    element.style.boxShadow = '';
  }
  
  /**
   * Show drop preview
   */
  showDropPreview(square, pieceType) {
    const preview = document.createElement('div');
    preview.className = 'drop-preview';
    preview.textContent = TASLAR[pieceType] || pieceType;
    preview.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.6;
      font-size: 1.2rem;
      pointer-events: none;
      color: var(--enhanced-primary);
      text-shadow: 0 0 10px var(--enhanced-primary);
    `;
    
    square.style.position = 'relative';
    square.appendChild(preview);
  }
  
  /**
   * Hide drop preview
   */
  hideDropPreview(square) {
    const preview = square.querySelector('.drop-preview');
    if (preview) {
      preview.remove();
    }
  }
  
  /**
   * Show validation error
   */
  showValidationError(message) {
    const overlay = this.feedbackElements.validationOverlay;
    overlay.textContent = message;
    overlay.style.opacity = '1';
    overlay.style.transform = 'translate(-50%, -50%) scale(1)';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideValidationError();
    }, 3000);
  }
  
  /**
   * Hide validation error
   */
  hideValidationError() {
    const overlay = this.feedbackElements.validationOverlay;
    overlay.style.opacity = '0';
    overlay.style.transform = 'translate(-50%, -50%) scale(0.8)';
  }
  
  /**
   * Animate invalid drop
   */
  animateInvalidDrop(square) {
    square.animate([
      { transform: 'scale(1)', backgroundColor: 'transparent' },
      { transform: 'scale(1.1)', backgroundColor: 'rgba(239, 68, 68, 0.3)' },
      { transform: 'scale(1)', backgroundColor: 'transparent' }
    ], {
      duration: this.animationSettings.invalidDrop.duration,
      easing: this.animationSettings.invalidDrop.easing
    });
  }
  
  /**
   * Cancel current drag operation
   */
  cancelDrag() {
    if (!this.dragState.isDragging) return;
    
    // Return piece to original position if it was moved
    if (this.dragState.draggedFrom && typeof this.dragState.draggedFrom === 'object') {
      const { row, col } = this.dragState.draggedFrom;
      setupBoard[row][col] = this.dragState.draggedPiece;
    }
    
    // Show cancellation feedback
    if (this.enhancedUI) {
      this.enhancedUI.showEnhancedNotification(
        t('dragCancelled') || 'Drag operation cancelled', 
        'info', 
        2000
      );
    }
    
    this.cleanupDragState();
    drawSetupBoard();
    this.initializeDragDropHandlers();
    
    console.log('🚫 Drag operation cancelled');
  }
  
  /**
   * Clean up drag state and visual elements
   */
  cleanupDragState() {
    // Reset drag state
    this.dragState.isDragging = false;
    this.dragState.draggedPiece = null;
    this.dragState.draggedFrom = null;
    this.dragState.draggedElement = null;
    
    // Clean up visual feedback
    this.hideDragGhost();
    this.hideValidationError();
    
    // Remove all drag-related classes
    document.querySelectorAll('.valid-drop-target, .invalid-drop-target, .drag-hover, .potential-drop-target, .invalid-potential-target, .placement-hint').forEach(element => {
      element.classList.remove(
        'valid-drop-target', 
        'invalid-drop-target', 
        'drag-hover', 
        'potential-drop-target', 
        'invalid-potential-target',
        'placement-hint'
      );
    });
    
    // Clear drop previews
    document.querySelectorAll('.drop-preview').forEach(preview => {
      preview.remove();
    });
    
    // Clear target arrays
    this.dragState.validDropTargets = [];
    this.dragState.invalidDropTargets = [];
  }
  
  /**
   * Reinitialize drag & drop after board changes
   */
  reinitialize() {
    console.log('🔄 Reinitializing Enhanced Drag & Drop System...');
    this.cleanupDragState();
    this.initializeDragDropHandlers();
  }
  
  /**
   * Cleanup method for removing elements and event listeners
   */
  cleanup() {
    // Remove feedback elements
    if (this.feedbackElements.dragGhost) {
      this.feedbackElements.dragGhost.remove();
    }
    if (this.feedbackElements.validationOverlay) {
      this.feedbackElements.validationOverlay.remove();
    }
    
    // Clean up drag state
    this.cleanupDragState();
    
    console.log('🧹 Enhanced Drag & Drop System cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedDragDropSystem;
}

// Make available globally
window.EnhancedDragDropSystem = EnhancedDragDropSystem;