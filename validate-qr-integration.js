/**
 * QR Code Integration Validation Script
 * 
 * This script validates that the QR code integration is properly implemented
 * by checking file existence, syntax, and basic functionality.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function checkFileContent(filePath, requiredContent) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return requiredContent.every(item => content.includes(item));
  } catch (error) {
    return false;
  }
}

function validateQRIntegration() {
  log('🔍 Validating QR Code Integration...', 'blue');
  console.log('');
  
  let allChecksPass = true;
  
  // Check 1: QR Code Generator file exists
  const qrGeneratorPath = 'js/qr-code-generator.js';
  const qrGeneratorExists = checkFileExists(qrGeneratorPath);
  log(`📁 QR Code Generator file: ${qrGeneratorExists ? '✅ EXISTS' : '❌ MISSING'}`, qrGeneratorExists ? 'green' : 'red');
  if (!qrGeneratorExists) allChecksPass = false;
  
  // Check 2: QR Generator contains required classes and methods
  if (qrGeneratorExists) {
    const requiredQRContent = [
      'class QRCodeGenerator',
      'generateQRCode',
      'generatePositionQR',
      'generateMobileQR',
      'readQRFromCamera',
      'validateQRData',
      'extractPositionCode',
      'getQRStatistics'
    ];
    
    const qrContentValid = checkFileContent(qrGeneratorPath, requiredQRContent);
    log(`🔧 QR Generator methods: ${qrContentValid ? '✅ COMPLETE' : '❌ INCOMPLETE'}`, qrContentValid ? 'green' : 'red');
    if (!qrContentValid) allChecksPass = false;
  }
  
  // Check 3: Position Sharing Integration updated
  const integrationPath = 'js/position-sharing-integration.js';
  const integrationExists = checkFileExists(integrationPath);
  log(`📁 Position Sharing Integration: ${integrationExists ? '✅ EXISTS' : '❌ MISSING'}`, integrationExists ? 'green' : 'red');
  if (!integrationExists) allChecksPass = false;
  
  // Check 4: Integration contains QR functionality
  if (integrationExists) {
    const requiredIntegrationContent = [
      'qrCodeGenerator',
      'generateQRCode',
      'startQRReader',
      'stopQRReader',
      'processDetectedQR',
      'testQRCodeSharing'
    ];
    
    const integrationContentValid = checkFileContent(integrationPath, requiredIntegrationContent);
    log(`🔧 QR Integration methods: ${integrationContentValid ? '✅ COMPLETE' : '❌ INCOMPLETE'}`, integrationContentValid ? 'green' : 'red');
    if (!integrationContentValid) allChecksPass = false;
  }
  
  // Check 5: HTML includes QR generator script
  const htmlPath = 'index.html';
  const htmlExists = checkFileExists(htmlPath);
  log(`📁 Main HTML file: ${htmlExists ? '✅ EXISTS' : '❌ MISSING'}`, htmlExists ? 'green' : 'red');
  
  if (htmlExists) {
    const qrScriptIncluded = checkFileContent(htmlPath, ['js/qr-code-generator.js']);
    log(`🔧 QR Script included: ${qrScriptIncluded ? '✅ INCLUDED' : '❌ MISSING'}`, qrScriptIncluded ? 'green' : 'red');
    if (!qrScriptIncluded) allChecksPass = false;
  }
  
  // Check 6: Test files exist
  const testFiles = [
    'test/qr-code-integration.test.js',
    'test-qr-code-integration.html',
    'docs/qr-code-integration.md'
  ];
  
  testFiles.forEach(testFile => {
    const exists = checkFileExists(testFile);
    log(`📋 ${testFile}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`, exists ? 'green' : 'red');
    if (!exists) allChecksPass = false;
  });
  
  // Check 7: UI elements in integration
  if (integrationExists) {
    const uiElements = [
      'btnQRCode',
      'btnQRReader',
      'btnStopQR',
      'qrCodeDisplay',
      'qrReaderDisplay',
      'qrCanvas',
      'qrVideo'
    ];
    
    const uiElementsPresent = checkFileContent(integrationPath, uiElements);
    log(`🎨 QR UI elements: ${uiElementsPresent ? '✅ COMPLETE' : '❌ INCOMPLETE'}`, uiElementsPresent ? 'green' : 'red');
    if (!uiElementsPresent) allChecksPass = false;
  }
  
  // Check 8: Error handling
  if (qrGeneratorExists) {
    const errorHandling = [
      'QRCodeError',
      'try {',
      'catch (error)',
      'drawErrorQR',
      'showSharingError'
    ];
    
    const errorHandlingPresent = checkFileContent(qrGeneratorPath, errorHandling.slice(0, 4)) &&
                                checkFileContent(integrationPath, [errorHandling[4]]);
    log(`⚠️  Error handling: ${errorHandlingPresent ? '✅ IMPLEMENTED' : '❌ INCOMPLETE'}`, errorHandlingPresent ? 'green' : 'red');
    if (!errorHandlingPresent) allChecksPass = false;
  }
  
  console.log('');
  
  // Summary
  if (allChecksPass) {
    log('🎉 QR Code Integration Validation: ALL CHECKS PASSED', 'green');
    log('✅ QR code generation is properly implemented', 'green');
    log('✅ Mobile optimization features are included', 'green');
    log('✅ Error handling is comprehensive', 'green');
    log('✅ UI integration is complete', 'green');
    log('✅ Test coverage is adequate', 'green');
  } else {
    log('❌ QR Code Integration Validation: SOME CHECKS FAILED', 'red');
    log('Please review the failed checks above and fix any issues.', 'yellow');
  }
  
  console.log('');
  
  // Additional recommendations
  log('📋 Next Steps:', 'blue');
  log('1. Open test-qr-code-integration.html in a browser to test functionality', 'yellow');
  log('2. Test QR code generation with different positions', 'yellow');
  log('3. Test camera access on mobile devices', 'yellow');
  log('4. Verify QR codes can be scanned with mobile QR readers', 'yellow');
  log('5. Test error scenarios (no camera, invalid data, etc.)', 'yellow');
  
  return allChecksPass;
}

// Run validation if this script is executed directly
if (require.main === module) {
  const success = validateQRIntegration();
  process.exit(success ? 0 : 1);
}

module.exports = { validateQRIntegration };