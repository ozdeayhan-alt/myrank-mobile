import { memo, useMemo } from "react";
import { Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { PostScoreDisplay } from "@/features/posts/components/PostScoreDisplay";
import { PostVoteCirclePair } from "@/features/posts/components/PostVoteCirclePair";
import { FeedGlowImage } from "@/features/media/components/FeedGlowImage";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "@/features/posts/utils/resolvePostAuthor";

type DuelParticipantPanelProps = {
  post: Post;
  flex: number;
  onUp: () => void;
  onDown: () => void;
  disabled?: boolean;
  opponentScore?: number;
  showOpponentBadge?: boolean;
};

function DuelParticipantPanelInner({
  post,
  flex,
  onUp,
  onDown,
  disabled = false,
  opponentScore = 0,
  showOpponentBadge = false,
}: DuelParticipantPanelProps) {
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const initial = resolvePostAuthorInitial(post);
  const { fullUri, previewUri } = useMemo(
    () => resolveFeedMediaDisplayUrls(post),
    [post.id, post.mediaURL, post.thumbURL, post.contentType]
  );
  const imageUri = fullUri ?? previewUri;

  return (
    <View style={{ flex, minHeight: 0 }} className="overflow-hidden">
      <View className="relative flex-1 bg-gray-100">
        {imageUri ? (
          <FeedGlowImage
            uri={imageUri}
            recyclingKey={`duel-${post.id}`}
            priority="high"
          />
        ) : (
          <View className="flex-1 bg-neutral-200" />
        )}

        <View
          className="absolute left-0 right-0 top-0 flex-row items-center gap-2 px-3 py-2"
          style={{ backgroundColor: "rgba(255,255,255,0.82)" }}
        >
          <ProfileAvatar
            photoURL={photoURL}
            fallbackLetter={initial}
            size={32}
          />
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
              {displayName}
            </Text>
          </View>
          <PostScoreDisplay postId={post.id} initialScore={post.postScore} />
        </View>

        {showOpponentBadge && opponentScore > 0 ? (
          <View
            className="absolute bottom-3 right-3 rounded-full px-2 py-1"
            style={{ backgroundColor: "rgba(239,68,68,0.88)" }}
          >
            <Text className="text-xs font-bold text-white">
              Rakip +{opponentScore}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center justify-center gap-3 border-t border-gray-100 bg-white px-3 py-2">
        <PostVoteCirclePair
          onUp={onUp}
          onDown={onDown}
          disabled={disabled}
          voteDiameter={44}
        />
        <View className="items-center">
          <Text className="text-xs font-medium text-blue-600">▲ Yükselt</Text>
          <Text className="text-xs font-medium text-red-600">▼ Alçalt</Text>
        </View>
      </View>
    </View>
  );
}

export const DuelParticipantPanel = memo(DuelParticipantPanelInner);
