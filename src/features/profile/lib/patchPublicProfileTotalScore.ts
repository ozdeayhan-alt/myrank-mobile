import type { QueryClient } from "@tanstack/react-query";
import type { PublicProfile } from "../api/getPublicProfile";
import { publicProfileQueryKey } from "../hooks/usePublicProfile";

/** Gönderi oyu sonrası cache'lenmiş public profil TP'sini günceller (ekstra network yok). */
export function patchPublicProfileTotalScore(
  queryClient: QueryClient,
  userId: string,
  totalScore: number
): void {
  queryClient.setQueryData<PublicProfile | null>(
    publicProfileQueryKey(userId),
    (old) => (old ? { ...old, totalScore } : old)
  );
}
