# Engineering Backlog

> **Tek kaynak:** Tüm PR, bug, teknik borç ve production işleri bu dosyada takip edilir.  
> Son güncelleme: 2026-07-03 (fullscreen video player removed)

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
  - `src/features/feed-v2/renderers/video/VideoTeaserRow.tsx`
  **Notes:** `FeedScroller` görünürlüğü `feedScrollVisibilityStore`'a yazıyor; V2 satırlar `FeedVisiblePostsContext` okuyor (provider yok → `mediaHighPriority` her zaman false). Import'u external store hook'una çevir; UI değişmez, yalnızca `expo-image` priority hint düzelir.

---

### PH-004 · Legacy Reel Safe Player Operations

- [ ] **PH-004** Legacy Reel Safe Player Operations  
  **Priority:** High  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/hooks/useReelRowPlayback.ts`
  - `src/features/posts/utils/videoReelsPlayerUtils.ts` *(opsiyonel — `safePausePlayer` export)*
  **Notes:** Legacy `useReelRowPlayback` (`parkAdjacentPlayer`, timer callback) released player korumasız; `ReelsTabFeed` path'inde native crash riski. `safePausePlayer` pattern paylaşılmalı.

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

### PH-007 · Reel Preload Async Guard

- [ ] **PH-007** Reel Preload Async Guard  
  **Priority:** Medium  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/hooks/useReelRowPlayback.ts`
  **Notes:** Preload effect'te `replaceWithSourceFallback` async iptali yok; hızlı scroll'da stale preload tamamlanabilir. Active-slot effect'teki `cancelled` / generation pattern preload'a da uygulanmalı.

---

### PH-008 · Inline & Chat Video Safe Lifecycle

- [ ] **PH-008** Inline & Chat Video Safe Lifecycle  
  **Priority:** Medium  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/components/PostFeedInlineVideo.tsx`
  - `src/features/messages/components/ChatBubble.tsx`
  **Notes:** Feed inline video ve chat bubble'da `play`/`pause` try/catch yok; FlashList recycle'da released player exception ve kısa arka plan audio riski. Reels defensive pattern uygulanmalı.

---

### PH-009 · Glow Image URI Cache Cap

- [ ] **PH-009** Glow Image URI Cache Cap  
  **Priority:** Low  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/feed-v2/renderers/glow/GlowImageFrame.tsx`
  **Notes:** Modül-level `loadedGlowUris` Set sınırsız büyür. LRU veya max entry (ör. 500, `storySeenStorage` pattern) ile sınırla. Worst-case geçici shimmer tekrarı.

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
  - **Özet:** Logout ve hesap silme path'lerinde merkezi `resetAppSessionState()` eklendi; tüm session store'ları, video reels state, React Query in-memory + persisted cache ve gauge debounce timer'ları temizleniyor.
  - **Değişen dosyalar:** `resetAppSessionState.ts`, `AuthContext.tsx`, `gaugeVoteModeStorage.ts`
  - **PR:** — *(local)*

---

### PH-003 · Video Reels Session Cleanup on Navigation

- [x] **PH-003** Video Reels Session Cleanup on Navigation  
  **Priority:** High  
  **Status:** Completed  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/store/useHomeFeedContentStore.ts`
  - `src/features/profile/navigateToAuthorProfile.ts`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/explore.tsx`
  - `src/features/profile/components/ProfileContent.tsx`
  - `src/lib/resetAppSessionState.ts`
  **Notes:**
  - **Tarih:** 2026-07-02 → 2026-07-03 (`closeVideoReels()` helper)
  - **Özet:** Profil navigasyonu, tab press ve filter değişimi çıkış yolları `closeVideoReels()` ile birleştirildi.

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
  **Notes:** Type-specific row renderers (Whisp, Glow, Video Teaser, Repost), `FeedScroller`, `useHomeFeedEngine`. Feature flag: `EXPO_PUBLIC_FEED_V2`.

---

### COMP-008 · Fullscreen Video Player Removal (baseline reset)

- [x] **COMP-008** Fullscreen Video Player Removal (baseline reset)  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:** *(removed — see git tag `flow/pre-removal-baseline` for last snapshot)*  
  **Notes:** Dedicated fullscreen player stack tamamen kaldırıldı. Video filtresi legacy `ReelsTabFeed` kullanıyor. Yeni video deneyimi sıfırdan tasarlanacak.

---

### COMP-003 · ~~Fullscreen player crash fixes~~ *(removed 2026-07-03)*

- [x] **COMP-003** — **removed** with COMP-008.

---

### COMP-004 · Poster First Frame Render *(legacy reels)*

- [x] **COMP-004** Poster First Frame Render  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/posts/components/ReelRow.tsx`
  **Notes:** Poster first-frame behavior retained in ReelsTabFeed path.

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

### COMP-006 · Released Player Fix *(ReelsTabFeed)*

- [x] **COMP-006** Released Player Fix  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/posts/hooks/useReelRowPlayback.ts`
  - `src/features/posts/utils/videoReelsPlayerUtils.ts`
  **Notes:** Slot reuse sonrası released `VideoPlayer` erişiminde try/catch guard'lar; async `replaceWithSourceFallback` generation iptali.

---

### COMP-007 · ~~Black screen fix~~ *(removed 2026-07-03)*

- [x] **COMP-007** — **removed** with COMP-008.

---

# Blocked

Başka bir bug veya bağımlılık yüzünden bekleyen işler.

*(Boş.)*

---

# Someday

İleride değerlendirilecek fikirler — şimdilik planlanmamış.

### DEBT-001 · Reels Consolidation (future video experience)

- [ ] **DEBT-001** Reels Consolidation (future video experience)  
  **Priority:** Low  
  **Status:** Someday  
  **Risk:** Medium  
  **Files:**
  - `src/features/posts/components/ReelsTabFeed.tsx`
  **Notes:** Yeni fullscreen video deneyimi sıfırdan tasarlanacak; mevcut `ReelsTabFeed` geçici baseline.

---

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
| PH-004 | Legacy Reel Safe Player Operations | High | Low |
| PH-005 | Background Polling Pause | Medium | Low |
| PH-007 | Reel Preload Guard | Medium | Low |
| PH-008 | Inline & Chat Video Lifecycle | Medium | Low |
| PH-009 | Glow URI Cache Cap | Low | Low |
| PH-010 | Logout Timer Cleanup | Low | Low |
