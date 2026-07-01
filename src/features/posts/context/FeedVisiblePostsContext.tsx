import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

const EMPTY = new Set<string>();

const FeedVisiblePostsContext = createContext<ReadonlySet<string>>(EMPTY);

export function FeedVisiblePostsProvider({
  visiblePostIds,
  children,
}: {
  visiblePostIds: ReadonlySet<string>;
  children: ReactNode;
}) {
  const value = useMemo(
    () => (visiblePostIds.size > 0 ? visiblePostIds : EMPTY),
    [visiblePostIds]
  );

  return (
    <FeedVisiblePostsContext.Provider value={value}>
      {children}
    </FeedVisiblePostsContext.Provider>
  );
}

export function useIsFeedPostMediaHighPriority(postId: string): boolean {
  const visiblePostIds = useContext(FeedVisiblePostsContext);
  return visiblePostIds.has(postId);
}
