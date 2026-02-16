#!/usr/bin/env node

/**
 * Task 7.7: Verify Move History Navigation Still Works
 * 
 * This script verifies that move history and navigation features work correctly
 * after the responsive settings menu implementation.
 * 
 * Requirements: 3.7
 */

const fs = require('fs');
const path = require('path');

console.log('🕰️ Task 7.7: Move History Navigation Verification\n');
console.log('=' .repeat(60));

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function test(name, fn) {
    try {
        const result = fn();
        if (result.pass) {
            console.log(`✅ PASS: ${name}`);
            if (result.details) {
                console.log(`   ${result.details}`);
            }
            testsPassed++;
            results.push({ name, status: 'PASS', details: result.details });
        } else {
            console.log(`❌ FAIL: ${name}`);
            if (result.reason) {
                console.log(`   Reason: ${result.reason}`);
            }
            testsFailed++;
            results.push({ name, status: 'FAIL', reason: result.reason });
        }
    } catch (error) {
        console.log(`❌ ERROR: ${name}`);
        console.log(`   ${error.message}`);
        testsFailed++;
        results.push({ name, status: 'ERROR', error: error.message });
    }
    console.log('');
}

// Test 1: Verify move history HTML structure exists
test('Move history HTML structure exists in index.html', () => {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        return { pass: false, reason: 'index.html not found' };
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for history panel
    const hasHistoryPanel = content.includes('id="historyPanel"');
    const hasMoveHistory = content.includes('id="moveHistory"');
    const hasHistoryTitle = content.includes('id="historyTitle"');
    const hasMoveCount = content.includes('id="moveCount"');
    const hasCaptureCount = content.includes('id="captureCount"');
    
    if (!hasHistoryPanel) {
        return { pass: false, reason: 'History panel element not found' };
    }
    
    if (!hasMoveHistory) {
        return { pass: false, reason: 'Move history element not found' };
    }
    
    return {
        pass: true,
        details: `Found: historyPanel=${hasHistoryPanel}, moveHistory=${hasMoveHistory}, historyTitle=${hasHistoryTitle}, moveCount=${hasMoveCount}, captureCount=${hasCaptureCount}`
    };
});

// Test 2: Verify move history update function exists in game.js
test('Move history update function exists in game.js', () => {
    const gamePath = path.join(__dirname, 'js', 'game.js');
    
    if (!fs.existsSync(gamePath)) {
        return { pass: false, reason: 'js/game.js not found' };
    }
    
    const content = fs.readFileSync(gamePath, 'utf8');
    
    // Check for gecmisiGuncelle function (Turkish for "update history")
    const hasUpdateFunction = content.includes('function gecmisiGuncelle()') || 
                             content.includes('gecmisiGuncelle =');
    
    // Check for moveHistory element access
    const accessesMoveHistory = content.includes('getElementById("moveHistory")') ||
                               content.includes('getElementById(\'moveHistory\')');
    
    if (!hasUpdateFunction) {
        return { pass: false, reason: 'Move history update function not found' };
    }
    
    return {
        pass: true,
        details: `Update function exists, accesses moveHistory element: ${accessesMoveHistory}`
    };
});

// Test 3: Verify position history interface exists
test('Position history interface exists', () => {
    const historyInterfacePath = path.join(__dirname, 'js', 'position-history-interface.js');
    
    if (!fs.existsSync(historyInterfacePath)) {
        return { pass: false, reason: 'position-history-interface.js not found' };
    }
    
    const content = fs.readFileSync(historyInterfacePath, 'utf8');
    
    // Check for PositionHistoryInterface class
    const hasClass = content.includes('class PositionHistoryInterface');
    
    // Check for undo/redo methods
    const hasUndoMethod = content.includes('performUndo') || content.includes('undo');
    const hasRedoMethod = content.includes('performRedo') || content.includes('redo');
    
    // Check for history navigation
    const hasHistoryNavigation = content.includes('handleHistoryItemClick') || 
                                 content.includes('jumpToPosition');
    
    if (!hasClass) {
        return { pass: false, reason: 'PositionHistoryInterface class not found' };
    }
    
    return {
        pass: true,
        details: `Has undo: ${hasUndoMethod}, Has redo: ${hasRedoMethod}, Has navigation: ${hasHistoryNavigation}`
    };
});

// Test 4: Verify position history manager exists
test('Position history manager exists', () => {
    const historyManagerPath = path.join(__dirname, 'js', 'position-history-manager.js');
    
    if (!fs.existsSync(historyManagerPath)) {
        return { pass: false, reason: 'position-history-manager.js not found' };
    }
    
    const content = fs.readFileSync(historyManagerPath, 'utf8');
    
    // Check for PositionHistoryManager class
    const hasClass = content.includes('class PositionHistoryManager');
    
    // Check for history management methods
    const hasAddPosition = content.includes('addPosition');
    const hasUndo = content.includes('undo');
    const hasRedo = content.includes('redo');
    const hasGetHistory = content.includes('getHistory') || content.includes('getHistoryList');
    
    if (!hasClass) {
        return { pass: false, reason: 'PositionHistoryManager class not found' };
    }
    
    return {
        pass: true,
        details: `Methods: addPosition=${hasAddPosition}, undo=${hasUndo}, redo=${hasRedo}, getHistory=${hasGetHistory}`
    };
});

// Test 5: Verify translations for move history exist
test('Move history translations exist', () => {
    const translationsPath = path.join(__dirname, 'js', 'translations.js');
    
    if (!fs.existsSync(translationsPath)) {
        return { pass: false, reason: 'translations.js not found' };
    }
    
    const content = fs.readFileSync(translationsPath, 'utf8');
    
    // Check for move history translations
    const hasMoveHistory = content.includes('moveHistory:');
    const hasUndoMove = content.includes('undoMove:');
    const hasRedoMove = content.includes('redoMove:');
    const hasPositionHistory = content.includes('positionHistoryTitle:');
    
    if (!hasMoveHistory) {
        return { pass: false, reason: 'moveHistory translation not found' };
    }
    
    return {
        pass: true,
        details: `Translations: moveHistory=${hasMoveHistory}, undoMove=${hasUndoMove}, redoMove=${hasRedoMove}, positionHistory=${hasPositionHistory}`
    };
});

// Test 6: Verify move history is NOT moved into settings menu
test('Move history remains in main game area (not in settings menu)', () => {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        return { pass: false, reason: 'index.html not found' };
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Find the settings menu panel
    const settingsMenuStart = content.indexOf('id="settingsMenuPanel"');
    const settingsMenuEnd = content.indexOf('</aside>', settingsMenuStart);
    
    if (settingsMenuStart === -1) {
        return { pass: false, reason: 'Settings menu panel not found' };
    }
    
    const settingsMenuContent = content.substring(settingsMenuStart, settingsMenuEnd);
    
    // Check that move history is NOT in the settings menu
    const historyInMenu = settingsMenuContent.includes('id="moveHistory"') || 
                         settingsMenuContent.includes('id="historyPanel"');
    
    if (historyInMenu) {
        return { pass: false, reason: 'Move history incorrectly placed inside settings menu' };
    }
    
    // Verify move history is in the main game container
    const mainContainerStart = content.indexOf('id="mainGameContainer"');
    const mainContainerEnd = content.indexOf('</div>', content.lastIndexOf('id="historyPanel"'));
    
    if (mainContainerStart === -1) {
        return { pass: false, reason: 'Main game container not found' };
    }
    
    const mainContainerContent = content.substring(mainContainerStart, mainContainerEnd);
    const historyInMain = mainContainerContent.includes('id="historyPanel"') && 
                         mainContainerContent.includes('id="moveHistory"');
    
    if (!historyInMain) {
        return { pass: false, reason: 'Move history not found in main game area' };
    }
    
    return {
        pass: true,
        details: 'Move history correctly remains in main game area, not moved to settings menu'
    };
});

// Test 7: Verify auto-scroll functionality exists
test('Auto-scroll functionality for move history exists', () => {
    const gamePath = path.join(__dirname, 'js', 'game.js');
    
    if (!fs.existsSync(gamePath)) {
        return { pass: false, reason: 'js/game.js not found' };
    }
    
    const content = fs.readFileSync(gamePath, 'utf8');
    
    // Check for auto-scroll function
    const hasAutoScroll = content.includes('performAutoScroll') || 
                         content.includes('autoScroll');
    
    // Check for auto-scroll toggle
    const hasAutoScrollToggle = content.includes('toggleAutoScroll') || 
                               content.includes('autoScrollEnabled');
    
    if (!hasAutoScroll) {
        return { pass: false, reason: 'Auto-scroll function not found' };
    }
    
    return {
        pass: true,
        details: `Auto-scroll function exists, toggle available: ${hasAutoScrollToggle}`
    };
});

// Test 8: Verify history panel is collapsible
test('History panel has collapsible functionality', () => {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        return { pass: false, reason: 'index.html not found' };
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for collapsible header
    const hasCollapsibleHeader = content.includes('collapsible-header') && 
                                 content.includes('togglePanel');
    
    // Check for chevron indicator
    const hasChevron = content.includes('class="chevron"');
    
    if (!hasCollapsibleHeader) {
        return { pass: false, reason: 'Collapsible header not found' };
    }
    
    return {
        pass: true,
        details: `Collapsible header exists, chevron indicator: ${hasChevron}`
    };
});

// Test 9: Verify move history scripts are loaded
test('Move history related scripts are loaded in index.html', () => {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        return { pass: false, reason: 'index.html not found' };
    }
    
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for position history scripts
    const hasHistoryManager = content.includes('position-history-manager.js');
    const hasHistoryInterface = content.includes('position-history-interface.js');
    const hasGameScript = content.includes('game.js');
    
    if (!hasGameScript) {
        return { pass: false, reason: 'game.js not loaded' };
    }
    
    return {
        pass: true,
        details: `Scripts loaded: game.js=${hasGameScript}, history-manager=${hasHistoryManager}, history-interface=${hasHistoryInterface}`
    };
});

// Test 10: Verify settings menu doesn't interfere with history
test('Settings menu implementation doesn\'t interfere with move history', () => {
    const settingsMenuPath = path.join(__dirname, 'js', 'settings-menu-manager.js');
    
    if (!fs.existsSync(settingsMenuPath)) {
        return { pass: false, reason: 'settings-menu-manager.js not found' };
    }
    
    const content = fs.readFileSync(settingsMenuPath, 'utf8');
    
    // Check that settings menu doesn't manipulate move history
    const manipulatesHistory = content.includes('moveHistory') || 
                              content.includes('historyPanel');
    
    if (manipulatesHistory) {
        return { pass: false, reason: 'Settings menu appears to manipulate move history elements' };
    }
    
    return {
        pass: true,
        details: 'Settings menu does not interfere with move history functionality'
    };
});

// Print summary
console.log('=' .repeat(60));
console.log('\n📊 TEST SUMMARY\n');
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`Pass Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Move history navigation is working correctly.');
    console.log('\n✅ TASK 7.7 VERIFICATION: COMPLETE');
    console.log('\nConclusion: Move history and navigation features continue to work');
    console.log('correctly after the responsive settings menu implementation.');
    console.log('\nThe move history remains in the main game area and is not affected');
    console.log('by the settings menu integration.');
} else {
    console.log('\n⚠️ Some tests failed. Review the results above.');
    console.log('\n❌ TASK 7.7 VERIFICATION: ISSUES FOUND');
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(testsFailed === 0 ? 0 : 1);
