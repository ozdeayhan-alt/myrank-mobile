import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { VideoView } from "expo-video";
import { resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { useVideoReelsPlayback } from "../hooks/useVideoReelsPlayback";
import { indexOfVideoPost } from "../utils/videoPosts";
import type { Post } from "../types";
import { VideoReelOverlay } from "./VideoReelOverlay";
import { VideoReelPage } from "./VideoReelPage";

type VideoReelsViewerProps = {
  visible: boolean;
  videoPosts: Post[];
  initialPostId: string;
  onClose: () => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function VideoReelsViewer({
  visible,
  videoPosts,
  initialPostId,
  onClose,
  onScoreUpdate,
}: VideoReelsViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlashListRef<Post>>(null);
  const initialIndex = useMemo(() => {
    const index = indexOfVideoPost(videoPosts, initialPostId);
    return index >= 0 ? index : 0;
  }, [videoPosts, initialPostId]);
  const postIds = useMemo(() => videoPosts.map((post) => post.id), [videoPosts]);

  useIncrementalEngagement(
    postIds,
    visible ? `reels-viewer-${initialPostId}` : undefined
  );

  const playback = useVideoReelsPlayback({
    visible,
    videoPosts,
    initialIndex,
  });

  useEffect(() => {
    if (!visible) return;
    listRef.current?.scrollToIndex({
      index: initialIndex,
      animated: false,
    });
  }, [visible, initialIndex, initialPostId]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        playback.setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleClose = useCallback(() => {
    playback.pauseAll();
    onClose();
  }, [onClose, playback]);

  const renderPage = useCallback(
    () => <VideoReelPage width={width} height={height} />,
    [width, height]
  );

  const activePosterUri = useMemo(
    () =>
      playback.activePost
        ? resolveVideoPosterUrl(playback.activePost)
        : undefined,
    [playback.activePost]
  );

  if (videoPosts.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          {activePosterUri ? (
            <Image
              source={{ uri: activePosterUri }}
              style={{ ...StyleSheet.absoluteFillObject, zIndex: 8 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={playback.activePost?.id}
              priority="high"
            />
          ) : null}

          <Animated.View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              zIndex: 10,
              opacity: playback.videoOpacity,
            }}
          >
            <VideoView
              player={playback.activePlayer}
              style={{ width, height }}
              contentFit="cover"
              nativeControls={false}
            />
          </Animated.View>

          <FlashList
            ref={listRef}
            data={videoPosts}
            extraData={playback.activeIndex}
            keyExtractor={(item) => item.id}
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 15 }}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={height}
            snapToAlignment="start"
            disableIntervalMomentum
            initialScrollIndex={initialIndex}
            drawDistance={height * 2}
            onScroll={playback.onScroll}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onLoad={() => {
              listRef.current?.scrollToOffset({
                offset: height * initialIndex,
                animated: false,
              });
            }}
            renderItem={renderPage}
          />

          {playback.activePost ? (
            <VideoReelOverlay
              post={playback.activePost}
              onScoreUpdate={onScoreUpdate}
            />
          ) : null}

          <Pressable
            className="absolute right-4 z-30 rounded-full bg-black/40 px-3 py-2"
            style={{ top: insets.top + 8 }}
            onPress={handleClose}
            hitSlop={12}
          >
            <Text className="text-base font-semibold text-white">✕</Text>
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
