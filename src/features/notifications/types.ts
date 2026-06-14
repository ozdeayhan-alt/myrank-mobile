export type NotificationType =
  | "post_liked"
  | "post_commented"
  | "post_saved"
  | "post_reposted"
  | "message_received"
  | "profile_votes"
  | "rank_passed"
  | "user_followed"
  | "post_mentioned";

export type NotificationPayload = {
  postId?: string;
  repostId?: string;
  conversationId?: string;
  voteDelta?: number;
  segmentKey?: string;
  segmentLabel?: string;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  actorId: string;
  actorDisplayName: string;
  payload: NotificationPayload;
  createdAt: Date | null;
};
