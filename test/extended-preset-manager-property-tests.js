/**
 * Property-Based Tests for Extended Preset Manager
 * Custom implementation for testing preset system functionality
 * 
 * Task: 2.3 Preset sistem testlerini yaz
 * Property 3: Preset Kategori Organizasyonu
 * Property 4: Preset Yükleme ve Analiz
 * Property 5: Kullanıcı Preset Yönetimi
 * Validates: Requirements 2.2, 2.3, 2.4, 2.5
 */

// Simple property-based testing framework (reused from ui-interactions)
class PropertyTester {
  constructor() {
    this.results = [];
    this.totalIterations = 0;
  }

  // Generate random integers
  integer(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random elements from array
  oneOf(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Generate random boolean
  boolean() {
    return Math.random() < 0.5;
  }

  // Generate random string
  string(minLength = 1, maxLength = 20) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    const length = this.integer(minLength, maxLength);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  // Generate array of elements
  array(generator, minLength = 0, maxLength = 10) {
    const length = this.integer(minLength, maxLength);
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(generator());
    }
    return result;
  }

  // Run property test
  check(property, options = {}) {
    const numRuns = options.numRuns || 100;
    const results = [];
    
    for (let i = 0; i < numRuns; i++) {
      try {
        const testData = options.generator ? options.generator() : {};
        const result = property(testData);
        results.push({ success: result, iteration: i + 1, data: testData });
        
        if (!result) {
          return {
            success: false,
            numRuns: i + 1,
            counterexample: testData,
            results: results
          };
        }
      } catch (error) {
        return {
          success: false,
          numRuns: i + 1,
          error: error.message,
          results: results
        };
      }
    }
    
    this.totalIterations += numRuns;
    return {
      success: true,
      numRuns: numRuns,
      results: results
    };
  }

  // Test runner
  runTest(name, property, generator, numRuns = 100) {
    console.log(`🔬 Running property test: ${name}`);
    
    const result = this.check(property, { 
      numRuns: numRuns,
      generator: generator 
    });
    
    this.results.push({
      name: name,
      success: result.success,
      numRuns: result.numRuns,
      counterexample: result.counterexample,
      error: result.error
    });
    
    if (result.success) {
      console.log(`✅ ${name}: Passed ${result.numRuns} iterations`);
    } else {
      console.log(`❌ ${name}: Failed at iteration ${result.numRuns}`);
      if (result.counterexample) {
        console.log(`   Counterexample:`, result.counterexample);
      }
      if (result.error) {
        console.log(`   Error:`, result.error);
      }
    }
    
    return result;
  }

  // Get summary
  getSummary() {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.length - passed;
    
    return {
      total: this.results.length,
      passed: passed,
      failed: failed,
      totalIterations: this.totalIterations,
      results: this.results
    };
  }
}

// Initialize property tester
const propertyTester = new PropertyTester();

// Mock setup for testing
function setupTestEnvironment() {
  // Mock localStorage
  if (typeof window !== 'undefined' && !window.localStorage) {
    window.localStorage = {
      data: {},
      getItem: function(key) { return this.data[key] || null; },
      setItem: function(key, value) { this.data[key] = value; },
      removeItem: function(key) { delete this.data[key]; },
      clear: function() { this.data = {}; }
    };
  }
}

// Property 3: Preset Kategori Organizasyonu
function testPresetCategoryOrganization() {
  console.log('\n📁 Testing Property 3: Preset Kategori Organizasyonu');
  
  const presetManager = new ExtendedPresetManager();

  // Generator for category tests
  const categoryGenerator = () => {
    const categories = ['opening', 'middlegame', 'endgame', 'puzzle', 'tactical', 'educational'];
    return {
      category: propertyTester.oneOf(categories),
      expectedMinimum: {
        'opening': 5,
        'middlegame': 5, 
        'endgame': 5,
        'puzzle': 3,
        'tactical': 4,
        'educational': 3
      }
    };
  };

  // Property: Each category should have minimum required presets
  const categoryMinimumProperty = (scenario) => {
    const presets = presetManager.getPresetsByCategory(scenario.category);
    const minimum = scenario.expectedMinimum[scenario.category];
    
    if (presets.length < minimum) {
      console.log(`❌ Category ${scenario.category} has ${presets.length} presets, expected at least ${minimum}`);
      return false;
    }
    
    return true;
  };

  const result1 = propertyTester.runTest(
    'Each category should have minimum required presets',
    categoryMinimumProperty,
    categoryGenerator,
    50
  );

  // Property: All presets in category should have correct category field
  const categoryConsistencyProperty = (scenario) => {
    const presets = presetManager.getPresetsByCategory(scenario.category);
    
    return presets.every(preset => {
      if (preset.category !== scenario.category) {
        console.log(`❌ Preset ${preset.id} in category ${scenario.category} has wrong category field: ${preset.category}`);
        return false;
      }
      return true;
    });
  };

  const result2 = propertyTester.runTest(
    'All presets in category should have correct category field',
    categoryConsistencyProperty,
    categoryGenerator,
    50
  );

  // Property: All presets should have required metadata
  const metadataProperty = (scenario) => {
    const presets = presetManager.getPresetsByCategory(scenario.category);
    
    return presets.every(preset => {
      const hasRequiredFields = preset.id && 
                               preset.name && 
                               preset.description && 
                               preset.category && 
                               preset.position &&
                               Array.isArray(preset.tags);
      
      if (!hasRequiredFields) {
        console.log(`❌ Preset ${preset.id} missing required metadata fields`);
        return false;
      }
      
      // Check position structure
      if (!Array.isArray(preset.position) || preset.position.length !== 5) {
        console.log(`❌ Preset ${preset.id} has invalid position structure`);
        return false;
      }
      
      for (let i = 0; i < 5; i++) {
        if (!Array.isArray(preset.position[i]) || preset.position[i].length !== 4) {
          console.log(`❌ Preset ${preset.id} has invalid position row ${i}`);
          return false;
        }
      }
      
      return true;
    });
  };

  const result3 = propertyTester.runTest(
    'All presets should have required metadata and valid position',
    metadataProperty,
    categoryGenerator,
    50
  );

  // Property: Total presets should be at least 20
  const totalPresetsProperty = () => {
    const stats = presetManager.getPresetStatistics();
    return stats.total >= 20;
  };

  const result4 = propertyTester.runTest(
    'Total presets should be at least 20',
    totalPresetsProperty,
    () => ({}),
    1
  );

  return [result1, result2, result3, result4];
}

// Property 4: Preset Yükleme ve Analiz
function testPresetLoadingAndAnalysis() {
  console.log('\n⚡ Testing Property 4: Preset Yükleme ve Analiz');
  
  const presetManager = new ExtendedPresetManager();

  // Generator for preset loading tests
  const presetLoadingGenerator = () => {
    const allPresets = presetManager.getAllPresets();
    return {
      preset: propertyTester.oneOf(allPresets)
    };
  };

  // Property: All presets should be loadable by ID
  const presetLoadabilityProperty = (scenario) => {
    const loadedPreset = presetManager.getPresetById(scenario.preset.id);
    
    if (!loadedPreset) {
      console.log(`❌ Could not load preset with ID: ${scenario.preset.id}`);
      return false;
    }
    
    // Check that loaded preset matches original
    if (loadedPreset.id !== scenario.preset.id ||
        loadedPreset.name !== scenario.preset.name ||
        loadedPreset.category !== scenario.preset.category) {
      console.log(`❌ Loaded preset data doesn't match original for ID: ${scenario.preset.id}`);
      return false;
    }
    
    return true;
  };

  const result1 = propertyTester.runTest(
    'All presets should be loadable by ID',
    presetLoadabilityProperty,
    presetLoadingGenerator,
    100
  );

  // Property: Preset positions should be valid for analysis
  const presetValidityProperty = (scenario) => {
    const validation = presetManager.validatePresetPosition(scenario.preset.position);
    
    if (!validation.valid) {
      console.log(`❌ Preset ${scenario.preset.id} has invalid position:`, validation.errors);
      return false;
    }
    
    return true;
  };

  const result2 = propertyTester.runTest(
    'All preset positions should be valid for analysis',
    presetValidityProperty,
    presetLoadingGenerator,
    100
  );

  // Property: Preset loading should be fast (simulated performance test)
  const loadingPerformanceProperty = (scenario) => {
    const startTime = performance.now();
    const loadedPreset = presetManager.getPresetById(scenario.preset.id);
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    
    if (!loadedPreset) {
      console.log(`❌ Failed to load preset ${scenario.preset.id}`);
      return false;
    }
    
    // Should load in under 200ms (requirement 8.3)
    if (loadTime > 200) {
      console.log(`❌ Preset ${scenario.preset.id} took ${loadTime}ms to load, expected < 200ms`);
      return false;
    }
    
    return true;
  };

  const result3 = propertyTester.runTest(
    'Preset loading should be fast (< 200ms)',
    loadingPerformanceProperty,
    presetLoadingGenerator,
    50
  );

  // Property: Search functionality should work correctly
  const searchGenerator = () => {
    const searchTerms = ['opening', 'tactical', 'king', 'pawn', 'mate', 'standard', 'aggressive', 'defensive'];
    return {
      searchTerm: propertyTester.oneOf(searchTerms)
    };
  };

  const searchProperty = (scenario) => {
    const results = presetManager.searchPresets(scenario.searchTerm);
    
    // All results should contain the search term in name, description, or tags
    return results.every(preset => {
      const searchLower = scenario.searchTerm.toLowerCase();
      const nameMatch = preset.name.toLowerCase().includes(searchLower);
      const descMatch = preset.description.toLowerCase().includes(searchLower);
      const tagMatch = preset.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!nameMatch && !descMatch && !tagMatch) {
        console.log(`❌ Search result ${preset.id} doesn't contain term "${scenario.searchTerm}"`);
        return false;
      }
      
      return true;
    });
  };

  const result4 = propertyTester.runTest(
    'Search should return relevant presets',
    searchProperty,
    searchGenerator,
    30
  );

  return [result1, result2, result3, result4];
}

// Property 5: Kullanıcı Preset Yönetimi
function testUserPresetManagement() {
  console.log('\n👤 Testing Property 5: Kullanıcı Preset Yönetimi');
  
  const presetManager = new ExtendedPresetManager();

  // Generator for custom preset creation
  const customPresetGenerator = () => {
    const validPieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p', null];
    const categories = ['custom', 'opening', 'middlegame', 'endgame', 'puzzle', 'tactical'];
    
    // Generate a valid position with exactly one king of each color
    const position = Array(5).fill().map(() => Array(4).fill(null));
    
    // Place kings
    position[0][2] = 'k'; // Black king
    position[4][2] = 'K'; // White king
    
    // Add some random pieces
    const numPieces = propertyTester.integer(2, 8);
    for (let i = 0; i < numPieces; i++) {
      let row, col;
      do {
        row = propertyTester.integer(0, 4);
        col = propertyTester.integer(0, 3);
      } while (position[row][col] !== null);
      
      const piece = propertyTester.oneOf(['Q', 'R', 'B', 'N', 'P', 'q', 'r', 'b', 'n', 'p']);
      position[row][col] = piece;
    }
    
    return {
      name: propertyTester.string(3, 30),
      description: propertyTester.string(10, 100),
      position: position,
      category: propertyTester.oneOf(categories),
      tags: propertyTester.array(() => propertyTester.string(3, 10), 0, 5)
    };
  };

  // Property: Custom presets should be creatable and retrievable
  const customPresetCreationProperty = (scenario) => {
    // Create custom preset
    const preset = presetManager.createCustomPreset(
      scenario.name,
      scenario.description,
      scenario.position,
      scenario.category,
      scenario.tags
    );
    
    if (!preset || !preset.id) {
      console.log(`❌ Failed to create custom preset`);
      return false;
    }
    
    // Retrieve the preset
    const retrieved = presetManager.getPresetById(preset.id);
    
    if (!retrieved) {
      console.log(`❌ Could not retrieve created preset ${preset.id}`);
      return false;
    }
    
    // Check that data matches
    if (retrieved.name !== scenario.name ||
        retrieved.description !== scenario.description ||
        retrieved.category !== scenario.category ||
        !retrieved.custom) {
      console.log(`❌ Retrieved preset data doesn't match created data`);
      return false;
    }
    
    return true;
  };

  const result1 = propertyTester.runTest(
    'Custom presets should be creatable and retrievable',
    customPresetCreationProperty,
    customPresetGenerator,
    50
  );

  // Property: Custom presets should persist across manager instances
  const persistenceProperty = (scenario) => {
    // Create preset in first manager
    const preset = presetManager.createCustomPreset(
      scenario.name,
      scenario.description,
      scenario.position,
      scenario.category,
      scenario.tags
    );
    
    if (!preset) {
      console.log(`❌ Failed to create preset for persistence test`);
      return false;
    }
    
    // Create new manager instance
    const newManager = new ExtendedPresetManager();
    const retrieved = newManager.getPresetById(preset.id);
    
    if (!retrieved) {
      console.log(`❌ Custom preset not persisted across manager instances`);
      return false;
    }
    
    return retrieved.name === scenario.name && retrieved.custom === true;
  };

  const result2 = propertyTester.runTest(
    'Custom presets should persist across manager instances',
    persistenceProperty,
    customPresetGenerator,
    20
  );

  // Property: Custom presets should be deletable
  const deletionProperty = (scenario) => {
    // Create preset
    const preset = presetManager.createCustomPreset(
      scenario.name,
      scenario.description,
      scenario.position,
      scenario.category,
      scenario.tags
    );
    
    if (!preset) {
      console.log(`❌ Failed to create preset for deletion test`);
      return false;
    }
    
    // Verify it exists
    if (!presetManager.getPresetById(preset.id)) {
      console.log(`❌ Created preset not found before deletion`);
      return false;
    }
    
    // Delete it
    const deleted = presetManager.deleteCustomPreset(preset.id);
    
    if (!deleted) {
      console.log(`❌ Failed to delete custom preset`);
      return false;
    }
    
    // Verify it's gone
    if (presetManager.getPresetById(preset.id)) {
      console.log(`❌ Preset still exists after deletion`);
      return false;
    }
    
    return true;
  };

  const result3 = propertyTester.runTest(
    'Custom presets should be deletable',
    deletionProperty,
    customPresetGenerator,
    30
  );

  // Property: Preset naming should handle various inputs
  const namingGenerator = () => {
    const names = [
      'Simple Name',
      'Name with Numbers 123',
      'Special-Characters_Test!',
      'Very Long Name That Goes On And On And On',
      'Short',
      '   Spaces   ',
      'Unicode Test ♔♕♖',
      ''
    ];
    
    return {
      name: propertyTester.oneOf(names),
      description: 'Test description',
      position: [
        [null, null, 'k', null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 'K', null]
      ],
      category: 'custom',
      tags: ['test']
    };
  };

  const namingProperty = (scenario) => {
    try {
      const preset = presetManager.createCustomPreset(
        scenario.name,
        scenario.description,
        scenario.position,
        scenario.category,
        scenario.tags
      );
      
      if (!preset) {
        // Empty names should fail
        return scenario.name === '';
      }
      
      // Non-empty names should succeed
      return scenario.name !== '' && preset.name === scenario.name;
      
    } catch (error) {
      // Should only throw for invalid inputs
      return scenario.name === '';
    }
  };

  const result4 = propertyTester.runTest(
    'Preset naming should handle various inputs correctly',
    namingProperty,
    namingGenerator,
    40
  );

  // Property: Import/Export should work correctly
  const importExportProperty = () => {
    // Create some custom presets
    const preset1 = presetManager.createCustomPreset(
      'Export Test 1',
      'First test preset',
      [
        [null, null, 'k', null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 'K', null]
      ],
      'custom',
      ['export', 'test']
    );
    
    const preset2 = presetManager.createCustomPreset(
      'Export Test 2',
      'Second test preset',
      [
        ['r', null, 'k', null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 'K', 'R']
      ],
      'custom',
      ['export', 'test']
    );
    
    if (!preset1 || !preset2) {
      console.log(`❌ Failed to create presets for import/export test`);
      return false;
    }
    
    // Export presets
    const exported = presetManager.exportPresets(true);
    
    if (!exported || typeof exported !== 'string') {
      console.log(`❌ Export failed or returned invalid data`);
      return false;
    }
    
    // Create new manager and import
    const newManager = new ExtendedPresetManager();
    const importResult = newManager.importPresets(exported);
    
    if (!importResult.success) {
      console.log(`❌ Import failed:`, importResult.message);
      return false;
    }
    
    // Verify imported presets exist
    const imported1 = newManager.getPresetById(preset1.id);
    const imported2 = newManager.getPresetById(preset2.id);
    
    if (!imported1 || !imported2) {
      console.log(`❌ Imported presets not found`);
      return false;
    }
    
    return imported1.name === 'Export Test 1' && imported2.name === 'Export Test 2';
  };

  const result5 = propertyTester.runTest(
    'Import/Export should work correctly',
    importExportProperty,
    () => ({}),
    5
  );

  return [result1, result2, result3, result4, result5];
}

// Main test runner
function runAllPresetPropertyTests() {
  console.log('🚀 Starting Property-Based Tests for Extended Preset Manager');
  console.log('=' .repeat(70));
  
  setupTestEnvironment();
  
  try {
    // Run Property 3 tests
    console.log('\n📋 Feature: enhanced-piece-setup, Property 3: Preset Kategori Organizasyonu');
    const property3Results = testPresetCategoryOrganization();
    
    // Run Property 4 tests  
    console.log('\n📋 Feature: enhanced-piece-setup, Property 4: Preset Yükleme ve Analiz');
    const property4Results = testPresetLoadingAndAnalysis();
    
    // Run Property 5 tests
    console.log('\n📋 Feature: enhanced-piece-setup, Property 5: Kullanıcı Preset Yönetimi');
    const property5Results = testUserPresetManagement();
    
    // Generate summary
    const summary = propertyTester.getSummary();
    
    console.log('\n' + '=' .repeat(70));
    console.log('🎯 PRESET PROPERTY-BASED TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Total Iterations: ${summary.totalIterations}`);
    console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    
    if (summary.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      summary.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.name}`);
        if (result.counterexample) {
          console.log(`    Counterexample:`, result.counterexample);
        }
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
      });
    }
    
    console.log('\n✅ Preset property-based testing completed!');
    
    return summary;
    
  } catch (error) {
    console.error('❌ Error running preset property tests:', error);
    return { total: 0, passed: 0, failed: 1, totalIterations: 0, error: error.message };
  }
}

// Export for use in HTML test runner
if (typeof window !== 'undefined') {
  window.runAllPresetPropertyTests = runAllPresetPropertyTests;
  window.testPresetCategoryOrganization = testPresetCategoryOrganization;
  window.testPresetLoadingAndAnalysis = testPresetLoadingAndAnalysis;
  window.testUserPresetManagement = testUserPresetManagement;
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllPresetPropertyTests,
    testPresetCategoryOrganization,
    testPresetLoadingAndAnalysis,
    testUserPresetManagement,
    PropertyTester
  };
}