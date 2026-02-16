#!/usr/bin/env node

/**
 * Test Runner for Property 9: Touch Target Minimum Size
 * 
 * This script runs the property-based tests for touch target sizing
 * using Jest and fast-check.
 * 
 * Usage: node run-property-9-tests.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 Property 9: Touch Target Minimum Size Test Runner');
console.log('=' .repeat(60));
console.log('');

// Check if Jest is available
try {
  execSync('npx jest --version', { stdio: 'pipe' });
  console.log('✓ Jest is available');
} catch (error) {
  console.error('✗ Jest is not available. Installing...');
  try {
    execSync('npm install --save-dev jest', { stdio: 'inherit' });
    console.log('✓ Jest installed successfully');
  } catch (installError) {
    console.error('✗ Failed to install Jest');
    process.exit(1);
  }
}

// Check if fast-check is available
try {
  require.resolve('fast-check');
  console.log('✓ fast-check is available');
} catch (error) {
  console.error('✗ fast-check is not available. Installing...');
  try {
    execSync('npm install --save-dev fast-check', { stdio: 'inherit' });
    console.log('✓ fast-check installed successfully');
  } catch (installError) {
    console.error('✗ Failed to install fast-check');
    process.exit(1);
  }
}

console.log('');
console.log('Running Property 9 tests...');
console.log('');

// Run Jest tests for Property 9
try {
  const testCommand = 'npx jest test/responsive-settings-menu-properties.test.js --testNamePattern="Property 9" --verbose';
  
  console.log(`Executing: ${testCommand}`);
  console.log('');
  
  execSync(testCommand, { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test'
    }
  });
  
  console.log('');
  console.log('✅ All Property 9 tests completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log('  - Property 9 validates Requirements 4.1 and 4.2');
  console.log('  - All interactive elements must be at least 44x44px');
  console.log('  - Tests cover: buttons, selects, inputs, links, and custom controls');
  console.log('');
  
  process.exit(0);
  
} catch (error) {
  console.error('');
  console.error('❌ Property 9 tests failed!');
  console.error('');
  console.error('Please review the test output above for details.');
  console.error('');
  
  process.exit(1);
}
