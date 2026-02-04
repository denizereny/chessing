#!/usr/bin/env node

/**
 * Theme System Validation Script
 * 
 * This script validates that the theme system is properly implemented
 * across both the main game and piece setup pages.
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Validating Theme System...\n');

// Files to check
const filesToCheck = [
    'index.html',
    'piece-setup-working.html',
    'js/game.js',
    'css/style.css'
];

let allTestsPassed = true;

// Test 1: Check if theme toggle buttons exist
console.log('1. Checking theme toggle buttons...');
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const pieceSetupHtml = fs.readFileSync('piece-setup-working.html', 'utf8');
    
    if (indexHtml.includes('onclick="toggleTheme()"') && indexHtml.includes('id="btnTheme"')) {
        console.log('   ✅ Main game theme button found');
    } else {
        console.log('   ❌ Main game theme button missing');
        allTestsPassed = false;
    }
    
    if (pieceSetupHtml.includes('onclick="toggleTheme()"') && pieceSetupHtml.includes('id="themeToggle"')) {
        console.log('   ✅ Piece setup theme button found');
    } else {
        console.log('   ❌ Piece setup theme button missing');
        allTestsPassed = false;
    }
} catch (error) {
    console.log('   ❌ Error reading HTML files:', error.message);
    allTestsPassed = false;
}

// Test 2: Check if theme functions exist
console.log('\n2. Checking theme functions...');
try {
    const gameJs = fs.readFileSync('js/game.js', 'utf8');
    const pieceSetupHtml = fs.readFileSync('piece-setup-working.html', 'utf8');
    
    const requiredFunctions = [
        'function toggleTheme()',
        'function applyTheme(',
        'function saveTheme(',
        'function initThemeSystem(',
        'function updateThemeButton('
    ];
    
    let mainGameFunctions = 0;
    let pieceSetupFunctions = 0;
    
    requiredFunctions.forEach(func => {
        if (gameJs.includes(func)) {
            mainGameFunctions++;
        }
        if (pieceSetupHtml.includes(func)) {
            pieceSetupFunctions++;
        }
    });
    
    if (mainGameFunctions === requiredFunctions.length) {
        console.log('   ✅ All theme functions found in main game');
    } else {
        console.log(`   ❌ Missing theme functions in main game (${mainGameFunctions}/${requiredFunctions.length})`);
        allTestsPassed = false;
    }
    
    if (pieceSetupFunctions === requiredFunctions.length) {
        console.log('   ✅ All theme functions found in piece setup');
    } else {
        console.log(`   ❌ Missing theme functions in piece setup (${pieceSetupFunctions}/${requiredFunctions.length})`);
        allTestsPassed = false;
    }
} catch (error) {
    console.log('   ❌ Error reading JavaScript files:', error.message);
    allTestsPassed = false;
}

// Test 3: Check CSS theme variables
console.log('\n3. Checking CSS theme variables...');
try {
    const styleCss = fs.readFileSync('css/style.css', 'utf8');
    
    const requiredVariables = [
        '--bg-main:',
        '--bg-card:',
        '--text-primary:',
        '--text-secondary:',
        '--accent-gold:',
        '[data-theme="dark"]'
    ];
    
    let foundVariables = 0;
    requiredVariables.forEach(variable => {
        if (styleCss.includes(variable)) {
            foundVariables++;
        }
    });
    
    if (foundVariables === requiredVariables.length) {
        console.log('   ✅ All CSS theme variables found');
    } else {
        console.log(`   ❌ Missing CSS theme variables (${foundVariables}/${requiredVariables.length})`);
        allTestsPassed = false;
    }
} catch (error) {
    console.log('   ❌ Error reading CSS file:', error.message);
    allTestsPassed = false;
}

// Test 4: Check theme initialization
console.log('\n4. Checking theme initialization...');
try {
    const gameJs = fs.readFileSync('js/game.js', 'utf8');
    const pieceSetupHtml = fs.readFileSync('piece-setup-working.html', 'utf8');
    
    if (gameJs.includes('DOMContentLoaded') && gameJs.includes('initThemeSystem')) {
        console.log('   ✅ Main game theme initialization found');
    } else {
        console.log('   ❌ Main game theme initialization missing');
        allTestsPassed = false;
    }
    
    if (pieceSetupHtml.includes('DOMContentLoaded') && pieceSetupHtml.includes('initThemeSystem')) {
        console.log('   ✅ Piece setup theme initialization found');
    } else {
        console.log('   ❌ Piece setup theme initialization missing');
        allTestsPassed = false;
    }
} catch (error) {
    console.log('   ❌ Error checking initialization:', error.message);
    allTestsPassed = false;
}

// Test 5: Check storage synchronization
console.log('\n5. Checking storage synchronization...');
try {
    const gameJs = fs.readFileSync('js/game.js', 'utf8');
    const pieceSetupHtml = fs.readFileSync('piece-setup-working.html', 'utf8');
    
    if (gameJs.includes('4x5-chess-theme') && gameJs.includes('localStorage')) {
        console.log('   ✅ Main game storage integration found');
    } else {
        console.log('   ❌ Main game storage integration missing');
        allTestsPassed = false;
    }
    
    if (pieceSetupHtml.includes('4x5-chess-theme') && pieceSetupHtml.includes('localStorage')) {
        console.log('   ✅ Piece setup storage integration found');
    } else {
        console.log('   ❌ Piece setup storage integration missing');
        allTestsPassed = false;
    }
    
    if (gameJs.includes('window.addEventListener') && gameJs.includes('storage')) {
        console.log('   ✅ Main game storage listener found');
    } else {
        console.log('   ❌ Main game storage listener missing');
        allTestsPassed = false;
    }
    
    if (pieceSetupHtml.includes('window.addEventListener') && pieceSetupHtml.includes('storage')) {
        console.log('   ✅ Piece setup storage listener found');
    } else {
        console.log('   ❌ Piece setup storage listener missing');
        allTestsPassed = false;
    }
} catch (error) {
    console.log('   ❌ Error checking storage synchronization:', error.message);
    allTestsPassed = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
    console.log('🎉 All theme system tests PASSED!');
    console.log('\nThe theme system should now work correctly:');
    console.log('• Theme toggle buttons work on both pages');
    console.log('• Themes synchronize between pages');
    console.log('• System preference detection works');
    console.log('• Theme persistence works');
    console.log('\nTo test manually:');
    console.log('1. Open test-complete-theme-system.html');
    console.log('2. Click the theme toggle buttons');
    console.log('3. Open both main game and piece setup');
    console.log('4. Verify themes sync between pages');
} else {
    console.log('❌ Some theme system tests FAILED!');
    console.log('\nPlease check the issues above and fix them.');
}
console.log('='.repeat(50));

process.exit(allTestsPassed ? 0 : 1);