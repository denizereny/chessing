// Classic 8x8 Chess Game - Python kodundan JavaScript'e çevrilmiş
// Louise's 2D Chess - Web versiyonu

class ChessGame {
  constructor() {
    this.board = [];
    this.selectedSquare = null;
    this.validMoves = [];
    this.whiteToMove = true;
    this.gameOver = false;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.moveNumber = 0;
    this.gameTime = 0;
    this.timer = null;
    this.lastMove = null;
    this.aiThinking = false;
    this.aiColor = 'black'; // AI plays as black
    this.aiDifficulty = 3; // 1-5 difficulty levels
    this.vsAI = true; // Playing against AI
    
    // Board representation - 64 squares (0-63)
    this.boardSpaces = [];
    this.whitePieces = [];
    this.blackPieces = [];
    
    // AI evaluation values
    this.pieceValues = {
      'Pawn': 100,
      'Knight': 320,
      'Bishop': 330,
      'Rook': 500,
      'Queen': 900,
      'King': 20000
    };
    
    // Position evaluation tables
    this.pawnTable = [
      0,  0,  0,  0,  0,  0,  0,  0,
      50, 50, 50, 50, 50, 50, 50, 50,
      10, 10, 20, 30, 30, 20, 10, 10,
      5,  5, 10, 25, 25, 10,  5,  5,
      0,  0,  0, 20, 20,  0,  0,  0,
      5, -5,-10,  0,  0,-10, -5,  5,
      5, 10, 10,-20,-20, 10, 10,  5,
      0,  0,  0,  0,  0,  0,  0,  0
    ];
    
    this.knightTable = [
      -50,-40,-30,-30,-30,-30,-40,-50,
      -40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,
      -30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,
      -30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,
      -50,-40,-30,-30,-30,-30,-40,-50
    ];
    
    this.bishopTable = [
      -20,-10,-10,-10,-10,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,
      -10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,
      -10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,
      -20,-10,-10,-10,-10,-10,-10,-20
    ];
    
    this.rookTable = [
      0,  0,  0,  0,  0,  0,  0,  0,
      5, 10, 10, 10, 10, 10, 10,  5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      -5,  0,  0,  0,  0,  0,  0, -5,
      0,  0,  0,  5,  5,  0,  0,  0
    ];
    
    this.queenTable = [
      -20,-10,-10, -5, -5,-10,-10,-20,
      -10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10,
      -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
      -10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,
      -20,-10,-10, -5, -5,-10,-10,-20
    ];
    
    this.kingMiddleGameTable = [
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,
      -10,-20,-20,-20,-20,-20,-20,-10,
      20, 20,  0,  0,  0,  0, 20, 20,
      20, 30, 10,  0,  0, 10, 30, 20
    ];
    
    // Row and column ranges for move calculation
    this.rows = {
      1: [0, 1, 2, 3, 4, 5, 6, 7],
      2: [8, 9, 10, 11, 12, 13, 14, 15],
      3: [16, 17, 18, 19, 20, 21, 22, 23],
      4: [24, 25, 26, 27, 28, 29, 30, 31],
      5: [32, 33, 34, 35, 36, 37, 38, 39],
      6: [40, 41, 42, 43, 44, 45, 46, 47],
      7: [48, 49, 50, 51, 52, 53, 54, 55],
      8: [56, 57, 58, 59, 60, 61, 62, 63]
    };
    
    this.cols = {
      a: [0, 8, 16, 24, 32, 40, 48, 56],
      b: [1, 9, 17, 25, 33, 41, 49, 57],
      c: [2, 10, 18, 26, 34, 42, 50, 58],
      d: [3, 11, 19, 27, 35, 43, 51, 59],
      e: [4, 12, 20, 28, 36, 44, 52, 60],
      f: [5, 13, 21, 29, 37, 45, 53, 61],
      g: [6, 14, 22, 30, 38, 46, 54, 62],
      h: [7, 15, 23, 31, 39, 47, 55, 63]
    };
    
    this.initializeBoard();
    this.setupPieces();
  }
  
  initializeBoard() {
    // Create 64 squares
    for (let i = 0; i < 64; i++) {
      this.boardSpaces.push(null);
      this.whitePieces.push(null);
      this.blackPieces.push(null);
    }
  }
  
  setupPieces() {
    // Black pieces (top)
    this.boardSpaces[0] = new Rook('black', 0);
    this.boardSpaces[1] = new Knight('black', 1);
    this.boardSpaces[2] = new Bishop('black', 2);
    this.boardSpaces[3] = new Queen('black', 3);
    this.boardSpaces[4] = new King('black', 4);
    this.boardSpaces[5] = new Bishop('black', 5);
    this.boardSpaces[6] = new Knight('black', 6);
    this.boardSpaces[7] = new Rook('black', 7);
    
    // Black pawns
    for (let i = 8; i < 16; i++) {
      this.boardSpaces[i] = new Pawn('black', i);
    }
    
    // White pawns
    for (let i = 48; i < 56; i++) {
      this.boardSpaces[i] = new Pawn('white', i);
    }
    
    // White pieces (bottom)
    this.boardSpaces[56] = new Rook('white', 56);
    this.boardSpaces[57] = new Knight('white', 57);
    this.boardSpaces[58] = new Bishop('white', 58);
    this.boardSpaces[59] = new Queen('white', 59);
    this.boardSpaces[60] = new King('white', 60);
    this.boardSpaces[61] = new Bishop('white', 61);
    this.boardSpaces[62] = new Knight('white', 62);
    this.boardSpaces[63] = new Rook('white', 63);
    
    // Fill piece arrays
    for (let i = 0; i < 64; i++) {
      const piece = this.boardSpaces[i];
      if (piece) {
        if (piece.color === 'white') {
          this.whitePieces[i] = piece;
        } else {
          this.blackPieces[i] = piece;
        }
      }
    }
  }
  
  createBoard() {
    const container = document.getElementById('classic-chess-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="classic-chess-header">
        <h2>♛ Classic 8×8 Chess</h2>
        <div class="game-info">
          <span id="classic-status">White to move</span>
          <span id="classic-timer">⏱️ 00:00</span>
        </div>
      </div>
      
      <div class="ai-controls">
        <div class="control-group">
          <label>
            <input type="checkbox" id="vsAI" ${this.vsAI ? 'checked' : ''} onchange="classicChess.toggleAI()">
            Play vs AI
          </label>
        </div>
        <div class="control-group" ${!this.vsAI ? 'style="opacity: 0.5"' : ''}>
          <label for="aiDifficulty">AI Difficulty:</label>
          <select id="aiDifficulty" onchange="classicChess.setAIDifficulty(this.value)" ${!this.vsAI ? 'disabled' : ''}>
            <option value="1" ${this.aiDifficulty === 1 ? 'selected' : ''}>🟢 Beginner</option>
            <option value="2" ${this.aiDifficulty === 2 ? 'selected' : ''}>🟡 Easy</option>
            <option value="3" ${this.aiDifficulty === 3 ? 'selected' : ''}>🟠 Medium</option>
            <option value="4" ${this.aiDifficulty === 4 ? 'selected' : ''}>🔴 Hard</option>
            <option value="5" ${this.aiDifficulty === 5 ? 'selected' : ''}>💀 Expert</option>
          </select>
        </div>
        <div class="control-group" ${!this.vsAI ? 'style="opacity: 0.5"' : ''}>
          <label for="aiColor">AI Color:</label>
          <select id="aiColor" onchange="classicChess.setAIColor(this.value)" ${!this.vsAI ? 'disabled' : ''}>
            <option value="black" ${this.aiColor === 'black' ? 'selected' : ''}>⚫ Black</option>
            <option value="white" ${this.aiColor === 'white' ? 'selected' : ''}>⚪ White</option>
          </select>
        </div>
      </div>
      
      <div class="classic-board" id="classic-board"></div>
      <div class="classic-controls">
        <button onclick="classicChess.newGame()">🔄 New Game</button>
        <button onclick="classicChess.undoMove()">↩️ Undo</button>
        <button onclick="window.location.reload()">🏠 Back to Menu</button>
      </div>
      
      <div class="thinking-indicator" id="thinking-indicator" style="display: none;">
        <div class="spinner"></div>
        <span>AI is thinking...</span>
      </div>
    `;
    
    this.drawBoard();
    this.startTimer();
    
    // If AI plays white, make first move
    if (this.vsAI && this.aiColor === 'white') {
      setTimeout(() => this.makeAIMove(), 1000);
    }
  }
  
  drawBoard() {
    const boardEl = document.getElementById('classic-board');
    if (!boardEl) return;
    
    boardEl.innerHTML = '';
    
    for (let square = 0; square < 64; square++) {
      const squareEl = document.createElement('div');
      squareEl.className = 'classic-square';
      
      // Determine square color
      const row = Math.floor(square / 8);
      const col = square % 8;
      squareEl.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      
      // Add coordinate
      const coord = this.getSquareNotation(square);
      const coordEl = document.createElement('div');
      coordEl.className = 'square-coord';
      coordEl.textContent = coord;
      squareEl.appendChild(coordEl);
      
      // Add piece if present
      const piece = this.boardSpaces[square];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'chess-piece';
        
        // Add color class for styling
        if (piece.color === 'white') {
          pieceEl.classList.add('white-piece');
        } else {
          pieceEl.classList.add('black-piece');
        }
        
        pieceEl.textContent = piece.getSymbol();
        squareEl.appendChild(pieceEl);
      }
      
      // Highlight selected square
      if (this.selectedSquare === square) {
        squareEl.classList.add('selected');
      }
      
      // Highlight valid moves
      if (this.validMoves.includes(square)) {
        squareEl.classList.add('valid-move');
        if (piece) {
          squareEl.classList.add('capture');
        }
      }
      
      // Highlight last move
      if (this.lastMove && (this.lastMove.from === square || this.lastMove.to === square)) {
        squareEl.classList.add('last-move');
      }
      
      // Add click handler
      squareEl.onclick = () => this.onSquareClick(square);
      
      // Add right-click to deselect
      squareEl.oncontextmenu = (e) => {
        e.preventDefault();
        this.deselect();
      };
      
      boardEl.appendChild(squareEl);
    }
  }
  
  getSquareNotation(square) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const file = square % 8;
    const rank = Math.floor(square / 8);
    
    return files[file] + ranks[rank];
  }
  
  onSquareClick(square) {
    if (this.gameOver || this.aiThinking) return;
    
    // If playing vs AI and it's AI's turn, don't allow moves
    if (this.vsAI && ((this.whiteToMove && this.aiColor === 'white') || (!this.whiteToMove && this.aiColor === 'black'))) {
      return;
    }
    
    // If a square is selected and this is a valid move
    if (this.selectedSquare !== null && this.validMoves.includes(square)) {
      this.makeMove(this.selectedSquare, square);
      this.deselect();
      
      // After player move, let AI think
      if (this.vsAI && !this.gameOver) {
        setTimeout(() => this.makeAIMove(), 500);
      }
      return;
    }
    
    // Select piece if it belongs to current player
    const piece = this.boardSpaces[square];
    if (piece && piece.color === (this.whiteToMove ? 'white' : 'black')) {
      this.selectSquare(square);
    } else {
      this.deselect();
    }
  }
  
  toggleAI() {
    const checkbox = document.getElementById('vsAI');
    this.vsAI = checkbox.checked;
    
    const aiControls = document.querySelectorAll('.ai-controls .control-group:not(:first-child)');
    const selects = document.querySelectorAll('#aiDifficulty, #aiColor');
    
    aiControls.forEach(control => {
      control.style.opacity = this.vsAI ? '1' : '0.5';
    });
    
    selects.forEach(select => {
      select.disabled = !this.vsAI;
    });
    
    if (this.vsAI && ((this.whiteToMove && this.aiColor === 'white') || (!this.whiteToMove && this.aiColor === 'black'))) {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }
  
  setAIDifficulty(difficulty) {
    this.aiDifficulty = parseInt(difficulty);
    this.showNotification(`AI difficulty set to level ${difficulty}`);
  }
  
  setAIColor(color) {
    this.aiColor = color;
    this.showNotification(`AI will play as ${color}`);
    
    if (this.vsAI && ((this.whiteToMove && this.aiColor === 'white') || (!this.whiteToMove && this.aiColor === 'black'))) {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }
  
  selectSquare(square) {
    this.selectedSquare = square;
    this.validMoves = this.getValidMoves(square);
    this.drawBoard();
  }
  
  deselect() {
    this.selectedSquare = null;
    this.validMoves = [];
    this.drawBoard();
  }
  
  getValidMoves(square) {
    const piece = this.boardSpaces[square];
    if (!piece) return [];
    
    return piece.getMoves(square, this.boardSpaces, this.rows, this.cols);
  }
  
  makeMove(from, to) {
    const piece = this.boardSpaces[from];
    const capturedPiece = this.boardSpaces[to];
    
    // Record move
    const move = {
      from,
      to,
      piece: piece.constructor.name,
      captured: capturedPiece ? capturedPiece.constructor.name : null,
      notation: `${this.getSquareNotation(from)}-${this.getSquareNotation(to)}`
    };
    
    // Handle capture
    if (capturedPiece) {
      this.capturedPieces[piece.color].push(capturedPiece);
    }
    
    // Move piece
    this.boardSpaces[to] = piece;
    this.boardSpaces[from] = null;
    
    // Update piece arrays
    if (piece.color === 'white') {
      this.whitePieces[to] = piece;
      this.whitePieces[from] = null;
      if (capturedPiece) {
        this.blackPieces[to] = null;
      }
    } else {
      this.blackPieces[to] = piece;
      this.blackPieces[from] = null;
      if (capturedPiece) {
        this.whitePieces[to] = null;
      }
    }
    
    // Handle pawn promotion
    if (piece instanceof Pawn) {
      if ((piece.color === 'white' && Math.floor(to / 8) === 0) ||
          (piece.color === 'black' && Math.floor(to / 8) === 7)) {
        this.promotePawn(to);
      }
    }
    
    this.lastMove = move;
    this.moveHistory.push(move);
    this.whiteToMove = !this.whiteToMove;
    
    if (this.whiteToMove) this.moveNumber++;
    
    this.drawBoard();
    this.updateStatus();
    this.checkGameEnd();
  }
  
  promotePawn(square) {
    const piece = this.boardSpaces[square];
    // Auto-promote to Queen (could add UI for choice)
    const queen = new Queen(piece.color, square);
    this.boardSpaces[square] = queen;
    
    if (piece.color === 'white') {
      this.whitePieces[square] = queen;
    } else {
      this.blackPieces[square] = queen;
    }
    
    this.showNotification(`${piece.color} pawn promoted to Queen!`);
  }
  
  checkGameEnd() {
    // Check for checkmate/stalemate
    const currentPlayerMoves = this.getAllPossibleMoves(this.whiteToMove ? 'white' : 'black');
    
    if (currentPlayerMoves.length === 0) {
      this.gameOver = true;
      clearInterval(this.timer);
      
      const winner = this.whiteToMove ? 'Black' : 'White';
      this.showNotification(`${winner} wins! Game Over.`);
      this.updateStatus(`${winner} wins!`);
    }
  }
  
  makeAIMove() {
    if (!this.vsAI || this.gameOver || this.aiThinking) return;
    
    const isAITurn = (this.whiteToMove && this.aiColor === 'white') || (!this.whiteToMove && this.aiColor === 'black');
    if (!isAITurn) return;
    
    this.aiThinking = true;
    this.showThinkingIndicator(true);
    
    // Add thinking delay for realism
    const thinkingTime = Math.max(500, Math.random() * 2000);
    
    setTimeout(() => {
      const bestMove = this.getBestMove();
      
      if (bestMove) {
        this.makeMove(bestMove.from, bestMove.to);
        this.showNotification(`AI moved: ${this.getSquareNotation(bestMove.from)} → ${this.getSquareNotation(bestMove.to)}`);
      }
      
      this.aiThinking = false;
      this.showThinkingIndicator(false);
    }, thinkingTime);
  }
  
  getBestMove() {
    const depth = this.getSearchDepth();
    const isMaximizing = this.aiColor === 'white';
    
    const allMoves = this.getAllPossibleMoves(this.aiColor);
    if (allMoves.length === 0) return null;
    
    let bestMove = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;
    
    // Shuffle moves for variety at same evaluation
    const shuffledMoves = this.shuffleArray([...allMoves]);
    
    for (const move of shuffledMoves) {
      const score = this.minimax(move, depth - 1, -Infinity, Infinity, !isMaximizing);
      
      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }
    
    return bestMove;
  }
  
  getSearchDepth() {
    const depths = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
    return depths[this.aiDifficulty] || 4;
  }
  
  minimax(move, depth, alpha, beta, isMaximizing) {
    // Make the move
    const originalPiece = this.boardSpaces[move.to];
    this.boardSpaces[move.to] = this.boardSpaces[move.from];
    this.boardSpaces[move.from] = null;
    
    let score;
    
    if (depth === 0 || this.isGameOver()) {
      score = this.evaluatePosition();
    } else {
      const color = isMaximizing ? 'white' : 'black';
      const moves = this.getAllPossibleMoves(color);
      
      if (moves.length === 0) {
        score = isMaximizing ? -20000 : 20000;
      } else {
        score = isMaximizing ? -Infinity : Infinity;
        
        for (const nextMove of moves) {
          const nextScore = this.minimax(nextMove, depth - 1, alpha, beta, !isMaximizing);
          
          if (isMaximizing) {
            score = Math.max(score, nextScore);
            alpha = Math.max(alpha, score);
          } else {
            score = Math.min(score, nextScore);
            beta = Math.min(beta, score);
          }
          
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
    }
    
    // Undo the move
    this.boardSpaces[move.from] = this.boardSpaces[move.to];
    this.boardSpaces[move.to] = originalPiece;
    
    return score;
  }
  
  evaluatePosition() {
    let score = 0;
    
    for (let square = 0; square < 64; square++) {
      const piece = this.boardSpaces[square];
      if (piece) {
        let pieceValue = this.pieceValues[piece.constructor.name];
        
        // Add positional bonuses
        pieceValue += this.getPositionalValue(piece, square);
        
        // Add to score (positive for white, negative for black)
        score += piece.color === 'white' ? pieceValue : -pieceValue;
      }
    }
    
    return score;
  }
  
  getPositionalValue(piece, square) {
    const pieceType = piece.constructor.name;
    let table;
    
    switch (pieceType) {
      case 'Pawn': table = this.pawnTable; break;
      case 'Knight': table = this.knightTable; break;
      case 'Bishop': table = this.bishopTable; break;
      case 'Rook': table = this.rookTable; break;
      case 'Queen': table = this.queenTable; break;
      case 'King': table = this.kingMiddleGameTable; break;
      default: return 0;
    }
    
    // Flip table for black pieces
    const index = piece.color === 'white' ? square : 63 - square;
    return table[index] || 0;
  }
  
  getAllPossibleMoves(color) {
    const moves = [];
    
    for (let square = 0; square < 64; square++) {
      const piece = this.boardSpaces[square];
      if (piece && piece.color === color) {
        const pieceMoves = this.getValidMoves(square);
        for (const targetSquare of pieceMoves) {
          moves.push({ from: square, to: targetSquare });
        }
      }
    }
    
    return moves;
  }
  
  isGameOver() {
    // Simple game over check - no legal moves
    const currentColor = this.whiteToMove ? 'white' : 'black';
    return this.getAllPossibleMoves(currentColor).length === 0;
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  showThinkingIndicator(show) {
    const indicator = document.getElementById('thinking-indicator');
    if (indicator) {
      indicator.style.display = show ? 'flex' : 'none';
    }
  }
  
  newGame() {
    this.boardSpaces = [];
    this.whitePieces = [];
    this.blackPieces = [];
    this.selectedSquare = null;
    this.validMoves = [];
    this.whiteToMove = true;
    this.gameOver = false;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.moveNumber = 0;
    this.gameTime = 0;
    this.lastMove = null;
    this.aiThinking = false;
    
    clearInterval(this.timer);
    this.initializeBoard();
    this.setupPieces();
    this.drawBoard();
    this.startTimer();
    this.updateStatus();
    this.showThinkingIndicator(false);
    
    // If AI plays white, make first move
    if (this.vsAI && this.aiColor === 'white') {
      setTimeout(() => this.makeAIMove(), 1000);
    }
  }
  
  undoMove() {
    if (this.moveHistory.length === 0) return;
    
    const lastMove = this.moveHistory.pop();
    
    // Move piece back
    const piece = this.boardSpaces[lastMove.to];
    this.boardSpaces[lastMove.from] = piece;
    this.boardSpaces[lastMove.to] = null;
    
    // Restore captured piece if any
    if (lastMove.captured) {
      // This is simplified - in a full implementation you'd need to track the actual captured piece
      // For now, just clear the square
    }
    
    this.whiteToMove = !this.whiteToMove;
    if (!this.whiteToMove) this.moveNumber--;
    
    this.deselect();
    this.updateStatus();
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      this.gameTime++;
      const minutes = Math.floor(this.gameTime / 60).toString().padStart(2, '0');
      const seconds = (this.gameTime % 60).toString().padStart(2, '0');
      
      const timerEl = document.getElementById('classic-timer');
      if (timerEl) {
        timerEl.textContent = `⏱️ ${minutes}:${seconds}`;
      }
    }, 1000);
  }
  
  updateStatus() {
    const statusEl = document.getElementById('classic-status');
    if (statusEl) {
      if (this.gameOver) {
        statusEl.textContent = 'Game Over';
      } else {
        statusEl.textContent = this.whiteToMove ? 'White to move' : 'Black to move';
      }
    }
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'chess-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Piece Classes
class Piece {
  constructor(color, square) {
    this.color = color;
    this.square = square;
    this.alive = true;
  }
  
  getSymbol() {
    return '?';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    return [];
  }
  
  isValidSquare(square) {
    return square >= 0 && square < 64;
  }
  
  isEmptySquare(square, boardSpaces) {
    return this.isValidSquare(square) && boardSpaces[square] === null;
  }
  
  isEnemyPiece(square, boardSpaces) {
    return this.isValidSquare(square) && 
           boardSpaces[square] !== null && 
           boardSpaces[square].color !== this.color;
  }
  
  canMoveTo(square, boardSpaces) {
    return this.isEmptySquare(square, boardSpaces) || this.isEnemyPiece(square, boardSpaces);
  }
}

class Pawn extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♙' : '♟';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const direction = this.color === 'white' ? -8 : 8; // White moves up (-8), black moves down (+8)
    const startRow = this.color === 'white' ? 6 : 1; // Starting rows (0-indexed from top)
    
    const currentRow = Math.floor(square / 8);
    
    // Forward move
    const oneForward = square + direction;
    if (this.isEmptySquare(oneForward, boardSpaces)) {
      moves.push(oneForward);
      
      // Double move from starting position
      if (currentRow === startRow) {
        const twoForward = square + (2 * direction);
        if (this.isEmptySquare(twoForward, boardSpaces)) {
          moves.push(twoForward);
        }
      }
    }
    
    // Diagonal captures
    const leftCapture = square + direction - 1;
    const rightCapture = square + direction + 1;
    
    // Check if captures are on the same rank and are enemy pieces
    if (Math.floor(leftCapture / 8) === Math.floor(oneForward / 8) && 
        this.isEnemyPiece(leftCapture, boardSpaces)) {
      moves.push(leftCapture);
    }
    
    if (Math.floor(rightCapture / 8) === Math.floor(oneForward / 8) && 
        this.isEnemyPiece(rightCapture, boardSpaces)) {
      moves.push(rightCapture);
    }
    
    return moves;
  }
}

class Rook extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♖' : '♜';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const directions = [-8, 8, -1, 1]; // up, down, left, right
    
    for (const direction of directions) {
      let currentSquare = square + direction;
      
      while (this.isValidSquare(currentSquare)) {
        // Check if we're still on the same rank for horizontal moves
        if (direction === -1 || direction === 1) {
          if (Math.floor(currentSquare / 8) !== Math.floor((currentSquare - direction) / 8)) {
            break;
          }
        }
        
        if (this.isEmptySquare(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
        } else if (this.isEnemyPiece(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
          break;
        } else {
          break; // Own piece blocking
        }
        
        currentSquare += direction;
      }
    }
    
    return moves;
  }
}

class Knight extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♘' : '♞';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const knightMoves = [-17, -15, -10, -6, 6, 10, 15, 17];
    
    const currentRow = Math.floor(square / 8);
    const currentCol = square % 8;
    
    for (const move of knightMoves) {
      const newSquare = square + move;
      const newRow = Math.floor(newSquare / 8);
      const newCol = newSquare % 8;
      
      // Check if the move is valid (within board and correct L-shape)
      if (this.isValidSquare(newSquare)) {
        const rowDiff = Math.abs(newRow - currentRow);
        const colDiff = Math.abs(newCol - currentCol);
        
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
          if (this.canMoveTo(newSquare, boardSpaces)) {
            moves.push(newSquare);
          }
        }
      }
    }
    
    return moves;
  }
}

class Bishop extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♗' : '♝';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const directions = [-9, -7, 7, 9]; // diagonal directions
    
    for (const direction of directions) {
      let currentSquare = square + direction;
      
      while (this.isValidSquare(currentSquare)) {
        const currentRow = Math.floor(currentSquare / 8);
        const prevRow = Math.floor((currentSquare - direction) / 8);
        
        // Check if we've wrapped around the board
        if (Math.abs(currentRow - prevRow) !== 1) {
          break;
        }
        
        if (this.isEmptySquare(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
        } else if (this.isEnemyPiece(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
          break;
        } else {
          break; // Own piece blocking
        }
        
        currentSquare += direction;
      }
    }
    
    return moves;
  }
}

class Queen extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♕' : '♛';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const directions = [-9, -8, -7, -1, 1, 7, 8, 9]; // all 8 directions
    
    for (const direction of directions) {
      let currentSquare = square + direction;
      
      while (this.isValidSquare(currentSquare)) {
        // Check for board wrapping
        const currentRow = Math.floor(currentSquare / 8);
        const prevRow = Math.floor((currentSquare - direction) / 8);
        
        if (direction === -1 || direction === 1) {
          // Horizontal moves
          if (currentRow !== prevRow) break;
        } else if (direction !== -8 && direction !== 8) {
          // Diagonal moves
          if (Math.abs(currentRow - prevRow) !== 1) break;
        }
        
        if (this.isEmptySquare(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
        } else if (this.isEnemyPiece(currentSquare, boardSpaces)) {
          moves.push(currentSquare);
          break;
        } else {
          break; // Own piece blocking
        }
        
        currentSquare += direction;
      }
    }
    
    return moves;
  }
}

class King extends Piece {
  getSymbol() {
    return this.color === 'white' ? '♔' : '♚';
  }
  
  getMoves(square, boardSpaces, rows, cols) {
    const moves = [];
    const directions = [-9, -8, -7, -1, 1, 7, 8, 9]; // all 8 directions, one square
    
    const currentRow = Math.floor(square / 8);
    
    for (const direction of directions) {
      const newSquare = square + direction;
      const newRow = Math.floor(newSquare / 8);
      
      if (this.isValidSquare(newSquare)) {
        // Check for board wrapping
        if (direction === -1 || direction === 1) {
          // Horizontal moves
          if (newRow !== currentRow) continue;
        } else if (direction !== -8 && direction !== 8) {
          // Diagonal moves
          if (Math.abs(newRow - currentRow) !== 1) continue;
        }
        
        if (this.canMoveTo(newSquare, boardSpaces)) {
          moves.push(newSquare);
        }
      }
    }
    
    return moves;
  }
}

// Global instance
let classicChess = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .classic-chess-container {
      max-width: 900px;
      margin: 20px auto;
      padding: 20px;
      background: #1e1e1e;
      border-radius: 12px;
      color: white;
    }
    
    .classic-chess-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .classic-chess-header h2 {
      color: #d4af37;
      margin-bottom: 10px;
    }
    
    .game-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #252525;
      padding: 10px 20px;
      border-radius: 8px;
    }
    
    .ai-controls {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #252525;
      border-radius: 8px;
      flex-wrap: wrap;
    }
    
    .ai-controls .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .ai-controls label {
      font-size: 14px;
      color: #e0e0e0;
    }
    
    .ai-controls select {
      padding: 5px 10px;
      background: #333;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .ai-controls input[type="checkbox"] {
      transform: scale(1.2);
    }
    
    .classic-board {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      grid-template-rows: repeat(8, 60px);
      gap: 0;
      margin: 20px auto;
      border: 4px solid #333;
      border-radius: 4px;
      width: fit-content;
    }
    
    .classic-square {
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .classic-square.light {
      background-color: #f0d9b5;
    }
    
    .classic-square.dark {
      background-color: #b58863;
    }
    
    .classic-square.selected {
      box-shadow: inset 0 0 0 3px #d4af37;
      animation: selectedPulse 1s infinite;
    }
    
    @keyframes selectedPulse {
      0%, 100% { box-shadow: inset 0 0 0 3px #d4af37; }
      50% { box-shadow: inset 0 0 0 5px #d4af37; }
    }
    
    .classic-square.valid-move::after {
      content: '';
      width: 20px;
      height: 20px;
      background: rgba(0, 255, 0, 0.6);
      border-radius: 50%;
      position: absolute;
      animation: validMovePulse 1s infinite alternate;
    }
    
    @keyframes validMovePulse {
      0% { opacity: 0.6; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.2); }
    }
    
    .classic-square.capture::after {
      background: rgba(255, 0, 0, 0.7);
      width: 50px;
      height: 50px;
      border-radius: 10%;
      border: 2px solid rgba(255, 255, 255, 0.8);
    }
    
    .classic-square.last-move {
      background-color: rgba(212, 175, 55, 0.4) !important;
      box-shadow: inset 0 0 0 2px rgba(212, 175, 55, 0.8);
    }
    
    .chess-piece {
      font-size: 40px;
      user-select: none;
      filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
      z-index: 1;
      transition: transform 0.2s ease;
    }
    
    .chess-piece:hover {
      transform: scale(1.1);
    }
    
    .chess-piece.white-piece {
      color: #ffffff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .chess-piece.black-piece {
      color: #2c2c2c;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
    }
    
    .square-coord {
      position: absolute;
      bottom: 2px;
      right: 2px;
      font-size: 8px;
      color: rgba(0, 0, 0, 0.4);
      font-weight: bold;
      z-index: 0;
    }
    
    .classic-controls {
      text-align: center;
      margin-top: 20px;
    }
    
    .classic-controls button {
      margin: 0 10px;
      padding: 10px 20px;
      background: #333;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .classic-controls button:hover {
      background: #444;
      transform: translateY(-2px);
    }
    
    .thinking-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 15px;
      padding: 10px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid #d4af37;
      border-radius: 8px;
      color: #d4af37;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid #d4af37;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .chess-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e1e1e;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      border-left: 4px solid #d4af37;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @media (max-width: 768px) {
      .classic-board {
        grid-template-columns: repeat(8, 45px);
        grid-template-rows: repeat(8, 45px);
      }
      
      .classic-square {
        width: 45px;
        height: 45px;
      }
      
      .chess-piece {
        font-size: 30px;
      }
      
      .ai-controls {
        flex-direction: column;
        gap: 10px;
      }
    }
  `;
  document.head.appendChild(style);
});

// Function to start classic chess
function startClassicChess() {
  // Hide main game
  const mainContainer = document.getElementById('mainGameContainer');
  if (mainContainer) {
    mainContainer.style.display = 'none';
  }
  
  // Create classic chess container
  let container = document.getElementById('classic-chess-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'classic-chess-container';
    container.className = 'classic-chess-container';
    document.body.appendChild(container);
  }
  
  // Initialize game
  classicChess = new ChessGame();
  classicChess.createBoard();
}