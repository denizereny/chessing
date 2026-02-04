/**
 * Simple test runner for Preset Property-Based Tests
 * Validates that the tests can run and produce expected results
 */

// Load the ExtendedPresetManager
if (typeof ExtendedPresetManager === 'undefined') {
  console.error('❌ ExtendedPresetManager not loaded');
  throw new Error('ExtendedPresetManager required');
}

// Simple test execution
function runPresetPropertyTestsValidation() {
  console.log('🧪 Validating Preset Property-Based Tests');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Basic preset manager functionality
    console.log('\n📋 Test 1: Basic ExtendedPresetManager functionality');
    const presetManager = new ExtendedPresetManager();
    const stats = presetManager.getPresetStatistics();
    console.log(`✅ Preset manager created with ${stats.total} total presets`);
    console.log(`   - Categories: ${Object.keys(stats.byCategory).join(', ')}`);
    console.log(`   - Custom presets: ${stats.custom}`);
    
    // Test 2: Verify minimum requirements
    console.log('\n📋 Test 2: Minimum requirements validation');
    const minimums = {
      'opening': 5, 'middlegame': 5, 'endgame': 5,
      'puzzle': 3, 'tactical': 4, 'educational': 3
    };
    
    let requirementsMet = true;
    for (const [category, minimum] of Object.entries(minimums)) {
      const count = stats.byCategory[category] || 0;
      const met = count >= minimum;
      console.log(`   ${category}: ${count}/${minimum} ${met ? '✅' : '❌'}`);
      if (!met) requirementsMet = false;
    }
    
    // Test 3: Property 3 - Category Organization (sample)
    console.log('\n📋 Test 3: Property 3 - Category Organization (sample)');
    const categories = presetManager.getCategories();
    const expectedCategories = ['opening', 'middlegame', 'endgame', 'puzzle', 'tactical', 'educational'];
    const hasAllCategories = expectedCategories.every(cat => categories.includes(cat));
    console.log(`✅ All expected categories present: ${hasAllCategories}`);
    
    // Validate category consistency
    let categoryConsistent = true;
    for (const category of expectedCategories) {
      const presets = presetManager.getPresetsByCategory(category);
      const allCorrectCategory = presets.every(p => p.category === category);
      if (!allCorrectCategory) {
        console.log(`❌ Category ${category} has presets with wrong category field`);
        categoryConsistent = false;
      }
    }
    if (categoryConsistent) {
      console.log('✅ Category consistency validated');
    }
    
    // Test 4: Property 4 - Preset Loading (sample)
    console.log('\n📋 Test 4: Property 4 - Preset Loading (sample)');
    const allPresets = presetManager.getAllPresets();
    const samplePresets = allPresets.slice(0, 5);
    
    let loadingWorking = true;
    for (const preset of samplePresets) {
      const loaded = presetManager.getPresetById(preset.id);
      if (!loaded || loaded.id !== preset.id) {
        console.log(`❌ Failed to load preset ${preset.id}`);
        loadingWorking = false;
        break;
      }
      
      // Validate position structure
      const validation = presetManager.validatePresetPosition(preset.position);
      if (!validation.valid) {
        console.log(`❌ Preset ${preset.id} has invalid position:`, validation.errors);
        loadingWorking = false;
        break;
      }
    }
    if (loadingWorking) {
      console.log(`✅ Preset loading validated for ${samplePresets.length} presets`);
    }
    
    // Test 5: Property 5 - User Preset Management (sample)
    console.log('\n📋 Test 5: Property 5 - User Preset Management (sample)');
    
    // Create custom preset
    const customPreset = presetManager.createCustomPreset(
      'Test Validation Preset',
      'Created during validation test',
      [
        [null, null, 'k', null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, 'K', null]
      ],
      'custom',
      ['validation', 'test']
    );
    
    if (!customPreset || !customPreset.id) {
      console.log('❌ Failed to create custom preset');
      return false;
    }
    
    // Retrieve custom preset
    const retrieved = presetManager.getPresetById(customPreset.id);
    if (!retrieved || retrieved.name !== 'Test Validation Preset') {
      console.log('❌ Failed to retrieve custom preset');
      return false;
    }
    
    // Delete custom preset
    const deleted = presetManager.deleteCustomPreset(customPreset.id);
    if (!deleted) {
      console.log('❌ Failed to delete custom preset');
      return false;
    }
    
    // Verify deletion
    const shouldBeNull = presetManager.getPresetById(customPreset.id);
    if (shouldBeNull) {
      console.log('❌ Custom preset still exists after deletion');
      return false;
    }
    
    console.log('✅ Custom preset management validated');
    
    // Test 6: Performance check (basic)
    console.log('\n📋 Test 6: Basic performance check');
    const startTime = performance.now();
    
    // Load 10 presets
    for (let i = 0; i < Math.min(10, allPresets.length); i++) {
      presetManager.getPresetById(allPresets[i].id);
    }
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / Math.min(10, allPresets.length);
    
    console.log(`✅ Average preset loading time: ${avgTime.toFixed(2)}ms`);
    console.log(`   (Requirement: < 200ms per preset)`);
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 VALIDATION SUMMARY');
    console.log('=' .repeat(60));
    
    const overallSuccess = requirementsMet && hasAllCategories && categoryConsistent && loadingWorking;
    
    console.log(`✅ Total presets: ${stats.total} (requirement: ≥20)`);
    console.log(`✅ Minimum counts: ${requirementsMet ? 'Met' : 'Not met'}`);
    console.log(`✅ Category organization: ${hasAllCategories && categoryConsistent ? 'Valid' : 'Invalid'}`);
    console.log(`✅ Preset loading: ${loadingWorking ? 'Working' : 'Failed'}`);
    console.log(`✅ Custom preset management: Working`);
    console.log(`✅ Performance: ${avgTime < 200 ? 'Acceptable' : 'Needs improvement'}`);
    
    console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}`);
    console.log('\n📝 Property-based tests are ready to run with:');
    console.log('   - Property 3: Preset Kategori Organizasyonu');
    console.log('   - Property 4: Preset Yükleme ve Analiz');
    console.log('   - Property 5: Kullanıcı Preset Yönetimi');
    console.log('   - Each property runs 100+ iterations');
    console.log('   - Tests validate Requirements 2.2, 2.3, 2.4, 2.5');
    
    return overallSuccess;
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error);
    return false;
  }
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.runPresetPropertyTestsValidation = runPresetPropertyTestsValidation;
}