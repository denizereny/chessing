/**
 * İngilizce Çeviri Doğrulama Scripti
 * 
 * Kullanım:
 * 1. Ana sayfayı açın (index.html)
 * 2. F12 tuşuna basarak Console'u açın
 * 3. Bu dosyanın içeriğini kopyalayıp Console'a yapıştırın
 * 4. Enter tuşuna basın
 */

console.log('🔍 İngilizce Çeviri Doğrulama Başlatılıyor...\n');

// Fonksiyon kontrolü
console.log('📦 Fonksiyon Kontrolü:');
console.log('  setLanguage:', typeof setLanguage === 'function' ? '✅ Mevcut' : '❌ Yok');
console.log('  updateUIText:', typeof updateUIText === 'function' ? '✅ Mevcut' : '❌ Yok');
console.log('  t:', typeof t === 'function' ? '✅ Mevcut' : '❌ Yok');
console.log('  window.bilgiGuncelle:', typeof window.bilgiGuncelle === 'function' ? '✅ Mevcut' : '❌ Yok');
console.log('  window.gecmisiGuncelle:', typeof window.gecmisiGuncelle === 'function' ? '✅ Mevcut' : '❌ Yok');
console.log('');

// LocalStorage kontrolü
console.log('💾 LocalStorage Kontrolü:');
const savedLang = localStorage.getItem('4x5_lang');
console.log('  Kaydedilmiş dil:', savedLang || 'ayarlanmamış');
console.log('');

// Çeviri testi
if (typeof t === 'function') {
    console.log('🧪 Çeviri Testleri:');
    
    // Mevcut dilde test
    console.log('  Mevcut dilde "newGame":', t('newGame'));
    console.log('  Mevcut dilde "whitePlaying":', t('whitePlaying'));
    console.log('  Mevcut dilde "boardColors":', t('boardColors'));
    console.log('');
    
    // İngilizce test
    if (typeof setLanguage === 'function') {
        console.log('🇬🇧 İngilizce Testi:');
        setLanguage('en');
        console.log('  "newGame":', t('newGame'), '(beklenen: "New Game")');
        console.log('  "whitePlaying":', t('whitePlaying'), '(beklenen: "White Playing")');
        console.log('  "blackPlaying":', t('blackPlaying'), '(beklenen: "Black Playing")');
        console.log('  "moveHistory":', t('moveHistory'), '(beklenen: "Move History")');
        console.log('  "boardColors":', t('boardColors'), '(beklenen: "Board Colors")');
        console.log('  "classic":', t('classic'), '(beklenen: "Classic")');
        console.log('  "wood":', t('wood'), '(beklenen: "Wood")');
        console.log('  "marble":', t('marble'), '(beklenen: "Marble")');
        console.log('');
        
        // Türkçe test
        console.log('🇹🇷 Türkçe Testi:');
        setLanguage('tr');
        console.log('  "newGame":', t('newGame'), '(beklenen: "Yeni Oyun")');
        console.log('  "whitePlaying":', t('whitePlaying'), '(beklenen: "Beyaz Oynuyor")');
        console.log('  "blackPlaying":', t('blackPlaying'), '(beklenen: "Siyah Oynuyor")');
        console.log('  "moveHistory":', t('moveHistory'), '(beklenen: "Hamle Geçmişi")');
        console.log('  "boardColors":', t('boardColors'), '(beklenen: "Tahta Renkleri")');
        console.log('  "classic":', t('classic'), '(beklenen: "Klasik")');
        console.log('  "wood":', t('wood'), '(beklenen: "Ahşap")');
        console.log('  "marble":', t('marble'), '(beklenen: "Mermer")');
        console.log('');
        
        // Tekrar İngilizce'ye dön
        setLanguage('en');
        console.log('🔄 Tekrar İngilizce\'ye Dönüldü');
        console.log('  "newGame":', t('newGame'), '(beklenen: "New Game")');
        console.log('');
    }
}

// Element kontrolü
console.log('🎯 Sayfa Elementleri Kontrolü:');
const elements = [
    { id: 'btnNewGame', name: 'New Game Button' },
    { id: 'lblBoardColors', name: 'Board Colors Label' },
    { id: 'lblLightSquares', name: 'Light Squares Label' },
    { id: 'lblDarkSquares', name: 'Dark Squares Label' },
    { id: 'statusText', name: 'Status Text' },
    { id: 'moveHistory', name: 'Move History' }
];

elements.forEach(({ id, name }) => {
    const el = document.getElementById(id);
    if (el) {
        console.log(`  ${name}:`, el.textContent || el.innerHTML.substring(0, 50));
    } else {
        console.log(`  ${name}: ❌ Element bulunamadı`);
    }
});
console.log('');

// Sonuç ve öneriler
console.log('📊 Sonuç:');
if (typeof setLanguage === 'function' && typeof t === 'function') {
    console.log('  ✅ Çeviri sistemi çalışıyor');
    console.log('');
    console.log('💡 İngilizce\'ye geçmek için:');
    console.log('  1. Console\'da şu komutu çalıştırın: setLanguage("en")');
    console.log('  2. Veya dil seçiciyi kullanın');
    console.log('');
    console.log('🔧 Sorun devam ediyorsa:');
    console.log('  1. localStorage.clear() komutunu çalıştırın');
    console.log('  2. Sayfayı yenileyin (F5)');
    console.log('  3. Dil seçiciyi İngilizce\'ye ayarlayın');
} else {
    console.log('  ❌ Çeviri sistemi yüklenemedi');
    console.log('  translations.js dosyasının doğru yüklendiğinden emin olun');
}

console.log('');
console.log('✨ Doğrulama tamamlandı!');
