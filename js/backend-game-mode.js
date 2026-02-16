/**
 * Backend Game Mode
 * Integrates the frontend with Flask Chess Backend API
 */

class BackendGameMode {
  constructor() {
    this.apiClient = new ChessAPIClient();
    this.enabled = false;
    this.loading = false;
  }

  /**
   * Initialize backend mode
   */
  async initialize() {
    const health = await this.apiClient.checkHealth();
    
    if (health.success) {
      this.enabled = true;
      console.log('✅ Backend connected:', health.data);
      return true;
    } else {
      this.enabled = false;
      console.warn('⚠️ Backend not available:', health.error);
      return false;
    }
  }

  /**
   * Start a new game with backend
   */
  async startNewGame(aiDifficulty, playerColor, customPosition = null) {
    if (!this.enabled) {
      return { success: false, error: 'Backend not available' };
    }

    this.loading = true;
    this.showLoadingIndicator('Creating game...');

    const result = await this.apiClient.createGame(aiDifficulty, playerColor, customPosition);
    
    this.loading = false;
    this.hideLoadingIndicator();

    if (result.success) {
      console.log('✅ Game created:', result.data.session_id);
      return result;
    } else {
      console.error('❌ Failed to create game:', result.error);
      this.showError(result.error);
      return result;
    }
  }

  /**
   * Make a move using backend validation
   */
  async makeMove(fromRow, fromCol, toRow, toCol) {
    if (!this.enabled) {
      return { success: false, error: 'Backend not available' };
    }

    this.loading = true;
    this.showLoadingIndicator('Processing move...');

    const result = await this.apiClient.makeMove([fromRow, fromCol], [toRow, toCol]);
    
    this.loading = false;
    this.hideLoadingIndicator();

    if (result.success) {
      console.log('✅ Move successful');
      return result;
    } else {
      console.error('❌ Move failed:', result.error);
      this.showError(result.error);
      return result;
    }
  }

  /**
   * Request AI move from backend
   */
  async requestAIMove() {
    if (!this.enabled) {
      return { success: false, error: 'Backend not available' };
    }

    this.loading = true;
    this.showLoadingIndicator('AI thinking...');

    const result = await this.apiClient.requestAIMove();
    
    this.loading = false;
    this.hideLoadingIndicator();

    if (result.success) {
      console.log('✅ AI move received');
      return result;
    } else {
      console.error('❌ AI move failed:', result.error);
      this.showError(result.error);
      return result;
    }
  }

  /**
   * Get current game state from backend
   */
  async getGameState() {
    if (!this.enabled) {
      return { success: false, error: 'Backend not available' };
    }

    const result = await this.apiClient.getGameState();
    
    if (result.success) {
      return result;
    } else {
      console.error('❌ Failed to get game state:', result.error);
      return result;
    }
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator(message = 'Loading...') {
    let indicator = document.getElementById('backendLoadingIndicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'backendLoadingIndicator';
      indicator.className = 'backend-loading-indicator';
      document.body.appendChild(indicator);
    }

    indicator.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `;
    indicator.style.display = 'flex';
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const indicator = document.getElementById('backendLoadingIndicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (typeof bildirimGoster === 'function') {
      bildirimGoster(`❌ ${message}`, 'error');
    } else {
      alert(`Error: ${message}`);
    }
  }

  /**
   * Update board from backend state
   */
  updateBoardFromBackend(boardState) {
    // Convert backend board format to frontend format
    // Backend uses lowercase for black, uppercase for white
    // Frontend uses the same format
    return boardState.map(row => [...row]);
  }

  /**
   * Convert frontend position to backend format
   */
  positionToBackend(row, col) {
    return [row, col];
  }

  /**
   * Convert backend position to frontend format
   */
  positionFromBackend(position) {
    return { sat: position[0], sut: position[1] };
  }

  /**
   * Show backend status indicator
   */
  showStatusIndicator() {
    let indicator = document.getElementById('backendStatusIndicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'backendStatusIndicator';
      indicator.className = 'backend-status-indicator';
      
      // Add to settings panel or create floating indicator
      const settingsPanel = document.getElementById('settingsPanel');
      if (settingsPanel) {
        settingsPanel.insertBefore(indicator, settingsPanel.firstChild);
      } else {
        document.body.appendChild(indicator);
      }
    }

    const statusClass = this.enabled ? 'connected' : 'disconnected';
    const statusText = this.enabled ? `🟢 ${t('backendConnected')}` : `🔴🔴 ${t('backendOffline')}`;
    const modeText = this.enabled ? t('usingFlaskBackend') : t('usingLocalMode');

    indicator.innerHTML = `
      <div class="status-badge ${statusClass}">
        <span class="status-icon">${this.enabled ? '🟢' : '🔴🔴'}</span>
        <span class="status-text">${statusText}</span>
      </div>
      <div class="mode-text">${modeText}</div>
    `;
  }

  /**
   * Toggle backend mode on/off
   */
  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      this.apiClient.clearSession();
      this.showStatusIndicator();
      return false;
    } else {
      const connected = await this.initialize();
      this.showStatusIndicator();
      return connected;
    }
  }
}

// Global instance
let backendGameMode = null;

/**
 * Initialize backend game mode
 */
async function initBackendMode() {
  if (!backendGameMode) {
    backendGameMode = new BackendGameMode();
    await backendGameMode.initialize();
    backendGameMode.showStatusIndicator();
  }
  return backendGameMode;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackendGameMode, initBackendMode };
}
