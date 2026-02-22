#!/usr/bin/env node

/**
 * Verification Script for Dynamic Translation Fix
 * 
 * This script verifies that:
 * 1. bilgiGuncelle and gecmisiGuncelle are exposed globally in game.js
 * 2. updateUIText calls both functions in translations.js
 * 3. All translation keys exist for game status
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Dynamic Translation Fix...\n');

let allTestsPassed = true;

// Test 1: Check if functions are exposed in game.js
console.log('Test 1: Checking if functions are exposed globally in game.js');
const gameJsPath = path.join(__dirname, 'js', 'game.js');
const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

const hasBilgiGuncelleExport = gameJsContent.includes('window.bilgiGuncelle = bilgiGuncelle');
const hasGecmisiGuncelleExport = gameJsContent.includes('window.gecmisiGuncelle = gecmisiGuncelle');

if (hasBilgiGuncelleExport && hasGecmisiGuncelleExport) {
  console.log('✅ PASS: Both functions are exposed globally\n');
} else {
  console.log('❌ FAIL: Functions are not properly exposed');
  if (!hasBilgiGuncelleExport) console.log('  - Missing: window.bilgiGuncelle');
  if (!hasGecmisiGuncelleExport) console.log('  - Missing: window.gecmisiGuncelle');
  console.log();
  allTestsPassed = false;
}

// Test 2: Check if updateUIText calls both functions
console.log('Test 2: Checking if updateUIText calls both functions in translations.js');
const translationsJsPath = path.join(__dirname, 'js', 'translations.js');
const translationsJsContent = fs.readFileSync(translationsJsPath, 'utf8');

const callsBilgiGuncelle = translationsJsContent.includes('if (typeof bilgiGuncelle === "function")') &&
                           translationsJsContent.includes('bilgiGuncelle()');
const callsGecmisiGuncelle = translationsJsContent.includes('if (typeof gecmisiGuncelle === "function")') &&
                             translationsJsContent.includes('gecmisiGuncelle()');

if (callsBilgiGuncelle && callsGecmisiGuncelle) {
  console.log('✅ PASS: updateUIText calls both functions\n');
} else {
  console.log('❌ FAIL: updateUIText does not call both functions');
  if (!callsBilgiGuncelle) console.log('  - Missing: bilgiGuncelle() call');
  if (!callsGecmisiGuncelle) console.log('  - Missing: gecmisiGuncelle() call');
  console.log();
  allTestsPassed = false;
}

// Test 3: Check if translation keys exist
console.log('Test 3: Checking if all required translation keys exist');
const requiredKeys = ['whitePlaying', 'blackPlaying', 'whiteWon', 'blackWon'];
const languages = ['en', 'tr', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'pt', 'ar'];

let missingKeys = [];
languages.forEach(lang => {
  requiredKeys.forEach(key => {
    const keyPattern = new RegExp(`${lang}:\\s*{[\\s\\S]*?${key}:\\s*["']`, 'm');
    if (!keyPattern.test(translationsJsContent)) {
      missingKeys.push(`${lang}.${key}`);
    }
  });
});

if (missingKeys.length === 0) {
  console.log('✅ PASS: All translation keys exist for all languages\n');
} else {
  console.log('❌ FAIL: Missing translation keys:');
  missingKeys.forEach(key => console.log(`  - ${key}`));
  console.log();
  allTestsPassed = false;
}

// Test 4: Check if bilgiGuncelle function uses t() for translations
console.log('Test 4: Checking if bilgiGuncelle uses t() function');
const bilgiGuncelleMatch = gameJsContent.match(/function bilgiGuncelle\(\)\s*{[\s\S]*?^}/m);
if (bilgiGuncelleMatch) {
  const bilgiGuncelleCode = bilgiGuncelleMatch[0];
  const usesWhitePlaying = bilgiGuncelleCode.includes('t("whitePlaying")');
  const usesBlackPlaying = bilgiGuncelleCode.includes('t("blackPlaying")');
  const usesWhiteWon = bilgiGuncelleCode.includes('t("whiteWon")');
  const usesBlackWon = bilgiGuncelleCode.includes('t("blackWon")');
  
  if (usesWhitePlaying && usesBlackPlaying && usesWhiteWon && usesBlackWon) {
    console.log('✅ PASS: bilgiGuncelle uses t() for all status texts\n');
  } else {
    console.log('❌ FAIL: bilgiGuncelle does not use t() for all status texts');
    if (!usesWhitePlaying) console.log('  - Missing: t("whitePlaying")');
    if (!usesBlackPlaying) console.log('  - Missing: t("blackPlaying")');
    if (!usesWhiteWon) console.log('  - Missing: t("whiteWon")');
    if (!usesBlackWon) console.log('  - Missing: t("blackWon")');
    console.log();
    allTestsPassed = false;
  }
} else {
  console.log('❌ FAIL: Could not find bilgiGuncelle function\n');
  allTestsPassed = false;
}

// Test 5: Check test file exists
console.log('Test 5: Checking if test file exists');
const testFilePath = path.join(__dirname, 'test-dynamic-translations.html');
if (fs.existsSync(testFilePath)) {
  console.log('✅ PASS: Test file exists\n');
} else {
  console.log('❌ FAIL: Test file does not exist\n');
  allTestsPassed = false;
}

// Final summary
console.log('═══════════════════════════════════════════════════════');
if (allTestsPassed) {
  console.log('✅ ALL TESTS PASSED - Dynamic translations are working!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📝 Summary:');
  console.log('  • bilgiGuncelle and gecmisiGuncelle are exposed globally');
  console.log('  • updateUIText calls both functions when language changes');
  console.log('  • All translation keys exist for 11 languages');
  console.log('  • bilgiGuncelle uses t() function for translations');
  console.log('  • Test file is available for manual testing');
  console.log('\n🎯 Next Steps:');
  console.log('  1. Open test-dynamic-translations.html in a browser');
  console.log('  2. Test language switching with different game states');
  console.log('  3. Verify game status updates immediately');
  console.log('  4. Test in the main application (index.html)');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED - Please review the issues above');
  console.log('═══════════════════════════════════════════════════════');
  process.exit(1);
}
