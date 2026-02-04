/**
 * Unit Tests for Position Sharing System
 * 
 * Tests the encoding and decoding functionality of the Position Sharing System
 * for 4x5 chess positions with URL-safe sharing codes.
 * 
 * Requirements: 4.1, 4.3, 4.5
 */

// Test positions for various scenarios
const testPositions = {
  // Standard starting position
  starting: [
    ["r", "q", "k", "r"],
    ["p", "p", "p", "p"],
    [null, null, null, null],
    ["P", "P", "P", "P"],
    ["R", "Q", "K", "R"]
  ],
  
  // Empty board
  empty: [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ],
  
  // Minimal position (only kings)
  kingsOnly: [
    [null, null, "k", null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, "K", null]
  ],
  
  // Complex endgame position
  endgame: [
    [null, null, "k", null],
    [null, "p", null, null],
    [null, null, "Q", null],
    ["P", null, null, null],
    ["R", null, "K", null]
  ],
  
  // Full board (maximum pieces)
  full: [
    ["r", "n", "b", "q"],
    ["p", "p", "p", "p"],
    ["P", "P", "P", "P"],
    ["R", "N", "B", "Q"],
    ["k", null, null, "K"]
  ],
  
  // Mixed position with all piece types
  mixed: [
    ["r", "n", "k", "r"],
    ["p", null, "b", "p"],
    ["N", "P", null, "q"],
    [null, "P", "P", null],
    ["R", "Q", "K", "B"]
  ]
};

/**
 * Position Sharing System Tests
 */
class PositionSharingSystemTests {
  constructor() {
    this.sharingSystem = new PositionSharingSystem();
    this.testResults = [];
    console.log('🧪 Position Sharing System Tests initialized');
  }
  
  /**
   * Run all tests
   * @returns {Object} Test results summary
   */
  runAllTests() {
    console.log('🧪 Running Position Sharing System tests...');
    
    this.testResults = [];
    
    // Basic functionality tests
    this.testBasicEncoding();
    this.testBasicDecoding();
    this.testRoundTripEncoding();
    
    // Edge case tests
    this.testEmptyPosition();
    this.testFullPosition();
    this.testKingsOnlyPosition();
    
    // Error handling tests
    this.testInvalidPositionFormat();
    this.testInvalidSharingCode();
    this.testCodeLengthLimit();
    
    // URL safety tests
    this.testURLSafeCharacters();
    this.testURLGeneration();
    
    // Performance tests
    this.testEncodingPerformance();
    this.testDecodingPerformance();
    
    // Property-based tests
    this.testAllTestPositions();
    
    return this.getTestSummary();
  }
  
  /**
   * Test basic position encoding
   */
  testBasicEncoding() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.starting);
      
      this.assert(
        typeof code === 'string' && code.length > 0,
        'Basic encoding should return non-empty string',
        'testBasicEncoding'
      );
      
      this.assert(
        code.length <= 12,
        `Encoded code should be max 12 characters, got ${code.length}`,
        'testBasicEncoding'
      );
      
      this.assert(
        this.sharingSystem.isValidCode(code),
        'Encoded code should contain only valid URL-safe characters',
        'testBasicEncoding'
      );
      
      console.log(`✅ Basic encoding test passed: "${code}" (${code.length} chars)`);
      
    } catch (error) {
      this.recordFailure('testBasicEncoding', error.message);
    }
  }
  
  /**
   * Test basic position decoding
   */
  testBasicDecoding() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.starting);
      const decoded = this.sharingSystem.decodePosition(code);
      
      this.assert(
        Array.isArray(decoded) && decoded.length === 5,
        'Decoded position should be 5x4 array',
        'testBasicDecoding'
      );
      
      this.assert(
        decoded.every(row => Array.isArray(row) && row.length === 4),
        'Each row should have 4 columns',
        'testBasicDecoding'
      );
      
      console.log('✅ Basic decoding test passed');
      
    } catch (error) {
      this.recordFailure('testBasicDecoding', error.message);
    }
  }
  
  /**
   * Test round-trip encoding (encode then decode should return original)
   */
  testRoundTripEncoding() {
    try {
      for (const [name, position] of Object.entries(testPositions)) {
        const code = this.sharingSystem.encodePosition(position);
        const decoded = this.sharingSystem.decodePosition(code);
        
        this.assert(
          this.sharingSystem.comparePositions(position, decoded),
          `Round-trip should preserve position for ${name}`,
          'testRoundTripEncoding'
        );
        
        console.log(`✅ Round-trip test passed for ${name}: "${code}"`);
      }
      
    } catch (error) {
      this.recordFailure('testRoundTripEncoding', error.message);
    }
  }
  
  /**
   * Test empty position encoding
   */
  testEmptyPosition() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.empty);
      const decoded = this.sharingSystem.decodePosition(code);
      
      this.assert(
        this.sharingSystem.comparePositions(testPositions.empty, decoded),
        'Empty position should encode/decode correctly',
        'testEmptyPosition'
      );
      
      console.log(`✅ Empty position test passed: "${code}"`);
      
    } catch (error) {
      this.recordFailure('testEmptyPosition', error.message);
    }
  }
  
  /**
   * Test full position encoding
   */
  testFullPosition() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.full);
      const decoded = this.sharingSystem.decodePosition(code);
      
      this.assert(
        this.sharingSystem.comparePositions(testPositions.full, decoded),
        'Full position should encode/decode correctly',
        'testFullPosition'
      );
      
      this.assert(
        code.length <= 12,
        `Full position code should be max 12 characters, got ${code.length}`,
        'testFullPosition'
      );
      
      console.log(`✅ Full position test passed: "${code}" (${code.length} chars)`);
      
    } catch (error) {
      this.recordFailure('testFullPosition', error.message);
    }
  }
  
  /**
   * Test kings-only position
   */
  testKingsOnlyPosition() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.kingsOnly);
      const decoded = this.sharingSystem.decodePosition(code);
      
      this.assert(
        this.sharingSystem.comparePositions(testPositions.kingsOnly, decoded),
        'Kings-only position should encode/decode correctly',
        'testKingsOnlyPosition'
      );
      
      console.log(`✅ Kings-only position test passed: "${code}"`);
      
    } catch (error) {
      this.recordFailure('testKingsOnlyPosition', error.message);
    }
  }
  
  /**
   * Test invalid position format handling
   */
  testInvalidPositionFormat() {
    try {
      const invalidPositions = [
        null,
        undefined,
        [],
        [[]], // Wrong dimensions
        [['invalid-piece']], // Invalid piece
        Array(6).fill(Array(4).fill(null)), // Wrong row count
        Array(5).fill(Array(5).fill(null))  // Wrong column count
      ];
      
      for (const invalidPos of invalidPositions) {
        try {
          this.sharingSystem.encodePosition(invalidPos);
          this.recordFailure('testInvalidPositionFormat', 'Should have thrown error for invalid position');
        } catch (error) {
          // Expected to throw
          this.assert(
            error instanceof SharingError,
            'Should throw SharingError for invalid position',
            'testInvalidPositionFormat'
          );
        }
      }
      
      console.log('✅ Invalid position format test passed');
      
    } catch (error) {
      this.recordFailure('testInvalidPositionFormat', error.message);
    }
  }
  
  /**
   * Test invalid sharing code handling
   */
  testInvalidSharingCode() {
    try {
      const invalidCodes = [
        null,
        undefined,
        '',
        'invalid@chars!',
        'A'.repeat(13), // Too long
        '🔗invalid'      // Non-ASCII
      ];
      
      for (const invalidCode of invalidCodes) {
        try {
          this.sharingSystem.decodePosition(invalidCode);
          this.recordFailure('testInvalidSharingCode', `Should have thrown error for invalid code: ${invalidCode}`);
        } catch (error) {
          // Expected to throw
          this.assert(
            error instanceof SharingError,
            'Should throw SharingError for invalid code',
            'testInvalidSharingCode'
          );
        }
      }
      
      console.log('✅ Invalid sharing code test passed');
      
    } catch (error) {
      this.recordFailure('testInvalidSharingCode', error.message);
    }
  }
  
  /**
   * Test code length limit (max 12 characters)
   */
  testCodeLengthLimit() {
    try {
      for (const [name, position] of Object.entries(testPositions)) {
        const code = this.sharingSystem.encodePosition(position);
        
        this.assert(
          code.length <= 12,
          `Code for ${name} should be max 12 characters, got ${code.length}`,
          'testCodeLengthLimit'
        );
      }
      
      console.log('✅ Code length limit test passed');
      
    } catch (error) {
      this.recordFailure('testCodeLengthLimit', error.message);
    }
  }
  
  /**
   * Test URL-safe character set
   */
  testURLSafeCharacters() {
    try {
      for (const [name, position] of Object.entries(testPositions)) {
        const code = this.sharingSystem.encodePosition(position);
        
        // Check that all characters are URL-safe
        const urlSafeRegex = /^[A-Za-z0-9\-_]*$/;
        this.assert(
          urlSafeRegex.test(code),
          `Code for ${name} should contain only URL-safe characters: ${code}`,
          'testURLSafeCharacters'
        );
        
        // Check that code doesn't need URL encoding
        this.assert(
          encodeURIComponent(code) === code,
          `Code for ${name} should not need URL encoding: ${code}`,
          'testURLSafeCharacters'
        );
      }
      
      console.log('✅ URL-safe characters test passed');
      
    } catch (error) {
      this.recordFailure('testURLSafeCharacters', error.message);
    }
  }
  
  /**
   * Test URL generation
   */
  testURLGeneration() {
    try {
      const url = this.sharingSystem.shareViaURL(testPositions.starting);
      
      this.assert(
        typeof url === 'string' && url.includes('?position='),
        'Should generate valid URL with position parameter',
        'testURLGeneration'
      );
      
      // Extract code from URL
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('position');
      
      this.assert(
        code && code.length <= 12,
        'URL should contain valid position code',
        'testURLGeneration'
      );
      
      // Test that the code in URL can be decoded
      const decoded = this.sharingSystem.decodePosition(code);
      this.assert(
        this.sharingSystem.comparePositions(testPositions.starting, decoded),
        'Code from URL should decode to original position',
        'testURLGeneration'
      );
      
      console.log(`✅ URL generation test passed: ${url}`);
      
    } catch (error) {
      this.recordFailure('testURLGeneration', error.message);
    }
  }
  
  /**
   * Test encoding performance (should be fast)
   */
  testEncodingPerformance() {
    try {
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        this.sharingSystem.encodePosition(testPositions.starting);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      this.assert(
        avgTime < 10, // Should be very fast, under 10ms per encoding
        `Encoding should be fast, got ${avgTime.toFixed(2)}ms average`,
        'testEncodingPerformance'
      );
      
      console.log(`✅ Encoding performance test passed: ${avgTime.toFixed(2)}ms average`);
      
    } catch (error) {
      this.recordFailure('testEncodingPerformance', error.message);
    }
  }
  
  /**
   * Test decoding performance (should be fast)
   */
  testDecodingPerformance() {
    try {
      const code = this.sharingSystem.encodePosition(testPositions.starting);
      const iterations = 100;
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        this.sharingSystem.decodePosition(code);
      }
      
      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;
      
      this.assert(
        avgTime < 10, // Should be very fast, under 10ms per decoding
        `Decoding should be fast, got ${avgTime.toFixed(2)}ms average`,
        'testDecodingPerformance'
      );
      
      console.log(`✅ Decoding performance test passed: ${avgTime.toFixed(2)}ms average`);
      
    } catch (error) {
      this.recordFailure('testDecodingPerformance', error.message);
    }
  }
  
  /**
   * Test all predefined test positions
   */
  testAllTestPositions() {
    try {
      for (const [name, position] of Object.entries(testPositions)) {
        const stats = this.sharingSystem.getSharingStatistics(position);
        
        this.assert(
          !stats.error,
          `Position ${name} should encode without error: ${stats.error}`,
          'testAllTestPositions'
        );
        
        this.assert(
          stats.roundTripSuccess,
          `Position ${name} should pass round-trip test`,
          'testAllTestPositions'
        );
        
        this.assert(
          stats.codeLength <= 12,
          `Position ${name} code should be max 12 chars, got ${stats.codeLength}`,
          'testAllTestPositions'
        );
        
        this.assert(
          stats.urlSafe,
          `Position ${name} code should be URL-safe`,
          'testAllTestPositions'
        );
        
        console.log(`✅ Position ${name} test passed: "${stats.sharingCode}" (${stats.codeLength} chars)`);
      }
      
    } catch (error) {
      this.recordFailure('testAllTestPositions', error.message);
    }
  }
  
  // Helper methods
  
  /**
   * Assert a condition and record result
   * @param {boolean} condition - Condition to test
   * @param {string} message - Error message if condition fails
   * @param {string} testName - Name of the test
   */
  assert(condition, message, testName) {
    if (condition) {
      this.testResults.push({ test: testName, status: 'pass', message: 'OK' });
    } else {
      this.recordFailure(testName, message);
      throw new Error(message);
    }
  }
  
  /**
   * Record a test failure
   * @param {string} testName - Name of the test
   * @param {string} message - Failure message
   */
  recordFailure(testName, message) {
    this.testResults.push({ test: testName, status: 'fail', message });
    console.error(`❌ ${testName} failed: ${message}`);
  }
  
  /**
   * Get test results summary
   * @returns {Object} Test summary
   */
  getTestSummary() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const failed = total - passed;
    
    const summary = {
      total,
      passed,
      failed,
      success: failed === 0,
      results: this.testResults
    };
    
    console.log(`🧪 Position Sharing System Tests Summary:`);
    console.log(`   Total: ${total}, Passed: ${passed}, Failed: ${failed}`);
    console.log(`   Success: ${summary.success ? '✅' : '❌'}`);
    
    return summary;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionSharingSystemTests;
} else if (typeof window !== 'undefined') {
  window.PositionSharingSystemTests = PositionSharingSystemTests;
}

console.log('🧪 Position Sharing System Tests module loaded');