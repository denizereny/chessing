#!/usr/bin/env python3

"""
Verification Script: Piece Setup Integration

This script verifies that the piece setup button has been successfully
moved into the settings menu and that all functionality is preserved.
"""

import re
import sys

print('🔍 Verifying Piece Setup Integration...\n')

# Read the index.html file
with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

all_tests_passed = True
results = []

# Test 1: Piece setup button exists in settings menu
def test_button_in_settings_menu():
    pattern = r'<div class="settings-menu-content"[^>]*>([\s\S]*?)</div>\s*</aside>'
    match = re.search(pattern, index_content)
    
    if not match:
        results.append({
            'test': 'Test 1: Button in Settings Menu',
            'passed': False,
            'message': 'Settings menu content not found'
        })
        return False
    
    menu_content = match.group(1)
    has_piece_setup_button = 'id="btnPieceSetup"' in menu_content and 'openPieceSetup()' in menu_content
    
    results.append({
        'test': 'Test 1: Button in Settings Menu',
        'passed': has_piece_setup_button,
        'message': 'Piece setup button found in settings menu content' if has_piece_setup_button else 'Piece setup button not found in settings menu'
    })
    
    return has_piece_setup_button

# Test 2: Piece setup button NOT in old location
def test_button_not_in_old_location():
    # Find the old settings panel (not the settings menu)
    pattern = r'<div id="settingsPanel"[^>]*>([\s\S]*?)</div>\s*</div>'
    match = re.search(pattern, index_content)
    
    if not match:
        results.append({
            'test': 'Test 2: Button Not in Old Location',
            'passed': True,
            'message': 'Settings panel not found (this might be okay if it was removed)'
        })
        return True
    
    panel_content = match.group(1)
    
    # Check if piece setup button is in the extra-controls section
    extra_controls_pattern = r'<div class="extra-controls"[^>]*>([\s\S]*?)</div>'
    extra_controls_match = re.search(extra_controls_pattern, panel_content)
    
    if not extra_controls_match:
        results.append({
            'test': 'Test 2: Button Not in Old Location',
            'passed': True,
            'message': 'Extra controls section not found or empty'
        })
        return True
    
    extra_controls = extra_controls_match.group(1)
    has_piece_setup_in_old_location = 'id="btnPieceSetup"' in extra_controls
    
    results.append({
        'test': 'Test 2: Button Not in Old Location',
        'passed': not has_piece_setup_in_old_location,
        'message': 'ERROR: Piece setup button still in old location!' if has_piece_setup_in_old_location else 'Piece setup button successfully removed from old location'
    })
    
    return not has_piece_setup_in_old_location

# Test 3: Event handler preserved
def test_event_handler_preserved():
    pattern = r'<button[^>]*id="btnPieceSetup"[^>]*>'
    match = re.search(pattern, index_content)
    
    if not match:
        results.append({
            'test': 'Test 3: Event Handler Preserved',
            'passed': False,
            'message': 'Piece setup button not found'
        })
        return False
    
    button_tag = match.group(0)
    has_onclick = 'onclick="openPieceSetup()"' in button_tag
    
    results.append({
        'test': 'Test 3: Event Handler Preserved',
        'passed': has_onclick,
        'message': 'onclick="openPieceSetup()" handler preserved' if has_onclick else 'Event handler missing or incorrect'
    })
    
    return has_onclick

# Test 4: Button has correct CSS classes
def test_button_classes():
    pattern = r'<button[^>]*id="btnPieceSetup"[^>]*>'
    match = re.search(pattern, index_content)
    
    if not match:
        results.append({
            'test': 'Test 4: Button CSS Classes',
            'passed': False,
            'message': 'Piece setup button not found'
        })
        return False
    
    button_tag = match.group(0)
    has_correct_classes = 'class="extra-btn menu-control-btn"' in button_tag
    
    results.append({
        'test': 'Test 4: Button CSS Classes',
        'passed': has_correct_classes,
        'message': 'Button has correct CSS classes (extra-btn menu-control-btn)' if has_correct_classes else 'Button missing correct CSS classes'
    })
    
    return has_correct_classes

# Test 5: Button wrapped in menu-control-group
def test_button_wrapping():
    pattern = r'<div class="menu-control-group">[\s\S]*?<button[^>]*id="btnPieceSetup"[^>]*>[\s\S]*?</div>'
    match = re.search(pattern, index_content)
    
    is_wrapped = match is not None
    
    results.append({
        'test': 'Test 5: Button Wrapped in Control Group',
        'passed': is_wrapped,
        'message': 'Button correctly wrapped in menu-control-group div' if is_wrapped else 'Button not wrapped in menu-control-group'
    })
    
    return is_wrapped

# Test 6: Button text element preserved
def test_button_text():
    pattern = r'<button[^>]*id="btnPieceSetup"[^>]*>([\s\S]*?)</button>'
    match = re.search(pattern, index_content)
    
    if not match:
        results.append({
            'test': 'Test 6: Button Text Preserved',
            'passed': False,
            'message': 'Piece setup button not found'
        })
        return False
    
    button_content = match.group(1)
    has_icon = '♔' in button_content
    has_text_span = '<span id="btnPieceSetupText">' in button_content
    
    results.append({
        'test': 'Test 6: Button Text Preserved',
        'passed': has_icon and has_text_span,
        'message': 'Button icon (♔) and text span preserved' if (has_icon and has_text_span) else 'Button content missing icon or text span'
    })
    
    return has_icon and has_text_span

# Run all tests
test1 = test_button_in_settings_menu()
test2 = test_button_not_in_old_location()
test3 = test_event_handler_preserved()
test4 = test_button_classes()
test5 = test_button_wrapping()
test6 = test_button_text()

all_tests_passed = test1 and test2 and test3 and test4 and test5 and test6

# Print results
print('═══════════════════════════════════════════════════════════\n')
for result in results:
    icon = '✓' if result['passed'] else '✗'
    color = '\033[32m' if result['passed'] else '\033[31m'
    reset = '\033[0m'
    
    print(f"{color}{icon} {result['test']}{reset}")
    print(f"  {result['message']}\n")

print('═══════════════════════════════════════════════════════════\n')

if all_tests_passed:
    print('\033[32m✓ All tests passed! Piece setup integration successful.\033[0m\n')
    sys.exit(0)
else:
    print('\033[31m✗ Some tests failed. Please review the results above.\033[0m\n')
    sys.exit(1)
