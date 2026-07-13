# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Product: self-vote (core loop)

MyRank'ın temel mekaniği **kendi kendine oy vermektir**. Kullanıcı sınırsız şekilde:

- Kendi profil TP'sine (↑/↓ profil oyları)
- Kendi gönderilerine
- Kendi story'lerine

oy verebilir. Self-vote yasak değildir; ürünün ana döngüsüdür.

Backend: `assertNotSelfVote` kaldırıldı. Profil self-vote için vote rate limit atlanır; diğer vote batch'leri yüksek limit (varsayılan 1200/dk) ile korunur.
