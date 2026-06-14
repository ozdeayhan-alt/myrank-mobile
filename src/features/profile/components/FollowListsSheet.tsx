import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { fetchFollowersList } from "@/features/profile/api/fetchFollowersList";
import { fetchFollowingList } from "@/features/profile/api/fetchFollowingList";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import type { FollowCounts, FollowUserSummary } from "@/features/profile/types/followLists";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import {
  FollowListColumn,
  type FollowListColumnState,
} from "./FollowListColumn";

type FollowListsSheetProps = {
  visible: boolean;
  counts: FollowCounts;
  onClose: () => void;
};

const EMPTY_COLUMN: FollowListColumnState = {
  loaded: false,
  loading: false,
  users: [],
  nextCursor: null,
};

export function FollowListsSheet({
  visible,
  counts,
  onClose,
}: FollowListsSheetProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState<FollowListColumnState>(EMPTY_COLUMN);
  const [followers, setFollowers] = useState<FollowListColumnState>(EMPTY_COLUMN);
  const followingRef = useRef(following);
  const followersRef = useRef(followers);

  followingRef.current = following;
  followersRef.current = followers;

  useEffect(() => {
    if (!visible) {
      setFollowing(EMPTY_COLUMN);
      setFollowers(EMPTY_COLUMN);
    }
  }, [visible]);

  const loadFollowing = useCallback(async () => {
    const prev = followingRef.current;
    if (prev.loading || (prev.loaded && !prev.nextCursor)) {
      return;
    }

    setFollowing({ ...prev, loading: true });
    try {
      const result = await fetchFollowingList({
        cursor: prev.loaded ? prev.nextCursor : null,
      });
      setFollowing({
        loaded: true,
        loading: false,
        users: prev.loaded ? [...prev.users, ...result.users] : result.users,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      setFollowing({ ...prev, loading: false });
      Alert.alert("Takip edilenler", getUserFacingErrorMessage(error));
    }
  }, []);

  const loadFollowers = useCallback(async () => {
    const prev = followersRef.current;
    if (prev.loading || (prev.loaded && !prev.nextCursor)) {
      return;
    }

    setFollowers({ ...prev, loading: true });
    try {
      const result = await fetchFollowersList({
        cursor: prev.loaded ? prev.nextCursor : null,
      });
      setFollowers({
        loaded: true,
        loading: false,
        users: prev.loaded ? [...prev.users, ...result.users] : result.users,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      setFollowers({ ...prev, loading: false });
      Alert.alert("Takipçiler", getUserFacingErrorMessage(error));
    }
  }, []);

  const handleUserPress = useCallback(
    (entry: FollowUserSummary) => {
      onClose();
      navigateToAuthorProfile(entry.userId, user?.uid, {
        displayName: entry.displayName,
        photoURL: entry.photoURL ?? undefined,
      });
    },
    [onClose, user?.uid]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <SafeAreaView
          edges={["bottom"]}
          className="overflow-hidden rounded-t-3xl bg-white"
          style={{ maxHeight: "72%" }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
            <Text className="text-lg font-bold text-gray-900">Takiplerim</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <View className="min-h-[320px] flex-row">
            <FollowListColumn
              title="Takip Edilenler"
              count={counts.followingCount}
              state={following}
              emptyHint="Listeyi görmek için dokun"
              listEmptyText="Henüz kimseyi takip etmiyorsun."
              onLoad={() => void loadFollowing()}
              onUserPress={handleUserPress}
            />
            <FollowListColumn
              title="Takip Edenler"
              count={counts.followersCount}
              state={followers}
              emptyHint="Listeyi görmek için dokun"
              listEmptyText="Henüz takipçin yok."
              onLoad={() => void loadFollowers()}
              onUserPress={handleUserPress}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
