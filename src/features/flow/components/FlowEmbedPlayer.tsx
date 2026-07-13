import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type { Post } from "@/features/posts/types";
import { FLOW_CARD_ASPECT_RATIO } from "../constants";
import { buildEmbedUrlForPost } from "../providers/registry";
import {
  buildFlowPlayerActiveScript,
  buildFlowPlayerLoadVideoScript,
  buildFlowWebViewSource,
  shouldLoadEmbedDirectly,
} from "../utils/flowWebViewEmbed";
import { FlowPlayerSlate } from "./FlowPlayerSlate";

type FlowEmbedPlayerProps = {
  post: Post;
  /** When true, fills parent instead of fixed 9:16 letterbox height. */
  fill?: boolean;
  /**
   * Active = audible playback. Inactive = muted + paused (preload / keep-alive).
   * Defaults to true for single-player usage.
   */
  active?: boolean;
  onReadyChange?: (ready: boolean) => void;
};

export const FlowEmbedPlayer = memo(function FlowEmbedPlayer({
  post,
  fill = false,
  active = true,
  onReadyChange,
}: FlowEmbedPlayerProps) {
  const webRef = useRef<WebView>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const provider = post.provider;
  const providerVideoId = post.providerVideoId;
  const initialVideoIdRef = useRef(providerVideoId);
  const loadedVideoIdRef = useRef<string | undefined>(undefined);
  const activeRef = useRef(active);
  activeRef.current = active;

  const isControllableDetail =
    fill && provider === "youtube" && Boolean(providerVideoId);

  const useDirectEmbed = shouldLoadEmbedDirectly(provider);

  const embedUrl = useMemo(
    () =>
      buildEmbedUrlForPost(
        { provider, providerVideoId },
        {
          autoplay: true,
          controls: false,
          muted: true,
        }
      ),
    [provider, providerVideoId]
  );

  const sizedWidth = layout.width;
  const sizedHeight = fill
    ? layout.height
    : sizedWidth > 0
      ? Math.round(sizedWidth / FLOW_CARD_ASPECT_RATIO)
      : 0;

  const webViewSource = useMemo(() => {
    if (!embedUrl) {
      return null;
    }
    if (useDirectEmbed) {
      return { uri: embedUrl };
    }
    return buildFlowWebViewSource(embedUrl, {
      fit: fill ? "contain" : undefined,
      containerWidth: sizedWidth,
      containerHeight: sizedHeight,
      controllable: isControllableDetail,
      videoId: initialVideoIdRef.current ?? providerVideoId,
      autoplay: true,
      muted: true,
    });
  }, [
    embedUrl,
    fill,
    isControllableDetail,
    providerVideoId,
    sizedHeight,
    sizedWidth,
    useDirectEmbed,
  ]);

  useEffect(() => {
    if (!isControllableDetail || !providerVideoId) {
      return;
    }

    if (loadedVideoIdRef.current === undefined) {
      loadedVideoIdRef.current = providerVideoId;
      return;
    }

    if (loadedVideoIdRef.current === providerVideoId) {
      return;
    }

    loadedVideoIdRef.current = providerVideoId;
    setPlayerReady(false);
    onReadyChange?.(false);
    webRef.current?.injectJavaScript(
      buildFlowPlayerLoadVideoScript(
        providerVideoId,
        activeRef.current,
        !activeRef.current
      )
    );
  }, [isControllableDetail, onReadyChange, providerVideoId]);

  useEffect(() => {
    if (isControllableDetail) {
      return;
    }
    setPlayerReady(false);
    onReadyChange?.(false);
  }, [isControllableDetail, onReadyChange, post.id]);

  useEffect(() => {
    if (!playerReady) {
      return;
    }
    webRef.current?.injectJavaScript(
      buildFlowPlayerActiveScript(active, !active)
    );
  }, [active, playerReady]);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "ready") {
      setPlayerReady(true);
      onReadyChange?.(true);
      webRef.current?.injectJavaScript(
        buildFlowPlayerActiveScript(active, !active)
      );
    }
  };

  const handleLoadEnd = () => {
    if (isControllableDetail) {
      return;
    }
    setPlayerReady(true);
    onReadyChange?.(true);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  };

  const hasSize = sizedWidth > 0 && sizedHeight > 0;

  if (!embedUrl || !webViewSource) {
    return (
      <View
        style={fill ? styles.fill : undefined}
        onLayout={fill ? onLayout : undefined}
      >
        {hasSize ? (
          <FlowPlayerSlate
            post={post}
            width={sizedWidth}
            height={sizedHeight}
            showLoading={false}
          />
        ) : (
          <View style={[fill ? styles.fill : undefined, styles.fallback]} />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        fill
          ? styles.fill
          : { width: sizedWidth || "100%", height: sizedHeight || undefined },
        styles.player,
      ]}
      onLayout={onLayout}
    >
      {hasSize ? (
        <>
          <FlowPlayerSlate
            post={post}
            width={sizedWidth}
            height={sizedHeight}
            showLoading={!playerReady}
          />

          <View
            style={[
              StyleSheet.absoluteFill,
              { opacity: playerReady ? 1 : 0 },
            ]}
            pointerEvents={playerReady && active ? "auto" : "none"}
          >
            <WebView
              ref={webRef}
              source={webViewSource}
              style={StyleSheet.absoluteFill}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              thirdPartyCookiesEnabled={useDirectEmbed}
              androidLayerType={
                Platform.OS === "android"
                  ? fill
                    ? "none"
                    : "hardware"
                  : undefined
              }
              onMessage={handleMessage}
              onLoadEnd={handleLoadEnd}
            />
          </View>
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: "100%",
  },
  player: {
    backgroundColor: "#000",
    overflow: "hidden",
  },
  fallback: {
    backgroundColor: "#111827",
  },
});
