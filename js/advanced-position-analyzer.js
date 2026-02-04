/**
 * Advanced Position Analyzer for 4x5 Chess
 * 
 * Provides comprehensive position analysis including:
 * - Material balance calculation (P=1, N=3, B=3, R=5, Q=9)
 * - Piece activity evaluation (mobile piece count)
 * - King safety analysis (check status, escape squares)
 * - Center control calculation (center squares: d2, d3, e2, e3)
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

class AdvancedPositionAnalyzer {
  constructor() {
    this.analysisCache = new Map();
    this.evaluationCriteria = {
      material: true,
      activity: true,
      safety: true,
      control: true
    };
    
    // Piece values for material calculation
    this.pieceValues = {
      'p': 1,  // Pawn
      'n': 3,  // Knight
      'b': 3,  // Bishop
      'r': 5,  // Rook
      'q': 9,  // Queen
      'k': 0   // King (invaluable)
    };
    
    // Center squares for 4x5 board (d2, d3, e2, e3 in algebraic notation)
    // Converting to array indices: d2=[3,3], d3=[2,3], e2=[3,0], e3=[2,0]
    this.centerSquares = [
      { row: 3, col: 3 }, // d2
      { row: 2, col: 3 }, // d3
      { row: 3, col: 0 }, // e2 (note: in 4x5, e-file is column 0)
      { row: 2, col: 0 }  // e3
    ];
    
    // Board dimensions
    this.ROWS = 5;
    this.COLS = 4;
  }
  
  /**
   * Analyze a position and return comprehensive analysis
   * @param {Array} position - 5x4 board array
   * @returns {Object} Analysis result
   */
  analyzePosition(position) {
    if (!this.isValidPosition(position)) {
      return this.createErrorResult('Invalid position provided');
    }
    
    // Check cache first
    const positionKey = this.getPositionKey(position);
    if (this.analysisCache.has(positionKey)) {
      return this.analysisCache.get(positionKey);
    }
    
    const analysis = {
      materialBalance: this.analyzeMaterialBalance(position),
      pieceActivity: this.evaluatePieceActivity(position),
      kingSafety: this.assessKingSafety(position),
      centerControl: this.calculateCenterControl(position),
      positionType: 'balanced',
      recommendations: [],
      timestamp: Date.now()
    };
    
    // Determine position type based on analysis
    analysis.positionType = this.determinePositionType(analysis);
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);
    
    // Cache the result
    this.analysisCache.set(positionKey, analysis);
    
    return analysis;
  }
  
  /**
   * Calculate material balance between white and black pieces
   * Requirements: 3.1
   * @param {Array} position - 5x4 board array
   * @returns {Object} Material balance analysis
   */
  analyzeMaterialBalance(position) {
    let whiteValue = 0;
    let blackValue = 0;
    let whitePieces = [];
    let blackPieces = [];
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece) {
          const pieceType = piece.toLowerCase();
          const value = this.pieceValues[pieceType] || 0;
          
          if (this.isWhitePiece(piece)) {
            whiteValue += value;
            whitePieces.push(pieceType);
          } else {
            blackValue += value;
            blackPieces.push(pieceType);
          }
        }
      }
    }
    
    const balance = whiteValue - blackValue;
    
    return {
      whiteValue,
      blackValue,
      balance,
      whitePieces: this.countPieceTypes(whitePieces),
      blackPieces: this.countPieceTypes(blackPieces),
      advantage: balance > 0 ? 'white' : balance < 0 ? 'black' : 'equal',
      advantageAmount: Math.abs(balance)
    };
  }
  
  /**
   * Evaluate piece activity by counting mobile pieces
   * Requirements: 3.2
   * @param {Array} position - 5x4 board array
   * @returns {Object} Piece activity analysis
   */
  evaluatePieceActivity(position) {
    let whiteMobilePieces = 0;
    let blackMobilePieces = 0;
    let whiteMovesCount = 0;
    let blackMovesCount = 0;
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece) {
          const moves = this.getPossibleMoves(position, row, col);
          const isWhite = this.isWhitePiece(piece);
          
          if (moves.length > 0) {
            if (isWhite) {
              whiteMobilePieces++;
              whiteMovesCount += moves.length;
            } else {
              blackMobilePieces++;
              blackMovesCount += moves.length;
            }
          }
        }
      }
    }
    
    return {
      white: {
        mobilePieces: whiteMobilePieces,
        totalMoves: whiteMovesCount,
        averageMovesPerPiece: whiteMobilePieces > 0 ? whiteMovesCount / whiteMobilePieces : 0
      },
      black: {
        mobilePieces: blackMobilePieces,
        totalMoves: blackMovesCount,
        averageMovesPerPiece: blackMobilePieces > 0 ? blackMovesCount / blackMobilePieces : 0
      },
      activityAdvantage: whiteMovesCount > blackMovesCount ? 'white' : 
                        blackMovesCount > whiteMovesCount ? 'black' : 'equal'
    };
  }
  
  /**
   * Assess king safety including check status and escape squares
   * Requirements: 3.3
   * @param {Array} position - 5x4 board array
   * @returns {Object} King safety analysis
   */
  assessKingSafety(position) {
    const whiteKingPos = this.findKing(position, true);
    const blackKingPos = this.findKing(position, false);
    
    if (!whiteKingPos || !blackKingPos) {
      return {
        white: { status: 'missing', inCheck: false, escapeSquares: 0 },
        black: { status: 'missing', inCheck: false, escapeSquares: 0 }
      };
    }
    
    const whiteInCheck = this.isKingInCheck(position, whiteKingPos, true);
    const blackInCheck = this.isKingInCheck(position, blackKingPos, false);
    
    const whiteEscapeSquares = this.countEscapeSquares(position, whiteKingPos, true);
    const blackEscapeSquares = this.countEscapeSquares(position, blackKingPos, false);
    
    return {
      white: {
        position: whiteKingPos,
        inCheck: whiteInCheck,
        escapeSquares: whiteEscapeSquares,
        status: this.evaluateKingSafetyStatus(whiteInCheck, whiteEscapeSquares)
      },
      black: {
        position: blackKingPos,
        inCheck: blackInCheck,
        escapeSquares: blackEscapeSquares,
        status: this.evaluateKingSafetyStatus(blackInCheck, blackEscapeSquares)
      }
    };
  }
  
  /**
   * Calculate center control for both sides
   * Requirements: 3.4
   * @param {Array} position - 5x4 board array
   * @returns {Object} Center control analysis
   */
  calculateCenterControl(position) {
    let whiteControl = 0;
    let blackControl = 0;
    let controlledSquares = {
      white: [],
      black: []
    };
    
    // Check control of each center square
    for (const centerSquare of this.centerSquares) {
      const { row, col } = centerSquare;
      const whiteAttackers = this.getAttackersOfSquare(position, row, col, true);
      const blackAttackers = this.getAttackersOfSquare(position, row, col, false);
      
      const whiteAttackCount = whiteAttackers.length;
      const blackAttackCount = blackAttackers.length;
      
      if (whiteAttackCount > blackAttackCount) {
        whiteControl++;
        controlledSquares.white.push({ row, col, attackers: whiteAttackers });
      } else if (blackAttackCount > whiteAttackCount) {
        blackControl++;
        controlledSquares.black.push({ row, col, attackers: blackAttackers });
      }
    }
    
    return {
      white: whiteControl,
      black: blackControl,
      controlledSquares,
      advantage: whiteControl > blackControl ? 'white' : 
                blackControl > whiteControl ? 'black' : 'equal',
      totalCenterSquares: this.centerSquares.length
    };
  }
  
  /**
   * Generate a comprehensive analysis report
   * @param {Array} position - 5x4 board array
   * @returns {Object} Complete analysis report
   */
  generateAnalysisReport(position) {
    const analysis = this.analyzePosition(position);
    
    const report = {
      summary: this.generateSummary(analysis),
      details: analysis,
      recommendations: analysis.recommendations,
      positionType: analysis.positionType,
      timestamp: analysis.timestamp
    };
    
    return report;
  }
  
  // Helper Methods
  
  /**
   * Check if a position is valid (5x4 array)
   */
  isValidPosition(position) {
    return Array.isArray(position) && 
           position.length === this.ROWS && 
           position.every(row => Array.isArray(row) && row.length === this.COLS);
  }
  
  /**
   * Generate a unique key for position caching
   */
  getPositionKey(position) {
    return position.map(row => row.map(piece => piece || '').join('')).join('|');
  }
  
  /**
   * Check if a piece is white
   */
  isWhitePiece(piece) {
    return piece === piece.toUpperCase();
  }
  
  /**
   * Count piece types in an array
   */
  countPieceTypes(pieces) {
    const counts = {};
    for (const piece of pieces) {
      counts[piece] = (counts[piece] || 0) + 1;
    }
    return counts;
  }
  
  /**
   * Get possible moves for a piece at given position
   */
  getPossibleMoves(position, row, col) {
    const piece = position[row][col];
    if (!piece) return [];
    
    const moves = [];
    const isWhite = this.isWhitePiece(piece);
    const pieceType = piece.toLowerCase();
    
    switch (pieceType) {
      case 'p':
        moves.push(...this.getPawnMoves(position, row, col, isWhite));
        break;
      case 'r':
        moves.push(...this.getRookMoves(position, row, col, isWhite));
        break;
      case 'n':
        moves.push(...this.getKnightMoves(position, row, col, isWhite));
        break;
      case 'b':
        moves.push(...this.getBishopMoves(position, row, col, isWhite));
        break;
      case 'q':
        moves.push(...this.getQueenMoves(position, row, col, isWhite));
        break;
      case 'k':
        moves.push(...this.getKingMoves(position, row, col, isWhite));
        break;
    }
    
    return moves;
  }
  
  /**
   * Get pawn moves
   */
  getPawnMoves(position, row, col, isWhite) {
    const moves = [];
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 3 : 1;
    
    // Forward move
    const newRow = row + direction;
    if (this.isValidSquare(newRow, col) && !position[newRow][col]) {
      moves.push({ row: newRow, col });
      
      // Double move from starting position
      if (row === startRow && !position[newRow + direction][col]) {
        moves.push({ row: newRow + direction, col });
      }
    }
    
    // Captures
    for (const deltaCol of [-1, 1]) {
      const captureCol = col + deltaCol;
      if (this.isValidSquare(newRow, captureCol)) {
        const target = position[newRow][captureCol];
        if (target && this.isWhitePiece(target) !== isWhite) {
          moves.push({ row: newRow, col: captureCol });
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Get rook moves
   */
  getRookMoves(position, row, col, isWhite) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [deltaRow, deltaCol] of directions) {
      let newRow = row + deltaRow;
      let newCol = col + deltaCol;
      
      while (this.isValidSquare(newRow, newCol)) {
        const target = position[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (this.isWhitePiece(target) !== isWhite) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
        newRow += deltaRow;
        newCol += deltaCol;
      }
    }
    
    return moves;
  }
  
  /**
   * Get knight moves
   */
  getKnightMoves(position, row, col, isWhite) {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [deltaRow, deltaCol] of knightMoves) {
      const newRow = row + deltaRow;
      const newCol = col + deltaCol;
      
      if (this.isValidSquare(newRow, newCol)) {
        const target = position[newRow][newCol];
        if (!target || this.isWhitePiece(target) !== isWhite) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Get bishop moves
   */
  getBishopMoves(position, row, col, isWhite) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (const [deltaRow, deltaCol] of directions) {
      let newRow = row + deltaRow;
      let newCol = col + deltaCol;
      
      while (this.isValidSquare(newRow, newCol)) {
        const target = position[newRow][newCol];
        if (!target) {
          moves.push({ row: newRow, col: newCol });
        } else {
          if (this.isWhitePiece(target) !== isWhite) {
            moves.push({ row: newRow, col: newCol });
          }
          break;
        }
        newRow += deltaRow;
        newCol += deltaCol;
      }
    }
    
    return moves;
  }
  
  /**
   * Get queen moves (combination of rook and bishop)
   */
  getQueenMoves(position, row, col, isWhite) {
    return [
      ...this.getRookMoves(position, row, col, isWhite),
      ...this.getBishopMoves(position, row, col, isWhite)
    ];
  }
  
  /**
   * Get king moves
   */
  getKingMoves(position, row, col, isWhite) {
    const moves = [];
    
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow === 0 && deltaCol === 0) continue;
        
        const newRow = row + deltaRow;
        const newCol = col + deltaCol;
        
        if (this.isValidSquare(newRow, newCol)) {
          const target = position[newRow][newCol];
          if (!target || this.isWhitePiece(target) !== isWhite) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
    }
    
    return moves;
  }
  
  /**
   * Check if square coordinates are valid
   */
  isValidSquare(row, col) {
    return row >= 0 && row < this.ROWS && col >= 0 && col < this.COLS;
  }
  
  /**
   * Find king position
   */
  findKing(position, isWhite) {
    const kingPiece = isWhite ? 'K' : 'k';
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (position[row][col] === kingPiece) {
          return { row, col };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Check if king is in check
   */
  isKingInCheck(position, kingPos, isWhite) {
    const attackers = this.getAttackersOfSquare(position, kingPos.row, kingPos.col, !isWhite);
    return attackers.length > 0;
  }
  
  /**
   * Count escape squares for king
   */
  countEscapeSquares(position, kingPos, isWhite) {
    let escapeSquares = 0;
    
    for (let deltaRow = -1; deltaRow <= 1; deltaRow++) {
      for (let deltaCol = -1; deltaCol <= 1; deltaCol++) {
        if (deltaRow === 0 && deltaCol === 0) continue;
        
        const newRow = kingPos.row + deltaRow;
        const newCol = kingPos.col + deltaCol;
        
        if (this.isValidSquare(newRow, newCol)) {
          const target = position[newRow][newCol];
          if (!target || this.isWhitePiece(target) !== isWhite) {
            // Temporarily move king to check if square is safe
            const tempPosition = position.map(row => [...row]);
            tempPosition[kingPos.row][kingPos.col] = null;
            tempPosition[newRow][newCol] = isWhite ? 'K' : 'k';
            
            const attackers = this.getAttackersOfSquare(tempPosition, newRow, newCol, !isWhite);
            if (attackers.length === 0) {
              escapeSquares++;
            }
          }
        }
      }
    }
    
    return escapeSquares;
  }
  
  /**
   * Get all pieces attacking a square
   */
  getAttackersOfSquare(position, targetRow, targetCol, byWhite) {
    const attackers = [];
    
    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const piece = position[row][col];
        if (piece && this.isWhitePiece(piece) === byWhite) {
          const moves = this.getPossibleMoves(position, row, col);
          if (moves.some(move => move.row === targetRow && move.col === targetCol)) {
            attackers.push({ row, col, piece });
          }
        }
      }
    }
    
    return attackers;
  }
  
  /**
   * Evaluate king safety status
   */
  evaluateKingSafetyStatus(inCheck, escapeSquares) {
    if (inCheck) {
      if (escapeSquares === 0) {
        return 'critical'; // Potential checkmate
      } else if (escapeSquares <= 2) {
        return 'dangerous';
      } else {
        return 'check';
      }
    } else {
      if (escapeSquares >= 5) {
        return 'safe';
      } else if (escapeSquares >= 3) {
        return 'moderate';
      } else {
        return 'restricted';
      }
    }
  }
  
  /**
   * Determine overall position type
   */
  determinePositionType(analysis) {
    const materialAdvantage = analysis.materialBalance.advantageAmount;
    const activityAdvantage = analysis.pieceActivity.activityAdvantage;
    const centerAdvantage = analysis.centerControl.advantage;
    
    if (materialAdvantage >= 3) {
      return analysis.materialBalance.advantage + '_advantage';
    } else if (activityAdvantage !== 'equal' && centerAdvantage === activityAdvantage) {
      return activityAdvantage + '_positional_advantage';
    } else if (materialAdvantage >= 1) {
      return 'slight_' + analysis.materialBalance.advantage + '_advantage';
    } else {
      return 'balanced';
    }
  }
  
  /**
   * Generate strategic recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // Material recommendations
    if (analysis.materialBalance.advantage !== 'equal') {
      const advantageSide = analysis.materialBalance.advantage;
      const disadvantageSide = advantageSide === 'white' ? 'black' : 'white';
      
      if (analysis.materialBalance.advantageAmount >= 3) {
        recommendations.push(`${advantageSide.charAt(0).toUpperCase() + advantageSide.slice(1)} should simplify and trade pieces to reach a winning endgame.`);
        recommendations.push(`${disadvantageSide.charAt(0).toUpperCase() + disadvantageSide.slice(1)} needs to create complications and avoid trades.`);
      }
    }
    
    // Activity recommendations
    if (analysis.pieceActivity.activityAdvantage !== 'equal') {
      const activeSide = analysis.pieceActivity.activityAdvantage;
      recommendations.push(`${activeSide.charAt(0).toUpperCase() + activeSide.slice(1)} has more active pieces and should maintain the initiative.`);
    }
    
    // King safety recommendations
    if (analysis.kingSafety.white.status === 'dangerous' || analysis.kingSafety.white.status === 'critical') {
      recommendations.push('White king is in danger and needs immediate attention.');
    }
    if (analysis.kingSafety.black.status === 'dangerous' || analysis.kingSafety.black.status === 'critical') {
      recommendations.push('Black king is in danger and needs immediate attention.');
    }
    
    // Center control recommendations
    if (analysis.centerControl.advantage !== 'equal') {
      const controlSide = analysis.centerControl.advantage;
      recommendations.push(`${controlSide.charAt(0).toUpperCase() + controlSide.slice(1)} controls the center and should use this advantage to launch an attack.`);
    }
    
    return recommendations;
  }
  
  /**
   * Generate analysis summary
   */
  generateSummary(analysis) {
    const summary = [];
    
    // Material summary
    if (analysis.materialBalance.advantage === 'equal') {
      summary.push('Material is equal');
    } else {
      summary.push(`${analysis.materialBalance.advantage.charAt(0).toUpperCase() + analysis.materialBalance.advantage.slice(1)} has a ${analysis.materialBalance.advantageAmount}-point material advantage`);
    }
    
    // Activity summary
    const whiteActivity = analysis.pieceActivity.white.mobilePieces;
    const blackActivity = analysis.pieceActivity.black.mobilePieces;
    summary.push(`Piece activity: White ${whiteActivity}, Black ${blackActivity}`);
    
    // King safety summary
    const whiteKingSafety = analysis.kingSafety.white.status;
    const blackKingSafety = analysis.kingSafety.black.status;
    summary.push(`King safety: White ${whiteKingSafety}, Black ${blackKingSafety}`);
    
    // Center control summary
    const whiteCenter = analysis.centerControl.white;
    const blackCenter = analysis.centerControl.black;
    summary.push(`Center control: White ${whiteCenter}/${analysis.centerControl.totalCenterSquares}, Black ${blackCenter}/${analysis.centerControl.totalCenterSquares}`);
    
    return summary.join('. ');
  }
  
  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.analysisCache.size,
      maxSize: 100 // Could be configurable
    };
  }
  
  /**
   * Create error result
   */
  createErrorResult(message) {
    return {
      error: true,
      message,
      materialBalance: null,
      pieceActivity: null,
      kingSafety: null,
      centerControl: null,
      positionType: 'invalid',
      recommendations: [],
      timestamp: Date.now()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedPositionAnalyzer;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
  window.AdvancedPositionAnalyzer = AdvancedPositionAnalyzer;
}