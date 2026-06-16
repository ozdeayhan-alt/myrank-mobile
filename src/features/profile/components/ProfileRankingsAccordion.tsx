import { memo, useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { UserMetadata } from "../types";
import { ui } from "@/lib/uiClasses";
import { ensureRankingEntries } from "../api/ensureRankingEntries";
import {
  fetchRankingSnapshotMeta,
  formatOfficialRankUpdatedAt,
} from "../api/fetchRankingSnapshotMeta";
import { formatProfileRankingSentence } from "../utils/formatProfileRankingSentence";
import { useProfileRankings } from "../hooks/useProfileRankings";
import { ProfileExpandableCard } from "@/components/ProfileExpandableCard";

type ProfileRankingsAccordionProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile?: boolean;
};

function ProfileRankingsInfoNote({
  officialUpdatedLabel,
  isOwnProfile,
}: {
  officialUpdatedLabel: string | null;
  isOwnProfile: boolean;
}) {
  return (
    <View className="flex-row gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2">
      <Ionicons
        name="information-circle-outline"
        size={16}
        color="#9ca3af"
        style={{ marginTop: 1 }}
      />
      <View className="flex-1">
        <Text className="text-xs leading-5 text-gray-500">
          Resmi sıra her gece 00:00 (Türkiye) güncellenir; gün içinde gördüğünüz
          sıra son geceki listedir.
          {isOwnProfile ? " Toplam puanınız (TP) anlık değişir." : ""}
        </Text>
        {officialUpdatedLabel ? (
          <Text className="mt-1 text-xs leading-5 text-gray-600">
            Son resmi güncelleme: {officialUpdatedLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function ProfileRankingsAccordionInner({
  userId,
  metadata,
  isOwnProfile = false,
}: ProfileRankingsAccordionProps) {
  const [expanded, setExpanded] = useState(false);
  const [officialUpdatedLabel, setOfficialUpdatedLabel] = useState<string | null>(
    null
  );
  const [ensureWarning, setEnsureWarning] = useState<string | null>(null);
  const { rankings, loading, error, refresh } = useProfileRankings(
    userId,
    metadata,
    expanded
  );

  const loadSnapshotMeta = useCallback(async () => {
    try {
      const meta = await fetchRankingSnapshotMeta();
      setOfficialUpdatedLabel(formatOfficialRankUpdatedAt(meta.rebuiltAt));
    } catch {
      setOfficialUpdatedLabel(null);
    }
  }, []);

  const loadWithEnsure = useCallback(async () => {
    setEnsureWarning(null);
    if (isOwnProfile) {
      try {
        await ensureRankingEntries();
      } catch (err) {
        setEnsureWarning(
          err instanceof Error
            ? err.message
            : "Sıralama kaydı sunucuda oluşturulamadı"
        );
      }
    }
    await refresh();
    await loadSnapshotMeta();
  }, [isOwnProfile, refresh, loadSnapshotMeta]);

  useEffect(() => {
    if (expanded) {
      void loadWithEnsure();
    }
  }, [expanded, loadWithEnsure]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const title = isOwnProfile
    ? "Sıralamalarımı Görüntüle"
    : "Sıralamalarını Görüntüle";

  const hasAnyRank = rankings.some((item) => item.rank !== null);
  const allOfficial =
    rankings.length > 0 && rankings.every((item) => item.isOfficial);

  return (
    <ProfileExpandableCard
      title={title}
      expanded={expanded}
      onToggle={handleToggle}
      icon="podium-outline"
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator className="my-6" color="#374151" />
      ) : error ? (
        <View className="px-4 py-4">
          <Text className="text-sm text-red-700">{error}</Text>
          <Pressable
            className={`mt-3 ${ui.btnPrimarySm}`}
            onPress={() => void loadWithEnsure()}
          >
            <Text className={ui.btnPrimaryTextSm}>Tekrar dene</Text>
          </Pressable>
        </View>
      ) : rankings.length === 0 || !hasAnyRank ? (
        <View className="px-4 py-6">
          <Text className="text-center text-sm text-gray-500">
            Henüz resmi sıralama kaydı yok. Gece 00:00 güncellemesinden sonra
            veya profil kaydı tamamlandıktan sonra burada görünür.
          </Text>
          {isOwnProfile ? (
            <Pressable
              className={`mt-3 ${ui.btnPrimarySm}`}
              onPress={() => void loadWithEnsure()}
            >
              <Text className={ui.btnPrimaryTextSm}>
                Sıralama kaydını oluştur
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <>
          {!allOfficial ? (
            <Text className="border-b border-gray-50 px-4 py-2 text-center text-[10px] text-amber-700">
              Bazı kategorilerde gece job’u henüz işlenmedi; tahmini sıra
              gösteriliyor.
            </Text>
          ) : null}
          {ensureWarning ? (
            <Text className="border-b border-amber-50 px-4 py-2 text-center text-[10px] text-amber-800">
              {ensureWarning}
            </Text>
          ) : null}
          {rankings.map((item, index) => (
            <View
              key={item.key}
              className={`px-4 py-2.5 ${
                index < rankings.length - 1 ? "border-b border-gray-50" : ""
              }`}
            >
              <Text
                className={`text-sm leading-5 text-gray-900 ${
                  item.isOfficial ? "" : "text-gray-700"
                }`}
              >
                {formatProfileRankingSentence({
                  key: item.key,
                  metadata,
                  rank: item.rank,
                  isOfficial: item.isOfficial,
                  isOwnProfile,
                })}
              </Text>
            </View>
          ))}
        </>
      )}
      <ProfileRankingsInfoNote
        officialUpdatedLabel={officialUpdatedLabel}
        isOwnProfile={isOwnProfile}
      />
    </ProfileExpandableCard>
  );
}

export const ProfileRankingsAccordion = memo(ProfileRankingsAccordionInner);
