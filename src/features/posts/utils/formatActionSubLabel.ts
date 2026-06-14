export type PostActionKind = "comment" | "share" | "save";

export function formatActionSubLabel(
  kind: PostActionKind,
  active: boolean
): string {
  switch (kind) {
    case "comment":
      return "+33";
    case "share":
    case "save":
      return active ? "+1" : "+66";
  }
}
