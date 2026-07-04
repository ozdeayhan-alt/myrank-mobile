import type { FeedV2ListItem } from "@/features/feed-v2/engine/FeedEngine.types";
import { duelIntervalForCardIndex } from "../constants";

export function injectDuelCards(items: FeedV2ListItem[]): FeedV2ListItem[] {
  if (items.length === 0) {
    return items;
  }

  const result: FeedV2ListItem[] = [];
  let postsSinceLastDuel = 0;
  let duelCardIndex = 0;

  for (const item of items) {
    if (item.kind === "duel") {
      result.push(item);
      continue;
    }

    result.push(item);
    postsSinceLastDuel += 1;

    const interval = duelIntervalForCardIndex(duelCardIndex);
    if (postsSinceLastDuel >= interval) {
      result.push({
        kind: "duel",
        key: `duel-card-${duelCardIndex}`,
      });
      postsSinceLastDuel = 0;
      duelCardIndex += 1;
    }
  }

  return result;
}
