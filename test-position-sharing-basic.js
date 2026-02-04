/**
 * Basic Position Sharing System Test
 * 
 * Simple test to verify the Position Sharing System works correctly
 * without requiring a full browser environment.
 */

// Mock browser APIs for testing
global.window = {
  location: {
    origin: 'https://example.com',
    pathname: '/chess',
    search: ''
  }
};

global.navigator = {
  clipboard: {
    writeText: async (text) => {
      console.log('📋 Clipboard write:', text);
      return Promise.resolve();
    }
  }
};

global.document = {
  createElement: (tag) => ({
    style: {},
    value: '',
    focus: () => {},
    select: () => {},
    remove: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  execCommand: () => true
};

global.URLSearchParams = class {
  constructor(search) {
    this.params = {};
  }
  get(key) {
    return this.params[key] || null;
  }
};

// Load the Position Sharing System
const fs = require('fs');
const path = require('path');

// Read and execute the source code
const sharingSystemCode = fs.readFileSync(path.join(__dirname, 'js/position-sharing-system.js'), 'utf8');
eval(sharingSystemCode);

// Test positions
const testPositions = {
  starting: [
    ["r", "q", "k", "r"],
    ["p", "p", "p", "p"],
    [null, null, null, null],
    ["P", "P", "P", "P"],
    ["R", "Q", "K", "R"]
  ],
  
  empty: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ],
  
  kingsOnly: [
    [null, null, "k", null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, "K", null]
  ]
};

// Run basic tests
console.log('🧪 Starting Position Sharing System Basic Tests...\n');

const sharingSystem = new PositionSharingSystem();
let testsPassed = 0;
let testsTotal = 0;

function runTest(name, testFn) {
  testsTotal++;
  try {
    testFn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
  }
}

// Test 1: Basic encoding
runTest('Basic Encoding', () => {
  const code = sharingSystem.encodePosition(testPositions.starting);
  if (typeof code !== 'string' || code.length === 0) {
    throw new Error('Should return non-empty string');
  }
  if (code.length > 12) {
    throw new Error(`Code too long: ${code.length} characters`);
  }
  console.log(`   Code: "${code}" (${code.length} chars)`);
});

// Test 2: Basic decoding
runTest('Basic Decoding', () => {
  const code = sharingSystem.encodePosition(testPositions.starting);
  const decoded = sharingSystem.decodePosition(code);
  if (!Array.isArray(decoded) || decoded.length !== 5) {
    throw new Error('Should return 5x4 array');
  }
});

// Test 3: Round-trip encoding
runTest('Round-trip Encoding', () => {
  for (const [name, position] of Object.entries(testPositions)) {
    const code = sharingSystem.encodePosition(position);
    const decoded = sharingSystem.decodePosition(code);
    if (!sharingSystem.comparePositions(position, decoded)) {
      throw new Error(`Round-trip failed for ${name}`);
    }
    console.log(`   ${name}: "${code}"`);
  }
});

// Test 4: Code length limit
runTest('Code Length Limit', () => {
  for (const [name, position] of Object.entries(testPositions)) {
    const code = sharingSystem.encodePosition(position);
    if (code.length > 12) {
      throw new Error(`Code for ${name} exceeds 12 characters: ${code.length}`);
    }
  }
});

// Test 5: URL-safe characters
runTest('URL-safe Characters', () => {
  const urlSafeRegex = /^[A-Za-z0-9\-_]*$/;
  for (const [name, position] of Object.entries(testPositions)) {
    const code = sharingSystem.encodePosition(position);
    if (!urlSafeRegex.test(code)) {
      throw new Error(`Code for ${name} contains non-URL-safe characters: ${code}`);
    }
  }
});

// Test 6: Error handling
runTest('Error Handling', () => {
  // Test invalid position
  try {
    sharingSystem.encodePosition(null);
    throw new Error('Should have thrown error for null position');
  } catch (error) {
    if (!(error instanceof SharingError)) {
      throw new Error('Should throw SharingError');
    }
  }
  
  // Test invalid code
  try {
    sharingSystem.decodePosition('invalid@code!');
    throw new Error('Should have thrown error for invalid code');
  } catch (error) {
    if (!(error instanceof SharingError)) {
      throw new Error('Should throw SharingError');
    }
  }
});

// Test 7: Performance
runTest('Performance', () => {
  const iterations = 100;
  
  // Encoding performance
  const encodeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    sharingSystem.encodePosition(testPositions.starting);
  }
  const encodeTime = (Date.now() - encodeStart) / iterations;
  
  // Decoding performance
  const code = sharingSystem.encodePosition(testPositions.starting);
  const decodeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    sharingSystem.decodePosition(code);
  }
  const decodeTime = (Date.now() - decodeStart) / iterations;
  
  console.log(`   Encoding: ${encodeTime.toFixed(3)}ms avg`);
  console.log(`   Decoding: ${decodeTime.toFixed(3)}ms avg`);
  
  if (encodeTime > 10 || decodeTime > 10) {
    throw new Error('Performance too slow');
  }
});

// Test 8: Statistics
runTest('Statistics', () => {
  const stats = sharingSystem.getSharingStatistics(testPositions.starting);
  if (stats.error) {
    throw new Error(`Statistics error: ${stats.error}`);
  }
  if (!stats.roundTripSuccess) {
    throw new Error('Round-trip should succeed');
  }
  if (!stats.urlSafe) {
    throw new Error('Code should be URL-safe');
  }
  console.log(`   Compression ratio: ${stats.compressionRatio.toFixed(2)}:1`);
});

// Summary
console.log('\n🧪 Test Summary:');
console.log(`   Total: ${testsTotal}`);
console.log(`   Passed: ${testsPassed}`);
console.log(`   Failed: ${testsTotal - testsPassed}`);
console.log(`   Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

if (testsPassed === testsTotal) {
  console.log('\n🎉 All tests passed! Position Sharing System is working correctly.');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please check the implementation.');
  process.exit(1);
}