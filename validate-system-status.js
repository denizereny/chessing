/**
 * System Status Validation Script
 * Quick validation of Enhanced Piece Setup System components
 */

function validateSystemStatus() {
  console.log('🔍 Starting Enhanced Piece Setup System Validation...');
  
  const results = {
    timestamp: new Date().toISOString(),
    components: {},
    features: {},
    integration: {},
    issues: [],
    recommendations: [],
    overallStatus: 'UNKNOWN'
  };
  
  let testsTotal = 0;
  let testsPassed = 0;
  
  // Test 1: Component Availability
  console.log('🔧 Testing Component Availability...');
  const requiredComponents = [
    'EnhancedPieceSetupUI',
    'ExtendedPresetManager', 
    'AdvancedPositionAnalyzer',
    'PositionSharingSystem',
    'PositionHistoryManager',
    'MobileOptimizationManager',
    'PerformanceMonitor'
  ];
  
  requiredComponents.forEach(componentName => {
    testsTotal++;
    if (typeof window[componentName] !== 'undefined') {
      try {
        const instance = new window[componentName]();
        results.components[componentName] = { status: 'available', working: true };
        testsPassed++;
        console.log(`✅ ${componentName}: Available and working`);
      } catch (error) {
        results.components[componentName] = { status: 'available', working: false, error: error.message };
        results.issues.push(`${componentName}: Available but not instantiable - ${error.message}`);
        console.log(`⚠️ ${componentName}: Available but not instantiable - ${error.message}`);
      }
    } else {
      results.components[componentName] = { status: 'missing', working: false };
      results.issues.push(`${componentName}: Component not found`);
      console.log(`❌ ${componentName}: Not found`);
    }
  });
  
  // Test 2: DOM Integration
  console.log('🏗️ Testing DOM Integration...');
  testsTotal++;
  const modal = document.getElementById('pieceSetupModal');
  if (modal) {
    const requiredElements = [
      '.piece-setup-content',
      '.modal-header', 
      '.piece-palette',
      '.setup-board-container'
    ];
    
    const missingElements = requiredElements.filter(selector => !modal.querySelector(selector));
    
    if (missingElements.length === 0) {
      results.integration.modal = { status: 'complete', elements: 'all present' };
      testsPassed++;
      console.log('✅ Modal Integration: All required elements present');
    } else {
      results.integration.modal = { status: 'partial', missing: missingElements };
      results.issues.push(`Modal missing elements: ${missingElements.join(', ')}`);
      console.log(`⚠️ Modal Integration: Missing elements - ${missingElements.join(', ')}`);
    }
  } else {
    results.integration.modal = { status: 'missing' };
    results.issues.push('Piece setup modal not found in DOM');
    console.log('❌ Modal Integration: Modal not found');
  }
  
  // Test 3: CSS Integration
  console.log('🎨 Testing CSS Integration...');
  testsTotal++;
  const cssFiles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.href.split('/').pop())
    .filter(href => href.includes('enhanced') || href.includes('piece-setup'));
  
  if (cssFiles.length >= 2) {
    results.integration.css = { status: 'good', files: cssFiles.length };
    testsPassed++;
    console.log(`✅ CSS Integration: ${cssFiles.length} enhanced CSS files loaded`);
  } else {
    results.integration.css = { status: 'minimal', files: cssFiles.length };
    results.issues.push(`Limited CSS integration: only ${cssFiles.length} enhanced files`);
    console.log(`⚠️ CSS Integration: Only ${cssFiles.length} enhanced CSS files`);
  }
  
  // Test 4: Feature Functionality
  console.log('⚙️ Testing Feature Functionality...');
  
  // Test Enhanced UI
  testsTotal++;
  if (typeof EnhancedPieceSetupUI !== 'undefined') {
    try {
      const ui = new EnhancedPieceSetupUI();
      const deviceType = ui.detectDeviceType();
      if (['mobile', 'tablet', 'desktop'].includes(deviceType)) {
        results.features.enhancedUI = { status: 'working', deviceType };
        testsPassed++;
        console.log(`✅ Enhanced UI: Working (${deviceType})`);
      } else {
        throw new Error('Invalid device type');
      }
    } catch (error) {
      results.features.enhancedUI = { status: 'error', error: error.message };
      results.issues.push(`Enhanced UI error: ${error.message}`);
      console.log(`❌ Enhanced UI: ${error.message}`);
    }
  } else {
    results.features.enhancedUI = { status: 'missing' };
    results.issues.push('Enhanced UI component not available');
    console.log('❌ Enhanced UI: Component not available');
  }
  
  // Test Preset System
  testsTotal++;
  if (typeof ExtendedPresetManager !== 'undefined') {
    try {
      const presetManager = new ExtendedPresetManager();
      const presets = presetManager.getAllPresets();
      const categories = presetManager.getCategories();
      
      if (presets.length >= 15 && categories.length >= 4) {
        results.features.presetSystem = { 
          status: 'working', 
          presets: presets.length, 
          categories: categories.length 
        };
        testsPassed++;
        console.log(`✅ Preset System: Working (${presets.length} presets, ${categories.length} categories)`);
      } else {
        results.features.presetSystem = { 
          status: 'limited', 
          presets: presets.length, 
          categories: categories.length 
        };
        results.issues.push(`Preset system has limited content: ${presets.length} presets, ${categories.length} categories`);
        console.log(`⚠️ Preset System: Limited (${presets.length} presets, ${categories.length} categories)`);
      }
    } catch (error) {
      results.features.presetSystem = { status: 'error', error: error.message };
      results.issues.push(`Preset system error: ${error.message}`);
      console.log(`❌ Preset System: ${error.message}`);
    }
  } else {
    results.features.presetSystem = { status: 'missing' };
    results.issues.push('Preset system not available');
    console.log('❌ Preset System: Not available');
  }
  
  // Test Position Analysis
  testsTotal++;
  if (typeof AdvancedPositionAnalyzer !== 'undefined') {
    try {
      const analyzer = new AdvancedPositionAnalyzer();
      const samplePosition = [
        ['r', 'q', 'k', 'r'],
        ['p', 'p', 'p', 'p'], 
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'Q', 'K', 'R']
      ];
      
      const analysis = analyzer.analyzePosition(samplePosition);
      
      if (analysis && typeof analysis.materialBalance === 'number') {
        results.features.positionAnalysis = { 
          status: 'working', 
          materialBalance: analysis.materialBalance,
          hasAdvanced: !!(analysis.pieceActivity && analysis.kingSafety)
        };
        testsPassed++;
        console.log(`✅ Position Analysis: Working (Material: ${analysis.materialBalance})`);
      } else {
        throw new Error('Analysis returned invalid results');
      }
    } catch (error) {
      results.features.positionAnalysis = { status: 'error', error: error.message };
      results.issues.push(`Position analysis error: ${error.message}`);
      console.log(`❌ Position Analysis: ${error.message}`);
    }
  } else {
    results.features.positionAnalysis = { status: 'missing' };
    results.issues.push('Position analysis not available');
    console.log('❌ Position Analysis: Not available');
  }
  
  // Test Sharing System
  testsTotal++;
  if (typeof PositionSharingSystem !== 'undefined') {
    try {
      const sharingSystem = new PositionSharingSystem();
      const samplePosition = [
        ['r', 'q', 'k', 'r'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null], 
        ['P', 'P', 'P', 'P'],
        ['R', 'Q', 'K', 'R']
      ];
      
      const encoded = sharingSystem.encodePosition(samplePosition);
      const decoded = sharingSystem.decodePosition(encoded);
      
      if (encoded && encoded.length <= 12 && positionsEqual(samplePosition, decoded)) {
        results.features.sharingSystem = { 
          status: 'working', 
          codeLength: encoded.length,
          roundTrip: true
        };
        testsPassed++;
        console.log(`✅ Sharing System: Working (Code length: ${encoded.length})`);
      } else {
        throw new Error('Round-trip encoding failed');
      }
    } catch (error) {
      results.features.sharingSystem = { status: 'error', error: error.message };
      results.issues.push(`Sharing system error: ${error.message}`);
      console.log(`❌ Sharing System: ${error.message}`);
    }
  } else {
    results.features.sharingSystem = { status: 'missing' };
    results.issues.push('Sharing system not available');
    console.log('❌ Sharing System: Not available');
  }
  
  // Test Performance
  console.log('⚡ Testing Performance...');
  testsTotal++;
  if (typeof PerformanceMonitor !== 'undefined') {
    try {
      const monitor = new PerformanceMonitor();
      const testOp = () => { for(let i = 0; i < 1000; i++) Math.random(); };
      const result = monitor.measureOperation(testOp, 'test');
      
      if (result && typeof result.duration === 'number') {
        results.features.performance = { 
          status: 'working', 
          testDuration: result.duration 
        };
        testsPassed++;
        console.log(`✅ Performance Monitor: Working (${result.duration}ms)`);
      } else {
        throw new Error('Performance measurement failed');
      }
    } catch (error) {
      results.features.performance = { status: 'error', error: error.message };
      results.issues.push(`Performance monitor error: ${error.message}`);
      console.log(`❌ Performance Monitor: ${error.message}`);
    }
  } else {
    results.features.performance = { status: 'missing' };
    results.issues.push('Performance monitor not available');
    console.log('❌ Performance Monitor: Not available');
  }
  
  // Calculate overall status
  const successRate = (testsPassed / testsTotal * 100);
  const criticalIssues = results.issues.filter(issue => 
    issue.includes('not found') || issue.includes('not available')
  ).length;
  
  if (criticalIssues > 3) {
    results.overallStatus = 'CRITICAL_ISSUES';
  } else if (successRate >= 90) {
    results.overallStatus = 'EXCELLENT';
  } else if (successRate >= 75) {
    results.overallStatus = 'GOOD';
  } else if (successRate >= 60) {
    results.overallStatus = 'NEEDS_WORK';
  } else {
    results.overallStatus = 'MAJOR_ISSUES';
  }
  
  // Generate recommendations
  if (results.overallStatus === 'EXCELLENT') {
    results.recommendations.push('System is in excellent condition and ready for production use.');
    results.recommendations.push('All major components are working correctly.');
    results.recommendations.push('Consider adding more advanced features or optimizations.');
  } else if (results.overallStatus === 'GOOD') {
    results.recommendations.push('System is in good condition with minor areas for improvement.');
    results.recommendations.push('Address any remaining issues when possible.');
    results.recommendations.push('System is suitable for production use.');
  } else {
    results.recommendations.push('System needs improvements before production use.');
    results.recommendations.push('Focus on fixing missing or broken components.');
    results.recommendations.push('Review integration and ensure all files are properly loaded.');
  }
  
  // Add specific recommendations based on issues
  if (results.issues.some(issue => issue.includes('not available'))) {
    results.recommendations.push('Ensure all JavaScript component files are loaded correctly.');
  }
  if (results.issues.some(issue => issue.includes('Modal'))) {
    results.recommendations.push('Check that the piece setup modal HTML structure is complete.');
  }
  if (results.issues.some(issue => issue.includes('CSS'))) {
    results.recommendations.push('Verify that enhanced CSS files are included and loading properly.');
  }
  
  results.successRate = `${successRate.toFixed(1)}%`;
  results.testResults = { passed: testsPassed, total: testsTotal, failed: testsTotal - testsPassed };
  
  // Log final results
  console.log('\n' + '='.repeat(60));
  console.log('🏁 ENHANCED PIECE SETUP SYSTEM VALIDATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`📊 Overall Status: ${results.overallStatus}`);
  console.log(`✅ Success Rate: ${results.successRate} (${testsPassed}/${testsTotal})`);
  console.log(`🚨 Issues Found: ${results.issues.length}`);
  console.log('='.repeat(60));
  
  if (results.issues.length > 0) {
    console.log('📋 Issues:');
    results.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    results.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
  
  console.log('\n📄 Full report available in window.systemValidationReport');
  
  // Store results globally
  window.systemValidationReport = results;
  
  return results;
}

// Helper function to compare positions
function positionsEqual(pos1, pos2) {
  if (!pos1 || !pos2) return false;
  if (pos1.length !== pos2.length) return false;
  
  for (let i = 0; i < pos1.length; i++) {
    if (pos1[i].length !== pos2[i].length) return false;
    for (let j = 0; j < pos1[i].length; j++) {
      if (pos1[i][j] !== pos2[i][j]) return false;
    }
  }
  
  return true;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateSystemStatus };
}

// Make available globally
window.validateSystemStatus = validateSystemStatus;