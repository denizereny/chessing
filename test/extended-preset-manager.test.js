/**
 * Unit Tests for Extended Preset Manager
 * Tests basic functionality and preset management
 */

// Mock localStorage for testing
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  },
  clear: function() {
    this.data = {};
  }
};

// Set up global localStorage mock
global.localStorage = mockLocalStorage;

// Import the ExtendedPresetManager
const ExtendedPresetManager = require('../js/extended-preset-manager.js');

describe('ExtendedPresetManager', () => {
  let presetManager;

  beforeEach(() => {
    mockLocalStorage.clear();
    presetManager = new ExtendedPresetManager();
  });

  describe('Initialization', () => {
    test('should initialize with default presets', () => {
      const stats = presetManager.getPresetStatistics();
      expect(stats.total).toBeGreaterThanOrEqual(20);
      expect(stats.byCategory.opening).toBeGreaterThanOrEqual(5);
      expect(stats.byCategory.middlegame).toBeGreaterThanOrEqual(5);
      expect(stats.byCategory.endgame).toBeGreaterThanOrEqual(5);
      expect(stats.byCategory.puzzle).toBeGreaterThanOrEqual(3);
      expect(stats.byCategory.tactical).toBeGreaterThanOrEqual(4);
    });

    test('should have all required categories', () => {
      const categories = presetManager.getCategories();
      expect(categories).toContain('opening');
      expect(categories).toContain('middlegame');
      expect(categories).toContain('endgame');
      expect(categories).toContain('puzzle');
      expect(categories).toContain('tactical');
      expect(categories).toContain('educational');
    });
  });

  describe('Preset Retrieval', () => {
    test('should get presets by category', () => {
      const openingPresets = presetManager.getPresetsByCategory('opening');
      expect(openingPresets.length).toBeGreaterThanOrEqual(5);
      
      openingPresets.forEach(preset => {
        expect(preset.category).toBe('opening');
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(preset.position).toBeDefined();
        expect(Array.isArray(preset.position)).toBe(true);
        expect(preset.position.length).toBe(5);
        expect(preset.position[0].length).toBe(4);
      });
    });

    test('should get preset by ID', () => {
      const preset = presetManager.getPresetById('opening-1');
      expect(preset).toBeDefined();
      expect(preset.id).toBe('opening-1');
      expect(preset.name).toBe('Standard Opening');
      expect(preset.category).toBe('opening');
    });

    test('should return null for non-existent preset ID', () => {
      const preset = presetManager.getPresetById('non-existent');
      expect(preset).toBeNull();
    });
  });

  describe('Preset Validation', () => {
    test('should validate valid preset position', () => {
      const validPosition = [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ];
      
      const result = presetManager.validatePresetPosition(validPosition);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should reject position without kings', () => {
      const invalidPosition = [
        ["r", "q", null, "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", null, "R"]
      ];
      
      const result = presetManager.validatePresetPosition(invalidPosition);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject position with wrong dimensions', () => {
      const invalidPosition = [
        ["r", "q", "k"],  // Wrong column count
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ];
      
      const result = presetManager.validatePresetPosition(invalidPosition);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Presets', () => {
    test('should create custom preset', () => {
      const position = [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ];
      
      const preset = presetManager.createCustomPreset(
        'My Custom Preset',
        'A test custom preset',
        position,
        'custom',
        ['test']
      );
      
      expect(preset).toBeDefined();
      expect(preset.name).toBe('My Custom Preset');
      expect(preset.description).toBe('A test custom preset');
      expect(preset.category).toBe('custom');
      expect(preset.custom).toBe(true);
      expect(preset.tags).toContain('test');
    });

    test('should save and load custom presets', () => {
      const position = [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ];
      
      const preset = presetManager.createCustomPreset(
        'Test Preset',
        'Test description',
        position
      );
      
      // Create new manager instance to test loading
      const newManager = new ExtendedPresetManager();
      const loadedPreset = newManager.getPresetById(preset.id);
      
      expect(loadedPreset).toBeDefined();
      expect(loadedPreset.name).toBe('Test Preset');
      expect(loadedPreset.custom).toBe(true);
    });

    test('should delete custom preset', () => {
      const position = [
        ["r", "q", "k", "r"],
        ["p", "p", "p", "p"],
        [null, null, null, null],
        ["P", "P", "P", "P"],
        ["R", "Q", "K", "R"]
      ];
      
      const preset = presetManager.createCustomPreset(
        'To Delete',
        'Will be deleted',
        position
      );
      
      expect(presetManager.getPresetById(preset.id)).toBeDefined();
      
      const deleted = presetManager.deleteCustomPreset(preset.id);
      expect(deleted).toBe(true);
      expect(presetManager.getPresetById(preset.id)).toBeNull();
    });
  });

  describe('Search Functionality', () => {
    test('should search presets by name', () => {
      const results = presetManager.searchPresets('Standard');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toContain('Standard');
    });

    test('should search presets by description', () => {
      const results = presetManager.searchPresets('opening');
      expect(results.length).toBeGreaterThan(0);
    });

    test('should search presets by tags', () => {
      const results = presetManager.searchPresets('tactical');
      expect(results.length).toBeGreaterThan(0);
    });

    test('should return empty array for no matches', () => {
      const results = presetManager.searchPresets('nonexistent');
      expect(results.length).toBe(0);
    });
  });

  describe('Difficulty Filtering', () => {
    test('should get presets by difficulty', () => {
      const easyPresets = presetManager.getPresetsByDifficulty(1);
      expect(easyPresets.length).toBeGreaterThan(0);
      
      easyPresets.forEach(preset => {
        expect(preset.difficulty).toBe(1);
      });
    });
  });

  describe('Import/Export', () => {
    test('should export presets to JSON', () => {
      const exported = presetManager.exportPresets(false);
      expect(typeof exported).toBe('string');
      
      const data = JSON.parse(exported);
      expect(data.version).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(Array.isArray(data.presets)).toBe(true);
      expect(data.presets.length).toBeGreaterThan(0);
    });

    test('should import custom presets from JSON', () => {
      const customPreset = {
        id: 'import-test',
        name: 'Imported Preset',
        description: 'Test import',
        category: 'custom',
        position: [
          ["r", "q", "k", "r"],
          ["p", "p", "p", "p"],
          [null, null, null, null],
          ["P", "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        custom: true,
        tags: ['imported']
      };
      
      const importData = {
        version: '1.0',
        timestamp: Date.now(),
        presets: [customPreset]
      };
      
      const result = presetManager.importPresets(JSON.stringify(importData));
      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      
      const imported = presetManager.getPresetById('import-test');
      expect(imported).toBeDefined();
      expect(imported.name).toBe('Imported Preset');
    });
  });

  describe('Statistics', () => {
    test('should provide accurate statistics', () => {
      const stats = presetManager.getPresetStatistics();
      
      expect(typeof stats.total).toBe('number');
      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.byCategory).toBe('object');
      expect(typeof stats.byDifficulty).toBe('object');
      expect(typeof stats.custom).toBe('number');
      
      // Verify category counts add up
      const categoryTotal = Object.values(stats.byCategory).reduce((sum, count) => sum + count, 0);
      expect(categoryTotal).toBe(stats.total);
    });
  });
});

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ExtendedPresetManager };
}