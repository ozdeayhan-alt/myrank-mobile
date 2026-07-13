import type { ShareContentType } from "@/features/posts/types";

export type ShareTargetKind = ShareContentType;

export type ParsedSharePayload = {
  dedupeKey: string;
  text: string;
  url: string | null;
  localImagePath: string | null;
  localImageMime: string | null;
  metaTitle: string | null;
};

const URL_IN_TEXT_PATTERN = /https?:\/\/[^\s]+/i;
const BARE_DOMAIN_PATTERN =
  /(?:^|\s)((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)(?=\s|$)/i;

const YOUTUBE_PATTERN = /youtube\.com|youtu\.be/i;
const TIKTOK_PATTERN = /tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim().replace(/[)\],.!?]+$/g, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function extractUrlFromShareText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const httpMatch = trimmed.match(URL_IN_TEXT_PATTERN);
  if (httpMatch?.[0]) {
    return normalizeUrl(httpMatch[0]);
  }

  const domainMatch = trimmed.match(BARE_DOMAIN_PATTERN);
  if (domainMatch?.[1]) {
    return normalizeUrl(domainMatch[1]);
  }

  return null;
}

export function classifyShareTarget(payload: ParsedSharePayload): ShareTargetKind {
  if (payload.localImagePath) {
    return "image";
  }

  const url = payload.url?.trim() ?? "";
  if (!url) {
    return "tweet";
  }

  if (YOUTUBE_PATTERN.test(url) || TIKTOK_PATTERN.test(url)) {
    return "flow";
  }

  return "tweet";
}

function stripUrlFromShareText(payload: ParsedSharePayload): string {
  const text = payload.text.trim();
  const url = payload.url;
  if (!text) {
    return "";
  }
  if (!url) {
    return text;
  }
  return text.replace(url, "").replace(/https?:\/\/[^\s]+/gi, "").trim();
}

export function buildWhispContent(payload: ParsedSharePayload): string {
  const text = stripUrlFromShareText(payload);
  if (text.length >= 2) {
    return text.slice(0, 280);
  }

  if (payload.url) {
    try {
      const host = new URL(payload.url).hostname.replace(/^www\./, "");
      return `🔗 ${host}`.slice(0, 280);
    } catch {
      return "🔗 Paylaştığım bağlantı".slice(0, 280);
    }
  }

  return "🔗 Paylaştığım bağlantı";
}

export function buildGlowCaption(payload: ParsedSharePayload): string {
  const text = stripUrlFromShareText(payload);
  if (text.length >= 2) {
    return text.slice(0, 2000);
  }
  return "";
}

export function buildDedupeKey(payload: ParsedSharePayload): string {
  if (payload.localImagePath) {
    return `file:${payload.localImagePath}`;
  }
  if (payload.url) {
    return `url:${payload.url.toLowerCase()}`;
  }
  return `text:${payload.text.trim().toLowerCase()}`;
}
