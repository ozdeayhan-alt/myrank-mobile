import { Pressable, Text, View } from "react-native";
import { CONTENT_TYPE_LABELS } from "@/features/posts/constants/contentTypeLabels";
import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";
import type { HomeContentFilter } from "@/features/posts/utils/filterPostsByContentType";

const OPTIONS: { id: HomeContentFilter; label: string }[] = [
  { id: "tweet", label: CONTENT_TYPE_LABELS.tweet },
  { id: "image", label: CONTENT_TYPE_LABELS.image },
  { id: "video", label: CONTENT_TYPE_LABELS.video },
];

type HomeFeedContentFilterProps = {
  contentFilter: HomeFeedContentFilter;
  onContentFilterChange: (filter: HomeFeedContentFilter) => void;
};

export function HomeFeedContentFilter({
  contentFilter,
  onContentFilterChange,
}: HomeFeedContentFilterProps) {
  return (
    <View className="mb-4 flex-row rounded-full border border-gray-200 bg-gray-100/80 p-1">
      {OPTIONS.map((option) => {
        const selected = contentFilter === option.id;

        return (
          <Pressable
            key={option.id}
            onPress={() =>
              onContentFilterChange(selected ? null : option.id)
            }
            className={`flex-1 items-center rounded-full py-2.5 ${
              selected ? "bg-white shadow-sm" : ""
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
