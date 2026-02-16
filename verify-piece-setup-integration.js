#!/usr/bin/env node

/**
 * Verification Script: Piece Setup Integration
 * 
 * This script verifies that the piece setup button has been successfully
 * moved into the settings menu and that all functionality is preserved.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Piece Setup Integration...\n');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf8');

let allTestsPassed = true;
const results = [];

// Test 1: Piece setup button exists in settings menu
function testButtonInSettingsMenu() {
  const settingsMenuContentRegex = /<div class="settings-menu-content"[^>]*>([\s\S]*?)<\/div>\s*<\/aside>/;
  const match = indexContent.match(settingsMenuContentRegex);
  
  if (!match) {
    results.push({
      test: 'Test 1: Button in Settings Menu',
      passed: false,
      message: 'Settings menu content not found'
    });
    return false;
  }
  
  const menuContent = match[1];
  const hasPieceSetupButton = menuContent.includes('id="btnPieceSetup"') && 
                               menuContent.includes('openPieceSetup()');
  
  results.push({
    test: 'Test 1: Button in Settings Menu',
    passed: hasPieceSetupButton,
    message: hasPieceSetupButton 
      ? 'Piece setup button found in settings menu content' 
      : 'Piece setup button not found in settings menu'
  });
  
  return hasPieceSetupButton;
}

// Test 2: Piece setup button NOT in old location
function testButtonNotInOldLocation() {
  // Find the old settings panel (not the settings menu)
  const settingsPanelRegex = /<div id="settingsPanel"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/;
  const match = indexContent.match(settingsPanelRegex);
  
  if (!match) {
    results.push({
      test: 'Test 2: Button Not in Old Location',
      passed: false,
      message: 'Settings panel not found (this might be okay if it was removed)'
    });
    return true; // Not a failure if the old panel doesn't exist
  }
  
  const panelContent = match[1];
  
  // Check if piece setup button is in the extra-controls section
  const extraControlsRegex = /<div class="extra-controls"[^>]*>([\s\S]*?)<\/div>/;
  const extraControlsMatch = panelContent.match(extraControlsRegex);
  
  if (!extraControlsMatch) {
    results.push({
      test: 'Test 2: Button Not in Old Location',
      passed: true,
      message: 'Extra controls section not found or empty'
    });
    return true;
  }
  
  const extraControls = extraControlsMatch[1];
  const hasPieceSetupInOldLocation = extraControls.includes('id="btnPieceSetup"');
  
  results.push({
    test: 'Test 2: Button Not in Old Location',
    passed: !hasPieceSetupInOldLocation,
    message: hasPieceSetupInOldLocation 
      ? 'ERROR: Piece setup button still in old location!' 
      : 'Piece setup button successfully removed from old location'
  });
  
  return !hasPieceSetupInOldLocation;
}

// Test 3: Event handler preserved
function testEventHandlerPreserved() {
  const buttonRegex = /<button[^>]*id="btnPieceSetup"[^>]*>/;
  const match = indexContent.match(buttonRegex);
  
  if (!match) {
    results.push({
      test: 'Test 3: Event Handler Preserved',
      passed: false,
      message: 'Piece setup button not found'
    });
    return false;
  }
  
  const buttonTag = match[0];
  const hasOnclick = buttonTag.includes('onclick="openPieceSetup()"');
  
  results.push({
    test: 'Test 3: Event Handler Preserved',
    passed: hasOnclick,
    message: hasOnclick 
      ? 'onclick="openPieceSetup()" handler preserved' 
      : 'Event handler missing or incorrect'
  });
  
  return hasOnclick;
}

// Test 4: Button has correct CSS classes
function testButtonClasses() {
  const buttonRegex = /<button[^>]*id="btnPieceSetup"[^>]*>/;
  const match = indexContent.match(buttonRegex);
  
  if (!match) {
    results.push({
      test: 'Test 4: Button CSS Classes',
      passed: false,
      message: 'Piece setup button not found'
    });
    return false;
  }
  
  const buttonTag = match[0];
  const hasCorrectClasses = buttonTag.includes('class="extra-btn menu-control-btn"');
  
  results.push({
    test: 'Test 4: Button CSS Classes',
    passed: hasCorrectClasses,
    message: hasCorrectClasses 
      ? 'Button has correct CSS classes (extra-btn menu-control-btn)' 
      : 'Button missing correct CSS classes'
  });
  
  return hasCorrectClasses;
}

// Test 5: Button wrapped in menu-control-group
function testButtonWrapping() {
  const menuControlGroupRegex = /<div class="menu-control-group">[\s\S]*?<button[^>]*id="btnPieceSetup"[^>]*>[\s\S]*?<\/div>/;
  const match = indexContent.match(menuControlGroupRegex);
  
  const isWrapped = match !== null;
  
  results.push({
    test: 'Test 5: Button Wrapped in Control Group',
    passed: isWrapped,
    message: isWrapped 
      ? 'Button correctly wrapped in menu-control-group div' 
      : 'Button not wrapped in menu-control-group'
  });
  
  return isWrapped;
}

// Test 6: Button text element preserved
function testButtonText() {
  const buttonContentRegex = /<button[^>]*id="btnPieceSetup"[^>]*>([\s\S]*?)<\/button>/;
  const match = indexContent.match(buttonContentRegex);
  
  if (!match) {
    results.push({
      test: 'Test 6: Button Text Preserved',
      passed: false,
      message: 'Piece setup button not found'
    });
    return false;
  }
  
  const buttonContent = match[1];
  const hasIcon = buttonContent.includes('♔');
  const hasTextSpan = buttonContent.includes('<span id="btnPieceSetupText">');
  
  results.push({
    test: 'Test 6: Button Text Preserved',
    passed: hasIcon && hasTextSpan,
    message: hasIcon && hasTextSpan 
      ? 'Button icon (♔) and text span preserved' 
      : 'Button content missing icon or text span'
  });
  
  return hasIcon && hasTextSpan;
}

// Run all tests
const test1 = testButtonInSettingsMenu();
const test2 = testButtonNotInOldLocation();
const test3 = testEventHandlerPreserved();
const test4 = testButtonClasses();
const test5 = testButtonWrapping();
const test6 = testButtonText();

allTestsPassed = test1 && test2 && test3 && test4 && test5 && test6;

// Print results
console.log('═══════════════════════════════════════════════════════════\n');
results.forEach(result => {
  const icon = result.passed ? '✓' : '✗';
  const color = result.passed ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  
  console.log(`${color}${icon} ${result.test}${reset}`);
  console.log(`  ${result.message}\n`);
});

console.log('═══════════════════════════════════════════════════════════\n');

if (allTestsPassed) {
  console.log('\x1b[32m✓ All tests passed! Piece setup integration successful.\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\x1b[31m✗ Some tests failed. Please review the results above.\x1b[0m\n');
  process.exit(1);
}
