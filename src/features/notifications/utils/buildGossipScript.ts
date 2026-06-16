import type { AppNotification } from "../types";
import { aggregateGossipEvents } from "./aggregateGossipEvents";
import {
  formatGossipAggregate,
  formatGossipLine,
  GOSSIP_CONNECTORS,
} from "./gossipTemplates";
import {
  buildGossipEmptyMessage,
  buildGossipIntro,
  buildGossipMiddleAside,
  toDiminutive,
} from "./gossipPersonalization";
import {
  analyzeGossipNotifications,
  buildContextualOutro,
  buildNarrativeHeadline,
} from "./gossipNarrative";
import { hashNotificationIds, pickVariant } from "./gossipScriptSeed";

export type BuildGossipScriptOptions = {
  recipientDisplayName?: string;
};

export type GossipScriptParts = {
  parts: string[];
};

function filterNotifications(
  notifications: AppNotification[],
  excludedIds: Set<string>
): AppNotification[] {
  if (excludedIds.size === 0) return notifications;
  return notifications.filter((notification) => !excludedIds.has(notification.id));
}

function formatGossipGroups(
  notifications: AppNotification[],
  seed: number
): string[] {
  return aggregateGossipEvents(notifications).map((group, index) => {
    const lineSeed = seed + index * 17;
    if (group.items.length > 1) {
      return formatGossipAggregate(group.items, lineSeed);
    }
    return formatGossipLine(group.items[0], lineSeed);
  });
}

function interleaveConnectors(lines: string[], seed: number): string[] {
  if (lines.length <= 1) return lines;

  return lines.flatMap((line, index) => {
    if (index === 0) return [line];
    const connector = pickVariant(GOSSIP_CONNECTORS, seed + index);
    return [`${connector} ${line}`];
  });
}

function applyMiddleAside(
  lines: string[],
  diminutive: string,
  seed: number
): string[] {
  if (lines.length < 2) return lines;

  const next = [...lines];
  const aside = buildGossipMiddleAside(diminutive, seed + 7);
  next[1] = `${aside} ${next[1]}`;
  return next;
}

/** Chunked TTS script for dedikoducu kadın (last 10 events). */
export function buildGossipScriptParts(
  notifications: AppNotification[],
  options: BuildGossipScriptOptions = {}
): GossipScriptParts {
  const diminutive = toDiminutive(options.recipientDisplayName ?? "");

  if (notifications.length === 0) {
    return { parts: [buildGossipEmptyMessage(diminutive)] };
  }

  const seed = hashNotificationIds(notifications);
  const stats = analyzeGossipNotifications(notifications);
  const { headline, excludedIds } = buildNarrativeHeadline(
    notifications,
    stats,
    diminutive,
    seed
  );

  const filtered = filterNotifications(notifications, excludedIds);
  const bodyLines = applyMiddleAside(
    interleaveConnectors(formatGossipGroups(filtered, seed), seed),
    diminutive,
    seed
  );
  const body = bodyLines.join(" ");
  const outro = buildContextualOutro(stats, diminutive, seed + 99);

  const parts = [buildGossipIntro(diminutive)];
  if (headline) {
    parts.push(headline);
  }
  if (body.trim()) {
    parts.push(body);
  }
  parts.push(outro);

  return { parts };
}

/** Flat TTS script (single speak call). */
export function buildGossipScript(
  notifications: AppNotification[],
  options: BuildGossipScriptOptions = {}
): string {
  return buildGossipScriptParts(notifications, options).parts.join(" ");
}
