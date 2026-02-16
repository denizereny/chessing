/**
 * Chess API Client
 * Handles all communication with the Flask Chess Backend
 */

class ChessAPIClient {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.sessionId = null;
    this.isConnected = false;
  }

  /**
   * Check if backend is available
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        return { success: true, data };
      }
      
      this.isConnected = false;
      return { success: false, error: 'Backend not available' };
    } catch (error) {
      this.isConnected = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new game
   * @param {number} aiDifficulty - AI difficulty level (1-4)
   * @param {string} playerColor - Player color ('white' or 'black')
   * @param {Array} customPosition - Optional custom board position
   */
  async createGame(aiDifficulty = 2, playerColor = 'white', customPosition = null) {
    try {
      const body = {
        ai_difficulty: aiDifficulty,
        player_color: playerColor
      };
      
      if (customPosition) {
        body.custom_position = customPosition;
      }

      const response = await fetch(`${this.baseURL}/game/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to create game' };
      }

      const data = await response.json();
      this.sessionId = data.session_id;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Make a move
   * @param {Array} fromPosition - Starting position [row, col]
   * @param {Array} toPosition - Target position [row, col]
   */
  async makeMove(fromPosition, toPosition) {
    if (!this.sessionId) {
      return { success: false, error: 'No active game session' };
    }

    try {
      const response = await fetch(`${this.baseURL}/game/${this.sessionId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_position: fromPosition,
          to_position: toPosition
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Invalid move' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Request AI move
   */
  async requestAIMove() {
    if (!this.sessionId) {
      return { success: false, error: 'No active game session' };
    }

    try {
      const response = await fetch(`${this.baseURL}/game/${this.sessionId}/ai-move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'AI move failed' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current game state
   */
  async getGameState() {
    if (!this.sessionId) {
      return { success: false, error: 'No active game session' };
    }

    try {
      const response = await fetch(`${this.baseURL}/game/${this.sessionId}/state`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to get game state' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get performance metrics
   */
  async getMetrics() {
    try {
      const response = await fetch(`${this.baseURL}/metrics`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        return { success: false, error: 'Failed to get metrics' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.sessionId = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessAPIClient;
}
