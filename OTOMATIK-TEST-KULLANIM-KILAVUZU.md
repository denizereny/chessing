# 🚀 Otomatik İngilizce Çeviri Test Sistemi - Kullanım Kılavuzu

## 📋 Nasıl Kullanılır?

### Adım 1: Dosyayı Kopyala
`auto-test-english-translations.html` dosyasını projenizin ana dizinine kopyalayın (index.html ile aynı klasöre).

### Adım 2: Tarayıcıda Aç
Tarayıcınızda şu adresi açın:
```
http://192.168.1.8:8080/auto-test-english-translations.html
```

### Adım 3: Test Başlat
Sayfada 4 buton göreceksiniz:

1. **🚀 Tam Test Başlat** - Hem İngilizce hem Türkçe'yi test eder (ÖNERİLEN)
2. **🇬🇧 Sadece İngilizce Test Et** - Sadece İngilizce çevirileri kontrol eder
3. **🇹🇷 Sadece Türkçe Test Et** - Sadece Türkçe çevirileri kontrol eder
4. **🗑️ Sonuçları Temizle** - Test sonuçlarını sıfırlar

### Adım 4: Sonuçları İncele
Test tamamlandığında göreceksiniz:

- ✅ **Başarılı testler** - Yeşil arka plan
- ❌ **Başarısız testler** - Kırmızı arka plan
- 📊 **Özet istatistikler** - Toplam, başarılı, başarısız, başarı oranı
- 📝 **Detaylı rapor** - Hangi çevirilerin çalışmadığını gösterir

## 🎯 Ne Test Eder?

Sistem şu çevirileri otomatik olarak test eder:

### Oyun Kontrolleri
- ✅ New Game / Yeni Oyun
- ✅ Switch Sides / Taraf Değiştir
- ✅ Settings / Ayarlar

### Oyun Durumu
- ✅ White Playing / Beyaz Oynuyor
- ✅ Black Playing / Siyah Oynuyor
- ✅ Move History / Hamle Geçmişi

### Tahta Renkleri
- ✅ Board Colors / Tahta Renkleri
- ✅ Light Squares / Açık Kareler
- ✅ Dark Squares / Koyu Kareler
- ✅ White Pieces / Beyaz Taşlar
- ✅ Black Pieces / Siyah Taşlar

### Renk Şablonları
- ✅ Classic / Klasik
- ✅ Wood / Ahşap
- ✅ Marble / Mermer
- ✅ Neon / Neon
- ✅ Ocean / Okyanus
- ✅ Reset / Sıfırla

### AI Zorluk Seviyeleri
- ✅ Easy / Kolay
- ✅ Medium / Orta
- ✅ Hard / Zor
- ✅ Expert / Uzman

### Diğer Özellikler
- ✅ Piece Setup / Taş Düzeni
- ✅ Analyze Position / Pozisyonu Analiz Et
- ✅ Share Position / Pozisyonu Paylaş

**TOPLAM: 25+ çeviri otomatik test edilir!**

## 📊 Örnek Rapor

Test tamamlandığında şöyle bir rapor göreceksiniz:

```
=================================================
   İNGİLİZCE ÇEVİRİ TEST RAPORU
=================================================

Tarih: 21.02.2026 14:30:45
Toplam Test: 25
Başarılı: 23
Başarısız: 2
Başarı Oranı: 92%

=================================================
   BAŞARISIZ TESTLER
=================================================

❌ whitePlaying
   Mevcut: "Beyaz Oynuyor"
   Beklenen: "White Playing"

❌ boardColors
   Mevcut: "Tahta Renkleri"
   Beklenen: "Board Colors"

=================================================
   ÖNERİLER
=================================================

1. localStorage'ı temizleyin: localStorage.clear()
2. Sayfayı yenileyin (F5)
3. Dil seçiciyi İngilizce'ye ayarlayın
4. Tarayıcı önbelleğini temizleyin (Ctrl+Shift+Delete)
```

## 🔧 Sorun Giderme

### "setLanguage fonksiyonu bulunamadı" Hatası
**Çözüm:** Test sayfasını ana dizinde açtığınızdan emin olun. `js/translations.js` dosyası yüklenmelidir.

### Tüm Testler Başarısız
**Çözüm:** 
1. Ana sayfayı açın (`http://192.168.1.8:8080`)
2. F12 tuşuna basın
3. Console'da şu komutu çalıştırın: `localStorage.clear()`
4. Sayfayı yenileyin (F5)
5. Test sayfasını tekrar açın

### Bazı Testler Başarısız
**Çözüm:** Rapordaki önerileri takip edin. Genellikle localStorage temizleme yeterlidir.

## 💡 İpuçları

1. **İlk test her zaman başarısız olabilir** - localStorage'da Türkçe sabit kalmış olabilir. localStorage'ı temizleyin ve tekrar deneyin.

2. **Tarayıcı önbelleği** - Eğer localStorage temizleme işe yaramazsa, tarayıcı önbelleğini temizleyin.

3. **Manuel test** - Otomatik test başarısız olsa bile, ana sayfada manuel olarak dil değiştirmeyi deneyin.

4. **Console kullanımı** - F12 → Console → `setLanguage('en')` komutu ile manuel test yapabilirsiniz.

## 📱 Mobil Cihazlarda Kullanım

Mobil cihazlarda da çalışır! Sadece:
1. Mobil tarayıcınızda `http://192.168.1.8:8080/auto-test-english-translations.html` adresini açın
2. Test butonlarına dokunun
3. Sonuçları görün

## 🎓 Teknik Detaylar

### Nasıl Çalışır?

1. **Dil Değiştirme:** `setLanguage('en')` fonksiyonunu çağırır
2. **Çeviri Kontrolü:** Her çeviri anahtarı için `t(key)` fonksiyonunu çağırır
3. **Karşılaştırma:** Beklenen değer ile gerçek değeri karşılaştırır
4. **Raporlama:** Sonuçları görsel olarak gösterir

### Test Edilen Fonksiyonlar

- ✅ `setLanguage(lang)` - Dil değiştirme
- ✅ `t(key)` - Çeviri getirme
- ✅ `updateUIText()` - UI güncelleme (dolaylı)

## 📞 Destek

Sorun yaşarsanız:
1. Raporu kaydedin (Copy/Paste)
2. Console'daki hataları kontrol edin (F12)
3. `verify-english-translation.js` scriptini Console'da çalıştırın

## ✨ Özellikler

- ✅ Otomatik test
- ✅ Görsel rapor
- ✅ İlerleme çubuğu
- ✅ Detaylı istatistikler
- ✅ Başarı/başarısızlık göstergeleri
- ✅ Öneriler ve çözümler
- ✅ Mobil uyumlu
- ✅ Kullanımı kolay

---

**Oluşturulma Tarihi:** 21 Şubat 2026  
**Versiyon:** 1.0  
**Durum:** Kullanıma hazır ✅
