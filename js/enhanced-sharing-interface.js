/**
 * Enhanced Sharing Interface for Position Sharing
 * 
 * This module extends the basic position sharing system with:
 * - Social media sharing buttons
 * - Sharing history management
 * - Enhanced UI for sharing options
 * 
 * Requirements: 4.2, 4.3
 * Task: 5.3 Paylaşım arayüzü oluştur
 */

class EnhancedSharingInterface {
  constructor() {
    this.sharingHistory = [];
    this.maxHistorySize = 20;
    this.socialPlatforms = {
      twitter: {
        name: 'Twitter',
        icon: '🐦',
        baseUrl: 'https://twitter.com/intent/tweet',
        params: { text: 'Check out this chess position!', url: '' }
      },
      facebook: {
        name: 'Facebook',
        icon: '📘',
        baseUrl: 'https://www.facebook.com/sharer/sharer.php',
        params: { u: '' }
      },
      whatsapp: {
        name: 'WhatsApp',
        icon: '💬',
        baseUrl: 'https://wa.me/',
        params: { text: 'Check out this chess position: ' }
      },
      telegram: {
        name: 'Telegram',
        icon: '✈️',
        baseUrl: 'https://t.me/share/url',
        params: { url: '', text: 'Check out this chess position!' }
      },
      reddit: {
        name: 'Reddit',
        icon: '🔴',
        baseUrl: 'https://reddit.com/submit',
        params: { url: '', title: 'Interesting 4x5 Chess Position' }
      },
      email: {
        name: 'Email',
        icon: '📧',
        baseUrl: 'mailto:',
        params: { subject: '4x5 Chess Position', body: 'Check out this chess position: ' }
      }
    };
    
    this.loadSharingHistory();
    console.log('🔗 Enhanced Sharing Interface initialized');
  }
  
  /**
   * Initialize enhanced sharing interface
   */
  initializeEnhancedSharing() {
    this.addEnhancedSharingUI();
    this.setupEventListeners();
    this.updateSharingHistoryDisplay();
  }
  
  /**
   * Add enhanced sharing UI to the existing sharing panel
   */
  addEnhancedSharingUI() {
    const existingPanel = document.getElementById('positionSharingPanel');
    if (!existingPanel) {
      console.warn('🔗 Basic sharing panel not found, cannot enhance');
      return;
    }
    
    // Add social media sharing section
    const socialSection = this.createSocialMediaSection();
    const sharingContent = existingPanel.querySelector('.sharing-content');
    if (sharingContent) {
      sharingContent.appendChild(socialSection);
    }
    
    // Add sharing history section
    const historySection = this.createSharingHistorySection();
    if (sharingContent) {
      sharingContent.appendChild(historySection);
    }
    
    // Add enhanced styles
    this.addEnhancedStyles();
    
    console.log('🔗 Enhanced sharing UI added');
  }
  
  /**
   * Create social media sharing section
   */
  createSocialMediaSection() {
    const section = document.createElement('div');
    section.className = 'social-sharing-section';
    section.innerHTML = `
      <div class="sharing-row">
        <h4 class="sharing-section-title">📱 Social Media Sharing</h4>
      </div>
      <div class="social-buttons-grid">
        ${Object.entries(this.socialPlatforms).map(([key, platform]) => `
          <button class="social-share-btn" data-platform="${key}" onclick="enhancedSharing.shareToSocial('${key}')">
            <span class="social-icon">${platform.icon}</span>
            <span class="social-name">${platform.name}</span>
          </button>
        `).join('')}
      </div>
      <div class="sharing-row">
        <button onclick="enhancedSharing.copyShareableMessage()" class="btn-secondary" id="btnCopyMessage">
          📋 Copy Shareable Message
        </button>
        <button onclick="enhancedSharing.showSharePreview()" class="btn-secondary" id="btnSharePreview">
          👁️ Preview Share
        </button>
      </div>
    `;
    
    return section;
  }
  
  /**
   * Create sharing history section
   */
  createSharingHistorySection() {
    const section = document.createElement('div');
    section.className = 'sharing-history-section';
    section.innerHTML = `
      <div class="sharing-row">
        <h4 class="sharing-section-title">📚 Sharing History</h4>
        <button onclick="enhancedSharing.clearSharingHistory()" class="btn-small btn-danger" id="btnClearHistory">
          🗑️ Clear
        </button>
      </div>
      <div class="history-container" id="sharingHistoryContainer">
        <div class="history-empty" id="historyEmpty">
          No sharing history yet. Share a position to see it here!
        </div>
      </div>
      <div class="sharing-row">
        <button onclick="enhancedSharing.exportSharingHistory()" class="btn-secondary" id="btnExportHistory">
          📤 Export History
        </button>
        <button onclick="enhancedSharing.importSharingHistory()" class="btn-secondary" id="btnImportHistory">
          📥 Import History
        </button>
      </div>
      <input type="file" id="historyImportFile" accept=".json" style="display: none;" onchange="enhancedSharing.handleHistoryImport(event)">
    `;
    
    return section;
  }
  
  /**
   * Add enhanced styles for the sharing interface
   */
  addEnhancedStyles() {
    if (document.getElementById('enhancedSharingStyles')) {
      return; // Already added
    }
    
    const style = document.createElement('style');
    style.id = 'enhancedSharingStyles';
    style.textContent = `
      .social-sharing-section {
        margin-top: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10px;
        border: 1px solid #dee2e6;
      }
      
      .sharing-history-section {
        margin-top: 20px;
        padding: 15px;
        background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        border-radius: 10px;
        border: 1px solid #ffeaa7;
      }
      
      .sharing-section-title {
        margin: 0 0 15px 0;
        color: #495057;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .social-buttons-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
        margin-bottom: 15px;
      }
      
      .social-share-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        background: white;
        color: #495057;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
      }
      
      .social-share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-color: #007bff;
      }
      
      .social-share-btn:active {
        transform: translateY(0);
      }
      
      .social-share-btn[data-platform="twitter"]:hover {
        background: #1da1f2;
        color: white;
        border-color: #1da1f2;
      }
      
      .social-share-btn[data-platform="facebook"]:hover {
        background: #4267b2;
        color: white;
        border-color: #4267b2;
      }
      
      .social-share-btn[data-platform="whatsapp"]:hover {
        background: #25d366;
        color: white;
        border-color: #25d366;
      }
      
      .social-share-btn[data-platform="telegram"]:hover {
        background: #0088cc;
        color: white;
        border-color: #0088cc;
      }
      
      .social-share-btn[data-platform="reddit"]:hover {
        background: #ff4500;
        color: white;
        border-color: #ff4500;
      }
      
      .social-share-btn[data-platform="email"]:hover {
        background: #6c757d;
        color: white;
        border-color: #6c757d;
      }
      
      .social-icon {
        font-size: 16px;
      }
      
      .social-name {
        font-size: 11px;
        font-weight: 600;
      }
      
      .history-container {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        background: white;
        margin-bottom: 10px;
      }
      
      .history-empty {
        padding: 20px;
        text-align: center;
        color: #6c757d;
        font-style: italic;
        font-size: 12px;
      }
      
      .history-item {
        padding: 10px;
        border-bottom: 1px solid #f8f9fa;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background-color 0.2s ease;
      }
      
      .history-item:hover {
        background-color: #f8f9fa;
      }
      
      .history-item:last-child {
        border-bottom: none;
      }
      
      .history-info {
        flex: 1;
        min-width: 0;
      }
      
      .history-code {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: bold;
        color: #d63384;
        margin-bottom: 2px;
      }
      
      .history-timestamp {
        font-size: 10px;
        color: #6c757d;
      }
      
      .history-actions {
        display: flex;
        gap: 5px;
      }
      
      .history-btn {
        padding: 4px 8px;
        border: 1px solid #dee2e6;
        border-radius: 3px;
        background: white;
        color: #495057;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .history-btn:hover {
        background: #e9ecef;
      }
      
      .btn-small {
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 4px;
      }
      
      .btn-danger {
        background: #dc3545;
        color: white;
        border: 1px solid #dc3545;
      }
      
      .btn-danger:hover {
        background: #c82333;
        border-color: #c82333;
      }
      
      .share-preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .share-preview-content {
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .share-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #dee2e6;
      }
      
      .share-preview-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #6c757d;
      }
      
      .share-message-preview {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        border-left: 4px solid #007bff;
        margin-bottom: 15px;
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.4;
      }
      
      @media (max-width: 768px) {
        .social-buttons-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .social-share-btn {
          padding: 8px 10px;
          font-size: 11px;
        }
        
        .social-icon {
          font-size: 14px;
        }
        
        .social-name {
          font-size: 10px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Setup event listeners for enhanced sharing
   */
  setupEventListeners() {
    // Listen for successful sharing events to add to history
    document.addEventListener('positionShared', (event) => {
      this.addToSharingHistory(event.detail);
    });
    
    // Listen for position generation to enable social sharing
    document.addEventListener('sharingCodeGenerated', (event) => {
      this.enableSocialSharing(event.detail.code, event.detail.url);
    });
  }
  
  /**
   * Share to social media platform
   */
  shareToSocial(platform) {
    if (!window.currentSharingCode) {
      this.showError('Please generate a sharing code first');
      return;
    }
    
    const platformConfig = this.socialPlatforms[platform];
    if (!platformConfig) {
      this.showError('Unknown social platform');
      return;
    }
    
    try {
      const shareUrl = positionSharingSystem.shareViaURL(setupBoard);
      const shareMessage = this.generateShareMessage(window.currentSharingCode, shareUrl);
      
      let finalUrl;
      
      switch (platform) {
        case 'twitter':
          finalUrl = `${platformConfig.baseUrl}?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(shareUrl)}`;
          break;
          
        case 'facebook':
          finalUrl = `${platformConfig.baseUrl}?u=${encodeURIComponent(shareUrl)}`;
          break;
          
        case 'whatsapp':
          finalUrl = `${platformConfig.baseUrl}?text=${encodeURIComponent(shareMessage + ' ' + shareUrl)}`;
          break;
          
        case 'telegram':
          finalUrl = `${platformConfig.baseUrl}?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`;
          break;
          
        case 'reddit':
          finalUrl = `${platformConfig.baseUrl}?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(platformConfig.params.title)}`;
          break;
          
        case 'email':
          finalUrl = `${platformConfig.baseUrl}?subject=${encodeURIComponent(platformConfig.params.subject)}&body=${encodeURIComponent(shareMessage + '\n\n' + shareUrl)}`;
          break;
          
        default:
          throw new Error('Unsupported platform');
      }
      
      // Open sharing window
      window.open(finalUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      
      // Add to sharing history
      this.addToSharingHistory({
        code: window.currentSharingCode,
        url: shareUrl,
        platform: platform,
        message: shareMessage,
        timestamp: Date.now()
      });
      
      // Dispatch sharing event
      document.dispatchEvent(new CustomEvent('positionShared', {
        detail: {
          platform: platform,
          code: window.currentSharingCode,
          url: shareUrl
        }
      }));
      
      this.showSuccess(`Shared to ${platformConfig.name}!`);
      
    } catch (error) {
      console.error('🔗 Social sharing failed:', error);
      this.showError('Failed to share to ' + platformConfig.name);
    }
  }
  
  /**
   * Generate shareable message for social media
   */
  generateShareMessage(code, url) {
    const messages = [
      `🏁 Check out this interesting 4x5 chess position! Code: ${code}`,
      `♔ Analyze this 4x5 chess setup with me! Position: ${code}`,
      `🎯 Can you solve this 4x5 chess position? Code: ${code}`,
      `⚡ Quick 4x5 chess challenge! Position code: ${code}`,
      `🧩 Interesting 4x5 chess puzzle to analyze! Code: ${code}`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  /**
   * Copy shareable message to clipboard
   */
  async copyShareableMessage() {
    if (!window.currentSharingCode) {
      this.showError('Please generate a sharing code first');
      return;
    }
    
    try {
      const shareUrl = positionSharingSystem.shareViaURL(setupBoard);
      const message = this.generateShareMessage(window.currentSharingCode, shareUrl);
      const fullMessage = `${message}\n\n🔗 Play here: ${shareUrl}`;
      
      await navigator.clipboard.writeText(fullMessage);
      this.showSuccess('Shareable message copied to clipboard!');
      
    } catch (error) {
      console.error('🔗 Failed to copy message:', error);
      this.showError('Failed to copy message');
    }
  }
  
  /**
   * Show share preview modal
   */
  showSharePreview() {
    if (!window.currentSharingCode) {
      this.showError('Please generate a sharing code first');
      return;
    }
    
    try {
      const shareUrl = positionSharingSystem.shareViaURL(setupBoard);
      const message = this.generateShareMessage(window.currentSharingCode, shareUrl);
      
      const modal = document.createElement('div');
      modal.className = 'share-preview-modal';
      modal.innerHTML = `
        <div class="share-preview-content">
          <div class="share-preview-header">
            <h3>📱 Share Preview</h3>
            <button class="share-preview-close" onclick="this.closest('.share-preview-modal').remove()">✖</button>
          </div>
          <div class="share-message-preview">
            <strong>Message:</strong><br>
            ${message}
            <br><br>
            <strong>Link:</strong><br>
            <a href="${shareUrl}" target="_blank">${shareUrl}</a>
            <br><br>
            <strong>Code:</strong> <code>${window.currentSharingCode}</code>
          </div>
          <div class="share-preview-actions">
            <button onclick="enhancedSharing.copyShareableMessage()" class="btn-primary">📋 Copy Message</button>
            <button onclick="this.closest('.share-preview-modal').remove()" class="btn-secondary">Close</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
      
    } catch (error) {
      console.error('🔗 Failed to show preview:', error);
      this.showError('Failed to show preview');
    }
  }
  
  /**
   * Add entry to sharing history
   */
  addToSharingHistory(entry) {
    const historyEntry = {
      id: Date.now() + Math.random(),
      code: entry.code,
      url: entry.url,
      platform: entry.platform || 'direct',
      message: entry.message || '',
      timestamp: entry.timestamp || Date.now(),
      position: setupBoard ? setupBoard.map(row => [...row]) : null
    };
    
    // Add to beginning of history
    this.sharingHistory.unshift(historyEntry);
    
    // Limit history size
    if (this.sharingHistory.length > this.maxHistorySize) {
      this.sharingHistory = this.sharingHistory.slice(0, this.maxHistorySize);
    }
    
    // Save to localStorage
    this.saveSharingHistory();
    
    // Update display
    this.updateSharingHistoryDisplay();
    
    console.log('🔗 Added to sharing history:', historyEntry);
  }
  
  /**
   * Update sharing history display
   */
  updateSharingHistoryDisplay() {
    const container = document.getElementById('sharingHistoryContainer');
    const emptyMessage = document.getElementById('historyEmpty');
    
    if (!container) return;
    
    if (this.sharingHistory.length === 0) {
      if (emptyMessage) {
        emptyMessage.style.display = 'block';
      }
      return;
    }
    
    if (emptyMessage) {
      emptyMessage.style.display = 'none';
    }
    
    // Clear existing items (except empty message)
    const existingItems = container.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());
    
    // Add history items
    this.sharingHistory.forEach(entry => {
      const item = this.createHistoryItem(entry);
      container.appendChild(item);
    });
  }
  
  /**
   * Create history item element
   */
  createHistoryItem(entry) {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const platformIcon = this.socialPlatforms[entry.platform]?.icon || '🔗';
    const platformName = this.socialPlatforms[entry.platform]?.name || 'Direct';
    const timestamp = new Date(entry.timestamp).toLocaleString();
    
    item.innerHTML = `
      <div class="history-info">
        <div class="history-code">${platformIcon} ${entry.code}</div>
        <div class="history-timestamp">${platformName} • ${timestamp}</div>
      </div>
      <div class="history-actions">
        <button class="history-btn" onclick="enhancedSharing.loadFromHistory('${entry.id}')" title="Load Position">
          📂
        </button>
        <button class="history-btn" onclick="enhancedSharing.copyFromHistory('${entry.id}')" title="Copy Code">
          📋
        </button>
        <button class="history-btn" onclick="enhancedSharing.shareFromHistory('${entry.id}')" title="Share Again">
          🔄
        </button>
        <button class="history-btn" onclick="enhancedSharing.deleteFromHistory('${entry.id}')" title="Delete">
          🗑️
        </button>
      </div>
    `;
    
    return item;
  }
  
  /**
   * Load position from history
   */
  loadFromHistory(entryId) {
    const entry = this.sharingHistory.find(e => e.id == entryId);
    if (!entry) {
      this.showError('History entry not found');
      return;
    }
    
    try {
      if (entry.position) {
        // Load from stored position
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
            setupBoard[row][col] = entry.position[row][col];
          }
        }
      } else {
        // Load from code
        const position = positionSharingSystem.decodePosition(entry.code);
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
            setupBoard[row][col] = position[row][col];
          }
        }
      }
      
      // Update UI
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      this.showSuccess('Position loaded from history!');
      
    } catch (error) {
      console.error('🔗 Failed to load from history:', error);
      this.showError('Failed to load position from history');
    }
  }
  
  /**
   * Copy code from history
   */
  async copyFromHistory(entryId) {
    const entry = this.sharingHistory.find(e => e.id == entryId);
    if (!entry) {
      this.showError('History entry not found');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(entry.code);
      this.showSuccess('Code copied from history!');
    } catch (error) {
      console.error('🔗 Failed to copy from history:', error);
      this.showError('Failed to copy code');
    }
  }
  
  /**
   * Share again from history
   */
  shareFromHistory(entryId) {
    const entry = this.sharingHistory.find(e => e.id == entryId);
    if (!entry) {
      this.showError('History entry not found');
      return;
    }
    
    // Set current sharing code and share
    window.currentSharingCode = entry.code;
    
    if (entry.platform && entry.platform !== 'direct') {
      this.shareToSocial(entry.platform);
    } else {
      // Copy URL to clipboard
      navigator.clipboard.writeText(entry.url).then(() => {
        this.showSuccess('Share URL copied to clipboard!');
      }).catch(() => {
        this.showError('Failed to copy URL');
      });
    }
  }
  
  /**
   * Delete entry from history
   */
  deleteFromHistory(entryId) {
    const index = this.sharingHistory.findIndex(e => e.id == entryId);
    if (index === -1) {
      this.showError('History entry not found');
      return;
    }
    
    this.sharingHistory.splice(index, 1);
    this.saveSharingHistory();
    this.updateSharingHistoryDisplay();
    
    this.showSuccess('Entry deleted from history');
  }
  
  /**
   * Clear all sharing history
   */
  clearSharingHistory() {
    if (this.sharingHistory.length === 0) {
      this.showError('History is already empty');
      return;
    }
    
    if (confirm('Are you sure you want to clear all sharing history?')) {
      this.sharingHistory = [];
      this.saveSharingHistory();
      this.updateSharingHistoryDisplay();
      this.showSuccess('Sharing history cleared');
    }
  }
  
  /**
   * Export sharing history
   */
  exportSharingHistory() {
    if (this.sharingHistory.length === 0) {
      this.showError('No history to export');
      return;
    }
    
    try {
      const exportData = {
        version: '1.0',
        exported: Date.now(),
        history: this.sharingHistory
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chess-sharing-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccess('Sharing history exported!');
      
    } catch (error) {
      console.error('🔗 Failed to export history:', error);
      this.showError('Failed to export history');
    }
  }
  
  /**
   * Import sharing history
   */
  importSharingHistory() {
    const fileInput = document.getElementById('historyImportFile');
    if (fileInput) {
      fileInput.click();
    }
  }
  
  /**
   * Handle history import file selection
   */
  handleHistoryImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (!importData.history || !Array.isArray(importData.history)) {
          throw new Error('Invalid history file format');
        }
        
        // Merge with existing history (avoid duplicates)
        const existingCodes = new Set(this.sharingHistory.map(e => e.code));
        const newEntries = importData.history.filter(e => !existingCodes.has(e.code));
        
        this.sharingHistory = [...newEntries, ...this.sharingHistory];
        
        // Limit total size
        if (this.sharingHistory.length > this.maxHistorySize) {
          this.sharingHistory = this.sharingHistory.slice(0, this.maxHistorySize);
        }
        
        this.saveSharingHistory();
        this.updateSharingHistoryDisplay();
        
        this.showSuccess(`Imported ${newEntries.length} new history entries!`);
        
      } catch (error) {
        console.error('🔗 Failed to import history:', error);
        this.showError('Failed to import history: ' + error.message);
      }
    };
    
    reader.readAsText(file);
    
    // Clear file input
    event.target.value = '';
  }
  
  /**
   * Save sharing history to localStorage
   */
  saveSharingHistory() {
    try {
      localStorage.setItem('chess-sharing-history', JSON.stringify(this.sharingHistory));
    } catch (error) {
      console.error('🔗 Failed to save sharing history:', error);
    }
  }
  
  /**
   * Load sharing history from localStorage
   */
  loadSharingHistory() {
    try {
      const saved = localStorage.getItem('chess-sharing-history');
      if (saved) {
        this.sharingHistory = JSON.parse(saved);
        console.log(`🔗 Loaded ${this.sharingHistory.length} sharing history entries`);
      }
    } catch (error) {
      console.error('🔗 Failed to load sharing history:', error);
      this.sharingHistory = [];
    }
  }
  
  /**
   * Enable social sharing buttons
   */
  enableSocialSharing(code, url) {
    const socialButtons = document.querySelectorAll('.social-share-btn');
    socialButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
    
    const messageBtn = document.getElementById('btnCopyMessage');
    const previewBtn = document.getElementById('btnSharePreview');
    
    if (messageBtn) messageBtn.disabled = false;
    if (previewBtn) previewBtn.disabled = false;
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(message, 'success');
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster(message);
    } else {
      console.log('✅', message);
    }
  }
  
  /**
   * Show error message
   */
  showError(message) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(message, 'error');
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster(message);
    } else {
      console.error('❌', message);
    }
  }
  
  /**
   * Get sharing statistics
   */
  getSharingStatistics() {
    const platformCounts = {};
    this.sharingHistory.forEach(entry => {
      const platform = entry.platform || 'direct';
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
    
    return {
      totalShares: this.sharingHistory.length,
      platformBreakdown: platformCounts,
      oldestShare: this.sharingHistory.length > 0 ? 
        Math.min(...this.sharingHistory.map(e => e.timestamp)) : null,
      newestShare: this.sharingHistory.length > 0 ? 
        Math.max(...this.sharingHistory.map(e => e.timestamp)) : null,
      uniqueCodes: new Set(this.sharingHistory.map(e => e.code)).size
    };
  }
}

// Global instance
let enhancedSharing = null;

/**
 * Initialize enhanced sharing interface
 */
function initializeEnhancedSharing() {
  if (!enhancedSharing) {
    enhancedSharing = new EnhancedSharingInterface();
  }
  
  // Wait for basic sharing to be initialized
  setTimeout(() => {
    enhancedSharing.initializeEnhancedSharing();
  }, 500);
}

/**
 * Hook into existing sharing code generation
 */
function enhanceGenerateSharingCode() {
  // Store original function
  const originalGenerate = window.generateSharingCode;
  
  if (originalGenerate) {
    window.generateSharingCode = function() {
      // Call original function
      originalGenerate();
      
      // Dispatch event for enhanced sharing
      if (window.currentSharingCode) {
        const shareUrl = positionSharingSystem.shareViaURL(setupBoard);
        document.dispatchEvent(new CustomEvent('sharingCodeGenerated', {
          detail: {
            code: window.currentSharingCode,
            url: shareUrl
          }
        }));
      }
    };
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeEnhancedSharing, 1000);
    setTimeout(enhanceGenerateSharingCode, 1000);
  });
} else {
  setTimeout(initializeEnhancedSharing, 1000);
  setTimeout(enhanceGenerateSharingCode, 1000);
}

// Export for global access
if (typeof window !== 'undefined') {
  window.EnhancedSharingInterface = EnhancedSharingInterface;
  window.enhancedSharing = enhancedSharing;
  window.initializeEnhancedSharing = initializeEnhancedSharing;
}

console.log('🔗 Enhanced Sharing Interface module loaded');