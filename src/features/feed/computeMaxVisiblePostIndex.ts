/**
 * Maps FlashList viewable item keys to the highest 0-based post index in `postIds`.
 */
export function computeMaxVisiblePostIndex(
  visiblePostIds: Iterable<string>,
  postIds: readonly string[]
): number {
  if (postIds.length === 0) return -1;

  const indexById = new Map<string, number>();
  for (let index = 0; index < postIds.length; index += 1) {
    indexById.set(postIds[index], index);
  }

  let maxIndex = -1;
  for (const id of visiblePostIds) {
    const index = indexById.get(id);
    if (index != null && index > maxIndex) {
      maxIndex = index;
    }
  }

  return maxIndex;
}
