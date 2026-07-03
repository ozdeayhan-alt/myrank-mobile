import AsyncStorage from "@react-native-async-storage/async-storage";
import { closeFlow } from "@/features/feed-v2/renderers/flow/FlowNavigator";
import { resetFeedScrollVisibilityStore } from "@/features/posts/store/feedScrollVisibilityStore";
import { clearPendingGaugeVoteModeTimers } from "@/features/profile/lib/gaugeVoteModeStorage";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { resetEngagementHydration } from "@/features/ranking/engagementHydration";
import { useEngagementStore } from "@/features/ranking/store/useEngagementStore";
import { queryClient } from "@/lib/queryClient";

/** @see ErrorBoundary — createAsyncStoragePersister default key */
const REACT_QUERY_OFFLINE_CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE";

/**
 * Clears all client-side session state on logout / account deletion.
 * Logout paths only — does not run on login or during normal app use.
 */
export async function resetAppSessionState(): Promise<void> {
  clearPendingGaugeVoteModeTimers();

  closeFlow();

  useProfileStore.getState().reset();
  useEngagementStore.getState().reset();
  resetEngagementHydration();
  resetFeedScrollVisibilityStore();

  queryClient.clear();

  try {
    await AsyncStorage.removeItem(REACT_QUERY_OFFLINE_CACHE_KEY);
  } catch {
    // Best-effort persisted query cache clear.
  }
}
