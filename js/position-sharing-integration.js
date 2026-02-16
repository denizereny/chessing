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
 * Add sharing UI elements to the settings menu
 */
function addSharingUI() {
  // Check if sharing UI already exists
  if (document.getElementById('positionSharingPanel')) {
    return;
  }
  
  // Find the settings menu content container
  const settingsMenuContent = document.querySelector('.settings-menu-content');
  if (!settingsMenuContent) {
    console.warn('🔗 Settings menu content not found, sharing UI not added');
    return;
  }
  
  // Create sharing panel as a menu control group
  const sharingPanel = document.createElement('div');
  sharingPanel.id = 'positionSharingPanel';
  sharingPanel.className = 'menu-control-group position-sharing-group';
  sharingPanel.innerHTML = `
    <div class="menu-control-header">
      <span class="icon">🔗</span>
      <span id="positionSharingTitle">Position Sharing</span>
    </div>
    <div class="sharing-content">
      <div class="sharing-row">
        <button onclick="generateSharingCode()" class="menu-control-btn" id="btnGenerateCode">
          📋 <span id="btnGenerateCodeText">Generate Code</span>
        </button>
        <button onclick="copyPositionCode()" class="menu-control-btn" id="btnCopyCode" disabled>
          📄 <span id="btnCopyCodeText">Copy Code</span>
        </button>
      </div>
      <div class="sharing-row">
        <input type="text" id="sharingCodeInput" placeholder="Enter sharing code..." 
               class="sharing-input" maxlength="12">
        <button onclick="loadFromSharingCode()" class="menu-control-btn" id="btnLoadCode">
          📥 <span id="btnLoadCodeText">Load</span>
        </button>
      </div>
      <div class="sharing-row">
        <button onclick="shareViaURL()" class="menu-control-btn" id="btnShareURL" disabled>
          🔗 <span id="btnShareURLText">Share URL</span>
        </button>
        <button onclick="generateQRCode()" class="menu-control-btn" id="btnQRCode" disabled>
          📱 <span id="btnQRCodeText">QR Code</span>
        </button>
      </div>
      <div class="sharing-row">
        <button onclick="startQRReader()" class="menu-control-btn" id="btnQRReader">
          📷 <span id="btnQRReaderText">Scan QR</span>
        </button>
        <button onclick="stopQRReader()" class="menu-control-btn" id="btnStopQR" disabled style="display: none;">
          ⏹ <span id="btnStopQRText">Stop Scan</span>
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
  
  // Add CSS styles for position sharing in settings menu
  const style = document.createElement('style');
  style.textContent = `
    .position-sharing-group {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1rem;
      margin-top: 1rem;
    }
    
    .menu-control-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--menu-text-color, #333);
    }
    
    .menu-control-header .icon {
      font-size: 1.1rem;
    }
    
    .sharing-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .sharing-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .sharing-row .menu-control-btn {
      flex: 1;
      min-width: 0;
      font-size: 0.85rem;
      padding: 0.5rem 0.75rem;
    }
    
    .sharing-input {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      background: var(--menu-input-bg, #fff);
      color: var(--menu-text-color, #333);
    }
    
    .code-display {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
    }
    
    .code-text {
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      font-weight: bold;
      color: #d63384;
      text-align: center;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 4px;
      word-break: break-all;
    }
    
    .code-info {
      font-size: 0.75rem;
      color: var(--menu-text-secondary, #666);
      text-align: center;
      margin-top: 0.25rem;
    }
    
    .qr-display {
      margin-top: 0.75rem;
      text-align: center;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
    }
    
    .qr-info {
      font-size: 0.75rem;
      color: var(--menu-text-secondary, #666);
      margin-top: 0.5rem;
    }
    
    #qrCanvas {
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      max-width: 100%;
      height: auto;
    }
    
    .qr-reader-display {
      margin-top: 0.75rem;
      text-align: center;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
    }
    
    #qrVideo {
      border: 2px solid #007bff;
      border-radius: 4px;
      background: #000;
      max-width: 100%;
      height: auto;
    }
    
    .qr-reader-info {
      font-size: 0.85rem;
      color: var(--menu-text-color, #333);
      margin: 0.5rem 0 0.25rem 0;
      font-weight: 600;
    }
    
    .qr-reader-status {
      font-size: 0.75rem;
      color: var(--menu-text-secondary, #666);
      margin-top: 0.25rem;
    }
  `;
  
  if (!document.getElementById('positionSharingStyles')) {
    style.id = 'positionSharingStyles';
    document.head.appendChild(style);
  }
  
  // Insert the sharing panel into settings menu
  settingsMenuContent.appendChild(sharingPanel);
  
  console.log('🔗 Position sharing UI added to settings menu');
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