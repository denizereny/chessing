/**
 * Unit Tests for Position Evaluation Report System
 * 
 * Tests the visual reporting system that displays analysis results from
 * the Advanced Position Analyzer in a user-friendly format.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * Task: 4.2 Pozisyon değerlendirme raporu sistemi
 */

// Mock DOM environment for testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Mock translation function
global.t = (key) => {
  const translations = {
    'positionAnalysisReport': 'Position Analysis Report',
    'positionType': 'Position Type',
    'analysisOverview': 'Analysis Overview',
    'materialBalance': 'Material Balance',
    'pieceActivity': 'Piece Activity',
    'kingSafety': 'King Safety',
    'centerControl': 'Center Control',
    'strategicRecommendations': 'Strategic Recommendations',
    'detailedStatistics': 'Detailed Statistics',
    'balancedPosition': 'Equal position',
    'whiteAdvantagePosition': 'White has advantage',
    'blackAdvantagePosition': 'Black has advantage'
  };
  return translations[key] || key;
};

// Import the classes
const AdvancedPositionAnalyzer = require('../js/advanced-position-analyzer.js');
const PositionEvaluationReport = require('../js/position-evaluation-report.js');

describe('Position Evaluation Report System', () => {
  let analyzer;
  let reportSystem;
  
  // Test positions
  const testPositions = {
    starting: [
      ['r', 'n', 'b', 'q'],
      ['p', 'p', 'p', 'p'],
      [null, null, null, null],
      ['P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q']
    ],
    
    whiteAdvantage: [
      [null, null, null, 'k'],
      [null, 'p', null, 'p'],
      [null, null, null, null],
      ['P', 'P', 'Q', 'P'],
      ['R', 'N', 'B', 'K']
    ],
    
    endgame: [
      [null, null, null, 'k'],
      [null, null, null, null],
      [null, null, 'K', null],
      [null, null, null, null],
      [null, null, null, 'Q']
    ]
  };
  
  beforeEach(() => {
    analyzer = new AdvancedPositionAnalyzer();
    reportSystem = new PositionEvaluationReport();
    
    // Clear DOM
    document.body.innerHTML = '';
  });
  
  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(reportSystem.currentAnalysis).toBeNull();
      expect(reportSystem.isVisible).toBe(false);
      expect(reportSystem.thresholds).toBeDefined();
      expect(reportSystem.positionTypes).toBeDefined();
      expect(reportSystem.kingSafetyIcons).toBeDefined();
    });
    
    test('should create report container in DOM', () => {
      expect(reportSystem.reportContainer).toBeDefined();
      expect(reportSystem.reportContainer.id).toBe('positionEvaluationReport');
      expect(reportSystem.reportContainer.classList.contains('position-evaluation-report')).toBe(true);
    });
  });
  
  describe('Position Type Determination', () => {
    test('should determine balanced position correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      const positionType = reportSystem.determineEnhancedPositionType(analysis);
      
      expect(positionType).toBe('balanced');
    });
    
    test('should determine white advantage correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.whiteAdvantage);
      const positionType = reportSystem.determineEnhancedPositionType(analysis);
      
      expect(positionType).toMatch(/white/);
    });
    
    test('should handle decisive material advantage', () => {
      const analysis = analyzer.analyzePosition(testPositions.endgame);
      const positionType = reportSystem.determineEnhancedPositionType(analysis);
      
      // Endgame with queen vs king should show white advantage
      expect(positionType).toMatch(/white.*advantage/);
    });
  });
  
  describe('Report Generation', () => {
    test('should generate report for valid analysis', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      
      expect(() => {
        reportSystem.generateReport(analysis);
      }).not.toThrow();
      
      expect(reportSystem.currentAnalysis).toBe(analysis);
    });
    
    test('should handle error analysis gracefully', () => {
      const errorAnalysis = {
        error: true,
        message: 'Test error'
      };
      
      expect(() => {
        reportSystem.generateReport(errorAnalysis);
      }).not.toThrow();
    });
    
    test('should update position type display', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const positionTypeIcon = document.getElementById('positionTypeIcon');
      const positionTypeName = document.getElementById('positionTypeName');
      
      expect(positionTypeIcon).toBeTruthy();
      expect(positionTypeName).toBeTruthy();
      expect(positionTypeName.textContent).toContain('Balanced');
    });
  });
  
  describe('Material Balance Display', () => {
    test('should display equal material correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const materialValue = document.getElementById('materialBalanceValue');
      expect(materialValue.textContent).toBe('Equal');
      expect(materialValue.classList.contains('equal')).toBe(true);
    });
    
    test('should display material advantage correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.whiteAdvantage);
      reportSystem.generateReport(analysis);
      
      const materialValue = document.getElementById('materialBalanceValue');
      expect(materialValue.textContent).toMatch(/White \+\d+/);
      expect(materialValue.classList.contains('white-advantage')).toBe(true);
    });
    
    test('should position balance indicator correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.whiteAdvantage);
      reportSystem.generateReport(analysis);
      
      const indicator = document.getElementById('materialBalanceIndicator');
      expect(indicator).toBeTruthy();
      
      // Should be positioned to the right of center for white advantage
      const leftPosition = parseFloat(indicator.style.left);
      expect(leftPosition).toBeGreaterThan(50);
    });
  });
  
  describe('Piece Activity Display', () => {
    test('should display piece activity correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const activityValue = document.getElementById('pieceActivityValue');
      expect(activityValue.textContent).toMatch(/W: \d+, B: \d+/);
    });
    
    test('should set activity bar widths correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteBar = document.getElementById('whiteActivityBar');
      const blackBar = document.getElementById('blackActivityBar');
      
      expect(whiteBar.style.width).toBeTruthy();
      expect(blackBar.style.width).toBeTruthy();
      
      // Both bars should have some width for starting position
      expect(parseFloat(whiteBar.style.width)).toBeGreaterThan(0);
      expect(parseFloat(blackBar.style.width)).toBeGreaterThan(0);
    });
  });
  
  describe('King Safety Display', () => {
    test('should display king safety status correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteKingSafetyText = document.getElementById('whiteKingSafetyText');
      const blackKingSafetyText = document.getElementById('blackKingSafetyText');
      
      expect(whiteKingSafetyText.textContent).toBeTruthy();
      expect(blackKingSafetyText.textContent).toBeTruthy();
    });
    
    test('should set appropriate safety icons', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteKingSafetyIcon = document.getElementById('whiteKingSafetyIcon');
      const blackKingSafetyIcon = document.getElementById('blackKingSafetyIcon');
      
      expect(whiteKingSafetyIcon.textContent).toBeTruthy();
      expect(blackKingSafetyIcon.textContent).toBeTruthy();
    });
    
    test('should apply correct CSS classes for king status', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteKingStatus = document.getElementById('whiteKingStatus');
      const blackKingStatus = document.getElementById('blackKingStatus');
      
      expect(whiteKingStatus.classList.contains('king-status')).toBe(true);
      expect(whiteKingStatus.classList.contains('white-king')).toBe(true);
      expect(blackKingStatus.classList.contains('king-status')).toBe(true);
      expect(blackKingStatus.classList.contains('black-king')).toBe(true);
    });
  });
  
  describe('Center Control Display', () => {
    test('should display center control values correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const centerValue = document.getElementById('centerControlValue');
      expect(centerValue.textContent).toMatch(/\d+-\d+/);
    });
    
    test('should visualize center control correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const centerSquares = document.querySelectorAll('.center-square');
      expect(centerSquares.length).toBe(4);
      
      // Each square should have a control class
      centerSquares.forEach(square => {
        const hasControlClass = square.classList.contains('white-controlled') ||
                               square.classList.contains('black-controlled') ||
                               square.classList.contains('neutral');
        expect(hasControlClass).toBe(true);
      });
    });
  });
  
  describe('Recommendations Display', () => {
    test('should display recommendations when available', () => {
      const analysis = analyzer.analyzePosition(testPositions.whiteAdvantage);
      reportSystem.generateReport(analysis);
      
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        const recommendationItems = document.querySelectorAll('.recommendation-item');
        expect(recommendationItems.length).toBeGreaterThan(0);
        
        recommendationItems.forEach(item => {
          const icon = item.querySelector('.recommendation-icon');
          const text = item.querySelector('.recommendation-text');
          expect(icon).toBeTruthy();
          expect(text).toBeTruthy();
          expect(text.textContent).toBeTruthy();
        });
      }
    });
    
    test('should show no recommendations message when none available', () => {
      const analysis = {
        materialBalance: { advantage: 'equal', advantageAmount: 0 },
        pieceActivity: { white: { mobilePieces: 0 }, black: { mobilePieces: 0 } },
        kingSafety: { white: { status: 'safe' }, black: { status: 'safe' } },
        centerControl: { advantage: 'equal', white: 2, black: 2 },
        recommendations: [],
        timestamp: Date.now()
      };
      
      reportSystem.generateReport(analysis);
      
      const noRecommendations = document.getElementById('noRecommendations');
      expect(noRecommendations.style.display).not.toBe('none');
    });
  });
  
  describe('Detailed Statistics', () => {
    test('should display material breakdown correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteMaterialValue = document.getElementById('whiteMaterialValue');
      const blackMaterialValue = document.getElementById('blackMaterialValue');
      
      expect(whiteMaterialValue.textContent).toBeTruthy();
      expect(blackMaterialValue.textContent).toBeTruthy();
      expect(parseInt(whiteMaterialValue.textContent)).toBeGreaterThan(0);
      expect(parseInt(blackMaterialValue.textContent)).toBeGreaterThan(0);
    });
    
    test('should display activity details correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const totalMovesValue = document.getElementById('totalMovesValue');
      const avgMovesValue = document.getElementById('avgMovesValue');
      
      expect(totalMovesValue.textContent).toMatch(/W: \d+, B: \d+/);
      expect(avgMovesValue.textContent).toMatch(/W: \d+\.\d+, B: \d+\.\d+/);
    });
    
    test('should display safety details correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      const whiteKingPosition = document.getElementById('whiteKingPosition');
      const whiteEscapeSquares = document.getElementById('whiteEscapeSquares');
      const blackKingPosition = document.getElementById('blackKingPosition');
      const blackEscapeSquares = document.getElementById('blackEscapeSquares');
      
      expect(whiteKingPosition.textContent).toContain('Position:');
      expect(whiteEscapeSquares.textContent).toContain('Escape squares:');
      expect(blackKingPosition.textContent).toContain('Position:');
      expect(blackEscapeSquares.textContent).toContain('Escape squares:');
    });
  });
  
  describe('Report Visibility', () => {
    test('should show report when generateReport is called', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      expect(reportSystem.isVisible).toBe(true);
      expect(reportSystem.reportContainer.classList.contains('hidden')).toBe(false);
    });
    
    test('should hide report when hideReport is called', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      reportSystem.hideReport();
      
      expect(reportSystem.isVisible).toBe(false);
    });
  });
  
  describe('Utility Functions', () => {
    test('should format position coordinates correctly', () => {
      const position1 = { row: 0, col: 0 };
      const position2 = { row: 4, col: 3 };
      
      const formatted1 = reportSystem.formatPosition(position1);
      const formatted2 = reportSystem.formatPosition(position2);
      
      expect(formatted1).toBeTruthy();
      expect(formatted2).toBeTruthy();
      expect(typeof formatted1).toBe('string');
      expect(typeof formatted2).toBe('string');
    });
    
    test('should get appropriate recommendation icons', () => {
      const attackRec = 'White should attack the king';
      const defendRec = 'Black needs to defend the position';
      const centerRec = 'Control the center squares';
      
      const attackIcon = reportSystem.getRecommendationIcon(attackRec);
      const defendIcon = reportSystem.getRecommendationIcon(defendRec);
      const centerIcon = reportSystem.getRecommendationIcon(centerRec);
      
      expect(attackIcon).toBe('⚔️');
      expect(defendIcon).toBe('🛡️');
      expect(centerIcon).toBe('🎯');
    });
    
    test('should format piece counts correctly', () => {
      const pieces = { q: 1, r: 2, n: 1, p: 3 };
      const formatted = reportSystem.formatPieceCounts(pieces);
      
      expect(formatted).toContain('♕×1');
      expect(formatted).toContain('♖×2');
      expect(formatted).toContain('♘×1');
      expect(formatted).toContain('♙×3');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle null analysis gracefully', () => {
      expect(() => {
        reportSystem.generateReport(null);
      }).not.toThrow();
    });
    
    test('should handle undefined analysis gracefully', () => {
      expect(() => {
        reportSystem.generateReport(undefined);
      }).not.toThrow();
    });
    
    test('should display error message for invalid analysis', () => {
      const errorAnalysis = {
        error: true,
        message: 'Invalid position'
      };
      
      reportSystem.generateReport(errorAnalysis);
      
      // Should call displayErrorReport
      expect(() => {
        reportSystem.displayErrorReport('Test error');
      }).not.toThrow();
    });
  });
  
  describe('Export and Share Functionality', () => {
    test('should export report data correctly', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      expect(() => {
        reportSystem.exportReport();
      }).not.toThrow();
    });
    
    test('should handle share functionality', () => {
      const analysis = analyzer.analyzePosition(testPositions.starting);
      reportSystem.generateReport(analysis);
      
      expect(() => {
        reportSystem.shareReport();
      }).not.toThrow();
    });
    
    test('should not export when no analysis available', () => {
      expect(() => {
        reportSystem.exportReport();
      }).not.toThrow();
    });
  });
});

// Run the tests
console.log('🧪 Running Position Evaluation Report System Tests...\n');

// Simple test runner for Node.js environment
function describe(name, fn) {
  console.log(`📋 ${name}`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
  } catch (error) {
    console.log(`  ❌ ${name}: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toMatch: (pattern) => {
      if (!actual.match(pattern)) {
        throw new Error(`Expected ${actual} to match ${pattern}`);
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    },
    not: {
      toThrow: () => {
        try {
          actual();
        } catch (error) {
          throw new Error(`Expected function not to throw, but it threw: ${error.message}`);
        }
      },
      toBe: (expected) => {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`);
        }
      }
    }
  };
}

function beforeEach(fn) {
  // Simple beforeEach implementation
  fn();
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    describe,
    test,
    expect,
    beforeEach
  };
}