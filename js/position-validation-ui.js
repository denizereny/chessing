/**
 * Position Validation UI System
 * 
 * Provides visual warnings and error messaging for position validation
 * Integrates with Enhanced Position Validator
 * 
 * Requirements: 3.5, 6.1, 6.2, 6.4, 6.5
 */

class PositionValidationUI {
  constructor() {
    this.validator = null;
    this.currentValidation = null;
    this.visualIndicators = new Map();
    
    // Initialize validator
    if (typeof EnhancedPositionValidator !== 'undefined') {
      this.validator = new EnhancedPositionValidator();
    }
    
    // Animation settings
    this.animationDuration = 300;
    this.pulseInterval = null;
    
    // Initialize UI elements
    this.initializeUI();
  }
  
  /**
   * Initialize UI elements and event listeners
   */
  initializeUI() {
    // Create validation status container if it doesn't exist
    this.ensureValidationContainer();
    
    // Add CSS for validation indicators
    this.addValidationStyles();
  }
  
  /**
   * Ensure validation container exists in the DOM
   */
  ensureValidationContainer() {
    let container = document.getElementById('validationStatusContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'validationStatusContainer';
      container.className = 'validation-status-container';
      
      // Try to find piece setup modal content
      const setupContent = document.querySelector('.piece-setup-content');
      if (setupContent) {
        setupContent.appendChild(container);
      } else {
        // Fallback to body
        document.body.appendChild(container);
      }
    }
    
    // Ensure validation status element exists
    let statusEl = document.getElementById('validationStatus');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'validationStatus';
      statusEl.className = 'validation-status';
      container.appendChild(statusEl);
    }
    
    return container;
  }
  
  /**
   * Add CSS styles for validation indicators
   */
  addValidationStyles() {
    const styleId = 'position-validation-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .validation-status-container {
        margin: 1rem 0;
        padding: 0;
      }
      
      .validation-status {
        padding: 0.8rem;
        border-radius: 8px;
        background: rgba(244, 241, 232, 0.05);
        border: 1px solid rgba(156, 163, 175, 0.3);
        transition: all 0.3s ease;
      }
      
      .validation-status.valid {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
        color: #16a34a;
      }
      
      .validation-status.invalid {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #dc2626;
      }
      
      .validation-status.warning {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.3);
        color: #d97706;
      }
      
      .validation-status.check {
        background: rgba(168, 85, 247, 0.1);
        border-color: rgba(168, 85, 247, 0.3);
        color: #7c3aed;
        animation: checkPulse 2s infinite;
      }
      
      .validation-status.checkmate {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.5);
        color: #dc2626;
        animation: checkmatePulse 1.5s infinite;
      }
      
      @keyframes checkPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes checkmatePulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.02); }
      }
      
      .validation-message {
        font-weight: 500;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .validation-details {
        font-size: 0.9em;
        opacity: 0.9;
        margin-top: 0.5rem;
      }
      
      .validation-error-list,
      .validation-warning-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 0 0;
      }
      
      .validation-error-item,
      .validation-warning-item {
        padding: 0.3rem 0;
        border-bottom: 1px solid rgba(156, 163, 175, 0.1);
      }
      
      .validation-error-item:last-child,
      .validation-warning-item:last-child {
        border-bottom: none;
      }
      
      .board-square-error {
        background: rgba(239, 68, 68, 0.2) !important;
        border: 2px solid #dc2626 !important;
        animation: errorPulse 2s infinite;
      }
      
      .board-square-warning {
        background: rgba(245, 158, 11, 0.2) !important;
        border: 2px solid #d97706 !important;
      }
      
      .board-square-check {
        background: rgba(168, 85, 247, 0.2) !important;
        border: 2px solid #7c3aed !important;
        animation: checkSquarePulse 2s infinite;
      }
      
      @keyframes errorPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      
      @keyframes checkSquarePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      .validation-icon {
        font-size: 1.2em;
        margin-right: 0.3rem;
      }
      
      .validation-toggle {
        cursor: pointer;
        user-select: none;
        font-size: 0.9em;
        color: rgba(156, 163, 175, 0.8);
        margin-top: 0.5rem;
      }
      
      .validation-toggle:hover {
        color: rgba(156, 163, 175, 1);
      }
      
      .validation-details.collapsed {
        display: none;
      }
      
      .position-indicator {
        display: inline-block;
        background: rgba(156, 163, 175, 0.2);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.8em;
        margin-left: 0.5rem;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Validate position and update UI
   * @param {Array} position - Board position to validate
   * @param {Object} options - Validation options
   */
  validateAndUpdateUI(position, options = {}) {
    if (!this.validator) {
      console.warn('Enhanced Position Validator not available');
      return null;
    }
    
    try {
      // Perform validation
      this.currentValidation = this.validator.validatePosition(position);
      
      // Update UI
      this.updateValidationStatus();
      this.updateBoardVisualIndicators(position);
      
      // Trigger callbacks if provided
      if (options.onValidation) {
        options.onValidation(this.currentValidation);
      }
      
      return this.currentValidation;
      
    } catch (error) {
      console.error('Error during position validation:', error);
      this.showValidationError('Validation system error');
      return null;
    }
  }
  
  /**
   * Update validation status display
   */
  updateValidationStatus() {
    const statusEl = document.getElementById('validationStatus');
    if (!statusEl || !this.currentValidation) return;
    
    const summary = this.validator.getValidationSummary(this.currentValidation);
    
    // Clear previous classes
    statusEl.className = 'validation-status';
    
    // Add status class
    statusEl.classList.add(summary.status);
    
    // Create status content
    const content = this.createStatusContent(summary);
    statusEl.innerHTML = content;
    
    // Add toggle functionality for details
    this.addToggleFunctionality(statusEl);
  }
  
  /**
   * Create status content HTML
   * @param {Object} summary - Validation summary
   * @returns {string} HTML content
   */
  createStatusContent(summary) {
    const icon = this.getStatusIcon(summary.status);
    
    let html = `
      <div class="validation-message">
        <span class="validation-icon">${icon}</span>
        <span>${summary.message}</span>
      </div>
    `;
    
    // Add details if there are errors or warnings
    if (this.currentValidation.errors.length > 0 || this.currentValidation.warnings.length > 0) {
      html += `<div class="validation-toggle" onclick="this.nextElementSibling.classList.toggle('collapsed')">
        ▼ Show Details
      </div>`;
      
      html += `<div class="validation-details">`;
      
      // Add errors
      if (this.currentValidation.errors.length > 0) {
        html += `<ul class="validation-error-list">`;
        for (const error of this.currentValidation.errors) {
          html += `<li class="validation-error-item">
            ${this.validator.formatErrorMessage(error)}
            ${this.getPositionIndicator(error)}
          </li>`;
        }
        html += `</ul>`;
      }
      
      // Add warnings
      if (this.currentValidation.warnings.length > 0) {
        html += `<ul class="validation-warning-list">`;
        for (const warning of this.currentValidation.warnings) {
          html += `<li class="validation-warning-item">
            ${this.validator.formatWarningMessage(warning)}
            ${this.getPositionIndicator(warning)}
          </li>`;
        }
        html += `</ul>`;
      }
      
      html += `</div>`;
    }
    
    return html;
  }
  
  /**
   * Get status icon based on validation status
   * @param {string} status - Validation status
   * @returns {string} Icon character
   */
  getStatusIcon(status) {
    const icons = {
      valid: '✅',
      invalid: '❌',
      warning: '⚠️',
      check: '👑',
      checkmate: '♔',
      stalemate: '🤝'
    };
    
    return icons[status] || '❓';
  }
  
  /**
   * Get position indicator for error/warning
   * @param {Object} item - Error or warning object
   * @returns {string} Position indicator HTML
   */
  getPositionIndicator(item) {
    if (item.position) {
      const pos = item.position;
      const notation = this.getSquareNotation(pos.row, pos.col);
      return `<span class="position-indicator">${notation}</span>`;
    } else if (item.positions && item.positions.length > 0) {
      const notations = item.positions.map(pos => this.getSquareNotation(pos.row, pos.col));
      return `<span class="position-indicator">${notations.join(', ')}</span>`;
    }
    return '';
  }
  
  /**
   * Convert row/col to algebraic notation
   * @param {number} row - Row index (0-4)
   * @param {number} col - Column index (0-3)
   * @returns {string} Algebraic notation (e.g., "a1", "d5")
   */
  getSquareNotation(row, col) {
    const files = ['a', 'b', 'c', 'd'];
    const ranks = ['5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
  }
  
  /**
   * Update visual indicators on the board
   * @param {Array} position - Board position
   */
  updateBoardVisualIndicators(position) {
    // Clear previous indicators
    this.clearBoardIndicators();
    
    if (!this.currentValidation) return;
    
    // Add error indicators
    for (const error of this.currentValidation.errors) {
      this.addBoardIndicator(error, 'error');
    }
    
    // Add warning indicators
    for (const warning of this.currentValidation.warnings) {
      this.addBoardIndicator(warning, 'warning');
    }
    
    // Add check indicators
    if (this.currentValidation.checkStatus.whiteInCheck && this.currentValidation.kingPositions.white) {
      this.addKingCheckIndicator(this.currentValidation.kingPositions.white);
    }
    
    if (this.currentValidation.checkStatus.blackInCheck && this.currentValidation.kingPositions.black) {
      this.addKingCheckIndicator(this.currentValidation.kingPositions.black);
    }
  }
  
  /**
   * Clear all board visual indicators
   */
  clearBoardIndicators() {
    // Clear setup board indicators
    const setupSquares = document.querySelectorAll('.setup-square');
    setupSquares.forEach(square => {
      square.classList.remove('board-square-error', 'board-square-warning', 'board-square-check');
    });
    
    // Clear main game board indicators
    const gameSquares = document.querySelectorAll('.square');
    gameSquares.forEach(square => {
      square.classList.remove('board-square-error', 'board-square-warning', 'board-square-check');
    });
    
    this.visualIndicators.clear();
  }
  
  /**
   * Add visual indicator to board square
   * @param {Object} item - Error or warning object
   * @param {string} type - Indicator type ('error', 'warning')
   */
  addBoardIndicator(item, type) {
    const positions = item.positions || (item.position ? [item.position] : []);
    
    for (const pos of positions) {
      const square = this.findBoardSquare(pos.row, pos.col);
      if (square) {
        const className = `board-square-${type}`;
        square.classList.add(className);
        
        // Store indicator for cleanup
        const key = `${pos.row}-${pos.col}`;
        this.visualIndicators.set(key, { type, element: square });
      }
    }
  }
  
  /**
   * Add check indicator to king square
   * @param {Object} kingPos - King position {row, col}
   */
  addKingCheckIndicator(kingPos) {
    const square = this.findBoardSquare(kingPos.row, kingPos.col);
    if (square) {
      square.classList.add('board-square-check');
      
      // Store indicator for cleanup
      const key = `${kingPos.row}-${kingPos.col}`;
      this.visualIndicators.set(key, { type: 'check', element: square });
    }
  }
  
  /**
   * Find board square element by position
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {Element|null} Square element
   */
  findBoardSquare(row, col) {
    // Try setup board first
    let square = document.querySelector(`.setup-square[data-row="${row}"][data-col="${col}"]`);
    
    // If not found, try main game board (calculate index)
    if (!square) {
      const index = row * 4 + col;
      const squares = document.querySelectorAll('.square');
      if (squares[index]) {
        square = squares[index];
      }
    }
    
    return square;
  }
  
  /**
   * Add toggle functionality to validation details
   * @param {Element} statusEl - Status element
   */
  addToggleFunctionality(statusEl) {
    const toggle = statusEl.querySelector('.validation-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const details = toggle.nextElementSibling;
        if (details) {
          details.classList.toggle('collapsed');
          toggle.textContent = details.classList.contains('collapsed') ? 
            '▶ Show Details' : '▼ Hide Details';
        }
      });
    }
  }
  
  /**
   * Show validation error message
   * @param {string} message - Error message
   */
  showValidationError(message) {
    const statusEl = document.getElementById('validationStatus');
    if (statusEl) {
      statusEl.className = 'validation-status invalid';
      statusEl.innerHTML = `
        <div class="validation-message">
          <span class="validation-icon">❌</span>
          <span>${message}</span>
        </div>
      `;
    }
  }
  
  /**
   * Get current validation result
   * @returns {Object|null} Current validation result
   */
  getCurrentValidation() {
    return this.currentValidation;
  }
  
  /**
   * Check if current position is valid
   * @returns {boolean} True if position is valid
   */
  isCurrentPositionValid() {
    return this.currentValidation ? this.currentValidation.valid : false;
  }
  
  /**
   * Get validation summary for external use
   * @returns {Object|null} Validation summary
   */
  getValidationSummary() {
    if (!this.currentValidation || !this.validator) return null;
    return this.validator.getValidationSummary(this.currentValidation);
  }
  
  /**
   * Destroy validation UI and clean up
   */
  destroy() {
    this.clearBoardIndicators();
    
    // Clear pulse interval
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    
    // Remove validation container
    const container = document.getElementById('validationStatusContainer');
    if (container) {
      container.remove();
    }
    
    // Remove styles
    const styles = document.getElementById('position-validation-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionValidationUI;
} else if (typeof window !== 'undefined') {
  window.PositionValidationUI = PositionValidationUI;
}