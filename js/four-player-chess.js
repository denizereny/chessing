// 4 Player Chess Game - Dört Kişilik Satranç
// Her oyuncu bir köşeden başlar: Beyaz (alt), Siyah (üst), Kırmızı (sol), Mavi (sağ)

class FourPlayerChess {
  constructor() {
    this.board = [];
    this.selectedSquare = null;
    this.validMoves = [];
    this.currentPlayer = 0; // 0: White, 1: Black, 2: Red, 3: Blue
    this.gameOver = false;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [], red: [], blue: [] };
    this.moveNumber = 0;
    this.gameTime = 0;
    this.timer = null;
    this.lastMove = null;
    this.players = ['white', 'black', 'red', 'blue'];
    this.playerNames = ['White', 'Black', 'Red', 'Blue'];
    this.playerColors = ['#ffffff', '#2c2c2c', '#dc3545', '#007bff'];
    this.eliminatedPlayers = [];
    
    // 14x14 board for 4 player chess
    this.boardSize = 14;
    this.boardSpaces = [];
    
    // Player starting positions (corners)
    this.startingPositions = {
      white: { corner: 'bottom-left', startRow: 11, startCol: 0 },
      black: { corner: 'top-right', startRow: 2, startCol: 13 },
      red: { corner: 'top-left', startRow: 0, startCol: 2 },
      blue: { corner: 'bottom-right', startRow: 13, startCol: 11 }
    };
    
    this.initializeBoard();
    this.setupPieces();
  }
  
  initializeBoard() {
    // Create 14x14 board (196 squares)
    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      this.boardSpaces.push(null);
    }
  }
  
  setupPieces() {
    // White pieces (bottom-left corner)
    this.setupPlayerPieces('white', 11, 0);
    
    // Black pieces (top-right corner) 
    this.setupPlayerPieces('black', 2, 13);
    
    // Red pieces (top-left corner)
    this.setupPlayerPieces('red', 0, 2);
    
    // Blue pieces (bottom-right corner)
    this.setupPlayerPieces('blue', 13, 11);
  }
  
  setupPlayerPieces(color, startRow, startCol) {
    // Determine piece layout based on corner
    let pieceLayout, pawnRow, pawnCol;
    
    if (color === 'white') {
      // Bottom-left: pieces face up and right
      pieceLayout = [
        ['R', 'N', 'B'],
        ['Q', 'K', 'B'], 
        ['N', 'R', null]
      ];
      pawnRow = startRow - 1;
      pawnCol = startCol;
    } else if (color === 'black') {
      // Top-right: pieces face down and left
      pieceLayout = [
        [null, 'r', 'n'],
        ['b', 'k', 'q'],
        ['b', 'n', 'r']
      ];
      pawnRow = startRow + 1;
      pawnCol = startCol - 2;
    } else if (color === 'red') {
      // Top-left: pieces face down and right
      pieceLayout = [
        ['r', 'n', 'b'],
        ['q', 'k', 'b'],
        ['n', 'r', null]
      ];
      pawnRow = startRow + 1;
      pawnCol = startCol;
    } else { // blue
      // Bottom-right: pieces face up and left
      pieceLayout = [
        [null, 'r', 'n'],
        ['b', 'k', 'q'],
        ['b', 'n', 'r']
      ];
      pawnRow = startRow - 1;
      pawnCol = startCol - 2;
    }
    
    // Place main pieces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const piece = pieceLayout[row][col];
        if (piece) {
          const square = this.getSquareIndex(startRow + row, startCol + col);
          this.boardSpaces[square] = this.createPiece(piece, color, square);
        }
      }
    }
    
    // Place pawns
    const pawnPositions = this.getPawnPositions(color, pawnRow, pawnCol);
    pawnPositions.forEach(pos => {
      const square = this.getSquareIndex(pos.row, pos.col);
      if (this.isValidSquare(pos.row, pos.col)) {
        this.boardSpaces[square] = this.createPiece('p', color, square);
      }
    });
  }
  
  getPawnPositions(color, pawnRow, pawnCol) {
    const positions = [];
    
    if (color === 'white') {
      // 5 pawns in L shape
      for (let i = 0; i < 3; i++) {
        positions.push({ row: pawnRow, col: pawnCol + i });
      }
      positions.push({ row: pawnRow - 1, col: pawnCol });
      positions.push({ row: pawnRow - 2, col: pawnCol });
    } else if (color === 'black') {
      // 5 pawns in L shape
      for (let i = 0; i < 3; i++) {
        positions.push({ row: pawnRow, col: pawnCol + i });
      }
      positions.push({ row: pawnRow + 1, col: pawnCol + 2 });
      positions.push({ row: pawnRow + 2, col: pawnCol + 2 });
    } else if (color === 'red') {
      // 5 pawns in L shape
      for (let i = 0; i < 3; i++) {
        positions.push({ row: pawnRow, col: pawnCol + i });
      }
      positions.push({ row: pawnRow + 1, col: pawnCol + 2 });
      positions.push({ row: pawnRow + 2, col: pawnCol + 2 });
    } else { // blue
      // 5 pawns in L shape
      for (let i = 0; i < 3; i++) {
        positions.push({ row: pawnRow, col: pawnCol + i });
      }
      positions.push({ row: pawnRow - 1, col: pawnCol });
      positions.push({ row: pawnRow - 2, col: pawnCol });
    }
    
    return positions;
  }
  
  createPiece(type, color, square) {
    const pieceType = type.toLowerCase();
    
    switch (pieceType) {
      case 'p': return new FourPlayerPawn(color, square);
      case 'r': return new FourPlayerRook(color, square);
      case 'n': return new FourPlayerKnight(color, square);
      case 'b': return new FourPlayerBishop(color, square);
      case 'q': return new FourPlayerQueen(color, square);
      case 'k': return new FourPlayerKing(color, square);
      default: return null;
    }
  }
  
  getSquareIndex(row, col) {
    return row * this.boardSize + col;
  }
  
  getRowCol(square) {
    return {
      row: Math.floor(square / this.boardSize),
      col: square % this.boardSize
    };
  }
  
  isValidSquare(row, col) {
    if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
      return false;
    }
    
    // Check if square is in playable area (not in corners)
    const corners = [
      // Top-left dead zone
      { minRow: 0, maxRow: 2, minCol: 0, maxCol: 1 },
      { minRow: 0, maxRow: 1, minCol: 2, maxCol: 4 },
      
      // Top-right dead zone  
      { minRow: 0, maxRow: 1, minCol: 9, maxCol: 11 },
      { minRow: 0, maxRow: 2, minCol: 12, maxCol: 13 },
      
      // Bottom-left dead zone
      { minRow: 11, maxRow: 13, minCol: 0, maxCol: 1 },
      { minRow: 12, maxRow: 13, minCol: 2, maxCol: 4 },
      
      // Bottom-right dead zone
      { minRow: 12, maxRow: 13, minCol: 9, maxCol: 11 },
      { minRow: 11, maxRow: 13, minCol: 12, maxCol: 13 }
    ];
    
    // Check if in any dead zone
    for (const corner of corners) {
      if (row >= corner.minRow && row <= corner.maxRow && 
          col >= corner.minCol && col <= corner.maxCol) {
        return false;
      }
    }
    
    return true;
  }
  
  createBoard() {
    const container = document.getElementById('four-player-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="four-player-header">
        <h2>👑 4 Player Chess 👑</h2>
        <div class="game-info">
          <span id="four-player-status">${this.playerNames[this.currentPlayer]}'s turn</span>
          <span id="four-player-timer">⏱️ 00:00</span>
        </div>
      </div>
      
      <div class="players-info">
        <div class="player-info" data-player="0">
          <div class="player-indicator white"></div>
          <span>White</span>
          <div class="captured-count">0</div>
        </div>
        <div class="player-info" data-player="1">
          <div class="player-indicator black"></div>
          <span>Black</span>
          <div class="captured-count">0</div>
        </div>
        <div class="player-info" data-player="2">
          <div class="player-indicator red"></div>
          <span>Red</span>
          <div class="captured-count">0</div>
        </div>
        <div class="player-info" data-player="3">
          <div class="player-indicator blue"></div>
          <span>Blue</span>
          <div class="captured-count">0</div>
        </div>
      </div>
      
      <div class="four-player-board" id="four-player-board"></div>
      
      <div class="four-player-controls">
        <button onclick="fourPlayerChess.newGame()">🔄 New Game</button>
        <button onclick="fourPlayerChess.undoMove()">↩️ Undo</button>
        <button onclick="window.location.reload()">🏠 Back to Menu</button>
      </div>
    `;
    
    this.drawBoard();
    this.startTimer();
    this.updatePlayerIndicators();
  }
  
  drawBoard() {
    const boardEl = document.getElementById('four-player-board');
    if (!boardEl) return;
    
    boardEl.innerHTML = '';
    
    for (let square = 0; square < this.boardSize * this.boardSize; square++) {
      const { row, col } = this.getRowCol(square);
      
      if (!this.isValidSquare(row, col)) {
        // Dead zone - don't create square
        continue;
      }
      
      const squareEl = document.createElement('div');
      squareEl.className = 'four-player-square';
      squareEl.dataset.square = square;
      
      // Determine square color
      squareEl.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      
      // Add piece if present
      const piece = this.boardSpaces[square];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'four-player-piece';
        pieceEl.classList.add(`${piece.color}-piece`);
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
  
  onSquareClick(square) {
    if (this.gameOver) return;
    
    // If a square is selected and this is a valid move
    if (this.selectedSquare !== null && this.validMoves.includes(square)) {
      this.makeMove(this.selectedSquare, square);
      this.deselect();
      return;
    }
    
    // Select piece if it belongs to current player
    const piece = this.boardSpaces[square];
    if (piece && piece.color === this.players[this.currentPlayer]) {
      this.selectSquare(square);
    } else {
      this.deselect();
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
    
    return piece.getMoves(square, this.boardSpaces, this);
  }
  
  makeMove(from, to) {
    const piece = this.boardSpaces[from];
    const capturedPiece = this.boardSpaces[to];
    
    // Handle capture
    if (capturedPiece) {
      this.capturedPieces[piece.color].push(capturedPiece);
      
      // Check if king was captured (player elimination)
      if (capturedPiece.constructor.name === 'FourPlayerKing') {
        this.eliminatePlayer(capturedPiece.color);
      }
    }
    
    // Move piece
    this.boardSpaces[to] = piece;
    this.boardSpaces[from] = null;
    
    // Record move
    const move = {
      from,
      to,
      piece: piece.constructor.name,
      captured: capturedPiece ? capturedPiece.constructor.name : null,
      player: this.players[this.currentPlayer]
    };
    
    this.lastMove = move;
    this.moveHistory.push(move);
    this.moveNumber++;
    
    // Next player's turn
    this.nextPlayer();
    
    this.drawBoard();
    this.updatePlayerIndicators();
    this.updateCapturedCounts();
    this.checkGameEnd();
  }
  
  nextPlayer() {
    do {
      this.currentPlayer = (this.currentPlayer + 1) % 4;
    } while (this.eliminatedPlayers.includes(this.currentPlayer));
  }
  
  eliminatePlayer(color) {
    const playerIndex = this.players.indexOf(color);
    if (playerIndex !== -1 && !this.eliminatedPlayers.includes(playerIndex)) {
      this.eliminatedPlayers.push(playerIndex);
      this.showNotification(`${this.playerNames[playerIndex]} has been eliminated!`);
      
      // Remove all pieces of eliminated player
      for (let i = 0; i < this.boardSpaces.length; i++) {
        const piece = this.boardSpaces[i];
        if (piece && piece.color === color) {
          this.boardSpaces[i] = null;
        }
      }
    }
  }
  
  checkGameEnd() {
    const activePlayers = 4 - this.eliminatedPlayers.length;
    
    if (activePlayers <= 1) {
      this.gameOver = true;
      clearInterval(this.timer);
      
      if (activePlayers === 1) {
        const winnerIndex = [0, 1, 2, 3].find(i => !this.eliminatedPlayers.includes(i));
        this.showNotification(`🏆 ${this.playerNames[winnerIndex]} wins the game!`);
      } else {
        this.showNotification(`Game Over - Draw!`);
      }
    }
  }
  
  updatePlayerIndicators() {
    const playerInfos = document.querySelectorAll('.player-info');
    playerInfos.forEach((info, index) => {
      info.classList.remove('active', 'eliminated');
      
      if (this.eliminatedPlayers.includes(index)) {
        info.classList.add('eliminated');
      } else if (index === this.currentPlayer) {
        info.classList.add('active');
      }
    });
    
    const statusEl = document.getElementById('four-player-status');
    if (statusEl) {
      if (this.gameOver) {
        statusEl.textContent = 'Game Over';
      } else {
        statusEl.textContent = `${this.playerNames[this.currentPlayer]}'s turn`;
      }
    }
  }
  
  updateCapturedCounts() {
    const counts = document.querySelectorAll('.captured-count');
    counts.forEach((count, index) => {
      const playerColor = this.players[index];
      count.textContent = this.capturedPieces[playerColor].length;
    });
  }
  
  newGame() {
    this.boardSpaces = [];
    this.selectedSquare = null;
    this.validMoves = [];
    this.currentPlayer = 0;
    this.gameOver = false;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [], red: [], blue: [] };
    this.moveNumber = 0;
    this.gameTime = 0;
    this.lastMove = null;
    this.eliminatedPlayers = [];
    
    clearInterval(this.timer);
    this.initializeBoard();
    this.setupPieces();
    this.drawBoard();
    this.startTimer();
    this.updatePlayerIndicators();
    this.updateCapturedCounts();
  }
  
  undoMove() {
    if (this.moveHistory.length === 0) return;
    
    // Simple undo - just go back one move
    // In a full implementation, you'd need to restore the exact board state
    this.showNotification("Undo not fully implemented in this demo");
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      this.gameTime++;
      const minutes = Math.floor(this.gameTime / 60).toString().padStart(2, '0');
      const seconds = (this.gameTime % 60).toString().padStart(2, '0');
      
      const timerEl = document.getElementById('four-player-timer');
      if (timerEl) {
        timerEl.textContent = `⏱️ ${minutes}:${seconds}`;
      }
    }, 1000);
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'four-player-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Base Piece Class for 4 Player Chess
class FourPlayerPiece {
  constructor(color, square) {
    this.color = color;
    this.square = square;
  }
  
  getSymbol() {
    return '?';
  }
  
  getMoves(square, boardSpaces, game) {
    return [];
  }
  
  isValidSquare(row, col, game) {
    return game.isValidSquare(row, col);
  }
  
  isEmptySquare(square, boardSpaces) {
    return boardSpaces[square] === null;
  }
  
  isEnemyPiece(square, boardSpaces) {
    return boardSpaces[square] !== null && boardSpaces[square].color !== this.color;
  }
  
  canMoveTo(square, boardSpaces) {
    return this.isEmptySquare(square, boardSpaces) || this.isEnemyPiece(square, boardSpaces);
  }
}

// 4 Player Piece Classes
class FourPlayerPawn extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♙', black: '♟', red: '♙', blue: '♙' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    
    // Pawn direction depends on player color and position
    const directions = this.getPawnDirections(this.color);
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        
        // Forward move
        if (dRow !== 0 || dCol !== 0) {
          if (this.isEmptySquare(newSquare, boardSpaces)) {
            moves.push(newSquare);
          }
        }
        
        // Diagonal capture
        if (Math.abs(dRow) === 1 && Math.abs(dCol) === 1) {
          if (this.isEnemyPiece(newSquare, boardSpaces)) {
            moves.push(newSquare);
          }
        }
      }
    }
    
    return moves;
  }
  
  getPawnDirections(color) {
    switch (color) {
      case 'white': return [[-1, 0], [-1, -1], [-1, 1]]; // Up
      case 'black': return [[1, 0], [1, -1], [1, 1]]; // Down  
      case 'red': return [[0, 1], [-1, 1], [1, 1]]; // Right
      case 'blue': return [[0, -1], [-1, -1], [1, -1]]; // Left
      default: return [];
    }
  }
}

class FourPlayerRook extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♖', black: '♜', red: '♖', blue: '♖' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Right, Left, Down, Up
    
    for (const [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;
      
      while (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        
        if (this.isEmptySquare(newSquare, boardSpaces)) {
          moves.push(newSquare);
        } else if (this.isEnemyPiece(newSquare, boardSpaces)) {
          moves.push(newSquare);
          break;
        } else {
          break;
        }
        
        newRow += dRow;
        newCol += dCol;
      }
    }
    
    return moves;
  }
}

class FourPlayerKnight extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♘', black: '♞', red: '♘', blue: '♘' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dRow, dCol] of knightMoves) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        if (this.canMoveTo(newSquare, boardSpaces)) {
          moves.push(newSquare);
        }
      }
    }
    
    return moves;
  }
}

class FourPlayerBishop extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♗', black: '♝', red: '♗', blue: '♗' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // Diagonals
    
    for (const [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;
      
      while (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        
        if (this.isEmptySquare(newSquare, boardSpaces)) {
          moves.push(newSquare);
        } else if (this.isEnemyPiece(newSquare, boardSpaces)) {
          moves.push(newSquare);
          break;
        } else {
          break;
        }
        
        newRow += dRow;
        newCol += dCol;
      }
    }
    
    return moves;
  }
}

class FourPlayerQueen extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♕', black: '♛', red: '♕', blue: '♕' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0], // Rook moves
      [1, 1], [1, -1], [-1, 1], [-1, -1] // Bishop moves
    ];
    
    for (const [dRow, dCol] of directions) {
      let newRow = row + dRow;
      let newCol = col + dCol;
      
      while (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        
        if (this.isEmptySquare(newSquare, boardSpaces)) {
          moves.push(newSquare);
        } else if (this.isEnemyPiece(newSquare, boardSpaces)) {
          moves.push(newSquare);
          break;
        } else {
          break;
        }
        
        newRow += dRow;
        newCol += dCol;
      }
    }
    
    return moves;
  }
}

class FourPlayerKing extends FourPlayerPiece {
  getSymbol() {
    const symbols = { white: '♔', black: '♚', red: '♔', blue: '♔' };
    return symbols[this.color];
  }
  
  getMoves(square, boardSpaces, game) {
    const moves = [];
    const { row, col } = game.getRowCol(square);
    const directions = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    
    for (const [dRow, dCol] of directions) {
      const newRow = row + dRow;
      const newCol = col + dCol;
      
      if (this.isValidSquare(newRow, newCol, game)) {
        const newSquare = game.getSquareIndex(newRow, newCol);
        if (this.canMoveTo(newSquare, boardSpaces)) {
          moves.push(newSquare);
        }
      }
    }
    
    return moves;
  }
}

// Global instance
let fourPlayerChess = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .four-player-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
      background: #1e1e1e;
      border-radius: 12px;
      color: white;
    }
    
    .four-player-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .four-player-header h2 {
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
    
    .players-info {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
      padding: 15px;
      background: #252525;
      border-radius: 8px;
    }
    
    .player-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.3s ease;
    }
    
    .player-info.active {
      background: rgba(212, 175, 55, 0.2);
      border: 2px solid #d4af37;
    }
    
    .player-info.eliminated {
      opacity: 0.5;
      text-decoration: line-through;
    }
    
    .player-indicator {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #333;
    }
    
    .player-indicator.white { background: #ffffff; }
    .player-indicator.black { background: #2c2c2c; }
    .player-indicator.red { background: #dc3545; }
    .player-indicator.blue { background: #007bff; }
    
    .captured-count {
      background: #333;
      color: #d4af37;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .four-player-board {
      display: grid;
      grid-template-columns: repeat(14, 35px);
      grid-template-rows: repeat(14, 35px);
      gap: 1px;
      margin: 20px auto;
      border: 4px solid #333;
      border-radius: 8px;
      width: fit-content;
      background: #333;
    }
    
    .four-player-square {
      width: 35px;
      height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .four-player-square.light {
      background-color: #f0d9b5;
    }
    
    .four-player-square.dark {
      background-color: #b58863;
    }
    
    .four-player-square.selected {
      box-shadow: inset 0 0 0 3px #d4af37;
      animation: selectedPulse 1s infinite;
    }
    
    @keyframes selectedPulse {
      0%, 100% { box-shadow: inset 0 0 0 3px #d4af37; }
      50% { box-shadow: inset 0 0 0 5px #d4af37; }
    }
    
    .four-player-square.valid-move::after {
      content: '';
      width: 12px;
      height: 12px;
      background: rgba(0, 255, 0, 0.7);
      border-radius: 50%;
      position: absolute;
      animation: validMovePulse 1s infinite alternate;
    }
    
    @keyframes validMovePulse {
      0% { opacity: 0.7; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.2); }
    }
    
    .four-player-square.capture::after {
      background: rgba(255, 0, 0, 0.8);
      width: 28px;
      height: 28px;
      border-radius: 10%;
      border: 2px solid rgba(255, 255, 255, 0.8);
    }
    
    .four-player-square.last-move {
      background-color: rgba(212, 175, 55, 0.4) !important;
      box-shadow: inset 0 0 0 2px rgba(212, 175, 55, 0.8);
    }
    
    .four-player-piece {
      font-size: 24px;
      user-select: none;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
      z-index: 1;
      transition: transform 0.2s ease;
    }
    
    .four-player-piece:hover {
      transform: scale(1.1);
    }
    
    .four-player-piece.white-piece {
      color: #ffffff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }
    
    .four-player-piece.black-piece {
      color: #2c2c2c;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
    }
    
    .four-player-piece.red-piece {
      color: #dc3545;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .four-player-piece.blue-piece {
      color: #007bff;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    .four-player-controls {
      text-align: center;
      margin-top: 20px;
    }
    
    .four-player-controls button {
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
    
    .four-player-controls button:hover {
      background: #444;
      transform: translateY(-2px);
    }
    
    .four-player-notification {
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
      .four-player-board {
        grid-template-columns: repeat(14, 25px);
        grid-template-rows: repeat(14, 25px);
      }
      
      .four-player-square {
        width: 25px;
        height: 25px;
      }
      
      .four-player-piece {
        font-size: 18px;
      }
      
      .players-info {
        flex-wrap: wrap;
        gap: 10px;
      }
    }
  `;
  document.head.appendChild(style);
});

// Function to start 4 player chess
function startFourPlayerChess() {
  // Hide main game
  const mainContainer = document.getElementById('mainGameContainer');
  if (mainContainer) {
    mainContainer.style.display = 'none';
  }
  
  // Hide classic chess if active
  const classicContainer = document.getElementById('classic-chess-container');
  if (classicContainer) {
    classicContainer.style.display = 'none';
  }
  
  // Create 4 player chess container
  let container = document.getElementById('four-player-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'four-player-container';
    container.className = 'four-player-container';
    document.body.appendChild(container);
  }
  
  // Initialize game
  fourPlayerChess = new FourPlayerChess();
  fourPlayerChess.createBoard();
}