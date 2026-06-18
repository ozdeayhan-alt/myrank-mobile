import type { AppNotification } from "../types";
import { formatSegmentLabel } from "./formatSegmentLabel";
import { pickVariant } from "./gossipScriptSeed";

export const GOSSIP_CONNECTORS = [
  "Vallaha bak,",
  "Dur bi dinle,",
  "Aynen,",
  "Yok artık,",
] as const;

function actorName(notification: AppNotification): string {
  return notification.actorDisplayName.trim() || "Biri";
}

function segmentLabelFromPayload(
  payload: AppNotification["payload"]
): string {
  if (payload.segmentLabel?.trim()) {
    return payload.segmentLabel.trim();
  }
  return formatSegmentLabel(payload.segmentKey);
}

function formatNameList(names: string[]): string {
  const unique = [...new Set(names.filter(Boolean))];
  if (unique.length === 0) return "birileri";
  if (unique.length === 1) return unique[0];
  if (unique.length === 2) return `${unique[0]} ve ${unique[1]}`;
  return `${unique[0]}, ${unique[1]} ve ${unique.length - 2} kişi daha`;
}

export function formatGossipLine(
  notification: AppNotification,
  seed: number
): string {
  const name = actorName(notification);
  const { type, payload } = notification;

  switch (type) {
    case "post_liked": {
      const delta = payload.voteDelta ?? 0;
      if (delta > 1) {
        return pickVariant(
          [
            `${name} gönderine ${delta} kez göz koymuş resmen.`,
            `${name} gönderini ${delta} kez beğenmiş, haberin yokmuş.`,
          ],
          seed
        );
      }
      return pickVariant(
        [
          `Vallaha ${name} gönderine göz koymuş resmen.`,
          `${name} beğenmiş paylaşımını, haberin yokmuş.`,
          `Bak ${name} kalp bırakmış gönderine.`,
        ],
        seed
      );
    }
    case "post_commented":
      return pickVariant(
        [
          `${name} yazmış gönderine, bakmadan durma.`,
          `Gönderine ${name} yorum atmış.`,
          `${name} laf atmış paylaşıma, bir bak.`,
        ],
        seed
      );
    case "post_saved":
      return pickVariant(
        [
          `${name} kaydetmiş gönderini, beğenmiş demek ki.`,
          `${name} arşivlemiş paylaşımını.`,
        ],
        seed
      );
    case "post_reposted":
      return pickVariant(
        [
          `${name} gönderini tekrar yaymış, tutmuş.`,
          `${name} akışına çekmiş paylaşımını.`,
        ],
        seed
      );
    case "message_received":
      return pickVariant(
        [
          `${name} yazmış sana, bakmadan olmaz.`,
          `Mesaj var, ${name} düşmüş hattına.`,
          `${name} çatmış sana, bir cevap ver.`,
        ],
        seed
      );
    case "profile_votes": {
      const delta = payload.voteDelta ?? 0;
      return pickVariant(
        [
          `${name} profiline ${delta} oy basmış.`,
          `Profiline ${name} ${delta} puan yüklemiş, iyi niyetli mi bilmiyorum.`,
        ],
        seed
      );
    }
    case "rank_passed": {
      const label = segmentLabelFromPayload(payload);
      return pickVariant(
        [
          `Yok artık, ${name} seni ${label} sıralamasında sollamış!`,
          `${name} ${label} listesinde önüne geçmiş, sıra karışmış.`,
          `${label} tarafında ${name} geçmiş seni, dikkat et.`,
        ],
        seed
      );
    }
    case "user_followed":
      return pickVariant(
        [
          `${name} peşine düşmüş, takibe almış seni.`,
          `Yeni takipçi: ${name}, radarına girmişsin.`,
          `${name} seni stalklamaya başlamış.`,
        ],
        seed
      );
    case "post_mentioned":
      return pickVariant(
        [
          `${name} bir yerde senden bahsetmiş.`,
          `${name} etiketlemiş seni bir paylaşımda.`,
        ],
        seed
      );
    default:
      return `${name} bir şeyler çevirmiş, haberin olsun.`;
  }
}

export function formatGossipAggregate(
  notifications: AppNotification[],
  seed: number
): string {
  if (notifications.length === 0) return "";
  if (notifications.length === 1) {
    return formatGossipLine(notifications[0], seed);
  }

  const type = notifications[0].type;
  const names = notifications.map(actorName);
  const count = notifications.length;

  switch (type) {
    case "post_liked":
      return pickVariant(
        [
          `Vallaha ${count} kişi gönderini beğenmiş; ${formatNameList(names)} de var.`,
          `Bugün ${count} kalp yağmış gönderine, ${formatNameList(names)} dahil.`,
          `${count} beğeni birden gelmiş, içinde ${formatNameList(names)} de var.`,
        ],
        seed
      );
    case "post_commented":
      return pickVariant(
        [
          `Gönderine ${count} yorum düşmüş; ${formatNameList(names)} de yazmış.`,
          `${count} yorum var, aralarında ${formatNameList(names)}.`,
        ],
        seed
      );
    case "message_received":
      return pickVariant(
        [
          `${count} kişi sana yazmış, kutu dolmuş.`,
          `Mesaj yağmuru var, ${count} kişi çatmış.`,
        ],
        seed
      );
    case "post_saved":
      return `${count} kişi gönderini kaydetmiş, tutmuş yani.`;
    case "post_reposted":
      return `${count} kişi gönderini yeniden paylaşmış.`;
    default:
      return formatGossipLine(notifications[0], seed);
  }
}
