import { memo, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import type { Post } from "@/features/posts/types";
import { buildPreviewEmbedUrlForPost } from "../providers/registry";
import {
  buildFlowWebViewSource,
  shouldLoadEmbedDirectly,
} from "../utils/flowWebViewEmbed";

type FlowPreviewPlayerProps = {
  post: Post;
  width: number;
  height: number;
};

export const FlowPreviewPlayer = memo(function FlowPreviewPlayer({
  post,
  width,
  height,
}: FlowPreviewPlayerProps) {
  const embedUrl = useMemo(() => buildPreviewEmbedUrlForPost(post), [post]);
  const useDirectEmbed = shouldLoadEmbedDirectly(post.provider);
  const webViewSource = useMemo(() => {
    if (!embedUrl) {
      return null;
    }
    if (useDirectEmbed) {
      return { uri: embedUrl };
    }
    return buildFlowWebViewSource(embedUrl);
  }, [embedUrl, useDirectEmbed]);

  if (!embedUrl || !webViewSource) {
    return null;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={webViewSource}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled={useDirectEmbed}
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
        pointerEvents="none"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#000",
  },
});
