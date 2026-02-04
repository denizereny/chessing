/**
 * Position Sharing Integration
 * 
 * Integrates the Position Sharing System with the existing piece setup system
 * to provide sharing functionality in the enhanced piece setup modal.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

// Global Position Sharing System instance
let positionSharingSystem = null;
let qrCodeGenerator = null;

/**
 * Initialize Position Sharing System integration
 */
function initializePositionSharing() {
  if (!positionSharingSystem) {
    positionSharingSystem = new PositionSharingSystem();
    console.log('🔗 Position Sharing System integration initialized');
  }
  
  if (!qrCodeGenerator) {
    qrCodeGenerator = new QRCodeGenerator();
    console.log('📱 QR Code Generator integration initialized');
  }
  
  // Check for position in URL on page load
  loadPositionFromURL();
  
  // Add sharing UI elements if not already present
  addSharingUI();
}

/**
 * Load position from URL if present
 */
function loadPositionFromURL() {
  if (!positionSharingSystem) return;
  
  try {
    const position = positionSharingSystem.loadFromURL();
    if (position) {
      console.log('🔗 Loading position from URL');
      
      // Apply position to setup board
      if (typeof setupBoard !== 'undefined') {
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 4; col++) {
            setupBoard[row][col] = position[row][col];
          }
        }
        
        // Update UI if setup is open
        if (typeof drawSetupBoard === 'function') {
          drawSetupBoard();
        }
        
        // Show notification
        if (enhancedUI) {
          enhancedUI.showEnhancedNotification(
            'Position loaded from sharing link!', 
            'success'
          );
        } else if (typeof bildirimGoster === 'function') {
          bildirimGoster('Position loaded from sharing link!');
        }
      }
    }
  } catch (error) {
    console.error('🔗 Failed to load position from URL:', error);
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        'Invalid sharing link: ' + error.message, 
        'error'
      );
    }
  }
}

/**
 * Add sharing UI elements to the piece setup modal
 */
function addSharingUI() {
  // Check if sharing UI already exists
  if (document.getElementById('positionSharingPanel')) {
    return;
  }
  
  // Find the piece setup modal
  const modal = document.getElementById('pieceSetupModal');
  if (!modal) {
    console.warn('🔗 Piece setup modal not found, sharing UI not added');
    return;
  }
  
  // Find a good place to insert the sharing panel
  const setupControls = modal.querySelector('.setup-controls') || 
                       modal.querySelector('.piece-setup-content');
  
  if (!setupControls) {
    console.warn('🔗 Setup controls not found, sharing UI not added');
    return;
  }
  
  // Create sharing panel
  const sharingPanel = document.createElement('div');
  sharingPanel.id = 'positionSharingPanel';
  sharingPanel.className = 'sharing-panel';
  sharingPanel.innerHTML = `
    <div class="sharing-header">
      <h3>🔗 Position Sharing</h3>
    </div>
    <div class="sharing-content">
      <div class="sharing-row">
        <button onclick="generateSharingCode()" class="btn-primary" id="btnGenerateCode">
          📋 Generate Code
        </button>
        <button onclick="copyPositionCode()" class="btn-secondary" id="btnCopyCode" disabled>
          📄 Copy Code
        </button>
      </div>
      <div class="sharing-row">
        <input type="text" id="sharingCodeInput" placeholder="Enter sharing code..." 
               class="sharing-input" maxlength="12">
        <button onclick="loadFromSharingCode()" class="btn-secondary" id="btnLoadCode">
          📥 Load
        </button>
      </div>
      <div class="sharing-row">
        <button onclick="shareViaURL()" class="btn-secondary" id="btnShareURL" disabled>
          🔗 Share URL
        </button>
        <button onclick="generateQRCode()" class="btn-secondary" id="btnQRCode" disabled>
          📱 QR Code
        </button>
      </div>
      <div class="sharing-row">
        <button onclick="startQRReader()" class="btn-secondary" id="btnQRReader">
          📷 Scan QR
        </button>
        <button onclick="stopQRReader()" class="btn-secondary" id="btnStopQR" disabled style="display: none;">
          ⏹ Stop Scan
        </button>
      </div>
      <div id="sharingCodeDisplay" class="code-display" style="display: none;">
        <div class="code-text" id="codeText"></div>
        <div class="code-info" id="codeInfo"></div>
      </div>
      <div id="qrCodeDisplay" class="qr-display" style="display: none;">
        <canvas id="qrCanvas" width="200" height="200"></canvas>
        <div class="qr-info">Scan to load position</div>
      </div>
      <div id="qrReaderDisplay" class="qr-reader-display" style="display: none;">
        <video id="qrVideo" width="300" height="200" autoplay muted></video>
        <div class="qr-reader-info">Point camera at QR code</div>
        <div class="qr-reader-status" id="qrReaderStatus">Initializing camera...</div>
      </div>
    </div>
  `;
  
  // Add CSS styles
  const style = document.createElement('style');
  style.textContent = `
    .sharing-panel {
      margin: 20px 0;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      background: #f8f9fa;
    }
    
    .sharing-header h3 {
      margin: 0 0 15px 0;
      color: #495057;
      font-size: 16px;
    }
    
    .sharing-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: center;
    }
    
    .sharing-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    
    .code-display {
      margin-top: 15px;
      padding: 10px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    
    .code-text {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #d63384;
      text-align: center;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 3px;
      word-break: break-all;
    }
    
    .code-info {
      font-size: 12px;
      color: #6c757d;
      text-align: center;
      margin-top: 5px;
    }
    
    .qr-display {
      margin-top: 15px;
      text-align: center;
      padding: 15px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    
    .qr-info {
      font-size: 12px;
      color: #6c757d;
      margin-top: 10px;
    }
    
    #qrCanvas {
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    
    .qr-reader-display {
      margin-top: 15px;
      text-align: center;
      padding: 15px;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 5px;
    }
    
    #qrVideo {
      border: 2px solid #007bff;
      border-radius: 5px;
      background: #000;
    }
    
    .qr-reader-info {
      font-size: 14px;
      color: #495057;
      margin: 10px 0 5px 0;
      font-weight: bold;
    }
    
    .qr-reader-status {
      font-size: 12px;
      color: #6c757d;
      margin-top: 5px;
    }
  `;
  
  if (!document.getElementById('positionSharingStyles')) {
    style.id = 'positionSharingStyles';
    document.head.appendChild(style);
  }
  
  // Insert the sharing panel
  setupControls.appendChild(sharingPanel);
  
  console.log('🔗 Position sharing UI added to piece setup modal');
}

/**
 * Generate sharing code for current position
 */
function generateSharingCode() {
  if (!positionSharingSystem || typeof setupBoard === 'undefined') {
    showSharingError('Position sharing system not available');
    return;
  }
  
  try {
    const code = positionSharingSystem.encodePosition(setupBoard);
    const stats = positionSharingSystem.getSharingStatistics(setupBoard);
    
    // Display the code
    const codeDisplay = document.getElementById('sharingCodeDisplay');
    const codeText = document.getElementById('codeText');
    const codeInfo = document.getElementById('codeInfo');
    
    if (codeDisplay && codeText && codeInfo) {
      codeText.textContent = code;
      codeInfo.textContent = `${code.length} characters • Compression: ${stats.compressionRatio.toFixed(2)}:1`;
      codeDisplay.style.display = 'block';
    }
    
    // Enable buttons
    document.getElementById('btnCopyCode').disabled = false;
    document.getElementById('btnShareURL').disabled = false;
    document.getElementById('btnQRCode').disabled = false;
    
    // Store code for other functions
    window.currentSharingCode = code;
    
    console.log(`🔗 Generated sharing code: ${code}`);
    
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Sharing code generated: ${code}`, 
        'success'
      );
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster(`Sharing code generated: ${code}`);
    }
    
  } catch (error) {
    console.error('🔗 Failed to generate sharing code:', error);
    showSharingError('Failed to generate sharing code: ' + error.message);
  }
}

/**
 * Copy position code to clipboard
 */
async function copyPositionCode() {
  if (!window.currentSharingCode) {
    showSharingError('No sharing code generated');
    return;
  }
  
  try {
    await positionSharingSystem.copyToClipboard(window.currentSharingCode);
    
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        'Sharing code copied to clipboard!', 
        'success'
      );
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster('Sharing code copied to clipboard!');
    }
    
  } catch (error) {
    console.error('🔗 Failed to copy code:', error);
    showSharingError('Failed to copy code: ' + error.message);
  }
}

/**
 * Load position from sharing code
 */
function loadFromSharingCode() {
  const input = document.getElementById('sharingCodeInput');
  if (!input || !input.value.trim()) {
    showSharingError('Please enter a sharing code');
    return;
  }
  
  const code = input.value.trim();
  
  try {
    const position = positionSharingSystem.decodePosition(code);
    
    // Apply position to setup board
    if (typeof setupBoard !== 'undefined') {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          setupBoard[row][col] = position[row][col];
        }
      }
      
      // Update UI
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Clear input
      input.value = '';
      
      console.log(`🔗 Loaded position from code: ${code}`);
      
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          'Position loaded from sharing code!', 
          'success'
        );
      } else if (typeof bildirimGoster === 'function') {
        bildirimGoster('Position loaded from sharing code!');
      }
    }
    
  } catch (error) {
    console.error('🔗 Failed to load from code:', error);
    showSharingError('Invalid sharing code: ' + error.message);
  }
}

/**
 * Share position via URL
 */
function shareViaURL() {
  if (!window.currentSharingCode) {
    showSharingError('No sharing code generated');
    return;
  }
  
  try {
    const url = positionSharingSystem.shareViaURL(setupBoard);
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(url).then(() => {
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          'Share URL copied to clipboard!', 
          'success'
        );
      } else if (typeof bildirimGoster === 'function') {
        bildirimGoster('Share URL copied to clipboard!');
      }
    }).catch(() => {
      // Fallback: show URL in prompt
      prompt('Share this URL:', url);
    });
    
    console.log(`🔗 Generated share URL: ${url}`);
    
  } catch (error) {
    console.error('🔗 Failed to generate share URL:', error);
    showSharingError('Failed to generate share URL: ' + error.message);
  }
}

/**
 * Generate QR code for position
 */
async function generateQRCode() {
  if (!window.currentSharingCode) {
    showSharingError('No sharing code generated');
    return;
  }
  
  if (!qrCodeGenerator) {
    showSharingError('QR Code generator not available');
    return;
  }
  
  try {
    const url = positionSharingSystem.shareViaURL(setupBoard);
    const canvas = document.getElementById('qrCanvas');
    const qrDisplay = document.getElementById('qrCodeDisplay');
    
    if (!canvas || !qrDisplay) {
      showSharingError('QR code display not available');
      return;
    }
    
    // Generate QR code using the QR generator
    const success = await qrCodeGenerator.generatePositionQR(url, canvas);
    
    if (success) {
      qrDisplay.style.display = 'block';
      
      // Update QR info with statistics
      const stats = qrCodeGenerator.getQRStatistics(url, canvas);
      const qrInfo = qrDisplay.querySelector('.qr-info');
      if (qrInfo) {
        qrInfo.innerHTML = `
          Scan to load position<br>
          <small>Distance: ${stats.estimatedScanDistance} • Size: ${stats.qrSize}x${stats.qrSize}</small>
        `;
      }
      
      console.log('📱 QR code generated successfully');
      
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          'QR code generated! Scan with your mobile device.', 
          'success'
        );
      } else if (typeof bildirimGoster === 'function') {
        bildirimGoster('QR code generated!');
      }
    } else {
      showSharingError('Failed to generate QR code');
    }
    
  } catch (error) {
    console.error('📱 Failed to generate QR code:', error);
    showSharingError('Failed to generate QR code: ' + error.message);
  }
}

/**
 * Show sharing error message
 */
function showSharingError(message) {
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(message, 'error');
  } else if (typeof bildirimGoster === 'function') {
    bildirimGoster(message);
  } else {
    alert(message);
  }
}

/**
 * Get current position sharing statistics
 */
function getPositionSharingStats() {
  if (!positionSharingSystem || typeof setupBoard === 'undefined') {
    return null;
  }
  
  try {
    return positionSharingSystem.getSharingStatistics(setupBoard);
  } catch (error) {
    console.error('🔗 Failed to get sharing stats:', error);
    return null;
  }
}

/**
 * Start QR code reader
 */
async function startQRReader() {
  if (!qrCodeGenerator) {
    showSharingError('QR Code reader not available');
    return;
  }
  
  try {
    const video = document.getElementById('qrVideo');
    const readerDisplay = document.getElementById('qrReaderDisplay');
    const status = document.getElementById('qrReaderStatus');
    const btnStart = document.getElementById('btnQRReader');
    const btnStop = document.getElementById('btnStopQR');
    
    if (!video || !readerDisplay || !status) {
      showSharingError('QR reader interface not available');
      return;
    }
    
    // Show reader interface
    readerDisplay.style.display = 'block';
    btnStart.disabled = true;
    btnStop.disabled = false;
    btnStop.style.display = 'inline-block';
    
    status.textContent = 'Starting camera...';
    
    // Start camera
    await qrCodeGenerator.readQRFromCamera(video);
    
    status.textContent = 'Camera ready - point at QR code';
    
    // Start scanning loop (simplified - would use proper QR reading library)
    window.qrScanInterval = setInterval(() => {
      // In a real implementation, this would use jsQR or similar library
      // to analyze video frames and detect QR codes
      status.textContent = 'Scanning for QR codes...';
    }, 1000);
    
    console.log('📷 QR code reader started');
    
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        'QR reader started. Point camera at QR code.', 
        'info'
      );
    } else if (typeof bildirimGoster === 'function') {
      bildirimGoster('QR reader started');
    }
    
  } catch (error) {
    console.error('📷 Failed to start QR reader:', error);
    showSharingError('Camera access failed: ' + error.message);
    stopQRReader();
  }
}

/**
 * Stop QR code reader
 */
function stopQRReader() {
  try {
    const video = document.getElementById('qrVideo');
    const readerDisplay = document.getElementById('qrReaderDisplay');
    const btnStart = document.getElementById('btnQRReader');
    const btnStop = document.getElementById('btnStopQR');
    
    // Stop camera
    if (qrCodeGenerator && video) {
      qrCodeGenerator.stopCamera(video);
    }
    
    // Stop scanning
    if (window.qrScanInterval) {
      clearInterval(window.qrScanInterval);
      window.qrScanInterval = null;
    }
    
    // Hide reader interface
    if (readerDisplay) {
      readerDisplay.style.display = 'none';
    }
    
    // Reset buttons
    if (btnStart) btnStart.disabled = false;
    if (btnStop) {
      btnStop.disabled = true;
      btnStop.style.display = 'none';
    }
    
    console.log('📷 QR code reader stopped');
    
  } catch (error) {
    console.error('📷 Failed to stop QR reader:', error);
  }
}

/**
 * Process detected QR code
 */
function processDetectedQR(qrData) {
  try {
    if (!qrCodeGenerator.validateQRData(qrData)) {
      showSharingError('Invalid QR code data');
      return;
    }
    
    const positionCode = qrCodeGenerator.extractPositionCode(qrData);
    if (!positionCode) {
      showSharingError('No position data found in QR code');
      return;
    }
    
    // Load the position
    const position = positionSharingSystem.decodePosition(positionCode);
    
    // Apply position to setup board
    if (typeof setupBoard !== 'undefined') {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          setupBoard[row][col] = position[row][col];
        }
      }
      
      // Update UI
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Stop reader
      stopQRReader();
      
      console.log(`📷 Position loaded from QR code: ${positionCode}`);
      
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          'Position loaded from QR code!', 
          'success'
        );
      } else if (typeof bildirimGoster === 'function') {
        bildirimGoster('Position loaded from QR code!');
      }
    }
    
  } catch (error) {
    console.error('📷 Failed to process QR code:', error);
    showSharingError('Failed to load position from QR code: ' + error.message);
  }
}

/**
 * Test position sharing round-trip
 */
function testPositionSharing() {
  if (!positionSharingSystem || typeof setupBoard === 'undefined') {
    console.error('🔗 Position sharing system or setup board not available');
    return false;
  }
  
  try {
    const originalPosition = setupBoard.map(row => [...row]);
    const code = positionSharingSystem.encodePosition(originalPosition);
    const decodedPosition = positionSharingSystem.decodePosition(code);
    const success = positionSharingSystem.comparePositions(originalPosition, decodedPosition);
    
    console.log(`🔗 Position sharing test: ${success ? 'PASSED' : 'FAILED'}`);
    console.log(`   Code: ${code} (${code.length} chars)`);
    
    return success;
  } catch (error) {
    console.error('🔗 Position sharing test failed:', error);
    return false;
  }
}

/**
 * Test QR code round-trip
 */
async function testQRCodeSharing() {
  if (!positionSharingSystem || !qrCodeGenerator || typeof setupBoard === 'undefined') {
    console.error('📱 QR code system or setup board not available');
    return false;
  }
  
  try {
    // Create a test canvas
    const canvas = document.createElement('canvas');
    const originalPosition = setupBoard.map(row => [...row]);
    const shareUrl = positionSharingSystem.shareViaURL(originalPosition);
    
    // Generate QR code
    const success = await qrCodeGenerator.generatePositionQR(shareUrl, canvas);
    if (!success) {
      console.error('📱 QR code generation failed');
      return false;
    }
    
    // Extract position code from URL
    const positionCode = qrCodeGenerator.extractPositionCode(shareUrl);
    if (!positionCode) {
      console.error('📱 Failed to extract position code from URL');
      return false;
    }
    
    // Decode position
    const decodedPosition = positionSharingSystem.decodePosition(positionCode);
    const roundTripSuccess = positionSharingSystem.comparePositions(originalPosition, decodedPosition);
    
    console.log(`📱 QR code sharing test: ${roundTripSuccess ? 'PASSED' : 'FAILED'}`);
    console.log(`   URL: ${shareUrl}`);
    console.log(`   Code: ${positionCode}`);
    
    return roundTripSuccess;
  } catch (error) {
    console.error('📱 QR code sharing test failed:', error);
    return false;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePositionSharing);
} else {
  // DOM already loaded
  setTimeout(initializePositionSharing, 100);
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.initializePositionSharing = initializePositionSharing;
  window.generateSharingCode = generateSharingCode;
  window.copyPositionCode = copyPositionCode;
  window.loadFromSharingCode = loadFromSharingCode;
  window.shareViaURL = shareViaURL;
  window.generateQRCode = generateQRCode;
  window.startQRReader = startQRReader;
  window.stopQRReader = stopQRReader;
  window.processDetectedQR = processDetectedQR;
  window.getPositionSharingStats = getPositionSharingStats;
  window.testPositionSharing = testPositionSharing;
  window.testQRCodeSharing = testQRCodeSharing;
}

console.log('🔗 Position Sharing Integration module loaded');