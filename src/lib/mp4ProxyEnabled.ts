/** MP4 CDN pilot — HLS doğrudan Firebase'de kalır. */
export function isMp4ProxyEnabled(): boolean {
  return process.env.EXPO_PUBLIC_MP4_PROXY_ENABLED === "true";
}
