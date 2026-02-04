/**
 * Extended Preset Manager for Enhanced Piece Setup
 * Provides category-based preset organization with metadata management
 * Requirements: 2.1, 2.2, 2.3
 */

class ExtendedPresetManager {
  constructor() {
    this.presets = {
      opening: [],
      middlegame: [],
      endgame: [],
      puzzle: [],
      tactical: [],
      educational: []
    };
    
    this.customPresets = new Map();
    this.storageKey = 'enhanced-piece-setup-presets';
    
    // Initialize with default presets
    this.initializeDefaultPresets();
    this.loadCustomPresets();
  }

  /**
   * Initialize default preset collection (20+ presets)
   * Each preset includes position, name, description, and category
   */
  initializeDefaultPresets() {
    // Opening Presets (5 presets)
    this.presets.opening = [
      {
        id: 'opening-1',
        name: 'Standard Opening',
        description: 'Classic 4x5 starting position with all pieces',
        category: 'opening',
        difficulty: 1,
        position: [
          ["r", "q", "k", "r"],
          ["p", "p", "p", "p"],
          [null, null, null, null],
          ["P", "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['standard', 'beginner', 'balanced']
      },
      {
        id: 'opening-2',
        name: 'Aggressive Opening',
        description: 'Forward pawn structure for aggressive play',
        category: 'opening',
        difficulty: 2,
        position: [
          ["r", "q", "k", "r"],
          [null, "p", "p", "p"],
          ["p", null, null, null],
          ["P", "P", null, "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['aggressive', 'pawn-storm', 'tactical']
      },
      {
        id: 'opening-3',
        name: 'Defensive Setup',
        description: 'Solid defensive formation with king safety',
        category: 'opening',
        difficulty: 2,
        position: [
          ["r", null, "k", "r"],
          ["p", "p", "q", "p"],
          [null, null, "p", null],
          ["P", "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['defensive', 'king-safety', 'solid']
      },
      {
        id: 'opening-4',
        name: 'Gambit Opening',
        description: 'Sacrificial opening for quick development',
        category: 'opening',
        difficulty: 3,
        position: [
          ["r", "q", "k", "r"],
          ["p", null, "p", "p"],
          [null, "p", null, null],
          [null, "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['gambit', 'sacrifice', 'development']
      },
      {
        id: 'opening-5',
        name: 'Asymmetric Opening',
        description: 'Unbalanced position with different piece placement',
        category: 'opening',
        difficulty: 3,
        position: [
          ["r", "k", "q", "r"],
          ["p", "p", "p", "p"],
          [null, null, null, null],
          ["P", "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['asymmetric', 'unbalanced', 'creative']
      }
    ];

    // Middlegame Presets (5 presets)
    this.presets.middlegame = [
      {
        id: 'middlegame-1',
        name: 'Central Control',
        description: 'Battle for the center with active pieces',
        category: 'middlegame',
        difficulty: 2,
        position: [
          ["r", null, "k", "r"],
          ["p", "p", null, "p"],
          [null, "q", "N", null],
          ["P", "P", null, "P"],
          ["R", "Q", "K", null]
        ],
        tags: ['center-control', 'active-pieces', 'strategic']
      },
      {
        id: 'middlegame-2',
        name: 'Piece Activity',
        description: 'Complex middlegame with active piece play',
        category: 'middlegame',
        difficulty: 3,
        position: [
          ["r", null, "k", null],
          [null, "p", "q", "p"],
          ["p", null, "B", null],
          ["P", null, "N", "P"],
          ["R", null, "K", "R"]
        ],
        tags: ['piece-activity', 'complex', 'tactical']
      },
      {
        id: 'middlegame-3',
        name: 'Pawn Structure',
        description: 'Focus on pawn structure and weaknesses',
        category: 'middlegame',
        difficulty: 2,
        position: [
          [null, "r", "k", null],
          ["p", null, "p", "p"],
          [null, "p", null, "q"],
          ["P", "P", null, null],
          ["R", "Q", "K", "R"]
        ],
        tags: ['pawn-structure', 'weaknesses', 'positional']
      },
      {
        id: 'middlegame-4',
        name: 'King Hunt',
        description: 'Exposed king under attack',
        category: 'middlegame',
        difficulty: 4,
        position: [
          [null, null, null, "r"],
          ["p", "k", "p", null],
          [null, "Q", null, "p"],
          ["P", null, "N", "P"],
          ["R", null, "K", null]
        ],
        tags: ['king-hunt', 'attack', 'tactical']
      },
      {
        id: 'middlegame-5',
        name: 'Material Imbalance',
        description: 'Unequal material with compensation',
        category: 'middlegame',
        difficulty: 3,
        position: [
          ["r", null, "k", null],
          ["p", "p", null, "p"],
          [null, null, "q", null],
          ["P", "P", "P", null],
          [null, "Q", "K", "R"]
        ],
        tags: ['material-imbalance', 'compensation', 'evaluation']
      }
    ];

    // Endgame Presets (5 presets)
    this.presets.endgame = [
      {
        id: 'endgame-1',
        name: 'King and Pawn',
        description: 'Basic king and pawn endgame',
        category: 'endgame',
        difficulty: 1,
        position: [
          [null, null, "k", null],
          [null, null, null, null],
          [null, null, null, null],
          ["P", null, null, null],
          [null, null, "K", null]
        ],
        tags: ['king-pawn', 'basic', 'technique']
      },
      {
        id: 'endgame-2',
        name: 'Rook Endgame',
        description: 'Rook and pawn vs rook endgame',
        category: 'endgame',
        difficulty: 3,
        position: [
          [null, null, "k", null],
          [null, null, "r", null],
          [null, null, null, null],
          ["P", null, null, null],
          ["R", null, "K", null]
        ],
        tags: ['rook-endgame', 'technique', 'precision']
      },
      {
        id: 'endgame-3',
        name: 'Queen vs Pawns',
        description: 'Queen stopping multiple pawns',
        category: 'endgame',
        difficulty: 4,
        position: [
          [null, null, "k", null],
          ["p", "p", null, null],
          [null, null, null, null],
          [null, null, "Q", null],
          [null, null, "K", null]
        ],
        tags: ['queen-endgame', 'pawns', 'stopping']
      },
      {
        id: 'endgame-4',
        name: 'Opposite Bishops',
        description: 'Opposite colored bishops endgame',
        category: 'endgame',
        difficulty: 3,
        position: [
          [null, "b", "k", null],
          [null, null, "p", null],
          [null, null, null, null],
          [null, "P", null, null],
          [null, "B", "K", null]
        ],
        tags: ['bishops', 'opposite-colors', 'drawing']
      },
      {
        id: 'endgame-5',
        name: 'Promotion Race',
        description: 'Pawn promotion race',
        category: 'endgame',
        difficulty: 2,
        position: [
          [null, null, "k", null],
          [null, null, null, "p"],
          [null, null, null, null],
          ["P", null, null, null],
          [null, null, "K", null]
        ],
        tags: ['promotion', 'race', 'calculation']
      }
    ];

    // Puzzle Presets (3 presets)
    this.presets.puzzle = [
      {
        id: 'puzzle-1',
        name: 'Mate in 2',
        description: 'Find the forced mate in 2 moves',
        category: 'puzzle',
        difficulty: 3,
        position: [
          [null, null, "k", null],
          [null, "p", null, null],
          [null, null, "Q", null],
          [null, null, null, null],
          [null, null, "K", null]
        ],
        tags: ['mate-in-2', 'forced', 'calculation']
      },
      {
        id: 'puzzle-2',
        name: 'Pin Tactic',
        description: 'Exploit the pin to win material',
        category: 'puzzle',
        difficulty: 2,
        position: [
          ["r", null, "k", null],
          [null, "q", "p", "p"],
          [null, null, "B", null],
          ["P", "P", null, "P"],
          ["R", null, "K", null]
        ],
        tags: ['pin', 'tactic', 'material']
      },
      {
        id: 'puzzle-3',
        name: 'Fork Attack',
        description: 'Knight fork winning the queen',
        category: 'puzzle',
        difficulty: 2,
        position: [
          [null, "q", "k", "r"],
          ["p", "p", null, "p"],
          [null, null, null, null],
          [null, "N", "P", "P"],
          ["R", "Q", "K", null]
        ],
        tags: ['fork', 'knight', 'queen-win']
      }
    ];

    // Tactical Presets (4 presets)
    this.presets.tactical = [
      {
        id: 'tactical-1',
        name: 'Double Attack',
        description: 'Multiple threats at once',
        category: 'tactical',
        difficulty: 3,
        position: [
          ["r", null, "k", null],
          ["p", "p", "q", "p"],
          [null, null, "N", null],
          ["P", "P", null, "P"],
          ["R", "Q", "K", null]
        ],
        tags: ['double-attack', 'threats', 'tactical']
      },
      {
        id: 'tactical-2',
        name: 'Discovered Attack',
        description: 'Powerful discovered attack pattern',
        category: 'tactical',
        difficulty: 4,
        position: [
          [null, "r", "k", null],
          ["p", null, "p", "p"],
          [null, "B", "q", null],
          ["P", "N", null, "P"],
          ["R", null, "K", null]
        ],
        tags: ['discovered-attack', 'pattern', 'powerful']
      },
      {
        id: 'tactical-3',
        name: 'Deflection',
        description: 'Force defender away from key square',
        category: 'tactical',
        difficulty: 3,
        position: [
          [null, null, "k", "r"],
          [null, "p", "q", null],
          [null, null, "R", "p"],
          ["P", "P", null, null],
          [null, "Q", "K", null]
        ],
        tags: ['deflection', 'defender', 'key-square']
      },
      {
        id: 'tactical-4',
        name: 'Sacrifice Attack',
        description: 'Material sacrifice for decisive attack',
        category: 'tactical',
        difficulty: 4,
        position: [
          [null, null, "k", null],
          ["p", "p", null, "r"],
          [null, "Q", "p", null],
          [null, "P", "N", "P"],
          ["R", null, "K", null]
        ],
        tags: ['sacrifice', 'attack', 'decisive']
      }
    ];

    // Educational Presets (3 presets)
    this.presets.educational = [
      {
        id: 'educational-1',
        name: 'Piece Values',
        description: 'Learn relative piece values',
        category: 'educational',
        difficulty: 1,
        position: [
          ["r", "q", "k", "r"],
          ["p", "p", "p", "p"],
          [null, null, null, null],
          ["P", "P", "P", "P"],
          ["R", "Q", "K", "R"]
        ],
        tags: ['piece-values', 'learning', 'basics']
      },
      {
        id: 'educational-2',
        name: 'Checkmate Patterns',
        description: 'Common checkmate patterns',
        category: 'educational',
        difficulty: 2,
        position: [
          [null, null, "k", null],
          [null, null, "p", null],
          [null, "Q", null, null],
          [null, null, null, null],
          [null, null, "K", null]
        ],
        tags: ['checkmate', 'patterns', 'learning']
      },
      {
        id: 'educational-3',
        name: 'Development Principles',
        description: 'Proper piece development',
        category: 'educational',
        difficulty: 1,
        position: [
          ["r", null, "k", "r"],
          ["p", "p", "q", "p"],
          [null, "n", "b", null],
          ["P", "P", "P", "P"],
          ["R", "N", "K", "R"]
        ],
        tags: ['development', 'principles', 'opening']
      }
    ];
  }

  /**
   * Get presets by category
   * @param {string} category - Category name
   * @returns {Array} Array of presets in the category
   */
  getPresetsByCategory(category) {
    return this.presets[category] || [];
  }

  /**
   * Get all categories
   * @returns {Array} Array of category names
   */
  getCategories() {
    return Object.keys(this.presets);
  }

  /**
   * Get preset by ID
   * @param {string} presetId - Preset identifier
   * @returns {Object|null} Preset object or null if not found
   */
  getPresetById(presetId) {
    for (const category of Object.keys(this.presets)) {
      const preset = this.presets[category].find(p => p.id === presetId);
      if (preset) return preset;
    }
    
    // Check custom presets
    return this.customPresets.get(presetId) || null;
  }

  /**
   * Get all presets (default + custom)
   * @returns {Array} Array of all presets
   */
  getAllPresets() {
    const allPresets = [];
    
    // Add default presets
    for (const category of Object.keys(this.presets)) {
      allPresets.push(...this.presets[category]);
    }
    
    // Add custom presets
    for (const preset of this.customPresets.values()) {
      allPresets.push(preset);
    }
    
    return allPresets;
  }

  /**
   * Create custom preset
   * @param {string} name - Preset name
   * @param {string} description - Preset description
   * @param {Array} position - Board position array
   * @param {string} category - Preset category
   * @param {Array} tags - Optional tags
   * @returns {Object} Created preset object
   */
  createCustomPreset(name, description, position, category = 'custom', tags = []) {
    const presetId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const preset = {
      id: presetId,
      name: name,
      description: description,
      category: category,
      position: position.map(row => [...row]), // Deep copy
      tags: [...tags],
      custom: true,
      created: Date.now()
    };
    
    this.customPresets.set(presetId, preset);
    this.saveCustomPresets();
    
    return preset;
  }

  /**
   * Delete custom preset
   * @param {string} presetId - Preset ID to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteCustomPreset(presetId) {
    if (this.customPresets.has(presetId)) {
      this.customPresets.delete(presetId);
      this.saveCustomPresets();
      return true;
    }
    return false;
  }

  /**
   * Update custom preset
   * @param {string} presetId - Preset ID to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} True if updated, false if not found
   */
  updateCustomPreset(presetId, updates) {
    const preset = this.customPresets.get(presetId);
    if (preset) {
      Object.assign(preset, updates);
      preset.modified = Date.now();
      this.saveCustomPresets();
      return true;
    }
    return false;
  }

  /**
   * Search presets by name, description, or tags
   * @param {string} query - Search query
   * @returns {Array} Array of matching presets
   */
  searchPresets(query) {
    const searchTerm = query.toLowerCase();
    const allPresets = this.getAllPresets();
    
    return allPresets.filter(preset => {
      return preset.name.toLowerCase().includes(searchTerm) ||
             preset.description.toLowerCase().includes(searchTerm) ||
             preset.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    });
  }

  /**
   * Get presets by difficulty level
   * @param {number} difficulty - Difficulty level (1-4)
   * @returns {Array} Array of presets with matching difficulty
   */
  getPresetsByDifficulty(difficulty) {
    const allPresets = this.getAllPresets();
    return allPresets.filter(preset => preset.difficulty === difficulty);
  }

  /**
   * Get preset statistics
   * @returns {Object} Statistics about presets
   */
  getPresetStatistics() {
    const stats = {
      total: 0,
      byCategory: {},
      byDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0 },
      custom: this.customPresets.size
    };
    
    const allPresets = this.getAllPresets();
    stats.total = allPresets.length;
    
    allPresets.forEach(preset => {
      // Count by category
      stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
      
      // Count by difficulty
      if (preset.difficulty) {
        stats.byDifficulty[preset.difficulty]++;
      }
    });
    
    return stats;
  }

  /**
   * Export presets to JSON
   * @param {boolean} includeCustom - Whether to include custom presets
   * @returns {string} JSON string of presets
   */
  exportPresets(includeCustom = true) {
    const exportData = {
      version: '1.0',
      timestamp: Date.now(),
      presets: includeCustom ? this.getAllPresets() : this.getAllPresets().filter(p => !p.custom)
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import presets from JSON
   * @param {string} jsonData - JSON string of presets
   * @returns {Object} Import result with success/error info
   */
  importPresets(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.presets || !Array.isArray(data.presets)) {
        throw new Error('Invalid preset data format');
      }
      
      let imported = 0;
      let skipped = 0;
      
      data.presets.forEach(preset => {
        if (preset.custom && !this.customPresets.has(preset.id)) {
          this.customPresets.set(preset.id, preset);
          imported++;
        } else if (preset.custom) {
          skipped++;
        }
      });
      
      if (imported > 0) {
        this.saveCustomPresets();
      }
      
      return {
        success: true,
        imported: imported,
        skipped: skipped,
        message: `Imported ${imported} presets, skipped ${skipped} duplicates`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to import presets'
      };
    }
  }

  /**
   * Load custom presets from localStorage
   */
  loadCustomPresets() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.customPresets = new Map(data.customPresets || []);
      }
    } catch (error) {
      console.warn('Failed to load custom presets:', error);
      this.customPresets = new Map();
    }
  }

  /**
   * Save custom presets to localStorage
   */
  saveCustomPresets() {
    try {
      const data = {
        version: '1.0',
        timestamp: Date.now(),
        customPresets: Array.from(this.customPresets.entries())
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save custom presets:', error);
    }
  }

  /**
   * Validate preset position
   * @param {Array} position - Board position to validate
   * @returns {Object} Validation result
   */
  validatePresetPosition(position) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // Check board dimensions
    if (!Array.isArray(position) || position.length !== 5) {
      result.valid = false;
      result.errors.push('Position must be a 5x4 array');
      return result;
    }
    
    for (let i = 0; i < 5; i++) {
      if (!Array.isArray(position[i]) || position[i].length !== 4) {
        result.valid = false;
        result.errors.push(`Row ${i} must have exactly 4 columns`);
        return result;
      }
    }
    
    // Count kings
    let whiteKings = 0, blackKings = 0;
    let totalPieces = 0;
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        const piece = position[i][j];
        if (piece) {
          totalPieces++;
          if (piece === 'K') whiteKings++;
          if (piece === 'k') blackKings++;
          
          // Validate piece type
          if (!/^[KQRBNPkqrbnp]$/.test(piece)) {
            result.valid = false;
            result.errors.push(`Invalid piece '${piece}' at position [${i},${j}]`);
          }
        }
      }
    }
    
    // King validation
    if (whiteKings !== 1) {
      result.valid = false;
      result.errors.push(`Must have exactly 1 white king (found ${whiteKings})`);
    }
    
    if (blackKings !== 1) {
      result.valid = false;
      result.errors.push(`Must have exactly 1 black king (found ${blackKings})`);
    }
    
    // Warnings for unusual positions
    if (totalPieces < 4) {
      result.warnings.push('Very few pieces on board');
    }
    
    if (totalPieces > 16) {
      result.warnings.push('Many pieces on small board');
    }
    
    return result;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExtendedPresetManager;
} else if (typeof window !== 'undefined') {
  window.ExtendedPresetManager = ExtendedPresetManager;
}