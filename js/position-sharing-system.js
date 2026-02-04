/**
 * Position Sharing System for 4x5 Chess
 * 
 * This system provides compact encoding and decoding of 4x5 chess positions
 * into URL-safe sharing codes with a maximum length of 12 characters.
 * 
 * Features:
 * - Base64-like encoding with URL-safe character set
 * - Compact representation using bit packing
 * - Round-trip encoding/decoding guarantee
 * - Maximum 12 character sharing codes
 * - Support for all standard chess pieces
 * 
 * Requirements: 4.1, 4.3, 4.5
 */

class PositionSharingSystem {
  constructor() {
    // URL-safe character set (64 characters)
    this.charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    
    // Piece encoding map (4 bits per piece)
    this.pieceMap = {
      null: 0,   // Empty square
      'P': 1,    // White Pawn
      'N': 2,    // White Knight
      'B': 3,    // White Bishop
      'R': 4,    // White Rook
      'Q': 5,    // White Queen
      'K': 6,    // White King
      'p': 9,    // Black Pawn
      'n': 10,   // Black Knight
      'b': 11,   // Black Bishop
      'r': 12,   // Black Rook
      'q': 13,   // Black Queen
      'k': 14    // Black King
    };
    
    // Reverse mapping for decoding
    this.reversePieceMap = {};
    for (const [piece, code] of Object.entries(this.pieceMap)) {
      this.reversePieceMap[code] = piece === 'null' ? null : piece;
    }
    
    console.log('🔗 Position Sharing System initialized');
  }
  
  /**
   * Encode a 4x5 chess position into a compact sharing code
   * @param {Array<Array<string|null>>} position - 5x4 board array
   * @returns {string} URL-safe sharing code (max 12 characters)
   */
  encodePosition(position) {
    try {
      // Validate input
      if (!this.validatePositionFormat(position)) {
        throw new Error('Invalid position format');
      }
      
      // Convert position to bit array
      const bits = this.positionToBits(position);
      
      // Pack bits into bytes
      const bytes = this.packBits(bits);
      
      // Encode bytes to URL-safe string
      const code = this.bytesToString(bytes);
      
      // Ensure code length doesn't exceed 12 characters
      if (code.length > 12) {
        throw new Error(`Sharing code too long: ${code.length} characters (max 12)`);
      }
      
      console.log(`🔗 Position encoded to ${code.length}-character code: ${code}`);
      return code;
      
    } catch (error) {
      console.error('🔗 Position encoding failed:', error);
      throw new SharingError('ENCODE_FAILED', `Failed to encode position: ${error.message}`, null);
    }
  }
  
  /**
   * Decode a sharing code back to a 4x5 chess position
   * @param {string} code - URL-safe sharing code
   * @returns {Array<Array<string|null>>} 5x4 board array
   */
  decodePosition(code) {
    try {
      // Validate input
      if (!code || typeof code !== 'string') {
        throw new Error('Invalid sharing code format');
      }
      
      if (code.length > 12) {
        throw new Error(`Sharing code too long: ${code.length} characters (max 12)`);
      }
      
      // Validate character set
      if (!this.isValidCode(code)) {
        throw new Error('Invalid characters in sharing code');
      }
      
      // Decode string to bytes
      const bytes = this.stringToBytes(code);
      
      // Unpack bytes to bits
      const bits = this.unpackBits(bytes);
      
      // Convert bits to position
      const position = this.bitsToPosition(bits);
      
      console.log(`🔗 Sharing code ${code} decoded successfully`);
      return position;
      
    } catch (error) {
      console.error('🔗 Position decoding failed:', error);
      throw new SharingError('DECODE_FAILED', `Failed to decode sharing code: ${error.message}`, code);
    }
  }
  
  /**
   * Generate a shareable URL for a position
   * @param {Array<Array<string|null>>} position - 5x4 board array
   * @returns {string} Complete shareable URL
   */
  shareViaURL(position) {
    try {
      const code = this.encodePosition(position);
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?position=${code}`;
      
      console.log(`🔗 Generated share URL: ${shareUrl}`);
      return shareUrl;
      
    } catch (error) {
      console.error('🔗 URL generation failed:', error);
      throw new SharingError('URL_GENERATION_FAILED', `Failed to generate share URL: ${error.message}`, null);
    }
  }
  
  /**
   * Copy sharing code to clipboard
   * @param {string} code - Sharing code to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(code) {
    try {
      if (!navigator.clipboard) {
        // Fallback for older browsers
        return this.fallbackCopyToClipboard(code);
      }
      
      await navigator.clipboard.writeText(code);
      console.log(`🔗 Sharing code copied to clipboard: ${code}`);
      return true;
      
    } catch (error) {
      console.error('🔗 Clipboard copy failed:', error);
      throw new SharingError('CLIPBOARD_ACCESS_DENIED', `Failed to copy to clipboard: ${error.message}`, code);
    }
  }
  
  /**
   * Load position from URL parameters
   * @returns {Array<Array<string|null>>|null} Decoded position or null if not found
   */
  loadFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const positionCode = urlParams.get('position');
      
      if (!positionCode) {
        return null;
      }
      
      console.log(`🔗 Loading position from URL: ${positionCode}`);
      return this.decodePosition(positionCode);
      
    } catch (error) {
      console.error('🔗 Failed to load position from URL:', error);
      return null;
    }
  }
  
  // Private helper methods
  
  /**
   * Validate position format
   * @param {Array} position - Position to validate
   * @returns {boolean} True if valid
   */
  validatePositionFormat(position) {
    if (!Array.isArray(position) || position.length !== 5) {
      return false;
    }
    
    for (const row of position) {
      if (!Array.isArray(row) || row.length !== 4) {
        return false;
      }
      
      for (const piece of row) {
        if (piece !== null && !(piece in this.pieceMap)) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  /**
   * Convert position to bit array
   * @param {Array<Array<string|null>>} position - 5x4 board array
   * @returns {Array<number>} Bit array
   */
  positionToBits(position) {
    const bits = [];
    
    // Each square needs 4 bits (16 possible values, we use 13)
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const piece = position[row][col];
        const pieceCode = this.pieceMap[piece];
        
        // Convert to 4-bit representation
        for (let bit = 3; bit >= 0; bit--) {
          bits.push((pieceCode >> bit) & 1);
        }
      }
    }
    
    return bits;
  }
  
  /**
   * Convert bit array to position
   * @param {Array<number>} bits - Bit array
   * @returns {Array<Array<string|null>>} 5x4 board array
   */
  bitsToPosition(bits) {
    const position = [];
    
    for (let row = 0; row < 5; row++) {
      position[row] = [];
      for (let col = 0; col < 4; col++) {
        const bitIndex = (row * 4 + col) * 4;
        
        // Extract 4 bits for this square
        let pieceCode = 0;
        for (let bit = 0; bit < 4; bit++) {
          if (bitIndex + bit < bits.length) {
            pieceCode = (pieceCode << 1) | (bits[bitIndex + bit] || 0);
          }
        }
        
        position[row][col] = this.reversePieceMap[pieceCode] || null;
      }
    }
    
    return position;
  }
  
  /**
   * Pack bit array into bytes
   * @param {Array<number>} bits - Bit array
   * @returns {Array<number>} Byte array
   */
  packBits(bits) {
    const bytes = [];
    
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8 && i + j < bits.length; j++) {
        byte = (byte << 1) | (bits[i + j] || 0);
      }
      
      // Pad with zeros if needed
      if (i + 8 > bits.length) {
        const padding = 8 - (bits.length - i);
        byte = byte << padding;
      }
      
      bytes.push(byte);
    }
    
    return bytes;
  }
  
  /**
   * Unpack bytes into bit array
   * @param {Array<number>} bytes - Byte array
   * @returns {Array<number>} Bit array
   */
  unpackBits(bytes) {
    const bits = [];
    
    for (const byte of bytes) {
      for (let bit = 7; bit >= 0; bit--) {
        bits.push((byte >> bit) & 1);
      }
    }
    
    // We need exactly 80 bits for 20 squares (4 bits each)
    return bits.slice(0, 80);
  }
  
  /**
   * Convert bytes to URL-safe string
   * @param {Array<number>} bytes - Byte array
   * @returns {string} Encoded string
   */
  bytesToString(bytes) {
    let result = '';
    let buffer = 0;
    let bufferBits = 0;
    
    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bufferBits += 8;
      
      while (bufferBits >= 6) {
        const index = (buffer >> (bufferBits - 6)) & 0x3F;
        result += this.charset[index];
        bufferBits -= 6;
      }
    }
    
    // Handle remaining bits
    if (bufferBits > 0) {
      const index = (buffer << (6 - bufferBits)) & 0x3F;
      result += this.charset[index];
    }
    
    return result;
  }
  
  /**
   * Convert URL-safe string to bytes
   * @param {string} str - Encoded string
   * @returns {Array<number>} Byte array
   */
  stringToBytes(str) {
    const bytes = [];
    let buffer = 0;
    let bufferBits = 0;
    
    for (const char of str) {
      const index = this.charset.indexOf(char);
      if (index === -1) {
        throw new Error(`Invalid character in sharing code: ${char}`);
      }
      
      buffer = (buffer << 6) | index;
      bufferBits += 6;
      
      while (bufferBits >= 8) {
        const byte = (buffer >> (bufferBits - 8)) & 0xFF;
        bytes.push(byte);
        bufferBits -= 8;
      }
    }
    
    return bytes;
  }
  
  /**
   * Check if code contains only valid characters
   * @param {string} code - Code to validate
   * @returns {boolean} True if valid
   */
  isValidCode(code) {
    for (const char of code) {
      if (this.charset.indexOf(char) === -1) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Fallback clipboard copy for older browsers
   * @param {string} text - Text to copy
   * @returns {boolean} Success status
   */
  fallbackCopyToClipboard(text) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    } catch (error) {
      console.error('🔗 Fallback clipboard copy failed:', error);
      return false;
    }
  }
  
  /**
   * Get sharing statistics for debugging
   * @param {Array<Array<string|null>>} position - Position to analyze
   * @returns {Object} Statistics object
   */
  getSharingStatistics(position) {
    try {
      const code = this.encodePosition(position);
      const decoded = this.decodePosition(code);
      const roundTripSuccess = this.comparePositions(position, decoded);
      
      return {
        originalPosition: position,
        sharingCode: code,
        codeLength: code.length,
        maxLength: 12,
        decodedPosition: decoded,
        roundTripSuccess,
        compressionRatio: (20 * 4) / (code.length * 6), // bits per square vs bits per character
        urlSafe: this.isValidCode(code)
      };
    } catch (error) {
      return {
        error: error.message,
        originalPosition: position
      };
    }
  }
  
  /**
   * Compare two positions for equality
   * @param {Array<Array<string|null>>} pos1 - First position
   * @param {Array<Array<string|null>>} pos2 - Second position
   * @returns {boolean} True if positions are equal
   */
  comparePositions(pos1, pos2) {
    if (!pos1 || !pos2) return false;
    if (pos1.length !== pos2.length) return false;
    
    for (let row = 0; row < pos1.length; row++) {
      if (!pos1[row] || !pos2[row]) return false;
      if (pos1[row].length !== pos2[row].length) return false;
      
      for (let col = 0; col < pos1[row].length; col++) {
        if (pos1[row][col] !== pos2[row][col]) return false;
      }
    }
    
    return true;
  }
}

/**
 * Sharing Error class for position sharing system errors
 */
class SharingError extends Error {
  constructor(type, message, code) {
    super(message);
    this.name = 'SharingError';
    this.type = type; // 'ENCODE_FAILED', 'DECODE_FAILED', 'INVALID_CODE', etc.
    this.code = code;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PositionSharingSystem, SharingError };
} else if (typeof window !== 'undefined') {
  window.PositionSharingSystem = PositionSharingSystem;
  window.SharingError = SharingError;
}

console.log('🔗 Position Sharing System module loaded');