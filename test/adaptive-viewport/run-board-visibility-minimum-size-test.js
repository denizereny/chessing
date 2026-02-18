#!/usr/bin/env node

/**
 * Node.js Test Runner for Board Visibility and Minimum Size Property Test
 * Feature: adaptive-viewport-optimizer
 * Property 23: Board Visibility and Minimum Size Invariant
 * Validates: Requirements 7.1, 7.3
 */

const fc = require('fast-check');
const { runBoardVisibilityMinimumSizePropertyTest } = require('./board-visibility-minimum-size-property.test.js');

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║  Property Test: Board Visibility and Minimum Size Invariant       ║');
console.log('║  Feature: adaptive-viewport-optimizer                             ║');
console.log('║  Property 23: Board Visibility and Minimum Size Invariant         ║');
console.log('║  Validates: Requirements 7.1, 7.3                                 ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// Mock DOM environment for Node.js
global.document = {
  createElement: function(tag) {
    return {
      id: '',
      className: '',
      style: {},
      appendChild: function() {},
      removeChild: function() {},
      getBoundingClientRect: function() {
        return {
          left: parseFloat(this.style.left) || 0,
          top: parseFloat(this.style.top) || 0,
          right: (parseFloat(this.style.left) || 0) + (parseFloat(this.style.width) || 0),
          bottom: (parseFloat(this.style.top) || 0) + (parseFloat(this.style.height) || 0),
          width: parseFloat(this.style.width) || 0,
          height: parseFloat(this.style.height) || 0
        };
      }
    };
  },
  body: {
    appendChild: function() {},
    removeChild: function() {}
  }
};

// Run the tests
async function main() {
  try {
    const startTime = Date.now();
    
    const results = await runBoardVisibilityMinimumSizePropertyTest(fc);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                         FINAL RESULTS                              ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Total Properties Tested: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total Iterations: ${(results.passed + results.failed) * 100}`);
    console.log(`Duration: ${duration}s`);
    console.log();
    
    if (results.failed === 0) {
      console.log('✅ All property tests passed successfully!');
      console.log();
      console.log('Property 23 (Board Visibility and Minimum Size Invariant) is VERIFIED:');
      console.log('  ✓ Board always meets minimum size of 280px × 280px');
      console.log('  ✓ Board is always fully visible within viewport');
      console.log('  ✓ Invariant holds across extreme viewports');
      console.log('  ✓ Board size maintained even with many UI elements');
      console.log('  ✓ Board position is always valid');
      console.log('  ✓ Board dimensions are always valid');
      console.log('  ✓ Invariant holds across all layout strategies');
      console.log();
      process.exit(0);
    } else {
      console.log('❌ Some property tests failed.');
      console.log();
      console.log('Failed tests:');
      results.tests.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`  ✗ ${test.name}`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
      });
      console.log();
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
