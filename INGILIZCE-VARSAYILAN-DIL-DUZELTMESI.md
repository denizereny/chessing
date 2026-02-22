# İngilizce Varsayılan Dil Düzeltmesi

## Tarih: 2025-02-21

## Sorun
Oyun her açıldığında localStorage'da kaydedilen dil tercihini kullanıyordu. Bu yüzden kullanıcı bir kez Türkçe seçtikten sonra, oyun her açıldığında Türkçe olarak başlıyordu.

## Kullanıcı İsteği
"Oyun kimde açılırsa açılsın hep İngilizce'den başlat her kelimeyi"

## Yapılan Değişiklikler

### 1. `setLanguage()` Fonksiyonu Güncellendi
**Dosya:** `js/translations.js`

**Önceki Kod:**
```javascript
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  updateUIText();
  localStorage.setItem("4x5_lang", lang);  // ❌ localStorage'a kaydediyordu
  // ...
}
```

**Yeni Kod:**
```javascript
function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  updateUIText();
  // Don't save to localStorage - always start fresh with English  // ✅ Artık kaydetmiyor
  // ...
}
```

### 2. DOMContentLoaded Event Listener Güncellendi
**Dosya:** `js/translations.js`

**Önceki Kod:**
```javascript
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("4x5_lang");  // ❌ localStorage'dan okuyordu
  if (savedLang && translations[savedLang]) {
    // Kaydedilen dili kullanıyordu
    setLanguage(savedLang);
  } else {
    setLanguage("en");
  }
});
```

**Yeni Kod:**
```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Always start with English, ignore localStorage  // ✅ Her zaman İngilizce
  const startLanguageSelect = document.getElementById("startLanguage");
  const settingsLanguageSelect = document.getElementById("languageSelect");
  
  if (startLanguageSelect) startLanguageSelect.value = "en";
  if (settingsLanguageSelect) settingsLanguageSelect.value = "en";
  
  // Set language to English
  setLanguage("en");
});
```

### 3. Storage Event Listener Kaldırıldı
**Dosya:** `js/translations.js`

**Kaldırılan Kod:**
```javascript
// ❌ Bu kod tamamen kaldırıldı
window.addEventListener('storage', function(e) {
  if (e.key === '4x5_lang' && e.newValue && translations[e.newValue]) {
    // Diğer sekmelerden gelen dil değişikliklerini dinliyordu
    setLanguage(e.newValue);
  }
});
```

## Sonuç

### ✅ Artık Çalışan Davranış

1. **Oyun Her Açıldığında:**
   - Dil seçiciler otomatik olarak "English" seçili gelir
   - Tüm UI metinleri İngilizce olarak görünür
   - localStorage'daki eski dil tercihi göz ardı edilir

2. **Kullanıcı Dil Değiştirdiğinde:**
   - Seçilen dile geçer (örn: Türkçe, Japonca)
   - Tüm metinler anında güncellenir
   - ANCAK bu tercih kaydedilmez

3. **Sayfa Yenilendiğinde:**
   - Tekrar İngilizce'ye döner
   - Her seferinde temiz bir başlangıç

### 🎯 Kullanıcı Deneyimi

```
Kullanıcı 1. Seferde:
  Oyunu açar → İngilizce ✅
  Türkçe seçer → Türkçe olur ✅
  Sayfayı kapatır

Kullanıcı 2. Seferde:
  Oyunu açar → İngilizce ✅ (Türkçe kalmadı!)
  Japonca seçer → Japonca olur ✅
  Sayfayı yeniler → İngilizce ✅
```

## Test Nasıl Yapılır?

### Test 1: İlk Açılış
1. Tarayıcıyı tamamen kapat
2. `http://192.168.1.8:8080` adresini aç
3. **Beklenen:** Tüm metinler İngilizce olmalı
4. **Kontrol:** "New Game", "Switch Sides", "White Playing" gibi metinler görünmeli

### Test 2: Dil Değiştirme
1. Dil seçiciden Türkçe seç
2. **Beklenen:** Tüm metinler Türkçe'ye dönmeli
3. **Kontrol:** "Yeni Oyun", "Taraf Değiştir", "Beyaz Oynuyor" gibi metinler görünmeli

### Test 3: Sayfa Yenileme
1. Türkçe'deyken sayfayı yenile (F5)
2. **Beklenen:** Tekrar İngilizce olmalı
3. **Kontrol:** Türkçe metinler kalmamalı

### Test 4: Tarayıcı Kapatma
1. Japonca seç
2. Tarayıcıyı tamamen kapat
3. Tekrar aç
4. **Beklenen:** İngilizce olmalı

## Teknik Detaylar

### Değişiklik Özeti
- ❌ **Kaldırıldı:** localStorage'a dil kaydetme
- ❌ **Kaldırıldı:** localStorage'dan dil okuma
- ❌ **Kaldırıldı:** Storage event listener
- ✅ **Eklendi:** Her zaman İngilizce başlatma
- ✅ **Korundu:** Dil değiştirme özelliği (oturum boyunca)

### Etkilenen Dosyalar
- `js/translations.js` - 3 değişiklik yapıldı

### Etkilenmeyen Özellikler
- ✅ Dil değiştirme hala çalışıyor
- ✅ Tüm 11 dil hala destekleniyor
- ✅ RTL desteği (Arapça) hala çalışıyor
- ✅ Dinamik çeviriler hala çalışıyor

## Önemli Notlar

1. **Dil Tercihi Kaydedilmez:**
   - Kullanıcı her seferinde dil seçmek zorunda
   - Bu kullanıcının isteği doğrultusunda yapıldı

2. **Oturum Boyunca Geçerli:**
   - Kullanıcı dil değiştirirse, sayfa yenilenene kadar o dilde kalır
   - Yeni sekme açılırsa, yeni sekme İngilizce başlar

3. **Geriye Dönük Uyumluluk:**
   - Eski localStorage kayıtları göz ardı edilir
   - Hiçbir veri silinmez, sadece okunmaz

## Alternatif Yaklaşımlar (Uygulanmadı)

### Yaklaşım 1: Tarayıcı Dilini Kullan
```javascript
// Tarayıcının dilini algıla
const browserLang = navigator.language.split('-')[0];
setLanguage(browserLang);
```
**Neden Uygulanmadı:** Kullanıcı açıkça "her zaman İngilizce" istedi

### Yaklaşım 2: Oturum Bazlı Kayıt
```javascript
// sessionStorage kullan (sekme kapanınca siler)
sessionStorage.setItem("4x5_lang", lang);
```
**Neden Uygulanmadı:** Kullanıcı her açılışta İngilizce istedi

## Sonuç

✅ **Tamamlandı:** Oyun artık her açıldığında İngilizce başlıyor
✅ **Test Edildi:** Tüm senaryolar çalışıyor
✅ **Kullanıcı İsteği:** Tam olarak karşılandı

---

**Durum:** ✅ TAMAMLANDI
**Son Güncelleme:** 2025-02-21
**Değişiklik Sayısı:** 3 fonksiyon güncellendi
**Etkilenen Dosya:** js/translations.js
