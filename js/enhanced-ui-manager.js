/**
 * Enhanced UI Manager for 4x5 Chess Piece Setup
 * Provides modern interface components, responsive design system, and smooth animations
 * 
 * Requirements: 1.1, 1.2, 1.5
 * - Modern arayüz bileşenlerini implement et
 * - Responsive breakpoint sistemi ekle  
 * - Animasyon ve geçiş efektleri ekle
 */

class EnhancedPieceSetupUI {
  constructor() {
    this.currentTheme = 'modern';
    this.animationEnabled = true;
    this.responsiveBreakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    };
    
    // Animation settings
    this.animationDuration = {
      fast: 200,
      normal: 300,
      slow: 500
    };
    
    // Visual feedback states
    this.feedbackStates = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    
    // Current device type
    this.deviceType = this.detectDeviceType();
    
    // Initialize on construction
    this.initializeModernUI();
    this.setupResponsiveHandlers();
  }
  
  /**
   * Initialize modern UI components and styling
   */
  initializeModernUI() {
    console.log('🎨 Initializing Enhanced UI Manager...');
    
    // Apply modern theme
    this.applyModernTheme();
    
    // Initialize visual feedback system
    this.initializeVisualFeedback();
    
    // Setup animation system
    this.initializeAnimations();
    
    // Apply responsive layout
    this.handleResponsiveLayout();
    
    console.log('✨ Enhanced UI Manager initialized successfully');
  }
  
  /**
   * Apply modern theme styling to piece setup modal
   */
  applyModernTheme() {
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) return;
    
    // Add modern theme class
    modal.classList.add('enhanced-theme');
    
    // Apply modern styling via CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--enhanced-primary', '#4f46e5');
    root.style.setProperty('--enhanced-secondary', '#06b6d4');
    root.style.setProperty('--enhanced-success', '#10b981');
    root.style.setProperty('--enhanced-warning', '#f59e0b');
    root.style.setProperty('--enhanced-error', '#ef4444');
    root.style.setProperty('--enhanced-surface', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--enhanced-border', 'rgba(255, 255, 255, 0.1)');
    root.style.setProperty('--enhanced-shadow', '0 10px 25px rgba(0, 0, 0, 0.3)');
    root.style.setProperty('--enhanced-radius', '12px');
    root.style.setProperty('--enhanced-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
  }
  
  /**
   * Initialize visual feedback system for drag & drop and interactions
   */
  initializeVisualFeedback() {
    // Create feedback overlay container
    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = 'enhanced-feedback-container';
    feedbackContainer.className = 'enhanced-feedback-container';
    document.body.appendChild(feedbackContainer);
    
    // Initialize drag feedback
    this.initializeDragFeedback();
    
    // Initialize hover effects
    this.initializeHoverEffects();
    
    // Initialize click feedback
    this.initializeClickFeedback();
  }
  
  /**
   * Initialize drag & drop visual feedback
   */
  initializeDragFeedback() {
    // Enhanced drag start feedback
    document.addEventListener('dragstart', (e) => {
      if (e.target.classList.contains('palette-piece') || e.target.classList.contains('setup-piece')) {
        this.showDragFeedback(e.target, 'start');
        this.animateElement(e.target, 'drag-start');
      }
    });
    
    // Enhanced drag over feedback
    document.addEventListener('dragover', (e) => {
      if (e.target.classList.contains('setup-square')) {
        e.preventDefault();
        this.showDragFeedback(e.target, 'over');
      }
    });
    
    // Enhanced drag leave feedback
    document.addEventListener('dragleave', (e) => {
      if (e.target.classList.contains('setup-square')) {
        this.showDragFeedback(e.target, 'leave');
      }
    });
    
    // Enhanced drop feedback
    document.addEventListener('drop', (e) => {
      if (e.target.classList.contains('setup-square')) {
        e.preventDefault();
        this.showDragFeedback(e.target, 'drop');
        this.showSuccessAnimation(e.target);
      }
    });
    
    // Enhanced drag end feedback
    document.addEventListener('dragend', (e) => {
      if (e.target.classList.contains('palette-piece') || e.target.classList.contains('setup-piece')) {
        this.showDragFeedback(e.target, 'end');
      }
    });
  }
  
  /**
   * Initialize hover effects for interactive elements
   */
  initializeHoverEffects() {
    // Palette pieces hover
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('palette-piece')) {
        this.animateElement(e.target, 'hover-in');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('palette-piece')) {
        this.animateElement(e.target, 'hover-out');
      }
    });
    
    // Setup squares hover
    document.addEventListener('mouseover', (e) => {
      if (e.target.classList.contains('setup-square')) {
        this.animateElement(e.target, 'square-hover-in');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.classList.contains('setup-square')) {
        this.animateElement(e.target, 'square-hover-out');
      }
    });
  }
  
  /**
   * Initialize click feedback for buttons and interactive elements
   */
  initializeClickFeedback() {
    document.addEventListener('click', (e) => {
      // Button click feedback
      if (e.target.tagName === 'BUTTON') {
        this.showClickFeedback(e.target);
      }
      
      // Palette piece selection feedback
      if (e.target.classList.contains('palette-piece')) {
        this.showSelectionFeedback(e.target);
      }
    });
  }
  
  /**
   * Show drag feedback based on drag state
   */
  showDragFeedback(element, state) {
    element.classList.remove('drag-start', 'drag-over', 'drag-leave', 'drag-drop', 'drag-end');
    
    switch (state) {
      case 'start':
        element.classList.add('drag-start');
        this.createRippleEffect(element, 'primary');
        break;
      case 'over':
        element.classList.add('drag-over');
        break;
      case 'leave':
        element.classList.remove('drag-over');
        break;
      case 'drop':
        element.classList.add('drag-drop');
        this.createRippleEffect(element, 'success');
        break;
      case 'end':
        element.classList.remove('drag-start');
        break;
    }
  }
  
  /**
   * Show click feedback with ripple effect
   */
  showClickFeedback(element) {
    this.createRippleEffect(element, 'primary');
    this.animateElement(element, 'click');
  }
  
  /**
   * Show selection feedback for palette pieces
   */
  showSelectionFeedback(element) {
    // Remove selection from other pieces
    document.querySelectorAll('.palette-piece.selected').forEach(piece => {
      piece.classList.remove('selected');
      this.animateElement(piece, 'deselect');
    });
    
    // Add selection to current piece
    element.classList.add('selected');
    this.animateElement(element, 'select');
    this.createRippleEffect(element, 'secondary');
  }
  
  /**
   * Show success animation for successful operations
   */
  showSuccessAnimation(element) {
    this.animateElement(element, 'success');
    this.createParticleEffect(element, 'success');
  }
  
  /**
   * Create ripple effect at click/interaction point
   */
  createRippleEffect(element, type = 'primary') {
    const ripple = document.createElement('div');
    ripple.className = `enhanced-ripple enhanced-ripple-${type}`;
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  }
  
  /**
   * Create particle effect for special interactions
   */
  createParticleEffect(element, type = 'success') {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = `enhanced-particle enhanced-particle-${type}`;
      
      const angle = (i / 6) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      
      document.body.appendChild(particle);
      
      // Animate particle
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
      ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }).onfinish = () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      };
    }
  }
  
  /**
   * Animate element with predefined animations
   */
  animateElement(element, animationType) {
    if (!this.animationEnabled) return;
    
    element.classList.remove('enhanced-animate');
    element.classList.add('enhanced-animate', `enhanced-${animationType}`);
    
    setTimeout(() => {
      element.classList.remove('enhanced-animate', `enhanced-${animationType}`);
    }, this.animationDuration.normal);
  }
  
  /**
   * Initialize animation system
   */
  initializeAnimations() {
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = this.getAnimationCSS();
    document.head.appendChild(style);
  }
  
  /**
   * Get CSS for animations
   */
  getAnimationCSS() {
    return `
      .enhanced-animate {
        transition: var(--enhanced-transition);
      }
      
      .enhanced-hover-in {
        transform: translateY(-2px) scale(1.05);
        box-shadow: var(--enhanced-shadow);
      }
      
      .enhanced-hover-out {
        transform: translateY(0) scale(1);
        box-shadow: none;
      }
      
      .enhanced-square-hover-in {
        transform: scale(1.02);
        box-shadow: inset 0 0 0 2px var(--enhanced-primary);
      }
      
      .enhanced-square-hover-out {
        transform: scale(1);
        box-shadow: none;
      }
      
      .enhanced-drag-start {
        transform: scale(1.1) rotate(5deg);
        opacity: 0.8;
        z-index: 1000;
      }
      
      .enhanced-click {
        transform: scale(0.95);
      }
      
      .enhanced-select {
        transform: scale(1.1);
        box-shadow: 0 0 20px var(--enhanced-secondary);
      }
      
      .enhanced-deselect {
        transform: scale(1);
        box-shadow: none;
      }
      
      .enhanced-success {
        animation: enhanced-success-pulse 0.6s ease-out;
      }
      
      @keyframes enhanced-success-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); box-shadow: 0 0 20px var(--enhanced-success); }
        100% { transform: scale(1); }
      }
      
      .drag-over {
        background: linear-gradient(45deg, var(--enhanced-primary), var(--enhanced-secondary)) !important;
        transform: scale(1.05);
        box-shadow: inset 0 0 0 3px var(--enhanced-primary);
        animation: enhanced-drag-over-pulse 1s infinite;
      }
      
      @keyframes enhanced-drag-over-pulse {
        0%, 100% { box-shadow: inset 0 0 0 3px var(--enhanced-primary); }
        50% { box-shadow: inset 0 0 0 5px var(--enhanced-primary); }
      }
      
      .enhanced-ripple {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        animation: enhanced-ripple-animation 0.6s ease-out;
      }
      
      .enhanced-ripple-primary {
        background: radial-gradient(circle, var(--enhanced-primary) 0%, transparent 70%);
      }
      
      .enhanced-ripple-secondary {
        background: radial-gradient(circle, var(--enhanced-secondary) 0%, transparent 70%);
      }
      
      .enhanced-ripple-success {
        background: radial-gradient(circle, var(--enhanced-success) 0%, transparent 70%);
      }
      
      @keyframes enhanced-ripple-animation {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
      
      .enhanced-particle {
        position: fixed;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
      }
      
      .enhanced-particle-success {
        background: var(--enhanced-success);
        box-shadow: 0 0 6px var(--enhanced-success);
      }
      
      .enhanced-feedback-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
      }
      
      /* Enhanced theme styles */
      .enhanced-theme .piece-setup-content {
        background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
        border: 2px solid var(--enhanced-primary);
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      }
      
      .enhanced-theme .modal-header {
        background: linear-gradient(135deg, var(--enhanced-primary) 0%, var(--enhanced-secondary) 100%);
      }
      
      .enhanced-theme .palette-piece {
        background: var(--enhanced-surface);
        border: 2px solid var(--enhanced-border);
        backdrop-filter: blur(10px);
      }
      
      .enhanced-theme .palette-piece:hover {
        border-color: var(--enhanced-primary);
        background: rgba(79, 70, 229, 0.2);
      }
      
      .enhanced-theme .palette-piece.selected {
        border-color: var(--enhanced-secondary);
        background: rgba(6, 182, 212, 0.2);
      }
      
      .enhanced-theme .setup-square {
        border: 1px solid var(--enhanced-border);
        backdrop-filter: blur(5px);
      }
      
      .enhanced-theme .palette-tools button {
        background: var(--enhanced-surface);
        border: 1px solid var(--enhanced-border);
        backdrop-filter: blur(10px);
        transition: var(--enhanced-transition);
      }
      
      .enhanced-theme .palette-tools button:hover {
        background: var(--enhanced-primary);
        transform: translateY(-2px);
        box-shadow: var(--enhanced-shadow);
      }
    `;
  }
  
  /**
   * Detect current device type based on screen size
   */
  detectDeviceType() {
    const width = window.innerWidth;
    if (width <= this.responsiveBreakpoints.mobile) {
      return 'mobile';
    } else if (width <= this.responsiveBreakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  /**
   * Handle responsive layout changes
   */
  handleResponsiveLayout() {
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) return;
    
    // Remove existing responsive classes
    modal.classList.remove('enhanced-mobile', 'enhanced-tablet', 'enhanced-desktop');
    
    // Add current device class
    modal.classList.add(`enhanced-${this.deviceType}`);
    
    // Apply device-specific optimizations
    this.applyDeviceOptimizations();
  }
  
  /**
   * Apply device-specific optimizations
   */
  applyDeviceOptimizations() {
    const root = document.documentElement;
    
    switch (this.deviceType) {
      case 'mobile':
        root.style.setProperty('--enhanced-piece-size', '40px');
        root.style.setProperty('--enhanced-square-size', '50px');
        root.style.setProperty('--enhanced-font-size', '1.5rem');
        root.style.setProperty('--enhanced-spacing', '0.5rem');
        break;
      case 'tablet':
        root.style.setProperty('--enhanced-piece-size', '45px');
        root.style.setProperty('--enhanced-square-size', '55px');
        root.style.setProperty('--enhanced-font-size', '1.8rem');
        root.style.setProperty('--enhanced-spacing', '0.75rem');
        break;
      case 'desktop':
        root.style.setProperty('--enhanced-piece-size', '50px');
        root.style.setProperty('--enhanced-square-size', '60px');
        root.style.setProperty('--enhanced-font-size', '2rem');
        root.style.setProperty('--enhanced-spacing', '1rem');
        break;
    }
  }
  
  /**
   * Setup responsive event handlers
   */
  setupResponsiveHandlers() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDeviceType = this.detectDeviceType();
        if (newDeviceType !== this.deviceType) {
          this.deviceType = newDeviceType;
          this.handleResponsiveLayout();
          console.log(`📱 Device type changed to: ${this.deviceType}`);
        }
      }, 250);
    });
  }
  
  /**
   * Update visual feedback for drag & drop operations
   */
  updateVisualFeedback() {
    // This method can be called to refresh visual feedback states
    console.log('🔄 Updating visual feedback...');
  }
  
  /**
   * Animate transitions between states
   */
  animateTransitions() {
    // This method handles smooth transitions between different UI states
    console.log('🎬 Animating transitions...');
  }
  
  /**
   * Show notification with enhanced styling
   */
  showEnhancedNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `enhanced-notification enhanced-notification-${type}`;
    notification.textContent = message;
    
    // Add to feedback container
    const container = document.getElementById('enhanced-feedback-container');
    if (container) {
      container.appendChild(notification);
      
      // Animate in
      notification.animate([
        { transform: 'translateX(100%)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ], {
        duration: this.animationDuration.normal,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
      
      // Remove after duration
      setTimeout(() => {
        notification.animate([
          { transform: 'translateX(0)', opacity: 1 },
          { transform: 'translateX(100%)', opacity: 0 }
        ], {
          duration: this.animationDuration.normal,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        };
      }, duration);
    }
  }
  
  /**
   * Enable or disable animations
   */
  setAnimationEnabled(enabled) {
    this.animationEnabled = enabled;
    const root = document.documentElement;
    root.style.setProperty('--enhanced-transition', enabled ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none');
  }
  
  /**
   * Get current responsive breakpoint
   */
  getCurrentBreakpoint() {
    return this.deviceType;
  }
  
  /**
   * Cleanup method for removing event listeners and elements
   */
  cleanup() {
    const feedbackContainer = document.getElementById('enhanced-feedback-container');
    if (feedbackContainer) {
      feedbackContainer.remove();
    }
    
    console.log('🧹 Enhanced UI Manager cleaned up');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedPieceSetupUI;
}

// Make available globally
window.EnhancedPieceSetupUI = EnhancedPieceSetupUI;