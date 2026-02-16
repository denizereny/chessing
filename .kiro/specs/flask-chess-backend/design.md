# Tasarım Belgesi

## Genel Bakış

Bu belge, mevcut JavaScript tabanlı 4x5 chess uygulamasının Flask backend'li mimariye dönüştürülmesi için teknik tasarımı tanımlar. Sistem, hamle mantığını ve AI kararlarını Python/Flask backend'e taşıyarak daha güvenilir, ölçeklenebilir ve güvenli bir mimari oluşturacaktır.

## Mimari

### Sistem Mimarisi

```
┌─────────────────┐    HTTP/JSON     ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Flask API     │
│   (HTML/JS)     │                  │   Server        │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │   Chess Engine  │
                                     │   (Python)      │
                                     └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │   Session       │
                                     │   Storage       │
                                     └─────────────────┘
```

### Katmanlı Mimari

1. **Presentation Layer**: Mevcut HTML/CSS/JavaScript frontend
2. **API Layer**: Flask REST endpoints
3. **Business Logic Layer**: Chess engine ve oyun kuralları
4. **Data Layer**: Session management ve kullanıcı verileri

## Bileşenler ve Arayüzler

### 1. Flask API Server

**Sorumluluklar:**
- REST endpoint'lerini yönetme
- Request/response handling
- Authentication ve authorization
- Rate limiting ve güvenlik

**Ana Endpoints:**
```python
POST /api/game/new          # Yeni oyun başlatma
POST /api/game/{id}/move    # Hamle yapma
GET  /api/game/{id}/state   # Oyun durumu sorgulama
POST /api/game/{id}/ai-move # AI hamle isteme
GET  /api/game/{id}/history # Hamle geçmişi
DELETE /api/game/{id}       # Oyun sonlandırma

# Kullanıcı sistemi (gelecek için)
POST /api/auth/register     # Kullanıcı kaydı
POST /api/auth/login        # Kullanıcı girişi
POST /api/auth/logout       # Çıkış yapma
GET  /api/auth/profile      # Profil bilgileri
```

### 2. Chess Engine

**Sorumluluklar:**
- Hamle validasyonu
- Oyun durumu yönetimi
- AI hamle hesaplama
- Oyun sonu kontrolü

**Ana Sınıflar:**
```python
class ChessBoard:
    """4x5 satranç tahtası temsili"""
    def __init__(self):
        self.board = [[None for _ in range(4)] for _ in range(5)]
        self.white_to_move = True
        self.move_history = []
        self.captured_pieces = {'white': [], 'black': []}
    
    def make_move(self, from_pos, to_pos) -> bool
    def is_valid_move(self, from_pos, to_pos) -> bool
    def get_valid_moves(self, piece_pos) -> List[Tuple]
    def is_game_over() -> bool
    def get_game_result() -> str

class MoveValidator:
    """Hamle geçerliliği kontrolü"""
    def validate_move(self, board, from_pos, to_pos) -> ValidationResult
    def get_piece_moves(self, board, piece_type, position) -> List[Tuple]

class AIEngine:
    """Minimax tabanlı AI"""
    def __init__(self, difficulty_level: int):
        self.depth = self._get_depth_for_level(difficulty_level)
    
    def get_best_move(self, board: ChessBoard) -> Tuple[Tuple, Tuple]
    def minimax(self, board, depth, alpha, beta, maximizing) -> int
    def evaluate_position(self, board: ChessBoard) -> int
```

### 3. Session Manager

**Sorumluluklar:**
- Oyun oturumlarını yönetme
- Session timeout handling
- Memory optimization

```python
class SessionManager:
    def __init__(self):
        self.sessions = {}  # session_id -> GameSession
        self.session_timeout = 3600  # 1 saat
    
    def create_session(self) -> str
    def get_session(self, session_id: str) -> GameSession
    def update_session(self, session_id: str, game_state: dict)
    def cleanup_expired_sessions(self)

class GameSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.chess_board = ChessBoard()
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        self.ai_difficulty = 2
        self.player_color = 'white'
```

### 4. User System (Gelecek Genişleme)

```python
class User:
    def __init__(self, username: str, email: str):
        self.username = username
        self.email = email
        self.password_hash = None
        self.created_at = datetime.now()
        self.games_played = 0
        self.games_won = 0

class AuthManager:
    def register_user(self, username, email, password) -> bool
    def authenticate_user(self, username, password) -> Optional[User]
    def generate_jwt_token(self, user: User) -> str
    def verify_jwt_token(self, token: str) -> Optional[User]
```

## Veri Modelleri

### API Request/Response Modelleri

```python
# Yeni oyun başlatma
class NewGameRequest:
    ai_difficulty: int = 2
    player_color: str = 'white'  # 'white' veya 'black'
    custom_position: Optional[List[List[str]]] = None

class NewGameResponse:
    session_id: str
    board_state: List[List[Optional[str]]]
    white_to_move: bool
    valid_moves: Dict[str, List[str]]

# Hamle yapma
class MoveRequest:
    from_position: Tuple[int, int]
    to_position: Tuple[int, int]

class MoveResponse:
    success: bool
    board_state: List[List[Optional[str]]]
    white_to_move: bool
    captured_piece: Optional[str]
    game_over: bool
    winner: Optional[str]
    valid_moves: Dict[str, List[str]]
    move_notation: str

# AI hamle
class AIResponse:
    move_from: Tuple[int, int]
    move_to: Tuple[int, int]
    board_state: List[List[Optional[str]]]
    white_to_move: bool
    captured_piece: Optional[str]
    game_over: bool
    winner: Optional[str]
    calculation_time: float
    evaluation_score: int

# Oyun durumu
class GameStateResponse:
    session_id: str
    board_state: List[List[Optional[str]]]
    white_to_move: bool
    move_history: List[Dict]
    captured_pieces: Dict[str, List[str]]
    game_over: bool
    winner: Optional[str]
    move_count: int
    valid_moves: Dict[str, List[str]]
```

### Hata Modelleri

```python
class APIError:
    error_code: str
    message: str
    details: Optional[Dict] = None

# Hata kodları
ERROR_CODES = {
    'INVALID_SESSION': 'Session not found or expired',
    'INVALID_MOVE': 'Move is not valid',
    'GAME_OVER': 'Game has already ended',
    'INVALID_POSITION': 'Position coordinates are invalid',
    'AI_CALCULATION_ERROR': 'AI failed to calculate move',
    'RATE_LIMIT_EXCEEDED': 'Too many requests',
    'AUTHENTICATION_REQUIRED': 'User authentication required'
}
```

## Correctness Properties

*Bir property, sistemin tüm geçerli çalıştırmalarında doğru olması gereken bir karakteristik veya davranıştır - esasen, sistemin ne yapması gerektiği hakkında resmi bir ifadedir. Property'ler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasında köprü görevi görür.*

### Property 1: Hamle Validasyon Tutarlılığı
*For any* hamle isteği, Chess_Engine'in Python'da yaptığı validasyon sonucu, mevcut JavaScript validasyon kuralları ile aynı olmalıdır
**Validates: Requirements 1.1, 1.4**

### Property 2: Oyun Durumu Güncellemesi
*For any* geçerli hamle, Chess_Engine hamleyi uyguladıktan sonra oyun durumu doğru şekilde güncellenmelidir
**Validates: Requirements 1.2**

### Property 3: JSON Serialization Round-Trip
*For any* oyun durumu, JSON'a serialize edildikten sonra deserialize edildiğinde orijinal duruma eşit olmalıdır
**Validates: Requirements 1.3, 7.1, 7.2, 7.3, 7.5**

### Property 4: Input Validation ve Hata Mesajları
*For any* geçersiz input, sistem uygun validasyon hatası ve açıklayıcı mesaj dönmelidir
**Validates: Requirements 1.5, 8.5, 10.1**

### Property 5: AI Hamle Hesaplama
*For any* AI hamle isteği, AI_Engine geçerli bir hamle döndürmeli ve 3 saniyeden kısa sürede hesaplamalıdır
**Validates: Requirements 2.1, 2.4, 9.1**

### Property 6: AI Zorluk Seviyesi Tutarlılığı
*For any* zorluk seviyesi, AI_Engine'in davranışı mevcut JavaScript AI'ının aynı seviyedeki davranışı ile tutarlı olmalıdır
**Validates: Requirements 2.2**

### Property 7: AI Hesaplama Durumu Bildirimi
*For any* AI hamle hesaplama süreci, Game_API frontend'e hesaplama durumunu bildirmelidir
**Validates: Requirements 2.3**

### Property 8: AI Hamle Otomatik Uygulama
*For any* AI tarafından hesaplanan hamle, Chess_Engine tarafından otomatik olarak uygulanmalıdır
**Validates: Requirements 2.5**

### Property 9: API Response Format Tutarlılığı
*For any* API çağrısı, yanıt JSON formatında ve tutarlı schema ile dönmelidir
**Validates: Requirements 3.5, 7.4**

### Property 10: API Hata Yönetimi
*For any* API hatası, uygun HTTP status code ve hata mesajı dönmelidir
**Validates: Requirements 3.6, 8.4**

### Property 11: Session Yaşam Döngüsü
*For any* oyun session'ı, benzersiz ID ile oluşturulmalı, durumu saklanmalı ve geçersiz ID'ler için 404 hatası dönmelidir
**Validates: Requirements 4.1, 4.2, 4.3, 4.5**

### Property 12: Session Timeout Yönetimi
*For any* session, 1 saatlik inaktivite sonrası otomatik olarak temizlenmelidir
**Validates: Requirements 4.4**

### Property 13: JWT Authentication Round-Trip
*For any* geçerli kullanıcı, JWT token oluşturulup doğrulandığında orijinal kullanıcı bilgileri elde edilmelidir
**Validates: Requirements 6.3**

### Property 14: Şifre Güvenliği
*For any* şifre, güvenli hash algoritması ile hash'lenmeli ve plain text olarak saklanmamalıdır
**Validates: Requirements 6.4**

### Property 15: Authentication Hata Yönetimi
*For any* geçersiz kimlik bilgisi, sistem 401 hatası dönmelidir
**Validates: Requirements 6.5**

### Property 16: API Logging
*For any* API çağrısı, sistem çağrıyı loglamalıdır
**Validates: Requirements 8.1**

### Property 17: Hata Logging
*For any* sistem hatası, detaylı hata bilgisi loglanmalıdır
**Validates: Requirements 8.2**

### Property 18: Rate Limiting
*For any* IP adresi, belirlenen rate limit'i aştığında sistem isteği reddetmelidir
**Validates: Requirements 8.3**

### Property 19: API Performance
*For any* API çağrısı, 100ms'den kısa sürede yanıt dönmelidir
**Validates: Requirements 9.2**

### Property 20: Güvenlik Koruması
*For any* hamle manipülasyon girişimi, sistem bunu tespit etmeli ve engellemeli
**Validates: Requirements 10.2**

### Property 21: SQL Injection Koruması
*For any* database işlemi, SQL injection saldırılarına karşı korunmalıdır
**Validates: Requirements 10.4**

### Property 22: Şüpheli Aktivite Koruması
*For any* şüpheli aktivite tespit edildiğinde, sistem IP'yi geçici olarak bloklamalıdır
**Validates: Requirements 10.5**

## Hata Yönetimi

### Hata Kategorileri

1. **Validation Errors (400)**
   - Geçersiz hamle
   - Eksik veya hatalı parametreler
   - Format hataları

2. **Authentication Errors (401)**
   - Geçersiz kimlik bilgileri
   - Süresi dolmuş token

3. **Authorization Errors (403)**
   - Yetkisiz işlem girişimi

4. **Not Found Errors (404)**
   - Geçersiz session ID
   - Var olmayan endpoint

5. **Rate Limit Errors (429)**
   - Çok fazla istek

6. **Server Errors (500)**
   - AI hesaplama hatası
   - Database bağlantı hatası
   - Beklenmeyen sistem hatası

### Hata Yönetimi Stratejisi

```python
class ErrorHandler:
    def handle_validation_error(self, error: ValidationError) -> APIError:
        return APIError(
            error_code='VALIDATION_ERROR',
            message=error.message,
            details=error.field_errors
        )
    
    def handle_chess_engine_error(self, error: ChessEngineError) -> APIError:
        if isinstance(error, InvalidMoveError):
            return APIError(
                error_code='INVALID_MOVE',
                message=f'Invalid move: {error.reason}',
                details={'from': error.from_pos, 'to': error.to_pos}
            )
    
    def handle_ai_error(self, error: AIError) -> APIError:
        return APIError(
            error_code='AI_CALCULATION_ERROR',
            message='AI failed to calculate move',
            details={'calculation_time': error.calculation_time}
        )
```

## Test Stratejisi

### İkili Test Yaklaşımı

Sistem hem unit testler hem de property-based testler ile kapsamlı şekilde test edilecektir:

**Unit Testler:**
- Spesifik örnekler ve edge case'ler
- API endpoint'lerinin doğru çalışması
- Hata durumlarının doğru handle edilmesi
- Integration testleri

**Property-Based Testler:**
- Universal property'lerin tüm inputlar için doğrulanması
- Randomize test verileri ile kapsamlı coverage
- Minimum 100 iterasyon per property test
- Her property test, tasarım belgesindeki ilgili property'yi referans almalı

**Property Test Konfigürasyonu:**
- Test framework: pytest + hypothesis (Python için)
- Her test minimum 100 iterasyon çalıştırılacak
- Test tag formatı: **Feature: flask-chess-backend, Property {number}: {property_text}**

**Test Kategorileri:**
1. **Chess Engine Tests**: Hamle validasyonu, oyun durumu, AI hesaplama
2. **API Tests**: Endpoint davranışları, hata yönetimi, response formatları
3. **Session Tests**: Session yaşam döngüsü, timeout yönetimi
4. **Security Tests**: Authentication, authorization, input validation
5. **Performance Tests**: Response time, AI hesaplama süresi
6. **Integration Tests**: Frontend-backend entegrasyonu

<function_calls>
<invoke name="prework">
<parameter name="featureName">flask-chess-backend