const TASLAR = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const DEGERLER = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
const KARE_NOTASYON = [
  ["a5", "b5", "c5", "d5"],
  ["a4", "b4", "c4", "d4"],
  ["a3", "b3", "c3", "d3"],
  ["a2", "b2", "c2", "d2"],
  ["a1", "b1", "c1", "d1"],
];

let tahta = [];
let seciliKare = null;
let gecerliHamleler = [];
let beyazSirasi = true;
let oyunBitti = false;
let bilgisayarRengi = "siyah";
let hamleGecmisi = [];
let yakalananlar = { beyaz: [], siyah: [] };
let hamleNumarasi = 0;
let aiDerinlik = 2;
let oyunSuresi = 0;
let zamanSayaci = null;
let sonHamle = null;
let aiCalisiyor = false;

// Piece Setup Variables
let setupBoard = [];
let selectedPalettePiece = null;
let setupMode = false;

function tahtayiBaslat() {
  tahta = [
    ["r", "q", "k", "r"],
    ["p", "p", "p", "p"],
    [null, null, null, null],
    ["P", "P", "P", "P"],
    ["R", "Q", "K", "R"],
  ];
}

function yeniOyun() {
  // Özel pozisyon kontrolü
  const useCustomPosition = localStorage.getItem('useCustomPosition');
  const customPosition = localStorage.getItem('customChessPosition');
  const customPositionInfo = localStorage.getItem('customPositionInfo');
  
  if (useCustomPosition === 'true' && customPosition) {
    try {
      const customBoard = JSON.parse(customPosition);
      tahta = customBoard.map(row => [...row]);
      
      // Özel pozisyon bayrağını temizle
      localStorage.removeItem('useCustomPosition');
      
      // Pozisyon bilgilerini göster
      if (customPositionInfo) {
        try {
          const info = JSON.parse(customPositionInfo);
          bildirimGoster(`🎮 ${info.name} yüklendi! (${info.pieces} taş, ${info.created})`, 'success');
        } catch (e) {
          bildirimGoster('🎮 Özel pozisyon yüklendi! Bot ile oynayabilirsiniz.', 'success');
        }
      } else {
        bildirimGoster('🎮 Özel pozisyon yüklendi! Bot ile oynayabilirsiniz.', 'success');
      }
    } catch (error) {
      console.error('Özel pozisyon yüklenemedi:', error);
      tahtayiBaslat(); // Varsayılan pozisyona dön
      bildirimGoster('⚠️ Özel pozisyon yüklenemedi, varsayılan pozisyon kullanılıyor.', 'error');
    }
  } else {
    tahtayiBaslat();
  }
  
  seciliKare = null;
  gecerliHamleler = [];
  beyazSirasi = true;
  oyunBitti = false;
  hamleGecmisi = [];
  yakalananlar = { beyaz: [], siyah: [] };
  hamleNumarasi = 0;
  oyunSuresi = 0;
  sonHamle = null;
  aiCalisiyor = false;

  clearInterval(zamanSayaci);
  zamanSayaci = setInterval(() => {
    oyunSuresi++;
    const dk = Math.floor(oyunSuresi / 60)
      .toString()
      .padStart(2, "0");
    const sn = (oyunSuresi % 60).toString().padStart(2, "0");
    document.getElementById("timer").textContent = `⏱️ ${dk}:${sn}`;
  }, 1000);

  tahtayiCiz();
  bilgiGuncelle();
  gecmisiGuncelle();
  yakananGuncelle();
  istatistikGuncelle();

  if (bilgisayarRengi === "beyaz") {
    setTimeout(bilgisayarOyna, 500);
  }
}

function tarafDegistir() {
  bilgisayarRengi = bilgisayarRengi === "beyaz" ? "siyah" : "beyaz";
  const msg = bilgisayarRengi === "beyaz" ? t("switchedToBlack") : t("switchedToWhite");
  bildirimGoster(msg);
  yeniOyun();
}

function geriAl() {
  if (hamleGecmisi.length < 2) return;

  hamleGecmisi.pop();
  const oncekiDurum = hamleGecmisi.pop();

  if (oncekiDurum) {
    tahta = oncekiDurum.tahta.map((s) => [...s]);
    yakalananlar = JSON.parse(JSON.stringify(oncekiDurum.yakalananlar));
    beyazSirasi = true;
    hamleNumarasi = oncekiDurum.hamleNo;
    sonHamle = null;
    tahtayiCiz();
    bilgiGuncelle();
    gecmisiGuncelle();
    yakananGuncelle();
    istatistikGuncelle();
  }
}

const AI_DEPTHS = { 1: 2, 2: 3, 3: 5, 4: 7 };

function aiSeviyesiDegisti() {
  const level = parseInt(document.getElementById("aiLevel").value);
  aiDerinlik = AI_DEPTHS[level] || 3;
  bildirimGoster(`${t("aiLevelSet")} ${level}`);
}

function togglePanel(which) {
  const panelId = which === "settings" ? "settingsPanel" : "historyPanel";
  const panel = document.getElementById(panelId);
  if (panel) {
    panel.classList.toggle("collapsed");
  }
}

function initMobilePanels() {
  const isMobile = window.innerWidth <= 600;
  const settings = document.getElementById("settingsPanel");
  const history = document.getElementById("historyPanel");
  if (!settings || !history) return;
  if (isMobile) {
    settings.classList.add("collapsed");
    history.classList.add("collapsed");
  } else {
    settings.classList.remove("collapsed");
    history.classList.remove("collapsed");
  }
}

function tahtayiCiz() {
  const tahtaEl = document.getElementById("board");
  tahtaEl.innerHTML = "";

  for (let sat = 0; sat < 5; sat++) {
    for (let sut = 0; sut < 4; sut++) {
      const kare = document.createElement("div");
      kare.className = "square";
      kare.className += (sat + sut) % 2 === 0 ? " light" : " dark";

      const coord = document.createElement("div");
      coord.className = "coord";
      coord.textContent = KARE_NOTASYON[sat][sut];
      kare.appendChild(coord);

      const tas = tahta[sat][sut];
      if (tas) {
        const tasEl = document.createElement("div");
        tasEl.className = "piece";
        
        // Add color class based on piece color
        if (beyazMi(tas)) {
          tasEl.classList.add("white-piece");
        } else {
          tasEl.classList.add("black-piece");
        }
        
        tasEl.textContent = TASLAR[tas];
        kare.appendChild(tasEl);
      }

      if (seciliKare && seciliKare.sat === sat && seciliKare.sut === sut) {
        kare.classList.add("selected");
      }

      if (gecerliHamleler.some((h) => h.sat === sat && h.sut === sut)) {
        kare.classList.add("valid");
      }

      if (sonHamle && ((sonHamle.basSat === sat && sonHamle.basSut === sut) || (sonHamle.bitSat === sat && sonHamle.bitSut === sut))) {
        kare.classList.add("last-move");
      }

      kare.onclick = () => kareTiklandi(sat, sut);
      tahtaEl.appendChild(kare);
    }
  }
}

function kareTiklandi(sat, sut) {
  if (oyunBitti || aiCalisiyor) return;

  const oyuncuBeyazMi = bilgisayarRengi === "siyah";
  if ((oyuncuBeyazMi && !beyazSirasi) || (!oyuncuBeyazMi && beyazSirasi)) {
    return;
  }

  if (seciliKare && gecerliHamleler.some((h) => h.sat === sat && h.sut === sut)) {
    hamleYap(seciliKare.sat, seciliKare.sut, sat, sut);
    seciliKare = null;
    gecerliHamleler = [];
    tahtayiCiz();

    if (!oyunBitti) {
      beyazSirasi = !beyazSirasi;
      oyunBittiMiKontrol();
      if (oyunBitti) {
        bilgiGuncelle();
        return;
      }
      bilgiGuncelle();

      const simdiBilgisayarMi = (bilgisayarRengi === "beyaz" && beyazSirasi) || (bilgisayarRengi === "siyah" && !beyazSirasi);
      if (simdiBilgisayarMi) {
        setTimeout(bilgisayarOyna, 400);
      }
    }
    return;
  }

  const tas = tahta[sat][sut];
  if (tas && beyazMi(tas) === beyazSirasi) {
    seciliKare = { sat, sut };
    gecerliHamleler = gecerliHamleleriBul(sat, sut);
    tahtayiCiz();
  } else {
    seciliKare = null;
    gecerliHamleler = [];
    tahtayiCiz();
  }
}

function beyazMi(tas) {
  return tas === tas.toUpperCase();
}

function gecerliHamleleriBul(sat, sut) {
  const tas = tahta[sat][sut];
  if (!tas) return [];

  const hamleler = [];
  const beyaz = beyazMi(tas);
  const tur = tas.toLowerCase();

  if (tur === "p") {
    const yon = beyaz ? -1 : 1;
    if (tahta[sat + yon] && tahta[sat + yon][sut] === null) {
      hamleler.push({ sat: sat + yon, sut });
      const basSat = beyaz ? 3 : 1;
      if (sat === basSat && tahta[sat + 2 * yon][sut] === null) {
        hamleler.push({ sat: sat + 2 * yon, sut });
      }
    }
    for (const ds of [-1, 1]) {
      const yeniSut = sut + ds;
      if (yeniSut >= 0 && yeniSut < 4 && tahta[sat + yon] && tahta[sat + yon][yeniSut]) {
        if (beyazMi(tahta[sat + yon][yeniSut]) !== beyaz) {
          hamleler.push({ sat: sat + yon, sut: yeniSut });
        }
      }
    }
  } else if (tur === "r") {
    cizgiHamlelerEkle(hamleler, sat, sut, beyaz, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]);
  } else if (tur === "b") {
    cizgiHamlelerEkle(hamleler, sat, sut, beyaz, [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  } else if (tur === "q") {
    cizgiHamlelerEkle(hamleler, sat, sut, beyaz, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  } else if (tur === "n") {
    const atHamleler = [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ];
    for (const [ds, dsut] of atHamleler) {
      const yeniSat = sat + ds,
        yeniSut = sut + dsut;
      if (gecerliKare(yeniSat, yeniSut)) {
        const hedef = tahta[yeniSat][yeniSut];
        if (!hedef || beyazMi(hedef) !== beyaz) {
          hamleler.push({ sat: yeniSat, sut: yeniSut });
        }
      }
    }
  } else if (tur === "k") {
    for (let ds = -1; ds <= 1; ds++) {
      for (let dsut = -1; dsut <= 1; dsut++) {
        if (ds === 0 && dsut === 0) continue;
        const yeniSat = sat + ds,
          yeniSut = sut + dsut;
        if (gecerliKare(yeniSat, yeniSut)) {
          const hedef = tahta[yeniSat][yeniSut];
          if (!hedef || beyazMi(hedef) !== beyaz) {
            hamleler.push({ sat: yeniSat, sut: yeniSut });
          }
        }
      }
    }
  }

  return hamleler;
}

function cizgiHamlelerEkle(hamleler, sat, sut, beyaz, yonler) {
  for (const [ds, dsut] of yonler) {
    let ySat = sat + ds,
      ySut = sut + dsut;
    while (gecerliKare(ySat, ySut)) {
      const hedef = tahta[ySat][ySut];
      if (hedef) {
        if (beyazMi(hedef) !== beyaz) {
          hamleler.push({ sat: ySat, sut: ySut });
        }
        break;
      } else {
        hamleler.push({ sat: ySat, sut: ySut });
      }
      ySat += ds;
      ySut += dsut;
    }
  }
}

function gecerliKare(sat, sut) {
  return sat >= 0 && sat < 5 && sut >= 0 && sut < 4;
}

function hamleYap(basSat, basSut, bitSat, bitSut, kaydet = true) {
  sonHamle = { basSat, basSut, bitSat, bitSut };
  const tas = tahta[basSat][basSut];
  const yakalanan = tahta[bitSat][bitSut];

  if (yakalanan) {
    const renk = beyazMi(tas) ? "beyaz" : "siyah";
    yakalananlar[renk].push(yakalanan);
  }

  tahta[bitSat][bitSut] = tas;
  tahta[basSat][basSut] = null;

  const tur = tas.toLowerCase();
  if (tur === "p") {
    if ((beyazMi(tas) && bitSat === 0) || (!beyazMi(tas) && bitSat === 4)) {
      tahta[bitSat][bitSut] = beyazMi(tas) ? "Q" : "q";
    }
  }

  if (kaydet) {
    const hamleNotasyon = `${KARE_NOTASYON[basSat][basSut]}-${KARE_NOTASYON[bitSat][bitSut]}`;
    hamleGecmisi.push({
      tahta: tahta.map((s) => [...s]),
      yakalananlar: JSON.parse(JSON.stringify(yakalananlar)),
      hamleNo: hamleNumarasi,
      notasyon: hamleNotasyon,
      tas: TASLAR[tas],
      yakalanan: yakalanan ? TASLAR[yakalanan] : null,
    });

    if (beyazSirasi) hamleNumarasi++;

    gecmisiGuncelle();
    yakananGuncelle();
    istatistikGuncelle();
  }

  oyunBittiMiKontrol();
}

function oyunBittiMiKontrol() {
  const beyazKralVar = tahta.some((s) => s.some((t) => t === "K"));
  const siyahKralVar = tahta.some((s) => s.some((t) => t === "k"));
  if (!beyazKralVar || !siyahKralVar) {
    oyunBitti = true;
    clearInterval(zamanSayaci);
    oyunBittiGoster(!beyazKralVar ? "black" : "white");
    bilgiGuncelle();
    return;
  }
  const tumHamleler = tumGecerliHamleleriBul(beyazSirasi);
  if (tumHamleler.length === 0) {
    oyunBitti = true;
    clearInterval(zamanSayaci);
    oyunBittiGoster(beyazSirasi ? "black" : "white");
    bilgiGuncelle();
  }
}

function oyunBittiGoster(kazanan) {
  const screen = document.getElementById("gameOverScreen");
  const msg = document.getElementById("gameOverMessage");

  screen.classList.remove("hidden");
  msg.textContent = kazanan === "white" ? t("whiteWon") : t("blackWon");

  const container = document.getElementById("mainGameContainer");
  container.style.filter = "blur(5px)";
  container.style.opacity = "0.5";
  container.style.pointerEvents = "none";
}

function restartGame() {
  const screen = document.getElementById("gameOverScreen");
  screen.classList.add("hidden");

  const container = document.getElementById("mainGameContainer");
  container.style.filter = "none";
  container.style.opacity = "1";
  container.style.pointerEvents = "all";

  yeniOyun();
}

function showMainMenu() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  gameOverScreen.classList.add("hidden");

  const startScreen = document.getElementById("startScreen");
  startScreen.classList.remove("hidden");

  const container = document.getElementById("mainGameContainer");
  container.style.filter = "blur(5px)";
  container.style.opacity = "0.5";
  container.style.pointerEvents = "none";
}

function reviewGame() {
  const gameOverScreen = document.getElementById("gameOverScreen");
  gameOverScreen.classList.add("hidden");

  const container = document.getElementById("mainGameContainer");
  container.style.filter = "none";
  container.style.opacity = "1";
  container.style.pointerEvents = "all";
}

function tumGecerliHamleleriBul(beyazIcin) {
  const hamleler = [];
  for (let s = 0; s < 5; s++) {
    for (let su = 0; su < 4; su++) {
      const tas = tahta[s][su];
      if (tas && beyazMi(tas) === beyazIcin) {
        const tasHamleler = gecerliHamleleriBul(s, su);
        tasHamleler.forEach((h) => hamleler.push({ bas: { s, su }, bit: h }));
      }
    }
  }
  return hamleler;
}

function bilgiGuncelle() {
  const statusEl = document.getElementById("statusText");
  const pulseEl = document.getElementById("pulse");

  if (oyunBitti) {
    const winner = beyazSirasi ? t("blackWon") : t("whiteWon");
    if (statusEl) statusEl.textContent = winner;
    if (pulseEl) pulseEl.style.background = "#e57373";
  } else {
    const sira = beyazSirasi ? t("whitePlaying") : t("blackPlaying");
    const kim = (bilgisayarRengi === "beyaz" && beyazSirasi) || (bilgisayarRengi === "siyah" && !beyazSirasi) ? " 🤖" : " 👤";
    const statusText = sira + kim;
    
    if (statusEl) statusEl.textContent = statusText;
    if (pulseEl) pulseEl.style.background = beyazSirasi ? "#4fc3f7" : "#e57373";
  }
}

function gecmisiGuncelle() {
  const gecmisEl = document.getElementById("moveHistory");
  gecmisEl.innerHTML = "";

  hamleGecmisi.forEach((hamle, index) => {
    const div = document.createElement("div");
    div.className = "move-item";

    const hamleNo = Math.floor(index / 2) + 1;

    div.innerHTML = `
<span><span class="move-number">${hamleNo}.</span> ${hamle.tas} ${hamle.notasyon}</span>
${hamle.yakalanan ? `<span>❌ ${hamle.yakalanan}</span>` : ""}
`;

    gecmisEl.appendChild(div);
  });

  gecmisEl.scrollTop = gecmisEl.scrollHeight;
}

function yakananGuncelle() {
  document.getElementById("whiteCaptured").innerHTML = yakalananlar.beyaz.map((t) => `<span class="captured-piece">${TASLAR[t]}</span>`).join("");
  document.getElementById("blackCaptured").innerHTML = yakalananlar.siyah.map((t) => `<span class="captured-piece">${TASLAR[t]}</span>`).join("");
}

function istatistikGuncelle() {
  document.getElementById("moveCount").textContent = hamleGecmisi.length;
  document.getElementById("captureCount").textContent = yakalananlar.beyaz.length + yakalananlar.siyah.length;
}

function bildirimGoster(mesaj) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mesaj;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function bilgisayarOyna() {
  if (oyunBitti) return;
  aiCalisiyor = true;

  const enIyiHamle = minimaxKok(aiDerinlik);

  if (enIyiHamle) {
    hamleYap(enIyiHamle.bas.s, enIyiHamle.bas.su, enIyiHamle.bit.sat, enIyiHamle.bit.sut);
    beyazSirasi = !beyazSirasi;
    tahtayiCiz();
    oyunBittiMiKontrol();
    if (oyunBitti) {
      bilgiGuncelle();
      aiCalisiyor = false;
      return;
    }
    bilgiGuncelle();
  }
  aiCalisiyor = false;
}

function minimaxKok(derinlik) {
  const hamleler = tumGecerliHamleleriBul(beyazSirasi);
  if (hamleler.length === 0) return null;

  let enIyiSkor = beyazSirasi ? -99999 : 99999;
  let enIyiHamleler = [];

  for (const hamle of hamleler) {
    const testTahta = tahta.map((s) => [...s]);
    const tas = testTahta[hamle.bas.s][hamle.bas.su];
    testTahta[hamle.bit.sat][hamle.bit.sut] = tas;
    testTahta[hamle.bas.s][hamle.bas.su] = null;

    if (tas.toLowerCase() === "p") {
      if ((beyazMi(tas) && hamle.bit.sat === 0) || (!beyazMi(tas) && hamle.bit.sat === 4)) {
        testTahta[hamle.bit.sat][hamle.bit.sut] = beyazMi(tas) ? "Q" : "q";
      }
    }

    const skor = minimax(testTahta, derinlik - 1, -99999, 99999, !beyazSirasi);

    if (beyazSirasi) {
      if (skor > enIyiSkor) {
        enIyiSkor = skor;
        enIyiHamleler = [hamle];
      } else if (skor === enIyiSkor) {
        enIyiHamleler.push(hamle);
      }
    } else {
      if (skor < enIyiSkor) {
        enIyiSkor = skor;
        enIyiHamleler = [hamle];
      } else if (skor === enIyiSkor) {
        enIyiHamleler.push(hamle);
      }
    }
  }

  if (enIyiHamleler.length > 0) {
    const randomIndex = Math.floor(Math.random() * enIyiHamleler.length);
    return enIyiHamleler[randomIndex];
  }

  return null;
}

function minimax(testTahta, derinlik, alpha, beta, maksimize) {
  if (derinlik === 0) {
    return tahtayiDegerlendir(testTahta);
  }

  const hamleler = tumGecerliHamleleriBulTest(testTahta, maksimize);

  if (hamleler.length === 0) {
    return maksimize ? -9999 : 9999;
  }

  if (maksimize) {
    let maxSkor = -99999;
    for (const hamle of hamleler) {
      const yeniTahta = testTahta.map((s) => [...s]);
      const tas = yeniTahta[hamle.bas.s][hamle.bas.su];
      yeniTahta[hamle.bit.sat][hamle.bit.sut] = tas;
      yeniTahta[hamle.bas.s][hamle.bas.su] = null;

      if (tas.toLowerCase() === "p") {
        if ((beyazMi(tas) && hamle.bit.sat === 0) || (!beyazMi(tas) && hamle.bit.sat === 4)) {
          yeniTahta[hamle.bit.sat][hamle.bit.sut] = beyazMi(tas) ? "Q" : "q";
        }
      }

      const skor = minimax(yeniTahta, derinlik - 1, alpha, beta, false);
      maxSkor = Math.max(maxSkor, skor);
      alpha = Math.max(alpha, skor);
      if (beta <= alpha) break;
    }
    return maxSkor;
  } else {
    let minSkor = 99999;
    for (const hamle of hamleler) {
      const yeniTahta = testTahta.map((s) => [...s]);
      const tas = yeniTahta[hamle.bas.s][hamle.bas.su];
      yeniTahta[hamle.bit.sat][hamle.bit.sut] = tas;
      yeniTahta[hamle.bas.s][hamle.bas.su] = null;

      if (tas.toLowerCase() === "p") {
        if ((beyazMi(tas) && hamle.bit.sat === 0) || (!beyazMi(tas) && hamle.bit.sat === 4)) {
          yeniTahta[hamle.bit.sat][hamle.bit.sut] = beyazMi(tas) ? "Q" : "q";
        }
      }

      const skor = minimax(yeniTahta, derinlik - 1, alpha, beta, true);
      minSkor = Math.min(minSkor, skor);
      beta = Math.min(beta, skor);
      if (beta <= alpha) break;
    }
    return minSkor;
  }
}

function tumGecerliHamleleriBulTest(testTahta, beyazIcin) {
  const hamleler = [];
  const eskiTahta = tahta;
  tahta = testTahta;

  for (let s = 0; s < 5; s++) {
    for (let su = 0; su < 4; su++) {
      const tas = testTahta[s][su];
      if (tas && beyazMi(tas) === beyazIcin) {
        const tasHamleler = gecerliHamleleriBul(s, su);
        tasHamleler.forEach((h) => hamleler.push({ bas: { s, su }, bit: h }));
      }
    }
  }

  tahta = eskiTahta;
  return hamleler;
}

function tahtayiDegerlendir(testTahta) {
  let skor = 0;

  for (let s = 0; s < 5; s++) {
    for (let su = 0; su < 4; su++) {
      const tas = testTahta[s][su];
      if (tas) {
        let deger = DEGERLER[tas.toLowerCase()];

        // Piyon ilerlemesi bonusu
        if (tas.toLowerCase() === "p") {
          deger += beyazMi(tas) ? (3 - s) * 10 : s * 10;
        }
        
        // Merkez kontrol bonusu
        if (su === 1 || su === 2) deger += 5;
        
        // Kral güvenliği (özel pozisyonlar için)
        if (tas.toLowerCase() === "k") {
          // Köşelerde daha güvenli
          if ((s === 0 || s === 4) && (su === 0 || su === 3)) {
            deger += 10;
          }
          // Kenar pozisyonları da güvenli
          if (s === 0 || s === 4 || su === 0 || su === 3) {
            deger += 5;
          }
        }
        
        // Vezir aktivitesi
        if (tas.toLowerCase() === "q") {
          // Merkezi kontrol eden vezir daha değerli
          if (s >= 1 && s <= 3 && su >= 1 && su <= 2) {
            deger += 20;
          }
        }
        
        // Kale aktivitesi
        if (tas.toLowerCase() === "r") {
          // Açık sütunlarda daha değerli
          let sutunAcik = true;
          for (let checkRow = 0; checkRow < 5; checkRow++) {
            if (checkRow !== s && testTahta[checkRow][su] && 
                testTahta[checkRow][su].toLowerCase() === 'p') {
              sutunAcik = false;
              break;
            }
          }
          if (sutunAcik) deger += 15;
        }

        skor += beyazMi(tas) ? deger : -deger;
      }
    }
  }

  return skor;
}

initMobilePanels();
window.addEventListener("resize", initMobilePanels);

function toggleMobileSettings() {
  const settingsPanel = document.getElementById("settingsPanel");
  settingsPanel.classList.toggle("active");

  if (settingsPanel.classList.contains("active")) {
    settingsPanel.classList.remove("collapsed");
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

function startGame() {
  const diffSelect = document.getElementById("startDifficulty");
  const langSelect = document.getElementById("startLanguage");

  const level = parseInt(diffSelect.value);
  aiDerinlik = AI_DEPTHS[level] || 3;

  document.getElementById("aiLevel").value = level;

  const startScreen = document.getElementById("startScreen");
  startScreen.classList.add("hidden");

  // Start 4x5 chess
  const container = document.getElementById("mainGameContainer");
  container.style.filter = "none";
  container.style.opacity = "1";
  container.style.pointerEvents = "all";
  container.style.display = "flex";

  yeniOyun();
}

// 3-Dots Menu Functions
function toggleGameMenu() {
  const dropdown = document.getElementById("gameMenuDropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

function openSettings() {
  toggleGameMenu(); // Close menu first
  toggleMobileSettings(); // Open settings panel
}

function openProfile() {
  toggleGameMenu(); // Close menu first
  
  // Create or show profile modal
  let modal = document.getElementById("profileModal");
  if (!modal) {
    createProfileModal();
    modal = document.getElementById("profileModal");
  }
  
  modal.classList.remove("hidden");
  updateProfileData();
}

function openColorSettings() {
  toggleGameMenu(); // Close menu first
  
  // Open settings panel
  toggleMobileSettings();
  
  // Ensure color settings are visible
  setTimeout(() => {
    const colorContent = document.getElementById("colorSettingsContent");
    const colorChevron = document.getElementById("colorChevron");
    const colorHeader = document.querySelector(".color-customization .collapsible-header");
    
    // Make sure color settings are expanded
    if (colorContent && colorContent.classList.contains("collapsed")) {
      colorContent.classList.remove("collapsed");
      if (colorChevron) {
        colorChevron.textContent = "▴";
      }
    }
    
    // Add highlight effect
    if (colorHeader) {
      colorHeader.classList.add("highlighted");
      setTimeout(() => {
        colorHeader.classList.remove("highlighted");
      }, 2000);
    }
    
    // Scroll to color settings if needed
    if (colorHeader) {
      colorHeader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 100);
}

function openPieceSetup() {
  console.log("♔ Opening Piece Setup...");
  
  // Close menu first (if it exists)
  try {
    if (typeof toggleGameMenu === 'function') {
      toggleGameMenu();
    }
  } catch (error) {
    console.warn("Could not close game menu:", error);
  }
  
  // Çalışan taş düzeni sayfasına git (aynı sekmede)
  window.location.href = 'piece-setup-working.html';
  console.log("✅ Redirecting to piece setup page");
}

function closePieceSetup() {
  console.log("♔ Closing Piece Setup...");
  
  const modal = document.getElementById("pieceSetupModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    console.log("✅ Modal closed");
  }
}

function toggleColorSettings() {
  const content = document.getElementById("colorSettingsContent");
  const chevron = document.getElementById("colorChevron");
  
  if (content.classList.contains("collapsed")) {
    content.classList.remove("collapsed");
    chevron.textContent = "▴";
  } else {
    content.classList.add("collapsed");
    chevron.textContent = "▾";
  }
}

function pauseGame() {
  toggleGameMenu(); // Close menu first
  
  if (zamanSayaci) {
    clearInterval(zamanSayaci);
    zamanSayaci = null;
    bildirimGoster(t("gamePaused") || "Game Paused");
  } else {
    // Resume game
    zamanSayaci = setInterval(() => {
      oyunSuresi++;
      const dk = Math.floor(oyunSuresi / 60)
        .toString()
        .padStart(2, "0");
      const sn = (oyunSuresi % 60).toString().padStart(2, "0");
      document.getElementById("timer").textContent = `⏱️ ${dk}:${sn}`;
    }, 1000);
    bildirimGoster(t("gameResumed") || "Game Resumed");
  }
}

function createProfileModal() {
  const modal = document.createElement("div");
  modal.id = "profileModal";
  modal.className = "profile-modal hidden";
  
  modal.innerHTML = `
    <div class="profile-content">
      <button class="close-modal" onclick="closeProfile()">✖</button>
      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <h3 class="profile-name">Chess Player</h3>
        <p class="profile-subtitle">4×5 Chess Pro</p>
      </div>
      <div class="profile-stats">
        <div class="stat-item">
          <span class="stat-value" id="profileGamesPlayed">0</span>
          <span class="stat-label">Games Played</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="profileGamesWon">0</span>
          <span class="stat-label">Games Won</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="profileTotalMoves">0</span>
          <span class="stat-label">Total Moves</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="profileBestTime">--:--</span>
          <span class="stat-label">Best Time</span>
        </div>
      </div>
      <div class="profile-achievements">
        <h4>🏆 Achievements</h4>
        <div class="achievement-list" id="achievementList">
          <div class="achievement">🎯 First Game</div>
          <div class="achievement">⚡ Speed Player</div>
          <div class="achievement">🧠 Strategic Mind</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeProfile();
    }
  });
}

function closeProfile() {
  const modal = document.getElementById("profileModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function updateProfileData() {
  // Get stats from localStorage or use defaults
  const stats = JSON.parse(localStorage.getItem("chessStats") || "{}");
  
  document.getElementById("profileGamesPlayed").textContent = stats.gamesPlayed || 0;
  document.getElementById("profileGamesWon").textContent = stats.gamesWon || 0;
  document.getElementById("profileTotalMoves").textContent = stats.totalMoves || 0;
  document.getElementById("profileBestTime").textContent = stats.bestTime || "--:--";
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  const menu = document.getElementById("gameMenuDropdown");
  const button = document.getElementById("gameMenuBtn");
  
  if (menu && !menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.add("hidden");
  }
});

// Close piece setup modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("pieceSetupModal");
  const modalContent = document.querySelector(".piece-setup-content");
  
  if (modal && !modal.classList.contains("hidden") && !modalContent.contains(e.target)) {
    closePieceSetup();
  }
});

// Color Customization Functions
const colorPresets = {
  classic: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    whitePiece: '#ffffff',
    blackPiece: '#2c2c2c'
  },
  wood: {
    lightSquare: '#deb887',
    darkSquare: '#8b4513',
    whitePiece: '#f5f5dc',
    blackPiece: '#654321'
  },
  marble: {
    lightSquare: '#f8f8ff',
    darkSquare: '#708090',
    whitePiece: '#ffffff',
    blackPiece: '#2f4f4f'
  },
  neon: {
    lightSquare: '#00ffff',
    darkSquare: '#ff00ff',
    whitePiece: '#ffff00',
    blackPiece: '#00ff00'
  },
  ocean: {
    lightSquare: '#87ceeb',
    darkSquare: '#4682b4',
    whitePiece: '#f0f8ff',
    blackPiece: '#191970'
  }
};

function updateBoardColors() {
  const lightColor = document.getElementById('lightSquareColor').value;
  const darkColor = document.getElementById('darkSquareColor').value;
  
  // Update hex inputs
  document.getElementById('lightSquareHex').value = lightColor;
  document.getElementById('darkSquareHex').value = darkColor;
  
  // Update CSS variables
  document.documentElement.style.setProperty('--board-light', lightColor);
  document.documentElement.style.setProperty('--board-dark', darkColor);
  
  // Update preview squares
  updateColorPreviews();
  
  // Save to localStorage
  saveColorSettings();
  
  bildirimGoster(t('boardColorsUpdated') || 'Board colors updated!');
}

function updateBoardColorsFromHex(type) {
  const hexInput = document.getElementById(type + 'SquareHex');
  const colorInput = document.getElementById(type + 'SquareColor');
  
  let hexValue = hexInput.value;
  
  // Validate hex color
  if (!hexValue.startsWith('#')) {
    hexValue = '#' + hexValue;
  }
  
  if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
    colorInput.value = hexValue;
    hexInput.value = hexValue;
    
    // Update CSS
    if (type === 'light') {
      document.documentElement.style.setProperty('--board-light', hexValue);
    } else {
      document.documentElement.style.setProperty('--board-dark', hexValue);
    }
    
    // Update preview squares
    updateColorPreviews();
    
    saveColorSettings();
    bildirimGoster(t('boardColorsUpdated') || 'Board colors updated!');
  } else {
    bildirimGoster(t('invalidHexColor') || 'Invalid hex color format!');
    // Reset to previous valid value
    hexInput.value = colorInput.value;
  }
}

function updatePieceColors() {
  const whiteColor = document.getElementById('whitePieceColor').value;
  const blackColor = document.getElementById('blackPieceColor').value;
  
  // Update hex inputs
  document.getElementById('whitePieceHex').value = whiteColor;
  document.getElementById('blackPieceHex').value = blackColor;
  
  // Update CSS for piece colors with more specific selectors
  const style = document.getElementById('dynamic-piece-colors') || document.createElement('style');
  style.id = 'dynamic-piece-colors';
  style.textContent = `
    .piece.white-piece,
    .chess-piece.white-piece,
    .white-piece {
      color: ${whiteColor} !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
    }
    .piece.black-piece,
    .chess-piece.black-piece,
    .black-piece {
      color: ${blackColor} !important;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3) !important;
    }
    .white-preview {
      color: ${whiteColor} !important;
    }
    .black-preview {
      color: ${blackColor} !important;
    }
  `;
  
  if (!document.getElementById('dynamic-piece-colors')) {
    document.head.appendChild(style);
  }
  
  // Update CSS variables for preview
  document.documentElement.style.setProperty('--white-piece-color', whiteColor);
  document.documentElement.style.setProperty('--black-piece-color', blackColor);
  
  // Save to localStorage
  saveColorSettings();
  
  bildirimGoster(t('pieceColorsUpdated') || 'Piece colors updated!');
}

function updatePieceColorsFromHex(type) {
  const hexInput = document.getElementById(type + 'PieceHex');
  const colorInput = document.getElementById(type + 'PieceColor');
  
  let hexValue = hexInput.value;
  
  // Validate hex color
  if (!hexValue.startsWith('#')) {
    hexValue = '#' + hexValue;
  }
  
  if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
    colorInput.value = hexValue;
    hexInput.value = hexValue;
    
    // Update CSS with more specific selectors
    const style = document.getElementById('dynamic-piece-colors') || document.createElement('style');
    style.id = 'dynamic-piece-colors';
    
    const whiteColor = type === 'white' ? hexValue : document.getElementById('whitePieceColor').value;
    const blackColor = type === 'black' ? hexValue : document.getElementById('blackPieceColor').value;
    
    style.textContent = `
      .piece.white-piece,
      .chess-piece.white-piece,
      .white-piece {
        color: ${whiteColor} !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
      }
      .piece.black-piece,
      .chess-piece.black-piece,
      .black-piece {
        color: ${blackColor} !important;
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3) !important;
      }
      .white-preview {
        color: ${whiteColor} !important;
      }
      .black-preview {
        color: ${blackColor} !important;
      }
    `;
    
    if (!document.getElementById('dynamic-piece-colors')) {
      document.head.appendChild(style);
    }
    
    // Update CSS variables for preview
    document.documentElement.style.setProperty('--white-piece-color', whiteColor);
    document.documentElement.style.setProperty('--black-piece-color', blackColor);
    
    saveColorSettings();
    bildirimGoster(t('pieceColorsUpdated') || 'Piece colors updated!');
  } else {
    bildirimGoster(t('invalidHexColor') || 'Invalid hex color format!');
    // Reset to previous valid value
    hexInput.value = colorInput.value;
  }
}

function updateColorPreviews() {
  // This function is called to update preview colors in real-time
  // The CSS variables are already updated, so previews will update automatically
}

function applyColorPreset(presetName) {
  const preset = colorPresets[presetName];
  if (!preset) return;
  
  // Update color inputs
  document.getElementById('lightSquareColor').value = preset.lightSquare;
  document.getElementById('lightSquareHex').value = preset.lightSquare;
  document.getElementById('darkSquareColor').value = preset.darkSquare;
  document.getElementById('darkSquareHex').value = preset.darkSquare;
  document.getElementById('whitePieceColor').value = preset.whitePiece;
  document.getElementById('whitePieceHex').value = preset.whitePiece;
  document.getElementById('blackPieceColor').value = preset.blackPiece;
  document.getElementById('blackPieceHex').value = preset.blackPiece;
  
  // Apply colors
  document.documentElement.style.setProperty('--board-light', preset.lightSquare);
  document.documentElement.style.setProperty('--board-dark', preset.darkSquare);
  document.documentElement.style.setProperty('--white-piece-color', preset.whitePiece);
  document.documentElement.style.setProperty('--black-piece-color', preset.blackPiece);
  
  const style = document.getElementById('dynamic-piece-colors') || document.createElement('style');
  style.id = 'dynamic-piece-colors';
  style.textContent = `
    .piece.white-piece,
    .chess-piece.white-piece,
    .white-piece {
      color: ${preset.whitePiece} !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
    }
    .piece.black-piece,
    .chess-piece.black-piece,
    .black-piece {
      color: ${preset.blackPiece} !important;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3) !important;
    }
    .white-preview {
      color: ${preset.whitePiece} !important;
    }
    .black-preview {
      color: ${preset.blackPiece} !important;
    }
  `;
  
  if (!document.getElementById('dynamic-piece-colors')) {
    document.head.appendChild(style);
  }
  
  saveColorSettings();
  bildirimGoster(t('presetApplied') || `${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied!`);
}

function resetColors() {
  // Reset to default colors
  const defaultColors = {
    lightSquare: '#9ca3af',
    darkSquare: '#4b5563',
    whitePiece: '#ffffff',
    blackPiece: '#2c2c2c'
  };
  
  // Update inputs
  document.getElementById('lightSquareColor').value = defaultColors.lightSquare;
  document.getElementById('lightSquareHex').value = defaultColors.lightSquare;
  document.getElementById('darkSquareColor').value = defaultColors.darkSquare;
  document.getElementById('darkSquareHex').value = defaultColors.darkSquare;
  document.getElementById('whitePieceColor').value = defaultColors.whitePiece;
  document.getElementById('whitePieceHex').value = defaultColors.whitePiece;
  document.getElementById('blackPieceColor').value = defaultColors.blackPiece;
  document.getElementById('blackPieceHex').value = defaultColors.blackPiece;
  
  // Reset CSS
  document.documentElement.style.setProperty('--board-light', defaultColors.lightSquare);
  document.documentElement.style.setProperty('--board-dark', defaultColors.darkSquare);
  document.documentElement.style.setProperty('--white-piece-color', defaultColors.whitePiece);
  document.documentElement.style.setProperty('--black-piece-color', defaultColors.blackPiece);
  
  // Remove custom piece colors
  const style = document.getElementById('dynamic-piece-colors');
  if (style) {
    style.remove();
  }
  
  // Clear localStorage
  localStorage.removeItem('chessColorSettings');
  
  bildirimGoster(t('colorsReset') || 'Colors reset to default!');
}

function saveColorSettings() {
  const settings = {
    lightSquare: document.getElementById('lightSquareColor').value,
    darkSquare: document.getElementById('darkSquareColor').value,
    whitePiece: document.getElementById('whitePieceColor').value,
    blackPiece: document.getElementById('blackPieceColor').value
  };
  
  localStorage.setItem('chessColorSettings', JSON.stringify(settings));
}

function loadColorSettings() {
  const saved = localStorage.getItem('chessColorSettings');
  if (!saved) return;
  
  try {
    const settings = JSON.parse(saved);
    
    // Update inputs
    document.getElementById('lightSquareColor').value = settings.lightSquare;
    document.getElementById('lightSquareHex').value = settings.lightSquare;
    document.getElementById('darkSquareColor').value = settings.darkSquare;
    document.getElementById('darkSquareHex').value = settings.darkSquare;
    document.getElementById('whitePieceColor').value = settings.whitePiece;
    document.getElementById('whitePieceHex').value = settings.whitePiece;
    document.getElementById('blackPieceColor').value = settings.blackPiece;
    document.getElementById('blackPieceHex').value = settings.blackPiece;
    
    // Apply colors
    document.documentElement.style.setProperty('--board-light', settings.lightSquare);
    document.documentElement.style.setProperty('--board-dark', settings.darkSquare);
    document.documentElement.style.setProperty('--white-piece-color', settings.whitePiece);
    document.documentElement.style.setProperty('--black-piece-color', settings.blackPiece);
    
    const style = document.getElementById('dynamic-piece-colors') || document.createElement('style');
    style.id = 'dynamic-piece-colors';
    style.textContent = `
      .piece.white-piece,
      .chess-piece.white-piece,
      .white-piece {
        color: ${settings.whitePiece} !important;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8) !important;
      }
      .piece.black-piece,
      .chess-piece.black-piece,
      .black-piece {
        color: ${settings.blackPiece} !important;
        text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3) !important;
      }
      .white-preview {
        color: ${settings.whitePiece} !important;
      }
      .black-preview {
        color: ${settings.blackPiece} !important;
      }
    `;
    
    if (!document.getElementById('dynamic-piece-colors')) {
      document.head.appendChild(style);
    }
  } catch (e) {
    console.error('Error loading color settings:', e);
  }
}

// Load saved colors when page loads
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(loadColorSettings, 100);
});

function toggleColorPanel() {
  const panel = document.getElementById('colorPanel');
  if (panel) {
    panel.classList.toggle('hidden');
  }
}



// Duplicate openPieceSetup function removed - using the one at line 791
function togglePanel(which) {
  const panelId = which === "settings" ? "settingsPanel" : "historyPanel";
  const panel = document.getElementById(panelId);
  if (panel) {
    const content = panel.querySelector('.collapsible-content');
    const chevron = panel.querySelector('.chevron');
    
    if (content && chevron) {
      if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.textContent = '▾';
      } else {
        content.style.display = 'none';
        chevron.textContent = '▸';
      }
    }
  }
}

// Make functions available globally
window.initializePieceSetup = initializePieceSetup;

// Enhanced UI Manager instance
let enhancedUI = null;

// Enhanced Drag & Drop System instance
let enhancedDragDrop = null;

// Extended Preset Manager instance
let extendedPresetManager = null;

// Position History Manager instance
let positionHistoryManager = null;

// Position History Interface instance
let positionHistoryInterface = null;

// Mobile Optimization Manager instance
let mobileOptimizationManager = null;

// Responsive Layout Manager instance
let responsiveLayoutManager = null;

// Performance Monitor instance
let performanceMonitor = null;

// Piece Setup System - Variables already declared above

function initializePieceSetup() {
  console.log("♔ Initializing Piece Setup...");
  
  try {
    // Initialize setupBoard array
    if (!window.setupBoard) {
      window.setupBoard = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ];
      console.log("✅ setupBoard initialized");
    }
    
    // Set default position
    setupBoard = [
      ["r", "q", "k", "r"],
      ["p", "p", "p", "p"],
      [null, null, null, null],
      ["P", "P", "P", "P"],
      ["R", "Q", "K", "R"]
    ];
    console.log("✅ Default position set");
    
    // Draw the setup board
    drawSetupBoard();
    console.log("✅ Board drawn");
    
    // Initialize drag and drop
    try {
      initializeSetupDragDrop();
      console.log("✅ Drag & drop initialized");
    } catch (error) {
      console.warn("⚠️ Drag & drop initialization failed:", error);
    }
    
    // Update position stats
    try {
      updatePositionStats();
      console.log("✅ Position stats updated");
    } catch (error) {
      console.warn("⚠️ Position stats update failed:", error);
    }
    
    console.log("✅ Piece Setup initialized successfully");
    
  } catch (error) {
    console.error("❌ Failed to initialize piece setup:", error);
    
    // Fallback: at least try to draw an empty board
    try {
      const boardEl = document.getElementById("setupBoard");
      if (boardEl) {
        boardEl.innerHTML = "<p style='text-align: center; padding: 20px;'>⚠️ Setup failed, but modal is open</p>";
      }
    } catch (fallbackError) {
      console.error("❌ Even fallback failed:", fallbackError);
    }
  }
}

function initializeLegacyPieceSetup() {
  console.log("🔧 Initializing legacy piece setup components...");
  
  // Initialize Enhanced UI Manager
  if (!enhancedUI && typeof EnhancedPieceSetupUI !== 'undefined') {
    try {
      enhancedUI = new EnhancedPieceSetupUI();
      console.log("✅ Enhanced UI Manager initialized");
    } catch (error) {
      console.warn("⚠️ Enhanced UI Manager failed to initialize:", error);
    }
  }
  
  // Initialize Enhanced Drag & Drop System
  if (!enhancedDragDrop && typeof EnhancedDragDropSystem !== 'undefined' && enhancedUI) {
    try {
      enhancedDragDrop = new EnhancedDragDropSystem(enhancedUI);
      console.log("✅ Enhanced Drag & Drop System initialized");
    } catch (error) {
      console.warn("⚠️ Enhanced Drag & Drop System failed to initialize:", error);
    }
  }
  
  // Initialize Extended Preset Manager
  if (!extendedPresetManager && typeof ExtendedPresetManager !== 'undefined') {
    try {
      extendedPresetManager = new ExtendedPresetManager();
      console.log("✨ Extended Preset Manager initialized with", extendedPresetManager.getAllPresets().length, "presets");
    } catch (error) {
      console.warn("⚠️ Extended Preset Manager failed to initialize:", error);
    }
  }
  
  // Initialize Advanced Position Analyzer
  if (!advancedPositionAnalyzer && typeof AdvancedPositionAnalyzer !== 'undefined') {
    try {
      advancedPositionAnalyzer = new AdvancedPositionAnalyzer();
      console.log("🧠 Advanced Position Analyzer initialized");
    } catch (error) {
      console.warn("⚠️ Advanced Position Analyzer failed to initialize:", error);
    }
  }
  
  // Initialize Position Evaluation Report System
  if (!positionEvaluationReport && typeof PositionEvaluationReport !== 'undefined') {
    try {
      positionEvaluationReport = new PositionEvaluationReport();
      window.positionEvaluationReport = positionEvaluationReport;
      console.log("📊 Position Evaluation Report System initialized");
    } catch (error) {
      console.warn("⚠️ Position Evaluation Report System failed to initialize:", error);
    }
  }
  
  // Initialize Position Sharing System
  if (!positionSharingSystem && typeof PositionSharingSystem !== 'undefined') {
    try {
      positionSharingSystem = new PositionSharingSystem();
      console.log("🔗 Position Sharing System initialized");
    } catch (error) {
      console.warn("⚠️ Position Sharing System failed to initialize:", error);
    }
  }
  
  // Initialize Position History Manager
  if (!positionHistoryManager && typeof PositionHistoryManager !== 'undefined') {
    try {
      positionHistoryManager = new PositionHistoryManager();
      console.log("🕰️ Position History Manager initialized");
    } catch (error) {
      console.warn("⚠️ Position History Manager failed to initialize:", error);
    }
  }
  
  // Initialize Position History Interface
  if (!positionHistoryInterface && typeof PositionHistoryInterface !== 'undefined' && positionHistoryManager) {
    try {
      positionHistoryInterface = new PositionHistoryInterface(positionHistoryManager);
      console.log("📋 Position History Interface initialized");
    } catch (error) {
      console.warn("⚠️ Position History Interface failed to initialize:", error);
    }
  }
  
  // Initialize Mobile Optimization Manager
  if (!mobileOptimizationManager && typeof MobileOptimizationManager !== 'undefined') {
    try {
      mobileOptimizationManager = new MobileOptimizationManager(enhancedUI, enhancedDragDrop);
      console.log("📱 Mobile Optimization Manager initialized");
    } catch (error) {
      console.warn("⚠️ Mobile Optimization Manager failed to initialize:", error);
    }
  }
  
  // Initialize Responsive Layout Manager
  if (!responsiveLayoutManager && typeof ResponsiveLayoutManager !== 'undefined') {
    try {
      responsiveLayoutManager = new ResponsiveLayoutManager(enhancedUI, mobileOptimizationManager);
      console.log("📱 Responsive Layout Manager initialized");
      
      // Update mobile optimization manager with responsive layout reference
      if (mobileOptimizationManager) {
        mobileOptimizationManager.responsiveLayout = responsiveLayoutManager;
      }
    } catch (error) {
      console.warn("⚠️ Responsive Layout Manager failed to initialize:", error);
    }
  }
  
  // Initialize Performance Monitor
  if (!performanceMonitor && typeof PerformanceMonitor !== 'undefined') {
    try {
      performanceMonitor = new PerformanceMonitor();
      console.log("⚡ Performance Monitor initialized");
    } catch (error) {
      console.warn("⚠️ Performance Monitor failed to initialize:", error);
    }
  }
  
  // Initialize preset management UI
  try {
    initializePresetManagement();
  } catch (error) {
    console.warn("⚠️ Preset management UI failed to initialize:", error);
  }
  
  // Initialize empty setup board
  setupBoard = [];
  for (let i = 0; i < 5; i++) {
    setupBoard[i] = [];
    for (let j = 0; j < 4; j++) {
      setupBoard[i][j] = null;
    }
  }
  
  // Copy current board state
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      setupBoard[i][j] = tahta[i][j];
    }
  }
  
  drawSetupBoard();
  
  // Use enhanced drag & drop system if available, fallback to basic system
  if (enhancedDragDrop) {
    try {
      enhancedDragDrop.reinitialize();
    } catch (error) {
      console.warn("⚠️ Enhanced drag & drop reinitialize failed:", error);
      initializeSetupDragDrop();
    }
  } else {
    initializeSetupDragDrop();
  }
  
  console.log("✨ Piece setup initialized successfully");
}

// Performance monitoring wrapper functions
function monitoredAnalyzePosition(position) {
  if (performanceMonitor && advancedPositionAnalyzer) {
    return performanceMonitor.measureAnalysisOperation(
      () => advancedPositionAnalyzer.analyzePosition(position),
      { positionSize: position.length * position[0].length }
    );
  } else if (advancedPositionAnalyzer) {
    return Promise.resolve({ result: advancedPositionAnalyzer.analyzePosition(position), measurement: null });
  }
  return Promise.resolve({ result: null, measurement: null });
}

function monitoredLoadPreset(presetId) {
  if (performanceMonitor && extendedPresetManager) {
    return performanceMonitor.measurePresetLoading(
      () => {
        const preset = extendedPresetManager.getPresetById(presetId);
        if (preset) {
          // Simulate loading the preset onto the board
          for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
              setupBoard[i][j] = preset.position[i][j];
            }
          }
          drawSetupBoard();
          
          // Reinitialize drag & drop
          if (enhancedDragDrop) {
            enhancedDragDrop.reinitialize();
          }
        }
        return preset;
      },
      { presetId, presetName: extendedPresetManager.getPresetById(presetId)?.name }
    );
  } else if (extendedPresetManager) {
    const preset = extendedPresetManager.getPresetById(presetId);
    if (preset) {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
          setupBoard[i][j] = preset.position[i][j];
        }
      }
      drawSetupBoard();
      if (enhancedDragDrop) {
        enhancedDragDrop.reinitialize();
      }
    }
    return Promise.resolve({ result: preset, measurement: null });
  }
  return Promise.resolve({ result: null, measurement: null });
}

function monitoredDragOperation(operation, metadata = {}) {
  if (performanceMonitor) {
    return performanceMonitor.measureDragOperation(operation, metadata);
  } else {
    return Promise.resolve({ result: operation(), measurement: null });
  }
}

// Enhanced preset loading with performance monitoring
function loadPresetWithMonitoring(presetId) {
  console.log(`🎯 Loading preset: ${presetId}`);
  
  monitoredLoadPreset(presetId).then(({ result, measurement }) => {
    if (result) {
      console.log(`✅ Preset loaded: ${result.name}`);
      
      // Show performance feedback if measurement available
      if (measurement) {
        const duration = measurement.duration.toFixed(2);
        const target = performanceMonitor.targets.presetLoading;
        
        if (measurement.withinTarget) {
          console.log(`⚡ Preset loaded in ${duration}ms (target: ${target}ms) ✅`);
        } else {
          console.warn(`🐌 Preset loading took ${duration}ms (target: ${target}ms) ❌`);
        }
      }
      
      // Trigger analysis if available
      if (advancedPositionAnalyzer) {
        monitoredAnalyzePosition(setupBoard).then(({ result: analysis, measurement: analysisMeasurement }) => {
          if (analysis && !analysis.error) {
            console.log('📊 Position analysis completed:', analysis.positionType);
            
            if (analysisMeasurement) {
              const duration = analysisMeasurement.duration.toFixed(2);
              const target = performanceMonitor.targets.analysisOperation;
              
              if (analysisMeasurement.withinTarget) {
                console.log(`⚡ Analysis completed in ${duration}ms (target: ${target}ms) ✅`);
              } else {
                console.warn(`🐌 Analysis took ${duration}ms (target: ${target}ms) ❌`);
              }
            }
          }
        });
      }
    } else {
      console.error(`❌ Failed to load preset: ${presetId}`);
    }
  }).catch(error => {
    console.error(`❌ Error loading preset: ${error.message}`);
  });
}

// Performance monitoring utilities
function getPerformanceReport() {
  if (performanceMonitor) {
    return performanceMonitor.generateReport();
  }
  return null;
}

function logPerformanceReport() {
  if (performanceMonitor) {
    return performanceMonitor.logReport();
  }
  console.log('⚠️ Performance monitor not available');
}

function clearPerformanceData() {
  if (performanceMonitor) {
    performanceMonitor.clearData();
    console.log('🧹 Performance data cleared');
  }
}

// Make performance monitoring functions available globally
window.monitoredAnalyzePosition = monitoredAnalyzePosition;
window.monitoredLoadPreset = monitoredLoadPreset;
window.monitoredDragOperation = monitoredDragOperation;
window.loadPresetWithMonitoring = loadPresetWithMonitoring;
window.getPerformanceReport = getPerformanceReport;
window.logPerformanceReport = logPerformanceReport;
window.clearPerformanceData = clearPerformanceData;

function drawSetupBoard() {
  console.log("🎨 Drawing setup board...");
  
  const boardEl = document.getElementById("setupBoard");
  if (!boardEl) {
    console.error("❌ Setup board element not found!");
    return;
  }
  
  // Ensure setupBoard exists
  if (!window.setupBoard) {
    console.warn("⚠️ setupBoard not found, creating empty board");
    window.setupBoard = Array(5).fill().map(() => Array(4).fill(null));
  }
  
  // Clear existing content
  boardEl.innerHTML = "";
  console.log("✅ Board cleared");
  
  // Create squares
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const square = document.createElement("div");
      square.className = "setup-square";
      square.className += (row + col) % 2 === 0 ? " light" : " dark";
      square.dataset.row = row;
      square.dataset.col = col;
      
      const piece = setupBoard[row][col];
      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = "setup-piece";
        
        // Add color class - safe check
        try {
          if (typeof beyazMi === 'function' && beyazMi(piece)) {
            pieceEl.classList.add("white-piece");
          } else {
            pieceEl.classList.add("black-piece");
          }
        } catch (error) {
          // Fallback color detection
          if (piece === piece.toUpperCase()) {
            pieceEl.classList.add("white-piece");
          } else {
            pieceEl.classList.add("black-piece");
          }
        }
        
        // Set piece symbol - safe check
        if (typeof TASLAR !== 'undefined' && TASLAR[piece]) {
          pieceEl.textContent = TASLAR[piece];
        } else {
          pieceEl.textContent = piece; // Fallback to piece letter
        }
        
        pieceEl.draggable = true;
        pieceEl.dataset.piece = piece;
        square.appendChild(pieceEl);
      }
      
      boardEl.appendChild(square);
    }
  }
  
  console.log(`✅ Board drawn with ${boardEl.children.length} squares`);
}

function reinitializeDragDrop() {
  // Use enhanced drag & drop system if available, fallback to basic system
  if (enhancedDragDrop) {
    enhancedDragDrop.reinitialize();
  } else {
    initializeSetupDragDrop();
  }
}

function initializeSetupDragDrop() {
  console.log("Initializing drag and drop...");
  
  // Palette pieces drag start
  document.querySelectorAll('.palette-piece').forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.dataset.piece);
      e.dataTransfer.effectAllowed = 'copy';
      console.log("Dragging piece:", e.target.dataset.piece);
    });
    
    piece.addEventListener('click', (e) => {
      // Remove previous selection
      document.querySelectorAll('.palette-piece').forEach(p => p.classList.remove('selected'));
      // Select this piece
      e.target.classList.add('selected');
      selectedPalettePiece = e.target.dataset.piece;
      console.log("Selected piece:", selectedPalettePiece);
    });
  });
  
  // Setup board squares
  document.querySelectorAll('.setup-square').forEach(square => {
    square.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      square.classList.add('drop-target');
    });
    
    square.addEventListener('dragleave', (e) => {
      square.classList.remove('drop-target');
    });
    
    square.addEventListener('drop', (e) => {
      e.preventDefault();
      square.classList.remove('drop-target');
      
      const pieceType = e.dataTransfer.getData('text/plain');
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      
      console.log("Dropped piece:", pieceType, "at", row, col);
      
      // Place piece on setup board
      setupBoard[row][col] = pieceType;
      drawSetupBoard();
      reinitializeDragDrop(); // Reinitialize after redraw
    });
    
    square.addEventListener('click', (e) => {
      if (selectedPalettePiece) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        console.log("Placing selected piece:", selectedPalettePiece, "at", row, col);
        setupBoard[row][col] = selectedPalettePiece;
        drawSetupBoard();
        reinitializeDragDrop();
      }
    });
  });
  
  // Board pieces drag start
  document.querySelectorAll('.setup-piece').forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.dataset.piece);
      e.dataTransfer.effectAllowed = 'move';
      
      // Remove piece from current position
      const square = e.target.parentElement;
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      setupBoard[row][col] = null;
      console.log("Moving piece from:", row, col);
    });
  });
  
  // Trash zone
  const trashZone = document.getElementById('trashZone');
  if (trashZone) {
    trashZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      trashZone.classList.add('drag-over');
    });
    
    trashZone.addEventListener('dragleave', (e) => {
      trashZone.classList.remove('drag-over');
    });
    
    trashZone.addEventListener('drop', (e) => {
      e.preventDefault();
      trashZone.classList.remove('drag-over');
      console.log("Piece deleted");
      // Piece is already removed in dragstart
      drawSetupBoard();
      reinitializeDragDrop();
    });
  }
  
  console.log("Drag and drop initialized");
}

function clearSetupBoard() {
  console.log("Clearing setup board");
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      setupBoard[i][j] = null;
    }
  }
  drawSetupBoard();
  reinitializeDragDrop();
  
  // Use enhanced notification if available
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(t('boardCleared') || 'Board cleared!', 'success');
  } else {
    bildirimGoster(t('boardCleared') || 'Board cleared!');
  }
  
  // Add to history
  addPositionToHistory('Empty Board', 'All pieces cleared from the board');
}

function resetToDefaultPosition() {
  console.log("Resetting to default position");
  setupBoard = [
    ["r", "q", "k", "r"],
    ["p", "p", "p", "p"],
    [null, null, null, null],
    ["P", "P", "P", "P"],
    ["R", "Q", "K", "R"],
  ];
  drawSetupBoard();
  reinitializeDragDrop();
  
  // Use enhanced notification if available
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(t('defaultSetup') || 'Default position restored!', 'info');
  } else {
    bildirimGoster(t('defaultSetup') || 'Default position restored!');
  }
  
  // Add to history
  addPositionToHistory('Default Position', 'Standard 4x5 chess starting position');
}

/**
 * Update setup board from position (used by history interface)
 */
function updateSetupBoardFromPosition(position) {
  if (!position || !Array.isArray(position)) {
    console.error('Invalid position provided to updateSetupBoardFromPosition');
    return;
  }
  
  // Update setup board
  setupBoard = position.map(row => [...row]);
  
  // Redraw board
  drawSetupBoard();
  reinitializeDragDrop();
  
  console.log('📋 Setup board updated from history position');
}

/**
 * Add current position to history
 */
function addPositionToHistory(name = '', description = '') {
  if (!positionHistoryManager) return;
  
  // Create deep copy of current position
  const position = setupBoard.map(row => [...row]);
  
  // Generate automatic name if not provided
  if (!name) {
    const stats = positionHistoryManager.getHistoryStatistics();
    name = `Position ${stats.size + 1}`;
  }
  
  // Create metadata
  const metadata = {
    name: name,
    description: description,
    timestamp: Date.now(),
    tags: ['setup']
  };
  
  // Add to history
  const success = positionHistoryManager.addPosition(position, metadata);
  
  if (success) {
    console.log('📝 Position added to history:', name);
  }
  
  return success;
}

/**
 * Get current setup board position
 */
function getCurrentSetupPosition() {
  return setupBoard.map(row => [...row]);
}

function startCustomGame() {
  console.log("Starting custom game...");
  
  // Use enhanced validation if available
  let validationPassed = false;
  let validationMessage = '';
  
  if (positionValidationUI) {
    const validation = positionValidationUI.getCurrentValidation();
    if (validation) {
      validationPassed = validation.valid;
      const summary = positionValidationUI.getValidationSummary();
      validationMessage = summary.message;
      
      // Log detailed validation info
      console.log("🔍 Enhanced validation result:", {
        valid: validation.valid,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
        checkStatus: validation.checkStatus
      });
    } else {
      // Trigger validation if not done yet
      const validation = positionValidationUI.validateAndUpdateUI(setupBoard);
      validationPassed = validation ? validation.valid : false;
    }
  } else {
    // Fallback to basic validation (must have both kings)
    let whiteKing = false, blackKing = false;
    
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 4; j++) {
        if (setupBoard[i][j] === 'K') whiteKing = true;
        if (setupBoard[i][j] === 'k') blackKing = true;
      }
    }
    
    validationPassed = whiteKing && blackKing;
    validationMessage = validationPassed ? 'Position is valid' : 'Both kings are required!';
  }
  
  if (!validationPassed) {
    // Use enhanced notification if available
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(validationMessage, 'error');
    } else {
      bildirimGoster(validationMessage);
    }
    console.log("Validation failed:", validationMessage);
    return;
  }
  
  console.log("Validation passed, applying setup to main game");
  
  // Apply setup to main game
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      tahta[i][j] = setupBoard[i][j];
    }
  }
  
  // Set first move
  const firstMove = document.getElementById('firstMoveSelect').value;
  beyazSirasi = firstMove === 'white';
  console.log("First move:", firstMove);
  
  // Reset game state
  seciliKare = null;
  gecerliHamleler = [];
  oyunBitti = false;
  hamleGecmisi = [];
  yakalananlar = { beyaz: [], siyah: [] };
  hamleNumarasi = 0;
  oyunSuresi = 0;
  sonHamle = null;
  aiCalisiyor = false;
  
  // Start timer
  clearInterval(zamanSayaci);
  zamanSayaci = setInterval(() => {
    oyunSuresi++;
    const dk = Math.floor(oyunSuresi / 60)
      .toString()
      .padStart(2, "0");
    const sn = (oyunSuresi % 60).toString().padStart(2, "0");
    document.getElementById("timer").textContent = `⏱️ ${dk}:${sn}`;
  }, 1000);
  
  // Update UI
  tahtayiCiz();
  bilgiGuncelle();
  gecmisiGuncelle();
  yakananGuncelle();
  istatistikGuncelle();
  
  // Close modal
  closePieceSetup();
  
  console.log("Custom game started successfully");
  
  // If AI should move first
  if ((bilgisayarRengi === "beyaz" && beyazSirasi) || (bilgisayarRengi === "siyah" && !beyazSirasi)) {
    console.log("AI will move first");
    setTimeout(bilgisayarOyna, 500);
  }
  
  // Use enhanced notification if available
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(t('customGameStarted') || 'Custom game started!', 'success');
  } else {
    bildirimGoster(t('customGameStarted') || 'Custom game started!');
  }
}

// Duplicate closePieceSetup function removed - using the one at line 834

// Advanced Position Analyzer instance
let advancedPositionAnalyzer = null;

// Position Evaluation Report System instance
let positionEvaluationReport = null;

// Position Sharing System instance
let positionSharingSystem = null;

// Enhanced Piece Setup Functions
function randomSetup() {
  console.log("Creating random setup");
  
  // Clear board first
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      setupBoard[i][j] = null;
    }
  }
  
  // Place kings first (required)
  const whiteKingPos = { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 4) };
  let blackKingPos;
  do {
    blackKingPos = { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 4) };
  } while (blackKingPos.row === whiteKingPos.row && blackKingPos.col === whiteKingPos.col);
  
  setupBoard[whiteKingPos.row][whiteKingPos.col] = 'K';
  setupBoard[blackKingPos.row][blackKingPos.col] = 'k';
  
  // Add some random pieces
  const pieces = ['Q', 'R', 'B', 'N', 'P', 'q', 'r', 'b', 'n', 'p'];
  const numPieces = Math.floor(Math.random() * 8) + 4; // 4-12 additional pieces
  
  for (let i = 0; i < numPieces; i++) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 5);
      col = Math.floor(Math.random() * 4);
    } while (setupBoard[row][col] !== null);
    
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    setupBoard[row][col] = piece;
  }
  
  drawSetupBoard();
  reinitializeDragDrop();
  updatePositionStats();
  
  // Use enhanced notification if available
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(t('randomSetupCreated') || 'Random setup created!', 'info');
  } else {
    bildirimGoster(t('randomSetupCreated') || 'Random setup created!');
  }
}

function saveSetup() {
  const setupName = prompt(t('enterSetupName') || 'Enter setup name:', 'Custom Setup ' + Date.now());
  if (!setupName) return;
  
  const savedSetups = JSON.parse(localStorage.getItem('chessSetups') || '{}');
  savedSetups[setupName] = {
    board: setupBoard.map(row => [...row]),
    timestamp: Date.now()
  };
  
  localStorage.setItem('chessSetups', JSON.stringify(savedSetups));
  bildirimGoster(t('setupSaved') || `Setup "${setupName}" saved!`);
}

function loadSetup() {
  const savedSetups = JSON.parse(localStorage.getItem('chessSetups') || '{}');
  const setupNames = Object.keys(savedSetups);
  
  if (setupNames.length === 0) {
    bildirimGoster(t('noSavedSetups') || 'No saved setups found!');
    return;
  }
  
  const setupList = setupNames.map((name, index) => `${index + 1}. ${name}`).join('\n');
  const choice = prompt(t('selectSetup') || 'Select setup:\n' + setupList, '1');
  
  if (!choice) return;
  
  const index = parseInt(choice) - 1;
  if (index >= 0 && index < setupNames.length) {
    const setupName = setupNames[index];
    const setup = savedSetups[setupName];
    
    setupBoard = setup.board.map(row => [...row]);
    drawSetupBoard();
    reinitializeDragDrop();
    updatePositionStats();
    bildirimGoster(t('setupLoaded') || `Setup "${setupName}" loaded!`);
  }
}

function loadPreset(presetType) {
  console.log("Loading preset:", presetType);
  
  // Use performance monitoring if available
  if (performanceMonitor) {
    loadPresetWithMonitoring(presetType);
    return;
  }
  
  // Use Extended Preset Manager if available
  if (extendedPresetManager) {
    // Try to find preset by ID first (for new system)
    let preset = extendedPresetManager.getPresetById(presetType);
    
    // If not found by ID, try to find by category (backward compatibility)
    if (!preset) {
      const presets = extendedPresetManager.getPresetsByCategory(presetType);
      if (presets.length > 0) {
        preset = presets[0]; // Use first preset in category
      }
    }
    
    if (preset) {
      setupBoard = preset.position.map(row => [...row]);
      drawSetupBoard();
      reinitializeDragDrop();
      updatePositionStats();
      
      // Enhanced notification with preset info
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          `${preset.name} loaded! ${preset.description}`, 
          'success'
        );
      } else {
        bildirimGoster(t('presetLoaded') || `${preset.name} loaded!`);
      }
      return;
    }
  }
  
  // Fallback to legacy preset system
  let preset;
  switch (presetType) {
    case 'endgame':
      preset = [
        [null, null, "k", null],
        [null, null, null, null],
        [null, null, null, null],
        ["P", null, null, null],
        ["R", null, "K", null]
      ];
      break;
    case 'middlegame':
      preset = [
        ["r", null, "k", "r"],
        ["p", "p", null, "p"],
        [null, null, "N", null],
        ["P", "P", null, "P"],
        ["R", "Q", "K", null]
      ];
      break;
    case 'puzzle':
      preset = [
        [null, null, "k", null],
        [null, "p", null, null],
        [null, null, "Q", null],
        [null, null, null, null],
        [null, null, "K", null]
      ];
      break;
    default:
      return;
  }
  
  setupBoard = preset.map(row => [...row]);
  drawSetupBoard();
  reinitializeDragDrop();
  updatePositionStats();
  
  // Use enhanced notification if available
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(t('presetLoaded') || `${presetType} preset loaded!`, 'success');
  } else {
    bildirimGoster(t('presetLoaded') || `${presetType} preset loaded!`);
  }
}

// Extended Preset Manager Functions

/**
 * Load preset by ID from Extended Preset Manager
 * @param {string} presetId - Preset identifier
 */
function loadExtendedPreset(presetId) {
  if (!extendedPresetManager) {
    console.error("Extended Preset Manager not initialized");
    return;
  }
  
  const preset = extendedPresetManager.getPresetById(presetId);
  if (!preset) {
    console.error("Preset not found:", presetId);
    return;
  }
  
  console.log("Loading extended preset:", preset.name);
  
  // Validate preset position
  const validation = extendedPresetManager.validatePresetPosition(preset.position);
  if (!validation.valid) {
    console.error("Invalid preset position:", validation.errors);
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Invalid preset: ${validation.errors.join(', ')}`, 
        'error'
      );
    }
    return;
  }
  
  // Load the preset
  setupBoard = preset.position.map(row => [...row]);
  drawSetupBoard();
  reinitializeDragDrop();
  updatePositionStats();
  
  // Show enhanced notification with preset details
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(
      `${preset.name} loaded! ${preset.description}`, 
      'success'
    );
  } else {
    bildirimGoster(`${preset.name} loaded!`);
  }
  
  // Trigger analysis if available
  if (typeof analyzePosition === 'function') {
    analyzePosition();
  }
}

/**
 * Get presets by category for UI display
 * @param {string} category - Category name
 * @returns {Array} Array of presets
 */
function getPresetsByCategory(category) {
  if (!extendedPresetManager) {
    return [];
  }
  return extendedPresetManager.getPresetsByCategory(category);
}

/**
 * Get all preset categories
 * @returns {Array} Array of category names
 */
function getPresetCategories() {
  if (!extendedPresetManager) {
    return ['opening', 'middlegame', 'endgame', 'puzzle', 'tactical'];
  }
  return extendedPresetManager.getCategories();
}

/**
 * Create custom preset from current board position
 * @param {string} name - Preset name
 * @param {string} description - Preset description
 * @param {string} category - Preset category
 */
function createCustomPreset(name, description, category = 'custom') {
  if (!extendedPresetManager) {
    console.error("Extended Preset Manager not initialized");
    return;
  }
  
  if (!name || name.trim() === '') {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Please enter a preset name', 'error');
    }
    return;
  }
  
  // Validate current position
  const validation = extendedPresetManager.validatePresetPosition(setupBoard);
  if (!validation.valid) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Cannot save invalid position: ${validation.errors.join(', ')}`, 
        'error'
      );
    }
    return;
  }
  
  // Create the preset
  const preset = extendedPresetManager.createCustomPreset(
    name.trim(),
    description || 'Custom position',
    setupBoard,
    category,
    ['custom', 'user-created']
  );
  
  console.log("Created custom preset:", preset.name);
  
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(
      `Custom preset "${preset.name}" saved successfully!`, 
      'success'
    );
  } else {
    bildirimGoster(`Custom preset "${preset.name}" saved!`);
  }
}

/**
 * Search presets by query
 * @param {string} query - Search query
 * @returns {Array} Array of matching presets
 */
function searchPresets(query) {
  if (!extendedPresetManager || !query) {
    return [];
  }
  return extendedPresetManager.searchPresets(query);
}

/**
 * Get preset statistics for display
 * @returns {Object} Preset statistics
 */
function getPresetStatistics() {
  if (!extendedPresetManager) {
    return { total: 0, byCategory: {}, byDifficulty: {}, custom: 0 };
  }
  return extendedPresetManager.getPresetStatistics();
}

/**
 * Export presets to JSON
 * @param {boolean} includeCustom - Include custom presets
 * @returns {string} JSON string
 */
function exportPresets(includeCustom = true) {
  if (!extendedPresetManager) {
    return '{}';
  }
  return extendedPresetManager.exportPresets(includeCustom);
}

/**
 * Import presets from JSON
 * @param {string} jsonData - JSON string of presets
 * @returns {Object} Import result
 */
function importPresets(jsonData) {
  if (!extendedPresetManager) {
    return { success: false, message: 'Preset manager not available' };
  }
  return extendedPresetManager.importPresets(jsonData);
}

// User Preset Management Functions

/**
 * Initialize preset management UI
 */
function initializePresetManagement() {
  if (!extendedPresetManager) {
    console.warn("Extended Preset Manager not available");
    return;
  }
  
  // Populate preset lists
  updatePresetList();
  
  // Add event listeners
  const categorySelect = document.getElementById('presetCategorySelect');
  const presetSelect = document.getElementById('presetSelect');
  
  if (categorySelect) {
    categorySelect.addEventListener('change', updatePresetList);
  }
  
  if (presetSelect) {
    presetSelect.addEventListener('change', previewSelectedPreset);
  }
}

/**
 * Update the preset list based on selected category
 */
function updatePresetList() {
  if (!extendedPresetManager) return;
  
  const categorySelect = document.getElementById('presetCategorySelect');
  const presetSelect = document.getElementById('presetSelect');
  
  if (!categorySelect || !presetSelect) return;
  
  const selectedCategory = categorySelect.value;
  presetSelect.innerHTML = '<option value="">Select a preset...</option>';
  
  let presets;
  if (selectedCategory) {
    presets = extendedPresetManager.getPresetsByCategory(selectedCategory);
  } else {
    presets = extendedPresetManager.getAllPresets();
  }
  
  // Sort presets by name
  presets.sort((a, b) => a.name.localeCompare(b.name));
  
  presets.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = `${preset.name} (${preset.category})`;
    if (preset.custom) {
      option.textContent += ' ⭐';
    }
    presetSelect.appendChild(option);
  });
}

/**
 * Preview selected preset (show description)
 */
function previewSelectedPreset() {
  if (!extendedPresetManager) return;
  
  const presetSelect = document.getElementById('presetSelect');
  if (!presetSelect) return;
  
  const presetId = presetSelect.value;
  if (!presetId) return;
  
  const preset = extendedPresetManager.getPresetById(presetId);
  if (!preset) return;
  
  // Show enhanced notification with preset info
  if (enhancedUI) {
    enhancedUI.showEnhancedNotification(
      `${preset.name}: ${preset.description}`,
      'info',
      3000
    );
  } else {
    bildirimGoster(`${preset.name}: ${preset.description}`);
  }
}

/**
 * Load the selected preset
 */
function loadSelectedPreset() {
  if (!extendedPresetManager) return;
  
  const presetSelect = document.getElementById('presetSelect');
  if (!presetSelect) return;
  
  const presetId = presetSelect.value;
  if (!presetId) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Please select a preset first', 'warning');
    } else {
      bildirimGoster('Please select a preset first');
    }
    return;
  }
  
  // Use existing loadPreset function with preset ID
  loadPreset(presetId);
}

/**
 * Save current position as a custom preset
 */
function saveCurrentAsPreset() {
  if (!extendedPresetManager) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Preset manager not available', 'error');
    } else {
      bildirimGoster('Preset manager not available');
    }
    return;
  }
  
  const nameInput = document.getElementById('customPresetName');
  const descriptionInput = document.getElementById('customPresetDescription');
  const categorySelect = document.getElementById('customPresetCategory');
  
  if (!nameInput || !descriptionInput || !categorySelect) {
    console.error("Preset creation inputs not found");
    return;
  }
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categorySelect.value;
  
  if (!name) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Please enter a preset name', 'warning');
    } else {
      bildirimGoster('Please enter a preset name');
    }
    nameInput.focus();
    return;
  }
  
  // Validate current position
  const validation = extendedPresetManager.validatePresetPosition(setupBoard);
  if (!validation.valid) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Invalid position: ${validation.errors.join(', ')}`,
        'error'
      );
    } else {
      bildirimGoster(`Invalid position: ${validation.errors.join(', ')}`);
    }
    return;
  }
  
  try {
    const preset = extendedPresetManager.createCustomPreset(
      name,
      description || 'Custom position',
      setupBoard,
      category,
      ['custom', 'user-created']
    );
    
    // Clear inputs
    nameInput.value = '';
    descriptionInput.value = '';
    categorySelect.value = 'custom';
    
    // Update preset list
    updatePresetList();
    
    // Select the newly created preset
    const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
      presetSelect.value = preset.id;
    }
    
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Preset "${preset.name}" saved successfully!`,
        'success'
      );
    } else {
      bildirimGoster(`Preset "${preset.name}" saved successfully!`);
    }
    
  } catch (error) {
    console.error('Failed to save preset:', error);
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Failed to save preset: ${error.message}`,
        'error'
      );
    } else {
      bildirimGoster(`Failed to save preset: ${error.message}`);
    }
  }
}

/**
 * Delete the selected custom preset
 */
function deleteSelectedPreset() {
  if (!extendedPresetManager) return;
  
  const presetSelect = document.getElementById('presetSelect');
  if (!presetSelect) return;
  
  const presetId = presetSelect.value;
  if (!presetId) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Please select a preset to delete', 'warning');
    } else {
      bildirimGoster('Please select a preset to delete');
    }
    return;
  }
  
  const preset = extendedPresetManager.getPresetById(presetId);
  if (!preset) return;
  
  // Only allow deletion of custom presets
  if (!preset.custom) {
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Cannot delete built-in presets', 'warning');
    } else {
      bildirimGoster('Cannot delete built-in presets');
    }
    return;
  }
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
    return;
  }
  
  try {
    const deleted = extendedPresetManager.deleteCustomPreset(presetId);
    if (deleted) {
      // Update preset list
      updatePresetList();
      
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          `Preset "${preset.name}" deleted successfully`,
          'success'
        );
      } else {
        bildirimGoster(`Preset "${preset.name}" deleted successfully`);
      }
    } else {
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification('Failed to delete preset', 'error');
      } else {
        bildirimGoster('Failed to delete preset');
      }
    }
  } catch (error) {
    console.error('Failed to delete preset:', error);
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Failed to delete preset: ${error.message}`,
        'error'
      );
    } else {
      bildirimGoster(`Failed to delete preset: ${error.message}`);
    }
  }
}

/**
 * Export user presets to JSON file
 */
function exportUserPresets() {
  if (!extendedPresetManager) return;
  
  try {
    const jsonData = extendedPresetManager.exportPresets(true);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess-presets-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification('Presets exported successfully!', 'success');
    } else {
      bildirimGoster('Presets exported successfully!');
    }
    
  } catch (error) {
    console.error('Failed to export presets:', error);
    if (enhancedUI) {
      enhancedUI.showEnhancedNotification(
        `Failed to export presets: ${error.message}`,
        'error'
      );
    } else {
      bildirimGoster(`Failed to export presets: ${error.message}`);
    }
  }
}

/**
 * Import user presets from JSON file
 */
function importUserPresets() {
  const fileInput = document.getElementById('presetImportFile');
  if (fileInput) {
    fileInput.click();
  }
}

/**
 * Handle preset import file selection
 */
function handlePresetImport(event) {
  if (!extendedPresetManager) return;
  
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const result = extendedPresetManager.importPresets(e.target.result);
      
      if (result.success) {
        // Update preset list
        updatePresetList();
        
        if (enhancedUI) {
          enhancedUI.showEnhancedNotification(result.message, 'success');
        } else {
          bildirimGoster(result.message);
        }
      } else {
        if (enhancedUI) {
          enhancedUI.showEnhancedNotification(result.message, 'error');
        } else {
          bildirimGoster(result.message);
        }
      }
    } catch (error) {
      console.error('Failed to import presets:', error);
      if (enhancedUI) {
        enhancedUI.showEnhancedNotification(
          `Failed to import presets: ${error.message}`,
          'error'
        );
      } else {
        bildirimGoster(`Failed to import presets: ${error.message}`);
      }
    }
  };
  
  reader.readAsText(file);
  
  // Clear the file input
  event.target.value = '';
}

// Enhanced Position Validation UI instance
let positionValidationUI = null;

function updatePositionStats() {
  let whiteKings = 0, blackKings = 0, totalPieces = 0;
  let materialBalance = 0;
  
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      const piece = setupBoard[i][j];
      if (piece) {
        totalPieces++;
        const pieceType = piece.toLowerCase();
        const isWhite = piece === piece.toUpperCase();
        
        if (pieceType === 'k') {
          if (isWhite) whiteKings++;
          else blackKings++;
        }
        
        const value = pieceValues[pieceType] || 0;
        materialBalance += isWhite ? value : -value;
      }
    }
  }
  
  // Update basic UI
  const whiteKingsEl = document.getElementById('whiteKingsCount');
  const blackKingsEl = document.getElementById('blackKingsCount');
  const totalPiecesEl = document.getElementById('totalPiecesCount');
  const materialBalanceEl = document.getElementById('materialBalance');
  
  if (whiteKingsEl) whiteKingsEl.textContent = whiteKings;
  if (blackKingsEl) blackKingsEl.textContent = blackKings;
  if (totalPiecesEl) totalPiecesEl.textContent = totalPieces;
  if (materialBalanceEl) materialBalanceEl.textContent = materialBalance > 0 ? `+${materialBalance}` : materialBalance;
  
  // Initialize Enhanced Position Validation UI if not already done
  if (!positionValidationUI && typeof PositionValidationUI !== 'undefined') {
    positionValidationUI = new PositionValidationUI();
    console.log("🔍 Enhanced Position Validation UI initialized");
  }
  
  // Use enhanced validation system
  if (positionValidationUI) {
    const validation = positionValidationUI.validateAndUpdateUI(setupBoard, {
      onValidation: (result) => {
        console.log("🔍 Position validation result:", result);
        
        // Update legacy status indicator for backward compatibility
        updateLegacyStatusIndicator(result);
        
        // Update start game button state
        updateStartGameButton(result);
      }
    });
  } else {
    // Fallback to basic validation
    updateBasicValidationStatus(whiteKings, blackKings);
  }
  
  // Update advanced analysis if available
  if (advancedPositionAnalyzer && whiteKings === 1 && blackKings === 1) {
    // Use performance monitoring for analysis if available
    if (performanceMonitor) {
      monitoredAnalyzePosition(setupBoard).then(({ result: analysis, measurement }) => {
        if (analysis && !analysis.error) {
          updateAdvancedStats(analysis);
          
          // Log performance info for stats update
          if (measurement) {
            const duration = measurement.duration.toFixed(2);
            console.log(`📊 Position stats analysis: ${duration}ms`);
          }
        }
      }).catch(error => {
        console.error('Monitored stats analysis failed:', error);
      });
    } else {
      try {
        const analysis = advancedPositionAnalyzer.analyzePosition(setupBoard);
        updateAdvancedStats(analysis);
      } catch (error) {
        console.error('Advanced analysis failed:', error);
      }
    }
  }
}

/**
 * Update legacy status indicator for backward compatibility
 * @param {Object} validationResult - Enhanced validation result
 */
function updateLegacyStatusIndicator(validationResult) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  if (!statusIndicator || !statusText) return;
  
  const summary = positionValidationUI.getValidationSummary();
  if (!summary) return;
  
  // Update based on enhanced validation
  switch (summary.status) {
    case 'valid':
      statusIndicator.innerHTML = '<span class="status-icon">✅</span>';
      statusText.textContent = t('positionValid') || 'Position is valid';
      statusIndicator.style.color = '#28a745';
      break;
      
    case 'check':
      statusIndicator.innerHTML = '<span class="status-icon">👑</span>';
      statusText.textContent = summary.message;
      statusIndicator.style.color = '#7c3aed';
      break;
      
    case 'checkmate':
      statusIndicator.innerHTML = '<span class="status-icon">♔</span>';
      statusText.textContent = summary.message;
      statusIndicator.style.color = '#dc2626';
      break;
      
    case 'stalemate':
      statusIndicator.innerHTML = '<span class="status-icon">🤝</span>';
      statusText.textContent = summary.message;
      statusIndicator.style.color = '#6b7280';
      break;
      
    case 'warning':
      statusIndicator.innerHTML = '<span class="status-icon">⚠️</span>';
      statusText.textContent = summary.message;
      statusIndicator.style.color = '#d97706';
      break;
      
    case 'invalid':
    default:
      statusIndicator.innerHTML = '<span class="status-icon">❌</span>';
      statusText.textContent = summary.message;
      statusIndicator.style.color = '#dc3545';
      break;
  }
}

/**
 * Update start game button state based on validation
 * @param {Object} validationResult - Enhanced validation result
 */
function updateStartGameButton(validationResult) {
  const startBtn = document.getElementById('btnStartGame');
  if (!startBtn) return;
  
  // Enable button only for valid positions (including check/checkmate for analysis)
  const canStart = validationResult.valid || 
                   validationResult.checkStatus.whiteInCheck || 
                   validationResult.checkStatus.blackInCheck;
  
  startBtn.disabled = !canStart;
  
  if (canStart) {
    startBtn.classList.remove('disabled');
    startBtn.title = t('startCustomGame') || 'Start custom game';
  } else {
    startBtn.classList.add('disabled');
    startBtn.title = t('fixErrorsFirst') || 'Fix position errors first';
  }
}

/**
 * Fallback basic validation for when enhanced system is not available
 * @param {number} whiteKings - Number of white kings
 * @param {number} blackKings - Number of black kings
 */
function updateBasicValidationStatus(whiteKings, blackKings) {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  if (statusIndicator && statusText) {
    if (whiteKings === 1 && blackKings === 1) {
      statusIndicator.innerHTML = '<span class="status-icon">✅</span>';
      statusText.textContent = t('positionValid') || 'Position is valid';
      statusIndicator.style.color = '#28a745';
    } else {
      statusIndicator.innerHTML = '<span class="status-icon">⚠️</span>';
      statusText.textContent = t('needBothKings') || 'Both kings required';
      statusIndicator.style.color = '#dc3545';
    }
  }
}

function updateAdvancedStats(analysis) {
  if (analysis.error) return;
  
  // Update piece activity stats
  const whiteActivityEl = document.getElementById('whiteActivity');
  const blackActivityEl = document.getElementById('blackActivity');
  
  if (whiteActivityEl) {
    whiteActivityEl.textContent = `${analysis.pieceActivity.white.mobilePieces} active`;
  }
  if (blackActivityEl) {
    blackActivityEl.textContent = `${analysis.pieceActivity.black.mobilePieces} active`;
  }
  
  // Update center control stats
  const centerControlEl = document.getElementById('centerControlStats');
  if (centerControlEl) {
    const whiteControl = analysis.centerControl.white;
    const blackControl = analysis.centerControl.black;
    const total = analysis.centerControl.totalCenterSquares;
    centerControlEl.textContent = `W:${whiteControl}/${total}, B:${blackControl}/${total}`;
  }
  
  // Update king safety indicators
  const whiteKingSafetyEl = document.getElementById('whiteKingSafety');
  const blackKingSafetyEl = document.getElementById('blackKingSafety');
  
  if (whiteKingSafetyEl) {
    const status = analysis.kingSafety.white.status;
    const icon = getKingSafetyIcon(status, analysis.kingSafety.white.inCheck);
    whiteKingSafetyEl.innerHTML = `${icon} ${status}`;
  }
  
  if (blackKingSafetyEl) {
    const status = analysis.kingSafety.black.status;
    const icon = getKingSafetyIcon(status, analysis.kingSafety.black.inCheck);
    blackKingSafetyEl.innerHTML = `${icon} ${status}`;
  }
  
  // Update position type
  const positionTypeEl = document.getElementById('positionType');
  if (positionTypeEl) {
    positionTypeEl.textContent = analysis.positionType.replace(/_/g, ' ');
  }
}

function getKingSafetyIcon(status, inCheck) {
  if (inCheck) return '⚠️';
  
  switch (status) {
    case 'safe': return '🛡️';
    case 'moderate': return '🟡';
    case 'restricted': return '🟠';
    case 'dangerous': return '🔴';
    case 'critical': return '💀';
    default: return '❓';
  }
}

function analyzePosition() {
  // Use performance monitoring if available
  if (performanceMonitor && advancedPositionAnalyzer) {
    monitoredAnalyzePosition(setupBoard).then(({ result: analysis, measurement }) => {
      if (analysis && !analysis.error) {
        displayAdvancedAnalysis(analysis);
        
        // Log performance info
        if (measurement) {
          const duration = measurement.duration.toFixed(2);
          const target = performanceMonitor.targets.analysisOperation;
          
          if (measurement.withinTarget) {
            console.log(`⚡ Position analysis completed in ${duration}ms (target: ${target}ms) ✅`);
          } else {
            console.warn(`🐌 Position analysis took ${duration}ms (target: ${target}ms) ❌`);
          }
        }
      } else {
        displayBasicAnalysis();
      }
    }).catch(error => {
      console.error('Monitored analysis failed:', error);
      displayBasicAnalysis();
    });
    return;
  }
  
  // Use Advanced Position Analyzer if available, fallback to basic analysis
  if (advancedPositionAnalyzer) {
    try {
      const analysis = advancedPositionAnalyzer.analyzePosition(setupBoard);
      
      if (analysis.error) {
        displayBasicAnalysis();
        return;
      }
      
      displayAdvancedAnalysis(analysis);
      return;
    } catch (error) {
      console.error('Advanced analysis failed:', error);
      // Fallback to basic analysis
    }
  }
  
  // Fallback to basic analysis
  displayBasicAnalysis();
}

function displayAdvancedAnalysis(analysis) {
  // Use the new Position Evaluation Report System if available
  if (positionEvaluationReport) {
    positionEvaluationReport.generateReport(analysis);
    return;
  }
  
  // Fallback to basic text display
  const analysisText = document.getElementById('analysisText');
  if (!analysisText) return;
  
  // Create comprehensive analysis display
  const summary = [];
  
  // Material balance
  const material = analysis.materialBalance;
  if (material.advantage === 'equal') {
    summary.push(t('materialEqual') || 'Material is equal');
  } else {
    const advantage = material.advantage === 'white' ? t('whiteAdvantage') : t('blackAdvantage');
    summary.push(`${advantage} (+${material.advantageAmount})`);
  }
  
  // Piece activity
  const activity = analysis.pieceActivity;
  const whiteActivity = activity.white.mobilePieces;
  const blackActivity = activity.black.mobilePieces;
  summary.push(`Active pieces: White ${whiteActivity}, Black ${blackActivity}`);
  
  // King safety
  const kingSafety = analysis.kingSafety;
  if (kingSafety.white.inCheck || kingSafety.black.inCheck) {
    const inCheckSide = kingSafety.white.inCheck ? 'White' : 'Black';
    summary.push(`${inCheckSide} king is in check!`);
  } else {
    const whiteStatus = kingSafety.white.status;
    const blackStatus = kingSafety.black.status;
    if (whiteStatus === 'critical' || blackStatus === 'critical') {
      summary.push('King safety critical!');
    } else if (whiteStatus === 'dangerous' || blackStatus === 'dangerous') {
      summary.push('King safety concerns detected');
    }
  }
  
  // Center control
  const center = analysis.centerControl;
  if (center.advantage !== 'equal') {
    const controlSide = center.advantage === 'white' ? 'White' : 'Black';
    summary.push(`${controlSide} controls center (${center[center.advantage]}/${center.totalCenterSquares})`);
  } else {
    summary.push(`Center control balanced (${center.white}-${center.black})`);
  }
  
  // Position type
  summary.push(`Position type: ${analysis.positionType.replace(/_/g, ' ')}`);
  
  analysisText.textContent = summary.join('. ');
  
  // Display recommendations if available
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    const recommendationsEl = document.getElementById('recommendationsText');
    if (recommendationsEl) {
      recommendationsEl.textContent = analysis.recommendations.join(' ');
    }
  }
}

function displayBasicAnalysis() {
  let whiteKings = 0, blackKings = 0;
  let whitePieces = [], blackPieces = [];
  
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      const piece = setupBoard[i][j];
      if (piece) {
        const isWhite = piece === piece.toUpperCase();
        if (piece.toLowerCase() === 'k') {
          if (isWhite) whiteKings++;
          else blackKings++;
        }
        
        if (isWhite) {
          whitePieces.push(piece.toLowerCase());
        } else {
          blackPieces.push(piece.toLowerCase());
        }
      }
    }
  }
  
  let analysis = [];
  
  if (whiteKings !== 1 || blackKings !== 1) {
    analysis.push(t('invalidPosition') || 'Invalid position - need exactly one king per side');
  } else {
    // Material analysis
    const whiteMaterial = whitePieces.reduce((sum, p) => sum + (DEGERLER[p] || 0), 0);
    const blackMaterial = blackPieces.reduce((sum, p) => sum + (DEGERLER[p] || 0), 0);
    
    if (whiteMaterial > blackMaterial) {
      analysis.push(t('whiteAdvantage') || `White has material advantage (+${whiteMaterial - blackMaterial})`);
    } else if (blackMaterial > whiteMaterial) {
      analysis.push(t('blackAdvantage') || `Black has material advantage (+${blackMaterial - whiteMaterial})`);
    } else {
      analysis.push(t('materialEqual') || 'Material is equal');
    }
    
    // Piece count analysis
    if (whitePieces.length + blackPieces.length < 6) {
      analysis.push(t('endgamePosition') || 'This appears to be an endgame position');
    } else if (whitePieces.length + blackPieces.length > 12) {
      analysis.push(t('complexPosition') || 'This is a complex position with many pieces');
    }
    
    // Check for special pieces
    if (whitePieces.includes('q') || blackPieces.includes('q')) {
      analysis.push(t('queensPresent') || 'Queens are present - tactical opportunities likely');
    }
  }
  
  const analysisText = document.getElementById('analysisText');
  if (analysisText) {
    analysisText.textContent = analysis.join('. ') || (t('setUpPieces') || 'Set up pieces to see analysis');
  }
}

/**
 * Get detailed position analysis for display
 * @returns {Object|null} Analysis object or null if not available
 */
function getDetailedPositionAnalysis() {
  if (!advancedPositionAnalyzer || !setupBoard) {
    return null;
  }
  
  try {
    return advancedPositionAnalyzer.generateAnalysisReport(setupBoard);
  } catch (error) {
    console.error('Failed to generate detailed analysis:', error);
    return null;
  }
}

/**
 * Export position analysis as JSON
 * @returns {string} JSON string of analysis
 */
function exportPositionAnalysis() {
  const analysis = getDetailedPositionAnalysis();
  if (!analysis) {
    return JSON.stringify({ error: 'No analysis available' });
  }
  
  return JSON.stringify(analysis, null, 2);
}

/**
 * Get position analysis summary for quick display
 * @returns {string} Summary text
 */
function getPositionAnalysisSummary() {
  const analysis = getDetailedPositionAnalysis();
  if (!analysis) {
    return 'Analysis not available';
  }
  
  return analysis.summary;
}

/**
 * Check if current position meets performance requirements
 * @returns {Object} Performance check result
 */
function checkAnalysisPerformance() {
  if (!advancedPositionAnalyzer || !setupBoard) {
    return { success: false, message: 'Analyzer not available' };
  }
  
  const startTime = performance.now();
  
  try {
    advancedPositionAnalyzer.analyzePosition(setupBoard);
    const endTime = performance.now();
    const analysisTime = endTime - startTime;
    
    const success = analysisTime < 500; // Requirement: < 500ms
    
    return {
      success,
      analysisTime: analysisTime.toFixed(2),
      requirement: '500ms',
      message: success ? 
        `Analysis completed in ${analysisTime.toFixed(2)}ms (✅ meets requirement)` :
        `Analysis took ${analysisTime.toFixed(2)}ms (⚠️ exceeds 500ms requirement)`
    };
  } catch (error) {
    return {
      success: false,
      message: `Analysis failed: ${error.message}`
    };
  }
}

// Update the existing functions to call updatePositionStats
const originalDrawSetupBoard = drawSetupBoard;
drawSetupBoard = function() {
  originalDrawSetupBoard();
  updatePositionStats();
  analyzePosition();
};

const originalClearSetupBoard = clearSetupBoard;
clearSetupBoard = function() {
  console.log("Clearing setup board");
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      setupBoard[i][j] = null;
    }
  }
  drawSetupBoard();
  reinitializeDragDrop();
  bildirimGoster(t('boardCleared') || 'Board cleared!');
};

const originalResetToDefaultPosition = resetToDefaultPosition;
resetToDefaultPosition = function() {
  console.log("Resetting to default position");
  setupBoard = [
    ["r", "q", "k", "r"],
    ["p", "p", "p", "p"],
    [null, null, null, null],
    ["P", "P", "P", "P"],
    ["R", "Q", "K", "R"],
  ];
  drawSetupBoard();
  reinitializeDragDrop();
  bildirimGoster(t('defaultSetup') || 'Default position restored!');
};

// ===== THEME MANAGEMENT FUNCTIONS =====

// Global theme state
let currentTheme = 'light';

// Initialize theme system
function initThemeSystem() {
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('4x5-chess-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Apply theme
    applyTheme(currentTheme);
    
    // Update button text
    updateThemeButton();
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('4x5-chess-theme')) {
                currentTheme = e.matches ? 'dark' : 'light';
                applyTheme(currentTheme);
                updateThemeButton();
            }
        });
    }
    
    console.log('Theme system initialized:', currentTheme);
}

// Toggle theme function
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    saveTheme(currentTheme);
    updateThemeButton();
    
    // Show notification
    const message = currentTheme === 'dark' ? 
        (t('switchToDark') || 'Switched to dark theme') : 
        (t('switchToLight') || 'Switched to light theme');
    bildirimGoster(message);
}

// Apply theme to document
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
    
    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.content = theme === 'dark' ? '#0f172a' : '#ffffff';
    }
}

// Save theme to localStorage
function saveTheme(theme) {
    try {
        localStorage.setItem('4x5-chess-theme', theme);
        // Also sync with piece setup page
        localStorage.setItem('pieceSetupTheme', theme);
    } catch (error) {
        console.warn('Failed to save theme preference:', error);
    }
}

// Update theme button text and icon
function updateThemeButton() {
    const themeBtn = document.getElementById('btnTheme');
    const themeBtnText = document.getElementById('btnThemeText');
    
    if (themeBtn && themeBtnText) {
        if (currentTheme === 'dark') {
            themeBtn.innerHTML = '☀️ <span id="btnThemeText">' + (t('lightMode') || 'Light Mode') + '</span>';
        } else {
            themeBtn.innerHTML = '🌙 <span id="btnThemeText">' + (t('darkMode') || 'Dark Mode') + '</span>';
        }
    }
}

// Get current theme
function getCurrentTheme() {
    return currentTheme;
}

// Initialize theme system when page loads
document.addEventListener('DOMContentLoaded', function() {
    initThemeSystem();
});

// Listen for theme changes from other pages (like piece setup)
window.addEventListener('storage', function(e) {
    if (e.key === '4x5-chess-theme' && e.newValue !== currentTheme) {
        currentTheme = e.newValue;
        applyTheme(currentTheme);
        updateThemeButton();
    }
});