/**
 * Simple validation script for Performance Monitor
 * Run this in browser console to test the performance monitoring system
 */

// Test Performance Monitor functionality
function validatePerformanceMonitor() {
  console.log('🧪 Validating Performance Monitor...');
  
  // Check if PerformanceMonitor class exists
  if (typeof PerformanceMonitor === 'undefined') {
    console.error('❌ PerformanceMonitor class not found');
    return false;
  }
  
  try {
    // Create instance
    const monitor = new PerformanceMonitor();
    console.log('✅ PerformanceMonitor instance created');
    
    // Check targets
    const expectedTargets = {
      dragOperation: 16,
      analysisOperation: 500,
      presetLoading: 200,
      longOperation: 1000
    };
    
    for (const [key, expectedValue] of Object.entries(expectedTargets)) {
      if (monitor.targets[key] !== expectedValue) {
        console.error(`❌ Target mismatch for ${key}: expected ${expectedValue}, got ${monitor.targets[key]}`);
        return false;
      }
    }
    console.log('✅ Performance targets validated');
    
    // Test measurement methods
    const testMethods = [
      'startMeasurement',
      'endMeasurement', 
      'measureDragOperation',
      'measureAnalysisOperation',
      'measurePresetLoading',
      'getStatistics',
      'generateReport'
    ];
    
    for (const method of testMethods) {
      if (typeof monitor[method] !== 'function') {
        console.error(`❌ Method ${method} not found or not a function`);
        return false;
      }
    }
    console.log('✅ All required methods exist');
    
    // Test basic measurement
    const operationId = monitor.startMeasurement('test', 'validation-test', { test: true });
    if (!operationId) {
      console.error('❌ startMeasurement did not return operation ID');
      return false;
    }
    
    // Simulate some work
    const start = performance.now();
    while (performance.now() - start < 5) {
      // 5ms of work
    }
    
    const measurement = monitor.endMeasurement(operationId, { completed: true });
    if (!measurement || typeof measurement.duration !== 'number') {
      console.error('❌ endMeasurement did not return valid measurement');
      return false;
    }
    console.log('✅ Basic measurement functionality works');
    
    // Test statistics
    const stats = monitor.getStatistics();
    if (!stats || typeof stats !== 'object') {
      console.error('❌ getStatistics did not return valid stats object');
      return false;
    }
    console.log('✅ Statistics functionality works');
    
    // Test report generation
    const report = monitor.generateReport();
    if (!report || !report.summary || !report.details) {
      console.error('❌ generateReport did not return valid report');
      return false;
    }
    console.log('✅ Report generation works');
    
    console.log('🎉 Performance Monitor validation completed successfully!');
    console.log('📊 Test measurement result:', {
      duration: measurement.duration.toFixed(2) + 'ms',
      type: measurement.type,
      withinTarget: measurement.withinTarget
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Performance Monitor validation failed:', error);
    return false;
  }
}

// Test async measurement operations
async function validateAsyncOperations() {
  console.log('🧪 Validating async operations...');
  
  if (typeof PerformanceMonitor === 'undefined') {
    console.error('❌ PerformanceMonitor not available');
    return false;
  }
  
  try {
    const monitor = new PerformanceMonitor();
    
    // Test drag operation measurement
    const { result: dragResult, measurement: dragMeasurement } = await monitor.measureDragOperation(
      () => {
        // Simulate drag work
        const start = performance.now();
        while (performance.now() - start < 8) {
          // 8ms of work (should be within 16ms target)
        }
        return { success: true, operation: 'test-drag' };
      },
      { testType: 'validation' }
    );
    
    if (!dragResult || !dragMeasurement) {
      console.error('❌ Drag operation measurement failed');
      return false;
    }
    
    console.log('✅ Drag operation measurement:', {
      duration: dragMeasurement.duration.toFixed(2) + 'ms',
      withinTarget: dragMeasurement.withinTarget,
      target: monitor.targets.dragOperation + 'ms'
    });
    
    // Test analysis operation measurement (mock)
    const { result: analysisResult, measurement: analysisMeasurement } = await monitor.measureAnalysisOperation(
      () => {
        // Simulate analysis work
        const start = performance.now();
        while (performance.now() - start < 100) {
          // 100ms of work (should be within 500ms target)
        }
        return { 
          positionType: 'balanced',
          materialBalance: { balance: 0 },
          pieceActivity: { white: 4, black: 4 }
        };
      },
      { testType: 'validation' }
    );
    
    if (!analysisResult || !analysisMeasurement) {
      console.error('❌ Analysis operation measurement failed');
      return false;
    }
    
    console.log('✅ Analysis operation measurement:', {
      duration: analysisMeasurement.duration.toFixed(2) + 'ms',
      withinTarget: analysisMeasurement.withinTarget,
      target: monitor.targets.analysisOperation + 'ms'
    });
    
    // Test preset loading measurement (mock)
    const { result: presetResult, measurement: presetMeasurement } = await monitor.measurePresetLoading(
      () => {
        // Simulate preset loading work
        const start = performance.now();
        while (performance.now() - start < 50) {
          // 50ms of work (should be within 200ms target)
        }
        return { 
          name: 'Test Preset',
          description: 'Validation test preset',
          position: [
            ["r", "q", "k", "r"],
            ["p", "p", "p", "p"],
            [null, null, null, null],
            ["P", "P", "P", "P"],
            ["R", "Q", "K", "R"]
          ]
        };
      },
      { testType: 'validation' }
    );
    
    if (!presetResult || !presetMeasurement) {
      console.error('❌ Preset loading measurement failed');
      return false;
    }
    
    console.log('✅ Preset loading measurement:', {
      duration: presetMeasurement.duration.toFixed(2) + 'ms',
      withinTarget: presetMeasurement.withinTarget,
      target: monitor.targets.presetLoading + 'ms'
    });
    
    // Generate final report
    const finalReport = monitor.generateReport();
    console.log('📊 Final validation report:', {
      totalOperations: finalReport.summary.totalOperations,
      averageTimes: finalReport.summary.averageTimes,
      targetsStatus: finalReport.summary.targetsStatus,
      performanceIssues: finalReport.summary.performanceIssues
    });
    
    console.log('🎉 Async operations validation completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Async operations validation failed:', error);
    return false;
  }
}

// Run validation if in browser environment
if (typeof window !== 'undefined') {
  console.log('🚀 Performance Monitor Validation Script Loaded');
  console.log('Run validatePerformanceMonitor() to test basic functionality');
  console.log('Run validateAsyncOperations() to test async measurement operations');
  
  // Make functions available globally
  window.validatePerformanceMonitor = validatePerformanceMonitor;
  window.validateAsyncOperations = validateAsyncOperations;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validatePerformanceMonitor,
    validateAsyncOperations
  };
}