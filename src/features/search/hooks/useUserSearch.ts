import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { MIN_USER_SEARCH_LENGTH, searchUsers } from "../api/searchUsers";
import type { SearchUserResult } from "../types";

type UseUserSearchResult = {
  query: string;
  setQuery: (value: string) => void;
  clearQuery: () => void;
  isSearchActive: boolean;
  users: SearchUserResult[];
  loading: boolean;
  error: string | null;
};

export const userSearchQueryKey = (query: string) =>
  ["search", "users", query] as const;

function useUserSearchQuery(debouncedQuery: string) {
  const canSearch = debouncedQuery.length >= MIN_USER_SEARCH_LENGTH;

  const searchQuery = useQuery({
    queryKey: userSearchQueryKey(debouncedQuery),
    queryFn: () => searchUsers(debouncedQuery),
    enabled: canSearch,
    staleTime: 60_000,
  });

  return {
    users: canSearch ? (searchQuery.data?.users ?? []) : [],
    loading: canSearch && searchQuery.isFetching && !searchQuery.data,
    error: searchQuery.error
      ? getUserFacingErrorMessage(searchQuery.error)
      : null,
  };
}

export function useUserSearch(): UseUserSearchResult {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  const { users, loading, error } = useUserSearchQuery(debouncedQuery);

  const clearQuery = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return {
    query,
    setQuery,
    clearQuery,
    isSearchActive: query.trim().length > 0,
    users,
    loading,
    error,
  };
}
