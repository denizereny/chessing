# Gereksinimler Belgesi

## Giriş

Bu belge, mevcut JavaScript tabanlı 4x5 chess uygulamasının Flask backend'li bir mimariye dönüştürülmesi için gereksinimleri tanımlar. Hamle kararları, oyun mantığı ve AI işlemleri Python/Flask tarafına taşınacak, frontend ise API çağrıları yapacak şekilde güncellenecektir.

## Sözlük

- **Chess_Engine**: Hamle validasyonu, oyun durumu ve AI kararlarını yöneten Python modülü
- **Game_API**: Flask REST API endpoints'leri
- **Frontend_Client**: Mevcut HTML/CSS/JS tabanlı kullanıcı arayüzü
- **Move_Validator**: Hamle geçerliliğini kontrol eden sistem
- **AI_Engine**: Minimax algoritması ile hamle kararı veren sistem
- **Session_Manager**: Oyun oturumlarını yöneten sistem
- **User_System**: Kullanıcı kimlik doğrulama ve yönetim sistemi

## Gereksinimler

### Gereksinim 1: Chess Engine Backend Migrasyonu

**Kullanıcı Hikayesi:** Geliştirici olarak, hamle mantığının Python'da çalışmasını istiyorum, böylece daha güvenilir ve ölçeklenebilir bir sistem elde edebilirim.

#### Kabul Kriterleri

1. WHEN bir hamle isteği gönderildiğinde, THE Chess_Engine SHALL hamleyi Python'da validate etmeli
2. WHEN geçerli bir hamle yapıldığında, THE Chess_Engine SHALL oyun durumunu güncellemeli
3. WHEN oyun durumu değiştiğinde, THE Chess_Engine SHALL yeni durumu JSON formatında dönmeli
4. THE Move_Validator SHALL mevcut JavaScript validasyon kurallarının tamamını desteklemeli
5. WHEN bir hamle geçersizse, THE Chess_Engine SHALL açıklayıcı hata mesajı dönmeli

### Gereksinim 2: AI Engine Backend Migrasyonu

**Kullanıcı Hikayesi:** Oyuncu olarak, AI'ın hamle kararlarının backend'de alınmasını istiyorum, böylece daha güçlü ve manipüle edilemez bir rakiple oynayabilirim.

#### Kabul Kriterleri

1. WHEN AI'ın sırası geldiğinde, THE AI_Engine SHALL minimax algoritması ile en iyi hamleyi hesaplamalı
2. THE AI_Engine SHALL mevcut JavaScript AI'ının tüm zorluk seviyelerini desteklemeli
3. WHEN AI hamle hesaplarken, THE Game_API SHALL hesaplama durumunu frontend'e bildirmeli
4. THE AI_Engine SHALL 5 saniyeden kısa sürede hamle kararı vermeli
5. WHEN AI hamle yaptığında, THE Chess_Engine SHALL hamleyi otomatik olarak uygulamalı

### Gereksinim 3: REST API Tasarımı

**Kullanıcı Hikayesi:** Frontend geliştirici olarak, oyun işlemlerini API çağrıları ile yapmak istiyorum, böylece backend ile temiz bir arayüz elde edebilirim.

#### Kabul Kriterleri

1. THE Game_API SHALL yeni oyun başlatma endpoint'i sağlamalı
2. THE Game_API SHALL hamle yapma endpoint'i sağlamalı
3. THE Game_API SHALL oyun durumu sorgulama endpoint'i sağlamalı
4. THE Game_API SHALL AI hamle isteme endpoint'i sağlamalı
5. WHEN API çağrısı yapıldığında, THE Game_API SHALL JSON formatında yanıt dönmeli
6. WHEN API hatası oluştuğunda, THE Game_API SHALL HTTP status code ve hata mesajı dönmeli

### Gereksinim 4: Oyun Oturumu Yönetimi

**Kullanıcı Hikayesi:** Oyuncu olarak, oyun durumunun güvenli şekilde saklanmasını istiyorum, böylece oyunum kesintiye uğrasa bile kaldığım yerden devam edebilirim.

#### Kabul Kriterleri

1. THE Session_Manager SHALL her oyun için benzersiz session ID oluşturmalı
2. WHEN oyun başlatıldığında, THE Session_Manager SHALL oyun durumunu memory'de saklamalı
3. WHEN hamle yapıldığında, THE Session_Manager SHALL güncel durumu session'da tutmalı
4. THE Session_Manager SHALL 1 saatlik inaktivite sonrası session'ı temizlemeli
5. WHEN geçersiz session ID kullanıldığında, THE Game_API SHALL 404 hatası dönmeli

### Gereksinim 5: Frontend API Entegrasyonu

**Kullanıcı Hikayesi:** Oyuncu olarak, mevcut arayüzün aynı şekilde çalışmasını istiyorum, böylece backend değişikliğini fark etmem.

#### Kabul Kriterleri

1. WHEN kullanıcı hamle yaptığında, THE Frontend_Client SHALL API'ye hamle isteği göndermeli
2. WHEN API'den yanıt geldiğinde, THE Frontend_Client SHALL tahtayı güncellenmeli
3. THE Frontend_Client SHALL mevcut tüm UI özelliklerini korumalı
4. WHEN API çağrısı başarısız olduğunda, THE Frontend_Client SHALL kullanıcıya hata mesajı göstermeli
5. THE Frontend_Client SHALL AI düşünürken loading indicator göstermeli

### Gereksinim 6: Kullanıcı Sistemi Altyapısı

**Kullanıcı Hikayesi:** Gelecekte kullanıcı girişi eklemek isteyen geliştirici olarak, temel altyapının hazır olmasını istiyorum.

#### Kabul Kriterleri

1. THE User_System SHALL kullanıcı kayıt endpoint'i sağlamalı
2. THE User_System SHALL kullanıcı giriş endpoint'i sağlamalı
3. THE User_System SHALL JWT token tabanlı kimlik doğrulama desteklemeli
4. THE User_System SHALL şifreleri güvenli şekilde hash'lemeli
5. WHEN geçersiz kimlik bilgileri girildiğinde, THE User_System SHALL 401 hatası dönmeli

### Gereksinim 7: Veri Modelleri ve Serializasyon

**Kullanıcı Hikayesi:** Sistem mimarı olarak, oyun verilerinin tutarlı şekilde serialize edilmesini istiyorum, böylece frontend-backend arasında veri bütünlüğü sağlanabilir.

#### Kabul Kriterleri

1. THE Chess_Engine SHALL oyun durumunu JSON formatında serialize etmeli
2. THE Chess_Engine SHALL hamle geçmişini JSON array olarak saklamalı
3. WHEN pozisyon serialize edildiğinde, THE Chess_Engine SHALL tüm taş pozisyonlarını içermeli
4. THE Game_API SHALL tüm yanıtları consistent JSON schema ile dönmeli
5. WHEN deserialize işlemi yapıldığında, THE Chess_Engine SHALL veri bütünlüğünü validate etmeli

### Gereksinim 8: Hata Yönetimi ve Logging

**Kullanıcı Hikayesi:** Sistem yöneticisi olarak, hataların loglanmasını ve uygun şekilde handle edilmesini istiyorum, böylece sistem sorunlarını takip edebilirim.

#### Kabul Kriterleri

1. THE Game_API SHALL tüm API çağrılarını loglamalı
2. WHEN hata oluştuğunda, THE Chess_Engine SHALL detaylı hata bilgisini loglamalı
3. THE Game_API SHALL rate limiting uygulayarak spam koruması sağlamalı
4. WHEN kritik hata oluştuğunda, THE Game_API SHALL 500 hatası dönmeli
5. THE Chess_Engine SHALL invalid input'lara karşı defensive programming uygulamalı

### Gereksinim 9: Performans ve Ölçeklenebilirlik

**Kullanıcı Hikayesi:** Sistem mimarı olarak, backend'in performanslı çalışmasını istiyorum, böylece çoklu kullanıcı desteği sağlanabilir.

#### Kabul Kriterleri

1. THE AI_Engine SHALL hamle hesaplamasını 3 saniyeden kısa sürede tamamlamalı
2. THE Game_API SHALL 100ms'den kısa response time sağlamalı
3. THE Session_Manager SHALL 1000 eşzamanlı oyunu desteklemeli
4. THE Chess_Engine SHALL memory usage'ı optimize etmeli
5. WHEN yüksek load altında, THE Game_API SHALL graceful degradation uygulamalı

### Gereksinim 10: Güvenlik ve Validasyon

**Kullanıcı Hikayesi:** Güvenlik uzmanı olarak, backend'in güvenli olmasını istiyorum, böylece kötü niyetli saldırılara karşı korunabilir.

#### Kabul Kriterleri

1. THE Game_API SHALL tüm input'ları validate etmeli
2. THE Chess_Engine SHALL hamle manipülasyonuna karşı korunmalı
3. THE Game_API SHALL CORS policy'sini doğru şekilde configure etmeli
4. THE User_System SHALL SQL injection saldırılarına karşı korunmalı
5. WHEN şüpheli aktivite tespit edildiğinde, THE Game_API SHALL IP'yi geçici olarak bloklamalı