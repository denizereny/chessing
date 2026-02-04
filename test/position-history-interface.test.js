/**
 * Unit Tests for Position History Interface
 * 
 * Tests the history interface functionality including:
 * - UI creation and initialization
 * - Undo/Redo button functionality
 * - Keyboard shortcuts
 * - History list display
 * - Position preview and navigation
 * - History management (clear, export, import)
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5
 * Task: 6.2 Geçmiş arayüzü oluştur
 */

// Mock DOM environment for testing
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.KeyboardEvent = dom.window.KeyboardEvent;
}

// Import the classes
const PositionHistoryManager = require('../js/position-history-manager.js');
const PositionHistoryInterface = require('../js/position-history-interface.js');

describe('Position History Interface', () => {
  let historyManager;
  let historyInterface;
  let mockModal;
  
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Create mock piece setup modal
    mockModal = document.createElement('div');
    mockModal.id = 'pieceSetupModal';
    mockModal.innerHTML = `
      <div class="piece-setup-content">
        <div class="modal-header">
          <h2>Test Modal</h2>
        </div>
        <div class="piece-setup-body">
          <div class="setup-container">
            <!-- History interface will be added here -->
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(mockModal);
    
    // Initialize history manager and interface
    historyManager = new PositionHistoryManager();
    historyInterface = new PositionHistoryInterface(historyManager);
    
    // Mock global functions
    global.updateSetupBoardFromPosition = jest.fn();
    global.bildirimGoster = jest.fn();
    global.t = jest.fn((key, ...args) => {
      const translations = {
        positionHistory: 'Position History',
        undo: 'Undo',
        redo: 'Redo',
        positions: 'positions',
        clearHistory: 'Clear History',
        export: 'Export',
        import: 'Import',
        jumpToPosition: 'Jump to Position',
        previewPosition: 'Preview Position',
        noHistoryYet: 'No history yet. Start making moves!',
        cancel: 'Cancel',
        created: 'Created',
        noDescription: 'No description'
      };
      let text = translations[key] || key;
      args.forEach((arg, index) => {
        text = text.replace(`{${index}}`, arg);
      });
      return text;
    });
  });
  
  afterEach(() => {
    if (historyInterface) {
      historyInterface.cleanup();
    }
    jest.clearAllMocks();
  });
  
  describe('Initialization', () => {
    test('should create history interface elements', () => {
      const historyPanel = document.querySelector('.position-history-panel');
      expect(historyPanel).toBeTruthy();
      
      const header = historyPanel.querySelector('.history-panel-header');
      expect(header).toBeTruthy();
      
      const content = historyPanel.querySelector('.history-panel-content');
      expect(content).toBeTruthy();
    });
    
    test('should create undo/redo controls', () => {
      const undoBtn = document.getElementById('historyUndoBtn');
      const redoBtn = document.getElementById('historyRedoBtn');
      
      expect(undoBtn).toBeTruthy();
      expect(redoBtn).toBeTruthy();
      expect(undoBtn.textContent).toContain('Undo');
      expect(redoBtn.textContent).toContain('Redo');
    });
    
    test('should create history list', () => {
      const historyList = document.getElementById('positionHistoryList');
      expect(historyList).toBeTruthy();
      
      const emptyState = historyList.querySelector('.history-empty-state');
      expect(emptyState).toBeTruthy();
    });
    
    test('should create history controls', () => {
      const clearBtn = document.getElementById('clearHistoryBtn');
      const exportBtn = document.getElementById('exportHistoryBtn');
      const importBtn = document.getElementById('importHistoryBtn');
      
      expect(clearBtn).toBeTruthy();
      expect(exportBtn).toBeTruthy();
      expect(importBtn).toBeTruthy();
    });
    
    test('should apply CSS styles', () => {
      const styleElement = document.getElementById('position-history-interface-styles');
      expect(styleElement).toBeTruthy();
      expect(styleElement.textContent).toContain('.position-history-panel');
    });
  });
  
  describe('Undo/Redo Functionality', () => {
    beforeEach(() => {
      // Add some test positions
      const position1 = [
        ['r', 'q', 'k', 'r'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'Q', 'K', 'R']
      ];
      
      const position2 = [
        ['r', 'q', 'k', 'r'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'Q', 'K', null]
      ];
      
      historyManager.addPosition(position1, { name: 'Position 1' });
      historyManager.addPosition(position2, { name: 'Position 2' });
    });
    
    test('should update button states correctly', () => {
      const undoBtn = document.getElementById('historyUndoBtn');
      const redoBtn = document.getElementById('historyRedoBtn');
      
      // Should be able to undo, not redo
      expect(undoBtn.disabled).toBe(false);
      expect(redoBtn.disabled).toBe(true);
      
      // Perform undo
      historyInterface.performUndo();
      
      // Should be able to both undo and redo
      expect(undoBtn.disabled).toBe(false);
      expect(redoBtn.disabled).toBe(false);
    });
    
    test('should perform undo operation', () => {
      historyInterface.performUndo();
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
      
      const stats = historyManager.getHistoryStatistics();
      expect(stats.currentIndex).toBe(0);
    });
    
    test('should perform redo operation', () => {
      // First undo, then redo
      historyInterface.performUndo();
      historyInterface.performRedo();
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalledTimes(2);
      
      const stats = historyManager.getHistoryStatistics();
      expect(stats.currentIndex).toBe(1);
    });
    
    test('should update position indicator', () => {
      const currentSpan = document.querySelector('.current-position');
      const totalSpan = document.querySelector('.total-positions');
      
      expect(currentSpan.textContent).toBe('2');
      expect(totalSpan.textContent).toBe('2');
      
      historyInterface.performUndo();
      
      expect(currentSpan.textContent).toBe('1');
      expect(totalSpan.textContent).toBe('2');
    });
  });
  
  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      // Add test positions
      const position1 = [
        ['r', 'q', 'k', 'r'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'Q', 'K', 'R']
      ];
      
      historyManager.addPosition(position1, { name: 'Test Position' });
    });
    
    test('should handle Ctrl+Z for undo', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
    });
    
    test('should handle Ctrl+Y for redo', () => {
      // First undo to enable redo
      historyInterface.performUndo();
      jest.clearAllMocks();
      
      const event = new KeyboardEvent('keydown', {
        key: 'y',
        ctrlKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
    });
    
    test('should handle Ctrl+Shift+Z for redo', () => {
      // First undo to enable redo
      historyInterface.performUndo();
      jest.clearAllMocks();
      
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
    });
    
    test('should ignore shortcuts when modal is hidden', () => {
      mockModal.classList.add('hidden');
      
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(global.updateSetupBoardFromPosition).not.toHaveBeenCalled();
    });
    
    test('should ignore shortcuts when typing in input', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        target: input,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      expect(global.updateSetupBoardFromPosition).not.toHaveBeenCalled();
    });
  });
  
  describe('History List Display', () => {
    beforeEach(() => {
      // Add test positions
      const positions = [
        {
          position: [
            ['r', 'q', 'k', 'r'],
            ['p', 'p', 'p', 'p'],
            [null, null, null, null],
            ['P', 'P', 'P', 'P'],
            ['R', 'Q', 'K', 'R']
          ],
          metadata: { name: 'Starting Position', description: 'Initial setup' }
        },
        {
          position: [
            ['r', 'q', 'k', 'r'],
            ['p', 'p', 'p', 'p'],
            [null, null, null, null],
            ['P', 'P', 'P', 'P'],
            ['R', 'Q', null, 'R']
          ],
          metadata: { name: 'King Moved', description: 'King moved to safety' }
        }
      ];
      
      positions.forEach(({ position, metadata }) => {
        historyManager.addPosition(position, metadata);
      });
    });
    
    test('should display history items', () => {
      const historyItems = document.querySelectorAll('.history-item');
      expect(historyItems.length).toBe(2);
      
      const firstItem = historyItems[0];
      expect(firstItem.textContent).toContain('Starting Position');
      expect(firstItem.textContent).toContain('Initial setup');
    });
    
    test('should mark current position', () => {
      const currentItem = document.querySelector('.history-item.current');
      expect(currentItem).toBeTruthy();
      expect(currentItem.textContent).toContain('King Moved');
    });
    
    test('should update history count', () => {
      const historyCount = document.querySelector('.history-count');
      expect(historyCount.textContent).toContain('2 positions');
    });
    
    test('should show empty state when no history', () => {
      historyManager.clearHistory();
      
      const emptyState = document.querySelector('.history-empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No history yet');
    });
    
    test('should generate position thumbnails', () => {
      const thumbnails = document.querySelectorAll('.position-thumbnail');
      expect(thumbnails.length).toBeGreaterThan(0);
      
      const firstThumbnail = thumbnails[0];
      expect(firstThumbnail.textContent).toContain('♜♛♚♜');
    });
  });
  
  describe('Position Navigation', () => {
    beforeEach(() => {
      // Add test positions
      for (let i = 0; i < 3; i++) {
        const position = Array(5).fill().map(() => Array(4).fill(null));
        position[0][0] = i % 2 === 0 ? 'r' : 'R'; // Alternate pieces
        
        historyManager.addPosition(position, { 
          name: `Position ${i + 1}`,
          description: `Test position ${i + 1}`
        });
      }
    });
    
    test('should jump to specific position', () => {
      historyInterface.jumpToPosition(0);
      
      expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
      
      const stats = historyManager.getHistoryStatistics();
      expect(stats.currentIndex).toBe(0);
    });
    
    test('should handle jump to position click', () => {
      const jumpBtn = document.querySelector('.jump-btn');
      if (jumpBtn) {
        jumpBtn.click();
        expect(global.updateSetupBoardFromPosition).toHaveBeenCalled();
      }
    });
    
    test('should show position preview', () => {
      const previewBtn = document.querySelector('.preview-btn');
      if (previewBtn) {
        previewBtn.click();
        
        const previewModal = document.querySelector('.position-preview-modal');
        expect(previewModal).toBeTruthy();
      }
    });
    
    test('should select history item', () => {
      const historyItem = document.querySelector('.history-item');
      if (historyItem) {
        historyItem.click();
        
        expect(historyItem.classList.contains('selected')).toBe(true);
        expect(historyInterface.selectedHistoryIndex).toBe(0);
      }
    });
  });
  
  describe('History Management', () => {
    beforeEach(() => {
      // Add test positions
      const position = Array(5).fill().map(() => Array(4).fill(null));
      historyManager.addPosition(position, { name: 'Test Position' });
    });
    
    test('should show clear confirmation dialog', () => {
      const clearBtn = document.getElementById('clearHistoryBtn');
      clearBtn.click();
      
      const confirmationModal = document.querySelector('.confirmation-modal');
      expect(confirmationModal).toBeTruthy();
      expect(confirmationModal.textContent).toContain('Confirm Clear History');
    });
    
    test('should clear history when confirmed', () => {
      const clearBtn = document.getElementById('clearHistoryBtn');
      clearBtn.click();
      
      const confirmBtn = document.querySelector('.confirm-btn');
      if (confirmBtn) {
        confirmBtn.click();
        
        const stats = historyManager.getHistoryStatistics();
        expect(stats.size).toBe(0);
      }
    });
    
    test('should export history', () => {
      // Mock URL.createObjectURL and related functions
      global.URL = {
        createObjectURL: jest.fn(() => 'mock-url'),
        revokeObjectURL: jest.fn()
      };
      
      global.Blob = jest.fn();
      
      const exportBtn = document.getElementById('exportHistoryBtn');
      exportBtn.click();
      
      expect(global.Blob).toHaveBeenCalled();
    });
    
    test('should handle history import', () => {
      const importFile = document.getElementById('historyImportFile');
      const mockFile = new File(['{"test": "data"}'], 'history.json', { type: 'application/json' });
      
      // Mock FileReader
      global.FileReader = jest.fn(() => ({
        readAsText: jest.fn(function() {
          this.onload({ target: { result: '{"test": "data"}' } });
        })
      }));
      
      const event = { target: { files: [mockFile] } };
      historyInterface.handleHistoryImport(event);
      
      expect(global.FileReader).toHaveBeenCalled();
    });
  });
  
  describe('Panel Visibility', () => {
    test('should toggle panel visibility', () => {
      const toggleBtn = document.querySelector('.history-toggle-btn');
      const content = document.querySelector('.history-panel-content');
      const chevron = document.querySelector('.chevron');
      
      expect(content.classList.contains('collapsed')).toBe(false);
      expect(chevron.textContent).toBe('▾');
      
      toggleBtn.click();
      
      expect(content.classList.contains('collapsed')).toBe(true);
      expect(chevron.textContent).toBe('▴');
    });
    
    test('should track visibility state', () => {
      expect(historyInterface.isVisible()).toBe(true);
      
      historyInterface.hide();
      expect(historyInterface.isVisible()).toBe(false);
      
      historyInterface.show();
      expect(historyInterface.isVisible()).toBe(true);
    });
  });
  
  describe('Integration with History Manager', () => {
    test('should listen to history manager events', () => {
      const position = Array(5).fill().map(() => Array(4).fill(null));
      
      // Spy on interface update method
      const updateSpy = jest.spyOn(historyInterface, 'updateInterface');
      
      historyManager.addPosition(position, { name: 'New Position' });
      
      expect(updateSpy).toHaveBeenCalled();
    });
    
    test('should update interface on history changes', () => {
      const position = Array(5).fill().map(() => Array(4).fill(null));
      historyManager.addPosition(position, { name: 'Test Position' });
      
      const undoBtn = document.getElementById('historyUndoBtn');
      const redoBtn = document.getElementById('historyRedoBtn');
      
      expect(undoBtn.disabled).toBe(false);
      expect(redoBtn.disabled).toBe(true);
      
      historyManager.undo();
      
      expect(undoBtn.disabled).toBe(false);
      expect(redoBtn.disabled).toBe(false);
    });
  });
  
  describe('Convenience Methods', () => {
    test('should add position through interface', () => {
      const position = Array(5).fill().map(() => Array(4).fill(null));
      const result = historyInterface.addPosition(position, { name: 'Test' });
      
      expect(result).toBe(true);
      
      const stats = historyManager.getHistoryStatistics();
      expect(stats.size).toBe(1);
    });
    
    test('should get current position through interface', () => {
      const position = Array(5).fill().map(() => Array(4).fill(null));
      historyManager.addPosition(position, { name: 'Test' });
      
      const current = historyInterface.getCurrentPosition();
      expect(current).toEqual(position);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle missing history manager gracefully', () => {
      const interfaceWithoutManager = new PositionHistoryInterface(null);
      
      expect(() => {
        interfaceWithoutManager.performUndo();
        interfaceWithoutManager.performRedo();
        interfaceWithoutManager.addPosition([]);
      }).not.toThrow();
    });
    
    test('should handle missing DOM elements gracefully', () => {
      document.body.innerHTML = '';
      
      expect(() => {
        new PositionHistoryInterface(historyManager);
      }).not.toThrow();
    });
    
    test('should handle invalid positions gracefully', () => {
      expect(() => {
        historyInterface.addPosition(null);
        historyInterface.addPosition('invalid');
        historyInterface.addPosition([]);
      }).not.toThrow();
    });
  });
  
  describe('Cleanup', () => {
    test('should cleanup properly', () => {
      const historyPanel = document.querySelector('.position-history-panel');
      const styles = document.getElementById('position-history-interface-styles');
      
      expect(historyPanel).toBeTruthy();
      expect(styles).toBeTruthy();
      
      historyInterface.cleanup();
      
      expect(document.querySelector('.position-history-panel')).toBeFalsy();
      expect(document.getElementById('position-history-interface-styles')).toBeFalsy();
    });
  });
});

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PositionHistoryInterface
  };
}