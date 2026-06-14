import { View } from "react-native";
import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";
import { FeedPostSkeleton } from "@/features/posts/components/FeedPostSkeleton";

export function ProfileLoadingSkeleton() {
  return (
    <View className="flex-1 bg-white px-6 pt-8">
      <View className="items-center">
        <ShimmerSkeleton width={108} height={108} borderRadius={54} />
        <View className="mt-4">
          <ShimmerSkeleton width={160} height={18} borderRadius={8} />
        </View>
        <View className="mt-2">
          <ShimmerSkeleton width={220} height={12} borderRadius={6} />
        </View>
      </View>

      <View className="mt-8">
        <ShimmerSkeleton width="100%" height={120} borderRadius={16} />
      </View>

      <View className="mt-6">
        <FeedPostSkeleton count={2} />
      </View>
    </View>
  );
}
