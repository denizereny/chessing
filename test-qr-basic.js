/**
 * Basic QR Code Integration Test
 * 
 * This script tests the QR code functionality without requiring a browser.
 * It verifies the core QR generation logic and integration points.
 */

// Mock DOM elements for testing
class MockCanvas {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.context = new MockContext();
  }
  
  getContext(type) {
    return this.context;
  }
}

class MockContext {
  constructor() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 0;
    this.font = '';
    this.textAlign = '';
  }
  
  fillRect(x, y, w, h) {
    // Mock implementation
  }
  
  strokeRect(x, y, w, h) {
    // Mock implementation
  }
  
  fillText(text, x, y) {
    // Mock implementation
  }
}

// Load the modules
const fs = require('fs');
const path = require('path');

// Read and evaluate the QR code generator
const qrCodeScript = fs.readFileSync(path.join(__dirname, 'js/qr-code-generator.js'), 'utf8');
const positionSharingScript = fs.readFileSync(path.join(__dirname, 'js/position-sharing-system.js'), 'utf8');

// Mock global objects
global.window = {};
global.document = {
  createElement: (tag) => {
    if (tag === 'canvas') return new MockCanvas();
    return {};
  }
};
global.navigator = {
  mediaDevices: null,
  clipboard: null
};

// Evaluate the scripts
eval(positionSharingScript);
eval(qrCodeScript);

// Test functions
async function testQRCodeGeneration() {
  console.log('🧪 Testing QR Code Generation...');
  
  try {
    const qrGenerator = new QRCodeGenerator();
    const canvas = new MockCanvas();
    
    // Test basic QR generation
    const testText = 'https://example.com/position=ABC123';
    const success = await qrGenerator.generateQRCode(testText, canvas);
    
    console.log(`✅ QR Generation: ${success ? 'PASSED' : 'FAILED'}`);
    
    // Test statistics
    const stats = qrGenerator.getQRStatistics(testText, canvas);
    console.log(`📊 QR Stats:`, stats);
    
    // Test validation
    const validUrl = qrGenerator.validateQRData('https://example.com/position=ABC123');
    const validCode = qrGenerator.validateQRData('ABC123');
    const invalidData = qrGenerator.validateQRData('invalid-data-too-long-for-code');
    
    console.log(`✅ URL Validation: ${validUrl ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Code Validation: ${validCode ? 'PASSED' : 'FAILED'}`);
    console.log(`✅ Invalid Data Rejection: ${!invalidData ? 'PASSED' : 'FAILED'}`);
    
    // Test code extraction
    const extractedCode = qrGenerator.extractPositionCode('https://example.com/position=ABC123');
    console.log(`✅ Code Extraction: ${extractedCode === 'ABC123' ? 'PASSED' : 'FAILED'}`);
    
    return true;
  } catch (error) {
    console.error('❌ QR Generation Test Failed:', error.message);
    return false;
  }
}

async function testPositionSharingIntegration() {
  console.log('🧪 Testing Position Sharing Integration...');
  
  try {
    const sharingSystem = new PositionSharingSystem();
    const qrGenerator = new QRCodeGenerator();
    
    // Create test position
    const testPosition = [
      ['r', 'n', 'b', 'q'],
      ['p', 'p', 'p', 'p'],
      [null, null, null, null],
      ['P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'K']
    ];
    
    // Test position encoding
    const shareCode = sharingSystem.encodePosition(testPosition);
    console.log(`📝 Share Code: ${shareCode} (${shareCode.length} chars)`);
    
    // Test URL generation
    const shareUrl = `https://example.com/position=${shareCode}`;
    console.log(`🔗 Share URL: ${shareUrl}`);
    
    // Test QR code extraction
    const extractedCode = qrGenerator.extractPositionCode(shareUrl);
    const codeMatches = extractedCode === shareCode;
    console.log(`✅ Code Extraction: ${codeMatches ? 'PASSED' : 'FAILED'}`);
    
    // Test round-trip
    const decodedPosition = sharingSystem.decodePosition(shareCode);
    const positionsMatch = sharingSystem.comparePositions(testPosition, decodedPosition);
    console.log(`✅ Round-trip: ${positionsMatch ? 'PASSED' : 'FAILED'}`);
    
    // Test QR generation for position
    const canvas = new MockCanvas();
    const qrSuccess = await qrGenerator.generatePositionQR(shareUrl, canvas);
    console.log(`✅ Position QR Generation: ${qrSuccess ? 'PASSED' : 'FAILED'}`);
    
    return codeMatches && positionsMatch && qrSuccess;
  } catch (error) {
    console.error('❌ Integration Test Failed:', error.message);
    return false;
  }
}

async function testQRCodeMatrix() {
  console.log('🧪 Testing QR Code Matrix Generation...');
  
  try {
    const qrGenerator = new QRCodeGenerator();
    
    // Test matrix generation for different text lengths
    const testCases = [
      'ABC123',
      'https://example.com/pos=ABC123',
      'https://example.com/position=ABCDEFGHIJ12'
    ];
    
    let allPassed = true;
    
    for (const testText of testCases) {
      const matrix = qrGenerator.generateQRMatrix(testText, 'M');
      const expectedSize = qrGenerator.calculateQRSize(testText.length);
      
      const sizeCorrect = matrix.length === expectedSize && matrix[0].length === expectedSize;
      console.log(`📐 Text: "${testText}" -> ${matrix.length}x${matrix[0].length} (expected ${expectedSize}x${expectedSize}): ${sizeCorrect ? 'PASSED' : 'FAILED'}`);
      
      if (!sizeCorrect) allPassed = false;
    }
    
    console.log(`✅ Matrix Generation: ${allPassed ? 'PASSED' : 'FAILED'}`);
    return allPassed;
  } catch (error) {
    console.error('❌ Matrix Test Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting QR Code Integration Tests\n');
  
  const results = [];
  
  results.push(await testQRCodeGeneration());
  console.log('');
  
  results.push(await testPositionSharingIntegration());
  console.log('');
  
  results.push(await testQRCodeMatrix());
  console.log('');
  
  const allPassed = results.every(result => result);
  
  console.log('📋 Test Summary:');
  console.log(`QR Code Generation: ${results[0] ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Position Integration: ${results[1] ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Matrix Generation: ${results[2] ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('');
  console.log(`🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testQRCodeGeneration,
  testPositionSharingIntegration,
  testQRCodeMatrix,
  runAllTests
};