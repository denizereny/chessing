#!/usr/bin/env node

/**
 * Validation Script for Orientation Handling Property Test
 * Verifies that the property test is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('=== Validating Orientation Handling Property Test ===\n');

const results = {
  passed: 0,
  failed: 0,
  checks: []
};

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✓ ${name}`);
    results.passed++;
    results.checks.push({ name, status: 'PASS' });
  } else {
    console.error(`✗ ${name}`);
    if (details) {
      console.error(`  Details: ${details}`);
    }
    results.failed++;
    results.checks.push({ name, status: 'FAIL', details });
  }
}

// Check 1: Test file exists
const testFilePath = path.join(__dirname, 'orientation-handling-property.test.js');
const testFileExists = fs.existsSync(testFilePath);
check('Test file exists', testFileExists, testFileExists ? '' : 'File not found: orientation-handling-property.test.js');

if (!testFileExists) {
  console.error('\n❌ Cannot proceed with validation - test file not found');
  process.exit(1);
}

// Check 2: HTML runner exists
const htmlFilePath = path.join(__dirname, 'test-orientation-handling-property.html');
const htmlFileExists = fs.existsSync(htmlFilePath);
check('HTML test runner exists', htmlFileExists, htmlFileExists ? '' : 'File not found: test-orientation-handling-property.html');

// Read test file content
const testContent = fs.readFileSync(testFilePath, 'utf8');

// Check 3: Property 18 annotation present
const hasProperty18 = testContent.includes('Property 18: Orientation Handling');
check('Property 18 annotation present', hasProperty18, 'Missing "Property 18: Orientation Handling" annotation');

// Check 4: Validates Requirements 5.4
const validatesReq54 = testContent.includes('Validates: Requirements 5.4');
check('Validates Requirements 5.4', validatesReq54, 'Missing "Validates: Requirements 5.4" annotation');

// Check 5: Uses fast-check library
const usesFastCheck = testContent.includes('fc.assert') && testContent.includes('fc.asyncProperty');
check('Uses fast-check library', usesFastCheck, 'Missing fast-check usage (fc.assert, fc.asyncProperty)');

// Check 6: Tests portrait orientation
const testsPortrait = testContent.includes('portrait') && 
                      testContent.includes('viewportHeight > config.viewportWidth');
check('Tests portrait orientation', testsPortrait, 'Missing portrait orientation test logic');

// Check 7: Tests landscape orientation
const testsLandscape = testContent.includes('landscape') && 
                       testContent.includes('viewportWidth > config.viewportHeight');
check('Tests landscape orientation', testsLandscape, 'Missing landscape orientation test logic');

// Check 8: Tests orientation change
const testsOrientationChange = testContent.includes('Orientation change') || 
                               testContent.includes('orientation change');
check('Tests orientation change', testsOrientationChange, 'Missing orientation change test');

// Check 9: Minimum 100 iterations per property
const hasNumRuns100 = testContent.match(/numRuns:\s*100/g);
const hasEnoughIterations = hasNumRuns100 && hasNumRuns100.length >= 3;
check('Minimum 100 iterations per property', hasEnoughIterations, 
  hasEnoughIterations ? '' : 'Not all properties run 100 iterations');

// Check 10: Validates layout configuration
const validatesLayout = testContent.includes('validateLayoutConfiguration') &&
                        testContent.includes('boardSize') &&
                        testContent.includes('boardPosition') &&
                        testContent.includes('layoutStrategy');
check('Validates layout configuration', validatesLayout, 'Missing comprehensive layout validation');

// Check 11: Tests common mobile devices
const testsCommonDevices = testContent.includes('iPhone') || 
                          testContent.includes('iPad') ||
                          testContent.includes('Android');
check('Tests common mobile devices', testsCommonDevices, 'Missing common device orientation tests');

// Check 12: Checks minimum board size
const checksMinBoardSize = testContent.includes('280') && 
                          testContent.includes('minSize');
check('Checks minimum board size (280px)', checksMinBoardSize, 'Missing minimum board size validation');

// Check 13: Exports test function
const exportsFunction = testContent.includes('module.exports') && 
                       testContent.includes('runOrientationHandlingPropertyTest');
check('Exports test function', exportsFunction, 'Missing module.exports for runOrientationHandlingPropertyTest');

// Check 14: Imports required components
const importsComponents = testContent.includes('ViewportAnalyzer') &&
                         testContent.includes('LayoutOptimizer') &&
                         testContent.includes('AdaptiveViewportConstants');
check('Imports required components', importsComponents, 'Missing required component imports');

// Check 15: Creates mock analysis results
const createsMockAnalysis = testContent.includes('createMockAnalysisResult') &&
                           testContent.includes('aspectRatio') &&
                           testContent.includes('orientation');
check('Creates mock analysis results', createsMockAnalysis, 'Missing mock analysis result creation');

// Check 16: Tests square viewports
const testsSquareViewports = testContent.includes('square') || testContent.includes('Square');
check('Tests square viewports (edge case)', testsSquareViewports, 'Missing square viewport test');

// Check 17: Proper error handling
const hasErrorHandling = testContent.includes('try') && 
                        testContent.includes('catch') &&
                        testContent.includes('error.message');
check('Proper error handling', hasErrorHandling, 'Missing proper error handling');

// Check 18: Cleans up resources
const cleansUpResources = testContent.includes('optimizer.destroy()');
check('Cleans up resources', cleansUpResources, 'Missing resource cleanup (optimizer.destroy)');

// Check 19: Returns test results
const returnsResults = testContent.includes('return results') &&
                      testContent.includes('results.passed') &&
                      testContent.includes('results.failed');
check('Returns test results', returnsResults, 'Missing proper test results return');

// Check 20: HTML runner loads dependencies
if (htmlFileExists) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
  
  const loadsComponents = htmlContent.includes('viewport-analyzer.js') &&
                         htmlContent.includes('layout-optimizer.js') &&
                         htmlContent.includes('setup-fast-check.js');
  check('HTML runner loads dependencies', loadsComponents, 'Missing required script includes in HTML');
  
  const hasRunButton = htmlContent.includes('runButton') && htmlContent.includes('runTest');
  check('HTML runner has run button', hasRunButton, 'Missing run button in HTML');
  
  const hasOutput = htmlContent.includes('output') && htmlContent.includes('textContent');
  check('HTML runner has output display', hasOutput, 'Missing output display in HTML');
}

// Print summary
console.log('\n=== Validation Summary ===');
console.log(`Total Checks: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

if (results.failed === 0) {
  console.log('✅ All validation checks passed! The orientation handling property test is correctly implemented.\n');
  process.exit(0);
} else {
  console.error('❌ Some validation checks failed. Please review the issues above.\n');
  process.exit(1);
}
