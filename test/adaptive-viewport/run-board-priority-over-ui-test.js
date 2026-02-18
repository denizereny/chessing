#!/usr/bin/env node

/**
 * Node.js Test Runner for Board Priority Over UI Elements Property Test
 * 
 * This script runs the property-based test for board priority over UI elements
 * in a Node.js environment.
 */

// Mock DOM environment for Node.js
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({
    addEventListener: () => {},
    removeEventListener: () => {}
  })
};

// Load fast-check
const fc = require('fast-check');

// Load dependencies
const LayoutOptimizer = require('../../js/adaptive-viewport/layout-optimizer.js');

// Load test
const { runBoardPriorityOverUIPropertyTest } = require('./board-priority-over-ui-property.test.js');

// Run tests
console.log('Starting Board Priority Over UI Elements Property Test...\n');
console.log('Environment: Node.js');
console.log('Testing Library: fast-check');
console.log('Iterations per Property: 100\n');
console.log('='.repeat(70) + '\n');

runBoardPriorityOverUIPropertyTest(fc)
  .then(results => {
    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 TEST EXECUTION COMPLETED\n');
    console.log(`Total Properties: ${results.passed + results.failed}`);
    console.log(`✓ Passed: ${results.passed}`);
    console.log(`✗ Failed: ${results.failed}`);
    console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log(`Total Iterations: ${(results.passed + results.failed) * 100}\n`);

    if (results.failed === 0) {
      console.log('✅ All property tests passed successfully!\n');
      process.exit(0);
    } else {
      console.log('❌ Some property tests failed. See details above.\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
