/**
 * Unit Tests for Enhanced Sharing Interface
 * 
 * Tests the social media sharing buttons and sharing history functionality
 * that were added as part of task 5.3.
 * 
 * Requirements: 4.2, 4.3
 * Task: 5.3 Paylaşım arayüzü oluştur
 */

// Mock DOM environment
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({
      innerHTML: '',
      className: '',
      style: {},
      appendChild: () => {},
      addEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      remove: () => {}
    }),
    getElementById: () => null,
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {},
    dispatchEvent: () => {},
    readyState: 'complete'
  };
  
  global.window = {
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    },
    location: {
      origin: 'http://localhost:8080',
      pathname: '/test',
      search: ''
    },
    open: () => {},
    URL: class {
      constructor(url) {
        this.searchParams = {
          get: () => null
        };
      }
    },
    addEventListener: () => {}
  };
  
  global.navigator = {
    clipboard: {
      writeText: async () => {}
    }
  };
}

// Load the enhanced sharing interface
const fs = require('fs');
const path = require('path');

// Load dependencies
const positionSharingCode = fs.readFileSync(path.join(__dirname, '../js/position-sharing-system.js'), 'utf8');
const enhancedSharingCode = fs.readFileSync(path.join(__dirname, '../js/enhanced-sharing-interface.js'), 'utf8');

// Execute the code in our test environment
eval(positionSharingCode);
eval(enhancedSharingCode);

// Test suite
describe('Enhanced Sharing Interface', () => {
  let enhancedSharing;
  let mockSetupBoard;
  
  beforeEach(() => {
    // Reset global state
    global.window.currentSharingCode = null;
    global.window.positionSharingSystem = new PositionSharingSystem();
    
    // Create mock setup board
    mockSetupBoard = [
      ['r', 'n', 'b', 'q'],
      ['p', 'p', 'p', 'p'],
      [null, null, null, null],
      ['P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'K']
    ];
    global.window.setupBoard = mockSetupBoard;
    
    // Create enhanced sharing instance
    enhancedSharing = new EnhancedSharingInterface();
  });
  
  describe('Social Media Sharing', () => {
    test('should have all required social platforms configured', () => {
      const expectedPlatforms = ['twitter', 'facebook', 'whatsapp', 'telegram', 'reddit', 'email'];
      const actualPlatforms = Object.keys(enhancedSharing.socialPlatforms);
      
      expectedPlatforms.forEach(platform => {
        expect(actualPlatforms).toContain(platform);
      });
    });
    
    test('should generate valid share messages', () => {
      const testCode = 'ABC123';
      const testUrl = 'http://example.com?position=ABC123';
      
      // Generate multiple messages
      const messages = [];
      for (let i = 0; i < 10; i++) {
        const message = enhancedSharing.generateShareMessage(testCode, testUrl);
        messages.push(message);
      }
      
      // All messages should contain the code
      messages.forEach(message => {
        expect(message).toContain(testCode);
        expect(message.length).toBeGreaterThan(10);
        expect(message.length).toBeLessThan(200);
      });
      
      // Should have some variety
      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBeGreaterThan(1);
    });
    
    test('should create social media section HTML', () => {
      const section = enhancedSharing.createSocialMediaSection();
      
      expect(section.className).toBe('social-sharing-section');
      expect(section.innerHTML).toContain('Social Media Sharing');
      expect(section.innerHTML).toContain('social-share-btn');
      
      // Should contain all platforms
      Object.keys(enhancedSharing.socialPlatforms).forEach(platform => {
        expect(section.innerHTML).toContain(`data-platform="${platform}"`);
      });
    });
    
    test('should handle social sharing without current code', () => {
      // Mock console and alert
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Try to share without setting current code
      enhancedSharing.shareToSocial('twitter');
      
      // Should handle gracefully (no errors thrown)
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Sharing History', () => {
    test('should initialize with empty history', () => {
      expect(enhancedSharing.sharingHistory).toEqual([]);
      expect(enhancedSharing.maxHistorySize).toBe(20);
    });
    
    test('should add entries to sharing history', () => {
      const testEntry = {
        code: 'TEST123',
        url: 'http://example.com/test',
        platform: 'twitter',
        message: 'Test message'
      };
      
      enhancedSharing.addToSharingHistory(testEntry);
      
      expect(enhancedSharing.sharingHistory).toHaveLength(1);
      expect(enhancedSharing.sharingHistory[0].code).toBe('TEST123');
      expect(enhancedSharing.sharingHistory[0].platform).toBe('twitter');
      expect(enhancedSharing.sharingHistory[0]).toHaveProperty('id');
      expect(enhancedSharing.sharingHistory[0]).toHaveProperty('timestamp');
    });
    
    test('should limit history size', () => {
      const maxSize = enhancedSharing.maxHistorySize;
      
      // Add more entries than the limit
      for (let i = 0; i < maxSize + 5; i++) {
        enhancedSharing.addToSharingHistory({
          code: `TEST${i}`,
          url: `http://example.com/${i}`,
          platform: 'direct'
        });
      }
      
      expect(enhancedSharing.sharingHistory).toHaveLength(maxSize);
      
      // Most recent entries should be kept
      expect(enhancedSharing.sharingHistory[0].code).toBe(`TEST${maxSize + 4}`);
    });
    
    test('should create history section HTML', () => {
      const section = enhancedSharing.createSharingHistorySection();
      
      expect(section.className).toBe('sharing-history-section');
      expect(section.innerHTML).toContain('Sharing History');
      expect(section.innerHTML).toContain('history-container');
      expect(section.innerHTML).toContain('btnClearHistory');
      expect(section.innerHTML).toContain('btnExportHistory');
      expect(section.innerHTML).toContain('btnImportHistory');
    });
    
    test('should generate sharing statistics', () => {
      // Add test entries
      const testEntries = [
        { code: 'A1', platform: 'twitter' },
        { code: 'A2', platform: 'facebook' },
        { code: 'A3', platform: 'twitter' },
        { code: 'A1', platform: 'whatsapp' } // Duplicate code
      ];
      
      testEntries.forEach(entry => {
        enhancedSharing.addToSharingHistory({
          ...entry,
          url: 'http://example.com',
          timestamp: Date.now()
        });
      });
      
      const stats = enhancedSharing.getSharingStatistics();
      
      expect(stats.totalShares).toBe(4);
      expect(stats.uniqueCodes).toBe(3); // A1, A2, A3
      expect(stats.platformBreakdown.twitter).toBe(2);
      expect(stats.platformBreakdown.facebook).toBe(1);
      expect(stats.platformBreakdown.whatsapp).toBe(1);
      expect(stats).toHaveProperty('oldestShare');
      expect(stats).toHaveProperty('newestShare');
    });
    
    test('should handle history operations', () => {
      // Add test entry
      enhancedSharing.addToSharingHistory({
        code: 'HIST123',
        url: 'http://example.com/hist',
        platform: 'twitter',
        position: mockSetupBoard
      });
      
      const entryId = enhancedSharing.sharingHistory[0].id;
      
      // Test finding entry
      const entry = enhancedSharing.sharingHistory.find(e => e.id === entryId);
      expect(entry).toBeDefined();
      expect(entry.code).toBe('HIST123');
      
      // Test delete operation
      const initialLength = enhancedSharing.sharingHistory.length;
      enhancedSharing.deleteFromHistory(entryId);
      expect(enhancedSharing.sharingHistory).toHaveLength(initialLength - 1);
      
      // Entry should be gone
      const deletedEntry = enhancedSharing.sharingHistory.find(e => e.id === entryId);
      expect(deletedEntry).toBeUndefined();
    });
    
    test('should clear all history', () => {
      // Add some entries
      for (let i = 0; i < 5; i++) {
        enhancedSharing.addToSharingHistory({
          code: `CLEAR${i}`,
          url: 'http://example.com',
          platform: 'direct'
        });
      }
      
      expect(enhancedSharing.sharingHistory).toHaveLength(5);
      
      // Mock confirm to return true
      global.confirm = jest.fn(() => true);
      
      enhancedSharing.clearSharingHistory();
      
      expect(enhancedSharing.sharingHistory).toHaveLength(0);
    });
  });
  
  describe('Integration Features', () => {
    test('should have all required methods', () => {
      const requiredMethods = [
        'initializeEnhancedSharing',
        'addEnhancedSharingUI',
        'shareToSocial',
        'generateShareMessage',
        'addToSharingHistory',
        'updateSharingHistoryDisplay',
        'getSharingStatistics',
        'enableSocialSharing'
      ];
      
      requiredMethods.forEach(method => {
        expect(typeof enhancedSharing[method]).toBe('function');
      });
    });
    
    test('should handle missing DOM elements gracefully', () => {
      // Mock document.getElementById to return null
      const originalGetElementById = global.document.getElementById;
      global.document.getElementById = jest.fn(() => null);
      
      // Should not throw errors
      expect(() => {
        enhancedSharing.addEnhancedSharingUI();
        enhancedSharing.updateSharingHistoryDisplay();
      }).not.toThrow();
      
      // Restore original function
      global.document.getElementById = originalGetElementById;
    });
    
    test('should create enhanced styles', () => {
      const mockHead = {
        appendChild: jest.fn()
      };
      global.document.head = mockHead;
      
      enhancedSharing.addEnhancedStyles();
      
      expect(mockHead.appendChild).toHaveBeenCalled();
    });
    
    test('should handle localStorage operations', () => {
      const mockLocalStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn()
      };
      global.window.localStorage = mockLocalStorage;
      
      // Test save
      enhancedSharing.addToSharingHistory({
        code: 'STORAGE123',
        url: 'http://example.com',
        platform: 'direct'
      });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'chess-sharing-history',
        expect.any(String)
      );
      
      // Test load
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([
        { code: 'LOADED123', url: 'http://example.com', platform: 'twitter', timestamp: Date.now() }
      ]));
      
      enhancedSharing.loadSharingHistory();
      expect(enhancedSharing.sharingHistory).toHaveLength(1);
      expect(enhancedSharing.sharingHistory[0].code).toBe('LOADED123');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid history operations', () => {
      // Mock console methods
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Try operations with invalid IDs
      enhancedSharing.loadFromHistory('invalid-id');
      enhancedSharing.deleteFromHistory('invalid-id');
      
      // Should handle gracefully
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
    
    test('should handle localStorage errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock localStorage to throw errors
      global.window.localStorage = {
        getItem: () => { throw new Error('Storage error'); },
        setItem: () => { throw new Error('Storage error'); }
      };
      
      // Should handle errors gracefully
      enhancedSharing.loadSharingHistory();
      enhancedSharing.saveSharingHistory();
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🔗 Running Enhanced Sharing Interface Tests...');
  
  // Simple test runner
  const runTests = async () => {
    try {
      const enhancedSharing = new EnhancedSharingInterface();
      
      console.log('✅ Enhanced Sharing Interface instantiated successfully');
      
      // Test social platforms
      const platforms = Object.keys(enhancedSharing.socialPlatforms);
      console.log(`✅ ${platforms.length} social platforms configured:`, platforms.join(', '));
      
      // Test message generation
      const message = enhancedSharing.generateShareMessage('TEST123', 'http://example.com');
      console.log('✅ Share message generated:', message);
      
      // Test history
      enhancedSharing.addToSharingHistory({
        code: 'TEST123',
        url: 'http://example.com',
        platform: 'twitter'
      });
      console.log('✅ History entry added successfully');
      
      const stats = enhancedSharing.getSharingStatistics();
      console.log('✅ Statistics generated:', stats);
      
      console.log('\n🎉 All Enhanced Sharing Interface tests passed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  };
  
  runTests();
}