/**
 * Position Evaluation Report System for 4x5 Chess
 * 
 * Provides comprehensive visual reporting of position analysis including:
 * - Visual display of analysis results
 * - Position type determination (balanced, white advantage, black advantage)
 * - Strategic recommendations generation
 * - Enhanced user-friendly reporting interface
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * Task: 4.2 Pozisyon değerlendirme raporu sistemi
 */

class PositionEvaluationReport {
  constructor() {
    this.currentAnalysis = null;
    this.reportContainer = null;
    this.isVisible = false;
    
    // Position type thresholds
    this.thresholds = {
      materialAdvantage: {
        slight: 1,
        moderate: 3,
        significant: 5,
        decisive: 9
      },
      activityAdvantage: {
        slight: 2,
        moderate: 4,
        significant: 6
      },
      centerControlAdvantage: {
        slight: 1,
        moderate: 2,
        complete: 3
      }
    };
    
    // Position type icons and colors
    this.positionTypes = {
      'balanced': { icon: '⚖️', color: '#6b7280', description: 'Equal position' },
      'white_advantage': { icon: '⚪', color: '#3b82f6', description: 'White has advantage' },
      'black_advantage': { icon: '⚫', color: '#ef4444', description: 'Black has advantage' },
      'slight_white_advantage': { icon: '🔵', color: '#60a5fa', description: 'Slight white advantage' },
      'slight_black_advantage': { icon: '🔴', color: '#f87171', description: 'Slight black advantage' },
      'white_positional_advantage': { icon: '🎯', color: '#3b82f6', description: 'White positional advantage' },
      'black_positional_advantage': { icon: '🎯', color: '#ef4444', description: 'Black positional advantage' }
    };
    
    // King safety status icons
    this.kingSafetyIcons = {
      'safe': '🛡️',
      'moderate': '⚠️',
      'restricted': '🚨',
      'check': '👑',
      'dangerous': '💀',
      'critical': '☠️'
    };
    
    this.initializeReportContainer();
  }
  
  /**
   * Initialize the report container in the DOM
   */
  initializeReportContainer() {
    // Check if container already exists
    this.reportContainer = document.getElementById('positionEvaluationReport');
    
    if (!this.reportContainer) {
      this.createReportContainer();
    }
  }
  
  /**
   * Create the report container HTML structure
   */
  createReportContainer() {
    const container = document.createElement('div');
    container.id = 'positionEvaluationReport';
    container.className = 'position-evaluation-report hidden';
    
    container.innerHTML = `
      <div class="report-header">
        <h3 class="report-title">
          <span class="report-icon">📊</span>
          <span id="reportTitleText">${t('positionAnalysisReport') || 'Position Analysis Report'}</span>
        </h3>
        <button class="report-close" onclick="closeEvaluationReport()">✖</button>
      </div>
      
      <div class="report-content">
        <!-- Position Type Section -->
        <div class="report-section position-type-section">
          <div class="section-header">
            <h4 id="positionTypeTitle">${t('positionType') || 'Position Type'}</h4>
          </div>
          <div class="position-type-display">
            <div class="position-type-icon" id="positionTypeIcon">⚖️</div>
            <div class="position-type-info">
              <div class="position-type-name" id="positionTypeName">Balanced</div>
              <div class="position-type-description" id="positionTypeDescription">${t('balancedPosition') || 'Equal position'}</div>
            </div>
          </div>
        </div>
        
        <!-- Analysis Overview Section -->
        <div class="report-section analysis-overview-section">
          <div class="section-header">
            <h4 id="analysisOverviewTitle">${t('analysisOverview') || 'Analysis Overview'}</h4>
          </div>
          <div class="analysis-grid">
            <!-- Material Balance -->
            <div class="analysis-item material-balance">
              <div class="analysis-label" id="materialBalanceLabel">${t('materialBalance') || 'Material Balance'}</div>
              <div class="analysis-value" id="materialBalanceValue">Equal</div>
              <div class="analysis-bar">
                <div class="balance-bar" id="materialBalanceBar">
                  <div class="balance-indicator" id="materialBalanceIndicator"></div>
                </div>
              </div>
            </div>
            
            <!-- Piece Activity -->
            <div class="analysis-item piece-activity">
              <div class="analysis-label" id="pieceActivityLabel">${t('pieceActivity') || 'Piece Activity'}</div>
              <div class="analysis-value" id="pieceActivityValue">W: 0, B: 0</div>
              <div class="activity-comparison" id="activityComparison">
                <div class="activity-bar white-activity" id="whiteActivityBar"></div>
                <div class="activity-bar black-activity" id="blackActivityBar"></div>
              </div>
            </div>
            
            <!-- King Safety -->
            <div class="analysis-item king-safety">
              <div class="analysis-label" id="kingSafetyLabel">${t('kingSafety') || 'King Safety'}</div>
              <div class="king-safety-status">
                <div class="king-status white-king" id="whiteKingStatus">
                  <span class="king-icon">♔</span>
                  <span class="safety-icon" id="whiteKingSafetyIcon">🛡️</span>
                  <span class="safety-text" id="whiteKingSafetyText">Safe</span>
                </div>
                <div class="king-status black-king" id="blackKingStatus">
                  <span class="king-icon">♚</span>
                  <span class="safety-icon" id="blackKingSafetyIcon">🛡️</span>
                  <span class="safety-text" id="blackKingSafetyText">Safe</span>
                </div>
              </div>
            </div>
            
            <!-- Center Control -->
            <div class="analysis-item center-control">
              <div class="analysis-label" id="centerControlLabel">${t('centerControl') || 'Center Control'}</div>
              <div class="analysis-value" id="centerControlValue">2-2</div>
              <div class="center-visualization" id="centerVisualization">
                <div class="center-squares">
                  <div class="center-square" data-square="d2"></div>
                  <div class="center-square" data-square="e2"></div>
                  <div class="center-square" data-square="d3"></div>
                  <div class="center-square" data-square="e3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Strategic Recommendations Section -->
        <div class="report-section recommendations-section">
          <div class="section-header">
            <h4 id="recommendationsTitle">${t('strategicRecommendations') || 'Strategic Recommendations'}</h4>
          </div>
          <div class="recommendations-list" id="recommendationsList">
            <div class="no-recommendations" id="noRecommendations">
              <span class="icon">💡</span>
              <span id="noRecommendationsText">${t('noRecommendationsAvailable') || 'Set up a position to see strategic recommendations'}</span>
            </div>
          </div>
        </div>
        
        <!-- Detailed Statistics Section -->
        <div class="report-section statistics-section collapsible">
          <div class="section-header collapsible-header" onclick="toggleReportSection('statistics')">
            <h4 id="statisticsTitle">${t('detailedStatistics') || 'Detailed Statistics'}</h4>
            <span class="chevron">▾</span>
          </div>
          <div class="collapsible-content" id="statisticsContent">
            <div class="statistics-grid">
              <div class="stat-group material-stats">
                <h5 id="materialStatsTitle">${t('materialBreakdown') || 'Material Breakdown'}</h5>
                <div class="material-breakdown" id="materialBreakdown">
                  <div class="side-material white-material">
                    <div class="side-label">White</div>
                    <div class="material-value" id="whiteMaterialValue">0</div>
                    <div class="piece-counts" id="whitePieceCounts"></div>
                  </div>
                  <div class="side-material black-material">
                    <div class="side-label">Black</div>
                    <div class="material-value" id="blackMaterialValue">0</div>
                    <div class="piece-counts" id="blackPieceCounts"></div>
                  </div>
                </div>
              </div>
              
              <div class="stat-group activity-stats">
                <h5 id="activityStatsTitle">${t('activityDetails') || 'Activity Details'}</h5>
                <div class="activity-details" id="activityDetails">
                  <div class="activity-metric">
                    <span id="totalMovesLabel">${t('totalMoves') || 'Total Moves'}:</span>
                    <span id="totalMovesValue">W: 0, B: 0</span>
                  </div>
                  <div class="activity-metric">
                    <span id="avgMovesLabel">${t('avgMovesPerPiece') || 'Avg Moves/Piece'}:</span>
                    <span id="avgMovesValue">W: 0.0, B: 0.0</span>
                  </div>
                </div>
              </div>
              
              <div class="stat-group safety-stats">
                <h5 id="safetyStatsTitle">${t('kingSafetyDetails') || 'King Safety Details'}</h5>
                <div class="safety-details" id="safetyDetails">
                  <div class="king-detail white-king-detail">
                    <div class="king-position" id="whiteKingPosition">${t('position') || 'Position'}: -</div>
                    <div class="escape-squares" id="whiteEscapeSquares">${t('escapeSquares') || 'Escape squares'}: 0</div>
                  </div>
                  <div class="king-detail black-king-detail">
                    <div class="king-position" id="blackKingPosition">${t('position') || 'Position'}: -</div>
                    <div class="escape-squares" id="blackEscapeSquares">${t('escapeSquares') || 'Escape squares'}: 0</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-footer">
        <div class="report-timestamp" id="reportTimestamp">${t('analysisGeneratedAt') || 'Analysis generated at'}: --:--</div>
        <div class="report-actions">
          <button class="btn-secondary" onclick="exportAnalysisReport()" id="btnExportReport">
            📤 <span id="exportReportText">${t('exportReport') || 'Export'}</span>
          </button>
          <button class="btn-secondary" onclick="shareAnalysisReport()" id="btnShareReport">
            🔗 <span id="shareReportText">${t('shareReport') || 'Share'}</span>
          </button>
        </div>
      </div>
    `;
    
    // Insert the container into the piece setup modal
    const setupModal = document.getElementById('pieceSetupModal');
    if (setupModal) {
      setupModal.appendChild(container);
    } else {
      // Fallback: append to body
      document.body.appendChild(container);
    }
    
    this.reportContainer = container;
  }
  
  /**
   * Generate and display a comprehensive position evaluation report
   * @param {Object} analysis - Analysis result from AdvancedPositionAnalyzer
   */
  generateReport(analysis) {
    if (!analysis || analysis.error) {
      this.displayErrorReport(analysis?.message || 'Analysis failed');
      return;
    }
    
    this.currentAnalysis = analysis;
    
    // Update position type
    this.updatePositionType(analysis);
    
    // Update analysis overview
    this.updateAnalysisOverview(analysis);
    
    // Update recommendations
    this.updateRecommendations(analysis);
    
    // Update detailed statistics
    this.updateDetailedStatistics(analysis);
    
    // Update timestamp
    this.updateTimestamp(analysis.timestamp);
    
    // Show the report
    this.showReport();
  }
  
  /**
   * Update position type display
   * @param {Object} analysis - Analysis result
   */
  updatePositionType(analysis) {
    const positionType = this.determineEnhancedPositionType(analysis);
    const typeInfo = this.positionTypes[positionType] || this.positionTypes['balanced'];
    
    const iconEl = document.getElementById('positionTypeIcon');
    const nameEl = document.getElementById('positionTypeName');
    const descEl = document.getElementById('positionTypeDescription');
    
    if (iconEl) iconEl.textContent = typeInfo.icon;
    if (nameEl) {
      nameEl.textContent = positionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      nameEl.style.color = typeInfo.color;
    }
    if (descEl) descEl.textContent = typeInfo.description;
  }
  
  /**
   * Determine enhanced position type with more granular analysis
   * @param {Object} analysis - Analysis result
   * @returns {string} Position type
   */
  determineEnhancedPositionType(analysis) {
    const material = analysis.materialBalance;
    const activity = analysis.pieceActivity;
    const center = analysis.centerControl;
    const safety = analysis.kingSafety;
    
    // Check for decisive material advantage
    if (material.advantageAmount >= this.thresholds.materialAdvantage.decisive) {
      return material.advantage + '_advantage';
    }
    
    // Check for significant material advantage
    if (material.advantageAmount >= this.thresholds.materialAdvantage.significant) {
      return material.advantage + '_advantage';
    }
    
    // Check for moderate material advantage
    if (material.advantageAmount >= this.thresholds.materialAdvantage.moderate) {
      return material.advantage + '_advantage';
    }
    
    // Check for king safety issues
    const whiteKingDangerous = safety.white.status === 'dangerous' || safety.white.status === 'critical';
    const blackKingDangerous = safety.black.status === 'dangerous' || safety.black.status === 'critical';
    
    if (whiteKingDangerous && !blackKingDangerous) {
      return 'black_advantage';
    } else if (blackKingDangerous && !whiteKingDangerous) {
      return 'white_advantage';
    }
    
    // Check for positional advantages (activity + center control)
    const whiteActivityAdvantage = activity.white.totalMoves - activity.black.totalMoves;
    const centerAdvantage = center.white - center.black;
    
    if (whiteActivityAdvantage >= this.thresholds.activityAdvantage.moderate && centerAdvantage >= 1) {
      return 'white_positional_advantage';
    } else if (whiteActivityAdvantage <= -this.thresholds.activityAdvantage.moderate && centerAdvantage <= -1) {
      return 'black_positional_advantage';
    }
    
    // Check for slight material advantage
    if (material.advantageAmount >= this.thresholds.materialAdvantage.slight) {
      return 'slight_' + material.advantage + '_advantage';
    }
    
    return 'balanced';
  }
  
  /**
   * Update analysis overview section
   * @param {Object} analysis - Analysis result
   */
  updateAnalysisOverview(analysis) {
    this.updateMaterialBalance(analysis.materialBalance);
    this.updatePieceActivity(analysis.pieceActivity);
    this.updateKingSafety(analysis.kingSafety);
    this.updateCenterControl(analysis.centerControl);
  }
  
  /**
   * Update material balance display
   * @param {Object} material - Material balance data
   */
  updateMaterialBalance(material) {
    const valueEl = document.getElementById('materialBalanceValue');
    const indicatorEl = document.getElementById('materialBalanceIndicator');
    
    if (valueEl) {
      if (material.advantage === 'equal') {
        valueEl.textContent = 'Equal';
        valueEl.className = 'analysis-value equal';
      } else {
        const side = material.advantage === 'white' ? 'White' : 'Black';
        valueEl.textContent = `${side} +${material.advantageAmount}`;
        valueEl.className = `analysis-value ${material.advantage}-advantage`;
      }
    }
    
    if (indicatorEl) {
      // Position indicator based on material balance (-9 to +9 scale)
      const maxAdvantage = 9;
      const percentage = Math.max(-100, Math.min(100, (material.balance / maxAdvantage) * 100));
      indicatorEl.style.left = `${50 + percentage / 2}%`;
      indicatorEl.className = `balance-indicator ${material.advantage !== 'equal' ? material.advantage : 'equal'}`;
    }
  }
  
  /**
   * Update piece activity display
   * @param {Object} activity - Piece activity data
   */
  updatePieceActivity(activity) {
    const valueEl = document.getElementById('pieceActivityValue');
    const whiteBarEl = document.getElementById('whiteActivityBar');
    const blackBarEl = document.getElementById('blackActivityBar');
    
    if (valueEl) {
      valueEl.textContent = `W: ${activity.white.mobilePieces}, B: ${activity.black.mobilePieces}`;
    }
    
    if (whiteBarEl && blackBarEl) {
      const maxPieces = Math.max(activity.white.mobilePieces, activity.black.mobilePieces, 1);
      const whiteWidth = (activity.white.mobilePieces / maxPieces) * 100;
      const blackWidth = (activity.black.mobilePieces / maxPieces) * 100;
      
      whiteBarEl.style.width = `${whiteWidth}%`;
      blackBarEl.style.width = `${blackWidth}%`;
      
      whiteBarEl.title = `White: ${activity.white.mobilePieces} active pieces, ${activity.white.totalMoves} total moves`;
      blackBarEl.title = `Black: ${activity.black.mobilePieces} active pieces, ${activity.black.totalMoves} total moves`;
    }
  }
  
  /**
   * Update king safety display
   * @param {Object} safety - King safety data
   */
  updateKingSafety(safety) {
    // White king
    const whiteIconEl = document.getElementById('whiteKingSafetyIcon');
    const whiteTextEl = document.getElementById('whiteKingSafetyText');
    const whiteStatusEl = document.getElementById('whiteKingStatus');
    
    if (whiteIconEl) whiteIconEl.textContent = this.kingSafetyIcons[safety.white.status] || '🛡️';
    if (whiteTextEl) whiteTextEl.textContent = safety.white.status.charAt(0).toUpperCase() + safety.white.status.slice(1);
    if (whiteStatusEl) {
      whiteStatusEl.className = `king-status white-king ${safety.white.status}`;
      if (safety.white.inCheck) whiteStatusEl.classList.add('in-check');
    }
    
    // Black king
    const blackIconEl = document.getElementById('blackKingSafetyIcon');
    const blackTextEl = document.getElementById('blackKingSafetyText');
    const blackStatusEl = document.getElementById('blackKingStatus');
    
    if (blackIconEl) blackIconEl.textContent = this.kingSafetyIcons[safety.black.status] || '🛡️';
    if (blackTextEl) blackTextEl.textContent = safety.black.status.charAt(0).toUpperCase() + safety.black.status.slice(1);
    if (blackStatusEl) {
      blackStatusEl.className = `king-status black-king ${safety.black.status}`;
      if (safety.black.inCheck) blackStatusEl.classList.add('in-check');
    }
  }
  
  /**
   * Update center control display
   * @param {Object} center - Center control data
   */
  updateCenterControl(center) {
    const valueEl = document.getElementById('centerControlValue');
    const visualizationEl = document.getElementById('centerVisualization');
    
    if (valueEl) {
      valueEl.textContent = `${center.white}-${center.black}`;
      if (center.advantage !== 'equal') {
        valueEl.className = `analysis-value ${center.advantage}-advantage`;
      } else {
        valueEl.className = 'analysis-value equal';
      }
    }
    
    if (visualizationEl) {
      const squares = visualizationEl.querySelectorAll('.center-square');
      squares.forEach((square, index) => {
        square.className = 'center-square';
        
        // Determine control based on controlled squares data
        const whiteControlled = center.controlledSquares.white.some(sq => 
          this.getSquareIndex(sq.row, sq.col) === index
        );
        const blackControlled = center.controlledSquares.black.some(sq => 
          this.getSquareIndex(sq.row, sq.col) === index
        );
        
        if (whiteControlled) {
          square.classList.add('white-controlled');
        } else if (blackControlled) {
          square.classList.add('black-controlled');
        } else {
          square.classList.add('neutral');
        }
      });
    }
  }
  
  /**
   * Get square index for center control visualization
   * @param {number} row - Board row
   * @param {number} col - Board column
   * @returns {number} Square index (0-3 for center squares)
   */
  getSquareIndex(row, col) {
    // Map board coordinates to center square indices
    // Center squares: d2=[3,3], d3=[2,3], e2=[3,0], e3=[2,0]
    if (row === 3 && col === 3) return 0; // d2
    if (row === 3 && col === 0) return 1; // e2
    if (row === 2 && col === 3) return 2; // d3
    if (row === 2 && col === 0) return 3; // e3
    return -1;
  }
  
  /**
   * Update recommendations section
   * @param {Object} analysis - Analysis result
   */
  updateRecommendations(analysis) {
    const listEl = document.getElementById('recommendationsList');
    const noRecommendationsEl = document.getElementById('noRecommendations');
    
    if (!listEl) return;
    
    if (!analysis.recommendations || analysis.recommendations.length === 0) {
      if (noRecommendationsEl) {
        noRecommendationsEl.style.display = 'flex';
      }
      // Clear any existing recommendations
      const existingRecs = listEl.querySelectorAll('.recommendation-item');
      existingRecs.forEach(rec => rec.remove());
      return;
    }
    
    if (noRecommendationsEl) {
      noRecommendationsEl.style.display = 'none';
    }
    
    // Clear existing recommendations
    const existingRecs = listEl.querySelectorAll('.recommendation-item');
    existingRecs.forEach(rec => rec.remove());
    
    // Add new recommendations
    analysis.recommendations.forEach((recommendation, index) => {
      const recEl = document.createElement('div');
      recEl.className = 'recommendation-item';
      recEl.innerHTML = `
        <div class="recommendation-icon">${this.getRecommendationIcon(recommendation)}</div>
        <div class="recommendation-text">${recommendation}</div>
      `;
      listEl.appendChild(recEl);
    });
  }
  
  /**
   * Get appropriate icon for recommendation
   * @param {string} recommendation - Recommendation text
   * @returns {string} Icon emoji
   */
  getRecommendationIcon(recommendation) {
    const text = recommendation.toLowerCase();
    if (text.includes('attack') || text.includes('initiative')) return '⚔️';
    if (text.includes('defend') || text.includes('safety')) return '🛡️';
    if (text.includes('trade') || text.includes('simplify')) return '🔄';
    if (text.includes('center') || text.includes('control')) return '🎯';
    if (text.includes('king') || text.includes('danger')) return '👑';
    if (text.includes('material') || text.includes('advantage')) return '⚖️';
    return '💡';
  }
  
  /**
   * Update detailed statistics section
   * @param {Object} analysis - Analysis result
   */
  updateDetailedStatistics(analysis) {
    this.updateMaterialBreakdown(analysis.materialBalance);
    this.updateActivityDetails(analysis.pieceActivity);
    this.updateSafetyDetails(analysis.kingSafety);
  }
  
  /**
   * Update material breakdown
   * @param {Object} material - Material balance data
   */
  updateMaterialBreakdown(material) {
    const whiteValueEl = document.getElementById('whiteMaterialValue');
    const blackValueEl = document.getElementById('blackMaterialValue');
    const whiteCountsEl = document.getElementById('whitePieceCounts');
    const blackCountsEl = document.getElementById('blackPieceCounts');
    
    if (whiteValueEl) whiteValueEl.textContent = material.whiteValue;
    if (blackValueEl) blackValueEl.textContent = material.blackValue;
    
    if (whiteCountsEl) {
      whiteCountsEl.innerHTML = this.formatPieceCounts(material.whitePieces);
    }
    if (blackCountsEl) {
      blackCountsEl.innerHTML = this.formatPieceCounts(material.blackPieces);
    }
  }
  
  /**
   * Format piece counts for display
   * @param {Object} pieces - Piece counts object
   * @returns {string} Formatted HTML
   */
  formatPieceCounts(pieces) {
    const pieceSymbols = {
      'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙'
    };
    
    return Object.entries(pieces)
      .filter(([piece, count]) => count > 0)
      .map(([piece, count]) => `<span class="piece-count">${pieceSymbols[piece] || piece.toUpperCase()}×${count}</span>`)
      .join(' ');
  }
  
  /**
   * Update activity details
   * @param {Object} activity - Piece activity data
   */
  updateActivityDetails(activity) {
    const totalMovesEl = document.getElementById('totalMovesValue');
    const avgMovesEl = document.getElementById('avgMovesValue');
    
    if (totalMovesEl) {
      totalMovesEl.textContent = `W: ${activity.white.totalMoves}, B: ${activity.black.totalMoves}`;
    }
    
    if (avgMovesEl) {
      const whiteAvg = activity.white.averageMovesPerPiece.toFixed(1);
      const blackAvg = activity.black.averageMovesPerPiece.toFixed(1);
      avgMovesEl.textContent = `W: ${whiteAvg}, B: ${blackAvg}`;
    }
  }
  
  /**
   * Update safety details
   * @param {Object} safety - King safety data
   */
  updateSafetyDetails(safety) {
    const whitePositionEl = document.getElementById('whiteKingPosition');
    const whiteEscapeEl = document.getElementById('whiteEscapeSquares');
    const blackPositionEl = document.getElementById('blackKingPosition');
    const blackEscapeEl = document.getElementById('blackEscapeSquares');
    
    if (whitePositionEl && safety.white.position) {
      const pos = this.formatPosition(safety.white.position);
      whitePositionEl.textContent = `Position: ${pos}`;
    }
    
    if (whiteEscapeEl) {
      whiteEscapeEl.textContent = `Escape squares: ${safety.white.escapeSquares}`;
    }
    
    if (blackPositionEl && safety.black.position) {
      const pos = this.formatPosition(safety.black.position);
      blackPositionEl.textContent = `Position: ${pos}`;
    }
    
    if (blackEscapeEl) {
      blackEscapeEl.textContent = `Escape squares: ${safety.black.escapeSquares}`;
    }
  }
  
  /**
   * Format position coordinates to algebraic notation
   * @param {Object} position - Position object with row, col
   * @returns {string} Algebraic notation (e.g., "e2")
   */
  formatPosition(position) {
    const files = ['e', 'd', 'c', 'b']; // 4x5 board files (reversed for 0-based indexing)
    const ranks = ['5', '4', '3', '2', '1']; // 4x5 board ranks (reversed for 0-based indexing)
    
    if (position.row >= 0 && position.row < 5 && position.col >= 0 && position.col < 4) {
      return files[position.col] + ranks[position.row];
    }
    
    return `${position.row},${position.col}`;
  }
  
  /**
   * Update report timestamp
   * @param {number} timestamp - Analysis timestamp
   */
  updateTimestamp(timestamp) {
    const timestampEl = document.getElementById('reportTimestamp');
    if (timestampEl) {
      const date = new Date(timestamp);
      const timeString = date.toLocaleTimeString();
      timestampEl.textContent = `Analysis generated at: ${timeString}`;
    }
  }
  
  /**
   * Show the evaluation report
   */
  showReport() {
    if (this.reportContainer) {
      this.reportContainer.classList.remove('hidden');
      this.isVisible = true;
      
      // Animate in
      setTimeout(() => {
        this.reportContainer.classList.add('visible');
      }, 10);
    }
  }
  
  /**
   * Hide the evaluation report
   */
  hideReport() {
    if (this.reportContainer) {
      this.reportContainer.classList.remove('visible');
      this.isVisible = false;
      
      // Hide after animation
      setTimeout(() => {
        this.reportContainer.classList.add('hidden');
      }, 300);
    }
  }
  
  /**
   * Display error report
   * @param {string} message - Error message
   */
  displayErrorReport(message) {
    // Create simple error display
    const analysisTextEl = document.getElementById('analysisText');
    if (analysisTextEl) {
      analysisTextEl.innerHTML = `
        <div class="analysis-error">
          <span class="error-icon">⚠️</span>
          <span class="error-message">${message}</span>
        </div>
      `;
    }
  }
  
  /**
   * Export analysis report as JSON
   */
  exportReport() {
    if (!this.currentAnalysis) return;
    
    const reportData = {
      timestamp: this.currentAnalysis.timestamp,
      positionType: this.determineEnhancedPositionType(this.currentAnalysis),
      analysis: this.currentAnalysis,
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `position-analysis-${Date.now()}.json`;
    link.click();
  }
  
  /**
   * Share analysis report
   */
  shareReport() {
    if (!this.currentAnalysis) return;
    
    const positionType = this.determineEnhancedPositionType(this.currentAnalysis);
    const material = this.currentAnalysis.materialBalance;
    const activity = this.currentAnalysis.pieceActivity;
    
    const shareText = `4x5 Chess Position Analysis:
Position Type: ${positionType.replace(/_/g, ' ')}
Material: ${material.advantage === 'equal' ? 'Equal' : `${material.advantage} +${material.advantageAmount}`}
Activity: White ${activity.white.mobilePieces}, Black ${activity.black.mobilePieces}
Generated at: ${new Date(this.currentAnalysis.timestamp).toLocaleString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: '4x5 Chess Position Analysis',
        text: shareText
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        // Show success message
        this.showToast('Analysis copied to clipboard!');
      });
    }
  }
  
  /**
   * Show toast message
   * @param {string} message - Message to show
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  /**
   * Toggle collapsible report section
   * @param {string} sectionId - Section identifier
   */
  toggleSection(sectionId) {
    const content = document.getElementById(sectionId + 'Content');
    const header = content?.previousElementSibling;
    const chevron = header?.querySelector('.chevron');
    
    if (content) {
      const isExpanded = !content.classList.contains('collapsed');
      
      if (isExpanded) {
        content.classList.add('collapsed');
        if (chevron) chevron.textContent = '▸';
      } else {
        content.classList.remove('collapsed');
        if (chevron) chevron.textContent = '▾';
      }
    }
  }
}

// Global functions for HTML event handlers
function closeEvaluationReport() {
  if (window.positionEvaluationReport) {
    window.positionEvaluationReport.hideReport();
  }
}

function toggleReportSection(sectionId) {
  if (window.positionEvaluationReport) {
    window.positionEvaluationReport.toggleSection(sectionId);
  }
}

function exportAnalysisReport() {
  if (window.positionEvaluationReport) {
    window.positionEvaluationReport.exportReport();
  }
}

function shareAnalysisReport() {
  if (window.positionEvaluationReport) {
    window.positionEvaluationReport.shareReport();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PositionEvaluationReport;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
  window.PositionEvaluationReport = PositionEvaluationReport;
}