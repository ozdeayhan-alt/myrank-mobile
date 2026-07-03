# myrank-mobile

MyRank iOS/Android uygulaması — Expo Router, React Native, Feed V2 + Reels mimarisi.

## Gereksinimler

- Node.js 18+
- npm veya yarn
- Android Studio / Xcode (native build için)

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npx expo start
```

Preview APK build kuralları için `.cursor/rules/preview-build.mdc` ve `AGENTS.md` dosyalarına bakın.

---

## Development Workflow

### Engineering Backlog

Tüm teknik işler **[BACKLOG.md](./BACKLOG.md)** üzerinden yönetilir.

| Kural | Açıklama |
|-------|----------|
| Yeni iş | Her yeni PR, bug, teknik borç veya production maddesi önce `BACKLOG.md`'ye eklenir |
| PR sonrası | Her PR merge edildiğinde ilgili madde güncellenir (durum, notlar) |
| Bug → Blocked | Bir iş başka bir bug yüzünden bekliyorsa **Blocked** bölümüne taşınır |
| Bug çözüldü | Engel kalkınca madde **Active** veya **Planned**'a geri alınır |
| Tek kaynak | Hiçbir teknik iş backlog dışında tutulmaz |

### Backlog bölümleri

- **Active** — şu an üzerinde çalışılan
- **Planned** — sıradaki (öncelik sırasına göre)
- **Completed** — tamamlanan milestone ve PR'lar
- **Blocked** — bağımlılık/bug nedeniyle bekleyen
- **Someday** — ileride değerlendirilecek fikirler

### ID önekleri

`PH` Production Hardening · `FEAT` Feature · `BUG` Bug · `DEBT` Technical Debt · `COMP` Completed milestone

### Örnek akış

1. Production hardening maddesi `Planned`'da `PH-00X` olarak tanımlanır
2. PR açılınca madde **Active**'e taşınır
3. Merge sonrası checkbox işaretlenir, **Completed**'a taşınır ve PR linki notlara eklenir
4. Yeni bulunan bug ilgili maddeyi **Blocked**'a alır; fix merge edilince devam edilir

---

## İlgili dokümanlar

- [BACKLOG.md](./BACKLOG.md) — mühendislik iş takibi
- [AGENTS.md](./AGENTS.md) — agent / Expo sürüm notları
