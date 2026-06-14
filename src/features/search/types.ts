export type SearchUserResult = {
  userId: string;
  displayName: string;
  photoURL: string | null;
};

export type SearchUsersResponse = {
  ok: boolean;
  users: SearchUserResult[];
  query?: string;
  error?: string;
};
