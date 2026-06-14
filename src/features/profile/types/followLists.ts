export type FollowUserSummary = {
  userId: string;
  displayName: string;
  photoURL: string | null;
};

export type FollowCounts = {
  followingCount: number;
  followersCount: number;
};

export type FollowListResponse = {
  ok: boolean;
  users: FollowUserSummary[];
  nextCursor: string | null;
  error?: string;
};
