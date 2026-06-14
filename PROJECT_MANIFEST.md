# MyRank Project Manifesto

## 1. Core Identity (6 Metadata Variables)

Her kullanıcı kayıtta şu 6 değişkeni **Metadata Objesi** olarak sisteme girer:

- **Ülke, Şehir, Cinsiyet, Yaş, Meslek, Medeni Durum**

Bu değişkenler sistemin tüm katmanlarında "kullanıcıyı tanımlayan" tek veri kaynağıdır ve filtreleme/kıyaslama için kullanılır.

Firestore şeması:

```typescript
users/{userId}.metadata = {
  country, city, gender, age, profession, maritalStatus
}
```

## 2. Ranking Engine (Hiyerarşik Puanlama)

Sistem, etkileşim yoğunluğu ve aksiyon odaklı bir hiyerarşi ile çalışır.

### A. Gönderi Seviyesi (Post Score)

Bir gönderinin kendi viralliğini temsil eder:

- **Formül:** `(Beğeni - Beğenmeme) + (Paylaşım × 66) + (Kaydet × 66) + (Yorum × 33)`
- **Beğeni / beğenmeme:** Instagram tarzı toggle — kullanıcı başına gönderide en fazla bir beğeni veya bir beğenmeme; her ekleme/çıkarma ±1 puan

### B. Kullanıcı Seviyesi (Profile Total Score — TP)

Kullanıcının otoritesini belirleyen toplam değer:

- **Formül:** **Gönderi katkısı** + **profil oyları** (net). Negatif olabilir.
- **Gönderi katkısı:** Gönderi etkileşimleri (toggle beğeni/beğenmeme, paylaş, kaydet, yorum) → `postScore` ve yazar `totalScore` güncellemesi.
- **Profil oyları:** Profilde ↑ (+1) / ↓ (-1); oturumda birikir, `POST /api/profile-votes/batch` ile sunucuya gider. UI anında güncellenir.
- Firestore: `users/{userId}.totalScore` — yalnızca backend **atomic update**

### C. Sıralama Seviyesi (Ranking)

Kullanıcının TP’sinin, Metadata (6 değişken) grubundaki diğer kullanıcılara göre sıralaması.

- **Gün içi:** `rankings/.../entries` içindeki `rank` / `segmentTotal` yeniden hesaplanmaz; profilde **son geceki resmi sıra** görünür.
- **Gece:** Her gün **00:00 Europe/Istanbul** — `npm run rebuild-rankings` ile snapshot (`rank` + `segmentTotal` her entry’de).
- **Kayıt sonrası:** `POST /api/profile/ensure-ranking-entries` — eksik entry ve `rank` alanları tamamlanır; profil accordion `#sıra / toplam` gösterir.
- **Fallback:** Resmi `rank` yoksa mobil segmentte TP’ye göre tahmini sıra (`~#`) gösterir.
- TP anlıktır; resmi sıra gece job ile tam senkronize olur.

## 3. Discovery & Filtering (Keşfet)

- 6 Metadata değişkeni üzerinden segmentasyon yapılır.
- Akış, seçilen segmentteki kullanıcıların **Gönderi Puanı** ve **Etkileşim Yoğunluğu**na göre sıralanır.
- Profil ve Keşfet sayfaları, kullanıcının 6 metadata değişkeni olmadan çalışamaz.

## 4. Architectural Flow

```
Etkileşim → Backend API → Database Update → Profil & Keşfet Güncellenmesi
```

- `interactions/{id}` — immutable event log
- `posts/{postId}` — postScore, sayaçlar
- `users/{userId}.totalScore` — her gönderi etkileşiminde atomic güncelleme (backend transaction)
- Ranking Engine **client'ta değil**, Express backend üzerinde çalışır

## 5. Puanlama Sabitleri

| Sabit | Değer |
|-------|-------|
| SHARE_POINTS | 66 |
| SAVE_POINTS | 66 |
| COMMENT_POINTS | 33 |

Kaynak: `myrankapp/src/config/scoring.js`, `myrank-mobile/src/features/ranking/constants.ts`

## 6. Kod Review Checklist

- [ ] 6 metadata her filtre/sıralama sorgusunun temeli
- [ ] Post Score formülü manifestodaki gibi
- [ ] totalScore yalnızca backend atomic güncelleme ile değişir
- [ ] Profil/Kesfet metadata tamamlanmadan render edilmez
