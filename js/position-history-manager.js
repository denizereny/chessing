/**
 * Position History Manager for Enhanced Piece Setup
 * 
 * Provides comprehensive position history management including:
 * - Undo/Redo stack implementation (maximum 10 positions)
 * - Position navigation system (back, forward, direct selection)
 * - Circular buffer implementation for performance
 * - Position list management with metadata
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * Task: 6.1 Position History Manager sınıfını oluştur
 */

class PositionHistoryManager {
  constructor() {
    // Circular buffer configuration
    this.maxHistorySize = 10;
    this.history = new Array(this.maxHistorySize);
    this.currentIndex = -1;
    this.size = 0;
    this.startIndex = 0;
    
    // Position metadata tracking
    this.positionMetadata = new Map();
    
    // Event listeners for history changes
    this.listeners = {
      positionAdded: [],
      positionChanged: [],
      historyCleared: []
    };
    
    // Performance tracking
    this.operationCount = 0;
    this.lastOperationTime = 0;
    
    // Board dimensions for validation
    this.ROWS = 5;
    this.COLS = 4;
  }
  
  /**
   * Add a new position to the history
   * Requirements: 5.1
   * @param {Array} position - 5x4 board position array
   * @param {Object} metadata - Optional metadata for the position
   * @returns {boolean} True if position was added successfully
   */
  addPosition(position, metadata = {}) {
    const startTime = performance.now();
    
    try {
      // Validate position
      if (!this.isValidPosition(position)) {
        console.warn('Invalid position provided to history manager');
        return false;
      }
      
      // Deep copy the position to prevent external modifications
      const positionCopy = this.deepCopyPosition(position);
      
      // Generate unique ID for this position
      const positionId = this.generatePositionId(positionCopy);
      
      // Check if this position is the same as the current one
      if (this.size > 0 && this.getCurrentPositionId() === positionId) {
        // Don't add duplicate positions
        return false;
      }
      
      // If we're not at the end of history, truncate forward history
      if (this.currentIndex < this.size - 1) {
        this.truncateForwardHistory();
      }
      
      // Add position using circular buffer logic
      this.currentIndex = (this.currentIndex + 1) % this.maxHistorySize;
      
      if (this.size < this.maxHistorySize) {
        this.size++;
      } else {
        // Buffer is full, move start index
        this.startIndex = (this.startIndex + 1) % this.maxHistorySize;
        
        // Remove metadata for the position being overwritten
        const oldPositionId = this.getPositionIdAtIndex(this.startIndex - 1);
        if (oldPositionId) {
          this.positionMetadata.delete(oldPositionId);
        }
      }
      
      // Store the position
      this.history[this.currentIndex] = {
        position: positionCopy,
        id: positionId,
        timestamp: Date.now(),
        index: this.operationCount++
      };
      
      // Store metadata if provided
      if (Object.keys(metadata).length > 0) {
        this.positionMetadata.set(positionId, {
          ...metadata,
          timestamp: Date.now()
        });
      }
      
      // Notify listeners
      this.notifyListeners('positionAdded', {
        position: positionCopy,
        id: positionId,
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        historySize: this.size
      });
      
      this.lastOperationTime = performance.now() - startTime;
      return true;
      
    } catch (error) {
      console.error('Error adding position to history:', error);
      return false;
    }
  }
  
  /**
   * Undo to the previous position
   * Requirements: 5.2
   * @returns {Array|null} Previous position or null if can't undo
   */
  undo() {
    if (!this.canUndo()) {
      return null;
    }
    
    const startTime = performance.now();
    
    try {
      // Move to previous position
      this.currentIndex = this.getPreviousIndex(this.currentIndex);
      
      const currentEntry = this.history[this.currentIndex];
      const position = this.deepCopyPosition(currentEntry.position);
      
      // Notify listeners
      this.notifyListeners('positionChanged', {
        position: position,
        id: currentEntry.id,
        direction: 'undo',
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        currentIndex: this.getRelativeIndex(),
        historySize: this.size
      });
      
      this.lastOperationTime = performance.now() - startTime;
      return position;
      
    } catch (error) {
      console.error('Error during undo operation:', error);
      return null;
    }
  }
  
  /**
   * Redo to the next position
   * Requirements: 5.3
   * @returns {Array|null} Next position or null if can't redo
   */
  redo() {
    if (!this.canRedo()) {
      return null;
    }
    
    const startTime = performance.now();
    
    try {
      // Move to next position
      this.currentIndex = this.getNextIndex(this.currentIndex);
      
      const currentEntry = this.history[this.currentIndex];
      const position = this.deepCopyPosition(currentEntry.position);
      
      // Notify listeners
      this.notifyListeners('positionChanged', {
        position: position,
        id: currentEntry.id,
        direction: 'redo',
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        currentIndex: this.getRelativeIndex(),
        historySize: this.size
      });
      
      this.lastOperationTime = performance.now() - startTime;
      return position;
      
    } catch (error) {
      console.error('Error during redo operation:', error);
      return null;
    }
  }
  
  /**
   * Check if undo is possible
   * @returns {boolean} True if can undo
   */
  canUndo() {
    return this.size > 1 && this.getRelativeIndex() > 0;
  }
  
  /**
   * Check if redo is possible
   * @returns {boolean} True if can redo
   */
  canRedo() {
    return this.size > 0 && this.getRelativeIndex() < this.size - 1;
  }
  
  /**
   * Get the current position
   * @returns {Array|null} Current position or null if history is empty
   */
  getCurrentPosition() {
    if (this.size === 0) {
      return null;
    }
    
    const currentEntry = this.history[this.currentIndex];
    return currentEntry ? this.deepCopyPosition(currentEntry.position) : null;
  }
  
  /**
   * Get history list for display
   * Requirements: 5.4
   * @returns {Array} Array of history entries with metadata
   */
  getHistoryList() {
    const historyList = [];
    
    for (let i = 0; i < this.size; i++) {
      const actualIndex = (this.startIndex + i) % this.maxHistorySize;
      const entry = this.history[actualIndex];
      
      if (entry) {
        const metadata = this.positionMetadata.get(entry.id) || {};
        const isCurrent = actualIndex === this.currentIndex;
        
        historyList.push({
          id: entry.id,
          position: this.deepCopyPosition(entry.position),
          timestamp: entry.timestamp,
          index: i,
          isCurrent: isCurrent,
          name: metadata.name || `Position ${i + 1}`,
          description: metadata.description || '',
          tags: metadata.tags || [],
          thumbnail: this.generatePositionThumbnail(entry.position)
        });
      }
    }
    
    return historyList;
  }
  
  /**
   * Jump directly to a position by index
   * Requirements: 5.5
   * @param {number} relativeIndex - Relative index in history (0 to size-1)
   * @returns {Array|null} Position at index or null if invalid
   */
  jumpToPosition(relativeIndex) {
    if (relativeIndex < 0 || relativeIndex >= this.size) {
      return null;
    }
    
    const startTime = performance.now();
    
    try {
      // Calculate actual index in circular buffer
      const actualIndex = (this.startIndex + relativeIndex) % this.maxHistorySize;
      this.currentIndex = actualIndex;
      
      const currentEntry = this.history[this.currentIndex];
      const position = this.deepCopyPosition(currentEntry.position);
      
      // Notify listeners
      this.notifyListeners('positionChanged', {
        position: position,
        id: currentEntry.id,
        direction: 'jump',
        targetIndex: relativeIndex,
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        currentIndex: this.getRelativeIndex(),
        historySize: this.size
      });
      
      this.lastOperationTime = performance.now() - startTime;
      return position;
      
    } catch (error) {
      console.error('Error jumping to position:', error);
      return null;
    }
  }
  
  /**
   * Clear all history
   */
  clearHistory() {
    const startTime = performance.now();
    
    this.history.fill(null);
    this.currentIndex = -1;
    this.size = 0;
    this.startIndex = 0;
    this.positionMetadata.clear();
    
    // Notify listeners
    this.notifyListeners('historyCleared', {
      canUndo: false,
      canRedo: false,
      historySize: 0
    });
    
    this.lastOperationTime = performance.now() - startTime;
  }
  
  /**
   * Get history statistics
   * @returns {Object} Statistics about the history
   */
  getHistoryStatistics() {
    return {
      size: this.size,
      maxSize: this.maxHistorySize,
      currentIndex: this.getRelativeIndex(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      operationCount: this.operationCount,
      lastOperationTime: this.lastOperationTime,
      memoryUsage: this.calculateMemoryUsage()
    };
  }
  
  /**
   * Add event listener for history changes
   * @param {string} event - Event type ('positionAdded', 'positionChanged', 'historyCleared')
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event type
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }
  
  /**
   * Update metadata for a position
   * @param {string} positionId - Position ID
   * @param {Object} metadata - Metadata to update
   */
  updatePositionMetadata(positionId, metadata) {
    if (this.positionMetadata.has(positionId)) {
      const existing = this.positionMetadata.get(positionId);
      this.positionMetadata.set(positionId, {
        ...existing,
        ...metadata,
        modified: Date.now()
      });
    }
  }
  
  /**
   * Export history to JSON
   * @returns {string} JSON representation of history
   */
  exportHistory() {
    const historyData = {
      version: '1.0',
      timestamp: Date.now(),
      maxHistorySize: this.maxHistorySize,
      positions: this.getHistoryList(),
      currentIndex: this.getRelativeIndex(),
      statistics: this.getHistoryStatistics()
    };
    
    return JSON.stringify(historyData, null, 2);
  }
  
  /**
   * Import history from JSON
   * @param {string} jsonData - JSON data to import
   * @returns {boolean} True if import was successful
   */
  importHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.positions || !Array.isArray(data.positions)) {
        throw new Error('Invalid history data format');
      }
      
      // Clear current history
      this.clearHistory();
      
      // Import positions
      data.positions.forEach((entry, index) => {
        if (entry.position) {
          const metadata = {
            name: entry.name,
            description: entry.description,
            tags: entry.tags || []
          };
          
          this.addPosition(entry.position, metadata);
        }
      });
      
      // Set current index if specified
      if (typeof data.currentIndex === 'number' && data.currentIndex >= 0) {
        this.jumpToPosition(data.currentIndex);
      }
      
      return true;
      
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  }
  
  // Private Helper Methods
  
  /**
   * Validate position array
   * @param {Array} position - Position to validate
   * @returns {boolean} True if valid
   */
  isValidPosition(position) {
    return Array.isArray(position) && 
           position.length === this.ROWS && 
           position.every(row => Array.isArray(row) && row.length === this.COLS);
  }
  
  /**
   * Deep copy a position array
   * @param {Array} position - Position to copy
   * @returns {Array} Deep copy of position
   */
  deepCopyPosition(position) {
    return position.map(row => [...row]);
  }
  
  /**
   * Generate unique ID for a position
   * @param {Array} position - Position array
   * @returns {string} Unique position ID
   */
  generatePositionId(position) {
    const positionString = position.map(row => 
      row.map(piece => piece || '').join('')
    ).join('|');
    
    // Simple hash function for position ID
    let hash = 0;
    for (let i = 0; i < positionString.length; i++) {
      const char = positionString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `pos_${Math.abs(hash)}_${Date.now()}`;
  }
  
  /**
   * Get position ID at specific index
   * @param {number} index - Buffer index
   * @returns {string|null} Position ID or null
   */
  getPositionIdAtIndex(index) {
    const entry = this.history[index];
    return entry ? entry.id : null;
  }
  
  /**
   * Get current position ID
   * @returns {string|null} Current position ID or null
   */
  getCurrentPositionId() {
    if (this.size === 0) return null;
    const entry = this.history[this.currentIndex];
    return entry ? entry.id : null;
  }
  
  /**
   * Get previous index in circular buffer
   * @param {number} index - Current index
   * @returns {number} Previous index
   */
  getPreviousIndex(index) {
    return index === this.startIndex ? 
           (this.startIndex + this.size - 1) % this.maxHistorySize :
           (index - 1 + this.maxHistorySize) % this.maxHistorySize;
  }
  
  /**
   * Get next index in circular buffer
   * @param {number} index - Current index
   * @returns {number} Next index
   */
  getNextIndex(index) {
    return (index + 1) % this.maxHistorySize;
  }
  
  /**
   * Get relative index (0-based position in history)
   * @returns {number} Relative index
   */
  getRelativeIndex() {
    if (this.size === 0) return -1;
    return (this.currentIndex - this.startIndex + this.maxHistorySize) % this.maxHistorySize;
  }
  
  /**
   * Truncate forward history when adding new position
   */
  truncateForwardHistory() {
    const relativeIndex = this.getRelativeIndex();
    const newSize = relativeIndex + 1;
    
    // Clear positions after current index
    for (let i = newSize; i < this.size; i++) {
      const actualIndex = (this.startIndex + i) % this.maxHistorySize;
      const entry = this.history[actualIndex];
      if (entry) {
        this.positionMetadata.delete(entry.id);
        this.history[actualIndex] = null;
      }
    }
    
    this.size = newSize;
  }
  
  /**
   * Generate position thumbnail for display
   * @param {Array} position - Position array
   * @returns {string} ASCII representation of position
   */
  generatePositionThumbnail(position) {
    const pieceSymbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    return position.map(row => 
      row.map(piece => piece ? pieceSymbols[piece] || piece : '·').join('')
    ).join('\n');
  }
  
  /**
   * Calculate approximate memory usage
   * @returns {number} Memory usage in bytes (approximate)
   */
  calculateMemoryUsage() {
    let usage = 0;
    
    // Calculate size of positions in history
    for (let i = 0; i < this.size; i++) {
      const actualIndex = (this.startIndex + i) % this.maxHistorySize;
      const entry = this.history[actualIndex];
      if (entry) {
        // Approximate: 5x4 array + metadata
        usage += (5 * 4 * 8) + 200; // 8 bytes per cell + 200 bytes metadata
      }
    }
    
    // Add metadata size
    usage += this.positionMetadata.size * 100; // Approximate metadata size
    
    return usage;
  }
  
  /**
   * Notify event listeners
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in history event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      operationCount: this.operationCount,
      lastOperationTime: this.lastOperationTime,
      averageOperationTime: this.operationCount > 0 ? 
        this.lastOperationTime / this.operationCount : 0,
      memoryUsage: this.calculateMemoryUsage(),
      bufferEfficiency: this.size / this.maxHistorySize
    };
  }
  
  /**
   * Optimize memory usage by cleaning up unused metadata
   */
  optimizeMemory() {
    const activeIds = new Set();
    
    // Collect active position IDs
    for (let i = 0; i < this.size; i++) {
      const actualIndex = (this.startIndex + i) % this.maxHistorySize;
      const entry = this.history[actualIndex];
      if (entry) {
        activeIds.add(entry.id);
      }
    }
    
    // Remove metadata for inactive positions
    for (const [id] of this.positionMetadata) {
      if (!activeIds.has(id)) {
        this.positionMetadata.delete(id);
      }
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionHistoryManager;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
  window.PositionHistoryManager = PositionHistoryManager;
}