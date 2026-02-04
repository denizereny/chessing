/**
 * Enhanced Piece Setup Integration System
 * 
 * This module integrates all enhanced features with the existing piece setup system:
 * - Enhanced UI Manager
 * - Extended Preset System
 * - Advanced Position Analyzer
 * - Position Sharing System
 * - History Manager
 * - Mobile Optimization
 * - Performance Monitoring
 * 
 * Maintains backward compatibility while providing smooth migration path.
 */

class PieceSetupIntegrationManager {
  constructor() {
    this.initialized = false;
    this.legacyMode = false;
    this.components = {};
    this.migrationState = {
      uiEnhanced: false,
      presetsExtended: false,
      analysisAdvanced: false,
      sharingEnabled: false,
      historyEnabled: false,
      mobileOptimized: false,
      performanceMonitored: false
    };
    
    // Integration configuration
    this.config = {
      enableGradualMigration: true,
      fallbackToLegacy: true,
      preserveUserData: true,
      enhanceExistingUI: true,
      maintainCompatibility: true
    };
    
    console.log('🔧 Piece Setup Integration Manager initialized');
  }
  
  /**
   * Initialize the integration system
   * @param {Object} options - Integration options
   */
  async initialize(options = {}) {
    if (this.initialized) {
      console.log('⚠️ Integration manager already initialized');
      return;
    }
    
    console.log('🚀 Starting Enhanced Piece Setup Integration...');
    
    // Merge options with defaults
    this.config = { ...this.config, ...options };
    
    try {
      // Phase 1: Detect existing system
      await this.detectExistingSystem();
      
      // Phase 2: Initialize enhanced components
      await this.initializeEnhancedComponents();
      
      // Phase 3: Extend existing modal structure
      await this.extendModalStructure();
      
      // Phase 4: Migrate existing functions
      await this.migrateExistingFunctions();
      
      // Phase 5: Setup backward compatibility
      await this.setupBackwardCompatibility();
      
      // Phase 6: Create smooth migration path
      await this.createMigrationPath();
      
      this.initialized = true;
      console.log('✅ Enhanced Piece Setup Integration completed successfully');
      
      // Log integration status
      this.logIntegrationStatus();
      
    } catch (error) {
      console.error('❌ Integration failed:', error);
      await this.fallbackToLegacyMode();
    }
  }
  
  /**
   * Detect existing piece setup system components
   */
  async detectExistingSystem() {
    console.log('🔍 Detecting existing piece setup system...');
    
    const detection = {
      modal: !!document.getElementById('pieceSetupModal'),
      setupBoard: typeof setupBoard !== 'undefined',
      drawFunction: typeof drawSetupBoard === 'function',
      dragDrop: typeof initializeSetupDragDrop === 'function',
      presets: typeof loadPreset === 'function',
      validation: typeof updatePositionStats === 'function'
    };
    
    console.log('📊 System detection results:', detection);
    
    // Determine if we can proceed with integration
    const canIntegrate = detection.modal && detection.setupBoard && detection.drawFunction;
    
    if (!canIntegrate) {
      throw new Error('Required existing components not found for integration');
    }
    
    this.existingSystem = detection;
    console.log('✅ Existing system detected and compatible');
  }
  
  /**
   * Initialize all enhanced components
   */
  async initializeEnhancedComponents() {
    console.log('🔧 Initializing enhanced components...');
    
    // Enhanced UI Manager
    if (typeof EnhancedPieceSetupUI !== 'undefined') {
      try {
        this.components.enhancedUI = new EnhancedPieceSetupUI();
        this.migrationState.uiEnhanced = true;
        console.log('✅ Enhanced UI Manager initialized');
      } catch (error) {
        console.warn('⚠️ Enhanced UI Manager failed to initialize:', error);
      }
    }
    
    // Enhanced Drag & Drop System
    if (typeof EnhancedDragDropSystem !== 'undefined' && this.components.enhancedUI) {
      try {
        this.components.enhancedDragDrop = new EnhancedDragDropSystem(this.components.enhancedUI);
        console.log('✅ Enhanced Drag & Drop System initialized');
      } catch (error) {
        console.warn('⚠️ Enhanced Drag & Drop System failed to initialize:', error);
      }
    }
    
    // Extended Preset Manager
    if (typeof ExtendedPresetManager !== 'undefined') {
      try {
        this.components.extendedPresetManager = new ExtendedPresetManager();
        this.migrationState.presetsExtended = true;
        console.log('✅ Extended Preset Manager initialized');
      } catch (error) {
        console.warn('⚠️ Extended Preset Manager failed to initialize:', error);
      }
    }
    
    // Advanced Position Analyzer
    if (typeof AdvancedPositionAnalyzer !== 'undefined') {
      try {
        this.components.advancedPositionAnalyzer = new AdvancedPositionAnalyzer();
        this.migrationState.analysisAdvanced = true;
        console.log('✅ Advanced Position Analyzer initialized');
      } catch (error) {
        console.warn('⚠️ Advanced Position Analyzer failed to initialize:', error);
      }
    }
    
    // Position Evaluation Report System
    if (typeof PositionEvaluationReport !== 'undefined') {
      try {
        this.components.positionEvaluationReport = new PositionEvaluationReport();
        console.log('✅ Position Evaluation Report System initialized');
      } catch (error) {
        console.warn('⚠️ Position Evaluation Report System failed to initialize:', error);
      }
    }
    
    // Position Sharing System
    if (typeof PositionSharingSystem !== 'undefined') {
      try {
        this.components.positionSharingSystem = new PositionSharingSystem();
        this.migrationState.sharingEnabled = true;
        console.log('✅ Position Sharing System initialized');
      } catch (error) {
        console.warn('⚠️ Position Sharing System failed to initialize:', error);
      }
    }
    
    // Position History Manager
    if (typeof PositionHistoryManager !== 'undefined') {
      try {
        this.components.positionHistoryManager = new PositionHistoryManager();
        this.migrationState.historyEnabled = true;
        console.log('✅ Position History Manager initialized');
      } catch (error) {
        console.warn('⚠️ Position History Manager failed to initialize:', error);
      }
    }
    
    // Position History Interface
    if (typeof PositionHistoryInterface !== 'undefined' && this.components.positionHistoryManager) {
      try {
        this.components.positionHistoryInterface = new PositionHistoryInterface(this.components.positionHistoryManager);
        console.log('✅ Position History Interface initialized');
      } catch (error) {
        console.warn('⚠️ Position History Interface failed to initialize:', error);
      }
    }
    
    // Mobile Optimization Manager
    if (typeof MobileOptimizationManager !== 'undefined') {
      try {
        this.components.mobileOptimizationManager = new MobileOptimizationManager(
          this.components.enhancedUI, 
          this.components.enhancedDragDrop
        );
        this.migrationState.mobileOptimized = true;
        console.log('✅ Mobile Optimization Manager initialized');
      } catch (error) {
        console.warn('⚠️ Mobile Optimization Manager failed to initialize:', error);
      }
    }
    
    // Responsive Layout Manager
    if (typeof ResponsiveLayoutManager !== 'undefined') {
      try {
        this.components.responsiveLayoutManager = new ResponsiveLayoutManager(
          this.components.enhancedUI, 
          this.components.mobileOptimizationManager
        );
        console.log('✅ Responsive Layout Manager initialized');
      } catch (error) {
        console.warn('⚠️ Responsive Layout Manager failed to initialize:', error);
      }
    }
    
    // Performance Monitor
    if (typeof PerformanceMonitor !== 'undefined') {
      try {
        this.components.performanceMonitor = new PerformanceMonitor();
        this.migrationState.performanceMonitored = true;
        console.log('✅ Performance Monitor initialized');
      } catch (error) {
        console.warn('⚠️ Performance Monitor failed to initialize:', error);
      }
    }
    
    // Enhanced Position Validation UI
    if (typeof PositionValidationUI !== 'undefined') {
      try {
        this.components.positionValidationUI = new PositionValidationUI();
        console.log('✅ Enhanced Position Validation UI initialized');
      } catch (error) {
        console.warn('⚠️ Enhanced Position Validation UI failed to initialize:', error);
      }
    }
    
    // Loading Indicator System
    if (typeof LoadingIndicatorSystem !== 'undefined') {
      try {
        this.components.loadingIndicatorSystem = new LoadingIndicatorSystem();
        console.log('✅ Loading Indicator System initialized');
      } catch (error) {
        console.warn('⚠️ Loading Indicator System failed to initialize:', error);
      }
    }
    
    console.log('🔧 Enhanced components initialization completed');
  }
  
  /**
   * Extend existing modal structure with enhanced features
   */
  async extendModalStructure() {
    console.log('🏗️ Extending existing modal structure...');
    
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) {
      throw new Error('Piece setup modal not found');
    }
    
    // Add enhanced features to existing structure
    await this.addEnhancedSections(modal);
    await this.enhanceExistingElements(modal);
    await this.addMobileOptimizations(modal);
    await this.addPerformanceIndicators(modal);
    
    console.log('✅ Modal structure extended successfully');
  }
  
  /**
   * Add enhanced sections to the modal
   */
  async addEnhancedSections(modal) {
    const setupBody = modal.querySelector('.piece-setup-body');
    if (!setupBody) return;
    
    // Add enhanced sharing section
    if (this.migrationState.sharingEnabled) {
      const sharingSection = this.createSharingSection();
      setupBody.appendChild(sharingSection);
    }
    
    // Add position history section
    if (this.migrationState.historyEnabled) {
      const historySection = this.createHistorySection();
      setupBody.appendChild(historySection);
    }
    
    // Add advanced analysis section
    if (this.migrationState.analysisAdvanced) {
      const analysisSection = this.createAdvancedAnalysisSection();
      setupBody.appendChild(analysisSection);
    }
    
    // Add performance monitoring section (if enabled)
    if (this.migrationState.performanceMonitored && this.config.showPerformanceMetrics) {
      const performanceSection = this.createPerformanceSection();
      setupBody.appendChild(performanceSection);
    }
  }
  
  /**
   * Create sharing section
   */
  createSharingSection() {
    const section = document.createElement('div');
    section.className = 'enhanced-sharing-section';
    section.innerHTML = `
      <div class="section-header">
        <h4>🔗 Position Sharing</h4>
        <button class="section-toggle" onclick="toggleSection('sharing')">▾</button>
      </div>
      <div class="section-content" id="sharingContent">
        <div class="sharing-controls">
          <button id="btnGenerateShareCode" onclick="generateShareCode()" class="btn-primary">
            📋 Generate Share Code
          </button>
          <button id="btnGenerateQR" onclick="generateQRCode()" class="btn-secondary">
            📱 Generate QR Code
          </button>
          <button id="btnLoadFromCode" onclick="loadFromShareCode()" class="btn-secondary">
            📥 Load from Code
          </button>
        </div>
        <div class="share-display" id="shareDisplay" style="display: none;">
          <div class="share-code-container">
            <label>Share Code:</label>
            <input type="text" id="shareCodeInput" readonly>
            <button onclick="copyShareCode()" class="btn-copy">📋</button>
          </div>
          <div class="qr-code-container" id="qrCodeContainer" style="display: none;">
            <canvas id="qrCodeCanvas"></canvas>
          </div>
        </div>
      </div>
    `;
    return section;
  }
  
  /**
   * Create history section
   */
  createHistorySection() {
    const section = document.createElement('div');
    section.className = 'enhanced-history-section';
    section.innerHTML = `
      <div class="section-header">
        <h4>🕰️ Position History</h4>
        <button class="section-toggle" onclick="toggleSection('history')">▾</button>
      </div>
      <div class="section-content" id="historyContent">
        <div class="history-controls">
          <button id="btnUndo" onclick="undoPosition()" class="btn-secondary" disabled>
            ↶ Undo
          </button>
          <button id="btnRedo" onclick="redoPosition()" class="btn-secondary" disabled>
            ↷ Redo
          </button>
          <button id="btnClearHistory" onclick="clearHistory()" class="btn-danger">
            🗑️ Clear History
          </button>
        </div>
        <div class="history-list" id="historyList">
          <p class="no-history">No position history yet</p>
        </div>
      </div>
    `;
    return section;
  }
  
  /**
   * Create advanced analysis section
   */
  createAdvancedAnalysisSection() {
    const section = document.createElement('div');
    section.className = 'enhanced-analysis-section';
    section.innerHTML = `
      <div class="section-header">
        <h4>🧠 Advanced Analysis</h4>
        <button class="section-toggle" onclick="toggleSection('analysis')">▾</button>
      </div>
      <div class="section-content" id="analysisContent">
        <div class="analysis-controls">
          <button id="btnAdvancedAnalyze" onclick="performAdvancedAnalysis()" class="btn-primary">
            🔍 Analyze Position
          </button>
          <button id="btnGenerateReport" onclick="generateAnalysisReport()" class="btn-secondary">
            📊 Generate Report
          </button>
        </div>
        <div class="analysis-results" id="analysisResults">
          <div class="analysis-grid">
            <div class="analysis-item">
              <label>Material Balance:</label>
              <span id="advancedMaterialBalance">0</span>
            </div>
            <div class="analysis-item">
              <label>Piece Activity:</label>
              <span id="advancedPieceActivity">-</span>
            </div>
            <div class="analysis-item">
              <label>King Safety:</label>
              <span id="advancedKingSafety">-</span>
            </div>
            <div class="analysis-item">
              <label>Center Control:</label>
              <span id="advancedCenterControl">-</span>
            </div>
            <div class="analysis-item">
              <label>Position Type:</label>
              <span id="advancedPositionType">-</span>
            </div>
          </div>
        </div>
      </div>
    `;
    return section;
  }
  
  /**
   * Create performance monitoring section
   */
  createPerformanceSection() {
    const section = document.createElement('div');
    section.className = 'enhanced-performance-section';
    section.innerHTML = `
      <div class="section-header">
        <h4>⚡ Performance Metrics</h4>
        <button class="section-toggle" onclick="toggleSection('performance')">▾</button>
      </div>
      <div class="section-content collapsed" id="performanceContent">
        <div class="performance-metrics">
          <div class="metric-item">
            <label>Drag Operations:</label>
            <span id="dragPerformance">-</span>
          </div>
          <div class="metric-item">
            <label>Analysis Time:</label>
            <span id="analysisPerformance">-</span>
          </div>
          <div class="metric-item">
            <label>Preset Loading:</label>
            <span id="presetPerformance">-</span>
          </div>
        </div>
        <div class="performance-controls">
          <button onclick="clearPerformanceData()" class="btn-secondary">
            🧹 Clear Data
          </button>
          <button onclick="logPerformanceReport()" class="btn-secondary">
            📊 Log Report
          </button>
        </div>
      </div>
    `;
    return section;
  }
  
  /**
   * Enhance existing elements with new functionality
   */
  async enhanceExistingElements(modal) {
    // Enhance piece palette with advanced features
    await this.enhancePiecePalette(modal);
    
    // Enhance setup board with advanced interactions
    await this.enhanceSetupBoard(modal);
    
    // Enhance preset system
    await this.enhancePresetSystem(modal);
    
    // Enhance validation system
    await this.enhanceValidationSystem(modal);
    
    // Enhance controls
    await this.enhanceControls(modal);
  }
  
  /**
   * Enhance piece palette
   */
  async enhancePiecePalette(modal) {
    const palette = modal.querySelector('.piece-palette');
    if (!palette) return;
    
    // Add enhanced visual feedback
    if (this.components.enhancedUI) {
      palette.classList.add('enhanced-palette');
    }
    
    // Add mobile optimizations
    if (this.components.mobileOptimizationManager) {
      palette.classList.add('mobile-optimized');
    }
  }
  
  /**
   * Enhance setup board
   */
  async enhanceSetupBoard(modal) {
    const boardContainer = modal.querySelector('.setup-board-container');
    if (!boardContainer) return;
    
    // Add enhanced visual indicators
    if (this.components.enhancedUI) {
      boardContainer.classList.add('enhanced-board');
    }
    
    // Add responsive layout support
    if (this.components.responsiveLayoutManager) {
      boardContainer.classList.add('responsive-board');
    }
  }
  
  /**
   * Enhance preset system
   */
  async enhancePresetSystem(modal) {
    const presetSection = modal.querySelector('.user-preset-management');
    if (!presetSection && this.migrationState.presetsExtended) {
      // Preset management already exists in HTML, just enhance it
      const existingPresets = modal.querySelector('.setup-presets');
      if (existingPresets) {
        existingPresets.classList.add('enhanced-presets');
      }
    }
  }
  
  /**
   * Enhance validation system
   */
  async enhanceValidationSystem(modal) {
    const validationStatus = modal.querySelector('.validation-status');
    if (!validationStatus) return;
    
    if (this.components.positionValidationUI) {
      validationStatus.classList.add('enhanced-validation');
      
      // Add enhanced validation indicators
      const enhancedIndicators = document.createElement('div');
      enhancedIndicators.className = 'enhanced-validation-indicators';
      enhancedIndicators.innerHTML = `
        <div class="validation-details" id="validationDetails"></div>
        <div class="validation-suggestions" id="validationSuggestions"></div>
      `;
      validationStatus.appendChild(enhancedIndicators);
    }
  }
  
  /**
   * Enhance controls
   */
  async enhanceControls(modal) {
    const setupActions = modal.querySelector('.setup-actions');
    if (!setupActions) return;
    
    // Add loading indicators to buttons
    if (this.components.loadingIndicatorSystem) {
      const buttons = setupActions.querySelectorAll('button');
      buttons.forEach(button => {
        button.classList.add('enhanced-button');
      });
    }
  }
  
  /**
   * Add mobile optimizations to modal
   */
  async addMobileOptimizations(modal) {
    if (!this.migrationState.mobileOptimized) return;
    
    modal.classList.add('mobile-optimized');
    
    // Add mobile-specific controls
    const mobileControls = document.createElement('div');
    mobileControls.className = 'mobile-controls';
    mobileControls.innerHTML = `
      <button class="mobile-toggle-palette" onclick="toggleMobilePalette()">
        🎨 Toggle Palette
      </button>
      <button class="mobile-toggle-analysis" onclick="toggleMobileAnalysis()">
        📊 Toggle Analysis
      </button>
    `;
    
    const modalHeader = modal.querySelector('.modal-header');
    if (modalHeader) {
      modalHeader.appendChild(mobileControls);
    }
  }
  
  /**
   * Add performance indicators
   */
  async addPerformanceIndicators(modal) {
    if (!this.migrationState.performanceMonitored) return;
    
    // Add performance indicator to modal header
    const modalHeader = modal.querySelector('.modal-header');
    if (modalHeader) {
      const performanceIndicator = document.createElement('div');
      performanceIndicator.className = 'performance-indicator';
      performanceIndicator.innerHTML = `
        <span class="performance-status" id="performanceStatus">⚡</span>
      `;
      modalHeader.appendChild(performanceIndicator);
    }
  }
  
  /**
   * Migrate existing functions to use enhanced components
   */
  async migrateExistingFunctions() {
    console.log('🔄 Migrating existing functions...');
    
    // Store original functions
    this.originalFunctions = {
      initializePieceSetup: window.initializePieceSetup,
      drawSetupBoard: window.drawSetupBoard,
      loadPreset: window.loadPreset,
      updatePositionStats: window.updatePositionStats,
      analyzePosition: window.analyzePosition
    };
    
    // Create enhanced wrapper functions
    await this.createEnhancedWrappers();
    
    console.log('✅ Function migration completed');
  }
  
  /**
   * Create enhanced wrapper functions
   */
  async createEnhancedWrappers() {
    const self = this;
    
    // Enhanced initializePieceSetup
    window.initializePieceSetup = function() {
      console.log('🚀 Enhanced initializePieceSetup called');
      
      // Call original function first
      if (self.originalFunctions.initializePieceSetup) {
        self.originalFunctions.initializePieceSetup();
      }
      
      // Apply enhancements
      self.applyEnhancements();
    };
    
    // Enhanced drawSetupBoard
    window.drawSetupBoard = function() {
      console.log('🎨 Enhanced drawSetupBoard called');
      
      // Call original function
      if (self.originalFunctions.drawSetupBoard) {
        self.originalFunctions.drawSetupBoard();
      }
      
      // Apply enhanced drawing features
      self.enhanceDrawing();
    };
    
    // Enhanced loadPreset
    window.loadPreset = function(presetId) {
      console.log('📂 Enhanced loadPreset called:', presetId);
      
      // Try enhanced preset system first
      if (self.components.extendedPresetManager) {
        const preset = self.components.extendedPresetManager.getPresetById(presetId);
        if (preset) {
          self.loadEnhancedPreset(preset);
          return;
        }
      }
      
      // Fallback to original function
      if (self.originalFunctions.loadPreset) {
        self.originalFunctions.loadPreset(presetId);
      }
    };
    
    // Enhanced updatePositionStats
    window.updatePositionStats = function() {
      console.log('📊 Enhanced updatePositionStats called');
      
      // Call original function
      if (self.originalFunctions.updatePositionStats) {
        self.originalFunctions.updatePositionStats();
      }
      
      // Apply enhanced statistics
      self.updateEnhancedStats();
    };
    
    // Enhanced analyzePosition
    window.analyzePosition = function() {
      console.log('🧠 Enhanced analyzePosition called');
      
      // Use advanced analyzer if available
      if (self.components.advancedPositionAnalyzer) {
        self.performEnhancedAnalysis();
      } else if (self.originalFunctions.analyzePosition) {
        self.originalFunctions.analyzePosition();
      }
    };
  }
  
  /**
   * Apply enhancements after initialization
   */
  applyEnhancements() {
    // Initialize enhanced drag & drop
    if (this.components.enhancedDragDrop) {
      this.components.enhancedDragDrop.reinitialize();
    }
    
    // Setup position history tracking
    if (this.components.positionHistoryManager) {
      this.setupHistoryTracking();
    }
    
    // Initialize mobile optimizations
    if (this.components.mobileOptimizationManager) {
      this.components.mobileOptimizationManager.initializeTouchEvents();
    }
    
    // Setup performance monitoring
    if (this.components.performanceMonitor) {
      this.setupPerformanceMonitoring();
    }
    
    // Initialize enhanced validation
    if (this.components.positionValidationUI) {
      this.components.positionValidationUI.initialize();
    }
  }
  
  /**
   * Enhance drawing with visual improvements
   */
  enhanceDrawing() {
    // Add enhanced visual feedback
    if (this.components.enhancedUI) {
      this.components.enhancedUI.updateVisualFeedback();
    }
    
    // Update responsive layout
    if (this.components.responsiveLayoutManager) {
      this.components.responsiveLayoutManager.updateLayout();
    }
    
    // Add position to history
    if (this.components.positionHistoryManager && typeof setupBoard !== 'undefined') {
      this.components.positionHistoryManager.addPosition(setupBoard);
    }
  }
  
  /**
   * Load enhanced preset
   */
  loadEnhancedPreset(preset) {
    console.log('📂 Loading enhanced preset:', preset.name);
    
    // Use performance monitoring if available
    if (this.components.performanceMonitor) {
      this.components.performanceMonitor.measurePresetLoading(() => {
        this.applyPresetToBoard(preset);
      }, { presetId: preset.id, presetName: preset.name });
    } else {
      this.applyPresetToBoard(preset);
    }
  }
  
  /**
   * Apply preset to board
   */
  applyPresetToBoard(preset) {
    if (typeof setupBoard !== 'undefined') {
      // Copy preset position to setup board
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          setupBoard[i][j] = preset.position[i][j];
        }
      }
      
      // Redraw board
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Reinitialize drag & drop
      if (this.components.enhancedDragDrop) {
        this.components.enhancedDragDrop.reinitialize();
      }
      
      // Show enhanced notification
      if (this.components.enhancedUI) {
        this.components.enhancedUI.showEnhancedNotification(
          `${preset.name} loaded! ${preset.description}`,
          'success'
        );
      }
      
      // Trigger analysis
      if (this.components.advancedPositionAnalyzer) {
        this.performEnhancedAnalysis();
      }
    }
  }
  
  /**
   * Update enhanced statistics
   */
  updateEnhancedStats() {
    // Update advanced analysis display
    if (this.components.advancedPositionAnalyzer && typeof setupBoard !== 'undefined') {
      try {
        const analysis = this.components.advancedPositionAnalyzer.analyzePosition(setupBoard);
        this.displayAdvancedAnalysis(analysis);
      } catch (error) {
        console.warn('Enhanced stats update failed:', error);
      }
    }
    
    // Update enhanced validation
    if (this.components.positionValidationUI && typeof setupBoard !== 'undefined') {
      this.components.positionValidationUI.validateAndUpdateUI(setupBoard);
    }
    
    // Update history controls
    this.updateHistoryControls();
  }
  
  /**
   * Perform enhanced analysis
   */
  performEnhancedAnalysis() {
    if (!this.components.advancedPositionAnalyzer || typeof setupBoard === 'undefined') {
      return;
    }
    
    // Show loading indicator
    if (this.components.loadingIndicatorSystem) {
      this.components.loadingIndicatorSystem.showLoading('Analyzing position...');
    }
    
    // Use performance monitoring
    if (this.components.performanceMonitor) {
      this.components.performanceMonitor.measureAnalysisOperation(() => {
        const analysis = this.components.advancedPositionAnalyzer.analyzePosition(setupBoard);
        this.displayAdvancedAnalysis(analysis);
        
        // Hide loading indicator
        if (this.components.loadingIndicatorSystem) {
          this.components.loadingIndicatorSystem.hideLoading();
        }
        
        return analysis;
      }, { positionSize: setupBoard.length * setupBoard[0].length });
    } else {
      try {
        const analysis = this.components.advancedPositionAnalyzer.analyzePosition(setupBoard);
        this.displayAdvancedAnalysis(analysis);
      } finally {
        if (this.components.loadingIndicatorSystem) {
          this.components.loadingIndicatorSystem.hideLoading();
        }
      }
    }
  }
  
  /**
   * Display advanced analysis results
   */
  displayAdvancedAnalysis(analysis) {
    if (analysis.error) {
      console.warn('Analysis error:', analysis.error);
      return;
    }
    
    // Update advanced analysis section
    const materialBalance = document.getElementById('advancedMaterialBalance');
    const pieceActivity = document.getElementById('advancedPieceActivity');
    const kingSafety = document.getElementById('advancedKingSafety');
    const centerControl = document.getElementById('advancedCenterControl');
    const positionType = document.getElementById('advancedPositionType');
    
    if (materialBalance) {
      materialBalance.textContent = analysis.materialBalance > 0 ? 
        `+${analysis.materialBalance}` : analysis.materialBalance;
    }
    
    if (pieceActivity) {
      pieceActivity.textContent = `W:${analysis.pieceActivity.white.mobilePieces} B:${analysis.pieceActivity.black.mobilePieces}`;
    }
    
    if (kingSafety) {
      const whiteSafety = analysis.kingSafety.white.status;
      const blackSafety = analysis.kingSafety.black.status;
      kingSafety.textContent = `W:${whiteSafety} B:${blackSafety}`;
    }
    
    if (centerControl) {
      centerControl.textContent = `W:${analysis.centerControl.white} B:${analysis.centerControl.black}`;
    }
    
    if (positionType) {
      positionType.textContent = analysis.positionType.replace(/_/g, ' ');
    }
    
    // Update existing analysis text
    const analysisText = document.getElementById('analysisText');
    if (analysisText) {
      analysisText.textContent = `${analysis.positionType.replace(/_/g, ' ')} - Material: ${analysis.materialBalance > 0 ? '+' : ''}${analysis.materialBalance}`;
    }
  }
  
  /**
   * Setup history tracking
   */
  setupHistoryTracking() {
    if (!this.components.positionHistoryManager) return;
    
    // Add current position to history
    if (typeof setupBoard !== 'undefined') {
      this.components.positionHistoryManager.addPosition(setupBoard, {
        name: 'Initial Position',
        description: 'Starting position',
        timestamp: Date.now()
      });
    }
    
    this.updateHistoryControls();
  }
  
  /**
   * Update history controls
   */
  updateHistoryControls() {
    if (!this.components.positionHistoryManager) return;
    
    const undoBtn = document.getElementById('btnUndo');
    const redoBtn = document.getElementById('btnRedo');
    
    if (undoBtn) {
      undoBtn.disabled = !this.components.positionHistoryManager.canUndo();
    }
    
    if (redoBtn) {
      redoBtn.disabled = !this.components.positionHistoryManager.canRedo();
    }
    
    // Update history list
    this.updateHistoryList();
  }
  
  /**
   * Update history list display
   */
  updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (!historyList || !this.components.positionHistoryManager) return;
    
    const history = this.components.positionHistoryManager.getHistoryList();
    
    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No position history yet</p>';
      return;
    }
    
    historyList.innerHTML = history.map((entry, index) => `
      <div class="history-item ${index === this.components.positionHistoryManager.currentIndex ? 'current' : ''}" 
           onclick="jumpToHistoryPosition(${index})">
        <div class="history-name">${entry.metadata.name || `Position ${index + 1}`}</div>
        <div class="history-time">${new Date(entry.metadata.timestamp).toLocaleTimeString()}</div>
      </div>
    `).join('');
  }
  
  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if (!this.components.performanceMonitor) return;
    
    // Monitor drag operations
    this.monitorDragOperations();
    
    // Update performance display periodically
    setInterval(() => {
      this.updatePerformanceDisplay();
    }, 5000);
  }
  
  /**
   * Monitor drag operations
   */
  monitorDragOperations() {
    // This would be integrated with the enhanced drag & drop system
    // to monitor performance of drag operations
  }
  
  /**
   * Update performance display
   */
  updatePerformanceDisplay() {
    if (!this.components.performanceMonitor) return;
    
    const report = this.components.performanceMonitor.generateReport();
    
    const dragPerformance = document.getElementById('dragPerformance');
    const analysisPerformance = document.getElementById('analysisPerformance');
    const presetPerformance = document.getElementById('presetPerformance');
    
    if (dragPerformance && report.dragOperations.count > 0) {
      const avgTime = report.dragOperations.averageTime.toFixed(2);
      const status = report.dragOperations.averageTime < 16 ? '✅' : '⚠️';
      dragPerformance.innerHTML = `${avgTime}ms ${status}`;
    }
    
    if (analysisPerformance && report.analysisOperations.count > 0) {
      const avgTime = report.analysisOperations.averageTime.toFixed(2);
      const status = report.analysisOperations.averageTime < 500 ? '✅' : '⚠️';
      analysisPerformance.innerHTML = `${avgTime}ms ${status}`;
    }
    
    if (presetPerformance && report.presetLoading.count > 0) {
      const avgTime = report.presetLoading.averageTime.toFixed(2);
      const status = report.presetLoading.averageTime < 200 ? '✅' : '⚠️';
      presetPerformance.innerHTML = `${avgTime}ms ${status}`;
    }
  }
  
  /**
   * Setup backward compatibility
   */
  async setupBackwardCompatibility() {
    console.log('🔄 Setting up backward compatibility...');
    
    // Ensure all original functions still work
    this.ensureOriginalFunctionality();
    
    // Provide fallback mechanisms
    this.setupFallbackMechanisms();
    
    // Maintain existing API
    this.maintainExistingAPI();
    
    console.log('✅ Backward compatibility established');
  }
  
  /**
   * Ensure original functionality works
   */
  ensureOriginalFunctionality() {
    // Make sure global variables are still accessible
    if (typeof setupBoard === 'undefined') {
      window.setupBoard = [];
    }
    
    // Ensure original functions are available as fallbacks
    Object.keys(this.originalFunctions).forEach(funcName => {
      if (this.originalFunctions[funcName] && !window[`original_${funcName}`]) {
        window[`original_${funcName}`] = this.originalFunctions[funcName];
      }
    });
  }
  
  /**
   * Setup fallback mechanisms
   */
  setupFallbackMechanisms() {
    // If enhanced components fail, fall back to original functionality
    const self = this;
    
    window.fallbackToOriginal = function(functionName) {
      console.warn(`⚠️ Falling back to original ${functionName}`);
      if (self.originalFunctions[functionName]) {
        return self.originalFunctions[functionName].apply(this, Array.from(arguments).slice(1));
      }
    };
  }
  
  /**
   * Maintain existing API
   */
  maintainExistingAPI() {
    // Ensure all existing global functions remain available
    const requiredFunctions = [
      'initializePieceSetup',
      'drawSetupBoard',
      'clearSetupBoard',
      'resetToDefaultPosition',
      'loadPreset',
      'updatePositionStats',
      'startCustomGame',
      'closePieceSetup'
    ];
    
    requiredFunctions.forEach(funcName => {
      if (typeof window[funcName] !== 'function') {
        console.warn(`⚠️ Required function ${funcName} not found, creating placeholder`);
        window[funcName] = function() {
          console.warn(`⚠️ ${funcName} called but not implemented`);
        };
      }
    });
  }
  
  /**
   * Create smooth migration path
   */
  async createMigrationPath() {
    console.log('🛤️ Creating smooth migration path...');
    
    // Add migration controls to UI
    this.addMigrationControls();
    
    // Setup gradual feature activation
    this.setupGradualActivation();
    
    // Provide user feedback on migration status
    this.provideMigrationFeedback();
    
    console.log('✅ Migration path established');
  }
  
  /**
   * Add migration controls
   */
  addMigrationControls() {
    if (!this.config.enableGradualMigration) return;
    
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) return;
    
    const migrationControls = document.createElement('div');
    migrationControls.className = 'migration-controls';
    migrationControls.innerHTML = `
      <div class="migration-header">
        <h5>🚀 Enhanced Features</h5>
        <button onclick="toggleMigrationControls()" class="btn-toggle">⚙️</button>
      </div>
      <div class="migration-options collapsed" id="migrationOptions">
        <label>
          <input type="checkbox" id="enableEnhancedUI" ${this.migrationState.uiEnhanced ? 'checked' : ''}>
          Enhanced UI & Animations
        </label>
        <label>
          <input type="checkbox" id="enableExtendedPresets" ${this.migrationState.presetsExtended ? 'checked' : ''}>
          Extended Preset Collection
        </label>
        <label>
          <input type="checkbox" id="enableAdvancedAnalysis" ${this.migrationState.analysisAdvanced ? 'checked' : ''}>
          Advanced Position Analysis
        </label>
        <label>
          <input type="checkbox" id="enablePositionSharing" ${this.migrationState.sharingEnabled ? 'checked' : ''}>
          Position Sharing & QR Codes
        </label>
        <label>
          <input type="checkbox" id="enablePositionHistory" ${this.migrationState.historyEnabled ? 'checked' : ''}>
          Position History & Undo/Redo
        </label>
        <label>
          <input type="checkbox" id="enableMobileOptimization" ${this.migrationState.mobileOptimized ? 'checked' : ''}>
          Mobile Touch Optimization
        </label>
        <label>
          <input type="checkbox" id="enablePerformanceMonitoring" ${this.migrationState.performanceMonitored ? 'checked' : ''}>
          Performance Monitoring
        </label>
      </div>
    `;
    
    const modalHeader = modal.querySelector('.modal-header');
    if (modalHeader) {
      modalHeader.appendChild(migrationControls);
    }
  }
  
  /**
   * Setup gradual feature activation
   */
  setupGradualActivation() {
    // Allow users to enable/disable features gradually
    const checkboxes = document.querySelectorAll('#migrationOptions input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleFeature(e.target.id, e.target.checked);
      });
    });
  }
  
  /**
   * Toggle individual features
   */
  toggleFeature(featureId, enabled) {
    console.log(`🔧 Toggling feature ${featureId}:`, enabled);
    
    switch (featureId) {
      case 'enableEnhancedUI':
        this.migrationState.uiEnhanced = enabled;
        break;
      case 'enableExtendedPresets':
        this.migrationState.presetsExtended = enabled;
        break;
      case 'enableAdvancedAnalysis':
        this.migrationState.analysisAdvanced = enabled;
        break;
      case 'enablePositionSharing':
        this.migrationState.sharingEnabled = enabled;
        break;
      case 'enablePositionHistory':
        this.migrationState.historyEnabled = enabled;
        break;
      case 'enableMobileOptimization':
        this.migrationState.mobileOptimized = enabled;
        break;
      case 'enablePerformanceMonitoring':
        this.migrationState.performanceMonitored = enabled;
        break;
    }
    
    // Apply changes
    this.applyFeatureToggle(featureId, enabled);
  }
  
  /**
   * Apply feature toggle changes
   */
  applyFeatureToggle(featureId, enabled) {
    const modal = document.getElementById('pieceSetupModal');
    if (!modal) return;
    
    // Toggle CSS classes and functionality based on feature
    switch (featureId) {
      case 'enableEnhancedUI':
        modal.classList.toggle('enhanced-ui', enabled);
        break;
      case 'enableExtendedPresets':
        modal.classList.toggle('extended-presets', enabled);
        break;
      case 'enableAdvancedAnalysis':
        const analysisSection = modal.querySelector('.enhanced-analysis-section');
        if (analysisSection) {
          analysisSection.style.display = enabled ? 'block' : 'none';
        }
        break;
      case 'enablePositionSharing':
        const sharingSection = modal.querySelector('.enhanced-sharing-section');
        if (sharingSection) {
          sharingSection.style.display = enabled ? 'block' : 'none';
        }
        break;
      case 'enablePositionHistory':
        const historySection = modal.querySelector('.enhanced-history-section');
        if (historySection) {
          historySection.style.display = enabled ? 'block' : 'none';
        }
        break;
      case 'enableMobileOptimization':
        modal.classList.toggle('mobile-optimized', enabled);
        break;
      case 'enablePerformanceMonitoring':
        const performanceSection = modal.querySelector('.enhanced-performance-section');
        if (performanceSection) {
          performanceSection.style.display = enabled ? 'block' : 'none';
        }
        break;
    }
  }
  
  /**
   * Provide migration feedback
   */
  provideMigrationFeedback() {
    const enabledFeatures = Object.values(this.migrationState).filter(Boolean).length;
    const totalFeatures = Object.keys(this.migrationState).length;
    
    console.log(`🚀 Migration Status: ${enabledFeatures}/${totalFeatures} features enabled`);
    
    // Show migration status in UI
    const performanceStatus = document.getElementById('performanceStatus');
    if (performanceStatus) {
      const percentage = Math.round((enabledFeatures / totalFeatures) * 100);
      performanceStatus.textContent = `${percentage}%`;
      performanceStatus.title = `${enabledFeatures}/${totalFeatures} enhanced features active`;
    }
  }
  
  /**
   * Fallback to legacy mode
   */
  async fallbackToLegacyMode() {
    console.warn('⚠️ Falling back to legacy mode due to integration failure');
    
    this.legacyMode = true;
    
    // Restore original functions
    Object.keys(this.originalFunctions).forEach(funcName => {
      if (this.originalFunctions[funcName]) {
        window[funcName] = this.originalFunctions[funcName];
      }
    });
    
    // Remove enhanced elements
    const modal = document.getElementById('pieceSetupModal');
    if (modal) {
      modal.classList.add('legacy-mode');
      
      // Remove enhanced sections
      const enhancedSections = modal.querySelectorAll('.enhanced-sharing-section, .enhanced-history-section, .enhanced-analysis-section, .enhanced-performance-section');
      enhancedSections.forEach(section => section.remove());
    }
    
    console.log('✅ Legacy mode activated');
  }
  
  /**
   * Log integration status
   */
  logIntegrationStatus() {
    console.log('📊 Enhanced Piece Setup Integration Status:');
    console.log('==========================================');
    console.log(`Mode: ${this.legacyMode ? 'Legacy' : 'Enhanced'}`);
    console.log('Features:');
    Object.entries(this.migrationState).forEach(([feature, enabled]) => {
      console.log(`  ${feature}: ${enabled ? '✅' : '❌'}`);
    });
    console.log('Components:');
    Object.entries(this.components).forEach(([component, instance]) => {
      console.log(`  ${component}: ${instance ? '✅' : '❌'}`);
    });
    console.log('==========================================');
  }
  
  /**
   * Get integration status
   */
  getIntegrationStatus() {
    return {
      initialized: this.initialized,
      legacyMode: this.legacyMode,
      migrationState: { ...this.migrationState },
      componentsLoaded: Object.keys(this.components).length,
      config: { ...this.config }
    };
  }
}

// Global integration manager instance
let pieceSetupIntegrationManager = null;

/**
 * Initialize the integration system
 */
async function initializePieceSetupIntegration(options = {}) {
  if (!pieceSetupIntegrationManager) {
    pieceSetupIntegrationManager = new PieceSetupIntegrationManager();
  }
  
  await pieceSetupIntegrationManager.initialize(options);
  return pieceSetupIntegrationManager;
}

/**
 * Get the integration manager instance
 */
function getPieceSetupIntegrationManager() {
  return pieceSetupIntegrationManager;
}

// Enhanced global functions for integration

/**
 * Toggle section visibility
 */
function toggleSection(sectionName) {
  const content = document.getElementById(`${sectionName}Content`);
  const toggle = document.querySelector(`[onclick="toggleSection('${sectionName}')"]`);
  
  if (content && toggle) {
    const isCollapsed = content.classList.contains('collapsed');
    content.classList.toggle('collapsed');
    toggle.textContent = isCollapsed ? '▾' : '▴';
  }
}

/**
 * Toggle migration controls
 */
function toggleMigrationControls() {
  const options = document.getElementById('migrationOptions');
  if (options) {
    options.classList.toggle('collapsed');
  }
}

/**
 * Toggle mobile palette
 */
function toggleMobilePalette() {
  const palette = document.querySelector('.piece-palette');
  if (palette) {
    palette.classList.toggle('mobile-hidden');
  }
}

/**
 * Toggle mobile analysis
 */
function toggleMobileAnalysis() {
  const analysis = document.querySelector('.enhanced-analysis-section');
  if (analysis) {
    analysis.classList.toggle('mobile-hidden');
  }
}

/**
 * Enhanced sharing functions
 */
function generateShareCode() {
  if (pieceSetupIntegrationManager?.components.positionSharingSystem && typeof setupBoard !== 'undefined') {
    try {
      const shareCode = pieceSetupIntegrationManager.components.positionSharingSystem.encodePosition(setupBoard);
      const shareCodeInput = document.getElementById('shareCodeInput');
      const shareDisplay = document.getElementById('shareDisplay');
      
      if (shareCodeInput && shareDisplay) {
        shareCodeInput.value = shareCode;
        shareDisplay.style.display = 'block';
      }
      
      if (pieceSetupIntegrationManager.components.enhancedUI) {
        pieceSetupIntegrationManager.components.enhancedUI.showEnhancedNotification(
          'Share code generated successfully!', 'success'
        );
      }
    } catch (error) {
      console.error('Failed to generate share code:', error);
    }
  }
}

function generateQRCode() {
  if (pieceSetupIntegrationManager?.components.positionSharingSystem && typeof setupBoard !== 'undefined') {
    try {
      const qrCodeCanvas = document.getElementById('qrCodeCanvas');
      const qrCodeContainer = document.getElementById('qrCodeContainer');
      
      if (qrCodeCanvas && qrCodeContainer) {
        pieceSetupIntegrationManager.components.positionSharingSystem.generateQRCode(setupBoard, qrCodeCanvas);
        qrCodeContainer.style.display = 'block';
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  }
}

function copyShareCode() {
  const shareCodeInput = document.getElementById('shareCodeInput');
  if (shareCodeInput && shareCodeInput.value) {
    navigator.clipboard.writeText(shareCodeInput.value).then(() => {
      if (pieceSetupIntegrationManager?.components.enhancedUI) {
        pieceSetupIntegrationManager.components.enhancedUI.showEnhancedNotification(
          'Share code copied to clipboard!', 'success'
        );
      }
    }).catch(error => {
      console.error('Failed to copy share code:', error);
    });
  }
}

function loadFromShareCode() {
  const shareCode = prompt('Enter share code:');
  if (shareCode && pieceSetupIntegrationManager?.components.positionSharingSystem) {
    try {
      const position = pieceSetupIntegrationManager.components.positionSharingSystem.decodePosition(shareCode);
      if (position && typeof setupBoard !== 'undefined') {
        // Copy position to setup board
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 4; j++) {
            setupBoard[i][j] = position[i][j];
          }
        }
        
        // Redraw board
        if (typeof drawSetupBoard === 'function') {
          drawSetupBoard();
        }
        
        if (pieceSetupIntegrationManager.components.enhancedUI) {
          pieceSetupIntegrationManager.components.enhancedUI.showEnhancedNotification(
            'Position loaded from share code!', 'success'
          );
        }
      }
    } catch (error) {
      console.error('Failed to load from share code:', error);
      if (pieceSetupIntegrationManager?.components.enhancedUI) {
        pieceSetupIntegrationManager.components.enhancedUI.showEnhancedNotification(
          'Invalid share code!', 'error'
        );
      }
    }
  }
}

/**
 * Enhanced history functions
 */
function undoPosition() {
  if (pieceSetupIntegrationManager?.components.positionHistoryManager) {
    const previousPosition = pieceSetupIntegrationManager.components.positionHistoryManager.undo();
    if (previousPosition && typeof setupBoard !== 'undefined') {
      // Copy position to setup board
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          setupBoard[i][j] = previousPosition[i][j];
        }
      }
      
      // Redraw board
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Update controls
      pieceSetupIntegrationManager.updateHistoryControls();
    }
  }
}

function redoPosition() {
  if (pieceSetupIntegrationManager?.components.positionHistoryManager) {
    const nextPosition = pieceSetupIntegrationManager.components.positionHistoryManager.redo();
    if (nextPosition && typeof setupBoard !== 'undefined') {
      // Copy position to setup board
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          setupBoard[i][j] = nextPosition[i][j];
        }
      }
      
      // Redraw board
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Update controls
      pieceSetupIntegrationManager.updateHistoryControls();
    }
  }
}

function clearHistory() {
  if (pieceSetupIntegrationManager?.components.positionHistoryManager) {
    if (confirm('Are you sure you want to clear the position history?')) {
      pieceSetupIntegrationManager.components.positionHistoryManager.clearHistory();
      pieceSetupIntegrationManager.updateHistoryControls();
      
      if (pieceSetupIntegrationManager.components.enhancedUI) {
        pieceSetupIntegrationManager.components.enhancedUI.showEnhancedNotification(
          'Position history cleared!', 'info'
        );
      }
    }
  }
}

function jumpToHistoryPosition(index) {
  if (pieceSetupIntegrationManager?.components.positionHistoryManager) {
    const position = pieceSetupIntegrationManager.components.positionHistoryManager.jumpToPosition(index);
    if (position && typeof setupBoard !== 'undefined') {
      // Copy position to setup board
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          setupBoard[i][j] = position[i][j];
        }
      }
      
      // Redraw board
      if (typeof drawSetupBoard === 'function') {
        drawSetupBoard();
      }
      
      // Update controls
      pieceSetupIntegrationManager.updateHistoryControls();
    }
  }
}

/**
 * Enhanced analysis functions
 */
function performAdvancedAnalysis() {
  if (pieceSetupIntegrationManager) {
    pieceSetupIntegrationManager.performEnhancedAnalysis();
  }
}

function generateAnalysisReport() {
  if (pieceSetupIntegrationManager?.components.positionEvaluationReport && typeof setupBoard !== 'undefined') {
    try {
      const report = pieceSetupIntegrationManager.components.positionEvaluationReport.generateReport(setupBoard);
      
      // Display report in a new window or modal
      const reportWindow = window.open('', '_blank', 'width=800,height=600');
      reportWindow.document.write(`
        <html>
          <head><title>Position Analysis Report</title></head>
          <body>
            <h1>Position Analysis Report</h1>
            <pre>${JSON.stringify(report, null, 2)}</pre>
          </body>
        </html>
      `);
      reportWindow.document.close();
      
    } catch (error) {
      console.error('Failed to generate analysis report:', error);
    }
  }
}

// Make integration manager available globally
window.PieceSetupIntegrationManager = PieceSetupIntegrationManager;
window.initializePieceSetupIntegration = initializePieceSetupIntegration;
window.getPieceSetupIntegrationManager = getPieceSetupIntegrationManager;

// Auto-initialize integration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Auto-initializing Piece Setup Integration...');
    initializePieceSetupIntegration();
  });
} else {
  console.log('🚀 Auto-initializing Piece Setup Integration...');
  initializePieceSetupIntegration();
}

console.log('📦 Enhanced Piece Setup Integration System loaded');