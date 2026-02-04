/**
 * Position History Interface for Enhanced Piece Setup
 * 
 * Creates a comprehensive user interface for the position history system including:
 * - Undo/Redo buttons and keyboard shortcuts
 * - Position history list display with thumbnails
 * - Position preview functionality
 * - History clearing functionality with confirmation
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5
 * Task: 6.2 Geçmiş arayüzü oluştur
 */

class PositionHistoryInterface {
  constructor(historyManager, translations = {}) {
    this.historyManager = historyManager;
    this.translations = translations;
    
    // UI state
    this.isHistoryPanelVisible = false;
    this.selectedHistoryIndex = -1;
    
    // DOM elements
    this.historyPanel = null;
    this.undoButton = null;
    this.redoButton = null;
    this.historyList = null;
    this.clearHistoryButton = null;
    
    // Event handlers
    this.boundKeyboardHandler = this.handleKeyboardShortcuts.bind(this);
    this.boundHistoryChangeHandler = this.handleHistoryChange.bind(this);
    
    // Initialize interface
    this.initialize();
  }
  
  /**
   * Initialize the history interface
   */
  initialize() {
    console.log('🕰️ Initializing Position History Interface...');
    
    // Create history interface elements
    this.createHistoryInterface();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Listen to history manager events
    this.setupHistoryManagerListeners();
    
    // Initial UI update
    this.updateInterface();
    
    console.log('✨ Position History Interface initialized successfully');
  }
  
  /**
   * Create the history interface UI elements
   */
  createHistoryInterface() {
    // Find or create history panel container
    this.historyPanel = this.findOrCreateHistoryPanel();
    
    // Create undo/redo controls
    this.createUndoRedoControls();
    
    // Create history list
    this.createHistoryList();
    
    // Create history management controls
    this.createHistoryControls();
    
    // Apply styling
    this.applyHistoryInterfaceStyles();
  }
  
  /**
   * Find existing history panel or create new one
   */
  findOrCreateHistoryPanel() {
    // Look for existing history panel in piece setup modal
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) {
      console.error('Piece setup modal not found!');
      return null;
    }
    
    // Check if history panel already exists
    let panel = modal.querySelector('.position-history-panel');
    if (panel) {
      return panel;
    }
    
    // Create new history panel
    panel = document.createElement('div');
    panel.className = 'position-history-panel';
    panel.innerHTML = `
      <div class="history-panel-header">
        <h4 class="history-panel-title">
          <span class="history-icon">🕰️</span>
          <span class="history-title-text">${this.t('positionHistory')}</span>
        </h4>
        <button class="history-toggle-btn" title="${this.t('toggleHistory')}">
          <span class="chevron">▾</span>
        </button>
      </div>
      <div class="history-panel-content">
        <!-- Content will be added by other methods -->
      </div>
    `;
    
    // Insert into piece setup modal
    const setupContainer = modal.querySelector('.setup-container');
    if (setupContainer) {
      setupContainer.appendChild(panel);
    } else {
      modal.querySelector('.piece-setup-body').appendChild(panel);
    }
    
    return panel;
  }
  
  /**
   * Create undo/redo control buttons
   */
  createUndoRedoControls() {
    if (!this.historyPanel) return;
    
    const content = this.historyPanel.querySelector('.history-panel-content');
    
    const undoRedoContainer = document.createElement('div');
    undoRedoContainer.className = 'undo-redo-controls';
    undoRedoContainer.innerHTML = `
      <div class="undo-redo-buttons">
        <button class="history-btn undo-btn" id="historyUndoBtn" title="${this.t('undo')} (Ctrl+Z)">
          <span class="btn-icon">↶</span>
          <span class="btn-text">${this.t('undo')}</span>
        </button>
        <button class="history-btn redo-btn" id="historyRedoBtn" title="${this.t('redo')} (Ctrl+Y)">
          <span class="btn-icon">↷</span>
          <span class="btn-text">${this.t('redo')}</span>
        </button>
      </div>
      <div class="history-status">
        <span class="history-position-indicator">
          <span class="current-position">1</span> / <span class="total-positions">1</span>
        </span>
      </div>
    `;
    
    content.appendChild(undoRedoContainer);
    
    // Store references
    this.undoButton = undoRedoContainer.querySelector('.undo-btn');
    this.redoButton = undoRedoContainer.querySelector('.redo-btn');
    this.positionIndicator = undoRedoContainer.querySelector('.history-position-indicator');
  }
  
  /**
   * Create history list display
   */
  createHistoryList() {
    if (!this.historyPanel) return;
    
    const content = this.historyPanel.querySelector('.history-panel-content');
    
    const historyListContainer = document.createElement('div');
    historyListContainer.className = 'history-list-container';
    historyListContainer.innerHTML = `
      <div class="history-list-header">
        <h5>${this.t('positionHistory')}</h5>
        <span class="history-count">0 ${this.t('positions')}</span>
      </div>
      <div class="history-list-scroll">
        <div class="history-list" id="positionHistoryList">
          <div class="history-empty-state">
            <span class="empty-icon">📝</span>
            <p>${this.t('noHistoryYet')}</p>
          </div>
        </div>
      </div>
    `;
    
    content.appendChild(historyListContainer);
    
    // Store reference
    this.historyList = historyListContainer.querySelector('.history-list');
    this.historyCount = historyListContainer.querySelector('.history-count');
  }
  
  /**
   * Create history management controls
   */
  createHistoryControls() {
    if (!this.historyPanel) return;
    
    const content = this.historyPanel.querySelector('.history-panel-content');
    
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'history-controls';
    controlsContainer.innerHTML = `
      <div class="history-actions">
        <button class="history-btn clear-history-btn" id="clearHistoryBtn" title="${this.t('clearHistory')}">
          <span class="btn-icon">🗑️</span>
          <span class="btn-text">${this.t('clearHistory')}</span>
        </button>
        <button class="history-btn export-history-btn" id="exportHistoryBtn" title="${this.t('exportHistory')}">
          <span class="btn-icon">📤</span>
          <span class="btn-text">${this.t('export')}</span>
        </button>
        <button class="history-btn import-history-btn" id="importHistoryBtn" title="${this.t('importHistory')}">
          <span class="btn-icon">📥</span>
          <span class="btn-text">${this.t('import')}</span>
        </button>
      </div>
      <input type="file" id="historyImportFile" accept=".json" style="display: none;">
    `;
    
    content.appendChild(controlsContainer);
    
    // Store references
    this.clearHistoryButton = controlsContainer.querySelector('.clear-history-btn');
    this.exportHistoryButton = controlsContainer.querySelector('.export-history-btn');
    this.importHistoryButton = controlsContainer.querySelector('.import-history-btn');
    this.importFileInput = controlsContainer.querySelector('#historyImportFile');
  }
  
  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    if (!this.historyPanel) return;
    
    // Toggle panel visibility
    const toggleBtn = this.historyPanel.querySelector('.history-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleHistoryPanel());
    }
    
    // Undo/Redo buttons
    if (this.undoButton) {
      this.undoButton.addEventListener('click', () => this.performUndo());
    }
    
    if (this.redoButton) {
      this.redoButton.addEventListener('click', () => this.performRedo());
    }
    
    // Clear history button
    if (this.clearHistoryButton) {
      this.clearHistoryButton.addEventListener('click', () => this.showClearHistoryConfirmation());
    }
    
    // Export/Import buttons
    if (this.exportHistoryButton) {
      this.exportHistoryButton.addEventListener('click', () => this.exportHistory());
    }
    
    if (this.importHistoryButton) {
      this.importHistoryButton.addEventListener('click', () => this.importHistoryButton.click());
    }
    
    if (this.importFileInput) {
      this.importFileInput.addEventListener('change', (e) => this.handleHistoryImport(e));
    }
    
    // History list item clicks
    if (this.historyList) {
      this.historyList.addEventListener('click', (e) => this.handleHistoryItemClick(e));
    }
  }
  
  /**
   * Setup keyboard shortcuts for undo/redo
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', this.boundKeyboardHandler);
  }
  
  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(event) {
    // Only handle shortcuts when piece setup modal is open
    const modal = document.getElementById('pieceSetupModal');
    if (!modal || modal.classList.contains('hidden')) {
      return;
    }
    
    // Prevent shortcuts if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'z':
          if (event.shiftKey) {
            // Ctrl+Shift+Z = Redo
            event.preventDefault();
            this.performRedo();
          } else {
            // Ctrl+Z = Undo
            event.preventDefault();
            this.performUndo();
          }
          break;
        case 'y':
          // Ctrl+Y = Redo
          event.preventDefault();
          this.performRedo();
          break;
      }
    }
  }
  
  /**
   * Setup listeners for history manager events
   */
  setupHistoryManagerListeners() {
    if (!this.historyManager) return;
    
    // Listen to history changes
    this.historyManager.addEventListener('positionAdded', this.boundHistoryChangeHandler);
    this.historyManager.addEventListener('positionChanged', this.boundHistoryChangeHandler);
    this.historyManager.addEventListener('historyCleared', this.boundHistoryChangeHandler);
  }
  
  /**
   * Handle history manager events
   */
  handleHistoryChange(eventData) {
    console.log('📝 History changed:', eventData);
    this.updateInterface();
    
    // Show notification for significant changes
    if (eventData.direction === 'undo') {
      this.showNotification(this.t('undoPerformed'), 'info');
    } else if (eventData.direction === 'redo') {
      this.showNotification(this.t('redoPerformed'), 'info');
    }
  }
  
  /**
   * Update the entire interface based on current history state
   */
  updateInterface() {
    this.updateUndoRedoButtons();
    this.updatePositionIndicator();
    this.updateHistoryList();
  }
  
  /**
   * Update undo/redo button states
   */
  updateUndoRedoButtons() {
    if (!this.historyManager) return;
    
    const canUndo = this.historyManager.canUndo();
    const canRedo = this.historyManager.canRedo();
    
    if (this.undoButton) {
      this.undoButton.disabled = !canUndo;
      this.undoButton.classList.toggle('disabled', !canUndo);
    }
    
    if (this.redoButton) {
      this.redoButton.disabled = !canRedo;
      this.redoButton.classList.toggle('disabled', !canRedo);
    }
  }
  
  /**
   * Update position indicator
   */
  updatePositionIndicator() {
    if (!this.historyManager || !this.positionIndicator) return;
    
    const stats = this.historyManager.getHistoryStatistics();
    const currentPos = stats.currentIndex + 1;
    const totalPos = stats.size;
    
    const currentSpan = this.positionIndicator.querySelector('.current-position');
    const totalSpan = this.positionIndicator.querySelector('.total-positions');
    
    if (currentSpan) currentSpan.textContent = Math.max(1, currentPos);
    if (totalSpan) totalSpan.textContent = Math.max(1, totalPos);
  }
  
  /**
   * Update history list display
   */
  updateHistoryList() {
    if (!this.historyManager || !this.historyList) return;
    
    const historyData = this.historyManager.getHistoryList();
    
    // Update history count
    if (this.historyCount) {
      this.historyCount.textContent = `${historyData.length} ${this.t('positions')}`;
    }
    
    // Clear existing list
    this.historyList.innerHTML = '';
    
    if (historyData.length === 0) {
      // Show empty state
      const emptyState = document.createElement('div');
      emptyState.className = 'history-empty-state';
      emptyState.innerHTML = `
        <span class="empty-icon">📝</span>
        <p>${this.t('noHistoryYet')}</p>
      `;
      this.historyList.appendChild(emptyState);
      return;
    }
    
    // Create history items
    historyData.forEach((entry, index) => {
      const historyItem = this.createHistoryItem(entry, index);
      this.historyList.appendChild(historyItem);
    });
    
    // Scroll to current position
    this.scrollToCurrentPosition();
  }
  
  /**
   * Create a single history item element
   */
  createHistoryItem(entry, index) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.dataset.index = index;
    
    if (entry.isCurrent) {
      item.classList.add('current');
    }
    
    // Format timestamp
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    item.innerHTML = `
      <div class="history-item-content">
        <div class="history-item-header">
          <span class="history-item-number">${index + 1}</span>
          <span class="history-item-name">${entry.name}</span>
          <span class="history-item-time">${timestamp}</span>
        </div>
        <div class="history-item-thumbnail">
          <pre class="position-thumbnail">${entry.thumbnail}</pre>
        </div>
        <div class="history-item-description">
          ${entry.description || this.t('noDescription')}
        </div>
        <div class="history-item-tags">
          ${entry.tags.map(tag => `<span class="history-tag">${tag}</span>`).join('')}
        </div>
      </div>
      <div class="history-item-actions">
        <button class="history-action-btn jump-btn" title="${this.t('jumpToPosition')}">
          <span>↗</span>
        </button>
        <button class="history-action-btn preview-btn" title="${this.t('previewPosition')}">
          <span>👁</span>
        </button>
      </div>
    `;
    
    return item;
  }
  
  /**
   * Handle clicks on history items
   */
  handleHistoryItemClick(event) {
    const item = event.target.closest('.history-item');
    if (!item) return;
    
    const index = parseInt(item.dataset.index);
    
    if (event.target.closest('.jump-btn')) {
      // Jump to position
      this.jumpToPosition(index);
    } else if (event.target.closest('.preview-btn')) {
      // Preview position
      this.previewPosition(index);
    } else {
      // Select item
      this.selectHistoryItem(index);
    }
  }
  
  /**
   * Jump to a specific position in history
   */
  jumpToPosition(index) {
    if (!this.historyManager) return;
    
    const position = this.historyManager.jumpToPosition(index);
    if (position) {
      // Update the setup board if we're in piece setup mode
      if (typeof updateSetupBoardFromPosition === 'function') {
        updateSetupBoardFromPosition(position);
      }
      
      this.showNotification(this.t('jumpedToPosition', index + 1), 'success');
    }
  }
  
  /**
   * Preview a position without changing current state
   */
  previewPosition(index) {
    const historyData = this.historyManager.getHistoryList();
    const entry = historyData[index];
    
    if (!entry) return;
    
    // Create preview modal
    this.showPositionPreview(entry);
  }
  
  /**
   * Show position preview modal
   */
  showPositionPreview(entry) {
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'position-preview-modal';
    modal.innerHTML = `
      <div class="preview-modal-content">
        <div class="preview-header">
          <h3>${entry.name}</h3>
          <button class="close-preview-btn">✖</button>
        </div>
        <div class="preview-body">
          <div class="preview-board">
            <pre class="preview-position">${entry.thumbnail}</pre>
          </div>
          <div class="preview-info">
            <p><strong>${this.t('created')}:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
            <p><strong>${this.t('description')}:</strong> ${entry.description || this.t('noDescription')}</p>
            <div class="preview-tags">
              ${entry.tags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="preview-actions">
          <button class="preview-btn jump-to-btn">${this.t('jumpToPosition')}</button>
          <button class="preview-btn cancel-btn">${this.t('cancel')}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners
    modal.querySelector('.close-preview-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.jump-to-btn').addEventListener('click', () => {
      this.jumpToPosition(entry.index);
      modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  /**
   * Select a history item
   */
  selectHistoryItem(index) {
    // Remove previous selection
    this.historyList.querySelectorAll('.history-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Select new item
    const item = this.historyList.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.classList.add('selected');
      this.selectedHistoryIndex = index;
    }
  }
  
  /**
   * Scroll to current position in history list
   */
  scrollToCurrentPosition() {
    const currentItem = this.historyList.querySelector('.history-item.current');
    if (currentItem) {
      currentItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  /**
   * Perform undo operation
   */
  performUndo() {
    if (!this.historyManager) return;
    
    const position = this.historyManager.undo();
    if (position) {
      // Update the setup board if we're in piece setup mode
      if (typeof updateSetupBoardFromPosition === 'function') {
        updateSetupBoardFromPosition(position);
      }
    }
  }
  
  /**
   * Perform redo operation
   */
  performRedo() {
    if (!this.historyManager) return;
    
    const position = this.historyManager.redo();
    if (position) {
      // Update the setup board if we're in piece setup mode
      if (typeof updateSetupBoardFromPosition === 'function') {
        updateSetupBoardFromPosition(position);
      }
    }
  }
  
  /**
   * Toggle history panel visibility
   */
  toggleHistoryPanel() {
    if (!this.historyPanel) return;
    
    const content = this.historyPanel.querySelector('.history-panel-content');
    const chevron = this.historyPanel.querySelector('.chevron');
    
    if (content.classList.contains('collapsed')) {
      content.classList.remove('collapsed');
      chevron.textContent = '▴';
      this.isHistoryPanelVisible = true;
    } else {
      content.classList.add('collapsed');
      chevron.textContent = '▾';
      this.isHistoryPanelVisible = false;
    }
  }
  
  /**
   * Show clear history confirmation dialog
   */
  showClearHistoryConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-header">
          <h3>${this.t('confirmClearHistory')}</h3>
        </div>
        <div class="confirmation-body">
          <p>${this.t('clearHistoryWarning')}</p>
          <p><strong>${this.t('thisActionCannotBeUndone')}</strong></p>
        </div>
        <div class="confirmation-actions">
          <button class="confirm-btn danger-btn">${this.t('clearHistory')}</button>
          <button class="cancel-btn">${this.t('cancel')}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup event listeners
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      this.clearHistory();
      modal.remove();
    });
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  /**
   * Clear all history
   */
  clearHistory() {
    if (!this.historyManager) return;
    
    this.historyManager.clearHistory();
    this.showNotification(this.t('historyCleared'), 'success');
  }
  
  /**
   * Export history to JSON file
   */
  exportHistory() {
    if (!this.historyManager) return;
    
    try {
      const historyData = this.historyManager.exportHistory();
      const blob = new Blob([historyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `position-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification(this.t('historyExported'), 'success');
    } catch (error) {
      console.error('Error exporting history:', error);
      this.showNotification(this.t('exportError'), 'error');
    }
  }
  
  /**
   * Handle history import from file
   */
  handleHistoryImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const success = this.historyManager.importHistory(e.target.result);
        if (success) {
          this.showNotification(this.t('historyImported'), 'success');
        } else {
          this.showNotification(this.t('importError'), 'error');
        }
      } catch (error) {
        console.error('Error importing history:', error);
        this.showNotification(this.t('importError'), 'error');
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  }
  
  /**
   * Apply CSS styles for the history interface
   */
  applyHistoryInterfaceStyles() {
    // Check if styles already applied
    if (document.getElementById('position-history-interface-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'position-history-interface-styles';
    style.textContent = this.getHistoryInterfaceCSS();
    document.head.appendChild(style);
  }
  
  /**
   * Get CSS styles for the history interface
   */
  getHistoryInterfaceCSS() {
    return `
      /* Position History Interface Styles */
      .position-history-panel {
        background: var(--bg-panel, #252525);
        border: 1px solid var(--border-color, #333);
        border-radius: 8px;
        margin: 1rem 0;
        overflow: hidden;
      }
      
      .history-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
        cursor: pointer;
        user-select: none;
      }
      
      .history-panel-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        color: white;
        font-size: 1rem;
        font-weight: 600;
      }
      
      .history-icon {
        font-size: 1.2rem;
      }
      
      .history-toggle-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background 0.2s;
      }
      
      .history-toggle-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      .history-panel-content {
        padding: 1rem;
        transition: all 0.3s ease;
        max-height: 500px;
        overflow: hidden;
      }
      
      .history-panel-content.collapsed {
        max-height: 0;
        padding: 0 1rem;
      }
      
      /* Undo/Redo Controls */
      .undo-redo-controls {
        margin-bottom: 1rem;
      }
      
      .undo-redo-buttons {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .history-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--bg-card, #1e1e1e);
        border: 1px solid var(--border-color, #333);
        color: var(--text-primary, #e0e0e0);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
      }
      
      .history-btn:hover:not(.disabled) {
        background: var(--accent-blue, #5c85d6);
        transform: translateY(-1px);
      }
      
      .history-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .history-btn .btn-icon {
        font-size: 1.1rem;
      }
      
      .undo-btn .btn-icon {
        transform: scaleX(-1);
      }
      
      .history-status {
        text-align: center;
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.85rem;
      }
      
      /* History List */
      .history-list-container {
        margin-bottom: 1rem;
      }
      
      .history-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color, #333);
      }
      
      .history-list-header h5 {
        margin: 0;
        color: var(--text-primary, #e0e0e0);
        font-size: 0.9rem;
      }
      
      .history-count {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.8rem;
      }
      
      .history-list-scroll {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-color, #333);
        border-radius: 4px;
      }
      
      .history-list {
        padding: 0.5rem;
      }
      
      .history-empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-secondary, #a0a0a0);
      }
      
      .history-empty-state .empty-icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.5rem;
      }
      
      .history-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: var(--bg-card, #1e1e1e);
        border: 1px solid var(--border-color, #333);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .history-item:hover {
        background: var(--bg-panel, #252525);
        transform: translateY(-1px);
      }
      
      .history-item.current {
        border-color: var(--accent-gold, #d4af37);
        background: rgba(212, 175, 55, 0.1);
      }
      
      .history-item.selected {
        border-color: var(--accent-blue, #5c85d6);
        background: rgba(92, 133, 214, 0.1);
      }
      
      .history-item-content {
        flex: 1;
      }
      
      .history-item-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      .history-item-number {
        background: var(--accent-blue, #5c85d6);
        color: white;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: bold;
        min-width: 1.5rem;
        text-align: center;
      }
      
      .history-item-name {
        font-weight: 600;
        color: var(--text-primary, #e0e0e0);
        flex: 1;
      }
      
      .history-item-time {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.75rem;
      }
      
      .history-item-thumbnail {
        margin: 0.5rem 0;
      }
      
      .position-thumbnail {
        font-family: monospace;
        font-size: 0.8rem;
        line-height: 1;
        color: var(--text-secondary, #a0a0a0);
        background: var(--bg-main, #121212);
        padding: 0.5rem;
        border-radius: 4px;
        margin: 0;
        white-space: pre;
      }
      
      .history-item-description {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.8rem;
        margin: 0.25rem 0;
      }
      
      .history-item-tags {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      
      .history-tag {
        background: var(--accent-blue, #5c85d6);
        color: white;
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-size: 0.7rem;
      }
      
      .history-item-actions {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-left: 0.5rem;
      }
      
      .history-action-btn {
        background: var(--bg-panel, #252525);
        border: 1px solid var(--border-color, #333);
        color: var(--text-secondary, #a0a0a0);
        padding: 0.25rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.8rem;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .history-action-btn:hover {
        background: var(--accent-blue, #5c85d6);
        color: white;
      }
      
      /* History Controls */
      .history-controls {
        border-top: 1px solid var(--border-color, #333);
        padding-top: 1rem;
      }
      
      .history-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      
      .clear-history-btn {
        background: var(--accent-red, #d65c5c) !important;
      }
      
      .clear-history-btn:hover {
        background: #c53030 !important;
      }
      
      /* Modal Styles */
      .position-preview-modal,
      .confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      }
      
      .preview-modal-content,
      .confirmation-content {
        background: var(--bg-card, #1e1e1e);
        border: 1px solid var(--border-color, #333);
        border-radius: 8px;
        padding: 1.5rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .preview-header,
      .confirmation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color, #333);
      }
      
      .preview-header h3,
      .confirmation-header h3 {
        margin: 0;
        color: var(--text-primary, #e0e0e0);
      }
      
      .close-preview-btn {
        background: none;
        border: none;
        color: var(--text-secondary, #a0a0a0);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.25rem;
      }
      
      .close-preview-btn:hover {
        color: var(--accent-red, #d65c5c);
      }
      
      .preview-body {
        margin-bottom: 1rem;
      }
      
      .preview-board {
        text-align: center;
        margin-bottom: 1rem;
      }
      
      .preview-position {
        font-family: monospace;
        font-size: 1rem;
        line-height: 1.2;
        color: var(--text-primary, #e0e0e0);
        background: var(--bg-main, #121212);
        padding: 1rem;
        border-radius: 4px;
        margin: 0;
        white-space: pre;
      }
      
      .preview-info p {
        margin: 0.5rem 0;
        color: var(--text-secondary, #a0a0a0);
      }
      
      .preview-tags {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      
      .preview-tag {
        background: var(--accent-blue, #5c85d6);
        color: white;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-size: 0.8rem;
      }
      
      .preview-actions,
      .confirmation-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      
      .preview-btn {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color, #333);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.9rem;
      }
      
      .jump-to-btn {
        background: var(--accent-blue, #5c85d6);
        color: white;
      }
      
      .jump-to-btn:hover {
        background: #4c7bd9;
      }
      
      .cancel-btn {
        background: var(--bg-panel, #252525);
        color: var(--text-secondary, #a0a0a0);
      }
      
      .cancel-btn:hover {
        background: var(--bg-card, #1e1e1e);
        color: var(--text-primary, #e0e0e0);
      }
      
      .danger-btn {
        background: var(--accent-red, #d65c5c);
        color: white;
      }
      
      .danger-btn:hover {
        background: #c53030;
      }
      
      .confirmation-body {
        margin-bottom: 1rem;
        color: var(--text-secondary, #a0a0a0);
      }
      
      .confirmation-body p {
        margin: 0.5rem 0;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .history-panel-content {
          padding: 0.5rem;
        }
        
        .undo-redo-buttons {
          flex-direction: column;
        }
        
        .history-btn {
          justify-content: center;
        }
        
        .history-item {
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .history-item-actions {
          flex-direction: row;
          margin-left: 0;
        }
        
        .history-actions {
          flex-direction: column;
        }
        
        .preview-modal-content,
        .confirmation-content {
          width: 95%;
          padding: 1rem;
        }
      }
    `;
  }
  
  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    // Use enhanced UI notification if available
    if (window.enhancedUI && typeof window.enhancedUI.showEnhancedNotification === 'function') {
      window.enhancedUI.showEnhancedNotification(message, type);
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster(message);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
  
  /**
   * Get translated text
   */
  t(key, ...args) {
    // Use global translation function if available
    if (typeof t === 'function') {
      return t(key, ...args);
    }
    
    // Fallback translations
    const fallbackTranslations = {
      positionHistory: 'Position History',
      toggleHistory: 'Toggle History',
      undo: 'Undo',
      redo: 'Redo',
      positions: 'positions',
      noHistoryYet: 'No history yet. Start making moves!',
      clearHistory: 'Clear History',
      export: 'Export',
      import: 'Import',
      jumpToPosition: 'Jump to Position',
      previewPosition: 'Preview Position',
      noDescription: 'No description',
      created: 'Created',
      cancel: 'Cancel',
      confirmClearHistory: 'Confirm Clear History',
      clearHistoryWarning: 'This will permanently delete all position history.',
      thisActionCannotBeUndone: 'This action cannot be undone.',
      historyCleared: 'History cleared successfully',
      historyExported: 'History exported successfully',
      historyImported: 'History imported successfully',
      exportError: 'Error exporting history',
      importError: 'Error importing history',
      undoPerformed: 'Undo performed',
      redoPerformed: 'Redo performed',
      jumpedToPosition: 'Jumped to position {0}'
    };
    
    let text = this.translations[key] || fallbackTranslations[key] || key;
    
    // Simple argument substitution
    args.forEach((arg, index) => {
      text = text.replace(`{${index}}`, arg);
    });
    
    return text;
  }
  
  /**
   * Add a position to history (convenience method)
   */
  addPosition(position, metadata = {}) {
    if (this.historyManager) {
      return this.historyManager.addPosition(position, metadata);
    }
    return false;
  }
  
  /**
   * Get current position (convenience method)
   */
  getCurrentPosition() {
    if (this.historyManager) {
      return this.historyManager.getCurrentPosition();
    }
    return null;
  }
  
  /**
   * Check if interface is visible
   */
  isVisible() {
    return this.isHistoryPanelVisible;
  }
  
  /**
   * Show the history panel
   */
  show() {
    if (!this.isHistoryPanelVisible) {
      this.toggleHistoryPanel();
    }
  }
  
  /**
   * Hide the history panel
   */
  hide() {
    if (this.isHistoryPanelVisible) {
      this.toggleHistoryPanel();
    }
  }
  
  /**
   * Cleanup method
   */
  cleanup() {
    // Remove event listeners
    document.removeEventListener('keydown', this.boundKeyboardHandler);
    
    if (this.historyManager) {
      this.historyManager.removeEventListener('positionAdded', this.boundHistoryChangeHandler);
      this.historyManager.removeEventListener('positionChanged', this.boundHistoryChangeHandler);
      this.historyManager.removeEventListener('historyCleared', this.boundHistoryChangeHandler);
    }
    
    // Remove DOM elements
    if (this.historyPanel) {
      this.historyPanel.remove();
    }
    
    // Remove styles
    const styles = document.getElementById('position-history-interface-styles');
    if (styles) {
      styles.remove();
    }
    
    console.log('🧹 Position History Interface cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionHistoryInterface;
}

// Make available globally
window.PositionHistoryInterface = PositionHistoryInterface;