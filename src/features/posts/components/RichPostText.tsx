import { useCallback, useMemo } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import { searchUsers } from "@/features/search";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { splitPostContent } from "../utils/parsePostContent";

type RichPostTextProps = {
  content: string;
  className?: string;
  currentUserId?: string | null;
};

export function RichPostText({
  content,
  className = "text-sm text-gray-800",
  currentUserId = null,
}: RichPostTextProps) {
  const router = useRouter();
  const safeContent = typeof content === "string" ? content : "";
  const segments = useMemo(
    () => splitPostContent(safeContent),
    [safeContent]
  );

  const openHashtag = useCallback(
    (tag: string) => {
      router.push({
        pathname: "/hashtag/[tag]",
        params: { tag },
      });
    },
    [router]
  );

  const openMention = useCallback(
    async (token: string) => {
      try {
        const result = await searchUsers(token);
        const exact = result.users.find(
          (entry) =>
            entry.displayName.trim().toLocaleLowerCase("tr-TR") ===
            token.toLocaleLowerCase("tr-TR")
        );
        const target = exact ?? result.users[0];
        if (!target) return;
        navigateToAuthorProfile(target.userId, currentUserId ?? undefined, {
          displayName: target.displayName,
          photoURL: target.photoURL ?? undefined,
        });
      } catch {
        // non-blocking
      }
    },
    [currentUserId]
  );

  return (
    <Text className={className}>
      {segments.map((segment, index) => {
        if (segment.kind === "text") {
          return <Text key={`t-${index}`}>{segment.value}</Text>;
        }

        if (segment.kind === "hashtag") {
          return (
            <Text
              key={`h-${index}`}
              className="font-semibold text-blue-600"
              onPress={() => openHashtag(segment.tag)}
            >
              {segment.value}
            </Text>
          );
        }

        return (
          <Text
            key={`m-${index}`}
            className="font-semibold text-blue-600"
            onPress={() => void openMention(segment.token)}
          >
            {segment.value}
          </Text>
        );
      })}
    </Text>
  );
}
