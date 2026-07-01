import type { ReactNode } from "react";
import { createContext, useContext } from "react";

const FeedAutoplayContext = createContext<string | null>(null);

export function FeedAutoplayProvider({
  autoplayPostId,
  children,
}: {
  autoplayPostId: string | null;
  children: React.ReactNode;
}) {
  return (
    <FeedAutoplayContext.Provider value={autoplayPostId}>
      {children}
    </FeedAutoplayContext.Provider>
  );
}

export function useFeedAutoplayPostId(): string | null {
  return useContext(FeedAutoplayContext);
}
