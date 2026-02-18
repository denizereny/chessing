#!/usr/bin/env node

/**
 * Node.js Test Runner for Content-Aware Breakpoints Property Test
 * Runs the property-based test in a headless browser environment
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runTest() {
  console.log('🚀 Starting Content-Aware Breakpoints Property Test Runner\n');
  
  let browser;
  try {
    // Launch browser
    console.log('Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 1024 });
    
    // Enable console logging from page
    page.on('console', msg => {
      const text = msg.text();
      // Filter out some noise
      if (!text.includes('Download the React DevTools')) {
        console.log(text);
      }
    });
    
    // Handle page errors
    page.on('pageerror', error => {
      console.error('❌ Page error:', error.message);
    });
    
    // Load the test page
    const testFile = path.join(__dirname, 'test-content-aware-breakpoints-property.html');
    const testUrl = `file://${testFile}`;
    
    console.log(`Loading test page: ${testFile}\n`);
    await page.goto(testUrl, { waitUntil: 'networkidle0' });
    
    // Wait for fast-check to load
    await page.waitForFunction(() => typeof fc !== 'undefined', { timeout: 5000 });
    
    // Run the test
    console.log('Running property-based tests...\n');
    const results = await page.evaluate(async () => {
      try {
        const testResults = await runContentAwareBreakpointsPropertyTest(fc);
        return {
          success: true,
          results: testResults
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
    });
    
    // Process results
    if (results.success) {
      const { passed, failed, tests } = results.results;
      
      console.log('\n' + '='.repeat(60));
      console.log('TEST RESULTS SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total Properties: ${passed + failed}`);
      console.log(`Passed: ${passed}`);
      console.log(`Failed: ${failed}`);
      console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
      console.log(`Total Iterations: ${(passed + failed) * 100}`);
      console.log('='.repeat(60) + '\n');
      
      // Print individual test results
      console.log('Individual Test Results:');
      tests.forEach((test, index) => {
        const icon = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${index + 1}. ${test.name}`);
        if (test.error) {
          console.log(`   Error: ${test.error}`);
        }
      });
      
      // Exit with appropriate code
      if (failed > 0) {
        console.log('\n❌ Some tests failed');
        process.exit(1);
      } else {
        console.log('\n✅ All tests passed!');
        process.exit(0);
      }
    } else {
      console.error('\n❌ Test execution failed:');
      console.error(results.error);
      if (results.stack) {
        console.error(results.stack);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is installed
try {
  require.resolve('puppeteer');
} catch (e) {
  console.error('❌ Error: puppeteer is not installed');
  console.error('Please install it with: npm install puppeteer');
  process.exit(1);
}

// Run the test
runTest();
