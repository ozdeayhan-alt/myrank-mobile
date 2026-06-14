import { View } from "react-native";
import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";
import { ui } from "@/lib/uiClasses";

/** FlashList layout stability için sabit yaklaşık satır yüksekliği */
export const FEED_ROW_ESTIMATE_HEIGHT = 420;

type FeedPostSkeletonProps = {
  count?: number;
};

function FeedPostSkeletonRow() {
  return (
    <View className={`${ui.postCard} mb-4 overflow-hidden`}>
      <View className="flex-row items-center px-4 pb-2.5 pt-3.5">
        <ShimmerSkeleton width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <ShimmerSkeleton width="55%" height={14} borderRadius={6} />
          <View className="mt-2">
            <ShimmerSkeleton width="35%" height={10} borderRadius={4} />
          </View>
        </View>
        <ShimmerSkeleton width={48} height={24} borderRadius={12} />
      </View>

      <View className="px-4 pb-3">
        <ShimmerSkeleton width="92%" height={12} borderRadius={4} />
        <View className="mt-2">
          <ShimmerSkeleton width="78%" height={12} borderRadius={4} />
        </View>
      </View>

      <ShimmerSkeleton width="100%" height={220} borderRadius={0} />

      <View className="flex-row justify-between px-4 py-3">
        <ShimmerSkeleton width={36} height={20} borderRadius={6} />
        <ShimmerSkeleton width={36} height={20} borderRadius={6} />
        <ShimmerSkeleton width={36} height={20} borderRadius={6} />
        <ShimmerSkeleton width={36} height={20} borderRadius={6} />
        <ShimmerSkeleton width={36} height={20} borderRadius={6} />
      </View>
    </View>
  );
}

export function FeedPostSkeleton({ count = 3 }: FeedPostSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <FeedPostSkeletonRow key={index} />
      ))}
    </View>
  );
}
