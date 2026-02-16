/**
 * Test Runner for Property 14: Focus Restoration on Close
 * 
 * **Feature: responsive-settings-menu, Property 14: Focus restoration on close**
 * **Validates: Requirements 6.4**
 * 
 * This script runs the property-based tests for focus restoration using Puppeteer.
 */

const puppeteer = require('puppeteer');

async function runTests() {
  console.log('🚀 Starting Property 14: Focus Restoration Tests');
  console.log('='.repeat(60));
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to test page
    const testUrl = 'http://localhost:8084/test-property-14-focus-restoration.html';
    console.log(`📄 Loading test page: ${testUrl}`);
    
    await page.goto(testUrl, { waitUntil: 'networkidle0' });
    
    // Wait for page to be ready
    await page.waitForSelector('#runTestsBtn', { timeout: 5000 });
    console.log('✅ Test page loaded successfully');
    
    // Set up console message handler
    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('Download the React DevTools')) {
        console.log(`   ${text}`);
      }
    });
    
    // Run the tests
    console.log('\n🔬 Running property-based tests...\n');
    
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Override the updateStatus function to capture completion
        const originalUpdateStatus = window.updateStatus;
        window.updateStatus = function(message, type) {
          originalUpdateStatus(message, type);
          if (type === 'success' || type === 'error') {
            setTimeout(() => resolve(), 100);
          }
        };
        
        // Run tests
        runPropertyTests();
      });
    });
    
    // Get test results
    const results = await page.evaluate(() => {
      return {
        total: parseInt(document.getElementById('totalTests').textContent),
        passed: parseInt(document.getElementById('passedTests').textContent),
        failed: parseInt(document.getElementById('failedTests').textContent),
        iterations: parseInt(document.getElementById('totalIterations').textContent),
        output: document.getElementById('outputContent').textContent,
        status: document.getElementById('status').textContent
      };
    });
    
    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total Iterations: ${results.iterations}`);
    console.log(`Status: ${results.status}`);
    console.log('');
    
    if (results.failed === 0) {
      console.log('✅ All property-based tests PASSED!');
      console.log('✅ Property 14: Focus restoration on close is verified');
      console.log('');
      console.log('Test Coverage:');
      console.log('  ✓ Focus restoration from any menu element');
      console.log('  ✓ Focus restoration at different viewport sizes');
      console.log('  ✓ Property-based test with 100+ random scenarios');
      console.log('  ✓ Focus restoration after keyboard-opened menu');
    } else {
      console.log('❌ Some tests FAILED');
      console.log('\nTest Output:');
      console.log(results.output);
    }
    
    await browser.close();
    
    // Exit with appropriate code
    process.exit(results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

// Run tests
runTests();
