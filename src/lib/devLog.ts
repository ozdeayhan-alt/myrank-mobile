export function devWarn(...args: unknown[]): void {
  if (__DEV__) {
    console.warn(...args);
  }
}

export type FlowPlaybackLogFields = {
  postId?: string | null;
  slot?: string | null;
  generation?: number | null;
  activeIndex?: number | null;
  mode?: string | null;
  status?: string | null;
};

function formatFlowField(value: string | number | null | undefined): string {
  if (value == null || value === "") {
    return "-";
  }
  return String(value);
}

export function devFlowLog(
  scope: string,
  event: string,
  fields: FlowPlaybackLogFields = {}
): void {
  if (!__DEV__) {
    return;
  }

  const message = [
    `[FlowPlayback][${scope}] ${event}`,
    `postId=${formatFlowField(fields.postId)}`,
    `slot=${formatFlowField(fields.slot)}`,
    `generation=${formatFlowField(fields.generation)}`,
    `activeIndex=${formatFlowField(fields.activeIndex)}`,
    `mode=${formatFlowField(fields.mode)}`,
    `status=${formatFlowField(fields.status)}`,
  ].join("\n");

  console.log(message);
}

export function safePlayerStatus(
  player: { status?: string } | null | undefined
): string {
  if (!player) {
    return "-";
  }
  try {
    return player.status ?? "-";
  } catch {
    return "released";
  }
}
