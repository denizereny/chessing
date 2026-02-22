#!/usr/bin/env node

/**
 * Test Runner for Orientation Handling Property Test
 * Runs the property-based test in Node.js environment
 */

// Set up global environment for browser-like behavior
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
  screen: {
    orientation: {
      addEventListener: () => {},
      removeEventListener: () => {}
    }
  }
};

global.document = {
  querySelector: () => null,
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.performance = {
  mark: () => {},
  measure: () => {},
  getEntriesByName: () => [],
  getEntriesByType: () => [],
  clearMarks: () => {},
  clearMeasures: () => {}
};

// Load fast-check
const fc = require('fast-check');

// Load adaptive viewport components
const AdaptiveViewportConstants = require('../../js/adaptive-viewport/constants.js');
const ErrorHandler = require('../../js/adaptive-viewport/error-handler.js');
const BaseComponent = require('../../js/adaptive-viewport/base-component.js');
const LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');

// Load the property test
const { runOrientationHandlingPropertyTest } = require('./orientation-handling-property.test.js');

// Run the test
console.log('Starting Orientation Handling Property Test...\n');

runOrientationHandlingPropertyTest(fc)
  .then(results => {
    console.log('\n=== Final Results ===');
    console.log(`Total Properties Tested: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed === 0) {
      console.log('\n✅ All property tests passed!\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some property tests failed.\n');
      console.log('Failed tests:');
      results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}`);
          if (test.error) {
            console.log(`    Error: ${test.error}`);
          }
        });
      console.log();
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:');
    console.error(error);
    process.exit(1);
  });
