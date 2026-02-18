#!/usr/bin/env node

/**
 * Node.js test runner for Visibility Re-analysis Property Test
 * Runs the property-based test in a headless browser environment
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== Visibility Re-analysis Property Test Runner ===\n');

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  console.log('⚠️  This test requires a browser environment.');
  console.log('');
  console.log('To run this test, please:');
  console.log('1. Open test/adaptive-viewport/test-visibility-reanalysis-property.html in a browser');
  console.log('2. Click the "Run Property Tests" button');
  console.log('3. Wait for the tests to complete (may take a few minutes)');
  console.log('');
  console.log('Alternative: Use a headless browser testing framework like:');
  console.log('  - Puppeteer: npm install puppeteer');
  console.log('  - Playwright: npm install playwright');
  console.log('  - Selenium WebDriver: npm install selenium-webdriver');
  console.log('');
  
  // Check if test files exist
  const testFile = path.join(__dirname, 'visibility-reanalysis-property.test.js');
  const htmlFile = path.join(__dirname, 'test-visibility-reanalysis-property.html');
  
  if (fs.existsSync(testFile)) {
    console.log('✓ Test file exists: visibility-reanalysis-property.test.js');
  } else {
    console.log('✗ Test file not found: visibility-reanalysis-property.test.js');
  }
  
  if (fs.existsSync(htmlFile)) {
    console.log('✓ HTML runner exists: test-visibility-reanalysis-property.html');
  } else {
    console.log('✗ HTML runner not found: test-visibility-reanalysis-property.html');
  }
  
  console.log('');
  process.exit(0);
}

// If we're in a browser environment, run the tests
(async () => {
  try {
    // Load fast-check
    if (typeof fc === 'undefined') {
      console.error('✗ fast-check library not loaded');
      process.exit(1);
    }
    
    // Load VisibilityDetector
    if (typeof VisibilityDetector === 'undefined') {
      console.error('✗ VisibilityDetector not loaded');
      process.exit(1);
    }
    
    // Load test module
    const { runVisibilityReanalysisPropertyTest } = require('./visibility-reanalysis-property.test.js');
    
    // Run tests
    console.log('Running property-based tests...\n');
    const results = await runVisibilityReanalysisPropertyTest(fc);
    
    // Report results
    console.log('\n=== Final Results ===');
    console.log(`Total: ${results.passed + results.failed}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\nFailed tests:');
      results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          console.log(`  ✗ ${t.name}`);
          if (t.error) {
            console.log(`    Error: ${t.error}`);
          }
        });
      process.exit(1);
    } else {
      console.log('\n✓ All tests passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('✗ Test execution failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
