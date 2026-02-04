/**
 * QR Code Integration Tests
 * 
 * Unit tests for QR code generation and integration with position sharing system.
 * Tests both individual components and integration scenarios.
 * 
 * Requirements: 4.4 (QR code integration)
 */

describe('QR Code Integration', () => {
  let qrGenerator;
  let sharingSystem;
  let mockCanvas;
  let mockContext;
  
  beforeEach(() => {
    // Create mock canvas and context
    mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn()
    };
    
    mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => mockContext)
    };
    
    // Initialize systems
    qrGenerator = new QRCodeGenerator();
    sharingSystem = new PositionSharingSystem();
  });
  
  describe('QR Code Generation', () => {
    test('should generate QR code for simple text', async () => {
      const testText = 'ABC123';
      const success = await qrGenerator.generateQRCode(testText, mockCanvas);
      
      expect(success).toBe(true);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
    
    test('should generate QR code for URL', async () => {
      const testUrl = 'https://example.com/position=ABC123';
      const success = await qrGenerator.generateQRCode(testUrl, mockCanvas);
      
      expect(success).toBe(true);
      expect(mockCanvas.width).toBeGreaterThan(0);
      expect(mockCanvas.height).toBeGreaterThan(0);
    });
    
    test('should handle empty text gracefully', async () => {
      const success = await qrGenerator.generateQRCode('', mockCanvas);
      
      expect(success).toBe(false);
      // Should draw error QR
      expect(mockContext.fillText).toHaveBeenCalledWith('⚠', 100, 80);
    });
    
    test('should handle null canvas gracefully', async () => {
      const success = await qrGenerator.generateQRCode('test', null);
      
      expect(success).toBe(false);
    });
  });
  
  describe('QR Code Matrix Generation', () => {
    test('should generate correct matrix size for short text', () => {
      const matrix = qrGenerator.generateQRMatrix('ABC123', 'M');
      const expectedSize = qrGenerator.calculateQRSize(6);
      
      expect(matrix).toHaveLength(expectedSize);
      expect(matrix[0]).toHaveLength(expectedSize);
    });
    
    test('should generate correct matrix size for medium text', () => {
      const text = 'https://example.com/position=ABC123';
      const matrix = qrGenerator.generateQRMatrix(text, 'M');
      const expectedSize = qrGenerator.calculateQRSize(text.length);
      
      expect(matrix).toHaveLength(expectedSize);
      expect(matrix[0]).toHaveLength(expectedSize);
    });
    
    test('should include finder patterns', () => {
      const matrix = qrGenerator.generateQRMatrix('test', 'M');
      const size = matrix.length;
      
      // Check top-left finder pattern
      expect(matrix[0][0]).toBe(true);
      expect(matrix[0][6]).toBe(true);
      expect(matrix[6][0]).toBe(true);
      expect(matrix[6][6]).toBe(true);
      
      // Check top-right finder pattern
      expect(matrix[0][size - 7]).toBe(true);
      expect(matrix[0][size - 1]).toBe(true);
      
      // Check bottom-left finder pattern
      expect(matrix[size - 7][0]).toBe(true);
      expect(matrix[size - 1][0]).toBe(true);
    });
    
    test('should include timing patterns', () => {
      const matrix = qrGenerator.generateQRMatrix('test', 'M');
      const size = matrix.length;
      
      // Check horizontal timing pattern
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[6][i]).toBe((i % 2) === 0);
      }
      
      // Check vertical timing pattern
      for (let i = 8; i < size - 8; i++) {
        expect(matrix[i][6]).toBe((i % 2) === 0);
      }
    });
  });
  
  describe('QR Code Size Calculation', () => {
    test('should return correct size for different data lengths', () => {
      expect(qrGenerator.calculateQRSize(10)).toBe(21);
      expect(qrGenerator.calculateQRSize(30)).toBe(25);
      expect(qrGenerator.calculateQRSize(50)).toBe(29);
      expect(qrGenerator.calculateQRSize(80)).toBe(33);
    });
    
    test('should handle edge cases', () => {
      expect(qrGenerator.calculateQRSize(0)).toBe(21);
      expect(qrGenerator.calculateQRSize(25)).toBe(21);
      expect(qrGenerator.calculateQRSize(26)).toBe(25);
    });
  });
  
  describe('QR Data Validation', () => {
    test('should validate sharing URLs', () => {
      expect(qrGenerator.validateQRData('https://example.com/position=ABC123')).toBe(true);
      expect(qrGenerator.validateQRData('http://localhost:8080/?position=XYZ789')).toBe(true);
    });
    
    test('should validate direct sharing codes', () => {
      expect(qrGenerator.validateQRData('ABC123')).toBe(true);
      expect(qrGenerator.validateQRData('XYZ-_789')).toBe(true);
      expect(qrGenerator.validateQRData('a1B2c3D4')).toBe(true);
    });
    
    test('should reject invalid data', () => {
      expect(qrGenerator.validateQRData('')).toBe(false);
      expect(qrGenerator.validateQRData(null)).toBe(false);
      expect(qrGenerator.validateQRData('TOOLONGCODE123456')).toBe(false);
      expect(qrGenerator.validateQRData('invalid@chars!')).toBe(false);
    });
  });
  
  describe('Position Code Extraction', () => {
    test('should extract code from URL', () => {
      const url = 'https://example.com/position=ABC123';
      const code = qrGenerator.extractPositionCode(url);
      expect(code).toBe('ABC123');
    });
    
    test('should extract code from URL with query params', () => {
      const url = 'https://example.com/game?position=XYZ789&other=param';
      const code = qrGenerator.extractPositionCode(url);
      expect(code).toBe('XYZ789');
    });
    
    test('should return direct code as-is', () => {
      const code = qrGenerator.extractPositionCode('ABC123');
      expect(code).toBe('ABC123');
    });
    
    test('should return null for invalid data', () => {
      expect(qrGenerator.extractPositionCode('')).toBe(null);
      expect(qrGenerator.extractPositionCode('invalid-url')).toBe(null);
      expect(qrGenerator.extractPositionCode('https://example.com/no-position')).toBe(null);
    });
  });
  
  describe('Position Sharing Integration', () => {
    let testPosition;
    
    beforeEach(() => {
      testPosition = [
        ['r', 'n', 'b', 'q'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'K']
      ];
    });
    
    test('should generate QR code for position', async () => {
      const shareCode = sharingSystem.encodePosition(testPosition);
      const shareUrl = `https://example.com/position=${shareCode}`;
      
      const success = await qrGenerator.generatePositionQR(shareUrl, mockCanvas);
      
      expect(success).toBe(true);
      expect(shareCode.length).toBeLessThanOrEqual(12);
    });
    
    test('should generate mobile-optimized QR code', async () => {
      const shareCode = sharingSystem.encodePosition(testPosition);
      const shareUrl = `https://example.com/position=${shareCode}`;
      
      const success = await qrGenerator.generateMobileQR(shareUrl, mockCanvas);
      
      expect(success).toBe(true);
      // Mobile QR should be larger
      expect(mockCanvas.width).toBeGreaterThanOrEqual(200);
      expect(mockCanvas.height).toBeGreaterThanOrEqual(200);
    });
    
    test('should maintain round-trip integrity', async () => {
      const originalPosition = testPosition;
      const shareCode = sharingSystem.encodePosition(originalPosition);
      const shareUrl = `https://example.com/position=${shareCode}`;
      
      // Generate QR code
      const qrSuccess = await qrGenerator.generatePositionQR(shareUrl, mockCanvas);
      expect(qrSuccess).toBe(true);
      
      // Extract code from URL
      const extractedCode = qrGenerator.extractPositionCode(shareUrl);
      expect(extractedCode).toBe(shareCode);
      
      // Decode position
      const decodedPosition = sharingSystem.decodePosition(extractedCode);
      const positionsMatch = sharingSystem.comparePositions(originalPosition, decodedPosition);
      
      expect(positionsMatch).toBe(true);
    });
  });
  
  describe('QR Statistics', () => {
    test('should provide accurate statistics', () => {
      const testText = 'https://example.com/position=ABC123';
      mockCanvas.width = 250;
      mockCanvas.height = 250;
      
      const stats = qrGenerator.getQRStatistics(testText, mockCanvas);
      
      expect(stats.inputText).toBe(testText);
      expect(stats.inputLength).toBe(testText.length);
      expect(stats.qrSize).toBeGreaterThan(0);
      expect(stats.canvasSize).toBe('250x250');
      expect(stats.estimatedScanDistance).toMatch(/\d+-\d+cm/);
      expect(stats.mobileOptimized).toBe(true);
    });
    
    test('should estimate scan distance correctly', () => {
      expect(qrGenerator.estimateScanDistance(300)).toBe('10-50cm');
      expect(qrGenerator.estimateScanDistance(200)).toBe('15-40cm');
      expect(qrGenerator.estimateScanDistance(150)).toBe('20-30cm');
      expect(qrGenerator.estimateScanDistance(100)).toBe('25-35cm');
    });
  });
  
  describe('Error Handling', () => {
    test('should handle QR generation errors gracefully', async () => {
      // Test with invalid canvas
      const invalidCanvas = { getContext: () => null };
      const success = await qrGenerator.generateQRCode('test', invalidCanvas);
      
      expect(success).toBe(false);
    });
    
    test('should draw error QR on failure', async () => {
      const success = await qrGenerator.generateQRCode('', mockCanvas);
      
      expect(success).toBe(false);
      expect(mockContext.fillText).toHaveBeenCalledWith('⚠', 100, 80);
      expect(mockContext.fillText).toHaveBeenCalledWith('QR Generation', 100, 120);
      expect(mockContext.fillText).toHaveBeenCalledWith('Failed', 100, 140);
    });
    
    test('should handle camera access errors', async () => {
      // Mock navigator without camera support
      const originalNavigator = global.navigator;
      global.navigator = {};
      
      const mockVideo = { srcObject: null };
      
      await expect(qrGenerator.readQRFromCamera(mockVideo))
        .rejects.toThrow('Camera access not supported');
      
      global.navigator = originalNavigator;
    });
  });
  
  describe('Mobile Features', () => {
    test('should stop camera stream properly', () => {
      const mockTrack = { stop: jest.fn() };
      const mockVideo = {
        srcObject: {
          getTracks: () => [mockTrack]
        }
      };
      
      qrGenerator.stopCamera(mockVideo);
      
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockVideo.srcObject).toBe(null);
    });
    
    test('should handle video without stream', () => {
      const mockVideo = { srcObject: null };
      
      // Should not throw error
      expect(() => qrGenerator.stopCamera(mockVideo)).not.toThrow();
    });
  });
});

// Property-based tests for QR code integration
describe('QR Code Property Tests', () => {
  let qrGenerator;
  let sharingSystem;
  
  beforeEach(() => {
    qrGenerator = new QRCodeGenerator();
    sharingSystem = new PositionSharingSystem();
  });
  
  // Property 13: QR Kod Round-trip
  test('Property 13: QR kod round-trip özelliği', async () => {
    // Test with multiple random positions
    const testCases = [
      // Standard starting position
      [
        ['r', 'n', 'b', 'q'],
        ['p', 'p', 'p', 'p'],
        [null, null, null, null],
        ['P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'K']
      ],
      // Empty board
      [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ],
      // Only kings
      [
        [null, null, null, null],
        [null, null, null, null],
        [null, 'k', 'K', null],
        [null, null, null, null],
        [null, null, null, null]
      ],
      // Complex position
      [
        ['r', null, 'b', 'q'],
        [null, 'p', null, 'p'],
        ['P', null, 'n', null],
        [null, 'P', null, 'P'],
        ['R', 'N', 'B', 'K']
      ]
    ];
    
    for (const position of testCases) {
      try {
        // Encode position
        const shareCode = sharingSystem.encodePosition(position);
        const shareUrl = `https://example.com/position=${shareCode}`;
        
        // Generate QR code (mock canvas)
        const mockCanvas = {
          width: 0,
          height: 0,
          getContext: () => ({
            fillStyle: '',
            fillRect: () => {},
            fillText: () => {}
          })
        };
        
        const qrSuccess = await qrGenerator.generatePositionQR(shareUrl, mockCanvas);
        expect(qrSuccess).toBe(true);
        
        // Extract code from QR data
        const extractedCode = qrGenerator.extractPositionCode(shareUrl);
        expect(extractedCode).toBe(shareCode);
        
        // Decode position
        const decodedPosition = sharingSystem.decodePosition(extractedCode);
        
        // Verify round-trip
        const positionsMatch = sharingSystem.comparePositions(position, decodedPosition);
        expect(positionsMatch).toBe(true);
        
      } catch (error) {
        throw new Error(`QR round-trip failed for position: ${JSON.stringify(position)}, Error: ${error.message}`);
      }
    }
  });
  
  // Property test for QR data validation
  test('Property: QR data validation consistency', () => {
    const validCodes = ['ABC123', 'XYZ789', 'a1B2c3D4', 'Test-_123'];
    const validUrls = [
      'https://example.com/position=ABC123',
      'http://localhost:8080/?position=XYZ789'
    ];
    const invalidData = ['', null, 'TOOLONGCODE123456', 'invalid@chars!'];
    
    // All valid codes should pass validation
    validCodes.forEach(code => {
      expect(qrGenerator.validateQRData(code)).toBe(true);
    });
    
    // All valid URLs should pass validation
    validUrls.forEach(url => {
      expect(qrGenerator.validateQRData(url)).toBe(true);
    });
    
    // All invalid data should fail validation
    invalidData.forEach(data => {
      expect(qrGenerator.validateQRData(data)).toBe(false);
    });
  });
  
  // Property test for QR size calculation
  test('Property: QR size increases with data length', () => {
    const testLengths = [5, 15, 25, 35, 50, 70, 85];
    let previousSize = 0;
    
    testLengths.forEach(length => {
      const size = qrGenerator.calculateQRSize(length);
      expect(size).toBeGreaterThanOrEqual(previousSize);
      expect(size).toBeGreaterThan(0);
      expect(size % 4).toBe(1); // QR sizes are always 4n+1
      previousSize = size;
    });
  });
});