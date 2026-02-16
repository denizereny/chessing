#!/usr/bin/env node

/**
 * Node.js Test Runner for Feature Preservation Tests
 * 
 * Runs the feature preservation unit tests in a Node.js environment
 * using JSDOM to simulate the browser DOM.
 * 
 * Usage: node run-feature-preservation-tests.js
 */

const fs = require('fs');
const path = require('path');

// Simple JSDOM-like implementation for testing
class MockDOM {
  constructor() {
    this.elements = new Map();
    this.idCounter = 0;
  }

  createElement(tag) {
    const element = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      classList: {
        contains: (cls) => element.className.split(' ').includes(cls),
        add: (...classes) => {
          const current = element.className.split(' ').filter(c => c);
          classes.forEach(cls => {
            if (!current.includes(cls)) current.push(cls);
          });
          element.className = current.join(' ');
        },
        remove: (...classes) => {
          const current = element.className.split(' ').filter(c => c);
          element.className = current.filter(c => !classes.includes(c)).join(' ');
        }
      },
      attributes: new Map(),
      children: [],
      parentNode: null,
      textContent: '',
      innerHTML: '',
      style: {},
      tabIndex: 0,
      offsetParent: {},
      
      getAttribute(name) {
        return this.attributes.get(name) || null;
      },
      
      setAttribute(name, value) {
        this.attributes.set(name, value);
      },
      
      querySelector(selector) {
        // Simple selector implementation
        if (selector.startsWith('#')) {
          const id = selector.substring(1);
          return this.children.find(child => child.id === id) || null;
        }
        if (selector.startsWith('.')) {
          const cls = selector.substring(1);
          return this.children.find(child => child.classList.contains(cls)) || null;
        }
        return this.children.find(child => child.tagName === selector.toUpperCase()) || null;
      },
      
      querySelectorAll(selector) {
        // Simple selector implementation
        if (selector.startsWith('#')) {
          const id = selector.substring(1);
          return this.children.filter(child => child.id === id);
        }
        if (selector.startsWith('.')) {
          const cls = selector.substring(1);
          return this.children.filter(child => child.classList.contains(cls));
        }
        return this.children.filter(child => child.tagName === selector.toUpperCase());
      },
      
      appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
      },
      
      contains(other) {
        if (this === other) return true;
        return this.children.some(child => child.contains && child.contains(other));
      }
    };
    
    return element;
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      const id = selector.substring(1);
      return this.elements.get(id) || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    return [];
  }

  getElementById(id) {
    return this.elements.get(id) || null;
  }

  registerElement(id, element) {
    this.elements.set(id, element);
  }
}

// Create mock DOM
const mockDOM = new MockDOM();

// Create settings menu structure
const settingsMenuPanel = mockDOM.createElement('aside');
settingsMenuPanel.id = 'settingsMenuPanel';
settingsMenuPanel.setAttribute('aria-hidden', 'true');
mockDOM.registerElement('settingsMenuPanel', settingsMenuPanel);

const settingsMenuContent = mockDOM.createElement('div');
settingsMenuContent.className = 'settings-menu-content';
settingsMenuPanel.appendChild(settingsMenuContent);

// Theme button
const themeButton = mockDOM.createElement('button');
themeButton.id = 'btnTheme';
themeButton.className = 'extra-btn menu-control-btn';
themeButton.setAttribute('onclick', 'toggleTheme()');
const themeText = mockDOM.createElement('span');
themeText.id = 'btnThemeText';
themeText.textContent = 'Dark Mode';
themeButton.appendChild(themeText);
themeButton.textContent = '🌙 Dark Mode';
const themeGroup = mockDOM.createElement('div');
themeGroup.className = 'menu-control-group';
themeGroup.appendChild(themeButton);
settingsMenuContent.appendChild(themeGroup);
mockDOM.registerElement('btnTheme', themeButton);
mockDOM.registerElement('btnThemeText', themeText);

// Language selector
const languageSelect = mockDOM.createElement('select');
languageSelect.id = 'languageSelect';
languageSelect.className = 'menu-control-select';
languageSelect.setAttribute('onchange', 'setLanguage(this.value)');
languageSelect.value = 'en';

const languages = ['en', 'tr', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'pt', 'ar'];
languages.forEach(lang => {
  const option = mockDOM.createElement('option');
  option.value = lang;
  option.textContent = lang;
  languageSelect.appendChild(option);
});

const languageLabel = mockDOM.createElement('label');
languageLabel.setAttribute('for', 'languageSelect');
languageLabel.textContent = '🌐 Language';
mockDOM.registerElement('lblLanguage', languageLabel);

const languageGroup = mockDOM.createElement('div');
languageGroup.className = 'menu-control-group';
languageGroup.appendChild(languageLabel);
languageGroup.appendChild(languageSelect);
settingsMenuContent.appendChild(languageGroup);
mockDOM.registerElement('languageSelect', languageSelect);

// Piece setup button
const pieceSetupButton = mockDOM.createElement('button');
pieceSetupButton.id = 'btnPieceSetup';
pieceSetupButton.className = 'extra-btn menu-control-btn';
pieceSetupButton.setAttribute('onclick', 'openPieceSetup()');
const pieceSetupText = mockDOM.createElement('span');
pieceSetupText.id = 'btnPieceSetupText';
pieceSetupText.textContent = 'Piece Setup';
pieceSetupButton.appendChild(pieceSetupText);
pieceSetupButton.textContent = '♔ Piece Setup';
const pieceSetupGroup = mockDOM.createElement('div');
pieceSetupGroup.className = 'menu-control-group';
pieceSetupGroup.appendChild(pieceSetupButton);
settingsMenuContent.appendChild(pieceSetupGroup);
mockDOM.registerElement('btnPieceSetup', pieceSetupButton);
mockDOM.registerElement('btnPieceSetupText', pieceSetupText);

// Analyze button
const analyzeButton = mockDOM.createElement('button');
analyzeButton.id = 'btnAnalyzePosition';
analyzeButton.className = 'extra-btn menu-control-btn';
analyzeButton.setAttribute('onclick', 'analyzeCurrentPosition()');
const analyzeText = mockDOM.createElement('span');
analyzeText.id = 'btnAnalyzePositionText';
analyzeText.textContent = 'Analyze Position';
analyzeButton.appendChild(analyzeText);
analyzeButton.textContent = '🔍 Analyze Position';
const analyzeGroup = mockDOM.createElement('div');
analyzeGroup.className = 'menu-control-group';
analyzeGroup.appendChild(analyzeButton);
settingsMenuContent.appendChild(analyzeGroup);
mockDOM.registerElement('btnAnalyzePosition', analyzeButton);
mockDOM.registerElement('btnAnalyzePositionText', analyzeText);

// Share button
const shareButton = mockDOM.createElement('button');
shareButton.id = 'btnSharePosition';
shareButton.className = 'extra-btn menu-control-btn';
shareButton.setAttribute('onclick', 'shareCurrentPosition()');
const shareText = mockDOM.createElement('span');
shareText.id = 'btnSharePositionText';
shareText.textContent = 'Share Position';
shareButton.appendChild(shareText);
shareButton.textContent = '🔗 Share Position';
const shareGroup = mockDOM.createElement('div');
shareGroup.className = 'menu-control-group';
shareGroup.appendChild(shareButton);
settingsMenuContent.appendChild(shareGroup);
mockDOM.registerElement('btnSharePosition', shareButton);
mockDOM.registerElement('btnSharePositionText', shareText);

// Backdrop
const backdrop = mockDOM.createElement('div');
backdrop.id = 'settingsMenuBackdrop';
backdrop.setAttribute('aria-hidden', 'true');
mockDOM.registerElement('settingsMenuBackdrop', backdrop);

// Game container
const gameContainer = mockDOM.createElement('div');
gameContainer.id = 'mainGameContainer';
mockDOM.registerElement('mainGameContainer', gameContainer);

// Mock document and window
global.document = {
  querySelector: (selector) => mockDOM.querySelector(selector),
  querySelectorAll: (selector) => mockDOM.querySelectorAll(selector),
  getElementById: (id) => mockDOM.getElementById(id),
  createElement: (tag) => mockDOM.createElement(tag),
  body: mockDOM.createElement('body'),
  contains: (element) => true
};

global.window = {
  getComputedStyle: (element) => ({
    display: element.style.display || '',
    visibility: element.style.visibility || '',
    opacity: element.style.opacity || '1',
    pointerEvents: element.style.pointerEvents || 'auto'
  })
};

// Test framework
const testResults = {
  suites: [],
  total: 0,
  passed: 0,
  failed: 0
};

let currentSuite = null;

global.describe = function(name, fn) {
  currentSuite = {
    name: name,
    tests: []
  };
  testResults.suites.push(currentSuite);
  fn();
  currentSuite = null;
};

global.test = function(name, fn) {
  testResults.total++;
  try {
    fn();
    testResults.passed++;
    currentSuite.tests.push({
      name: name,
      passed: true
    });
  } catch (error) {
    testResults.failed++;
    currentSuite.tests.push({
      name: name,
      passed: false,
      error: error.message
    });
  }
};

global.expect = function(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${expected} but got ${value}`);
      }
    },
    toBeTruthy() {
      if (!value) {
        throw new Error(`Expected truthy value but got ${value}`);
      }
    },
    toBeGreaterThan(expected) {
      if (value <= expected) {
        throw new Error(`Expected ${value} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (value < expected) {
        throw new Error(`Expected ${value} to be greater than or equal to ${expected}`);
      }
    },
    toContain(expected) {
      if (Array.isArray(value)) {
        if (!value.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else if (typeof value === 'string') {
        if (!value.includes(expected)) {
          throw new Error(`Expected "${value}" to contain "${expected}"`);
        }
      } else {
        throw new Error(`toContain requires array or string`);
      }
    },
    not: {
      toBe(expected) {
        if (value === expected) {
          throw new Error(`Expected ${value} not to be ${expected}`);
        }
      },
      toBeNull() {
        if (value === null) {
          throw new Error(`Expected value not to be null`);
        }
      }
    },
    toMatch(regex) {
      if (!regex.test(value)) {
        throw new Error(`Expected "${value}" to match ${regex}`);
      }
    }
  };
};

// Load and run tests
console.log('🧪 Running Feature Preservation Tests\n');
console.log('Feature: responsive-settings-menu');
console.log('Task: 7.8 Write unit tests for feature preservation');
console.log('Validates: Requirements 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7\n');

try {
  // Load test file
  const testFile = path.join(__dirname, 'test', 'responsive-settings-menu-feature-preservation.test.js');
  const testCode = fs.readFileSync(testFile, 'utf8');
  
  // Remove console.log at the end
  const cleanedCode = testCode.replace(/console\.log\([^)]+\);?\s*$/, '');
  
  // Execute tests
  eval(cleanedCode);
  
  // Print results
  console.log('═'.repeat(60));
  console.log('TEST RESULTS');
  console.log('═'.repeat(60));
  
  testResults.suites.forEach(suite => {
    console.log(`\n📦 ${suite.name}`);
    console.log('─'.repeat(60));
    
    suite.tests.forEach(test => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${test.name}`);
      if (!test.passed) {
        console.log(`   Error: ${test.error}`);
      }
    });
  });
  
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Total:  ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ${testResults.failed > 0 ? '❌' : ''}`);
  console.log('═'.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
  
} catch (error) {
  console.error('❌ Error running tests:', error.message);
  console.error(error.stack);
  process.exit(1);
}
