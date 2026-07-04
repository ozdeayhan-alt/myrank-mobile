# Engineering Backlog

> **Tek kaynak:** Tüm PR, bug, teknik borç ve production işleri bu dosyada takip edilir.  
> Son güncelleme: 2026-07-04 (Flow/video artık kod temizliği)

---

## Nasıl kullanılır

1. Yeni iş → uygun bölüme ekle, benzersiz ID ver (`PH-`, `BUG-`, `DEBT-`, …).
2. PR başladığında → **Planned** → **Active**.
3. PR merge → checkbox işaretle, **Completed**'a taşı, PR linkini **Notes**'a yaz.
4. Engel varsa → **Blocked**; çözülünce **Active** veya **Planned**'a geri al.
5. Belirsiz / uzun vadeli fikirler → **Someday**.

**Öncelik:** Critical · High · Medium · Low  
**Risk:** PR'nin regresyon / yan etki tahmini (Low / Medium / High)

---

# Active

Şu anda üzerinde çalışılan işler.

*(Boş.)*

---

# Planned

Sıradaki işler — üstten alta öncelik sırası.

### PH-002 · Feed V2 Visibility Wiring

- [ ] **PH-002** Feed V2 Visibility Wiring  
  **Priority:** High  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/feed-v2/renderers/glow/GlowRow.tsx`
  **Notes:** `FeedScroller` görünürlüğü `feedScrollVisibilityStore`'a yazıyor; V2 satırlar `FeedVisiblePostsContext` okuyor (provider yok → `mediaHighPriority` her zaman false). Import'u external store hook'una çevir; UI değişmez, yalnızca `expo-image` priority hint düzelir.

---

### PH-005 · Background Polling Pause (Messages)

- [ ] **PH-005** Background Polling Pause (Messages)  
  **Priority:** Medium  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/messages/hooks/useInbox.ts`
  - `src/features/messages/hooks/useConversationMessages.ts`
  **Notes:** Inbox 45s, konuşma 8s interval — AppState `background` iken durmuyor. Foreground'a dönünce refetch zaten var; interval'i `active` dışında durdur. Batarya ve gereksiz API azaltır.

---

### PH-009 · Glow Image URI Cache Cap

- [ ] **PH-009** Glow Image URI Cache Cap  
  **Priority:** Low  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/feed-v2/renderers/glow/GlowImageFrame.tsx`
  **Notes:** Modül-level `loadedGlowUris` Set sınırsız büyür. LRU veya max entry (ör. 500) ile sınırla. Worst-case geçici shimmer tekrarı.

---

### PH-010 · Logout Debounced Storage Timer Cleanup

- [ ] **PH-010** Logout Debounced Storage Timer Cleanup  
  **Priority:** Low  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/profile/lib/gaugeVoteModeStorage.ts`
  - `src/lib/resetAppSessionState.ts` *(PH-001 ile birlikte)*
  **Notes:** `pendingTimers` Map logout'ta temizlenmiyor; signOut sonrası önceki kullanıcının gauge mode'u AsyncStorage'a yazılabilir. PH-001'e merge edilebilir.

---

# Completed

Tamamlanan milestone'lar ve merge edilmiş PR'lar.

### PH-001 · Production Session Reset

- [x] **PH-001** Production Session Reset  
  **Priority:** Critical  
  **Status:** Completed  
  **Risk:** Low  
  **Files:**
  - `src/lib/resetAppSessionState.ts` *(yeni)*
  - `src/features/auth/context/AuthContext.tsx`
  - `src/features/profile/lib/gaugeVoteModeStorage.ts`
  **Notes:**
  - **Tarih:** 2026-07-02
  - **Özet:** Logout ve hesap silme path'lerinde merkezi `resetAppSessionState()` eklendi; session store'ları, React Query in-memory + persisted cache ve gauge debounce timer'ları temizleniyor.

---

### COMP-001 · Feed V2 Architecture

- [x] **COMP-001** Feed V2 Architecture  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/**`
  - `app/(tabs)/index.tsx`
  - `src/lib/featureFlags/feedFlags.ts`
  **Notes:** Type-specific row renderers (Whisp, Glow, Repost), `FeedScroller`, `useHomeFeedEngine`. Feature flag: `EXPO_PUBLIC_FEED_V2`.

---

### COMP-008 · Flow / Video Feature Removal

- [x] **COMP-008** Flow / Video Feature Removal  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Notes:** Flow (video) özelliği tamamen kaldırıldı. Transcode pipeline, reels player, video upload UI ve ilgili artık kodlar temizlendi. Eski `contentType: video` postları feed'den filtrelenmeye devam eder.

---

### COMP-005 · Whisp Dynamic Height

- [x] **COMP-005** Whisp Dynamic Height  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/whisp/WhispRow.tsx`
  - `src/features/posts/utils/feedStreamLayout.ts`
  **Notes:** Metin/tweet satırları için dinamik yükseklik tahmini; FlashList layout stability korundu.

---

# Blocked

Başka bir bug veya bağımlılık yüzünden bekleyen işler.

*(Boş.)*

---

# Someday

İleride değerlendirilecek fikirler — şimdilik planlanmamış.

### DEBT-003 · Dead Visibility Autoplay Store API

- [ ] **DEBT-003** Dead Visibility Autoplay Store API  
  **Priority:** Low  
  **Status:** Someday  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/store/feedScrollVisibilityStore.ts`
  **Notes:** `updateFeedScrollAutoplay` kullanılmıyor; duplicate hook isimleri (Context vs external store). PH-002 sonrası temizlik.

---

### DEBT-004 · Feed V2 Rollout to Explore / Profile

- [ ] **DEBT-004** Feed V2 Rollout to Explore / Profile  
  **Priority:** Low  
  **Status:** Someday  
  **Risk:** High  
  **Files:**
  - `app/(tabs)/explore.tsx`
  - `src/features/profile/components/ProfileContent.tsx`
  **Notes:** Feed V2 yalnızca home'da. Explore/profile/saved/hashtag legacy `FeedFlashList`. Bilinçli kademeli rollout; ayrı feature epic.

---

## Özet tablo (Planned)

| ID | Başlık | Öncelik | Risk |
|----|--------|---------|------|
| PH-002 | Feed V2 Visibility Wiring | High | Low |
| PH-005 | Background Polling Pause | Medium | Low |
| PH-009 | Glow URI Cache Cap | Low | Low |
| PH-010 | Logout Timer Cleanup | Low | Low |
