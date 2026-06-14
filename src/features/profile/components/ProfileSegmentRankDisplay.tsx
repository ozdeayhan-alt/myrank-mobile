import { memo } from "react";
import { View } from "react-native";

import {
  PROFILE_METRIC_CARD_MIN_HEIGHT,
  ProfileMetricCard,
} from "@/components/ProfileMetricCard";

type ProfileSegmentRankDisplayProps = {
  rank: number | null;
  loading?: boolean;
};

function ProfileSegmentRankDisplayInner({
  rank,
  loading = false,
}: ProfileSegmentRankDisplayProps) {
  return (
    <View
      className="flex-1"
      style={{ minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT }}
      collapsable={false}
    >
      <ProfileMetricCard
        label="Kendi Kategorilerindeki Sıran"
        value={rank !== null ? `#${rank}` : "—"}
        icon="trophy-outline"
        iconTheme="follow"
        loading={loading && rank === null}
      />
    </View>
  );
}

export const ProfileSegmentRankDisplay = memo(ProfileSegmentRankDisplayInner);
