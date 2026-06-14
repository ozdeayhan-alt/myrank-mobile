export type LegalSection = {
  title?: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Gizlilik Politikası",
  updatedAt: "10 Haziran 2026",
  sections: [
    {
      paragraphs: [
        "MyRank (“uygulama”), kullanıcıların profil bilgileri ve paylaşımları üzerinden sıralama ve keşif deneyimi sunan bir sosyal platformdur. Bu politika, hangi verileri topladığımızı ve nasıl kullandığımızı açıklar.",
      ],
    },
    {
      title: "Topladığımız veriler",
      paragraphs: [
        "Hesap bilgileri: e-posta adresi ve şifre (Firebase Authentication üzerinde saklanır).",
        "Profil bilgileri: ad, profil fotoğrafı, biyografi ve kayıt sırasında girdiğiniz metadata (ülke, şehir, cinsiyet, yaş, meslek, medeni durum).",
        "İçerik: gönderiler, yorumlar, mesajlar ve yüklediğiniz fotoğraf/video dosyaları.",
        "Etkileşim verileri: beğeni, beğenmeme, paylaşım, kaydetme, profil oyları ve takip ilişkileri.",
        "Teknik veriler: push bildirim token’ı ve cihaz platformu (iOS/Android).",
      ],
    },
    {
      title: "Verilerin kullanım amacı",
      paragraphs: [
        "Hesabınızı oluşturmak ve oturum açmanızı sağlamak.",
        "Profil, sıralama ve keşfet özelliklerini sunmak.",
        "Kullanıcılar arası mesajlaşmayı ve bildirimleri iletmek.",
        "Uygunsuz içerik şikayetlerini almak ve moderasyon süreçlerini yürütmek.",
        "Hizmet güvenliğini sağlamak ve kötüye kullanımı önlemek.",
      ],
    },
    {
      title: "Veri paylaşımı",
      paragraphs: [
        "Profil bilgileriniz ve paylaşımlarınız, uygulamaya giriş yapmış diğer kullanıcılar tarafından görülebilir.",
        "Altyapı hizmetleri için Google Firebase (kimlik doğrulama, veritabanı, depolama) ve Expo Push Notification servisleri kullanılır.",
        "Yasal zorunluluklar dışında verilerinizi üçüncü taraflara satmayız.",
      ],
    },
    {
      title: "Saklama ve silme",
      paragraphs: [
        "Hesabınız aktif olduğu sürece verileriniz saklanır.",
        "Hesabınızı uygulama içinden sildiğinizde profil, gönderi, mesaj ve ilişkili veriler kalıcı olarak silinmeye çalışılır.",
        "Silme işlemi tamamlandıktan sonra geri alınamaz.",
      ],
    },
    {
      title: "Haklarınız",
      paragraphs: [
        "6698 sayılı KVKK kapsamında verilerinize erişme, düzeltme ve silme talebinde bulunma hakkına sahipsiniz.",
        "Hesap silme işlemini uygulama menüsünden başlatabilirsiniz.",
      ],
    },
    {
      title: "İletişim",
      paragraphs: [
        "Gizlilik ile ilgili sorularınız için uygulama içi destek kanallarımızı kullanabilirsiniz.",
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Kullanım Koşulları",
  updatedAt: "10 Haziran 2026",
  sections: [
    {
      paragraphs: [
        "MyRank uygulamasını kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız uygulamayı kullanmayın.",
      ],
    },
    {
      title: "Uygunluk",
      paragraphs: [
        "Uygulamayı kullanmak için en az 18 yaşında olmalısınız.",
        "Kayıt sırasında doğru ve güncel bilgi vermeyi kabul edersiniz.",
      ],
    },
    {
      title: "Kullanıcı içeriği",
      paragraphs: [
        "Paylaştığınız içeriklerden yalnızca siz sorumlusunuz.",
        "Yasa dışı, nefret söylemi, taciz, spam, müstehcen veya telif hakkı ihlali içeren içerik paylaşamazsınız.",
        "Diğer kullanıcıları engelleyebilir ve uygunsuz içerikleri şikayet edebilirsiniz.",
      ],
    },
    {
      title: "Sıralama sistemi",
      paragraphs: [
        "MyRank, etkileşim ve profil oylarına dayalı bir sıralama sistemi kullanır.",
        "Sıralama sonuçları bilgilendirme amaçlıdır; herhangi bir hukuki veya maddi hak doğurmaz.",
        "Manipülasyon, sahte hesap veya otomatik etkileşim yasaktır.",
      ],
    },
    {
      title: "Hesap güvenliği",
      paragraphs: [
        "Hesap bilgilerinizin gizliliğinden siz sorumlusunuz.",
        "Şüpheli aktivite fark ederseniz şifrenizi değiştirin ve destekle iletişime geçin.",
      ],
    },
    {
      title: "Hesap askıya alma ve silme",
      paragraphs: [
        "Koşulları ihlal eden hesaplar uyarı verilmeksizin askıya alınabilir veya silinebilir.",
        "İstediğiniz zaman uygulama içinden hesabınızı silebilirsiniz.",
      ],
    },
    {
      title: "Sorumluluk sınırı",
      paragraphs: [
        "Uygulama “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışacağı garanti edilmez.",
        "Kullanıcılar arası etkileşimlerden doğan uyuşmazlıklarda MyRank aracı konumundadır.",
      ],
    },
  ],
};

export const MODERATION_POLICY: LegalDocument = {
  title: "İçerik ve Moderasyon",
  updatedAt: "10 Haziran 2026",
  sections: [
    {
      paragraphs: [
        "MyRank, güvenli bir topluluk ortamı sağlamak için kullanıcı bildirimlerine dayalı moderasyon uygular.",
      ],
    },
    {
      title: "Şikayet etme",
      paragraphs: [
        "Gönderi ve profil menülerinden “Şikayet et” seçeneğiyle içerik bildirebilirsiniz.",
        "Spam, taciz, uygunsuz içerik ve diğer nedenler arasından seçim yapabilirsiniz.",
      ],
    },
    {
      title: "Engelleme",
      paragraphs: [
        "İstemediğiniz kullanıcıları engelleyebilirsiniz. Engellediğiniz kişilerle mesajlaşma ve etkileşim kısıtlanır.",
      ],
    },
    {
      title: "Moderasyon süreci",
      paragraphs: [
        "Şikayetler incelenir; ihlal tespit edilen içerik veya hesaplar kaldırılabilir.",
        "Tekrarlayan ihlallerde hesap kalıcı olarak kapatılabilir.",
      ],
    },
    {
      title: "Destek",
      paragraphs: [
        "Moderasyon kararları veya güvenlik endişeleri için uygulama içi destek kanallarımızdan bize ulaşabilirsiniz.",
      ],
    },
  ],
};
