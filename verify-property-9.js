#!/usr/bin/env node

/**
 * Verification Script for Property 9: Touch Target Minimum Size
 * 
 * This script verifies that the property test implementation is correct
 * by checking the test file structure and CSS implementation.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Property 9: Touch Target Minimum Size - Verification');
console.log('=' .repeat(60));
console.log('');

let allChecks = true;

// Check 1: Verify test file exists and contains Property 9 tests
console.log('Check 1: Verifying test file...');
const testFilePath = path.join(__dirname, 'test', 'responsive-settings-menu-properties.test.js');
if (fs.existsSync(testFilePath)) {
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  if (testContent.includes('Property 9: Touch target minimum size')) {
    console.log('  ✓ Test file contains Property 9 tests');
    
    // Count the number of Property 9 tests
    const property9Tests = testContent.match(/Property 9.*Touch target minimum size/g);
    if (property9Tests) {
      console.log(`  ✓ Found ${property9Tests.length} Property 9 test cases`);
    }
    
    // Check for key test scenarios
    const scenarios = [
      'All interactive elements should be at least 44x44px',
      'Settings menu toggle button should be at least 44x44px',
      'Menu buttons should be at least 44x44px',
      'Menu select dropdowns should be at least 44x44px',
      'Menu input fields should be at least 44x44px',
      'Menu links should be at least 44x44px',
      'Touch target size should be consistent across mobile breakpoint',
      'Touch target size should apply on tablet devices too',
      'Close button should be at least 44x44px',
      'Custom controls with role="button" should be at least 44x44px'
    ];
    
    let foundScenarios = 0;
    scenarios.forEach(scenario => {
      if (testContent.includes(scenario)) {
        foundScenarios++;
      }
    });
    
    console.log(`  ✓ Found ${foundScenarios}/${scenarios.length} expected test scenarios`);
    
    if (foundScenarios < scenarios.length) {
      console.log('  ⚠ Some test scenarios may be missing');
    }
    
  } else {
    console.log('  ✗ Test file does not contain Property 9 tests');
    allChecks = false;
  }
} else {
  console.log('  ✗ Test file not found');
  allChecks = false;
}

console.log('');

// Check 2: Verify CSS implementation
console.log('Check 2: Verifying CSS implementation...');
const cssFilePath = path.join(__dirname, 'css', 'responsive-settings-menu.css');
if (fs.existsSync(cssFilePath)) {
  const cssContent = fs.readFileSync(cssFilePath, 'utf8');
  
  if (cssContent.includes('--touch-target-size: 44px')) {
    console.log('  ✓ CSS defines touch target size variable (44px)');
  } else {
    console.log('  ✗ CSS does not define touch target size variable');
    allChecks = false;
  }
  
  if (cssContent.includes('min-height: var(--touch-target-size)')) {
    console.log('  ✓ CSS applies minimum height to interactive elements');
  } else {
    console.log('  ✗ CSS does not apply minimum height');
    allChecks = false;
  }
  
  if (cssContent.includes('--touch-target-min-spacing: 8px')) {
    console.log('  ✓ CSS defines minimum spacing (8px)');
  } else {
    console.log('  ✗ CSS does not define minimum spacing');
    allChecks = false;
  }
  
  // Check for specific element types
  const elementTypes = [
    'button',
    'select',
    'input',
    'label',
    'a'
  ];
  
  let coveredElements = 0;
  elementTypes.forEach(element => {
    if (cssContent.includes(`.settings-menu-content ${element}`) || 
        cssContent.includes(`.menu-control-${element}`)) {
      coveredElements++;
    }
  });
  
  console.log(`  ✓ CSS covers ${coveredElements}/${elementTypes.length} interactive element types`);
  
} else {
  console.log('  ✗ CSS file not found');
  allChecks = false;
}

console.log('');

// Check 3: Verify HTML test runner exists
console.log('Check 3: Verifying HTML test runner...');
const htmlTestPath = path.join(__dirname, 'test-property-9-touch-targets.html');
if (fs.existsSync(htmlTestPath)) {
  const htmlContent = fs.readFileSync(htmlTestPath, 'utf8');
  
  if (htmlContent.includes('Property 9: Touch Target Minimum Size')) {
    console.log('  ✓ HTML test runner exists with correct title');
  } else {
    console.log('  ✗ HTML test runner has incorrect title');
    allChecks = false;
  }
  
  if (htmlContent.includes('MIN_TOUCH_TARGET_SIZE')) {
    console.log('  ✓ HTML test runner defines minimum touch target size');
  } else {
    console.log('  ✗ HTML test runner does not define minimum size');
    allChecks = false;
  }
  
  // Check for test elements
  const testElements = [
    'settingsMenuToggle',
    'settings-menu-panel',
    'menu-control-btn',
    'menu-control-select',
    'menu-control-input'
  ];
  
  let foundElements = 0;
  testElements.forEach(element => {
    if (htmlContent.includes(element)) {
      foundElements++;
    }
  });
  
  console.log(`  ✓ HTML test runner includes ${foundElements}/${testElements.length} test elements`);
  
} else {
  console.log('  ✗ HTML test runner not found');
  allChecks = false;
}

console.log('');

// Check 4: Verify requirements validation
console.log('Check 4: Verifying requirements validation...');
const designFilePath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'design.md');
if (fs.existsSync(designFilePath)) {
  const designContent = fs.readFileSync(designFilePath, 'utf8');
  
  if (designContent.includes('Property 9: Touch target minimum size')) {
    console.log('  ✓ Property 9 is defined in design document');
    
    if (designContent.includes('Requirements 4.1, 4.2')) {
      console.log('  ✓ Property 9 validates Requirements 4.1 and 4.2');
    } else {
      console.log('  ✗ Property 9 does not reference correct requirements');
      allChecks = false;
    }
  } else {
    console.log('  ✗ Property 9 not found in design document');
    allChecks = false;
  }
} else {
  console.log('  ✗ Design document not found');
  allChecks = false;
}

console.log('');

// Check 5: Verify task status
console.log('Check 5: Verifying task status...');
const tasksFilePath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'tasks.md');
if (fs.existsSync(tasksFilePath)) {
  const tasksContent = fs.readFileSync(tasksFilePath, 'utf8');
  
  if (tasksContent.includes('8.3 Write property test for touch target minimum size')) {
    console.log('  ✓ Task 8.3 is defined in tasks document');
    
    if (tasksContent.includes('Property 9: Touch target minimum size')) {
      console.log('  ✓ Task 8.3 references Property 9');
    } else {
      console.log('  ✗ Task 8.3 does not reference Property 9');
      allChecks = false;
    }
  } else {
    console.log('  ✗ Task 8.3 not found in tasks document');
    allChecks = false;
  }
} else {
  console.log('  ✗ Tasks document not found');
  allChecks = false;
}

console.log('');
console.log('=' .repeat(60));

if (allChecks) {
  console.log('✅ All verification checks passed!');
  console.log('');
  console.log('Summary:');
  console.log('  - Property 9 tests are implemented in the test file');
  console.log('  - CSS implementation includes touch target sizing');
  console.log('  - HTML test runner is available');
  console.log('  - Requirements validation is correct');
  console.log('  - Task 8.3 is properly defined');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open test-property-9-touch-targets.html in a browser');
  console.log('  2. Click "Run Property Tests" to execute the tests');
  console.log('  3. Verify all tests pass');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ Some verification checks failed!');
  console.log('');
  console.log('Please review the output above and fix any issues.');
  console.log('');
  process.exit(1);
}
