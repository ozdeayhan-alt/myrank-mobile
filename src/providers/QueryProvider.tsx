import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPersistBuster } from "@/lib/appVersionBuster";
import { queryClient } from "@/lib/queryClient";
import { revivePersistedQueries } from "@/features/posts/utils/revivePersistedQueries";

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const PERSISTED_QUERY_ROOTS = new Set([
  "feed",
  "profilePosts",
  "notifications",
  "savedPosts",
  "ranking",
  "profile",
]);

function shouldPersistQuery(queryKey: readonly unknown[]): boolean {
  return typeof queryKey[0] === "string" && PERSISTED_QUERY_ROOTS.has(queryKey[0]);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE_MS,
        buster: getPersistBuster(),
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            shouldPersistQuery(query.queryKey),
        },
      }}
      onSuccess={() => {
        revivePersistedQueries(queryClient);
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
