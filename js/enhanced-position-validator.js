/**
 * Enhanced Position Validator for 4x5 Chess
 * 
 * Provides comprehensive position validation including:
 * - Advanced king control (exactly one king per side)
 * - Pawn position validation (not on first/last ranks)
 * - Check and mate detection algorithms
 * - Error messaging system with visual warnings
 * 
 * Requirements: 3.5, 6.1, 6.2, 6.4, 6.5
 */

class EnhancedPositionValidator {
  constructor() {
    this.ROWS = 5;
    this.COLS = 4;
    
    // Error types for categorization
    this.ERROR_TYPES = {
      MISSING_KING: 'missing_king',
      MULTIPLE_KINGS: 'multiple_kings',
      INVALID_PAWN_POSITION: 'invalid_pawn_position',
      ILLEGAL_POSITION: 'illegal_position',
      TOO_MANY_PIECES: 'too_many_pieces',
      KINGS_ADJACENT: 'kings_adjacent',
      CHECK_VIOLATION: 'check_violation'
    };
    
    // Warning types
    this.WARNING_TYPES = {
      UNUSUAL_MATERIAL: 'unusual_material',
      EXPOSED_KING: 'exposed_king',
      WEAK_PAWN_STRUCTURE: 'weak_pawn_structure'
    };
    
    // Maximum piece counts for 4x5 board
    this.MAX_PIECES = {
      'p': 4, 'n': 2, 'b': 2, 'r': 2, 'q': 1, 'k': 1,
      'P': 4, 'N': 2, 'B': 2, 'R': 2, 'Q': 1, 'K': 1
    };
    
    // Initialize advanced position analyzer for check detection
    this.analyzer = null;
    if (typeof AdvancedPositionAnalyzer !== 'undefined') {
      this.analyzer = new AdvancedPositionAnalyzer();
    }
  }
  
  /**
   * Comprehensive position validation
   * @param {Array} position - 5x4 board array
   * @returns {Object} Validation result with errors, warnings, and status
   */
  validatePosition(position) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      checkStatus: {
        whiteInCheck: false,
        blackInCheck: false,
        checkmate: false,
        stalemate: false
      },
      kingPositions: {
        white: null,
        black: null
      },
      timestamp: Date.now()
    };
    
    // Basic structure validation
    if (!this.validateBoardStructure(position, result)) {
      return result;
    }
    
    // Advanced king control validation
    this.validateKingControl(position, result);
    
    // Pawn position validation
    this.validatePawnPositions(position, result);
    
    // Piece count validation
    this.validatePieceCounts(position, result);
    
    // Kings adjacency check
    this.validateKingsAdjacency(position, result);
    
    // Check and mate detection (only if basic validation passes)
    if (result.valid) {
      this.detectCheckAndMate(position, result);
    }
    
    // Generate warnings for unusual but legal positions
    this.generateWarnings(position, result);
    
    return result;
  }
  
  /**
   * Validate basic board structure
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   * @returns {boolean} True if structure is valid
   */
  validateBoardStructure(position, result) {
    if (!Array.isArray(position) || position.length !== this.ROWS) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.ILLEGAL_POSITION,
        message: `Board must be ${this.ROWS}x${this.COLS} array`,
        severity: 'critical'
      });
      return false;
    }
    
    for (let i = 0; i < this.ROWS; i++) {
      if (!Array.isArray(position[i]) || position[i].length !== this.COLS) {
        result.valid = false;
        result.errors.push({
          type: this.ERROR_TYPES.ILLEGAL_POSITION,
          message: `Row ${i} must have exactly ${this.COLS} columns`,
          severity: 'critical'
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Advanced king control validation - exactly one king per side
   * Requirements: 6.1
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  validateKingControl(position, result) {
    let whiteKings = [];
    let blackKings = [];
    
    // Find all kings
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece === 'K') {
          whiteKings.push({ row, col });
        } else if (piece === 'k') {
          blackKings.push({ row, col });
        }
      }
    }
    
    // Validate white king count
    if (whiteKings.length === 0) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.MISSING_KING,
        message: 'White king is missing',
        severity: 'critical',
        color: 'white'
      });
    } else if (whiteKings.length > 1) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.MULTIPLE_KINGS,
        message: `Found ${whiteKings.length} white kings, must have exactly 1`,
        severity: 'critical',
        color: 'white',
        positions: whiteKings
      });
    } else {
      result.kingPositions.white = whiteKings[0];
    }
    
    // Validate black king count
    if (blackKings.length === 0) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.MISSING_KING,
        message: 'Black king is missing',
        severity: 'critical',
        color: 'black'
      });
    } else if (blackKings.length > 1) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.MULTIPLE_KINGS,
        message: `Found ${blackKings.length} black kings, must have exactly 1`,
        severity: 'critical',
        color: 'black',
        positions: blackKings
      });
    } else {
      result.kingPositions.black = blackKings[0];
    }
  }
  
  /**
   * Pawn position validation - not on first/last ranks
   * Requirements: 6.2
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  validatePawnPositions(position, result) {
    // Check first rank (row 0) - no pawns allowed
    for (let col = 0; col < this.COLS; col++) {
      const piece = position[0][col];
      if (piece === 'P' || piece === 'p') {
        result.valid = false;
        result.errors.push({
          type: this.ERROR_TYPES.INVALID_PAWN_POSITION,
          message: `${piece === 'P' ? 'White' : 'Black'} pawn cannot be on first rank`,
          severity: 'high',
          position: { row: 0, col },
          piece: piece
        });
      }
    }
    
    // Check last rank (row 4) - no pawns allowed
    for (let col = 0; col < this.COLS; col++) {
      const piece = position[4][col];
      if (piece === 'P' || piece === 'p') {
        result.valid = false;
        result.errors.push({
          type: this.ERROR_TYPES.INVALID_PAWN_POSITION,
          message: `${piece === 'P' ? 'White' : 'Black'} pawn cannot be on last rank`,
          severity: 'high',
          position: { row: 4, col },
          piece: piece
        });
      }
    }
  }
  
  /**
   * Validate piece counts don't exceed reasonable limits
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  validatePieceCounts(position, result) {
    const pieceCounts = {};
    
    // Count all pieces
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece) {
          pieceCounts[piece] = (pieceCounts[piece] || 0) + 1;
        }
      }
    }
    
    // Check against maximum limits
    for (const [piece, count] of Object.entries(pieceCounts)) {
      const maxCount = this.MAX_PIECES[piece];
      if (maxCount && count > maxCount) {
        result.valid = false;
        result.errors.push({
          type: this.ERROR_TYPES.TOO_MANY_PIECES,
          message: `Too many ${piece} pieces: ${count} (max: ${maxCount})`,
          severity: 'high',
          piece: piece,
          count: count,
          maxCount: maxCount
        });
      }
    }
  }
  
  /**
   * Validate that kings are not adjacent to each other
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  validateKingsAdjacency(position, result) {
    const whiteKing = result.kingPositions.white;
    const blackKing = result.kingPositions.black;
    
    if (!whiteKing || !blackKing) {
      return; // Already handled in king control validation
    }
    
    // Check if kings are adjacent (including diagonally)
    const rowDiff = Math.abs(whiteKing.row - blackKing.row);
    const colDiff = Math.abs(whiteKing.col - blackKing.col);
    
    if (rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0)) {
      result.valid = false;
      result.errors.push({
        type: this.ERROR_TYPES.KINGS_ADJACENT,
        message: 'Kings cannot be adjacent to each other',
        severity: 'high',
        positions: [whiteKing, blackKing]
      });
    }
  }
  
  /**
   * Check and mate detection algorithms
   * Requirements: 6.4, 6.5
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  detectCheckAndMate(position, result) {
    if (!this.analyzer) {
      console.warn('Advanced Position Analyzer not available for check detection');
      return;
    }
    
    try {
      // Use the analyzer's king safety assessment
      const analysis = this.analyzer.analyzePosition(position);
      const kingSafety = analysis.kingSafety;
      
      // Update check status
      result.checkStatus.whiteInCheck = kingSafety.white.inCheck;
      result.checkStatus.blackInCheck = kingSafety.black.inCheck;
      
      // Detect checkmate and stalemate
      this.detectMateConditions(position, result, kingSafety);
      
    } catch (error) {
      console.error('Error in check/mate detection:', error);
      result.warnings.push({
        type: this.WARNING_TYPES.UNUSUAL_MATERIAL,
        message: 'Could not analyze check/mate status',
        severity: 'low'
      });
    }
  }
  
  /**
   * Detect checkmate and stalemate conditions
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   * @param {Object} kingSafety - King safety analysis
   */
  detectMateConditions(position, result, kingSafety) {
    // Check for checkmate conditions
    if (kingSafety.white.status === 'critical') {
      result.checkStatus.checkmate = true;
      result.checkStatus.matedSide = 'white';
    } else if (kingSafety.black.status === 'critical') {
      result.checkStatus.checkmate = true;
      result.checkStatus.matedSide = 'black';
    }
    
    // Additional mate detection logic
    if (result.checkStatus.whiteInCheck || result.checkStatus.blackInCheck) {
      const sideInCheck = result.checkStatus.whiteInCheck ? 'white' : 'black';
      const hasLegalMoves = this.hasLegalMoves(position, sideInCheck === 'white');
      
      if (!hasLegalMoves) {
        result.checkStatus.checkmate = true;
        result.checkStatus.matedSide = sideInCheck;
      }
    } else {
      // Check for stalemate (no legal moves but not in check)
      const whiteHasMoves = this.hasLegalMoves(position, true);
      const blackHasMoves = this.hasLegalMoves(position, false);
      
      if (!whiteHasMoves || !blackHasMoves) {
        result.checkStatus.stalemate = true;
        result.checkStatus.stalematedSide = !whiteHasMoves ? 'white' : 'black';
      }
    }
  }
  
  /**
   * Check if a side has any legal moves
   * @param {Array} position - Board position
   * @param {boolean} isWhite - True for white, false for black
   * @returns {boolean} True if side has legal moves
   */
  hasLegalMoves(position, isWhite) {
    if (!this.analyzer) return true; // Assume legal moves if analyzer unavailable
    
    try {
      // Get all possible moves for the side
      for (let row = 0; row < this.ROWS; row++) {
        for (let col = 0; col < this.COLS; col++) {
          const piece = position[row][col];
          if (piece && this.isWhitePiece(piece) === isWhite) {
            const moves = this.analyzer.getPossibleMoves(position, row, col);
            if (moves.length > 0) {
              // Check if any move is actually legal (doesn't leave king in check)
              for (const move of moves) {
                if (this.isMoveLegal(position, row, col, move.row, move.col, isWhite)) {
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking legal moves:', error);
      return true; // Assume legal moves on error
    }
  }
  
  /**
   * Check if a move is legal (doesn't leave own king in check)
   * @param {Array} position - Board position
   * @param {number} fromRow - Source row
   * @param {number} fromCol - Source column
   * @param {number} toRow - Target row
   * @param {number} toCol - Target column
   * @param {boolean} isWhite - True for white move
   * @returns {boolean} True if move is legal
   */
  isMoveLegal(position, fromRow, fromCol, toRow, toCol, isWhite) {
    if (!this.analyzer) return true;
    
    try {
      // Make temporary move
      const tempPosition = position.map(row => [...row]);
      const piece = tempPosition[fromRow][fromCol];
      tempPosition[toRow][toCol] = piece;
      tempPosition[fromRow][fromCol] = null;
      
      // Find king position after move
      const kingPos = this.analyzer.findKing(tempPosition, isWhite);
      if (!kingPos) return false;
      
      // Check if king is in check after move
      return !this.analyzer.isKingInCheck(tempPosition, kingPos, isWhite);
    } catch (error) {
      return true; // Assume legal on error
    }
  }
  
  /**
   * Generate warnings for unusual but legal positions
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  generateWarnings(position, result) {
    // Count total pieces
    let totalPieces = 0;
    let materialBalance = 0;
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece) {
          totalPieces++;
          // Simple material counting
          const value = this.getPieceValue(piece.toLowerCase());
          materialBalance += this.isWhitePiece(piece) ? value : -value;
        }
      }
    }
    
    // Warning for very few pieces
    if (totalPieces < 4) {
      result.warnings.push({
        type: this.WARNING_TYPES.UNUSUAL_MATERIAL,
        message: 'Very few pieces on board - unusual position',
        severity: 'low'
      });
    }
    
    // Warning for extreme material imbalance
    if (Math.abs(materialBalance) > 15) {
      result.warnings.push({
        type: this.WARNING_TYPES.UNUSUAL_MATERIAL,
        message: 'Extreme material imbalance detected',
        severity: 'medium',
        balance: materialBalance
      });
    }
    
    // Warning for exposed kings
    if (result.kingPositions.white && result.kingPositions.black) {
      this.checkKingExposure(position, result);
    }
  }
  
  /**
   * Check for exposed king positions
   * @param {Array} position - Board position
   * @param {Object} result - Validation result object
   */
  checkKingExposure(position, result) {
    const whiteKing = result.kingPositions.white;
    const blackKing = result.kingPositions.black;
    
    // Check if kings are in the center (more exposed)
    if (whiteKing.row >= 1 && whiteKing.row <= 3 && whiteKing.col >= 1 && whiteKing.col <= 2) {
      result.warnings.push({
        type: this.WARNING_TYPES.EXPOSED_KING,
        message: 'White king is in a central, exposed position',
        severity: 'medium',
        position: whiteKing
      });
    }
    
    if (blackKing.row >= 1 && blackKing.row <= 3 && blackKing.col >= 1 && blackKing.col <= 2) {
      result.warnings.push({
        type: this.WARNING_TYPES.EXPOSED_KING,
        message: 'Black king is in a central, exposed position',
        severity: 'medium',
        position: blackKing
      });
    }
  }
  
  /**
   * Get simple piece value for material calculation
   * @param {string} piece - Piece type (lowercase)
   * @returns {number} Piece value
   */
  getPieceValue(piece) {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    return values[piece] || 0;
  }
  
  /**
   * Check if piece is white
   * @param {string} piece - Piece character
   * @returns {boolean} True if white piece
   */
  isWhitePiece(piece) {
    return piece === piece.toUpperCase();
  }
  
  /**
   * Get validation summary for UI display
   * @param {Object} validationResult - Result from validatePosition
   * @returns {Object} Summary object
   */
  getValidationSummary(validationResult) {
    const summary = {
      status: validationResult.valid ? 'valid' : 'invalid',
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
      criticalErrors: validationResult.errors.filter(e => e.severity === 'critical').length,
      checkStatus: validationResult.checkStatus,
      message: ''
    };
    
    if (validationResult.checkStatus.checkmate) {
      summary.message = `Checkmate! ${validationResult.checkStatus.matedSide} is mated.`;
      summary.status = 'checkmate';
    } else if (validationResult.checkStatus.stalemate) {
      summary.message = `Stalemate! ${validationResult.checkStatus.stalematedSide} has no legal moves.`;
      summary.status = 'stalemate';
    } else if (validationResult.checkStatus.whiteInCheck) {
      summary.message = 'White king is in check!';
      summary.status = 'check';
    } else if (validationResult.checkStatus.blackInCheck) {
      summary.message = 'Black king is in check!';
      summary.status = 'check';
    } else if (!validationResult.valid) {
      summary.message = `Position has ${summary.errorCount} error(s)`;
    } else if (validationResult.warnings.length > 0) {
      summary.message = `Position is valid but has ${summary.warningCount} warning(s)`;
    } else {
      summary.message = 'Position is valid';
    }
    
    return summary;
  }
  
  /**
   * Format error message for display
   * @param {Object} error - Error object
   * @returns {string} Formatted error message
   */
  formatErrorMessage(error) {
    const icons = {
      critical: '🚫',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    
    const icon = icons[error.severity] || '⚠️';
    return `${icon} ${error.message}`;
  }
  
  /**
   * Format warning message for display
   * @param {Object} warning - Warning object
   * @returns {string} Formatted warning message
   */
  formatWarningMessage(warning) {
    const icons = {
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    
    const icon = icons[warning.severity] || 'ℹ️';
    return `${icon} ${warning.message}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedPositionValidator;
} else if (typeof window !== 'undefined') {
  window.EnhancedPositionValidator = EnhancedPositionValidator;
}