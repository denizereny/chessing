#!/usr/bin/env node

/**
 * Verification Script for Property 19 Tests
 * Checks that all required tests are present and properly structured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Property 19: Board Visibility Priority Tests');
console.log('=' .repeat(60));

// Read the test file
const testFilePath = path.join(__dirname, 'test', 'responsive-settings-menu-properties.test.js');
const testContent = fs.readFileSync(testFilePath, 'utf8');

// Expected tests for Property 19
const expectedTests = [
  'Board should be the largest UI element for any viewport size',
  'Board should occupy at least 50% of mobile viewport',
  'Board should occupy at least 40% of tablet viewport',
  'Board should occupy at least 30% of desktop viewport',
  'Board should be larger than settings menu when menu is open',
  'Board should be larger than any individual control element',
  'Board area should increase proportionally with viewport size',
  'Board should be visible and not obscured by other elements'
];

console.log('\n📋 Checking for required tests...\n');

let allTestsFound = true;
let testCount = 0;

expectedTests.forEach((testName, index) => {
  const testNumber = index + 1;
  const found = testContent.includes(testName);
  
  if (found) {
    console.log(`✅ Test ${testNumber}: ${testName}`);
    testCount++;
  } else {
    console.log(`❌ Test ${testNumber}: ${testName} - NOT FOUND`);
    allTestsFound = false;
  }
});

console.log('\n' + '=' .repeat(60));

// Check for Property 19 describe block
const hasDescribeBlock = testContent.includes("describe('Property 19: Board visibility priority'");
console.log(`\n📦 Property 19 describe block: ${hasDescribeBlock ? '✅ Found' : '❌ Not found'}`);

// Check for helper functions
const helperFunctions = [
  'getUIElements',
  'getBoardElement',
  'calculateElementArea',
  'checkBoardVisibilityPriority'
];

console.log('\n🔧 Helper functions:');
helperFunctions.forEach(funcName => {
  const found = testContent.includes(`function ${funcName}`);
  console.log(`  ${found ? '✅' : '❌'} ${funcName}`);
});

// Check for fast-check usage
const usesFastCheck = testContent.includes('fc.assert') && testContent.includes('fc.property');
console.log(`\n⚡ Uses fast-check: ${usesFastCheck ? '✅ Yes' : '❌ No'}`);

// Check for proper test annotations
const hasFeatureAnnotation = testContent.includes('**Feature: responsive-settings-menu, Property 19');
const hasValidatesAnnotation = testContent.includes('**Validates: Requirements 8.6**');
console.log(`\n📝 Test annotations:`);
console.log(`  ${hasFeatureAnnotation ? '✅' : '❌'} Feature annotation`);
console.log(`  ${hasValidatesAnnotation ? '✅' : '❌'} Validates annotation`);

// Check for viewport generators
const generators = [
  'viewportDimensionsGenerator',
  'mobileWidthGenerator',
  'tabletWidthGenerator',
  'desktopWidthGenerator'
];

console.log(`\n🎲 Generators used:`);
generators.forEach(genName => {
  const found = testContent.includes(genName);
  console.log(`  ${found ? '✅' : '❌'} ${genName}`);
});

// Summary
console.log('\n' + '=' .repeat(60));
console.log('\n📊 Verification Summary:');
console.log(`  Tests found: ${testCount}/${expectedTests.length}`);
console.log(`  Describe block: ${hasDescribeBlock ? '✅' : '❌'}`);
console.log(`  Helper functions: ${helperFunctions.length}/4`);
console.log(`  Fast-check integration: ${usesFastCheck ? '✅' : '❌'}`);
console.log(`  Proper annotations: ${hasFeatureAnnotation && hasValidatesAnnotation ? '✅' : '❌'}`);

if (allTestsFound && hasDescribeBlock && usesFastCheck && hasFeatureAnnotation && hasValidatesAnnotation) {
  console.log('\n✅ All Property 19 tests are properly implemented!');
  console.log('\n🚀 Ready to run tests in browser:');
  console.log('   Open: test-property-19-board-visibility.html');
  process.exit(0);
} else {
  console.log('\n❌ Some tests or components are missing.');
  console.log('   Please review the implementation.');
  process.exit(1);
}
