import Constants from "expo-constants";
import type { WebViewSource } from "react-native-webview/lib/WebViewTypes";
import { FLOW_CARD_ASPECT_RATIO } from "../constants";

/** YouTube embed requires a valid HTTPS referer (Error 153 without it). */
export function getFlowEmbedRefererBase(): string {
  const androidPackage = Constants.expoConfig?.android?.package;
  const iosBundle = Constants.expoConfig?.ios?.bundleIdentifier;
  const id =
    (typeof androidPackage === "string" && androidPackage) ||
    (typeof iosBundle === "string" && iosBundle) ||
    "com.myrank.mobile";
  return `https://${id}`;
}

/** TikTok embed in a nested iframe triggers third-party cookie prompts; load first-party instead. */
export function shouldLoadEmbedDirectly(provider: string | undefined): boolean {
  return provider === "tiktok";
}

type FlowWebViewFitMode = "cover" | "contain";

type FlowWebViewCoverOptions = {
  /** @deprecated Prefer `fit`. */
  cover?: boolean;
  fit?: FlowWebViewFitMode;
  containerWidth?: number;
  containerHeight?: number;
  /**
   * When set, uses YouTube IFrame API so RN can play/pause/mute without reload.
   * `videoId` is required for the API player.
   */
  controllable?: boolean;
  videoId?: string;
  autoplay?: boolean;
  muted?: boolean;
};

/**
 * Sizes the iframe/player to 9:16 inside the container.
 * - cover: crop to fill (may overflow edges)
 * - contain: fit entirely (letterbox bars OK)
 */
function buildFitIframeCss(
  containerWidth: number,
  containerHeight: number,
  fit: FlowWebViewFitMode
): string {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return "position:absolute;inset:0;width:100%;height:100%;border:0;";
  }

  const containerAspect = containerWidth / containerHeight;
  let iframeWidth: number;
  let iframeHeight: number;

  if (fit === "contain") {
    if (containerAspect > FLOW_CARD_ASPECT_RATIO) {
      iframeHeight = containerHeight;
      iframeWidth = Math.round(containerHeight * FLOW_CARD_ASPECT_RATIO);
    } else {
      iframeWidth = containerWidth;
      iframeHeight = Math.round(containerWidth / FLOW_CARD_ASPECT_RATIO);
    }
  } else if (containerAspect > FLOW_CARD_ASPECT_RATIO) {
    iframeWidth = containerWidth;
    iframeHeight = Math.round(containerWidth / FLOW_CARD_ASPECT_RATIO);
  } else {
    iframeHeight = containerHeight;
    iframeWidth = Math.round(containerHeight * FLOW_CARD_ASPECT_RATIO);
  }

  return [
    "position:absolute",
    "top:50%",
    "left:50%",
    `width:${iframeWidth}px`,
    `height:${iframeHeight}px`,
    "transform:translate(-50%,-50%)",
    "border:0",
  ].join(";");
}

function sanitizeVideoId(videoId: string): string {
  return videoId.replace(/[^a-zA-Z0-9_-]/g, "");
}

function buildControllableHtml(options: {
  videoId: string;
  playerCss: string;
  autoplay: boolean;
  muted: boolean;
}): string {
  const { videoId, playerCss, autoplay, muted } = options;
  const safeId = sanitizeVideoId(videoId);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
      .stage { position: absolute; inset: 0; overflow: hidden; background: #000; }
      #player { ${playerCss} }
    </style>
  </head>
  <body>
    <div class="stage"><div id="player"></div></div>
    <script>
      var __flowPlayer = null;
      var __flowWantActive = ${autoplay && !muted ? "true" : "false"};
      var __flowWantMuted = ${muted ? "true" : "false"};
      var __flowReady = false;
      var __flowPendingVideoId = null;

      function __flowNotifyReady() {
        try {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage("ready");
        } catch (e) {}
      }

      function __flowApply() {
        if (!__flowPlayer || !__flowReady) return;
        try {
          if (__flowWantMuted) { __flowPlayer.mute(); } else { __flowPlayer.unMute(); }
          if (__flowWantActive) { __flowPlayer.playVideo(); }
          else { __flowPlayer.pauseVideo(); }
        } catch (e) {}
      }

      window.__flowSetActive = function(active, muted) {
        __flowWantActive = !!active;
        if (typeof muted === "boolean") __flowWantMuted = muted;
        else __flowWantMuted = !active;
        __flowApply();
      };

      window.__flowLoadVideo = function(videoId, active, muted) {
        var safeId = String(videoId || "").replace(/[^a-zA-Z0-9_-]/g, "");
        if (!safeId) return;
        __flowWantActive = !!active;
        __flowWantMuted = typeof muted === "boolean" ? !!muted : !active;
        if (__flowPlayer && __flowReady) {
          try {
            if (__flowWantActive) {
              __flowPlayer.loadVideoById(safeId);
            } else {
              __flowPlayer.cueVideoById(safeId);
            }
          } catch (e) {}
        } else {
          __flowPendingVideoId = safeId;
        }
      };

      function onYouTubeIframeAPIReady() {
        __flowPlayer = new YT.Player("player", {
          videoId: "${safeId}",
          playerVars: {
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            autoplay: 1,
            mute: 1,
            controls: 0,
            fs: 0,
            disablekb: 1,
            iv_load_policy: 3,
            enablejsapi: 1
          },
          events: {
            onReady: function() {
              __flowReady = true;
              if (__flowPendingVideoId) {
                var pending = __flowPendingVideoId;
                __flowPendingVideoId = null;
                window.__flowLoadVideo(pending, __flowWantActive, __flowWantMuted);
              } else {
                __flowApply();
                __flowNotifyReady();
              }
            },
            onStateChange: function(event) {
              if (!__flowReady) return;
              if (
                event.data === YT.PlayerState.PLAYING ||
                event.data === YT.PlayerState.BUFFERING ||
                event.data === YT.PlayerState.CUED ||
                event.data === YT.PlayerState.PAUSED
              ) {
                __flowApply();
                __flowNotifyReady();
              }
            }
          }
        });
      }
    </script>
    <script src="https://www.youtube.com/iframe_api"></script>
  </body>
</html>`;
}

export function buildFlowWebViewSource(
  embedUrl: string,
  options: FlowWebViewCoverOptions = {}
): WebViewSource {
  const baseUrl = getFlowEmbedRefererBase();
  const fit: FlowWebViewFitMode | null =
    options.fit ?? (options.cover ? "cover" : null);
  const playerCss =
    fit &&
    typeof options.containerWidth === "number" &&
    typeof options.containerHeight === "number"
      ? buildFitIframeCss(options.containerWidth, options.containerHeight, fit)
      : "position:absolute;inset:0;width:100%;height:100%;border:0;";

  if (options.controllable && options.videoId) {
    return {
      html: buildControllableHtml({
        videoId: options.videoId,
        playerCss,
        autoplay: options.autoplay !== false,
        muted: options.muted === true,
      }),
      baseUrl,
    };
  }

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; overflow: hidden; }
      .stage { position: absolute; inset: 0; overflow: hidden; background: #000; }
      iframe { ${playerCss} }
    </style>
  </head>
  <body>
    <div class="stage">
      <iframe
        src="${embedUrl.replace(/"/g, "&quot;")}"
        title="Flow video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  </body>
</html>`;

  return { html, baseUrl };
}

/** JS snippet for WebView.injectJavaScript — play/unmute or pause/mute. */
export function buildFlowPlayerActiveScript(
  active: boolean,
  muted?: boolean
): string {
  const mutedArg =
    typeof muted === "boolean" ? (muted ? "true" : "false") : "undefined";
  return `try{window.__flowSetActive(${active ? "true" : "false"},${mutedArg});}catch(e){};true;`;
}

/**
 * Swap video in an existing YT.Player without remounting the WebView.
 * Active slots use loadVideoById; inactive preload slots use cueVideoById.
 */
export function buildFlowPlayerLoadVideoScript(
  videoId: string,
  active: boolean,
  muted?: boolean
): string {
  const safeId = sanitizeVideoId(videoId);
  if (!safeId) {
    return "true;";
  }
  const mutedArg =
    typeof muted === "boolean" ? (muted ? "true" : "false") : "undefined";
  return `try{window.__flowLoadVideo("${safeId}",${active ? "true" : "false"},${mutedArg});}catch(e){};true;`;
}
