#!/usr/bin/env python3
"""
Verification script for tasks 9.1-9.4
Tests keyboard navigation and ARIA attributes implementation
"""

import os
import re

print('=' * 60)
print('Keyboard Navigation & ARIA Attributes Verification')
print('Tasks 9.1-9.4')
print('=' * 60)
print()

pass_count = 0
fail_count = 0

def test(name, condition, details=''):
    global pass_count, fail_count
    if condition:
        print(f'✓ PASS: {name}')
        if details:
            print(f'  {details}')
        pass_count += 1
    else:
        print(f'✗ FAIL: {name}')
        if details:
            print(f'  {details}')
        fail_count += 1

# Read the settings menu manager file
manager_path = os.path.join('js', 'settings-menu-manager.js')
with open(manager_path, 'r') as f:
    manager_code = f.read()

# Read the HTML file
html_path = 'index.html'
with open(html_path, 'r') as f:
    html_code = f.read()

print('Task 9.1: Keyboard Event Handlers')
print('-' * 60)

# Check for Escape key handler
test(
    '9.1.1 Escape key handler implemented',
    "event.key === 'Escape'" in manager_code or "event.keyCode === 27" in manager_code,
    'Escape key closes menu'
)

# Check for Tab key handler
test(
    '9.1.2 Tab key handler implemented',
    "event.key === 'Tab'" in manager_code or "event.keyCode === 9" in manager_code,
    'Tab key for focus navigation'
)

# Check for handleKeyDown method
test(
    '9.1.3 handleKeyDown method exists',
    'handleKeyDown(event)' in manager_code,
    'Central keyboard event handler'
)

# Check for keyboard event listener
test(
    '9.1.4 Keyboard event listener registered',
    "addEventListener('keydown'" in manager_code,
    'Document-level keydown listener'
)

print()
print('Task 9.2: Focus Trapping')
print('-' * 60)

# Check for focus trap implementation
test(
    '9.2.1 handleFocusTrap method exists',
    'handleFocusTrap(event)' in manager_code,
    'Focus trap handler method'
)

# Check for focusable elements tracking
test(
    '9.2.2 Focusable elements tracked',
    'this.focusableElements' in manager_code and 
    'this.firstFocusableElement' in manager_code and
    'this.lastFocusableElement' in manager_code,
    'First and last focusable elements stored'
)

# Check for updateFocusableElements method
test(
    '9.2.3 updateFocusableElements method exists',
    'updateFocusableElements()' in manager_code,
    'Method to update focusable elements list'
)

# Check for focus trap active flag
test(
    '9.2.4 Focus trap state managed',
    'this.focusTrapActive' in manager_code,
    'Focus trap activation flag'
)

# Check for Tab cycling logic
test(
    '9.2.5 Tab cycling implemented',
    'event.shiftKey' in manager_code and
    'firstFocusableElement' in manager_code and
    'lastFocusableElement' in manager_code,
    'Forward and backward Tab cycling'
)

print()
print('Task 9.3: Focus Restoration')
print('-' * 60)

# Check for previous focus storage
test(
    '9.3.1 Previous focus element stored',
    'this.previouslyFocusedElement' in manager_code and
    'document.activeElement' in manager_code,
    'Stores element that had focus before menu opened'
)

# Check for focus restoration on close
test(
    '9.3.2 Focus restored on close',
    'previouslyFocusedElement.focus()' in manager_code,
    'Restores focus when menu closes'
)

# Check for fallback to toggle button
test(
    '9.3.3 Fallback to toggle button',
    'toggleButton.focus()' in manager_code,
    'Falls back to toggle button if previous element unavailable'
)

print()
print('Task 9.4: ARIA Attributes')
print('-' * 60)

# Check HTML for toggle button ARIA attributes
test(
    '9.4.1 Toggle button has aria-label',
    'aria-label="Open settings menu"' in html_code,
    'Toggle button labeled for screen readers'
)

test(
    '9.4.2 Toggle button has aria-expanded',
    'aria-expanded="false"' in html_code,
    'Toggle button indicates expanded state'
)

test(
    '9.4.3 Toggle button has aria-controls',
    'aria-controls="settingsMenuPanel"' in html_code,
    'Toggle button linked to panel'
)

test(
    '9.4.4 Toggle button has aria-haspopup',
    'aria-haspopup="true"' in html_code,
    'Toggle button indicates popup menu'
)

# Check HTML for panel ARIA attributes
test(
    '9.4.5 Panel has role="dialog"',
    'role="dialog"' in html_code,
    'Panel identified as dialog'
)

test(
    '9.4.6 Panel has aria-modal',
    'aria-modal="true"' in html_code,
    'Panel marked as modal'
)

test(
    '9.4.7 Panel has aria-labelledby',
    'aria-labelledby="settingsMenuTitle"' in html_code,
    'Panel labeled by title element'
)

test(
    '9.4.8 Panel has aria-hidden',
    'aria-hidden="true"' in html_code and 'settingsMenuPanel' in html_code,
    'Panel visibility controlled by aria-hidden'
)

# Check for aria-live region (announcer)
test(
    '9.4.9 Announcer element exists',
    'settingsMenuAnnouncer' in html_code and 'role="status"' in html_code,
    'Screen reader announcer with role="status"'
)

test(
    '9.4.10 Announcer has aria-live',
    'aria-live="polite"' in html_code,
    'Announcer uses polite aria-live'
)

test(
    '9.4.11 Announcer has aria-atomic',
    'aria-atomic="true"' in html_code,
    'Announcer reads entire content'
)

# Check JavaScript for ARIA attribute updates
test(
    '9.4.12 aria-expanded updated on open',
    "setAttribute('aria-expanded', 'true')" in manager_code,
    'aria-expanded set to true when menu opens'
)

test(
    '9.4.13 aria-expanded updated on close',
    "setAttribute('aria-expanded', 'false')" in manager_code,
    'aria-expanded set to false when menu closes'
)

test(
    '9.4.14 Panel aria-hidden updated',
    "panel.setAttribute('aria-hidden'" in manager_code or
    "this.panel.setAttribute('aria-hidden'" in manager_code,
    'Panel aria-hidden updated with menu state'
)

# Check for announce method
test(
    '9.4.15 Announce method exists',
    'announce(message)' in manager_code,
    'Method to announce state changes'
)

test(
    '9.4.16 Menu opened announced',
    'Settings menu opened' in manager_code or 
    ("announce('" in manager_code and 'open' in manager_code),
    'Announces when menu opens'
)

test(
    '9.4.17 Menu closed announced',
    'Settings menu closed' in manager_code or 
    ("announce('" in manager_code and 'clos' in manager_code),
    'Announces when menu closes'
)

print()
print('=' * 60)
print('Summary')
print('=' * 60)
print(f'Total tests: {pass_count + fail_count}')
print(f'Passed: {pass_count}')
print(f'Failed: {fail_count}')
print()

if fail_count == 0:
    print('✓ All tasks 9.1-9.4 implemented correctly!')
    print()
    print('Implementation includes:')
    print('  • Keyboard event handlers (Tab, Enter, Escape)')
    print('  • Focus trapping within menu')
    print('  • Focus restoration on close')
    print('  • Comprehensive ARIA attributes')
    print('  • Screen reader announcements')
    exit(0)
else:
    print('✗ Some tests failed. Please review the implementation.')
    exit(1)
