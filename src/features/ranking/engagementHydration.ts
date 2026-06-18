/** Post IDs whose engagement came from a feed API page (skip redundant batch fetch). */
const hydratedFromFeed = new Set<string>();

export function markEngagementsFromFeed(postIds: string[]): void {
  for (const id of postIds) {
    if (id) {
      hydratedFromFeed.add(id);
    }
  }
}

export function isEngagementHydratedFromFeed(postId: string): boolean {
  return hydratedFromFeed.has(postId);
}

export function resetEngagementHydration(): void {
  hydratedFromFeed.clear();
}
