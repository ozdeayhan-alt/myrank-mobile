const HASHTAG_PATTERN = /#([\p{L}\p{N}_]+)/gu;
const MENTION_PATTERN = /@([\p{L}\p{N}_.]+)/gu;

export function normalizeHashtag(raw: string): string {
  return raw.replace(/^#/, "").trim().toLocaleLowerCase("tr-TR");
}

export function extractHashtags(content: string): string[] {
  const tags = new Set<string>();
  for (const match of content.matchAll(HASHTAG_PATTERN)) {
    const normalized = normalizeHashtag(match[1] ?? "");
    if (normalized.length >= 2) {
      tags.add(normalized);
    }
  }
  return [...tags];
}

export function extractMentionTokens(content: string): string[] {
  const tokens = new Set<string>();
  for (const match of content.matchAll(MENTION_PATTERN)) {
    const token = (match[1] ?? "").trim();
    if (token.length >= 2) {
      tokens.add(token);
    }
  }
  return [...tokens];
}

export type RichTextSegment =
  | { kind: "text"; value: string }
  | { kind: "hashtag"; value: string; tag: string }
  | { kind: "mention"; value: string; token: string };

export function splitPostContent(content: string): RichTextSegment[] {
  if (!content.trim()) {
    return [];
  }

  const pattern = /(#([\p{L}\p{N}_]+))|(@([\p{L}\p{N}_.]+))/gu;
  const segments: RichTextSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({
        kind: "text",
        value: content.slice(lastIndex, index),
      });
    }

    const full = match[0];
    if (full.startsWith("#")) {
      segments.push({
        kind: "hashtag",
        value: full,
        tag: normalizeHashtag(full),
      });
    } else {
      segments.push({
        kind: "mention",
        value: full,
        token: (match[4] ?? "").trim(),
      });
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < content.length) {
    segments.push({ kind: "text", value: content.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ kind: "text", value: content }];
}
