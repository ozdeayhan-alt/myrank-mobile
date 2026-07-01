import { useMemo } from "react";
import { useProfileRankings } from "./useProfileRankings";
import type { UserMetadata } from "../types";
import type { TopRanking } from "../types/achievement";
import { pickTopRanking } from "../utils/pickTopRanking";

export function useProfileTopRanking(
  userId: string | undefined,
  metadata: UserMetadata,
  enabled: boolean
): TopRanking | null {
  const { rankings } = useProfileRankings(userId, metadata, enabled);

  return useMemo(
    () => pickTopRanking(rankings, metadata),
    [rankings, metadata]
  );
}
