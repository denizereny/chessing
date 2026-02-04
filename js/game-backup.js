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
  tahtayiBaslat();
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
    statusEl.textContent = beyazSirasi ? t("blackWon") : t("whiteWon");
    pulseEl.style.background = "#e57373";
  } else {
    const sira = beyazSirasi ? t("whitePlaying") : t("blackPlaying");
    const kim = (bilgisayarRengi === "beyaz" && beyazSirasi) || (bilgisayarRengi === "siyah" && !beyazSirasi) ? " 🤖" : " 👤";
    statusEl.textContent = sira + kim;
    pulseEl.style.background = beyazSirasi ? "#4fc3f7" : "#e57373";
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

        if (tas.toLowerCase() === "p") {
          deger += beyazMi(tas) ? (3 - s) * 10 : s * 10;
        }
        if (su === 1 || su === 2) deger += 5;

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
  toggleGameMenu(); // Close menu first
  
  const modal = document.getElementById("pieceSetupModal");
  if (modal) {
    modal.classList.remove("hidden");
    // Wait a bit then initialize
    setTimeout(() => {
      initializePieceSetup();
    }, 100);
  } else {
    console.error("Piece setup modal not found!");
  }
}

function openVariations() {
  toggleGameMenu(); // Close menu first
  
  // Open variations page in new tab
  window.open('variations.html', '_blank');
}

function closePieceSetup() {
  const modal = document.getElementById("pieceSetupModal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

let setupBoard = [];
let selectedPalettePiece = null;
let setupMode = false;

function initializePieceSetup() {
  console.log("Initializing piece setup...");
  
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
  initializeDragAndDrop();
  console.log("Piece setup initialized successfully");
}

function drawSetupBoard() {
  const boardEl = document.getElementById("setupBoard");
  if (!boardEl) {
    console.error("Setup board element not found!");
    return;
  }
  
  boardEl.innerHTML = "";
  
  for (let sat = 0; sat < 5; sat++) {
    for (let sut = 0; sut < 4; sut++) {
      const square = document.createElement("div");
      square.className = "setup-square";
      square.className += (sat + sut) % 2 === 0 ? " light" : " dark";
      square.dataset.row = sat;
      square.dataset.col = sut;
      
      const piece = setupBoard[sat][sut];
      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = "setup-piece";
        
        // Add color class
        if (beyazMi(piece)) {
          pieceEl.classList.add("white-piece");
        } else {
          pieceEl.classList.add("black-piece");
        }
        
        pieceEl.textContent = TASLAR[piece];
        pieceEl.draggable = true;
        pieceEl.dataset.piece = piece;
        square.appendChild(pieceEl);
      }
      
      boardEl.appendChild(square);
    }
  }
  console.log("Setup board drawn");
}

function initializeDragAndDrop() {
  console.log("Initializing drag and drop...");
  
  // Palette pieces drag start
  document.querySelectorAll('.palette-piece').forEach(piece => {
    piece.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.dataset.piece);
      e.dataTransfer.effectAllowed = 'copy';
      console.log("Drag started:", e.target.dataset.piece);
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
      initializeDragAndDrop(); // Reinitialize after redraw
    });
    
    square.addEventListener('click', (e) => {
      if (selectedPalettePiece) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        console.log("Placing selected piece:", selectedPalettePiece, "at", row, col);
        setupBoard[row][col] = selectedPalettePiece;
        drawSetupBoard();
        initializeDragAndDrop();
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
      initializeDragAndDrop();
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
  initializeDragAndDrop();
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
  initializeDragAndDrop();
}

function startCustomGame() {
  console.log("Starting custom game...");
  
  // Validate setup (must have both kings)
  let whiteKing = false, blackKing = false;
  
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 4; j++) {
      if (setupBoard[i][j] === 'K') whiteKing = true;
      if (setupBoard[i][j] === 'k') blackKing = true;
    }
  }
  
  if (!whiteKing || !blackKing) {
    bildirimGoster(t('needBothKings') || 'Both kings are required!');
    console.log("Validation failed: missing kings");
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
  
  bildirimGoster(t('customGameStarted') || 'Custom game started!');
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