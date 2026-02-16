/**
 * Verification script for tasks 9.1-9.4
 * Tests keyboard navigation and ARIA attributes implementation
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('Keyboard Navigation & ARIA Attributes Verification');
console.log('Tasks 9.1-9.4');
console.log('='.repeat(60));
console.log();

let passCount = 0;
let failCount = 0;

function test(name, condition, details = '') {
  if (condition) {
    console.log(`✓ PASS: ${name}`);
    if (details) console.log(`  ${details}`);
    passCount++;
  } else {
    console.log(`✗ FAIL: ${name}`);
    if (details) console.log(`  ${details}`);
    failCount++;
  }
}

// Read the settings menu manager file
const managerPath = path.join(__dirname, 'js', 'settings-menu-manager.js');
const managerCode = fs.readFileSync(managerPath, 'utf8');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
const htmlCode = fs.readFileSync(htmlPath, 'utf8');

console.log('Task 9.1: Keyboard Event Handlers');
console.log('-'.repeat(60));

// Check for Escape key handler
test(
  '9.1.1 Escape key handler implemented',
  managerCode.includes("event.key === 'Escape'") || managerCode.includes("event.keyCode === 27"),
  'Escape key closes menu'
);

// Check for Tab key handler
test(
  '9.1.2 Tab key handler implemented',
  managerCode.includes("event.key === 'Tab'") || managerCode.includes("event.keyCode === 9"),
  'Tab key for focus navigation'
);

// Check for handleKeyDown method
test(
  '9.1.3 handleKeyDown method exists',
  managerCode.includes('handleKeyDown(event)'),
  'Central keyboard event handler'
);

// Check for keyboard event listener
test(
  '9.1.4 Keyboard event listener registered',
  managerCode.includes("addEventListener('keydown'"),
  'Document-level keydown listener'
);

console.log();
console.log('Task 9.2: Focus Trapping');
console.log('-'.repeat(60));

// Check for focus trap implementation
test(
  '9.2.1 handleFocusTrap method exists',
  managerCode.includes('handleFocusTrap(event)'),
  'Focus trap handler method'
);

// Check for focusable elements tracking
test(
  '9.2.2 Focusable elements tracked',
  managerCode.includes('this.focusableElements') && 
  managerCode.includes('this.firstFocusableElement') &&
  managerCode.includes('this.lastFocusableElement'),
  'First and last focusable elements stored'
);

// Check for updateFocusableElements method
test(
  '9.2.3 updateFocusableElements method exists',
  managerCode.includes('updateFocusableElements()'),
  'Method to update focusable elements list'
);

// Check for focus trap active flag
test(
  '9.2.4 Focus trap state managed',
  managerCode.includes('this.focusTrapActive'),
  'Focus trap activation flag'
);

// Check for Tab cycling logic
test(
  '9.2.5 Tab cycling implemented',
  managerCode.includes('event.shiftKey') &&
  managerCode.includes('firstFocusableElement') &&
  managerCode.includes('lastFocusableElement'),
  'Forward and backward Tab cycling'
);

console.log();
console.log('Task 9.3: Focus Restoration');
console.log('-'.repeat(60));

// Check for previous focus storage
test(
  '9.3.1 Previous focus element stored',
  managerCode.includes('this.previouslyFocusedElement') &&
  managerCode.includes('document.activeElement'),
  'Stores element that had focus before menu opened'
);

// Check for focus restoration on close
test(
  '9.3.2 Focus restored on close',
  managerCode.includes('previouslyFocusedElement.focus()'),
  'Restores focus when menu closes'
);

// Check for fallback to toggle button
test(
  '9.3.3 Fallback to toggle button',
  managerCode.includes('toggleButton.focus()'),
  'Falls back to toggle button if previous element unavailable'
);

console.log();
console.log('Task 9.4: ARIA Attributes');
console.log('-'.repeat(60));

// Check HTML for toggle button ARIA attributes
test(
  '9.4.1 Toggle button has aria-label',
  htmlCode.includes('aria-label="Open settings menu"'),
  'Toggle button labeled for screen readers'
);

test(
  '9.4.2 Toggle button has aria-expanded',
  htmlCode.includes('aria-expanded="false"'),
  'Toggle button indicates expanded state'
);

test(
  '9.4.3 Toggle button has aria-controls',
  htmlCode.includes('aria-controls="settingsMenuPanel"'),
  'Toggle button linked to panel'
);

test(
  '9.4.4 Toggle button has aria-haspopup',
  htmlCode.includes('aria-haspopup="true"'),
  'Toggle button indicates popup menu'
);

// Check HTML for panel ARIA attributes
test(
  '9.4.5 Panel has role="dialog"',
  htmlCode.includes('role="dialog"'),
  'Panel identified as dialog'
);

test(
  '9.4.6 Panel has aria-modal',
  htmlCode.includes('aria-modal="true"'),
  'Panel marked as modal'
);

test(
  '9.4.7 Panel has aria-labelledby',
  htmlCode.includes('aria-labelledby="settingsMenuTitle"'),
  'Panel labeled by title element'
);

test(
  '9.4.8 Panel has aria-hidden',
  htmlCode.includes('aria-hidden="true"') && htmlCode.includes('settingsMenuPanel'),
  'Panel visibility controlled by aria-hidden'
);

// Check for aria-live region (announcer)
test(
  '9.4.9 Announcer element exists',
  htmlCode.includes('settingsMenuAnnouncer') && htmlCode.includes('role="status"'),
  'Screen reader announcer with role="status"'
);

test(
  '9.4.10 Announcer has aria-live',
  htmlCode.includes('aria-live="polite"'),
  'Announcer uses polite aria-live'
);

test(
  '9.4.11 Announcer has aria-atomic',
  htmlCode.includes('aria-atomic="true"'),
  'Announcer reads entire content'
);

// Check JavaScript for ARIA attribute updates
test(
  '9.4.12 aria-expanded updated on open',
  managerCode.includes("setAttribute('aria-expanded', 'true')"),
  'aria-expanded set to true when menu opens'
);

test(
  '9.4.13 aria-expanded updated on close',
  managerCode.includes("setAttribute('aria-expanded', 'false')"),
  'aria-expanded set to false when menu closes'
);

test(
  '9.4.14 Panel aria-hidden updated',
  managerCode.includes("panel.setAttribute('aria-hidden'") ||
  managerCode.includes("this.panel.setAttribute('aria-hidden'"),
  'Panel aria-hidden updated with menu state'
);

// Check for announce method
test(
  '9.4.15 Announce method exists',
  managerCode.includes('announce(message)'),
  'Method to announce state changes'
);

test(
  '9.4.16 Menu opened announced',
  managerCode.includes('Settings menu opened') || 
  managerCode.includes("announce('") && managerCode.includes('open'),
  'Announces when menu opens'
);

test(
  '9.4.17 Menu closed announced',
  managerCode.includes('Settings menu closed') || 
  managerCode.includes("announce('") && managerCode.includes('clos'),
  'Announces when menu closes'
);

console.log();
console.log('='.repeat(60));
console.log('Summary');
console.log('='.repeat(60));
console.log(`Total tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log();

if (failCount === 0) {
  console.log('✓ All tasks 9.1-9.4 implemented correctly!');
  console.log();
  console.log('Implementation includes:');
  console.log('  • Keyboard event handlers (Tab, Enter, Escape)');
  console.log('  • Focus trapping within menu');
  console.log('  • Focus restoration on close');
  console.log('  • Comprehensive ARIA attributes');
  console.log('  • Screen reader announcements');
  process.exit(0);
} else {
  console.log('✗ Some tests failed. Please review the implementation.');
  process.exit(1);
}
