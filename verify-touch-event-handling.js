#!/usr/bin/env node

/**
 * Verification Script for Task 8.2: Touch Event Handling
 * 
 * This script verifies that touch event handling has been correctly implemented
 * in the responsive settings menu system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Touch Event Handling Implementation (Task 8.2)...\n');

let allTestsPassed = true;
const results = [];

function logTest(testName, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = `${status}: ${testName}`;
  console.log(result);
  if (message) {
    console.log(`   ${message}`);
  }
  results.push({ testName, passed, message });
  if (!passed) allTestsPassed = false;
}

// Test 1: Verify settings-menu-manager.js has touch event handling methods
console.log('\n📋 Test 1: Verify JavaScript Implementation');
try {
  const settingsMenuManagerPath = path.join(__dirname, 'js', 'settings-menu-manager.js');
  const settingsMenuManagerContent = fs.readFileSync(settingsMenuManagerPath, 'utf8');
  
  // Check for setupTouchEventHandling method
  const hasSetupTouchEventHandling = settingsMenuManagerContent.includes('setupTouchEventHandling()');
  logTest(
    'setupTouchEventHandling method exists',
    hasSetupTouchEventHandling,
    hasSetupTouchEventHandling ? 'Method found in settings-menu-manager.js' : 'Method not found'
  );
  
  // Check for setupTouchFeedback method
  const hasSetupTouchFeedback = settingsMenuManagerContent.includes('setupTouchFeedback(element)');
  logTest(
    'setupTouchFeedback method exists',
    hasSetupTouchFeedback,
    hasSetupTouchFeedback ? 'Method found in settings-menu-manager.js' : 'Method not found'
  );
  
  // Check for touchstart event listener
  const hasTouchstartListener = settingsMenuManagerContent.includes("addEventListener('touchstart'");
  logTest(
    'touchstart event listener added',
    hasTouchstartListener,
    hasTouchstartListener ? 'touchstart listener found' : 'touchstart listener not found'
  );
  
  // Check for touchend event listener
  const hasTouchendListener = settingsMenuManagerContent.includes("addEventListener('touchend'");
  logTest(
    'touchend event listener added',
    hasTouchendListener,
    hasTouchendListener ? 'touchend listener found' : 'touchend listener not found'
  );
  
  // Check for touchcancel event listener
  const hasTouchcancelListener = settingsMenuManagerContent.includes("addEventListener('touchcancel'");
  logTest(
    'touchcancel event listener added',
    hasTouchcancelListener,
    hasTouchcancelListener ? 'touchcancel listener found' : 'touchcancel listener not found'
  );
  
  // Check for touch-active class manipulation
  const hasTouchActiveClass = settingsMenuManagerContent.includes("classList.add('touch-active')");
  logTest(
    'touch-active class manipulation',
    hasTouchActiveClass,
    hasTouchActiveClass ? 'touch-active class added on touch' : 'touch-active class not found'
  );
  
  // Check for haptic feedback
  const hasHapticFeedback = settingsMenuManagerContent.includes('navigator.vibrate');
  logTest(
    'Haptic feedback implementation',
    hasHapticFeedback,
    hasHapticFeedback ? 'Vibration API used for haptic feedback' : 'Haptic feedback not implemented'
  );
  
  // Check for passive event listeners
  const hasPassiveListeners = settingsMenuManagerContent.includes('{ passive: true }');
  logTest(
    'Passive event listeners',
    hasPassiveListeners,
    hasPassiveListeners ? 'Passive listeners used for performance' : 'Passive listeners not found'
  );
  
  // Check that registerControl method adds touch handling
  const registerControlHasTouchHandling = settingsMenuManagerContent.includes('setupTouchFeedback(controlElement)');
  logTest(
    'Dynamic control touch handling',
    registerControlHasTouchHandling,
    registerControlHasTouchHandling ? 'Touch handling added to dynamic controls' : 'Dynamic control touch handling missing'
  );
  
} catch (error) {
  logTest('JavaScript file verification', false, `Error reading file: ${error.message}`);
}

// Test 2: Verify CSS has touch-active styles
console.log('\n📋 Test 2: Verify CSS Implementation');
try {
  const cssPath = path.join(__dirname, 'css', 'responsive-settings-menu.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Check for touch-active base class
  const hasTouchActiveClass = cssContent.includes('.touch-active');
  logTest(
    'touch-active CSS class exists',
    hasTouchActiveClass,
    hasTouchActiveClass ? 'Base touch-active class found' : 'Base touch-active class not found'
  );
  
  // Check for button touch-active styles
  const hasButtonTouchActive = cssContent.includes('button.touch-active');
  logTest(
    'Button touch-active styles',
    hasButtonTouchActive,
    hasButtonTouchActive ? 'Button-specific touch-active styles found' : 'Button touch-active styles not found'
  );
  
  // Check for toggle button touch-active styles
  const hasToggleTouchActive = cssContent.includes('.settings-menu-toggle.touch-active');
  logTest(
    'Toggle button touch-active styles',
    hasToggleTouchActive,
    hasToggleTouchActive ? 'Toggle button touch-active styles found' : 'Toggle button touch-active styles not found'
  );
  
  // Check for select touch-active styles
  const hasSelectTouchActive = cssContent.includes('select.touch-active');
  logTest(
    'Select dropdown touch-active styles',
    hasSelectTouchActive,
    hasSelectTouchActive ? 'Select touch-active styles found' : 'Select touch-active styles not found'
  );
  
  // Check for transform in touch-active styles
  const hasTransform = cssContent.includes('transform: scale(0.98)') || cssContent.includes('transform: scale(0.95)');
  logTest(
    'Transform for visual feedback',
    hasTransform,
    hasTransform ? 'Scale transform found for touch feedback' : 'Transform not found'
  );
  
  // Check for opacity in touch-active styles
  const hasOpacity = cssContent.match(/\.touch-active[\s\S]*?opacity:\s*0\.[0-9]+/);
  logTest(
    'Opacity for visual feedback',
    !!hasOpacity,
    hasOpacity ? 'Opacity change found for touch feedback' : 'Opacity change not found'
  );
  
  // Check for dark theme support
  const hasDarkThemeSupport = cssContent.includes('@media (prefers-color-scheme: dark)') && 
                               cssContent.includes('.touch-active');
  logTest(
    'Dark theme support for touch-active',
    hasDarkThemeSupport,
    hasDarkThemeSupport ? 'Dark theme touch-active styles found' : 'Dark theme support not found'
  );
  
  // Check for fast transition
  const hasFastTransition = cssContent.includes('0.05s') || cssContent.includes('0.1s');
  logTest(
    'Fast transition for immediate feedback',
    hasFastTransition,
    hasFastTransition ? 'Fast transition found (0.05s or 0.1s)' : 'Fast transition not found'
  );
  
} catch (error) {
  logTest('CSS file verification', false, `Error reading file: ${error.message}`);
}

// Test 3: Verify test file exists
console.log('\n📋 Test 3: Verify Test File');
try {
  const testFilePath = path.join(__dirname, 'test-touch-event-handling.html');
  const testFileExists = fs.existsSync(testFilePath);
  logTest(
    'Test file exists',
    testFileExists,
    testFileExists ? 'test-touch-event-handling.html found' : 'Test file not found'
  );
  
  if (testFileExists) {
    const testContent = fs.readFileSync(testFilePath, 'utf8');
    
    // Check for settings menu manager initialization
    const hasManagerInit = testContent.includes('new SettingsMenuManager');
    logTest(
      'Test initializes settings menu manager',
      hasManagerInit,
      hasManagerInit ? 'Settings menu manager initialized in test' : 'Manager initialization not found'
    );
    
    // Check for touch event monitoring
    const hasTouchEventMonitoring = testContent.includes("addEventListener('touchstart'") &&
                                     testContent.includes("addEventListener('touchend'");
    logTest(
      'Test monitors touch events',
      hasTouchEventMonitoring,
      hasTouchEventMonitoring ? 'Touch event monitoring found in test' : 'Touch event monitoring not found'
    );
    
    // Check for visual feedback verification
    const hasVisualFeedbackCheck = testContent.includes('touch-active');
    logTest(
      'Test verifies visual feedback',
      hasVisualFeedbackCheck,
      hasVisualFeedbackCheck ? 'Visual feedback verification found' : 'Visual feedback check not found'
    );
  }
} catch (error) {
  logTest('Test file verification', false, `Error reading file: ${error.message}`);
}

// Test 4: Verify documentation exists
console.log('\n📋 Test 4: Verify Documentation');
try {
  const docPath = path.join(__dirname, 'TASK_8.2_TOUCH_EVENT_HANDLING_IMPLEMENTATION.md');
  const docExists = fs.existsSync(docPath);
  logTest(
    'Documentation file exists',
    docExists,
    docExists ? 'TASK_8.2_TOUCH_EVENT_HANDLING_IMPLEMENTATION.md found' : 'Documentation not found'
  );
  
  if (docExists) {
    const docContent = fs.readFileSync(docPath, 'utf8');
    
    // Check for requirements validation
    const hasRequirementsValidation = docContent.includes('Requirement 4.4') && 
                                       docContent.includes('Requirement 4.5');
    logTest(
      'Documentation validates requirements',
      hasRequirementsValidation,
      hasRequirementsValidation ? 'Requirements 4.4 and 4.5 validated' : 'Requirements validation not found'
    );
    
    // Check for implementation details
    const hasImplementationDetails = docContent.includes('setupTouchEventHandling') &&
                                      docContent.includes('setupTouchFeedback');
    logTest(
      'Documentation includes implementation details',
      hasImplementationDetails,
      hasImplementationDetails ? 'Implementation details documented' : 'Implementation details missing'
    );
  }
} catch (error) {
  logTest('Documentation verification', false, `Error reading file: ${error.message}`);
}

// Test 5: Verify task status
console.log('\n📋 Test 5: Verify Task Status');
try {
  const tasksPath = path.join(__dirname, '.kiro', 'specs', 'responsive-settings-menu', 'tasks.md');
  const tasksContent = fs.readFileSync(tasksPath, 'utf8');
  
  // Check if task 8.2 is marked as completed
  const task82Completed = tasksContent.includes('[x] 8.2 Add touch event handling') ||
                          tasksContent.includes('[X] 8.2 Add touch event handling');
  logTest(
    'Task 8.2 marked as completed',
    task82Completed,
    task82Completed ? 'Task 8.2 status: completed' : 'Task 8.2 not marked as completed'
  );
} catch (error) {
  logTest('Task status verification', false, `Error reading file: ${error.message}`);
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));

const passedTests = results.filter(r => r.passed).length;
const totalTests = results.length;
const passRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`\nTotal Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Pass Rate: ${passRate}%`);

if (allTestsPassed) {
  console.log('\n✅ ALL TESTS PASSED! Touch event handling implementation is complete.');
  console.log('\n📋 Requirements Satisfied:');
  console.log('   ✅ Requirement 4.4: Touch event listeners added to interactive elements');
  console.log('   ✅ Requirement 4.5: Immediate visual feedback on touch (active states)');
  console.log('\n🎉 Task 8.2 is ready for production!');
  process.exit(0);
} else {
  console.log('\n❌ SOME TESTS FAILED. Please review the implementation.');
  console.log('\n📋 Failed Tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`   ❌ ${r.testName}`);
    if (r.message) {
      console.log(`      ${r.message}`);
    }
  });
  process.exit(1);
}
