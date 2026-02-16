#!/usr/bin/env node

/**
 * Test Runner for ARIA Attributes Tests
 * Validates ARIA implementation in responsive settings menu
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the HTML file
const html = fs.readFileSync('test-aria-attributes.html', 'utf-8');

// Create a DOM environment
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  beforeParse(window) {
    // Add console methods
    window.console = console;
  }
});

const { window } = dom;
const { document } = window;

// Make global objects available
global.window = window;
global.document = document;
global.navigator = window.navigator;

// Load SettingsMenuManager
const settingsMenuManagerCode = fs.readFileSync('js/settings-menu-manager.js', 'utf-8');
eval(settingsMenuManagerCode);

// Simple test framework
const testResults = {
  suites: [],
  totalTests: 0,
  passedTests: 0,
  failedTests: 0
};

let currentSuite = null;

function describe(name, fn) {
  currentSuite = {
    name: name,
    tests: [],
    passed: 0,
    failed: 0
  };
  testResults.suites.push(currentSuite);
  fn();
  currentSuite = null;
}

function test(name, fn) {
  testResults.totalTests++;
  try {
    fn();
    testResults.passedTests++;
    if (currentSuite) {
      currentSuite.passed++;
      currentSuite.tests.push({ name, passed: true });
    }
    console.log(`  ✓ ${name}`);
  } catch (error) {
    testResults.failedTests++;
    if (currentSuite) {
      currentSuite.failed++;
      currentSuite.tests.push({ name, passed: false, error: error.message });
    }
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(value)}`);
      }
    },
    toBeTruthy() {
      if (!value) {
        throw new Error(`Expected truthy value but got ${JSON.stringify(value)}`);
      }
    },
    toContain(expected) {
      if (Array.isArray(value)) {
        if (!value.includes(expected)) {
          throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
        }
      } else if (typeof value === 'string') {
        if (!value.includes(expected)) {
          throw new Error(`Expected string to contain "${expected}"`);
        }
      } else {
        throw new Error(`toContain() requires array or string`);
      }
    },
    toBeGreaterThan(expected) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (value < expected) {
        throw new Error(`Expected ${value} to be greater than or equal to ${expected}`);
      }
    },
    toMatch(pattern) {
      if (!pattern.test(value)) {
        throw new Error(`Expected "${value}" to match pattern ${pattern}`);
      }
    },
    toBeDefined() {
      if (value === undefined) {
        throw new Error(`Expected value to be defined`);
      }
    }
  };
}

// Make test functions global
global.describe = describe;
global.test = test;
global.expect = expect;

// Initialize settings menu manager
global.SettingsMenuManager = SettingsMenuManager;
global.settingsMenuManager = new SettingsMenuManager();
global.settingsMenuManager.initialize();

// Load and run tests
console.log('\n🧪 Running ARIA Attributes Tests\n');
console.log('Feature: responsive-settings-menu');
console.log('Task: 9.8 Write unit tests for ARIA attributes');
console.log('Validates: Requirements 6.1, 6.5, 6.7\n');

const testCode = fs.readFileSync('test/responsive-settings-menu-aria.test.js', 'utf-8');
eval(testCode);

// Display summary
console.log('\n' + '='.repeat(60));
console.log('TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${testResults.totalTests}`);
console.log(`Passed: ${testResults.passedTests} ✅`);
console.log(`Failed: ${testResults.failedTests} ❌`);
console.log(`Success Rate: ${((testResults.passedTests / testResults.totalTests) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

// Exit with appropriate code
process.exit(testResults.failedTests > 0 ? 1 : 0);
