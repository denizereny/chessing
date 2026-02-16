/**
 * Color Contrast Audit Tool
 * 
 * This script audits all color combinations in the responsive settings menu
 * to ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text).
 * 
 * Task: 10.1 Audit color contrast ratios
 * Requirement: 6.6
 */

// WCAG 2.1 Contrast Calculation Functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAG_AA(ratio, isLargeText = false) {
  const threshold = isLargeText ? 3.0 : 4.5;
  return ratio >= threshold;
}

// Color Definitions from CSS Files
const colorPalette = {
  light: {
    // Primary colors
    primary: '#4a90e2',
    primaryHover: '#4338ca',
    accentGold: '#d4af37',
    accentBlue: '#5c85d6',
    accentRed: '#d65c5c',
    
    // Background colors
    bgMain: '#f8fafc',
    bgCard: '#ffffff',
    bgPanel: '#f1f5f9',
    bgSecondary: '#f8fafc',
    bgTertiary: '#f1f5f9',
    
    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    textInverse: '#ffffff',
    
    // Border colors
    borderPrimary: '#e2e8f0',
    borderSecondary: '#cbd5e1',
    
    // Enhanced colors
    enhancedPrimary: '#4f46e5',
    enhancedSuccess: '#10b981',
    enhancedWarning: '#f59e0b',
    enhancedError: '#ef4444',
    enhancedInfo: '#3b82f6'
  },
  dark: {
    // Primary colors
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    accentGold: '#fbbf24',
    accentBlue: '#60a5fa',
    accentRed: '#f87171',
    
    // Background colors
    bgMain: '#0f172a',
    bgCard: '#1e293b',
    bgPanel: '#334155',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    
    // Text colors
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#0f172a',
    
    // Border colors
    borderPrimary: '#334155',
    borderSecondary: '#475569',
    
    // Enhanced colors
    enhancedPrimary: '#6366f1',
    enhancedSuccess: '#10b981',
    enhancedWarning: '#f59e0b',
    enhancedError: '#ef4444',
    enhancedInfo: '#3b82f6'
  }
};

// Settings Menu Color Combinations to Audit
const colorCombinations = [
  // Settings Menu Toggle Button
  { name: 'Toggle Button', fg: 'white', bg: 'primary', element: 'Button', size: 'normal' },
  { name: 'Toggle Button Hover', fg: 'white', bg: 'primaryHover', element: 'Button', size: 'normal' },
  
  // Menu Panel
  { name: 'Menu Panel Background', fg: 'textPrimary', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Menu Header', fg: 'textPrimary', bg: 'bgPanel', element: 'Text', size: 'normal' },
  { name: 'Menu Title', fg: 'accentGold', bg: 'bgPanel', element: 'Heading', size: 'large' },
  
  // Menu Controls
  { name: 'Control Label', fg: 'textPrimary', bg: 'bgCard', element: 'Label', size: 'normal' },
  { name: 'Control Secondary Text', fg: 'textSecondary', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Control Group Background', fg: 'textPrimary', bg: 'bgSecondary', element: 'Text', size: 'normal' },
  
  // Buttons
  { name: 'Primary Button', fg: 'white', bg: 'enhancedPrimary', element: 'Button', size: 'normal' },
  { name: 'Success Button', fg: 'white', bg: 'enhancedSuccess', element: 'Button', size: 'normal' },
  { name: 'Warning Button', fg: 'white', bg: 'enhancedWarning', element: 'Button', size: 'normal' },
  { name: 'Error Button', fg: 'white', bg: 'enhancedError', element: 'Button', size: 'normal' },
  { name: 'Info Button', fg: 'white', bg: 'enhancedInfo', element: 'Button', size: 'normal' },
  { name: 'Secondary Button', fg: 'textPrimary', bg: 'bgTertiary', element: 'Button', size: 'normal' },
  
  // Input Fields
  { name: 'Select Dropdown', fg: 'textPrimary', bg: 'bgCard', element: 'Input', size: 'normal' },
  { name: 'Select Dropdown Hover', fg: 'textPrimary', bg: 'bgPanel', element: 'Input', size: 'normal' },
  { name: 'Input Border Focus', fg: 'primary', bg: 'bgCard', element: 'Border', size: 'normal' },
  
  // Links and Interactive Elements
  { name: 'Link Text', fg: 'primary', bg: 'bgCard', element: 'Link', size: 'normal' },
  { name: 'Link Hover', fg: 'primaryHover', bg: 'bgCard', element: 'Link', size: 'normal' },
  { name: 'Accent Gold Text', fg: 'accentGold', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Accent Gold on Panel', fg: 'accentGold', bg: 'bgPanel', element: 'Text', size: 'normal' },
  
  // Status Indicators
  { name: 'Success Text', fg: 'enhancedSuccess', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Warning Text', fg: 'enhancedWarning', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Error Text', fg: 'enhancedError', bg: 'bgCard', element: 'Text', size: 'normal' },
  { name: 'Info Text', fg: 'enhancedInfo', bg: 'bgCard', element: 'Text', size: 'normal' },
  
  // Borders
  { name: 'Border on Card', fg: 'borderPrimary', bg: 'bgCard', element: 'Border', size: 'normal' },
  { name: 'Border on Panel', fg: 'borderSecondary', bg: 'bgPanel', element: 'Border', size: 'normal' }
];

// Perform Audit
function auditColors() {
  const results = {
    light: [],
    dark: [],
    summary: {
      light: { total: 0, passed: 0, failed: 0 },
      dark: { total: 0, passed: 0, failed: 0 }
    }
  };
  
  ['light', 'dark'].forEach(theme => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`AUDITING ${theme.toUpperCase()} THEME`);
    console.log('='.repeat(60));
    
    colorCombinations.forEach(combo => {
      const fgColor = combo.fg === 'white' ? '#ffffff' : colorPalette[theme][combo.fg];
      const bgColor = combo.bg === 'white' ? '#ffffff' : colorPalette[theme][combo.bg];
      
      if (!fgColor || !bgColor) {
        console.log(`⚠️  Skipping ${combo.name}: Color not found`);
        return;
      }
      
      const ratio = getContrastRatio(fgColor, bgColor);
      const isLargeText = combo.size === 'large';
      const passes = meetsWCAG_AA(ratio, isLargeText);
      const threshold = isLargeText ? '3:1' : '4.5:1';
      
      const result = {
        name: combo.name,
        element: combo.element,
        foreground: fgColor,
        background: bgColor,
        ratio: ratio.toFixed(2),
        threshold: threshold,
        passes: passes,
        isLargeText: isLargeText
      };
      
      results[theme].push(result);
      results.summary[theme].total++;
      
      if (passes) {
        results.summary[theme].passed++;
        console.log(`✅ ${combo.name}: ${ratio.toFixed(2)}:1 (${threshold} required) - PASS`);
      } else {
        results.summary[theme].failed++;
        console.log(`❌ ${combo.name}: ${ratio.toFixed(2)}:1 (${threshold} required) - FAIL`);
        console.log(`   FG: ${fgColor} on BG: ${bgColor}`);
      }
    });
  });
  
  return results;
}

// Generate Report
function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  ['light', 'dark'].forEach(theme => {
    const summary = results.summary[theme];
    const passRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    console.log(`\n${theme.toUpperCase()} THEME:`);
    console.log(`  Total Combinations: ${summary.total}`);
    console.log(`  Passed: ${summary.passed} (${passRate}%)`);
    console.log(`  Failed: ${summary.failed}`);
    
    if (summary.failed > 0) {
      console.log(`\n  Failed Combinations:`);
      results[theme].filter(r => !r.passes).forEach(r => {
        console.log(`    - ${r.name}: ${r.ratio}:1 (needs ${r.threshold})`);
      });
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  const allFailed = [...results.light, ...results.dark].filter(r => !r.passes);
  
  if (allFailed.length === 0) {
    console.log('\n✅ All color combinations meet WCAG AA standards!');
  } else {
    console.log('\nThe following adjustments are recommended:\n');
    
    const uniqueFailed = [...new Set(allFailed.map(r => r.name))];
    uniqueFailed.forEach(name => {
      const lightFail = results.light.find(r => r.name === name && !r.passes);
      const darkFail = results.dark.find(r => r.name === name && !r.passes);
      
      console.log(`${name}:`);
      if (lightFail) {
        console.log(`  Light theme: Increase contrast between ${lightFail.foreground} and ${lightFail.background}`);
      }
      if (darkFail) {
        console.log(`  Dark theme: Increase contrast between ${darkFail.foreground} and ${darkFail.background}`);
      }
      console.log('');
    });
  }
  
  return results;
}

// Run Audit
console.log('Starting Color Contrast Audit for Responsive Settings Menu...\n');
const auditResults = auditColors();
const finalResults = generateReport(auditResults);

// Export results for further processing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { auditResults: finalResults, getContrastRatio, meetsWCAG_AA };
}
