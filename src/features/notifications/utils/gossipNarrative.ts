import type { AppNotification, NotificationType } from "../types";
import { pickVariant } from "./gossipScriptSeed";

export type GossipNarrativeStats = {
  likeCount: number;
  commentCount: number;
  messageCount: number;
  rankPassedCount: number;
  followCount: number;
  mentionCount: number;
  totalVoteDelta: number;
  totalEvents: number;
};

export type NarrativeHeadlineResult = {
  headline: string | null;
  excludedIds: Set<string>;
};

function actorName(notification: AppNotification): string {
  return notification.actorDisplayName.trim() || "Biri";
}

export function analyzeGossipNotifications(
  notifications: AppNotification[]
): GossipNarrativeStats {
  const slice = notifications.slice(0, 10);

  return {
    likeCount: slice
      .filter((n) => n.type === "post_liked")
      .reduce((sum, n) => sum + (n.payload.voteDelta ?? 1), 0),
    commentCount: slice.filter((n) => n.type === "post_commented").length,
    messageCount: slice.filter((n) => n.type === "message_received").length,
    rankPassedCount: slice.filter((n) => n.type === "rank_passed").length,
    followCount: slice.filter((n) => n.type === "user_followed").length,
    mentionCount: slice.filter((n) => n.type === "post_mentioned").length,
    totalVoteDelta: slice
      .filter((n) => n.type === "profile_votes")
      .reduce((sum, n) => sum + (n.payload.voteDelta ?? 0), 0),
    totalEvents: slice.length,
  };
}

function findActorWithLikeAndComment(
  notifications: AppNotification[]
): { name: string; ids: string[] } | null {
  const typesByActor = new Map<string, { name: string; types: Set<NotificationType>; ids: string[] }>();

  for (const notification of notifications) {
    if (
      notification.type !== "post_liked" &&
      notification.type !== "post_commented"
    ) {
      continue;
    }

    const existing = typesByActor.get(notification.actorId) ?? {
      name: actorName(notification),
      types: new Set<NotificationType>(),
      ids: [],
    };
    existing.types.add(notification.type);
    existing.ids.push(notification.id);
    typesByActor.set(notification.actorId, existing);
  }

  for (const [, entry] of typesByActor) {
    if (entry.types.has("post_liked") && entry.types.has("post_commented")) {
      return { name: entry.name, ids: entry.ids };
    }
  }

  return null;
}

export function buildNarrativeHeadline(
  notifications: AppNotification[],
  stats: GossipNarrativeStats,
  diminutive: string,
  seed: number
): NarrativeHeadlineResult {
  const excludedIds = new Set<string>();

  if (stats.likeCount >= 3 && stats.rankPassedCount >= 1) {
    return {
      headline: pickVariant(
        [
          `Vallaha ${diminutive}, popülersin ama seni sollamışlar.`,
          `Gönderin tutmuş ${diminutive}, ama sıra gitmiş haberin olsun.`,
        ],
        seed
      ),
      excludedIds,
    };
  }

  if (stats.messageCount >= 2 && stats.likeCount === 0) {
    return {
      headline: pickVariant(
        [
          `Kimse beğenmemiş ${diminutive}, ama mesaj kutun dolu, ilginç.`,
          `Beğeni yok ama herkes yazmış sana, garip gün.`,
        ],
        seed
      ),
      excludedIds,
    };
  }

  if (stats.totalVoteDelta >= 5) {
    return {
      headline: pickVariant(
        [
          `Profiline coşmuşlar ${diminutive}, +${stats.totalVoteDelta} oy gelmiş.`,
          `Oy yağmuru var ${diminutive}, +${stats.totalVoteDelta} puan birden.`,
        ],
        seed
      ),
      excludedIds,
    };
  }

  const obsessed = findActorWithLikeAndComment(notifications);
  if (obsessed) {
    for (const id of obsessed.ids) {
      excludedIds.add(id);
    }
    return {
      headline: pickVariant(
        [
          `${obsessed.name} hem beğenmiş hem yazmış ${diminutive}, takıntılı mı ne?`,
          `${obsessed.name} peşine düşmüş resmen, beğenip yorum da atmış.`,
        ],
        seed
      ),
      excludedIds,
    };
  }

  if (stats.totalEvents >= 6) {
    return {
      headline: pickVariant(
        [
          `Sen yokken herkes işini yapmış ${diminutive}, ortalık hareketli.`,
          `Bugün tam gıybet günü ${diminutive}, olay üstüne olay.`,
        ],
        seed
      ),
      excludedIds,
    };
  }

  return { headline: null, excludedIds };
}

export function buildContextualOutro(
  stats: GossipNarrativeStats,
  diminutive: string,
  seed: number
): string {
  if (stats.totalEvents >= 6) {
    return pickVariant(
      [
        `Vay be ${diminutive}, ortalık karışmış bugün, hayırdır.`,
        `Tam bir gıybet günü ${diminutive}, kapatıyorum.`,
      ],
      seed
    );
  }

  if (stats.totalEvents <= 2) {
    return pickVariant(
      [
        `Sakin gün ${diminutive}, fazla gıybet yok.`,
        `Rahat ol ${diminutive}, ortalık sakin bugün.`,
      ],
      seed
    );
  }

  return pickVariant(
    [
      `Tamam ${diminutive}, gıybet bu kadar.`,
      `Hepsi bu ${diminutive}, başka yok hayırdır.`,
      `Kapatıyorum ${diminutive}, ortalık bu kadar.`,
    ],
    seed
  );
}
