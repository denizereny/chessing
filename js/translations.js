const translations = {
  en: {
    settings: "Settings",
    newGame: "New Game",
    switchSides: "Switch Sides",
    undo: "Undo",
    aiDifficulty: "AI Difficulty:",
    easy: "🟢 Easy (Level 1)",
    medium: "🟡 Medium (Level 2)",
    hard: "🔴 Hard (Level 3)",
    expert: "💀 Expert (Level 4)",
    moves: "Moves",
    captured: "Captured",
    whiteCaptured: "White Captured",
    blackCaptured: "Black Captured",
    gameStarting: "Game Starting...",
    blackWon: "🏆 Black Won!",
    whiteWon: "🏆 White Won!",
    whitePlaying: "White Playing",
    blackPlaying: "Black Playing",
    moveHistory: "Move History",
    switchedToBlack: "You are now playing BLACK!",
    switchedToWhite: "You are now playing WHITE!",
    aiLevelSet: "AI difficulty: Level",
    footerText: "© 2025 VizyonEkibi",
    startGame: "START GAME",
    gameTitle: "♔ 4×5 Chess Pro ♚",
    gameSubtitle: "Strategic Mastery in Minimal Space",
    playAgain: "PLAY AGAIN",
    mainMenu: "MAIN MENU",
    gameOver: "GAME OVER",
    reviewGame: "REVIEW GAME",
    // Color customization
    colorSettings: "Color Settings",
    boardColors: "Board Colors",
    lightSquares: "Light Squares",
    darkSquares: "Dark Squares",
    pieceColors: "Piece Colors",
    whitePieces: "White Pieces",
    blackPieces: "Black Pieces",
    colorPresets: "Color Presets",
    boardColorsUpdated: "Board colors updated!",
    pieceColorsUpdated: "Piece colors updated!",
    invalidHexColor: "Invalid hex color format!",
    presetApplied: "Preset applied!",
    colorsReset: "Colors reset to default!",
    // Piece setup
    pieceSetup: "Piece Setup",
    needBothKings: "Both kings are required!",
    customGameStarted: "Custom game started!",
    squareOccupied: "Square is already occupied!",
    invalidPawnPosition: "Pawns cannot be placed on this rank!",
    tooManyPieces: "Too many pieces of this type!",
    invalidMove: "Invalid move!",
    positionValid: "Position is valid",
    needBothKings: "Both kings are required!",
    fixErrorsFirst: "Fix position errors first",
    startCustomGame: "Start custom game",
    kingsAdjacent: "Kings cannot be adjacent",
    whiteInCheck: "White king is in check!",
    blackInCheck: "Black king is in check!",
    checkmate: "Checkmate!",
    stalemate: "Stalemate!",
    positionHasErrors: "Position has errors",
    positionHasWarnings: "Position has warnings",
    piecePlaced: "Piece placed successfully!",
    pieceDeleted: "Piece deleted!",
    dragCancelled: "Drag operation cancelled",
    randomSetupCreated: "Random setup created!",
    presetLoaded: "Preset loaded!",
    boardCleared: "Board cleared!",
    defaultSetup: "Default position restored!",
    // Color presets
    classic: "Classic",
    wood: "Wood",
    marble: "Marble",
    neon: "Neon",
    ocean: "Ocean",
    reset: "Reset",
    // Language
    language: "🌍 Language:",
    // Piece Setup
    setupInstructions: "Drag pieces from the palette to the board, or click to select and place. Create your custom position!",
    piecePaletteTitle: "Piece Palette",
    setupBoardTitle: "Board Setup",
    lblFirstMove: "First Move:",
    btnClearBoard: "🗑️ Clear Board",
    btnResetToDefault: "🔄 Default Position",
    btnStartCustomGame: "▶ Start Game",
    btnCancelSetup: "Cancel",
    boardCleared: "Board cleared!",
    defaultSetup: "Default position restored!",
    // Enhanced piece setup
    randomSetupCreated: "Random setup created!",
    enterSetupName: "Enter setup name:",
    setupSaved: "Setup saved!",
    noSavedSetups: "No saved setups found!",
    selectSetup: "Select setup:",
    setupLoaded: "Setup loaded!",
    presetLoaded: "Preset loaded!",
    positionValid: "Position is valid",
    invalidPosition: "Invalid position - need exactly one king per side",
    whiteAdvantage: "White has material advantage",
    blackAdvantage: "Black has material advantage", 
    materialEqual: "Material is equal",
    endgamePosition: "This appears to be an endgame position",
    complexPosition: "This is a complex position with many pieces",
    queensPresent: "Queens are present - tactical opportunities likely",
    setUpPieces: "Set up pieces to see analysis",
    whitePiecesTitle: "White Pieces",
    blackPiecesTitle: "Black Pieces",
    clearBoardText: "Clear Board",
    resetDefaultText: "Default Position",
    randomSetupText: "Random Setup",
    saveSetupText: "Save Setup",
    loadSetupText: "Load Setup",
    presetsTitle: "Quick Setups:",
    userPresetsTitle: "My Presets:",
    loadPresetText: "Load",
    saveAsPresetText: "Save Current",
    deletePresetText: "Delete",
    exportPresetsText: "Export",
    importPresetsText: "Import",
    endgameText: "Endgame",
    middlegameText: "Middlegame", 
    puzzleText: "Puzzle",
    trashText: "Drop here to delete",
    whiteKingsLabel: "White Kings:",
    blackKingsLabel: "Black Kings:",
    totalPiecesLabel: "Total Pieces:",
    materialBalanceLabel: "Material Balance:",
    whiteFirstOption: "White",
    blackFirstOption: "Black",
    easyOption: "🟢 Easy",
    mediumOption: "🟡 Medium",
    hardOption: "🔴 Hard",
    expertOption: "💀 Expert",
    analysisTitle: "Position Analysis:",
    analyzeText: "Analyze",
    startGameText: "Start Game",
    cancelText: "Cancel",
    
    // Position Evaluation Report System
    positionAnalysisReport: "Position Analysis Report",
    positionType: "Position Type",
    analysisOverview: "Analysis Overview",
    materialBalance: "Material Balance",
    pieceActivity: "Piece Activity",
    kingSafety: "King Safety",
    centerControl: "Center Control",
    
    // Position History Interface
    positionHistory: "Position History",
    toggleHistory: "Toggle History",
    undo: "Undo",
    redo: "Redo",
    positions: "positions",
    noHistoryYet: "No history yet. Start making moves!",
    clearHistory: "Clear History",
    export: "Export",
    import: "Import",
    jumpToPosition: "Jump to Position",
    previewPosition: "Preview Position",
    noDescription: "No description",
    created: "Created",
    cancel: "Cancel",
    confirmClearHistory: "Confirm Clear History",
    clearHistoryWarning: "This will permanently delete all position history.",
    thisActionCannotBeUndone: "This action cannot be undone.",
    historyCleared: "History cleared successfully",
    historyExported: "History exported successfully",
    historyImported: "History imported successfully",
    exportError: "Error exporting history",
    importError: "Error importing history",
    undoPerformed: "Undo performed",
    redoPerformed: "Redo performed",
    jumpedToPosition: "Jumped to position {0}",
    exportHistory: "Export History",
    importHistory: "Import History",
    strategicRecommendations: "Strategic Recommendations",
    detailedStatistics: "Detailed Statistics",
    materialBreakdown: "Material Breakdown",
    activityDetails: "Activity Details",
    kingSafetyDetails: "King Safety Details",
    totalMoves: "Total Moves",
    avgMovesPerPiece: "Avg Moves/Piece",
    escapeSquares: "Escape squares",
    position: "Position",
    analysisGeneratedAt: "Analysis generated at",
    exportReport: "Export",
    shareReport: "Share",
    noRecommendationsAvailable: "Set up a position to see strategic recommendations",
    balancedPosition: "Equal position",
    whiteAdvantagePosition: "White has advantage",
    blackAdvantagePosition: "Black has advantage",
    slightWhiteAdvantage: "Slight white advantage",
    slightBlackAdvantage: "Slight black advantage",
    whitePositionalAdvantage: "White positional advantage",
    blackPositionalAdvantage: "Black positional advantage",
    
    // Enhanced Theme System
    themeToggle: "Theme Toggle",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
    currentTheme: "Current theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    systemTheme: "System",
    themeChanged: "Theme changed successfully",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    
    // Enhanced Drag & Drop
    dragToMove: "Drag to move piece",
    dropToPlace: "Drop to place piece",
    invalidDrop: "Invalid drop location",
    pieceMovedSuccessfully: "Piece moved successfully",
    dragCancelledByUser: "Drag cancelled by user",
    
    // Extended Preset System
    presetCategories: "Preset Categories",
    openingPresets: "Opening Positions",
    middlegamePresets: "Middlegame Positions", 
    endgamePresets: "Endgame Positions",
    puzzlePresets: "Puzzle Positions",
    tacticalPresets: "Tactical Positions",
    educationalPresets: "Educational Positions",
    customPresets: "Custom Presets",
    presetDescription: "Preset Description",
    presetDifficulty: "Difficulty",
    presetTags: "Tags",
    createNewPreset: "Create New Preset",
    editPreset: "Edit Preset",
    deletePreset: "Delete Preset",
    confirmDeletePreset: "Are you sure you want to delete this preset?",
    presetCreated: "Preset created successfully",
    presetUpdated: "Preset updated successfully",
    presetDeleted: "Preset deleted successfully",
    
    // Advanced Position Analysis
    positionAnalysis: "Position Analysis",
    materialAnalysis: "Material Analysis",
    pieceActivityAnalysis: "Piece Activity Analysis",
    kingSafetyAnalysis: "King Safety Analysis",
    centerControlAnalysis: "Center Control Analysis",
    positionEvaluation: "Position Evaluation",
    strategicAssessment: "Strategic Assessment",
    tacticalOpportunities: "Tactical Opportunities",
    positionalFactors: "Positional Factors",
    analysisInProgress: "Analysis in progress...",
    analysisComplete: "Analysis complete",
    analysisError: "Analysis error occurred",
    
    // Position Sharing System
    sharePosition: "Share Position",
    generateShareCode: "Generate Share Code",
    copyShareCode: "Copy Share Code",
    shareCodeCopied: "Share code copied to clipboard",
    shareCodeGenerated: "Share code generated",
    loadFromCode: "Load from Code",
    enterShareCode: "Enter share code",
    invalidShareCode: "Invalid share code",
    shareCodeTooLong: "Share code too long (max 12 characters)",
    shareViaURL: "Share via URL",
    shareViaQR: "Share via QR Code",
    qrCodeGenerated: "QR code generated",
    scanQRCode: "Scan QR Code",
    qrScannerActive: "QR scanner active",
    qrScannerStopped: "QR scanner stopped",
    positionShared: "Position shared successfully",
    
    // Position History
    positionHistoryTitle: "Position History",
    undoMove: "Undo Move",
    redoMove: "Redo Move",
    jumpToPosition: "Jump to Position",
    clearPositionHistory: "Clear Position History",
    historyEmpty: "History is empty",
    cannotUndo: "Cannot undo",
    cannotRedo: "Cannot redo",
    historyCleared: "History cleared",
    positionRestored: "Position restored",
    
    // Mobile Optimization
    touchToSelect: "Touch to select",
    doubleTapToPlace: "Double tap to place",
    pinchToZoom: "Pinch to zoom",
    swipeToNavigate: "Swipe to navigate",
    hapticFeedback: "Haptic Feedback",
    touchOptimized: "Touch optimized",
    mobileLayout: "Mobile Layout",
    
    // Performance & Loading
    loading: "Loading...",
    processing: "Processing...",
    analyzing: "Analyzing...",
    generating: "Generating...",
    validating: "Validating...",
    saving: "Saving...",
    loadingPreset: "Loading preset...",
    analyzingPosition: "Analyzing position...",
    generatingShareCode: "Generating share code...",
    validatingPosition: "Validating position...",
    operationCancelled: "Operation cancelled",
    operationCompleted: "Operation completed",
    operationFailed: "Operation failed",
    
    // Error Messages
    errorOccurred: "An error occurred",
    invalidOperation: "Invalid operation",
    operationTimeout: "Operation timed out",
    networkError: "Network error",
    storageError: "Storage error",
    validationError: "Validation error",
    unexpectedError: "Unexpected error",
    
    // Success Messages
    operationSuccessful: "Operation successful",
    positionSaved: "Position saved",
    settingsUpdated: "Settings updated",
    preferencesApplied: "Preferences applied",
    
    // Accessibility
    screenReaderAnnouncement: "Screen reader announcement",
    keyboardNavigation: "Use arrow keys to navigate",
    accessibilityMode: "Accessibility Mode",
    highContrast: "High Contrast",
    largeText: "Large Text",
    reducedMotion: "Reduced Motion",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  tr: {
    settings: "Ayarlar",
    newGame: "Yeni Oyun",
    switchSides: "Taraf Değiştir",
    undo: "Geri Al",
    aiDifficulty: "AI Zorluğu:",
    easy: "🟢 Kolay (Seviye 1)",
    medium: "🟡 Orta (Seviye 2)",
    hard: "🔴 Zor (Seviye 3)",
    expert: "💀 Uzman (Seviye 4)",
    moves: "Hamle",
    captured: "Alınan",
    whiteCaptured: "Beyaz Aldı",
    blackCaptured: "Siyah Aldı",
    gameStarting: "Oyun Başlıyor...",
    blackWon: "🏆 Siyah Kazandı!",
    whiteWon: "🏆 Beyaz Kazandı!",
    whitePlaying: "Beyaz Oynuyor",
    blackPlaying: "Siyah Oynuyor",
    moveHistory: "Hamle Geçmişi",
    switchedToBlack: "Artık SİYAH oynuyorsunuz!",
    switchedToWhite: "Artık BEYAZ oynuyorsunuz!",
    aiLevelSet: "AI zorluğu: Seviye",
    footerText: "© 2025 VizyonEkibi",
    startGame: "OYUNA BAŞLA",
    gameTitle: "♔ 4×5 Satranç Pro ♚",
    gameSubtitle: "Minimum Alanda Stratejik Ustalık",
    playAgain: "TEKRAR OYNA",
    mainMenu: "ANA MENÜ",
    gameOver: "OYUN BİTTİ",
    reviewGame: "OYUNU İNCELE",
    // Color customization
    colorSettings: "Renk Ayarları",
    boardColors: "Tahta Renkleri",
    lightSquares: "Açık Kareler",
    darkSquares: "Koyu Kareler",
    pieceColors: "Taş Renkleri",
    whitePieces: "Beyaz Taşlar",
    blackPieces: "Siyah Taşlar",
    colorPresets: "Renk Şablonları",
    boardColorsUpdated: "Tahta renkleri güncellendi!",
    pieceColorsUpdated: "Taş renkleri güncellendi!",
    invalidHexColor: "Geçersiz hex renk formatı!",
    presetApplied: "Şablon uygulandı!",
    colorsReset: "Renkler varsayılana sıfırlandı!",
    // Piece setup
    pieceSetup: "Taş Düzeni",
    needBothKings: "Her iki kral da gerekli!",
    customGameStarted: "Özel oyun başlatıldı!",
    squareOccupied: "Kare zaten dolu!",
    invalidPawnPosition: "Piyonlar bu sıraya yerleştirilemez!",
    tooManyPieces: "Bu türden çok fazla taş!",
    invalidMove: "Geçersiz hamle!",
    positionValid: "Pozisyon geçerli",
    needBothKings: "Her iki kral da gerekli!",
    fixErrorsFirst: "Önce pozisyon hatalarını düzeltin",
    startCustomGame: "Özel oyun başlat",
    kingsAdjacent: "Krallar yan yana olamaz",
    whiteInCheck: "Beyaz kral şahta!",
    blackInCheck: "Siyah kral şahta!",
    checkmate: "Şah mat!",
    stalemate: "Pat durumu!",
    positionHasErrors: "Pozisyonda hatalar var",
    positionHasWarnings: "Pozisyonda uyarılar var",
    piecePlaced: "Taş başarıyla yerleştirildi!",
    pieceDeleted: "Taş silindi!",
    dragCancelled: "Sürükleme işlemi iptal edildi",
    randomSetupCreated: "Rastgele düzen oluşturuldu!",
    presetLoaded: "Şablon yüklendi!",
    boardCleared: "Tahta temizlendi!",
    defaultSetup: "Varsayılan pozisyon geri yüklendi!",
    // Color presets
    classic: "Klasik",
    wood: "Ahşap",
    marble: "Mermer",
    neon: "Neon",
    ocean: "Okyanus",
    reset: "Sıfırla",
    // Language
    language: "🌍 Dil:",
    // Piece Setup
    setupInstructions: "Taşları paletten tahtaya sürükleyin veya seçip yerleştirmek için tıklayın. Özel pozisyonunuzu oluşturun!",
    piecePaletteTitle: "Taş Paleti",
    setupBoardTitle: "Tahta Düzeni",
    lblFirstMove: "İlk Hamle:",
    btnClearBoard: "🗑️ Tahtayı Temizle",
    btnResetToDefault: "🔄 Varsayılan Pozisyon",
    btnStartCustomGame: "▶ Oyunu Başlat",
    btnCancelSetup: "İptal",
    boardCleared: "Tahta temizlendi!",
    defaultSetup: "Varsayılan pozisyon geri yüklendi!",
    // Enhanced piece setup
    randomSetupCreated: "Rastgele düzen oluşturuldu!",
    enterSetupName: "Düzen adını girin:",
    setupSaved: "Düzen kaydedildi!",
    noSavedSetups: "Kaydedilmiş düzen bulunamadı!",
    selectSetup: "Düzen seçin:",
    setupLoaded: "Düzen yüklendi!",
    presetLoaded: "Şablon yüklendi!",
    positionValid: "Pozisyon geçerli",
    invalidPosition: "Geçersiz pozisyon - her tarafta tam bir kral gerekli",
    whiteAdvantage: "Beyazın malzeme avantajı var",
    blackAdvantage: "Siyahın malzeme avantajı var",
    materialEqual: "Malzeme eşit",
    endgamePosition: "Bu bir oyun sonu pozisyonu gibi görünüyor",
    complexPosition: "Bu çok taşlı karmaşık bir pozisyon",
    queensPresent: "Vezirler mevcut - taktiksel fırsatlar olası",
    setUpPieces: "Analiz görmek için taşları yerleştirin",
    whitePiecesTitle: "Beyaz Taşlar",
    blackPiecesTitle: "Siyah Taşlar",
    clearBoardText: "Tahtayı Temizle",
    resetDefaultText: "Varsayılan Pozisyon",
    randomSetupText: "Rastgele Düzen",
    saveSetupText: "Düzeni Kaydet",
    loadSetupText: "Düzen Yükle",
    presetsTitle: "Hızlı Düzenler:",
    userPresetsTitle: "Benim Şablonlarım:",
    loadPresetText: "Yükle",
    saveAsPresetText: "Mevcut Kaydet",
    deletePresetText: "Sil",
    exportPresetsText: "Dışa Aktar",
    importPresetsText: "İçe Aktar",
    endgameText: "Oyun Sonu",
    middlegameText: "Orta Oyun",
    puzzleText: "Bulmaca",
    trashText: "Silmek için buraya bırakın",
    whiteKingsLabel: "Beyaz Krallar:",
    blackKingsLabel: "Siyah Krallar:",
    totalPiecesLabel: "Toplam Taş:",
    materialBalanceLabel: "Malzeme Dengesi:",
    whiteFirstOption: "Beyaz",
    blackFirstOption: "Siyah",
    easyOption: "🟢 Kolay",
    mediumOption: "🟡 Orta",
    hardOption: "🔴 Zor",
    expertOption: "💀 Uzman",
    analysisTitle: "Pozisyon Analizi:",
    analyzeText: "Analiz Et",
    startGameText: "Oyunu Başlat",
    cancelText: "İptal",
    
    // Position Evaluation Report System
    positionAnalysisReport: "Pozisyon Analiz Raporu",
    positionType: "Pozisyon Tipi",
    analysisOverview: "Analiz Özeti",
    materialBalance: "Materyal Dengesi",
    pieceActivity: "Taş Aktivitesi",
    kingSafety: "Kral Güvenliği",
    centerControl: "Merkez Kontrolü",
    
    // Position History Interface
    positionHistory: "Pozisyon Geçmişi",
    toggleHistory: "Geçmişi Aç/Kapat",
    undo: "Geri Al",
    redo: "İleri Al",
    positions: "pozisyon",
    noHistoryYet: "Henüz geçmiş yok. Hamle yapmaya başlayın!",
    clearHistory: "Geçmişi Temizle",
    export: "Dışa Aktar",
    import: "İçe Aktar",
    jumpToPosition: "Pozisyona Git",
    previewPosition: "Pozisyonu Önizle",
    noDescription: "Açıklama yok",
    created: "Oluşturuldu",
    cancel: "İptal",
    confirmClearHistory: "Geçmiş Temizlemeyi Onayla",
    clearHistoryWarning: "Bu işlem tüm pozisyon geçmişini kalıcı olarak silecektir.",
    thisActionCannotBeUndone: "Bu işlem geri alınamaz.",
    historyCleared: "Geçmiş başarıyla temizlendi",
    historyExported: "Geçmiş başarıyla dışa aktarıldı",
    historyImported: "Geçmiş başarıyla içe aktarıldı",
    exportError: "Geçmiş dışa aktarma hatası",
    importError: "Geçmiş içe aktarma hatası",
    undoPerformed: "Geri alma yapıldı",
    redoPerformed: "İleri alma yapıldı",
    jumpedToPosition: "{0} numaralı pozisyona gidildi",
    exportHistory: "Geçmişi Dışa Aktar",
    importHistory: "Geçmişi İçe Aktar",
    strategicRecommendations: "Stratejik Öneriler",
    detailedStatistics: "Detaylı İstatistikler",
    materialBreakdown: "Materyal Dağılımı",
    activityDetails: "Aktivite Detayları",
    kingSafetyDetails: "Kral Güvenliği Detayları",
    totalMoves: "Toplam Hamle",
    avgMovesPerPiece: "Taş Başına Ortalama Hamle",
    escapeSquares: "Kaçış kareleri",
    position: "Pozisyon",
    analysisGeneratedAt: "Analiz oluşturulma zamanı",
    exportReport: "Dışa Aktar",
    shareReport: "Paylaş",
    noRecommendationsAvailable: "Stratejik öneriler görmek için bir pozisyon kurun",
    balancedPosition: "Dengeli pozisyon",
    whiteAdvantagePosition: "Beyazın avantajı var",
    blackAdvantagePosition: "Siyahın avantajı var",
    slightWhiteAdvantage: "Beyazın hafif avantajı",
    slightBlackAdvantage: "Siyahın hafif avantajı",
    whitePositionalAdvantage: "Beyazın pozisyonel avantajı",
    blackPositionalAdvantage: "Siyahın pozisyonel avantajı",
    
    // Enhanced Theme System
    themeToggle: "Tema Değiştir",
    switchToLight: "Açık temaya geç",
    switchToDark: "Koyu temaya geç",
    currentTheme: "Mevcut tema",
    lightTheme: "Açık",
    darkTheme: "Koyu",
    systemTheme: "Sistem",
    themeChanged: "Tema başarıyla değiştirildi",
    darkMode: "Koyu Mod",
    lightMode: "Açık Mod",
    
    // Enhanced Drag & Drop
    dragToMove: "Taşı hareket ettirmek için sürükle",
    dropToPlace: "Yerleştirmek için bırak",
    invalidDrop: "Geçersiz bırakma konumu",
    pieceMovedSuccessfully: "Taş başarıyla taşındı",
    dragCancelledByUser: "Sürükleme kullanıcı tarafından iptal edildi",
    
    // Extended Preset System
    presetCategories: "Şablon Kategorileri",
    openingPresets: "Açılış Pozisyonları",
    middlegamePresets: "Orta Oyun Pozisyonları",
    endgamePresets: "Oyun Sonu Pozisyonları",
    puzzlePresets: "Bulmaca Pozisyonları",
    tacticalPresets: "Taktik Pozisyonları",
    educationalPresets: "Eğitim Pozisyonları",
    customPresets: "Özel Şablonlar",
    presetDescription: "Şablon Açıklaması",
    presetDifficulty: "Zorluk",
    presetTags: "Etiketler",
    createNewPreset: "Yeni Şablon Oluştur",
    editPreset: "Şablonu Düzenle",
    deletePreset: "Şablonu Sil",
    confirmDeletePreset: "Bu şablonu silmek istediğinizden emin misiniz?",
    presetCreated: "Şablon başarıyla oluşturuldu",
    presetUpdated: "Şablon başarıyla güncellendi",
    presetDeleted: "Şablon başarıyla silindi",
    
    // Advanced Position Analysis
    positionAnalysis: "Pozisyon Analizi",
    materialAnalysis: "Materyal Analizi",
    pieceActivityAnalysis: "Taş Aktivite Analizi",
    kingSafetyAnalysis: "Kral Güvenliği Analizi",
    centerControlAnalysis: "Merkez Kontrolü Analizi",
    positionEvaluation: "Pozisyon Değerlendirmesi",
    strategicAssessment: "Stratejik Değerlendirme",
    tacticalOpportunities: "Taktik Fırsatları",
    positionalFactors: "Pozisyonel Faktörler",
    analysisInProgress: "Analiz devam ediyor...",
    analysisComplete: "Analiz tamamlandı",
    analysisError: "Analiz hatası oluştu",
    
    // Position Sharing System
    sharePosition: "Pozisyonu Paylaş",
    generateShareCode: "Paylaşım Kodu Oluştur",
    copyShareCode: "Paylaşım Kodunu Kopyala",
    shareCodeCopied: "Paylaşım kodu panoya kopyalandı",
    shareCodeGenerated: "Paylaşım kodu oluşturuldu",
    loadFromCode: "Koddan Yükle",
    enterShareCode: "Paylaşım kodunu girin",
    invalidShareCode: "Geçersiz paylaşım kodu",
    shareCodeTooLong: "Paylaşım kodu çok uzun (maks 12 karakter)",
    shareViaURL: "URL ile Paylaş",
    shareViaQR: "QR Kod ile Paylaş",
    qrCodeGenerated: "QR kod oluşturuldu",
    scanQRCode: "QR Kod Tara",
    qrScannerActive: "QR tarayıcı aktif",
    qrScannerStopped: "QR tarayıcı durduruldu",
    positionShared: "Pozisyon başarıyla paylaşıldı",
    
    // Position History
    positionHistoryTitle: "Pozisyon Geçmişi",
    undoMove: "Hamleyi Geri Al",
    redoMove: "Hamleyi İleri Al",
    jumpToPosition: "Pozisyona Git",
    clearPositionHistory: "Pozisyon Geçmişini Temizle",
    historyEmpty: "Geçmiş boş",
    cannotUndo: "Geri alınamaz",
    cannotRedo: "İleri alınamaz",
    historyCleared: "Geçmiş temizlendi",
    positionRestored: "Pozisyon geri yüklendi",
    
    // Mobile Optimization
    touchToSelect: "Seçmek için dokunun",
    doubleTapToPlace: "Yerleştirmek için çift dokunun",
    pinchToZoom: "Yakınlaştırmak için kıstırın",
    swipeToNavigate: "Gezinmek için kaydırın",
    hapticFeedback: "Dokunsal Geri Bildirim",
    touchOptimized: "Dokunmatik için optimize edildi",
    mobileLayout: "Mobil Düzen",
    
    // Performance & Loading
    loading: "Yükleniyor...",
    processing: "İşleniyor...",
    analyzing: "Analiz ediliyor...",
    generating: "Oluşturuluyor...",
    validating: "Doğrulanıyor...",
    saving: "Kaydediliyor...",
    loadingPreset: "Şablon yükleniyor...",
    analyzingPosition: "Pozisyon analiz ediliyor...",
    generatingShareCode: "Paylaşım kodu oluşturuluyor...",
    validatingPosition: "Pozisyon doğrulanıyor...",
    operationCancelled: "İşlem iptal edildi",
    operationCompleted: "İşlem tamamlandı",
    operationFailed: "İşlem başarısız",
    
    // Error Messages
    errorOccurred: "Bir hata oluştu",
    invalidOperation: "Geçersiz işlem",
    operationTimeout: "İşlem zaman aşımına uğradı",
    networkError: "Ağ hatası",
    storageError: "Depolama hatası",
    validationError: "Doğrulama hatası",
    unexpectedError: "Beklenmeyen hata",
    
    // Success Messages
    operationSuccessful: "İşlem başarılı",
    positionSaved: "Pozisyon kaydedildi",
    settingsUpdated: "Ayarlar güncellendi",
    preferencesApplied: "Tercihler uygulandı",
    
    // Accessibility
    screenReaderAnnouncement: "Ekran okuyucu duyurusu",
    keyboardNavigation: "Gezinmek için ok tuşlarını kullanın",
    accessibilityMode: "Erişilebilirlik Modu",
    highContrast: "Yüksek Kontrast",
    largeText: "Büyük Metin",
    reducedMotion: "Azaltılmış Hareket",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  es: {
    settings: "Ajustes",
    newGame: "Nuevo Juego",
    switchSides: "Cambiar Lados",
    undo: "Deshacer",
    aiDifficulty: "Dificultad IA:",
    easy: "🟢 Fácil (Nivel 1)",
    medium: "🟡 Medio (Nivel 2)",
    hard: "🔴 Difícil (Nivel 3)",
    expert: "💀 Experto (Nivel 4)",
    moves: "Movimientos",
    captured: "Capturados",
    whiteCaptured: "Blancas Capturaron",
    blackCaptured: "Negras Capturaron",
    gameStarting: "Juego Comenzando...",
    blackWon: "🏆 ¡Negras Ganan!",
    whiteWon: "🏆 ¡Blancas Ganan!",
    whitePlaying: "Juegan Blancas",
    blackPlaying: "Juegan Negras",
    moveHistory: "Historial",
    switchedToBlack: "¡Ahora juegas con NEGRAS!",
    switchedToWhite: "¡Ahora juegas con BLANCAS!",
    aiLevelSet: "Dificultad IA: Nivel",
    footerText: "© 2025 VizyonEkibi",
    startGame: "COMENZAR JUEGO",
    gameTitle: "♔ 4×5 Ajedrez Pro ♚",
    gameSubtitle: "Maestría Estratégica en Espacio Mínimo",
    playAgain: "JUGAR DE NUEVO",
    mainMenu: "MENÚ PRINCIPAL",
    gameOver: "JUEGO TERMINADO",
    reviewGame: "REVISAR JUEGO",
    colorSettings: "Configuración de Colores",
    boardColors: "Colores del Tablero",
    lightSquares: "Casillas Claras",
    darkSquares: "Casillas Oscuras",
    pieceColors: "Colores de Piezas",
    whitePieces: "Piezas Blancas",
    blackPieces: "Piezas Negras",
    colorPresets: "Plantillas de Color",
    boardColorsUpdated: "¡Colores del tablero actualizados!",
    pieceColorsUpdated: "¡Colores de piezas actualizados!",
    invalidHexColor: "¡Formato de color hex inválido!",
    presetApplied: "¡Plantilla aplicada!",
    colorsReset: "¡Colores restablecidos por defecto!",
    pieceSetup: "Configuración de Piezas",
    needBothKings: "¡Se requieren ambos reyes!",
    customGameStarted: "¡Juego personalizado iniciado!",
    squareOccupied: "¡La casilla ya está ocupada!",
    invalidPawnPosition: "¡Los peones no pueden colocarse en esta fila!",
    tooManyPieces: "¡Demasiadas piezas de este tipo!",
    invalidMove: "¡Movimiento inválido!",
    piecePlaced: "¡Pieza colocada exitosamente!",
    pieceDeleted: "¡Pieza eliminada!",
    dragCancelled: "Operación de arrastre cancelada",
    classic: "Clásico",
    wood: "Madera",
    marble: "Mármol",
    neon: "Neón",
    ocean: "Océano",
    reset: "Restablecer",
    language: "🌍 Idioma:",
    // Piece Setup
    setupInstructions: "Arrastra piezas de la paleta al tablero, o haz clic para seleccionar y colocar. ¡Crea tu posición personalizada!",
    piecePaletteTitle: "Paleta de Piezas",
    setupBoardTitle: "Configuración del Tablero",
    lblFirstMove: "Primera Jugada:",
    btnClearBoard: "🗑️ Limpiar Tablero",
    btnResetToDefault: "🔄 Posición Por Defecto",
    btnStartCustomGame: "▶ Comenzar Juego",
    btnCancelSetup: "Cancelar",
    boardCleared: "¡Tablero limpiado!",
    defaultSetup: "¡Posición por defecto restaurada!",
    // Enhanced piece setup
    randomSetupCreated: "¡Configuración aleatoria creada!",
    enterSetupName: "Ingresa nombre de configuración:",
    setupSaved: "¡Configuración guardada!",
    noSavedSetups: "¡No se encontraron configuraciones guardadas!",
    selectSetup: "Seleccionar configuración:",
    setupLoaded: "¡Configuración cargada!",
    presetLoaded: "¡Plantilla cargada!",
    positionValid: "La posición es válida",
    invalidPosition: "Posición inválida - se necesita exactamente un rey por lado",
    whiteAdvantage: "Las blancas tienen ventaja material",
    blackAdvantage: "Las negras tienen ventaja material",
    materialEqual: "El material es igual",
    endgamePosition: "Esta parece ser una posición de final",
    complexPosition: "Esta es una posición compleja con muchas piezas",
    queensPresent: "Las reinas están presentes - oportunidades tácticas probables",
    setUpPieces: "Coloca piezas para ver análisis",
    
    // Enhanced Theme System
    themeToggle: "Cambiar Tema",
    switchToLight: "Cambiar a tema claro",
    switchToDark: "Cambiar a tema oscuro",
    currentTheme: "Tema actual",
    lightTheme: "Claro",
    darkTheme: "Oscuro",
    systemTheme: "Sistema",
    themeChanged: "Tema cambiado exitosamente",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    lightTheme: "Claro",
    darkTheme: "Oscuro",
    systemTheme: "Sistema",
    themeChanged: "Tema cambiado exitosamente",
    
    // Enhanced Drag & Drop
    dragToMove: "Arrastra para mover pieza",
    dropToPlace: "Suelta para colocar pieza",
    invalidDrop: "Ubicación de soltar inválida",
    pieceMovedSuccessfully: "Pieza movida exitosamente",
    dragCancelledByUser: "Arrastre cancelado por el usuario",
    
    // Extended Preset System
    presetCategories: "Categorías de Plantillas",
    openingPresets: "Posiciones de Apertura",
    middlegamePresets: "Posiciones de Medio Juego",
    endgamePresets: "Posiciones de Final",
    puzzlePresets: "Posiciones de Puzzle",
    tacticalPresets: "Posiciones Tácticas",
    educationalPresets: "Posiciones Educativas",
    customPresets: "Plantillas Personalizadas",
    presetDescription: "Descripción de Plantilla",
    presetDifficulty: "Dificultad",
    presetTags: "Etiquetas",
    createNewPreset: "Crear Nueva Plantilla",
    editPreset: "Editar Plantilla",
    deletePreset: "Eliminar Plantilla",
    confirmDeletePreset: "¿Estás seguro de que quieres eliminar esta plantilla?",
    presetCreated: "Plantilla creada exitosamente",
    presetUpdated: "Plantilla actualizada exitosamente",
    presetDeleted: "Plantilla eliminada exitosamente",
    
    // Advanced Position Analysis
    positionAnalysis: "Análisis de Posición",
    materialAnalysis: "Análisis Material",
    pieceActivityAnalysis: "Análisis de Actividad de Piezas",
    kingSafetyAnalysis: "Análisis de Seguridad del Rey",
    centerControlAnalysis: "Análisis de Control del Centro",
    positionEvaluation: "Evaluación de Posición",
    strategicAssessment: "Evaluación Estratégica",
    tacticalOpportunities: "Oportunidades Tácticas",
    positionalFactors: "Factores Posicionales",
    analysisInProgress: "Análisis en progreso...",
    analysisComplete: "Análisis completo",
    analysisError: "Error de análisis ocurrido",
    
    // Position Sharing System
    sharePosition: "Compartir Posición",
    generateShareCode: "Generar Código de Compartir",
    copyShareCode: "Copiar Código de Compartir",
    shareCodeCopied: "Código de compartir copiado al portapapeles",
    shareCodeGenerated: "Código de compartir generado",
    loadFromCode: "Cargar desde Código",
    enterShareCode: "Ingresa código de compartir",
    invalidShareCode: "Código de compartir inválido",
    shareCodeTooLong: "Código de compartir muy largo (máx 12 caracteres)",
    shareViaURL: "Compartir vía URL",
    shareViaQR: "Compartir vía Código QR",
    qrCodeGenerated: "Código QR generado",
    scanQRCode: "Escanear Código QR",
    qrScannerActive: "Escáner QR activo",
    qrScannerStopped: "Escáner QR detenido",
    positionShared: "Posición compartida exitosamente",
    
    // Position History
    positionHistoryTitle: "Historial de Posiciones",
    undoMove: "Deshacer Movimiento",
    redoMove: "Rehacer Movimiento",
    jumpToPosition: "Saltar a Posición",
    clearPositionHistory: "Limpiar Historial de Posiciones",
    historyEmpty: "Historial vacío",
    cannotUndo: "No se puede deshacer",
    cannotRedo: "No se puede rehacer",
    historyCleared: "Historial limpiado",
    positionRestored: "Posición restaurada",
    
    // Mobile Optimization
    touchToSelect: "Toca para seleccionar",
    doubleTapToPlace: "Doble toque para colocar",
    pinchToZoom: "Pellizca para hacer zoom",
    swipeToNavigate: "Desliza para navegar",
    hapticFeedback: "Retroalimentación Háptica",
    touchOptimized: "Optimizado para táctil",
    mobileLayout: "Diseño Móvil",
    
    // Performance & Loading
    loading: "Cargando...",
    processing: "Procesando...",
    analyzing: "Analizando...",
    generating: "Generando...",
    validating: "Validando...",
    saving: "Guardando...",
    loadingPreset: "Cargando plantilla...",
    analyzingPosition: "Analizando posición...",
    generatingShareCode: "Generando código de compartir...",
    validatingPosition: "Validando posición...",
    operationCancelled: "Operación cancelada",
    operationCompleted: "Operación completada",
    operationFailed: "Operación falló",
    
    // Error Messages
    errorOccurred: "Ocurrió un error",
    invalidOperation: "Operación inválida",
    operationTimeout: "Operación expiró",
    networkError: "Error de red",
    storageError: "Error de almacenamiento",
    validationError: "Error de validación",
    unexpectedError: "Error inesperado",
    
    // Success Messages
    operationSuccessful: "Operación exitosa",
    positionSaved: "Posición guardada",
    settingsUpdated: "Configuraciones actualizadas",
    preferencesApplied: "Preferencias aplicadas",
    
    // Accessibility
    screenReaderAnnouncement: "Anuncio de lector de pantalla",
    keyboardNavigation: "Usa las teclas de flecha para navegar",
    accessibilityMode: "Modo de Accesibilidad",
    highContrast: "Alto Contraste",
    largeText: "Texto Grande",
    reducedMotion: "Movimiento Reducido",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  fr: {
    settings: "Paramètres",
    newGame: "Nouvelle Partie",
    switchSides: "Changer de Côté",
    undo: "Annuler",
    aiDifficulty: "Difficulté IA:",
    easy: "🟢 Facile (Niveau 1)",
    medium: "🟡 Moyen (Niveau 2)",
    hard: "🔴 Difficile (Niveau 3)",
    expert: "💀 Expert (Niveau 4)",
    moves: "Coups",
    captured: "Capturés",
    whiteCaptured: "Blancs ont pris",
    blackCaptured: "Noirs ont pris",
    gameStarting: "La partie commence...",
    blackWon: "🏆 Les Noirs gagnent!",
    whiteWon: "🏆 Les Blancs gagnent!",
    whitePlaying: "Les Blancs jouent",
    blackPlaying: "Les Noirs jouent",
    moveHistory: "Historique",
    switchedToBlack: "Vous jouez maintenant les NOIRS!",
    switchedToWhite: "Vous jouez maintenant les BLANCS!",
    aiLevelSet: "Difficulté IA: Niveau",
    footerText: "© 2025 VizyonEkibi",
    startGame: "COMMENCER LE JEU",
    gameTitle: "♔ 4×5 Échecs Pro ♚",
    gameSubtitle: "Maîtrise Stratégique dans un Espace Minimal",
    playAgain: "REJOUER",
    mainMenu: "MENU PRINCIPAL",
    gameOver: "JEU TERMINÉ",
    reviewGame: "REVOIR LE JEU",
    colorSettings: "Paramètres de Couleur",
    boardColors: "Couleurs de l'Échiquier",
    lightSquares: "Cases Claires",
    darkSquares: "Cases Sombres",
    pieceColors: "Couleurs des Pièces",
    whitePieces: "Pièces Blanches",
    blackPieces: "Pièces Noires",
    colorPresets: "Modèles de Couleur",
    boardColorsUpdated: "Couleurs de l'échiquier mises à jour!",
    pieceColorsUpdated: "Couleurs des pièces mises à jour!",
    invalidHexColor: "Format de couleur hex invalide!",
    presetApplied: "Modèle appliqué!",
    colorsReset: "Couleurs remises par défaut!",
    pieceSetup: "Configuration des Pièces",
    needBothKings: "Les deux rois sont requis!",
    customGameStarted: "Jeu personnalisé commencé!",
    squareOccupied: "La case est déjà occupée!",
    invalidPawnPosition: "Les pions ne peuvent pas être placés sur cette rangée!",
    tooManyPieces: "Trop de pièces de ce type!",
    invalidMove: "Mouvement invalide!",
    piecePlaced: "Pièce placée avec succès!",
    pieceDeleted: "Pièce supprimée!",
    dragCancelled: "Opération de glissement annulée",
    classic: "Classique",
    wood: "Bois",
    marble: "Marbre",
    neon: "Néon",
    ocean: "Océan",
    reset: "Réinitialiser",
    language: "🌍 Langue:",
    
    // Enhanced Theme System
    themeToggle: "Basculer le Thème",
    switchToLight: "Passer au thème clair",
    switchToDark: "Passer au thème sombre",
    currentTheme: "Thème actuel",
    lightTheme: "Clair",
    darkTheme: "Sombre",
    systemTheme: "Système",
    themeChanged: "Thème changé avec succès",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    
    // Enhanced Drag & Drop
    dragToMove: "Glisser pour déplacer la pièce",
    dropToPlace: "Déposer pour placer la pièce",
    invalidDrop: "Emplacement de dépôt invalide",
    pieceMovedSuccessfully: "Pièce déplacée avec succès",
    dragCancelledByUser: "Glissement annulé par l'utilisateur",
    
    // Extended Preset System
    presetCategories: "Catégories de Modèles",
    openingPresets: "Positions d'Ouverture",
    middlegamePresets: "Positions de Milieu de Jeu",
    endgamePresets: "Positions de Finale",
    puzzlePresets: "Positions de Puzzle",
    tacticalPresets: "Positions Tactiques",
    educationalPresets: "Positions Éducatives",
    customPresets: "Modèles Personnalisés",
    presetDescription: "Description du Modèle",
    presetDifficulty: "Difficulté",
    presetTags: "Étiquettes",
    createNewPreset: "Créer un Nouveau Modèle",
    editPreset: "Modifier le Modèle",
    deletePreset: "Supprimer le Modèle",
    confirmDeletePreset: "Êtes-vous sûr de vouloir supprimer ce modèle?",
    presetCreated: "Modèle créé avec succès",
    presetUpdated: "Modèle mis à jour avec succès",
    presetDeleted: "Modèle supprimé avec succès",
    
    // Advanced Position Analysis
    positionAnalysis: "Analyse de Position",
    materialAnalysis: "Analyse Matérielle",
    pieceActivityAnalysis: "Analyse d'Activité des Pièces",
    kingSafetyAnalysis: "Analyse de Sécurité du Roi",
    centerControlAnalysis: "Analyse de Contrôle du Centre",
    positionEvaluation: "Évaluation de Position",
    strategicAssessment: "Évaluation Stratégique",
    tacticalOpportunities: "Opportunités Tactiques",
    positionalFactors: "Facteurs Positionnels",
    analysisInProgress: "Analyse en cours...",
    analysisComplete: "Analyse terminée",
    analysisError: "Erreur d'analyse survenue",
    
    // Position Sharing System
    sharePosition: "Partager la Position",
    generateShareCode: "Générer le Code de Partage",
    copyShareCode: "Copier le Code de Partage",
    shareCodeCopied: "Code de partage copié dans le presse-papiers",
    shareCodeGenerated: "Code de partage généré",
    loadFromCode: "Charger depuis le Code",
    enterShareCode: "Entrez le code de partage",
    invalidShareCode: "Code de partage invalide",
    shareCodeTooLong: "Code de partage trop long (max 12 caractères)",
    shareViaURL: "Partager via URL",
    shareViaQR: "Partager via Code QR",
    qrCodeGenerated: "Code QR généré",
    scanQRCode: "Scanner le Code QR",
    qrScannerActive: "Scanner QR actif",
    qrScannerStopped: "Scanner QR arrêté",
    positionShared: "Position partagée avec succès",
    
    // Position History
    positionHistoryTitle: "Historique des Positions",
    undoMove: "Annuler le Mouvement",
    redoMove: "Refaire le Mouvement",
    jumpToPosition: "Aller à la Position",
    clearPositionHistory: "Effacer l'Historique des Positions",
    historyEmpty: "Historique vide",
    cannotUndo: "Impossible d'annuler",
    cannotRedo: "Impossible de refaire",
    historyCleared: "Historique effacé",
    positionRestored: "Position restaurée",
    
    // Mobile Optimization
    touchToSelect: "Toucher pour sélectionner",
    doubleTapToPlace: "Double-toucher pour placer",
    pinchToZoom: "Pincer pour zoomer",
    swipeToNavigate: "Glisser pour naviguer",
    hapticFeedback: "Retour Haptique",
    touchOptimized: "Optimisé pour le tactile",
    mobileLayout: "Mise en Page Mobile",
    
    // Performance & Loading
    loading: "Chargement...",
    processing: "Traitement...",
    analyzing: "Analyse...",
    generating: "Génération...",
    validating: "Validation...",
    saving: "Sauvegarde...",
    loadingPreset: "Chargement du modèle...",
    analyzingPosition: "Analyse de la position...",
    generatingShareCode: "Génération du code de partage...",
    validatingPosition: "Validation de la position...",
    operationCancelled: "Opération annulée",
    operationCompleted: "Opération terminée",
    operationFailed: "Opération échouée",
    
    // Error Messages
    errorOccurred: "Une erreur s'est produite",
    invalidOperation: "Opération invalide",
    operationTimeout: "Opération expirée",
    networkError: "Erreur réseau",
    storageError: "Erreur de stockage",
    validationError: "Erreur de validation",
    unexpectedError: "Erreur inattendue",
    
    // Success Messages
    operationSuccessful: "Opération réussie",
    positionSaved: "Position sauvegardée",
    settingsUpdated: "Paramètres mis à jour",
    preferencesApplied: "Préférences appliquées",
    
    // Accessibility
    screenReaderAnnouncement: "Annonce de lecteur d'écran",
    keyboardNavigation: "Utilisez les touches fléchées pour naviguer",
    accessibilityMode: "Mode d'Accessibilité",
    highContrast: "Contraste Élevé",
    largeText: "Texte Large",
    reducedMotion: "Mouvement Réduit",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  de: {
    settings: "Einstellungen",
    newGame: "Neues Spiel",
    switchSides: "Seiten Wechseln",
    undo: "Rückgängig",
    aiDifficulty: "KI-Schwierigkeit:",
    easy: "🟢 Leicht (Stufe 1)",
    medium: "🟡 Mittel (Stufe 2)",
    hard: "🔴 Schwer (Stufe 3)",
    expert: "💀 Experte (Stufe 4)",
    moves: "Züge",
    captured: "Gefangen",
    whiteCaptured: "Weiß hat gefangen",
    blackCaptured: "Schwarz hat gefangen",
    gameStarting: "Spiel beginnt...",
    blackWon: "🏆 Schwarz gewinnt!",
    whiteWon: "🏆 Weiß gewinnt!",
    whitePlaying: "Weiß am Zug",
    blackPlaying: "Schwarz am Zug",
    moveHistory: "Zughistorie",
    switchedToBlack: "Sie spielen jetzt SCHWARZ!",
    switchedToWhite: "Sie spielen jetzt WEISS!",
    aiLevelSet: "KI-Schwierigkeit: Stufe",
    footerText: "© 2025 VizyonEkibi",
    startGame: "SPIEL STARTEN",
    gameTitle: "♔ 4×5 Schach Pro ♚",
    gameSubtitle: "Strategische Meisterschaft auf minimalem Raum",
    playAgain: "NOCHMAL SPIELEN",
    mainMenu: "HAUPTMENÜ",
    gameOver: "SPIEL BEENDET",
    reviewGame: "SPIEL ÜBERPRÜFEN",
    colorSettings: "Farbeinstellungen",
    boardColors: "Brettfarben",
    lightSquares: "Helle Felder",
    darkSquares: "Dunkle Felder",
    pieceColors: "Figurenfarben",
    whitePieces: "Weiße Figuren",
    blackPieces: "Schwarze Figuren",
    colorPresets: "Farbvorlagen",
    boardColorsUpdated: "Brettfarben aktualisiert!",
    pieceColorsUpdated: "Figurenfarben aktualisiert!",
    invalidHexColor: "Ungültiges Hex-Farbformat!",
    presetApplied: "Vorlage angewendet!",
    colorsReset: "Farben zurückgesetzt!",
    pieceSetup: "Figurenaufstellung",
    needBothKings: "Beide Könige sind erforderlich!",
    customGameStarted: "Benutzerdefiniertes Spiel gestartet!",
    squareOccupied: "Das Feld ist bereits besetzt!",
    invalidPawnPosition: "Bauern können nicht auf dieser Reihe platziert werden!",
    tooManyPieces: "Zu viele Figuren dieses Typs!",
    invalidMove: "Ungültiger Zug!",
    piecePlaced: "Figur erfolgreich platziert!",
    pieceDeleted: "Figur gelöscht!",
    dragCancelled: "Ziehvorgang abgebrochen",
    classic: "Klassisch",
    wood: "Holz",
    marble: "Marmor",
    neon: "Neon",
    ocean: "Ozean",
    reset: "Zurücksetzen",
    language: "🌍 Sprache:",
    
    // Enhanced Theme System
    themeToggle: "Thema Wechseln",
    switchToLight: "Zu hellem Thema wechseln",
    switchToDark: "Zu dunklem Thema wechseln",
    currentTheme: "Aktuelles Thema",
    lightTheme: "Hell",
    darkTheme: "Dunkel",
    systemTheme: "System",
    themeChanged: "Thema erfolgreich geändert",
    darkMode: "Dunkler Modus",
    lightMode: "Heller Modus",
    
    // Enhanced Drag & Drop
    dragToMove: "Ziehen um Figur zu bewegen",
    dropToPlace: "Loslassen um Figur zu platzieren",
    invalidDrop: "Ungültiger Ablageort",
    pieceMovedSuccessfully: "Figur erfolgreich bewegt",
    dragCancelledByUser: "Ziehen vom Benutzer abgebrochen",
    
    // Extended Preset System
    presetCategories: "Vorlagen-Kategorien",
    openingPresets: "Eröffnungspositionen",
    middlegamePresets: "Mittelspiel-Positionen",
    endgamePresets: "Endspiel-Positionen",
    puzzlePresets: "Puzzle-Positionen",
    tacticalPresets: "Taktische Positionen",
    educationalPresets: "Lehrpositionen",
    customPresets: "Benutzerdefinierte Vorlagen",
    presetDescription: "Vorlagen-Beschreibung",
    presetDifficulty: "Schwierigkeit",
    presetTags: "Tags",
    createNewPreset: "Neue Vorlage Erstellen",
    editPreset: "Vorlage Bearbeiten",
    deletePreset: "Vorlage Löschen",
    confirmDeletePreset: "Sind Sie sicher, dass Sie diese Vorlage löschen möchten?",
    presetCreated: "Vorlage erfolgreich erstellt",
    presetUpdated: "Vorlage erfolgreich aktualisiert",
    presetDeleted: "Vorlage erfolgreich gelöscht",
    
    // Advanced Position Analysis
    positionAnalysis: "Positionsanalyse",
    materialAnalysis: "Materialanalyse",
    pieceActivityAnalysis: "Figurenaktivitäts-Analyse",
    kingSafetyAnalysis: "Königssicherheits-Analyse",
    centerControlAnalysis: "Zentrumskontroll-Analyse",
    positionEvaluation: "Positionsbewertung",
    strategicAssessment: "Strategische Bewertung",
    tacticalOpportunities: "Taktische Gelegenheiten",
    positionalFactors: "Positionelle Faktoren",
    analysisInProgress: "Analyse läuft...",
    analysisComplete: "Analyse abgeschlossen",
    analysisError: "Analysefehler aufgetreten",
    
    // Position Sharing System
    sharePosition: "Position Teilen",
    generateShareCode: "Teilungscode Generieren",
    copyShareCode: "Teilungscode Kopieren",
    shareCodeCopied: "Teilungscode in Zwischenablage kopiert",
    shareCodeGenerated: "Teilungscode generiert",
    loadFromCode: "Aus Code Laden",
    enterShareCode: "Teilungscode eingeben",
    invalidShareCode: "Ungültiger Teilungscode",
    shareCodeTooLong: "Teilungscode zu lang (max 12 Zeichen)",
    shareViaURL: "Via URL Teilen",
    shareViaQR: "Via QR-Code Teilen",
    qrCodeGenerated: "QR-Code generiert",
    scanQRCode: "QR-Code Scannen",
    qrScannerActive: "QR-Scanner aktiv",
    qrScannerStopped: "QR-Scanner gestoppt",
    positionShared: "Position erfolgreich geteilt",
    
    // Position History
    positionHistoryTitle: "Positionsverlauf",
    undoMove: "Zug Rückgängig",
    redoMove: "Zug Wiederholen",
    jumpToPosition: "Zu Position Springen",
    clearPositionHistory: "Positionsverlauf Löschen",
    historyEmpty: "Verlauf ist leer",
    cannotUndo: "Kann nicht rückgängig machen",
    cannotRedo: "Kann nicht wiederholen",
    historyCleared: "Verlauf gelöscht",
    positionRestored: "Position wiederhergestellt",
    
    // Mobile Optimization
    touchToSelect: "Berühren zum Auswählen",
    doubleTapToPlace: "Doppeltippen zum Platzieren",
    pinchToZoom: "Kneifen zum Zoomen",
    swipeToNavigate: "Wischen zum Navigieren",
    hapticFeedback: "Haptisches Feedback",
    touchOptimized: "Touch-optimiert",
    mobileLayout: "Mobile Ansicht",
    
    // Performance & Loading
    loading: "Lädt...",
    processing: "Verarbeitung...",
    analyzing: "Analysiert...",
    generating: "Generiert...",
    validating: "Validiert...",
    saving: "Speichert...",
    loadingPreset: "Vorlage wird geladen...",
    analyzingPosition: "Position wird analysiert...",
    generatingShareCode: "Teilungscode wird generiert...",
    validatingPosition: "Position wird validiert...",
    operationCancelled: "Operation abgebrochen",
    operationCompleted: "Operation abgeschlossen",
    operationFailed: "Operation fehlgeschlagen",
    
    // Error Messages
    errorOccurred: "Ein Fehler ist aufgetreten",
    invalidOperation: "Ungültige Operation",
    operationTimeout: "Operation-Timeout",
    networkError: "Netzwerkfehler",
    storageError: "Speicherfehler",
    validationError: "Validierungsfehler",
    unexpectedError: "Unerwarteter Fehler",
    
    // Success Messages
    operationSuccessful: "Operation erfolgreich",
    positionSaved: "Position gespeichert",
    settingsUpdated: "Einstellungen aktualisiert",
    preferencesApplied: "Einstellungen angewendet",
    
    // Accessibility
    screenReaderAnnouncement: "Bildschirmleser-Ansage",
    keyboardNavigation: "Pfeiltasten zum Navigieren verwenden",
    accessibilityMode: "Barrierefreiheitsmodus",
    highContrast: "Hoher Kontrast",
    largeText: "Großer Text",
    reducedMotion: "Reduzierte Bewegung",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  it: {
    settings: "Impostazioni",
    newGame: "Nuova Partita",
    switchSides: "Cambia Lato",
    undo: "Annulla",
    aiDifficulty: "Difficoltà IA:",
    easy: "🟢 Facile (Livello 1)",
    medium: "🟡 Medio (Livello 2)",
    hard: "🔴 Difficile (Livello 3)",
    expert: "💀 Esperto (Livello 4)",
    moves: "Mosse",
    captured: "Catturati",
    whiteCaptured: "Bianco ha catturato",
    blackCaptured: "Nero ha catturato",
    gameStarting: "Inizio partita...",
    blackWon: "🏆 Vince il Nero!",
    whiteWon: "🏆 Vince il Bianco!",
    whitePlaying: "Tocca al Bianco",
    blackPlaying: "Tocca al Nero",
    moveHistory: "Cronologia",
    switchedToBlack: "Ora giochi con il NERO!",
    switchedToWhite: "Ora giochi con il BIANCO!",
    aiLevelSet: "Difficoltà IA: Livello",
    footerText: "© 2025 VizyonEkibi",
    startGame: "INIZIA GIOCO",
    gameTitle: "♔ 4×5 Scacchi Pro ♚",
    gameSubtitle: "Maestria Strategica in Spazio Minimo",
    playAgain: "GIOCA ANCORA",
    mainMenu: "MENU PRINCIPALE",
    gameOver: "GIOCO FINITO",
    reviewGame: "RIVEDI GIOCO",
    colorSettings: "Impostazioni Colore",
    boardColors: "Colori Scacchiera",
    lightSquares: "Case Chiare",
    darkSquares: "Case Scure",
    pieceColors: "Colori Pezzi",
    whitePieces: "Pezzi Bianchi",
    blackPieces: "Pezzi Neri",
    colorPresets: "Modelli Colore",
    boardColorsUpdated: "Colori scacchiera aggiornati!",
    pieceColorsUpdated: "Colori pezzi aggiornati!",
    invalidHexColor: "Formato colore hex non valido!",
    presetApplied: "Modello applicato!",
    colorsReset: "Colori ripristinati!",
    pieceSetup: "Configurazione Pezzi",
    needBothKings: "Entrambi i re sono richiesti!",
    customGameStarted: "Gioco personalizzato iniziato!",
    squareOccupied: "La casella è già occupata!",
    invalidPawnPosition: "I pedoni non possono essere posizionati su questa riga!",
    tooManyPieces: "Troppi pezzi di questo tipo!",
    invalidMove: "Mossa non valida!",
    piecePlaced: "Pezzo posizionato con successo!",
    pieceDeleted: "Pezzo eliminato!",
    dragCancelled: "Operazione di trascinamento annullata",
    classic: "Classico",
    wood: "Legno",
    marble: "Marmo",
    neon: "Neon",
    ocean: "Oceano",
    reset: "Ripristina",
    language: "🌍 Lingua:",
    
    // Enhanced Theme System
    themeToggle: "Cambia Tema",
    switchToLight: "Passa al tema chiaro",
    switchToDark: "Passa al tema scuro",
    currentTheme: "Tema attuale",
    lightTheme: "Chiaro",
    darkTheme: "Scuro",
    systemTheme: "Sistema",
    themeChanged: "Tema cambiato con successo",
    darkMode: "Modalità Scura",
    lightMode: "Modalità Chiara",
    
    // Enhanced Drag & Drop
    dragToMove: "Trascina per muovere il pezzo",
    dropToPlace: "Rilascia per posizionare il pezzo",
    invalidDrop: "Posizione di rilascio non valida",
    pieceMovedSuccessfully: "Pezzo mosso con successo",
    dragCancelledByUser: "Trascinamento annullato dall'utente",
    
    // Extended Preset System
    presetCategories: "Categorie di Modelli",
    openingPresets: "Posizioni di Apertura",
    middlegamePresets: "Posizioni di Mediogioco",
    endgamePresets: "Posizioni di Finale",
    puzzlePresets: "Posizioni Puzzle",
    tacticalPresets: "Posizioni Tattiche",
    educationalPresets: "Posizioni Educative",
    customPresets: "Modelli Personalizzati",
    presetDescription: "Descrizione Modello",
    presetDifficulty: "Difficoltà",
    presetTags: "Tag",
    createNewPreset: "Crea Nuovo Modello",
    editPreset: "Modifica Modello",
    deletePreset: "Elimina Modello",
    confirmDeletePreset: "Sei sicuro di voler eliminare questo modello?",
    presetCreated: "Modello creato con successo",
    presetUpdated: "Modello aggiornato con successo",
    presetDeleted: "Modello eliminato con successo",
    
    // Advanced Position Analysis
    positionAnalysis: "Analisi Posizione",
    materialAnalysis: "Analisi Materiale",
    pieceActivityAnalysis: "Analisi Attività Pezzi",
    kingSafetyAnalysis: "Analisi Sicurezza Re",
    centerControlAnalysis: "Analisi Controllo Centro",
    positionEvaluation: "Valutazione Posizione",
    strategicAssessment: "Valutazione Strategica",
    tacticalOpportunities: "Opportunità Tattiche",
    positionalFactors: "Fattori Posizionali",
    analysisInProgress: "Analisi in corso...",
    analysisComplete: "Analisi completata",
    analysisError: "Errore di analisi verificato",
    
    // Position Sharing System
    sharePosition: "Condividi Posizione",
    generateShareCode: "Genera Codice Condivisione",
    copyShareCode: "Copia Codice Condivisione",
    shareCodeCopied: "Codice condivisione copiato negli appunti",
    shareCodeGenerated: "Codice condivisione generato",
    loadFromCode: "Carica da Codice",
    enterShareCode: "Inserisci codice condivisione",
    invalidShareCode: "Codice condivisione non valido",
    shareCodeTooLong: "Codice condivisione troppo lungo (max 12 caratteri)",
    shareViaURL: "Condividi via URL",
    shareViaQR: "Condividi via Codice QR",
    qrCodeGenerated: "Codice QR generato",
    scanQRCode: "Scansiona Codice QR",
    qrScannerActive: "Scanner QR attivo",
    qrScannerStopped: "Scanner QR fermato",
    positionShared: "Posizione condivisa con successo",
    
    // Position History
    positionHistoryTitle: "Cronologia Posizioni",
    undoMove: "Annulla Mossa",
    redoMove: "Ripeti Mossa",
    jumpToPosition: "Vai alla Posizione",
    clearPositionHistory: "Cancella Cronologia Posizioni",
    historyEmpty: "Cronologia vuota",
    cannotUndo: "Impossibile annullare",
    cannotRedo: "Impossibile ripetere",
    historyCleared: "Cronologia cancellata",
    positionRestored: "Posizione ripristinata",
    
    // Mobile Optimization
    touchToSelect: "Tocca per selezionare",
    doubleTapToPlace: "Doppio tocco per posizionare",
    pinchToZoom: "Pizzica per ingrandire",
    swipeToNavigate: "Scorri per navigare",
    hapticFeedback: "Feedback Aptico",
    touchOptimized: "Ottimizzato per touch",
    mobileLayout: "Layout Mobile",
    
    // Performance & Loading
    loading: "Caricamento...",
    processing: "Elaborazione...",
    analyzing: "Analisi...",
    generating: "Generazione...",
    validating: "Validazione...",
    saving: "Salvataggio...",
    loadingPreset: "Caricamento modello...",
    analyzingPosition: "Analisi posizione...",
    generatingShareCode: "Generazione codice condivisione...",
    validatingPosition: "Validazione posizione...",
    operationCancelled: "Operazione annullata",
    operationCompleted: "Operazione completata",
    operationFailed: "Operazione fallita",
    
    // Error Messages
    errorOccurred: "Si è verificato un errore",
    invalidOperation: "Operazione non valida",
    operationTimeout: "Timeout operazione",
    networkError: "Errore di rete",
    storageError: "Errore di archiviazione",
    validationError: "Errore di validazione",
    unexpectedError: "Errore imprevisto",
    
    // Success Messages
    operationSuccessful: "Operazione riuscita",
    positionSaved: "Posizione salvata",
    settingsUpdated: "Impostazioni aggiornate",
    preferencesApplied: "Preferenze applicate",
    
    // Accessibility
    screenReaderAnnouncement: "Annuncio lettore schermo",
    keyboardNavigation: "Usa i tasti freccia per navigare",
    accessibilityMode: "Modalità Accessibilità",
    highContrast: "Alto Contrasto",
    largeText: "Testo Grande",
    reducedMotion: "Movimento Ridotto",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  ru: {
    settings: "Настройки",
    newGame: "Новая игра",
    switchSides: "Сменить сторону",
    undo: "Отменить",
    aiDifficulty: "Сложность ИИ:",
    easy: "🟢 Легко (Ур. 1)",
    medium: "🟡 Средне (Ур. 2)",
    hard: "🔴 Сложно (Ур. 3)",
    expert: "💀 Эксперт (Ур. 4)",
    moves: "Ходы",
    captured: "Взято",
    whiteCaptured: "Белые взяли",
    blackCaptured: "Черные взяли",
    gameStarting: "Игра начинается...",
    blackWon: "🏆 Черные победили!",
    whiteWon: "🏆 Белые победили!",
    whitePlaying: "Ход белых",
    blackPlaying: "Ход черных",
    moveHistory: "История ходов",
    switchedToBlack: "Вы играете за ЧЕРНЫХ!",
    switchedToWhite: "Вы играете за БЕЛЫХ!",
    aiLevelSet: "Сложность ИИ: Уровень",
    footerText: "© 2025 VizyonEkibi",
    language: "🌍 Язык:",
    
    // Enhanced Theme System
    themeToggle: "Переключить Тему",
    switchToLight: "Переключиться на светлую тему",
    switchToDark: "Переключиться на темную тему",
    currentTheme: "Текущая тема",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    systemTheme: "Системная",
    themeChanged: "Тема успешно изменена",
    darkMode: "Темный Режим",
    lightMode: "Светлый Режим",
    
    // Enhanced Drag & Drop
    dragToMove: "Перетащите для перемещения фигуры",
    dropToPlace: "Отпустите для размещения фигуры",
    invalidDrop: "Недопустимое место размещения",
    pieceMovedSuccessfully: "Фигура успешно перемещена",
    dragCancelledByUser: "Перетаскивание отменено пользователем",
    
    // Extended Preset System
    presetCategories: "Категории Шаблонов",
    openingPresets: "Дебютные Позиции",
    middlegamePresets: "Позиции Миттельшпиля",
    endgamePresets: "Эндшпильные Позиции",
    puzzlePresets: "Позиции-Головоломки",
    tacticalPresets: "Тактические Позиции",
    educationalPresets: "Обучающие Позиции",
    customPresets: "Пользовательские Шаблоны",
    presetDescription: "Описание Шаблона",
    presetDifficulty: "Сложность",
    presetTags: "Теги",
    createNewPreset: "Создать Новый Шаблон",
    editPreset: "Редактировать Шаблон",
    deletePreset: "Удалить Шаблон",
    confirmDeletePreset: "Вы уверены, что хотите удалить этот шаблон?",
    presetCreated: "Шаблон успешно создан",
    presetUpdated: "Шаблон успешно обновлен",
    presetDeleted: "Шаблон успешно удален",
    
    // Advanced Position Analysis
    positionAnalysis: "Анализ Позиции",
    materialAnalysis: "Материальный Анализ",
    pieceActivityAnalysis: "Анализ Активности Фигур",
    kingSafetyAnalysis: "Анализ Безопасности Короля",
    centerControlAnalysis: "Анализ Контроля Центра",
    positionEvaluation: "Оценка Позиции",
    strategicAssessment: "Стратегическая Оценка",
    tacticalOpportunities: "Тактические Возможности",
    positionalFactors: "Позиционные Факторы",
    analysisInProgress: "Анализ в процессе...",
    analysisComplete: "Анализ завершен",
    analysisError: "Произошла ошибка анализа",
    
    // Position Sharing System
    sharePosition: "Поделиться Позицией",
    generateShareCode: "Сгенерировать Код Обмена",
    copyShareCode: "Копировать Код Обмена",
    shareCodeCopied: "Код обмена скопирован в буфер обмена",
    shareCodeGenerated: "Код обмена сгенерирован",
    loadFromCode: "Загрузить из Кода",
    enterShareCode: "Введите код обмена",
    invalidShareCode: "Недействительный код обмена",
    shareCodeTooLong: "Код обмена слишком длинный (макс 12 символов)",
    shareViaURL: "Поделиться через URL",
    shareViaQR: "Поделиться через QR-код",
    qrCodeGenerated: "QR-код сгенерирован",
    scanQRCode: "Сканировать QR-код",
    qrScannerActive: "QR-сканер активен",
    qrScannerStopped: "QR-сканер остановлен",
    positionShared: "Позиция успешно поделена",
    
    // Position History
    positionHistoryTitle: "История Позиций",
    undoMove: "Отменить Ход",
    redoMove: "Повторить Ход",
    jumpToPosition: "Перейти к Позиции",
    clearPositionHistory: "Очистить Историю Позиций",
    historyEmpty: "История пуста",
    cannotUndo: "Невозможно отменить",
    cannotRedo: "Невозможно повторить",
    historyCleared: "История очищена",
    positionRestored: "Позиция восстановлена",
    
    // Mobile Optimization
    touchToSelect: "Коснитесь для выбора",
    doubleTapToPlace: "Двойное касание для размещения",
    pinchToZoom: "Сжатие для масштабирования",
    swipeToNavigate: "Проведите для навигации",
    hapticFeedback: "Тактильная Обратная Связь",
    touchOptimized: "Оптимизировано для касаний",
    mobileLayout: "Мобильная Раскладка",
    
    // Performance & Loading
    loading: "Загрузка...",
    processing: "Обработка...",
    analyzing: "Анализ...",
    generating: "Генерация...",
    validating: "Проверка...",
    saving: "Сохранение...",
    loadingPreset: "Загрузка шаблона...",
    analyzingPosition: "Анализ позиции...",
    generatingShareCode: "Генерация кода обмена...",
    validatingPosition: "Проверка позиции...",
    operationCancelled: "Операция отменена",
    operationCompleted: "Операция завершена",
    operationFailed: "Операция не удалась",
    
    // Error Messages
    errorOccurred: "Произошла ошибка",
    invalidOperation: "Недопустимая операция",
    operationTimeout: "Тайм-аут операции",
    networkError: "Сетевая ошибка",
    storageError: "Ошибка хранилища",
    validationError: "Ошибка проверки",
    unexpectedError: "Неожиданная ошибка",
    
    // Success Messages
    operationSuccessful: "Операция успешна",
    positionSaved: "Позиция сохранена",
    settingsUpdated: "Настройки обновлены",
    preferencesApplied: "Предпочтения применены",
    
    // Accessibility
    screenReaderAnnouncement: "Объявление программы чтения с экрана",
    keyboardNavigation: "Используйте клавиши со стрелками для навигации",
    accessibilityMode: "Режим Доступности",
    highContrast: "Высокий Контраст",
    largeText: "Крупный Текст",
    reducedMotion: "Уменьшенное Движение",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  zh: {
    settings: "设置",
    newGame: "新游戏",
    switchSides: "交换方",
    undo: "撤销",
    aiDifficulty: "AI 难度:",
    easy: "🟢 简单 (等级 1)",
    medium: "🟡 中等 (等级 2)",
    hard: "🔴 困难 (等级 3)",
    expert: "💀 专家 (等级 4)",
    moves: "步数",
    captured: "吃子",
    whiteCaptured: "白方吃子",
    blackCaptured: "黑方吃子",
    gameStarting: "游戏开始...",
    blackWon: "🏆 黑方获胜!",
    whiteWon: "🏆 白方获胜!",
    whitePlaying: "白方走棋",
    blackPlaying: "黑方走棋",
    moveHistory: "走棋记录",
    switchedToBlack: "你现在执黑!",
    switchedToWhite: "你现在执白!",
    aiLevelSet: "AI 难度: 等级",
    footerText: "© 2025 VizyonEkibi",
    language: "🌍 语言:",
    
    // Enhanced Theme System
    themeToggle: "切换主题",
    switchToLight: "切换到浅色主题",
    switchToDark: "切换到深色主题",
    currentTheme: "当前主题",
    lightTheme: "浅色",
    darkTheme: "深色",
    systemTheme: "系统",
    themeChanged: "主题切换成功",
    darkMode: "深色模式",
    lightMode: "浅色模式",
    
    // Enhanced Drag & Drop
    dragToMove: "拖拽移动棋子",
    dropToPlace: "放下放置棋子",
    invalidDrop: "无效的放置位置",
    pieceMovedSuccessfully: "棋子移动成功",
    dragCancelledByUser: "用户取消拖拽",
    
    // Extended Preset System
    presetCategories: "预设分类",
    openingPresets: "开局位置",
    middlegamePresets: "中局位置",
    endgamePresets: "残局位置",
    puzzlePresets: "谜题位置",
    tacticalPresets: "战术位置",
    educationalPresets: "教学位置",
    customPresets: "自定义预设",
    presetDescription: "预设描述",
    presetDifficulty: "难度",
    presetTags: "标签",
    createNewPreset: "创建新预设",
    editPreset: "编辑预设",
    deletePreset: "删除预设",
    confirmDeletePreset: "确定要删除这个预设吗？",
    presetCreated: "预设创建成功",
    presetUpdated: "预设更新成功",
    presetDeleted: "预设删除成功",
    
    // Advanced Position Analysis
    positionAnalysis: "位置分析",
    materialAnalysis: "子力分析",
    pieceActivityAnalysis: "棋子活跃度分析",
    kingSafetyAnalysis: "王安全分析",
    centerControlAnalysis: "中心控制分析",
    positionEvaluation: "位置评估",
    strategicAssessment: "战略评估",
    tacticalOpportunities: "战术机会",
    positionalFactors: "位置因素",
    analysisInProgress: "分析进行中...",
    analysisComplete: "分析完成",
    analysisError: "分析出错",
    
    // Position Sharing System
    sharePosition: "分享位置",
    generateShareCode: "生成分享码",
    copyShareCode: "复制分享码",
    shareCodeCopied: "分享码已复制到剪贴板",
    shareCodeGenerated: "分享码已生成",
    loadFromCode: "从代码加载",
    enterShareCode: "输入分享码",
    invalidShareCode: "无效的分享码",
    shareCodeTooLong: "分享码太长（最多12个字符）",
    shareViaURL: "通过URL分享",
    shareViaQR: "通过二维码分享",
    qrCodeGenerated: "二维码已生成",
    scanQRCode: "扫描二维码",
    qrScannerActive: "二维码扫描器激活",
    qrScannerStopped: "二维码扫描器停止",
    positionShared: "位置分享成功",
    
    // Position History
    positionHistoryTitle: "位置历史",
    undoMove: "撤销移动",
    redoMove: "重做移动",
    jumpToPosition: "跳转到位置",
    clearPositionHistory: "清除位置历史",
    historyEmpty: "历史为空",
    cannotUndo: "无法撤销",
    cannotRedo: "无法重做",
    historyCleared: "历史已清除",
    positionRestored: "位置已恢复",
    
    // Mobile Optimization
    touchToSelect: "触摸选择",
    doubleTapToPlace: "双击放置",
    pinchToZoom: "捏合缩放",
    swipeToNavigate: "滑动导航",
    hapticFeedback: "触觉反馈",
    touchOptimized: "触摸优化",
    mobileLayout: "移动布局",
    
    // Performance & Loading
    loading: "加载中...",
    processing: "处理中...",
    analyzing: "分析中...",
    generating: "生成中...",
    validating: "验证中...",
    saving: "保存中...",
    loadingPreset: "加载预设中...",
    analyzingPosition: "分析位置中...",
    generatingShareCode: "生成分享码中...",
    validatingPosition: "验证位置中...",
    operationCancelled: "操作已取消",
    operationCompleted: "操作已完成",
    operationFailed: "操作失败",
    
    // Error Messages
    errorOccurred: "发生错误",
    invalidOperation: "无效操作",
    operationTimeout: "操作超时",
    networkError: "网络错误",
    storageError: "存储错误",
    validationError: "验证错误",
    unexpectedError: "意外错误",
    
    // Success Messages
    operationSuccessful: "操作成功",
    positionSaved: "位置已保存",
    settingsUpdated: "设置已更新",
    preferencesApplied: "偏好已应用",
    
    // Accessibility
    screenReaderAnnouncement: "屏幕阅读器公告",
    keyboardNavigation: "使用方向键导航",
    accessibilityMode: "无障碍模式",
    highContrast: "高对比度",
    largeText: "大字体",
    reducedMotion: "减少动画",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  ja: {
    settings: "設定",
    newGame: "新しいゲーム",
    switchSides: "サイド交代",
    undo: "元に戻す",
    aiDifficulty: "AI 難易度:",
    easy: "🟢 簡単 (Lv 1)",
    medium: "🟡 普通 (Lv 2)",
    hard: "🔴 難しい (Lv 3)",
    expert: "💀 達人 (Lv 4)",
    moves: "手数",
    captured: "獲得",
    whiteCaptured: "白の獲得",
    blackCaptured: "黒の獲得",
    gameStarting: "ゲーム開始...",
    blackWon: "🏆 黒の勝ち!",
    whiteWon: "🏆 白の勝ち!",
    whitePlaying: "白の手番",
    blackPlaying: "黒の手番",
    moveHistory: "履歴",
    switchedToBlack: "あなたは今、黒です!",
    switchedToWhite: "あなたは今、白です!",
    aiLevelSet: "AI 難易度: レベル",
    footerText: "© 2025 VizyonEkibi",
    language: "🌍 言語:",
    
    // Enhanced Theme System
    themeToggle: "テーマ切り替え",
    switchToLight: "ライトテーマに切り替え",
    switchToDark: "ダークテーマに切り替え",
    currentTheme: "現在のテーマ",
    lightTheme: "ライト",
    darkTheme: "ダーク",
    systemTheme: "システム",
    themeChanged: "テーマが正常に変更されました",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    
    // Enhanced Drag & Drop
    dragToMove: "ドラッグして駒を移動",
    dropToPlace: "ドロップして駒を配置",
    invalidDrop: "無効なドロップ位置",
    pieceMovedSuccessfully: "駒の移動が成功しました",
    dragCancelledByUser: "ユーザーによりドラッグがキャンセルされました",
    
    // Extended Preset System
    presetCategories: "プリセットカテゴリ",
    openingPresets: "序盤ポジション",
    middlegamePresets: "中盤ポジション",
    endgamePresets: "終盤ポジション",
    puzzlePresets: "パズルポジション",
    tacticalPresets: "戦術ポジション",
    educationalPresets: "教育ポジション",
    customPresets: "カスタムプリセット",
    presetDescription: "プリセット説明",
    presetDifficulty: "難易度",
    presetTags: "タグ",
    createNewPreset: "新しいプリセットを作成",
    editPreset: "プリセットを編集",
    deletePreset: "プリセットを削除",
    confirmDeletePreset: "このプリセットを削除してもよろしいですか？",
    presetCreated: "プリセットが正常に作成されました",
    presetUpdated: "プリセットが正常に更新されました",
    presetDeleted: "プリセットが正常に削除されました",
    
    // Advanced Position Analysis
    positionAnalysis: "ポジション分析",
    materialAnalysis: "マテリアル分析",
    pieceActivityAnalysis: "駒の活動度分析",
    kingSafetyAnalysis: "キング安全性分析",
    centerControlAnalysis: "中央制御分析",
    positionEvaluation: "ポジション評価",
    strategicAssessment: "戦略的評価",
    tacticalOpportunities: "戦術的機会",
    positionalFactors: "ポジション要因",
    analysisInProgress: "分析中...",
    analysisComplete: "分析完了",
    analysisError: "分析エラーが発生しました",
    
    // Position Sharing System
    sharePosition: "ポジションを共有",
    generateShareCode: "共有コードを生成",
    copyShareCode: "共有コードをコピー",
    shareCodeCopied: "共有コードがクリップボードにコピーされました",
    shareCodeGenerated: "共有コードが生成されました",
    loadFromCode: "コードから読み込み",
    enterShareCode: "共有コードを入力",
    invalidShareCode: "無効な共有コード",
    shareCodeTooLong: "共有コードが長すぎます（最大12文字）",
    shareViaURL: "URLで共有",
    shareViaQR: "QRコードで共有",
    qrCodeGenerated: "QRコードが生成されました",
    scanQRCode: "QRコードをスキャン",
    qrScannerActive: "QRスキャナーがアクティブ",
    qrScannerStopped: "QRスキャナーが停止しました",
    positionShared: "ポジションが正常に共有されました",
    
    // Position History
    positionHistoryTitle: "ポジション履歴",
    undoMove: "手を戻す",
    redoMove: "手を進める",
    jumpToPosition: "ポジションにジャンプ",
    clearPositionHistory: "ポジション履歴をクリア",
    historyEmpty: "履歴が空です",
    cannotUndo: "元に戻せません",
    cannotRedo: "やり直せません",
    historyCleared: "履歴がクリアされました",
    positionRestored: "ポジションが復元されました",
    
    // Mobile Optimization
    touchToSelect: "タッチして選択",
    doubleTapToPlace: "ダブルタップして配置",
    pinchToZoom: "ピンチしてズーム",
    swipeToNavigate: "スワイプしてナビゲート",
    hapticFeedback: "ハプティックフィードバック",
    touchOptimized: "タッチ最適化",
    mobileLayout: "モバイルレイアウト",
    
    // Performance & Loading
    loading: "読み込み中...",
    processing: "処理中...",
    analyzing: "分析中...",
    generating: "生成中...",
    validating: "検証中...",
    saving: "保存中...",
    loadingPreset: "プリセット読み込み中...",
    analyzingPosition: "ポジション分析中...",
    generatingShareCode: "共有コード生成中...",
    validatingPosition: "ポジション検証中...",
    operationCancelled: "操作がキャンセルされました",
    operationCompleted: "操作が完了しました",
    operationFailed: "操作が失敗しました",
    
    // Error Messages
    errorOccurred: "エラーが発生しました",
    invalidOperation: "無効な操作",
    operationTimeout: "操作がタイムアウトしました",
    networkError: "ネットワークエラー",
    storageError: "ストレージエラー",
    validationError: "検証エラー",
    unexpectedError: "予期しないエラー",
    
    // Success Messages
    operationSuccessful: "操作が成功しました",
    positionSaved: "ポジションが保存されました",
    settingsUpdated: "設定が更新されました",
    preferencesApplied: "設定が適用されました",
    
    // Accessibility
    screenReaderAnnouncement: "スクリーンリーダーアナウンス",
    keyboardNavigation: "矢印キーでナビゲート",
    accessibilityMode: "アクセシビリティモード",
    highContrast: "ハイコントラスト",
    largeText: "大きなテキスト",
    reducedMotion: "モーション軽減",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  pt: {
    settings: "Configurações",
    newGame: "Novo Jogo",
    switchSides: "Trocar Lados",
    undo: "Desfazer",
    aiDifficulty: "Dificuldade IA:",
    easy: "🟢 Fácil (Nível 1)",
    medium: "🟡 Médio (Nível 2)",
    hard: "🔴 Difícil (Nível 3)",
    expert: "💀 Especialista (Nível 4)",
    moves: "Jogadas",
    captured: "Capturas",
    whiteCaptured: "Brancas Capturaram",
    blackCaptured: "Pretas Capturaram",
    gameStarting: "Iniciando jogo...",
    blackWon: "🏆 Pretas Venceram!",
    whiteWon: "🏆 Brancas Venceram!",
    whitePlaying: "Vez das Brancas",
    blackPlaying: "Vez das Pretas",
    moveHistory: "Histórico",
    switchedToBlack: "Agora você joga com as PRETAS!",
    switchedToWhite: "Agora você joga com as BRANCAS!",
    aiLevelSet: "Dificuldade IA: Nível",
    footerText: "© 2025 VizyonEkibi",
    language: "🌍 Idioma:",
    
    // Enhanced Theme System
    themeToggle: "Alternar Tema",
    switchToLight: "Mudar para tema claro",
    switchToDark: "Mudar para tema escuro",
    currentTheme: "Tema atual",
    lightTheme: "Claro",
    darkTheme: "Escuro",
    systemTheme: "Sistema",
    themeChanged: "Tema alterado com sucesso",
    darkMode: "Modo Escuro",
    lightMode: "Modo Claro",
    
    // Enhanced Drag & Drop
    dragToMove: "Arraste para mover peça",
    dropToPlace: "Solte para colocar peça",
    invalidDrop: "Local de soltar inválido",
    pieceMovedSuccessfully: "Peça movida com sucesso",
    dragCancelledByUser: "Arraste cancelado pelo usuário",
    
    // Extended Preset System
    presetCategories: "Categorias de Predefinições",
    openingPresets: "Posições de Abertura",
    middlegamePresets: "Posições de Meio-jogo",
    endgamePresets: "Posições de Final",
    puzzlePresets: "Posições de Quebra-cabeça",
    tacticalPresets: "Posições Táticas",
    educationalPresets: "Posições Educacionais",
    customPresets: "Predefinições Personalizadas",
    presetDescription: "Descrição da Predefinição",
    presetDifficulty: "Dificuldade",
    presetTags: "Tags",
    createNewPreset: "Criar Nova Predefinição",
    editPreset: "Editar Predefinição",
    deletePreset: "Excluir Predefinição",
    confirmDeletePreset: "Tem certeza de que deseja excluir esta predefinição?",
    presetCreated: "Predefinição criada com sucesso",
    presetUpdated: "Predefinição atualizada com sucesso",
    presetDeleted: "Predefinição excluída com sucesso",
    
    // Advanced Position Analysis
    positionAnalysis: "Análise de Posição",
    materialAnalysis: "Análise Material",
    pieceActivityAnalysis: "Análise de Atividade das Peças",
    kingSafetyAnalysis: "Análise de Segurança do Rei",
    centerControlAnalysis: "Análise de Controle do Centro",
    positionEvaluation: "Avaliação de Posição",
    strategicAssessment: "Avaliação Estratégica",
    tacticalOpportunities: "Oportunidades Táticas",
    positionalFactors: "Fatores Posicionais",
    analysisInProgress: "Análise em andamento...",
    analysisComplete: "Análise completa",
    analysisError: "Erro de análise ocorreu",
    
    // Position Sharing System
    sharePosition: "Compartilhar Posição",
    generateShareCode: "Gerar Código de Compartilhamento",
    copyShareCode: "Copiar Código de Compartilhamento",
    shareCodeCopied: "Código de compartilhamento copiado para a área de transferência",
    shareCodeGenerated: "Código de compartilhamento gerado",
    loadFromCode: "Carregar do Código",
    enterShareCode: "Digite o código de compartilhamento",
    invalidShareCode: "Código de compartilhamento inválido",
    shareCodeTooLong: "Código de compartilhamento muito longo (máx 12 caracteres)",
    shareViaURL: "Compartilhar via URL",
    shareViaQR: "Compartilhar via Código QR",
    qrCodeGenerated: "Código QR gerado",
    scanQRCode: "Escanear Código QR",
    qrScannerActive: "Scanner QR ativo",
    qrScannerStopped: "Scanner QR parado",
    positionShared: "Posição compartilhada com sucesso",
    
    // Position History
    positionHistoryTitle: "Histórico de Posições",
    undoMove: "Desfazer Movimento",
    redoMove: "Refazer Movimento",
    jumpToPosition: "Pular para Posição",
    clearPositionHistory: "Limpar Histórico de Posições",
    historyEmpty: "Histórico vazio",
    cannotUndo: "Não é possível desfazer",
    cannotRedo: "Não é possível refazer",
    historyCleared: "Histórico limpo",
    positionRestored: "Posição restaurada",
    
    // Mobile Optimization
    touchToSelect: "Toque para selecionar",
    doubleTapToPlace: "Toque duplo para colocar",
    pinchToZoom: "Belisque para ampliar",
    swipeToNavigate: "Deslize para navegar",
    hapticFeedback: "Feedback Tátil",
    touchOptimized: "Otimizado para toque",
    mobileLayout: "Layout Móvel",
    
    // Performance & Loading
    loading: "Carregando...",
    processing: "Processando...",
    analyzing: "Analisando...",
    generating: "Gerando...",
    validating: "Validando...",
    saving: "Salvando...",
    loadingPreset: "Carregando predefinição...",
    analyzingPosition: "Analisando posição...",
    generatingShareCode: "Gerando código de compartilhamento...",
    validatingPosition: "Validando posição...",
    operationCancelled: "Operação cancelada",
    operationCompleted: "Operação concluída",
    operationFailed: "Operação falhou",
    
    // Error Messages
    errorOccurred: "Ocorreu um erro",
    invalidOperation: "Operação inválida",
    operationTimeout: "Tempo limite da operação",
    networkError: "Erro de rede",
    storageError: "Erro de armazenamento",
    validationError: "Erro de validação",
    unexpectedError: "Erro inesperado",
    
    // Success Messages
    operationSuccessful: "Operação bem-sucedida",
    positionSaved: "Posição salva",
    settingsUpdated: "Configurações atualizadas",
    preferencesApplied: "Preferências aplicadas",
    
    // Accessibility
    screenReaderAnnouncement: "Anúncio do leitor de tela",
    keyboardNavigation: "Use as setas para navegar",
    accessibilityMode: "Modo de Acessibilidade",
    highContrast: "Alto Contraste",
    largeText: "Texto Grande",
    reducedMotion: "Movimento Reduzido",
    
    // RTL Support Preparation
    textDirection: "ltr",
    alignStart: "left",
    alignEnd: "right",
  },
  ar: {
    settings: "الإعدادات",
    newGame: "لعبة جديدة",
    switchSides: "تبديل الجوانب",
    undo: "تراجع",
    aiDifficulty: "صعوبة الذكاء الاصطناعي:",
    easy: "🟢 سهل (مستوى 1)",
    medium: "🟡 متوسط (مستوى 2)",
    hard: "🔴 صعب (مستوى 3)",
    expert: "💀 خبير (مستوى 4)",
    moves: "نقلات",
    captured: "قطع مأخوذة",
    whiteCaptured: "أبيض أخذ",
    blackCaptured: "أسود أخذ",
    gameStarting: "بدء اللعبة...",
    blackWon: "🏆 فاز الأسود!",
    whiteWon: "🏆 فاز الأبيض!",
    whitePlaying: "دور الأبيض",
    blackPlaying: "دور الأسود",
    moveHistory: "سجل النقلات",
    switchedToBlack: "أنت تلعب الآن بالأسود!",
    switchedToWhite: "أنت تلعب الآن بالأبيض!",
    aiLevelSet: "صعوبة الذكاء الاصطناعي: مستوى",
    footerText: "© 2025 VizyonEkibi",
    language: "🌍 اللغة:",
    
    // Enhanced Theme System
    themeToggle: "تبديل المظهر",
    switchToLight: "التبديل إلى المظهر الفاتح",
    switchToDark: "التبديل إلى المظهر الداكن",
    currentTheme: "المظهر الحالي",
    lightTheme: "فاتح",
    darkTheme: "داكن",
    systemTheme: "النظام",
    themeChanged: "تم تغيير المظهر بنجاح",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    
    // Enhanced Drag & Drop
    dragToMove: "اسحب لتحريك القطعة",
    dropToPlace: "أفلت لوضع القطعة",
    invalidDrop: "موقع إفلات غير صالح",
    pieceMovedSuccessfully: "تم تحريك القطعة بنجاح",
    dragCancelledByUser: "تم إلغاء السحب من قبل المستخدم",
    
    // Extended Preset System
    presetCategories: "فئات القوالب",
    openingPresets: "مواضع الافتتاح",
    middlegamePresets: "مواضع وسط اللعبة",
    endgamePresets: "مواضع نهاية اللعبة",
    puzzlePresets: "مواضع الألغاز",
    tacticalPresets: "المواضع التكتيكية",
    educationalPresets: "المواضع التعليمية",
    customPresets: "القوالب المخصصة",
    presetDescription: "وصف القالب",
    presetDifficulty: "الصعوبة",
    presetTags: "العلامات",
    createNewPreset: "إنشاء قالب جديد",
    editPreset: "تحرير القالب",
    deletePreset: "حذف القالب",
    confirmDeletePreset: "هل أنت متأكد من أنك تريد حذف هذا القالب؟",
    presetCreated: "تم إنشاء القالب بنجاح",
    presetUpdated: "تم تحديث القالب بنجاح",
    presetDeleted: "تم حذف القالب بنجاح",
    
    // Advanced Position Analysis
    positionAnalysis: "تحليل الموضع",
    materialAnalysis: "تحليل المواد",
    pieceActivityAnalysis: "تحليل نشاط القطع",
    kingSafetyAnalysis: "تحليل أمان الملك",
    centerControlAnalysis: "تحليل السيطرة على المركز",
    positionEvaluation: "تقييم الموضع",
    strategicAssessment: "التقييم الاستراتيجي",
    tacticalOpportunities: "الفرص التكتيكية",
    positionalFactors: "العوامل الموضعية",
    analysisInProgress: "التحليل قيد التقدم...",
    analysisComplete: "اكتمل التحليل",
    analysisError: "حدث خطأ في التحليل",
    
    // Position Sharing System
    sharePosition: "مشاركة الموضع",
    generateShareCode: "إنشاء رمز المشاركة",
    copyShareCode: "نسخ رمز المشاركة",
    shareCodeCopied: "تم نسخ رمز المشاركة إلى الحافظة",
    shareCodeGenerated: "تم إنشاء رمز المشاركة",
    loadFromCode: "تحميل من الرمز",
    enterShareCode: "أدخل رمز المشاركة",
    invalidShareCode: "رمز مشاركة غير صالح",
    shareCodeTooLong: "رمز المشاركة طويل جداً (الحد الأقصى 12 حرف)",
    shareViaURL: "مشاركة عبر الرابط",
    shareViaQR: "مشاركة عبر رمز QR",
    qrCodeGenerated: "تم إنشاء رمز QR",
    scanQRCode: "مسح رمز QR",
    qrScannerActive: "ماسح QR نشط",
    qrScannerStopped: "تم إيقاف ماسح QR",
    positionShared: "تم مشاركة الموضع بنجاح",
    
    // Position History
    positionHistoryTitle: "تاريخ المواضع",
    undoMove: "تراجع عن النقلة",
    redoMove: "إعادة النقلة",
    jumpToPosition: "الانتقال إلى الموضع",
    clearPositionHistory: "مسح تاريخ المواضع",
    historyEmpty: "التاريخ فارغ",
    cannotUndo: "لا يمكن التراجع",
    cannotRedo: "لا يمكن الإعادة",
    historyCleared: "تم مسح التاريخ",
    positionRestored: "تم استعادة الموضع",
    
    // Mobile Optimization
    touchToSelect: "المس للاختيار",
    doubleTapToPlace: "انقر مرتين للوضع",
    pinchToZoom: "اقرص للتكبير",
    swipeToNavigate: "اسحب للتنقل",
    hapticFeedback: "التغذية الراجعة اللمسية",
    touchOptimized: "محسن للمس",
    mobileLayout: "تخطيط الجوال",
    
    // Performance & Loading
    loading: "جاري التحميل...",
    processing: "جاري المعالجة...",
    analyzing: "جاري التحليل...",
    generating: "جاري الإنشاء...",
    validating: "جاري التحقق...",
    saving: "جاري الحفظ...",
    loadingPreset: "جاري تحميل القالب...",
    analyzingPosition: "جاري تحليل الموضع...",
    generatingShareCode: "جاري إنشاء رمز المشاركة...",
    validatingPosition: "جاري التحقق من الموضع...",
    operationCancelled: "تم إلغاء العملية",
    operationCompleted: "اكتملت العملية",
    operationFailed: "فشلت العملية",
    
    // Error Messages
    errorOccurred: "حدث خطأ",
    invalidOperation: "عملية غير صالحة",
    operationTimeout: "انتهت مهلة العملية",
    networkError: "خطأ في الشبكة",
    storageError: "خطأ في التخزين",
    validationError: "خطأ في التحقق",
    unexpectedError: "خطأ غير متوقع",
    
    // Success Messages
    operationSuccessful: "العملية ناجحة",
    positionSaved: "تم حفظ الموضع",
    settingsUpdated: "تم تحديث الإعدادات",
    preferencesApplied: "تم تطبيق التفضيلات",
    
    // Accessibility
    screenReaderAnnouncement: "إعلان قارئ الشاشة",
    keyboardNavigation: "استخدم مفاتيح الأسهم للتنقل",
    accessibilityMode: "وضع إمكانية الوصول",
    highContrast: "تباين عالي",
    largeText: "نص كبير",
    reducedMotion: "حركة مقللة",
    
    // RTL Support Preparation
    textDirection: "rtl",
    alignStart: "right",
    alignEnd: "left",
  },
};

let currentLang = "en";

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  updateUIText();
  localStorage.setItem("4x5_lang", lang);

  // Update HTML dir attribute for RTL support (Arabic)
  if (lang === "ar") {
    document.documentElement.setAttribute("dir", "rtl");
  } else {
    document.documentElement.setAttribute("dir", "ltr");
  }
}

function t(key) {
  return translations[currentLang][key] || translations["en"][key] || key;
}

// Helper function to get text direction for current language
function getTextDirection() {
  return t("textDirection");
}

// Helper function to get alignment start (left for LTR, right for RTL)
function getAlignStart() {
  return t("alignStart");
}

// Helper function to get alignment end (right for LTR, left for RTL)
function getAlignEnd() {
  return t("alignEnd");
}

// Helper function to check if current language is RTL
function isRTL() {
  return getTextDirection() === "rtl";
}

function updateUIText() {
  // Update Start Screen elements
  const startTitle = document.getElementById("startTitle");
  if (startTitle) startTitle.textContent = t("gameTitle");

  const startSubtitle = document.getElementById("startSubtitle");
  if (startSubtitle) startSubtitle.textContent = t("gameSubtitle");

  const btnStartGame = document.getElementById("btnStartGame");
  if (btnStartGame) btnStartGame.textContent = `▶ ${t("startGame")}`;

  const startDifficulty = document.getElementById("startDifficulty");
  if (startDifficulty) {
    startDifficulty.options[0].textContent = t("easy");
    startDifficulty.options[1].textContent = t("medium");
    startDifficulty.options[2].textContent = t("hard");
    startDifficulty.options[3].textContent = t("expert");
  }

  // Update Game Over Screen elements
  const gameOverTitle = document.getElementById("gameOverTitle");
  if (gameOverTitle) gameOverTitle.textContent = t("gameOver");

  const btnPlayAgain = document.getElementById("btnPlayAgain");
  if (btnPlayAgain) btnPlayAgain.textContent = `🔄 ${t("playAgain")}`;

  const btnMainMenu = document.getElementById("btnMainMenu");
  if (btnMainMenu) btnMainMenu.textContent = `🏠 ${t("mainMenu")}`;

  const btnReviewGame = document.getElementById("btnReviewGame");
  if (btnReviewGame) btnReviewGame.textContent = `👀 ${t("reviewGame")}`;

  // Update static elements
  const settingsTitle = document.getElementById("settingsTitle");
  if (settingsTitle) settingsTitle.innerHTML = `<span class="icon">🎯</span> ${t("settings")}`;

  const btnNewGame = document.getElementById("btnNewGame");
  if (btnNewGame) btnNewGame.textContent = `🔄 ${t("newGame")}`;

  const btnSwitchSides = document.getElementById("btnSwitchSides");
  if (btnSwitchSides) btnSwitchSides.textContent = `🔀 ${t("switchSides")}`;

  const lblAiDifficulty = document.getElementById("lblAiDifficulty");
  if (lblAiDifficulty) lblAiDifficulty.textContent = `⚙️ ${t("aiDifficulty")}`;

  // Update options in main settings select
  const aiSelect = document.getElementById("aiLevel");
  if (aiSelect) {
    aiSelect.options[0].textContent = t("easy");
    aiSelect.options[1].textContent = t("medium");
    aiSelect.options[2].textContent = t("hard");
    aiSelect.options[3].textContent = t("expert");
  }

  const lblMoves = document.getElementById("lblMoves");
  if (lblMoves) lblMoves.textContent = t("moves");

  const lblCaptured = document.getElementById("lblCaptured");
  if (lblCaptured) lblCaptured.textContent = t("captured");

  const lblWhiteCaptured = document.getElementById("lblWhiteCaptured");
  if (lblWhiteCaptured) lblWhiteCaptured.innerHTML = `<span class="icon">⚪</span> ${t("whiteCaptured")}`;

  const lblBlackCaptured = document.getElementById("lblBlackCaptured");
  if (lblBlackCaptured) lblBlackCaptured.innerHTML = `<span class="icon">⚫</span> ${t("blackCaptured")}`;

  const historyTitle = document.getElementById("historyTitle");
  if (historyTitle) historyTitle.innerHTML = `<span class="icon">📜</span> ${t("moveHistory")}`;

  // Update color customization labels
  const lblColorSettings = document.getElementById("lblColorSettings");
  if (lblColorSettings) lblColorSettings.textContent = `🎨 ${t("colorSettings")}`;

  const lblBoardColors = document.getElementById("lblBoardColors");
  if (lblBoardColors) lblBoardColors.textContent = `📋 ${t("boardColors")}`;

  const lblLightSquares = document.getElementById("lblLightSquares");
  if (lblLightSquares) lblLightSquares.textContent = t("lightSquares");

  const lblDarkSquares = document.getElementById("lblDarkSquares");
  if (lblDarkSquares) lblDarkSquares.textContent = t("darkSquares");

  const lblPieceColors = document.getElementById("lblPieceColors");
  if (lblPieceColors) lblPieceColors.textContent = `♔ ${t("pieceColors")}`;

  const lblWhitePieces = document.getElementById("lblWhitePieces");
  if (lblWhitePieces) lblWhitePieces.textContent = t("whitePieces");

  const lblBlackPieces = document.getElementById("lblBlackPieces");
  if (lblBlackPieces) lblBlackPieces.textContent = t("blackPieces");

  const lblColorPresets = document.getElementById("lblColorPresets");
  if (lblColorPresets) lblColorPresets.textContent = `🎯 ${t("colorPresets")}`;

  const btnClassicColors = document.getElementById("btnClassicColors");
  if (btnClassicColors) btnClassicColors.textContent = t("classic");

  const btnWoodColors = document.getElementById("btnWoodColors");
  if (btnWoodColors) btnWoodColors.textContent = t("wood");

  const btnMarbleColors = document.getElementById("btnMarbleColors");
  if (btnMarbleColors) btnMarbleColors.textContent = t("marble");

  const btnNeonColors = document.getElementById("btnNeonColors");
  if (btnNeonColors) btnNeonColors.textContent = t("neon");

  const btnOceanColors = document.getElementById("btnOceanColors");
  if (btnOceanColors) btnOceanColors.textContent = t("ocean");

  const btnResetColors = document.getElementById("btnResetColors");
  if (btnResetColors) btnResetColors.textContent = t("reset");

  // Update color settings modal title
  const colorSettingsTitle = document.getElementById("colorSettingsTitle");
  if (colorSettingsTitle) colorSettingsTitle.textContent = `🎨 ${t("colorSettings")}`;

  // Update piece setup modal title
  const pieceSetupTitle = document.getElementById("pieceSetupTitle");
  if (pieceSetupTitle) pieceSetupTitle.textContent = `♔ ${t("pieceSetup")}`;

  // Update extra control buttons
  const btnColorsText = document.getElementById("btnColorsText");
  if (btnColorsText) btnColorsText.textContent = t("colorSettings");

  const btnPieceSetupText = document.getElementById("btnPieceSetupText");
  if (btnPieceSetupText) btnPieceSetupText.textContent = t("pieceSetup");

  // Update theme button text
  const btnThemeText = document.getElementById("btnThemeText");
  if (btnThemeText) {
    // Check current theme to show appropriate text
    const currentTheme = localStorage.getItem('4x5-chess-theme') || 'light';
    btnThemeText.textContent = currentTheme === 'dark' ? t("lightMode") : t("darkMode");
  }

  // Update piece setup modal elements
  const setupInstructions = document.getElementById("setupInstructions");
  if (setupInstructions) setupInstructions.textContent = t("setupInstructions");

  const piecePaletteTitle = document.getElementById("piecePaletteTitle");
  if (piecePaletteTitle) piecePaletteTitle.textContent = t("piecePaletteTitle");

  const setupBoardTitle = document.getElementById("setupBoardTitle");
  if (setupBoardTitle) setupBoardTitle.textContent = t("setupBoardTitle");

  const lblFirstMove = document.getElementById("lblFirstMove");
  if (lblFirstMove) lblFirstMove.textContent = t("lblFirstMove");

  const btnClearBoard = document.getElementById("btnClearBoard");
  if (btnClearBoard) btnClearBoard.textContent = t("btnClearBoard");

  const btnResetToDefault = document.getElementById("btnResetToDefault");
  if (btnResetToDefault) btnResetToDefault.textContent = t("btnResetToDefault");

  const btnStartCustomGame = document.getElementById("btnStartCustomGame");
  if (btnStartCustomGame) btnStartCustomGame.textContent = t("btnStartCustomGame");

  const btnCancelSetup = document.getElementById("btnCancelSetup");
  if (btnCancelSetup) btnCancelSetup.textContent = t("btnCancelSetup");

  // Update user preset management elements
  const userPresetsTitle = document.getElementById("userPresetsTitle");
  if (userPresetsTitle) userPresetsTitle.textContent = t("userPresetsTitle");
  
  const loadPresetText = document.getElementById("loadPresetText");
  if (loadPresetText) loadPresetText.textContent = t("loadPresetText");
  
  const saveAsPresetText = document.getElementById("saveAsPresetText");
  if (saveAsPresetText) saveAsPresetText.textContent = t("saveAsPresetText");
  
  const deletePresetText = document.getElementById("deletePresetText");
  if (deletePresetText) deletePresetText.textContent = t("deletePresetText");
  
  const exportPresetsText = document.getElementById("exportPresetsText");
  if (exportPresetsText) exportPresetsText.textContent = t("exportPresetsText");
  
  const importPresetsText = document.getElementById("importPresetsText");
  if (importPresetsText) importPresetsText.textContent = t("importPresetsText");

  // Update enhanced theme system elements
  const themeToggleButton = document.querySelector('.theme-toggle-button');
  if (themeToggleButton) {
    const tooltip = themeToggleButton.querySelector('.theme-toggle-tooltip');
    if (tooltip) tooltip.textContent = t("themeToggle");
    
    const srText = themeToggleButton.querySelector('.theme-toggle-sr-text');
    if (srText) srText.textContent = t("currentTheme") + ": " + t(currentTheme === 'light' ? 'lightTheme' : 'darkTheme');
  }

  // Update enhanced sharing interface elements
  const sharePositionBtn = document.getElementById("sharePositionBtn");
  if (sharePositionBtn) sharePositionBtn.textContent = t("sharePosition");
  
  const generateShareCodeBtn = document.getElementById("generateShareCodeBtn");
  if (generateShareCodeBtn) generateShareCodeBtn.textContent = t("generateShareCode");
  
  const copyShareCodeBtn = document.getElementById("copyShareCodeBtn");
  if (copyShareCodeBtn) copyShareCodeBtn.textContent = t("copyShareCode");
  
  const loadFromCodeBtn = document.getElementById("loadFromCodeBtn");
  if (loadFromCodeBtn) loadFromCodeBtn.textContent = t("loadFromCode");
  
  const shareViaURLBtn = document.getElementById("shareViaURLBtn");
  if (shareViaURLBtn) shareViaURLBtn.textContent = t("shareViaURL");
  
  const shareViaQRBtn = document.getElementById("shareViaQRBtn");
  if (shareViaQRBtn) shareViaQRBtn.textContent = t("shareViaQR");
  
  const scanQRCodeBtn = document.getElementById("scanQRCodeBtn");
  if (scanQRCodeBtn) scanQRCodeBtn.textContent = t("scanQRCode");

  // Update position history interface elements
  const positionHistoryTitle = document.getElementById("positionHistoryTitle");
  if (positionHistoryTitle) positionHistoryTitle.textContent = t("positionHistoryTitle");
  
  const undoBtn = document.getElementById("undoBtn");
  if (undoBtn) undoBtn.textContent = t("undoMove");
  
  const redoBtn = document.getElementById("redoBtn");
  if (redoBtn) redoBtn.textContent = t("redoMove");
  
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (clearHistoryBtn) clearHistoryBtn.textContent = t("clearPositionHistory");

  // Update position analysis elements
  const positionAnalysisTitle = document.getElementById("positionAnalysisTitle");
  if (positionAnalysisTitle) positionAnalysisTitle.textContent = t("positionAnalysis");
  
  const materialAnalysisLabel = document.getElementById("materialAnalysisLabel");
  if (materialAnalysisLabel) materialAnalysisLabel.textContent = t("materialAnalysis");
  
  const pieceActivityLabel = document.getElementById("pieceActivityLabel");
  if (pieceActivityLabel) pieceActivityLabel.textContent = t("pieceActivityAnalysis");
  
  const kingSafetyLabel = document.getElementById("kingSafetyLabel");
  if (kingSafetyLabel) kingSafetyLabel.textContent = t("kingSafetyAnalysis");
  
  const centerControlLabel = document.getElementById("centerControlLabel");
  if (centerControlLabel) centerControlLabel.textContent = t("centerControlAnalysis");

  // Update preset category labels
  const openingPresetsLabel = document.getElementById("openingPresetsLabel");
  if (openingPresetsLabel) openingPresetsLabel.textContent = t("openingPresets");
  
  const middlegamePresetsLabel = document.getElementById("middlegamePresetsLabel");
  if (middlegamePresetsLabel) middlegamePresetsLabel.textContent = t("middlegamePresets");
  
  const endgamePresetsLabel = document.getElementById("endgamePresetsLabel");
  if (endgamePresetsLabel) endgamePresetsLabel.textContent = t("endgamePresets");
  
  const puzzlePresetsLabel = document.getElementById("puzzlePresetsLabel");
  if (puzzlePresetsLabel) puzzlePresetsLabel.textContent = t("puzzlePresets");
  
  const tacticalPresetsLabel = document.getElementById("tacticalPresetsLabel");
  if (tacticalPresetsLabel) tacticalPresetsLabel.textContent = t("tacticalPresets");

  // Update loading indicator elements
  const loadingStatusText = document.querySelector('.loading-status-text');
  if (loadingStatusText && loadingStatusText.textContent === 'Loading...') {
    loadingStatusText.textContent = t("loading");
  }
  
  const loadingCancelButton = document.querySelector('.loading-cancel-button');
  if (loadingCancelButton) loadingCancelButton.innerHTML = '❌ ' + t("cancel");

  // Update mobile optimization elements
  const mobileLayoutToggle = document.getElementById("mobileLayoutToggle");
  if (mobileLayoutToggle) mobileLayoutToggle.textContent = t("mobileLayout");
  
  const hapticFeedbackToggle = document.getElementById("hapticFeedbackToggle");
  if (hapticFeedbackToggle) hapticFeedbackToggle.textContent = t("hapticFeedback");

  // Update accessibility elements
  const accessibilityModeToggle = document.getElementById("accessibilityModeToggle");
  if (accessibilityModeToggle) accessibilityModeToggle.textContent = t("accessibilityMode");
  
  const highContrastToggle = document.getElementById("highContrastToggle");
  if (highContrastToggle) highContrastToggle.textContent = t("highContrast");
  
  const largeTextToggle = document.getElementById("largeTextToggle");
  if (largeTextToggle) largeTextToggle.textContent = t("largeText");
  
  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  if (reducedMotionToggle) reducedMotionToggle.textContent = t("reducedMotion");

  // Update game status if game is active
  if (typeof bilgiGuncelle === "function") {
    bilgiGuncelle();
  }
}

// Initialize language from local storage or default to English
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("4x5_lang");
  if (savedLang && translations[savedLang]) {
    // Update both language selectors
    const startLanguageSelect = document.getElementById("startLanguage");
    const settingsLanguageSelect = document.getElementById("languageSelect");
    
    if (startLanguageSelect) startLanguageSelect.value = savedLang;
    if (settingsLanguageSelect) settingsLanguageSelect.value = savedLang;
    
    setLanguage(savedLang);
  } else {
    setLanguage("en");
  }
});

// Listen for language changes from other tabs/windows
window.addEventListener('storage', function(e) {
  if (e.key === '4x5_lang' && e.newValue && translations[e.newValue]) {
    // Update both language selectors
    const startLanguageSelect = document.getElementById("startLanguage");
    const settingsLanguageSelect = document.getElementById("languageSelect");
    
    if (startLanguageSelect) startLanguageSelect.value = e.newValue;
    if (settingsLanguageSelect) settingsLanguageSelect.value = e.newValue;
    
    setLanguage(e.newValue);
  }
});