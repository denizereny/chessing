/**
 * Virtual History List Component
 * 
 * Provides virtualized rendering for large position history lists
 * Works with BigDataOptimizationManager for efficient memory usage
 * 
 * Requirements: 8.5
 * Task: 9.3 Büyük veri optimizasyonu
 */

class VirtualHistoryList {
  constructor(container, optimizationManager, options = {}) {
    this.container = container;
    this.optimizationManager = optimizationManager;
    
    // Configuration
    this.options = {
      itemHeight: 60,
      containerHeight: 400,
      overscan: 5,
      loadingIndicator: true,
      emptyMessage: 'No positions in history',
      ...options
    };
    
    // State
    this.state = {
      scrollTop: 0,
      isScrolling: false,
      scrollTimeout: null,
      lastScrollTime: 0,
      renderedItems: new Map(),
      loadingItems: new Set()
    };
    
    // Event handlers
    this.handlers = {
      scroll: this.handleScroll.bind(this),
      resize: this.handleResize.bind(this),
      itemClick: this.handleItemClick.bind(this),
      itemDoubleClick: this.handleItemDoubleClick.bind(this)
    };
    
    // Initialize component
    this.initialize();
  }
  
  /**
   * Initialize the virtual list component
   */
  initialize() {
    console.log('📱 Initializing Virtual History List...');
    
    // Setup container
    this.setupContainer();
    
    // Create virtual elements
    this.createVirtualElements();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial render
    this.render();
    
    console.log('✨ Virtual History List initialized');
  }
  
  /**
   * Setup container styles and structure
   */
  setupContainer() {
    this.container.style.position = 'relative';
    this.container.style.height = `${this.options.containerHeight}px`;
    this.container.style.overflow = 'auto';
    this.container.style.border = '1px solid #ddd';
    this.container.style.borderRadius = '4px';
    
    // Add CSS classes
    this.container.classList.add('virtual-history-list');
    
    // Create inner container for absolute positioning
    this.innerContainer = document.createElement('div');
    this.innerContainer.style.position = 'relative';
    this.innerContainer.style.width = '100%';
    this.innerContainer.classList.add('virtual-history-inner');
    
    this.container.appendChild(this.innerContainer);
  }
  
  /**
   * Create virtual elements
   */
  createVirtualElements() {
    // Create loading indicator
    this.loadingIndicator = document.createElement('div');
    this.loadingIndicator.className = 'virtual-list-loading';
    this.loadingIndicator.innerHTML = `
      <div class="loading-spinner"></div>
      <span>Loading positions...</span>
    `;
    this.loadingIndicator.style.display = 'none';
    
    // Create empty state
    this.emptyState = document.createElement('div');
    this.emptyState.className = 'virtual-list-empty';
    this.emptyState.innerHTML = `
      <div class="empty-icon">📋</div>
      <p>${this.options.emptyMessage}</p>
    `;
    this.emptyState.style.display = 'none';
    
    // Add to container
    this.container.appendChild(this.loadingIndicator);
    this.container.appendChild(this.emptyState);
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.container.addEventListener('scroll', this.handlers.scroll, { passive: true });
    window.addEventListener('resize', this.handlers.resize);
    
    // Delegation for item events
    this.innerContainer.addEventListener('click', this.handlers.itemClick);
    this.innerContainer.addEventListener('dblclick', this.handlers.itemDoubleClick);
  }
  
  /**
   * Handle scroll events
   */
  async handleScroll(event) {
    const scrollTop = event.target.scrollTop;
    const now = performance.now();
    
    // Throttle scroll handling
    if (now - this.state.lastScrollTime < 16) { // 60fps
      return;
    }
    
    this.state.scrollTop = scrollTop;
    this.state.isScrolling = true;
    this.state.lastScrollTime = now;
    
    // Clear scroll timeout
    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }
    
    // Set scroll end timeout
    this.state.scrollTimeout = setTimeout(() => {
      this.state.isScrolling = false;
    }, 150);
    
    // Update virtual list data
    try {
      const virtualData = await this.optimizationManager.handleVirtualScroll(scrollTop);
      await this.renderVirtualItems(virtualData);
    } catch (error) {
      console.error('Error handling virtual scroll:', error);
    }
  }
  
  /**
   * Handle resize events
   */
  handleResize() {
    // Recalculate container dimensions
    const rect = this.container.getBoundingClientRect();
    this.options.containerHeight = rect.height;
    
    // Re-render
    this.render();
  }
  
  /**
   * Handle item click events
   */
  handleItemClick(event) {
    const item = event.target.closest('.virtual-history-item');
    if (!item) return;
    
    const index = parseInt(item.dataset.index);
    const positionId = item.dataset.positionId;
    
    // Emit click event
    this.emit('itemClick', { index, positionId, item });
  }
  
  /**
   * Handle item double-click events
   */
  handleItemDoubleClick(event) {
    const item = event.target.closest('.virtual-history-item');
    if (!item) return;
    
    const index = parseInt(item.dataset.index);
    const positionId = item.dataset.positionId;
    
    // Emit double-click event
    this.emit('itemDoubleClick', { index, positionId, item });
  }
  
  /**
   * Render the virtual list
   */
  async render() {
    try {
      // Get total item count
      const totalItems = this.optimizationManager.getTotalItemCount();
      
      if (totalItems === 0) {
        this.showEmptyState();
        return;
      }
      
      this.hideEmptyState();
      
      // Set total height
      const totalHeight = totalItems * this.options.itemHeight;
      this.innerContainer.style.height = `${totalHeight}px`;
      
      // Get virtual list data
      const virtualData = await this.optimizationManager.handleVirtualScroll(this.state.scrollTop);
      await this.renderVirtualItems(virtualData);
      
    } catch (error) {
      console.error('Error rendering virtual list:', error);
      this.showError(error);
    }
  }
  
  /**
   * Render virtual items
   */
  async renderVirtualItems(virtualData) {
    const { startIndex, endIndex, visibleItems } = virtualData;
    
    // Clear existing items that are out of range
    this.clearOutOfRangeItems(startIndex, endIndex);
    
    // Show loading indicator if needed
    if (this.optimizationManager.lazyLoadState.isLoading) {
      this.showLoadingIndicator();
    } else {
      this.hideLoadingIndicator();
    }
    
    // Render visible items
    for (const itemData of visibleItems) {
      await this.renderItem(itemData);
    }
  }
  
  /**
   * Render individual item
   */
  async renderItem(itemData) {
    const { virtualIndex, id, position, metadata, style, isCurrent } = itemData;
    
    // Check if item is already rendered
    let itemElement = this.state.renderedItems.get(virtualIndex);
    
    if (!itemElement) {
      // Create new item element
      itemElement = this.createItemElement(itemData);
      this.state.renderedItems.set(virtualIndex, itemElement);
      this.innerContainer.appendChild(itemElement);
    } else {
      // Update existing item
      this.updateItemElement(itemElement, itemData);
    }
    
    // Apply virtual positioning
    Object.assign(itemElement.style, style);
    
    // Update current state
    itemElement.classList.toggle('current', isCurrent);
  }
  
  /**
   * Create item element
   */
  createItemElement(itemData) {
    const { virtualIndex, id, position, metadata, isCurrent } = itemData;
    
    const item = document.createElement('div');
    item.className = 'virtual-history-item';
    item.dataset.index = virtualIndex;
    item.dataset.positionId = id;
    
    // Create item content
    const content = document.createElement('div');
    content.className = 'item-content';
    
    // Position thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'position-thumbnail';
    thumbnail.innerHTML = this.generateThumbnail(position);
    
    // Item info
    const info = document.createElement('div');
    info.className = 'item-info';
    
    const title = document.createElement('div');
    title.className = 'item-title';
    title.textContent = metadata.name || `Position ${virtualIndex + 1}`;
    
    const description = document.createElement('div');
    description.className = 'item-description';
    description.textContent = metadata.description || '';
    
    const timestamp = document.createElement('div');
    timestamp.className = 'item-timestamp';
    timestamp.textContent = this.formatTimestamp(metadata.timestamp);
    
    // Assemble item
    info.appendChild(title);
    if (description.textContent) {
      info.appendChild(description);
    }
    info.appendChild(timestamp);
    
    content.appendChild(thumbnail);
    content.appendChild(info);
    
    // Current indicator
    if (isCurrent) {
      const indicator = document.createElement('div');
      indicator.className = 'current-indicator';
      indicator.innerHTML = '▶';
      content.appendChild(indicator);
    }
    
    item.appendChild(content);
    
    return item;
  }
  
  /**
   * Update item element
   */
  updateItemElement(element, itemData) {
    const { virtualIndex, id, metadata, isCurrent } = itemData;
    
    // Update dataset
    element.dataset.index = virtualIndex;
    element.dataset.positionId = id;
    
    // Update title
    const title = element.querySelector('.item-title');
    if (title) {
      title.textContent = metadata.name || `Position ${virtualIndex + 1}`;
    }
    
    // Update description
    const description = element.querySelector('.item-description');
    if (description) {
      description.textContent = metadata.description || '';
      description.style.display = description.textContent ? 'block' : 'none';
    }
    
    // Update timestamp
    const timestamp = element.querySelector('.item-timestamp');
    if (timestamp) {
      timestamp.textContent = this.formatTimestamp(metadata.timestamp);
    }
    
    // Update current indicator
    const indicator = element.querySelector('.current-indicator');
    if (isCurrent && !indicator) {
      const newIndicator = document.createElement('div');
      newIndicator.className = 'current-indicator';
      newIndicator.innerHTML = '▶';
      element.querySelector('.item-content').appendChild(newIndicator);
    } else if (!isCurrent && indicator) {
      indicator.remove();
    }
  }
  
  /**
   * Clear items that are out of visible range
   */
  clearOutOfRangeItems(startIndex, endIndex) {
    const itemsToRemove = [];
    
    for (const [index, element] of this.state.renderedItems) {
      if (index < startIndex - this.options.overscan || 
          index > endIndex + this.options.overscan) {
        itemsToRemove.push(index);
        element.remove();
      }
    }
    
    // Remove from rendered items map
    itemsToRemove.forEach(index => {
      this.state.renderedItems.delete(index);
    });
  }
  
  /**
   * Generate position thumbnail
   */
  generateThumbnail(position) {
    const pieceSymbols = {
      'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
      'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    return position.map(row => 
      row.map(piece => piece ? pieceSymbols[piece] || piece : '·').join('')
    ).join('<br>');
  }
  
  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // More than 1 day
    return date.toLocaleDateString();
  }
  
  /**
   * Show loading indicator
   */
  showLoadingIndicator() {
    this.loadingIndicator.style.display = 'flex';
  }
  
  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    this.loadingIndicator.style.display = 'none';
  }
  
  /**
   * Show empty state
   */
  showEmptyState() {
    this.emptyState.style.display = 'flex';
    this.innerContainer.style.display = 'none';
  }
  
  /**
   * Hide empty state
   */
  hideEmptyState() {
    this.emptyState.style.display = 'none';
    this.innerContainer.style.display = 'block';
  }
  
  /**
   * Show error state
   */
  showError(error) {
    this.innerContainer.innerHTML = `
      <div class="virtual-list-error">
        <div class="error-icon">⚠️</div>
        <p>Error loading history: ${error.message}</p>
        <button onclick="this.parentElement.parentElement.parentElement.virtualList.render()">
          Retry
        </button>
      </div>
    `;
  }
  
  /**
   * Scroll to specific index
   */
  scrollToIndex(index, behavior = 'smooth') {
    const scrollTop = index * this.options.itemHeight;
    this.container.scrollTo({
      top: scrollTop,
      behavior
    });
  }
  
  /**
   * Scroll to current position
   */
  scrollToCurrent() {
    const stats = this.optimizationManager.historyManager.getHistoryStatistics();
    if (stats.currentIndex >= 0) {
      this.scrollToIndex(stats.currentIndex);
    }
  }
  
  /**
   * Refresh the list
   */
  async refresh() {
    // Clear rendered items
    this.state.renderedItems.clear();
    this.innerContainer.innerHTML = '';
    
    // Re-render
    await this.render();
  }
  
  /**
   * Update item height
   */
  updateItemHeight(newHeight) {
    this.options.itemHeight = newHeight;
    this.optimizationManager.virtualState.itemHeight = newHeight;
    this.refresh();
  }
  
  /**
   * Get visible range
   */
  getVisibleRange() {
    const startIndex = Math.floor(this.state.scrollTop / this.options.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(this.options.containerHeight / this.options.itemHeight),
      this.optimizationManager.getTotalItemCount()
    );
    
    return { startIndex, endIndex };
  }
  
  /**
   * Event emitter functionality
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.container.dispatchEvent(event);
  }
  
  /**
   * Add event listener
   */
  addEventListener(eventName, handler) {
    this.container.addEventListener(eventName, handler);
  }
  
  /**
   * Remove event listener
   */
  removeEventListener(eventName, handler) {
    this.container.removeEventListener(eventName, handler);
  }
  
  /**
   * Destroy the virtual list
   */
  destroy() {
    // Remove event listeners
    this.container.removeEventListener('scroll', this.handlers.scroll);
    window.removeEventListener('resize', this.handlers.resize);
    this.innerContainer.removeEventListener('click', this.handlers.itemClick);
    this.innerContainer.removeEventListener('dblclick', this.handlers.itemDoubleClick);
    
    // Clear timeouts
    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }
    
    // Clear rendered items
    this.state.renderedItems.clear();
    
    // Clear container
    this.container.innerHTML = '';
    
    console.log('🗑️ Virtual History List destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VirtualHistoryList;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.VirtualHistoryList = VirtualHistoryList;
}