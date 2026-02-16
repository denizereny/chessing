/**
 * Backend Integration Script
 * Bridges the existing game.js with the backend API
 */

// Initialize backend mode on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔌 Initializing backend mode...');
  await initBackendMode();
});

/**
 * Toggle backend mode on/off
 */
async function toggleBackendMode() {
  if (!backendGameMode) {
    await initBackendMode();
  }

  const connected = await backendGameMode.toggle();
  const btn = document.getElementById('btnBackendMode');
  const btnText = document.getElementById('btnBackendModeText');

  if (connected) {
    btn.classList.remove('disabled');
    btnText.textContent = 'Backend Mode: ON';
    bildirimGoster('✅ Backend mode enabled', 'success');
  } else {
    btn.classList.add('disabled');
    btnText.textContent = 'Backend Mode: OFF';
    bildirimGoster('⚠️ Backend mode disabled (using local mode)', 'warning');
  }
}

/**
 * Enhanced yeniOyun function with backend support
 * This wraps the existing yeniOyun function
 */
const originalYeniOyun = typeof yeniOyun !== 'undefined' ? yeniOyun : null;

if (originalYeniOyun) {
  window.yeniOyun = async function() {
    // Check if backend mode is enabled
    if (backendGameMode && backendGameMode.enabled) {
      console.log('🎮 Starting new game with backend...');
      
      // Get custom position if available
      const useCustomPosition = localStorage.getItem('useCustomPosition');
      const customPosition = localStorage.getItem('customChessPosition');
      let customBoard = null;
      
      if (useCustomPosition === 'true' && customPosition) {
        try {
          customBoard = JSON.parse(customPosition);
        } catch (error) {
          console.error('Failed to parse custom position:', error);
        }
      }

      // Get AI difficulty
      const aiLevel = parseInt(document.getElementById('aiLevel').value) || 2;
      const playerColor = bilgisayarRengi === 'siyah' ? 'white' : 'black';

      // Create game with backend
      const result = await backendGameMode.startNewGame(aiLevel, playerColor, customBoard);
      
      if (result.success) {
        // Update frontend state from backend
        tahta = backendGameMode.updateBoardFromBackend(result.data.board_state);
        beyazSirasi = result.data.white_to_move;
        seciliKare = null;
        gecerliHamleler = [];
        oyunBitti = false;
        hamleGecmisi = [];
        yakalananlar = { beyaz: [], siyah: [] };
        hamleNumarasi = 0;
        oyunSuresi = 0;
        sonHamle = null;
        aiCalisiyor = false;

        // Clear custom position flag
        localStorage.removeItem('useCustomPosition');

        // Start timer
        clearInterval(zamanSayaci);
        zamanSayaci = setInterval(() => {
          oyunSuresi++;
          const dk = Math.floor(oyunSuresi / 60).toString().padStart(2, "0");
          const sn = (oyunSuresi % 60).toString().padStart(2, "0");
          document.getElementById("timer").textContent = `⏱️ ${dk}:${sn}`;
        }, 1000);

        // Update UI
        tahtayiCiz();
        bilgiGuncelle();
        gecmisiGuncelle();
        yakananGuncelle();
        istatistikGuncelle();

        bildirimGoster('🎮 Game started with backend!', 'success');

        // If AI plays first
        if (bilgisayarRengi === "beyaz") {
          setTimeout(bilgisayarOynaBackend, 500);
        }
      } else {
        // Fallback to local mode
        console.warn('Backend game creation failed, using local mode');
        bildirimGoster('⚠️ Backend unavailable, using local mode', 'warning');
        originalYeniOyun();
      }
    } else {
      // Use original local mode
      originalYeniOyun();
    }
  };
}

/**
 * Enhanced hamleYap function with backend support
 */
const originalHamleYap = typeof hamleYap !== 'undefined' ? hamleYap : null;

if (originalHamleYap) {
  window.hamleYap = async function(basSat, basSut, bitSat, bitSut, kaydet = true) {
    // Check if backend mode is enabled
    if (backendGameMode && backendGameMode.enabled && kaydet) {
      console.log('🎯 Making move with backend...');
      
      const result = await backendGameMode.makeMove(basSat, basSut, bitSat, bitSut);
      
      if (result.success) {
        // Update frontend state from backend
        tahta = backendGameMode.updateBoardFromBackend(result.data.board_state);
        beyazSirasi = result.data.white_to_move;
        
        // Update captured pieces
        if (result.data.captured_piece) {
          const renk = beyazMi(result.data.captured_piece) ? "siyah" : "beyaz";
          yakalananlar[renk].push(result.data.captured_piece);
        }

        // Update move history
        const hamleNotasyon = `${KARE_NOTASYON[basSat][basSut]}-${KARE_NOTASYON[bitSat][bitSut]}`;
        hamleGecmisi.push({
          tahta: tahta.map((s) => [...s]),
          yakalananlar: JSON.parse(JSON.stringify(yakalananlar)),
          hamleNo: hamleNumarasi,
          notasyon: hamleNotasyon,
          tas: TASLAR[result.data.captured_piece] || '',
          yakalanan: result.data.captured_piece ? TASLAR[result.data.captured_piece] : null,
        });

        if (beyazSirasi) hamleNumarasi++;

        sonHamle = { basSat, basSut, bitSat, bitSut };

        // Check game over
        if (result.data.game_over) {
          oyunBitti = true;
          clearInterval(zamanSayaci);
          oyunBittiGoster(result.data.winner);
        }

        // Update UI
        gecmisiGuncelle();
        yakananGuncelle();
        istatistikGuncelle();
        
        return true;
      } else {
        // Move failed
        bildirimGoster(`❌ ${result.error}`, 'error');
        return false;
      }
    } else {
      // Use original local mode
      return originalHamleYap(basSat, basSut, bitSat, bitSut, kaydet);
    }
  };
}

/**
 * Backend AI move function
 */
async function bilgisayarOynaBackend() {
  if (oyunBitti || !backendGameMode || !backendGameMode.enabled) return;
  
  aiCalisiyor = true;
  console.log('🤖 Requesting AI move from backend...');

  const result = await backendGameMode.requestAIMove();

  if (result.success) {
    // Update frontend state from backend
    tahta = backendGameMode.updateBoardFromBackend(result.data.board_state);
    beyazSirasi = result.data.white_to_move;
    
    // Update captured pieces
    if (result.data.captured_piece) {
      const renk = beyazMi(result.data.captured_piece) ? "siyah" : "beyaz";
      yakalananlar[renk].push(result.data.captured_piece);
    }

    // Update move history
    const fromPos = backendGameMode.positionFromBackend(result.data.move_from);
    const toPos = backendGameMode.positionFromBackend(result.data.move_to);
    const hamleNotasyon = `${KARE_NOTASYON[fromPos.sat][fromPos.sut]}-${KARE_NOTASYON[toPos.sat][toPos.sut]}`;
    
    hamleGecmisi.push({
      tahta: tahta.map((s) => [...s]),
      yakalananlar: JSON.parse(JSON.stringify(yakalananlar)),
      hamleNo: hamleNumarasi,
      notasyon: hamleNotasyon,
      tas: '',
      yakalanan: result.data.captured_piece ? TASLAR[result.data.captured_piece] : null,
    });

    if (!beyazSirasi) hamleNumarasi++;

    sonHamle = { 
      basSat: fromPos.sat, 
      basSut: fromPos.sut, 
      bitSat: toPos.sat, 
      bitSut: toPos.sut 
    };

    // Check game over
    if (result.data.game_over) {
      oyunBitti = true;
      clearInterval(zamanSayaci);
      oyunBittiGoster(result.data.winner);
    }

    // Update UI
    tahtayiCiz();
    bilgiGuncelle();
    gecmisiGuncelle();
    yakananGuncelle();
    istatistikGuncelle();

    console.log(`✅ AI move completed in ${result.data.calculation_time}s`);
  } else {
    console.error('❌ AI move failed:', result.error);
    bildirimGoster(`❌ AI move failed: ${result.error}`, 'error');
  }

  aiCalisiyor = false;
}

/**
 * Enhanced bilgisayarOyna function with backend support
 */
const originalBilgisayarOyna = typeof bilgisayarOyna !== 'undefined' ? bilgisayarOyna : null;

if (originalBilgisayarOyna) {
  window.bilgisayarOyna = async function() {
    // Check if backend mode is enabled
    if (backendGameMode && backendGameMode.enabled) {
      await bilgisayarOynaBackend();
    } else {
      // Use original local mode
      originalBilgisayarOyna();
    }
  };
}

console.log('✅ Backend integration script loaded');
