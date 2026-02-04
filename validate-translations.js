// Translation System Validation Script
// This script validates the completeness and correctness of the translation system

// Load the translations (simulating browser environment)
if (typeof window === 'undefined') {
    global.window = {};
    global.document = {
        documentElement: { setAttribute: () => {}, getAttribute: () => 'ltr' },
        getElementById: () => null,
        addEventListener: () => {}
    };
    global.localStorage = {
        getItem: () => null,
        setItem: () => {}
    };
}

// Load translations
const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsFile = fs.readFileSync(path.join(__dirname, 'js/translations.js'), 'utf8');

// Extract translations object using regex (simple approach)
const translationsMatch = translationsFile.match(/const translations = ({[\s\S]*?});/);
if (!translationsMatch) {
    console.error('❌ Could not extract translations object');
    process.exit(1);
}

// Evaluate the translations object
const translationsCode = translationsMatch[1];
const translations = eval(`(${translationsCode})`);

// Test keys for validation
const testKeys = {
    basic: [
        'settings', 'newGame', 'switchSides', 'undo', 'moves', 'captured',
        'gameTitle', 'gameSubtitle', 'startGame', 'playAgain', 'language'
    ],
    enhanced: [
        'themeToggle', 'sharePosition', 'positionAnalysis', 'presetCategories',
        'generateShareCode', 'positionHistoryTitle', 'materialAnalysis',
        'pieceActivityAnalysis', 'kingSafetyAnalysis', 'centerControlAnalysis',
        'switchToLight', 'switchToDark', 'currentTheme', 'lightTheme', 'darkTheme'
    ],
    errors: [
        'errorOccurred', 'invalidOperation', 'operationTimeout', 'networkError',
        'storageError', 'validationError', 'unexpectedError'
    ],
    performance: [
        'loading', 'processing', 'analyzing', 'generating', 'validating',
        'saving', 'operationCancelled', 'operationCompleted', 'operationFailed'
    ],
    mobile: [
        'touchToSelect', 'doubleTapToPlace', 'pinchToZoom', 'swipeToNavigate',
        'hapticFeedback', 'touchOptimized', 'mobileLayout'
    ],
    accessibility: [
        'screenReaderAnnouncement', 'keyboardNavigation', 'accessibilityMode',
        'highContrast', 'largeText', 'reducedMotion'
    ],
    rtl: [
        'textDirection', 'alignStart', 'alignEnd'
    ]
};

// Get all test keys
const allTestKeys = Object.values(testKeys).flat();

// Available languages
const languages = Object.keys(translations);

console.log('🌍 Translation System Validation');
console.log('================================');
console.log(`Found ${languages.length} languages: ${languages.join(', ')}`);
console.log(`Testing ${allTestKeys.length} translation keys`);
console.log('');

// Validate each language
let totalErrors = 0;
let totalWarnings = 0;

languages.forEach(lang => {
    console.log(`🔍 Validating ${lang.toUpperCase()}:`);
    
    const missing = [];
    const empty = [];
    const sameAsKey = [];
    
    allTestKeys.forEach(key => {
        if (!translations[lang] || translations[lang][key] === undefined) {
            missing.push(key);
        } else if (translations[lang][key] === '') {
            empty.push(key);
        } else if (translations[lang][key] === key) {
            sameAsKey.push(key);
        }
    });
    
    // Check RTL support
    const hasRTLSupport = translations[lang] && 
                         translations[lang].textDirection && 
                         translations[lang].alignStart && 
                         translations[lang].alignEnd;
    
    // Report results
    if (missing.length === 0 && empty.length === 0) {
        console.log(`  ✅ All ${allTestKeys.length} translations complete`);
    } else {
        if (missing.length > 0) {
            console.log(`  ❌ Missing ${missing.length} translations: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
            totalErrors += missing.length;
        }
        if (empty.length > 0) {
            console.log(`  ⚠️  Empty ${empty.length} translations: ${empty.slice(0, 5).join(', ')}${empty.length > 5 ? '...' : ''}`);
            totalWarnings += empty.length;
        }
    }
    
    if (sameAsKey.length > 0) {
        console.log(`  ⚠️  ${sameAsKey.length} translations same as key (might be intentional): ${sameAsKey.slice(0, 3).join(', ')}${sameAsKey.length > 3 ? '...' : ''}`);
        totalWarnings += sameAsKey.length;
    }
    
    if (!hasRTLSupport) {
        console.log(`  ⚠️  Missing RTL support properties`);
        totalWarnings += 1;
    } else if (lang === 'ar' && translations[lang].textDirection === 'rtl') {
        console.log(`  ✅ RTL support correctly configured`);
    }
    
    console.log('');
});

// Test specific features
console.log('🧪 Feature-specific Tests:');
console.log('==========================');

// Test RTL languages
const rtlLanguages = languages.filter(lang => 
    translations[lang] && translations[lang].textDirection === 'rtl'
);
console.log(`RTL Languages: ${rtlLanguages.length > 0 ? rtlLanguages.join(', ') : 'None'}`);

// Test theme translations
const themeKeys = ['themeToggle', 'switchToLight', 'switchToDark', 'lightTheme', 'darkTheme'];
const languagesWithThemeSupport = languages.filter(lang => 
    themeKeys.every(key => translations[lang] && translations[lang][key])
);
console.log(`Languages with complete theme support: ${languagesWithThemeSupport.length}/${languages.length}`);

// Test sharing system translations
const sharingKeys = ['sharePosition', 'generateShareCode', 'copyShareCode', 'shareViaURL', 'shareViaQR'];
const languagesWithSharingSupport = languages.filter(lang => 
    sharingKeys.every(key => translations[lang] && translations[lang][key])
);
console.log(`Languages with complete sharing support: ${languagesWithSharingSupport.length}/${languages.length}`);

// Test mobile optimization translations
const mobileKeys = ['touchToSelect', 'doubleTapToPlace', 'hapticFeedback', 'mobileLayout'];
const languagesWithMobileSupport = languages.filter(lang => 
    mobileKeys.every(key => translations[lang] && translations[lang][key])
);
console.log(`Languages with complete mobile support: ${languagesWithMobileSupport.length}/${languages.length}`);

console.log('');

// Summary
console.log('📊 Validation Summary:');
console.log('======================');
console.log(`Total Languages: ${languages.length}`);
console.log(`Total Test Keys: ${allTestKeys.length}`);
console.log(`Total Errors: ${totalErrors}`);
console.log(`Total Warnings: ${totalWarnings}`);

if (totalErrors === 0) {
    console.log('✅ All critical translations are present!');
} else {
    console.log('❌ Some translations are missing and need to be added.');
}

if (totalWarnings === 0) {
    console.log('✅ No warnings found!');
} else {
    console.log(`⚠️  ${totalWarnings} warnings found (mostly non-critical).`);
}

// Test translation function simulation
console.log('');
console.log('🔧 Function Tests:');
console.log('==================');

// Simulate the t() function
function t(key, lang = 'en') {
    return translations[lang][key] || translations['en'][key] || key;
}

// Test some translations
const testCases = [
    { key: 'themeToggle', lang: 'tr', expected: 'Tema Değiştir' },
    { key: 'sharePosition', lang: 'es', expected: 'Compartir Posición' },
    { key: 'positionAnalysis', lang: 'fr', expected: 'Analyse de Position' },
    { key: 'loading', lang: 'de', expected: 'Lädt...' },
    { key: 'textDirection', lang: 'ar', expected: 'rtl' }
];

testCases.forEach(({ key, lang, expected }) => {
    const actual = t(key, lang);
    if (actual === expected) {
        console.log(`✅ t('${key}', '${lang}') = '${actual}'`);
    } else {
        console.log(`❌ t('${key}', '${lang}') = '${actual}' (expected: '${expected}')`);
    }
});

console.log('');
console.log('🎉 Translation validation complete!');

// Exit with appropriate code
process.exit(totalErrors > 0 ? 1 : 0);