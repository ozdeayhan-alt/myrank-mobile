function parseEnvFlag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function parseRolloutPercent(value: string | undefined): number {
  const parsed = Number(value ?? "0");
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

function isUserInRollout(userId: string | null | undefined, percent: number): boolean {
  if (percent >= 100) {
    return true;
  }
  if (percent <= 0 || !userId) {
    return false;
  }

  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash + userId.charCodeAt(index) * (index + 1)) % 100;
  }
  return hash < percent;
}

function isFlagEnabledForUser(
  flagValue: string | undefined,
  userId: string | null | undefined
): boolean {
  if (!parseEnvFlag(flagValue)) {
    return false;
  }

  const rolloutPercent = parseRolloutPercent(
    process.env.EXPO_PUBLIC_FEED_ROLLOUT_PERCENT
  );
  if (rolloutPercent <= 0) {
    return true;
  }

  return isUserInRollout(userId, rolloutPercent);
}

/** Fixed-slot feed row (FeedStreamCell path). Default: OFF → legacy FeedPostCell. */
export function isFixedSlotFeedEnabled(userId?: string | null): boolean {
  return isFlagEnabledForUser(process.env.EXPO_PUBLIC_FIXED_SLOT_FEED, userId);
}

/** In-memory feed buffer wrapper. Phase 1: logging + pass-through. */
export function isFeedBufferEnabled(): boolean {
  return parseEnvFlag(process.env.EXPO_PUBLIC_FEED_BUFFER);
}

/** Metadata-first media aspect — yalnızca ana sayfa fixed-slot feed ile. */
export function isFeedStableMediaEnabled(userId?: string | null): boolean {
  if (!parseEnvFlag(process.env.EXPO_PUBLIC_FEED_STABLE_MEDIA)) {
    return false;
  }
  return isFixedSlotFeedEnabled(userId);
}

/** Isolated render pipeline tuning (debounce/throttle). Default ON when unset. */
export function isFeedRenderIsolationEnabled(): boolean {
  const raw = process.env.EXPO_PUBLIC_FEED_RENDER_ISOLATION;
  if (raw == null || raw === "") {
    return true;
  }
  return parseEnvFlag(raw);
}

export function isFeedPerfLogEnabled(): boolean {
  return parseEnvFlag(process.env.EXPO_PUBLIC_FEED_PERF_LOG);
}
