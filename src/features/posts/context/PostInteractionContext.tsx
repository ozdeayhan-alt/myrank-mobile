import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import type {
  InteractionRequest,
  InteractionResponse,
} from "@/features/ranking/types";

type PostInteractionContextValue = {
  sendInteraction: (
    request: InteractionRequest
  ) => Promise<InteractionResponse | null>;
};

const PostInteractionContext = createContext<PostInteractionContextValue | null>(
  null
);

export function usePostInteractionContext(): PostInteractionContextValue | null {
  return useContext(PostInteractionContext);
}

type PostInteractionProviderProps = {
  currentUserId: string | null;
  children: ReactNode;
};

export function PostInteractionProvider({
  currentUserId,
  children,
}: PostInteractionProviderProps) {
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);

  const sendInteraction = useCallback(
    async (request: InteractionRequest): Promise<InteractionResponse | null> => {
      const result = await sendPostInteractionSafe(request);
      if (
        result &&
        currentUserId &&
        result.authorId === currentUserId
      ) {
        setAuthorTotalScore(result.authorTotalScore);
      }
      return result;
    },
    [currentUserId, setAuthorTotalScore]
  );

  const value = useMemo(() => ({ sendInteraction }), [sendInteraction]);

  return (
    <PostInteractionContext.Provider value={value}>
      {children}
    </PostInteractionContext.Provider>
  );
}
