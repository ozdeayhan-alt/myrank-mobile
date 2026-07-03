# Engineering Backlog

> **Tek kaynak:** Tüm PR, bug, teknik borç ve production işleri bu dosyada takip edilir.  
> Son güncelleme: 2026-07-02 (PH-003 completed)

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
  - `src/features/feed-v2/renderers/flow/FlowTeaserRow.tsx`
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
  **Notes:** `PlayerPool` released player için try/catch kullanıyor; legacy `useReelRowPlayback` (`parkAdjacentPlayer`, timer callback) korumasız. PlayerPool kapalı veya `ReelsTabFeed` path'inde native crash riski. Mevcut `safePausePlayer` pattern'i paylaşılmalı.

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

### PH-006 · PlayerPool Park Timer Effect Cleanup

- [ ] **PH-006** PlayerPool Park Timer Effect Cleanup  
  **Priority:** Medium  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/feed-v2/renderers/flow/player/PlayerPool.tsx`
  **Notes:** `PooledPlayer` useEffect cleanup yalnızca `generationRef` artırıyor; `parkTimerRef` post/mode değişiminde temizlenmeyebilir. Unmount'da layout effect temizliyor; effect cleanup'a `clearParkTimer()` eklenmeli.

---

### PH-007 · Modal Reel Preload Async Guard

- [ ] **PH-007** Modal Reel Preload Async Guard  
  **Priority:** Medium  
  **Status:** Planned  
  **Risk:** Low  
  **Files:**
  - `src/features/posts/hooks/useVideoReelsPlayback.ts`
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
  **Notes:** Feed inline video ve chat bubble'da `play`/`pause` try/catch yok; FlashList recycle'da released player exception ve kısa arka plan audio riski. PlayerPool defensive pattern uygulanmalı.

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
  - **Özet:** Logout ve hesap silme path'lerinde merkezi `resetAppSessionState()` eklendi; tüm session store'ları, Flow state, React Query in-memory + persisted cache ve gauge debounce timer'ları temizleniyor.
  - **Değişen dosyalar:** `resetAppSessionState.ts`, `AuthContext.tsx`, `gaugeVoteModeStorage.ts`
  - **PR:** — *(local)*

---

### PH-003 · Flow Session Cleanup on Navigation

- [x] **PH-003** Flow Session Cleanup on Navigation  
  **Priority:** High  
  **Status:** Completed  
  **Risk:** Low  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowNavigator.ts`
  - `src/features/profile/navigateToAuthorProfile.ts`
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/explore.tsx`
  - `src/features/profile/components/ProfileContent.tsx`
  - `src/lib/resetAppSessionState.ts`
  **Notes:**
  - **Tarih:** 2026-07-02
  - **Özet:** `closeFlow()` artık `activeIndex` dahil tam session teardown yapıyor; profil navigasyonu, tab press ve filter değişimi çıkış yolları tek helper'a taşındı.
  - **Değişen dosyalar:** `FlowNavigator.ts`, `navigateToAuthorProfile.ts`, `index.tsx`, `explore.tsx`, `ProfileContent.tsx`, `resetAppSessionState.ts`
  - **PR:** — *(local)*

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
  **Notes:** Type-specific row renderers (Whisp, Glow, Flow Teaser, Repost), `FeedScroller`, `useHomeFeedEngine`. Feature flag: `EXPO_PUBLIC_FEED_V2`.

---

### COMP-002 · PlayerPool (3-Slot Video)

- [x] **COMP-002** PlayerPool (3-Slot Video)  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/flow/player/PlayerPool.tsx`
  - `src/features/feed-v2/renderers/flow/FlowRowSurface.tsx`
  - `src/features/feed-v2/renderers/flow/FlowPager.tsx`
  **Notes:** A/B/C slot pooling, `replaceAsync`, generation counter, `isBoundPlayer`, `safePausePlayer`. Flag: `EXPO_PUBLIC_FEED_V2_PLAYER_POOL`.

---

### COMP-003 · Flow Crash Fix

- [x] **COMP-003** Flow Crash Fix  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowPager.tsx`
  - `src/features/feed-v2/renderers/flow/player/PlayerPool.tsx`
  **Notes:** Flow açılış/kapanış ve scroll lock sırasında native crash'ler giderildi; focus gating ve scroll timeout cleanup.

---

### COMP-004 · Poster First Frame Render

- [x] **COMP-004** Poster First Frame Render  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowRowSurface.tsx`
  **Notes:** `readyToPlay` ≠ first frame painted; poster `onFirstFrameRender` ile kaldırılıyor. Siyah flash / erken poster kaldırma düzeltildi.

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

### COMP-006 · Released Player Fix (PlayerPool)

- [x] **COMP-006** Released Player Fix (PlayerPool)  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/flow/player/PlayerPool.tsx`
  - `src/features/posts/utils/videoReelsPlayerUtils.ts`
  **Notes:** Slot reuse sonrası released `VideoPlayer` erişiminde try/catch guard'lar; async `replaceWithSourceFallback` generation iptali.

---

### COMP-007 · Flow Black Screen Fix

- [x] **COMP-007** Flow Black Screen Fix  
  **Priority:** —  
  **Status:** Completed  
  **Risk:** —  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowRowSurface.tsx`
  - `src/features/feed-v2/renderers/flow/FlowPager.tsx`
  **Notes:** Android surface policy (yalnızca active row `VideoView`), poster fallback, load failure UI. Adjacent satırlarda poster preload.

---

# Blocked

Başka bir bug veya bağımlılık yüzünden bekleyen işler.

*(Boş.)*

---

# Someday

İleride değerlendirilecek fikirler — şimdilik planlanmamış.

### DEBT-001 · Flow / Reels Dual Implementation Consolidation

- [ ] **DEBT-001** Flow / Reels Dual Implementation Consolidation  
  **Priority:** Low  
  **Status:** Someday  
  **Risk:** Medium  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowPager.tsx`
  - `src/features/posts/components/ReelsTabFeed.tsx`
  **Notes:** ~600 satır paralel implementasyon; explore/profile hâlâ legacy path. Tam migration sonrası birleştirme değerlendirilebilir. Production hardening kapsamı dışı.

---

### DEBT-002 · Triple Flow Store Migration Completion

- [ ] **DEBT-002** Triple Flow Store Migration Completion  
  **Priority:** Low  
  **Status:** Someday  
  **Risk:** Medium  
  **Files:**
  - `src/features/feed-v2/renderers/flow/FlowSession.ts`
  - `src/features/posts/store/useReelsNavigationStore.ts`
  - `src/features/posts/store/useHomeFeedContentStore.ts`
  **Notes:** `useFlowSessionStore` + legacy stores senkron tutuluyor. Tam migration ile tek kaynak; PH-003 sonrası değerlendir.

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
| PH-003 | Flow Session Cleanup on Navigation | High | Low |
| PH-004 | Legacy Reel Safe Player Operations | High | Low |
| PH-005 | Background Polling Pause | Medium | Low |
| PH-006 | PlayerPool Timer Cleanup | Medium | Low |
| PH-007 | Modal Reel Preload Guard | Medium | Low |
| PH-008 | Inline & Chat Video Lifecycle | Medium | Low |
| PH-009 | Glow URI Cache Cap | Low | Low |
| PH-010 | Logout Timer Cleanup | Low | Low |
