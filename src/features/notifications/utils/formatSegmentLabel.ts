/** Human-readable label from a partial segment key (e.g. city:İzmir). */

export function formatSegmentLabel(segmentKey: string | undefined): string {
  if (!segmentKey || segmentKey === "global") {
    return "Global";
  }

  const parts = segmentKey.split("|");
  for (const part of parts) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    const field = part.slice(0, colon);
    const value = part.slice(colon + 1);
    if (!value) continue;
    if (field === "city" || field === "country") {
      return value;
    }
  }

  return segmentKey;
}
