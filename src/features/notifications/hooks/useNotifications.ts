import { useQuery } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchNotifications } from "../api/fetchNotifications";

type UseNotificationsOptions = {
  limit?: number;
  enabled?: boolean;
};

export const notificationsQueryKey = (
  userId: string,
  limit?: number
) => ["notifications", userId, limit ?? null] as const;

export function useNotifications(
  userId: string | undefined,
  options?: UseNotificationsOptions
) {
  const limit = options?.limit;
  const enabled = options?.enabled ?? true;

  const query = useQuery({
    queryKey: notificationsQueryKey(userId ?? "", limit),
    queryFn: () => fetchNotifications(userId!, { limit }),
    enabled: Boolean(userId) && enabled,
    staleTime: 60_000,
  });

  return {
    notifications: query.data ?? [],
    loading: query.isLoading && query.data === undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
  };
}
