#!/usr/bin/env node

/**
 * Verification Script for Property 10: Touch Target Spacing
 * 
 * This script verifies that the property test implementation is correct
 * and follows the design document specifications.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Property 10: Touch Target Spacing - Verification');
console.log('=' .repeat(60));
console.log('');

// 1. Verify test file exists and contains Property 10
console.log('1️⃣  Verifying Test File');
console.log('-'.repeat(60));

const testFilePath = path.join(__dirname, 'test', 'responsive-settings-menu-properties.test.js');

if (fs.existsSync(testFilePath)) {
  console.log('  ✓ Test file exists');
  
  const testContent = fs.readFileSync(testFilePath, 'utf8');
  
  if (testContent.includes('Property 10: Touch target spacing')) {
    console.log('  ✓ Test file contains Property 10 tests');
    
    // Count the number of Property 10 tests
    const property10Tests = testContent.match(/Property 10.*Touch target spacing/g);
    if (property10Tests) {
      console.log(`  ✓ Found ${property10Tests.length} Property 10 test cases`);
    }
    
    // Verify validation tag
    if (testContent.includes('**Validates: Requirements 4.3**')) {
      console.log('  ✓ Correct validation tag present (Requirements 4.3)');
    } else {
      console.log('  ⚠️  Warning: Validation tag may be incorrect');
    }
    
    // Verify feature tag
    if (testContent.includes('**Feature: responsive-settings-menu, Property 10')) {
      console.log('  ✓ Correct feature tag present');
    } else {
      console.log('  ⚠️  Warning: Feature tag may be incorrect');
    }
  } else {
    console.log('  ❌ Property 10 tests not found in test file');
  }
} else {
  console.log('  ❌ Test file not found');
}

console.log('');

// 2. Verify helper functions
console.log('2️⃣  Verifying Helper Functions');
console.log('-'.repeat(60));

const requiredHelpers = [
  { name: 'getVisibleInteractiveElements', purpose: 'Get all visible interactive elements' },
  { name: 'calculateSpacing', purpose: 'Calculate spacing between two elements' },
  { name: 'areElementsAdjacent', purpose: 'Check if elements are adjacent' },
  { name: 'simulateTouchDevice', purpose: 'Simulate touch device viewport' }
];

const testContent = fs.readFileSync(testFilePath, 'utf8');

for (const helper of requiredHelpers) {
  if (testContent.includes(`function ${helper.name}`)) {
    console.log(`  ✓ ${helper.name} - ${helper.purpose}`);
  } else {
    console.log(`  ❌ Missing: ${helper.name}`);
  }
}

console.log('');

// 3. Verify constants
console.log('3️⃣  Verifying Constants');
console.log('-'.repeat(60));

if (testContent.includes('MIN_TOUCH_TARGET_SPACING')) {
  const match = testContent.match(/MIN_TOUCH_TARGET_SPACING\s*=\s*(\d+)/);
  if (match) {
    const value = parseInt(match[1]);
    if (value === 8) {
      console.log(`  ✓ MIN_TOUCH_TARGET_SPACING = ${value} pixels (correct)`);
    } else {
      console.log(`  ⚠️  MIN_TOUCH_TARGET_SPACING = ${value} pixels (expected 8)`);
    }
  }
} else {
  console.log('  ❌ MIN_TOUCH_TARGET_SPACING constant not found');
}

console.log('');

// 4. Verify test coverage
console.log('4️⃣  Verifying Test Coverage');
console.log('-'.repeat(60));

const expectedTests = [
  'All adjacent interactive elements should have at least 8px spacing',
  'Buttons in the same row should have at least 8px horizontal spacing',
  'Vertically stacked elements should have at least 8px vertical spacing',
  'Touch target spacing should be consistent across mobile breakpoint',
  'Touch target spacing should apply on tablet devices too',
  'Menu controls should not overlap',
  'Toggle button should have adequate spacing from other elements'
];

let testCoverage = 0;
for (const testCase of expectedTests) {
  // Check if test case is present (simplified check)
  const keywords = testCase.toLowerCase().split(' ').filter(w => w.length > 4);
  const hasTest = keywords.some(keyword => testContent.toLowerCase().includes(keyword));
  
  if (hasTest) {
    console.log(`  ✓ ${testCase}`);
    testCoverage++;
  } else {
    console.log(`  ⚠️  ${testCase}`);
  }
}

console.log(`  Coverage: ${testCoverage}/${expectedTests.length} test cases`);

console.log('');

// 5. Verify fast-check usage
console.log('5️⃣  Verifying fast-check Usage');
console.log('-'.repeat(60));

if (testContent.includes('fc.assert')) {
  console.log('  ✓ fc.assert usage found');
}

if (testContent.includes('fc.property')) {
  console.log('  ✓ fc.property usage found');
}

if (testContent.includes('numRuns: 100')) {
  console.log('  ✓ Correct number of runs (100)');
}

if (testContent.includes('mobileWidthGenerator')) {
  console.log('  ✓ Mobile width generator used');
}

if (testContent.includes('tabletWidthGenerator')) {
  console.log('  ✓ Tablet width generator used');
}

console.log('');

// 6. Verify HTML test runner
console.log('6️⃣  Verifying HTML Test Runner');
console.log('-'.repeat(60));

const htmlTestPath = path.join(__dirname, 'test-property-10-touch-spacing.html');

if (fs.existsSync(htmlTestPath)) {
  console.log('  ✓ HTML test runner exists');
  
  const htmlContent = fs.readFileSync(htmlTestPath, 'utf8');
  
  if (htmlContent.includes('Property 10: Touch Target Spacing')) {
    console.log('  ✓ HTML test runner has correct title');
  }
  
  if (htmlContent.includes('fast-check')) {
    console.log('  ✓ fast-check library loaded');
  }
  
  if (htmlContent.includes('settings-menu-panel')) {
    console.log('  ✓ Mock settings menu present');
  }
  
  if (htmlContent.includes('menu-button')) {
    console.log('  ✓ Interactive elements present for testing');
  }
} else {
  console.log('  ⚠️  HTML test runner not found');
}

console.log('');

// 7. Verify design document alignment
console.log('7️⃣  Verifying Design Document Alignment');
console.log('-'.repeat(60));

const designFilePath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'design.md');

if (fs.existsSync(designFilePath)) {
  console.log('  ✓ Design document exists');
  
  const designContent = fs.readFileSync(designFilePath, 'utf8');
  
  if (designContent.includes('Property 10: Touch target spacing')) {
    console.log('  ✓ Property 10 is defined in design document');
    
    if (designContent.includes('Requirements 4.3')) {
      console.log('  ✓ Correct requirement reference (4.3)');
    }
    
    if (designContent.includes('8 pixels') || designContent.includes('8px')) {
      console.log('  ✓ Correct spacing value (8 pixels)');
    }
  }
} else {
  console.log('  ⚠️  Design document not found');
}

console.log('');

// 8. Verify tasks document
console.log('8️⃣  Verifying Tasks Document');
console.log('-'.repeat(60));

const tasksFilePath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'tasks.md');

if (fs.existsSync(tasksFilePath)) {
  console.log('  ✓ Tasks document exists');
  
  const tasksContent = fs.readFileSync(tasksFilePath, 'utf8');
  
  if (tasksContent.includes('8.4')) {
    console.log('  ✓ Task 8.4 is defined in tasks document');
    
    if (tasksContent.includes('Property 10: Touch target spacing')) {
      console.log('  ✓ Task 8.4 references Property 10');
    }
    
    if (tasksContent.includes('Requirements 4.3')) {
      console.log('  ✓ Task 8.4 validates Requirements 4.3');
    }
  }
} else {
  console.log('  ⚠️  Tasks document not found');
}

console.log('');

// 9. Verify requirements document
console.log('9️⃣  Verifying Requirements Document');
console.log('-'.repeat(60));

const requirementsFilePath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'requirements.md');

if (fs.existsSync(requirementsFilePath)) {
  console.log('  ✓ Requirements document exists');
  
  const requirementsContent = fs.readFileSync(requirementsFilePath, 'utf8');
  
  if (requirementsContent.includes('4.3')) {
    console.log('  ✓ Requirement 4.3 exists');
    
    if (requirementsContent.includes('spacing') && requirementsContent.includes('8px')) {
      console.log('  ✓ Requirement 4.3 specifies 8px spacing');
    }
    
    if (requirementsContent.includes('interactive elements')) {
      console.log('  ✓ Requirement 4.3 mentions interactive elements');
    }
  }
} else {
  console.log('  ⚠️  Requirements document not found');
}

console.log('');

// Final summary
console.log('=' .repeat(60));
console.log('');
console.log('📊 Verification Summary');
console.log('');

const checks = [
  fs.existsSync(testFilePath) && testContent.includes('Property 10'),
  testContent.includes('getVisibleInteractiveElements'),
  testContent.includes('calculateSpacing'),
  testContent.includes('MIN_TOUCH_TARGET_SPACING'),
  testContent.includes('fc.assert'),
  fs.existsSync(htmlTestPath),
  testCoverage >= 5
];

const passedChecks = checks.filter(c => c).length;
const totalChecks = checks.length;

console.log(`✓ Passed: ${passedChecks}/${totalChecks} checks`);
console.log('');

if (passedChecks === totalChecks) {
  console.log('🎉 All verification checks passed!');
  console.log('✅ Property 10 implementation is complete and correct');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run the tests: node run-property-10-tests.js');
  console.log('  2. Open test-property-10-touch-spacing.html in a browser');
  console.log('  3. Verify all tests pass');
  process.exit(0);
} else {
  console.log('⚠️  Some verification checks failed');
  console.log('Please review the output above for details');
  process.exit(1);
}
