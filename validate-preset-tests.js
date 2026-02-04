/**
 * Validation script for Preset Property-Based Tests
 * Runs the tests and validates they work correctly
 */

// Mock browser environment for Node.js-like execution
if (typeof window === 'undefined') {
  global.window = {};
  global.localStorage = {
    data: {},
    getItem: function(key) { return this.data[key] || null; },
    setItem: function(key, value) { this.data[key] = value; },
    removeItem: function(key) { delete this.data[key]; },
    clear: function() { this.data = {}; }
  };
  global.performance = {
    now: function() { return Date.now(); }
  };
}

// Load the required modules
let ExtendedPresetManager, tests;

try {
  // Try to load as if in browser environment
  if (typeof require !== 'undefined') {
    ExtendedPresetManager = require('./js/extended-preset-manager.js');
    tests = require('./test/extended-preset-manager-property-tests.js');
  } else {
    // Browser environment - modules should be loaded via script tags
    ExtendedPresetManager = window.ExtendedPresetManager;
    tests = {
      runAllPresetPropertyTests: window.runAllPresetPropertyTests,
      testPresetCategoryOrganization: window.testPresetCategoryOrganization,
      testPresetLoadingAndAnalysis: window.testPresetLoadingAndAnalysis,
      testUserPresetManagement: window.testUserPresetManagement
    };
  }
} catch (error) {
  console.error('Error loading modules:', error);
  process.exit(1);
}

function validatePresetTests() {
  console.log('🧪 Validating Preset Property-Based Tests');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Verify ExtendedPresetManager works
    console.log('📋 Test 1: ExtendedPresetManager instantiation');
    const presetManager = new ExtendedPresetManager();
    const stats = presetManager.getPresetStatistics();
    console.log(`✅ Created preset manager with ${stats.total} presets`);
    
    // Test 2: Verify categories exist
    console.log('\n📋 Test 2: Category validation');
    const categories = presetManager.getCategories();
    const expectedCategories = ['opening', 'middlegame', 'endgame', 'puzzle', 'tactical', 'educational'];
    const hasAllCategories = expectedCategories.every(cat => categories.includes(cat));
    console.log(`✅ All expected categories present: ${hasAllCategories}`);
    
    // Test 3: Verify minimum preset counts
    console.log('\n📋 Test 3: Minimum preset counts');
    const minimums = {
      'opening': 5,
      'middlegame': 5, 
      'endgame': 5,
      'puzzle': 3,
      'tactical': 4,
      'educational': 3
    };
    
    let allMinimumsMet = true;
    for (const [category, minimum] of Object.entries(minimums)) {
      const presets = presetManager.getPresetsByCategory(category);
      const met = presets.length >= minimum;
      console.log(`  ${category}: ${presets.length}/${minimum} ${met ? '✅' : '❌'}`);
      if (!met) allMinimumsMet = false;
    }
    
    // Test 4: Verify preset structure
    console.log('\n📋 Test 4: Preset structure validation');
    const allPresets = presetManager.getAllPresets();
    let structureValid = true;
    
    for (const preset of allPresets.slice(0, 5)) { // Check first 5 presets
      const hasRequiredFields = preset.id && 
                               preset.name && 
                               preset.description && 
                               preset.category && 
                               preset.position &&
                               Array.isArray(preset.tags);
      
      if (!hasRequiredFields) {
        console.log(`❌ Preset ${preset.id} missing required fields`);
        structureValid = false;
        break;
      }
      
      // Check position structure
      if (!Array.isArray(preset.position) || preset.position.length !== 5) {
        console.log(`❌ Preset ${preset.id} has invalid position structure`);
        structureValid = false;
        break;
      }
      
      for (let i = 0; i < 5; i++) {
        if (!Array.isArray(preset.position[i]) || preset.position[i].length !== 4) {
          console.log(`❌ Preset ${preset.id} has invalid position row ${i}`);
          structureValid = false;
          break;
        }
      }
      
      if (!structureValid) break;
    }
    
    if (structureValid) {
      console.log('✅ Preset structure validation passed');
    }
    
    // Test 5: Custom preset functionality
    console.log('\n📋 Test 5: Custom preset functionality');
    const customPreset = presetManager.createCustomPreset(
      'Test Preset',
      'Test description',
      [
        [null, null, 'k', null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 'K', null]
      ],
      'custom',
      ['test']
    );
    
    const retrieved = presetManager.getPresetById(customPreset.id);
    const customWorking = retrieved && retrieved.name === 'Test Preset' && retrieved.custom === true;
    console.log(`✅ Custom preset creation: ${customWorking ? 'Working' : 'Failed'}`);
    
    // Test 6: Run a small sample of property tests
    console.log('\n📋 Test 6: Sample property test execution');
    
    if (tests && tests.testPresetCategoryOrganization) {
      try {
        const results = tests.testPresetCategoryOrganization();
        const passed = results.filter(r => r.success).length;
        const total = results.length;
        console.log(`✅ Property 3 sample: ${passed}/${total} tests passed`);
      } catch (error) {
        console.log(`❌ Property test execution failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  Property test functions not available');
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('🎯 VALIDATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`✅ ExtendedPresetManager: Working`);
    console.log(`✅ Categories: ${hasAllCategories ? 'Valid' : 'Invalid'}`);
    console.log(`✅ Minimum counts: ${allMinimumsMet ? 'Met' : 'Not met'}`);
    console.log(`✅ Preset structure: ${structureValid ? 'Valid' : 'Invalid'}`);
    console.log(`✅ Custom presets: ${customWorking ? 'Working' : 'Failed'}`);
    console.log(`✅ Total presets: ${stats.total} (requirement: ≥20)`);
    
    const overallSuccess = hasAllCategories && allMinimumsMet && structureValid && customWorking && stats.total >= 20;
    console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    return overallSuccess;
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    return false;
  }
}

// Run validation
if (typeof module !== 'undefined' && require.main === module) {
  const success = validatePresetTests();
  process.exit(success ? 0 : 1);
} else if (typeof window !== 'undefined') {
  window.validatePresetTests = validatePresetTests;
}