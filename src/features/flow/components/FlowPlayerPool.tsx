import { memo, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { Post } from "@/features/posts/types";
import { FlowEmbedPlayer } from "./FlowEmbedPlayer";

type FlowPlayerPoolProps = {
  current: Post;
  previous: Post | null;
  next: Post | null;
};

const FLOW_POOL_SLOT_KEYS = ["flow-pool-0", "flow-pool-1", "flow-pool-2"] as const;
type FlowPoolSlotKey = (typeof FLOW_POOL_SLOT_KEYS)[number];

type PoolSlot = {
  slotKey: FlowPoolSlotKey;
  post: Post;
  active: boolean;
  inWindow: boolean;
};

function useFlowPoolSlots(
  current: Post,
  previous: Post | null,
  next: Post | null
): PoolSlot[] {
  const postToSlotRef = useRef(new Map<string, FlowPoolSlotKey>());
  const slotToPostRef = useRef(new Map<FlowPoolSlotKey, string>());
  const lastPostBySlotRef = useRef(new Map<FlowPoolSlotKey, Post>());

  return useMemo(() => {
    const wanted: Array<{ post: Post; active: boolean }> = [
      { post: current, active: true },
    ];
    if (previous) {
      wanted.push({ post: previous, active: false });
    }
    if (next) {
      wanted.push({ post: next, active: false });
    }

    const wantedIds = new Set(wanted.map((entry) => entry.post.id));

    for (const [slotKey, postId] of [...slotToPostRef.current.entries()]) {
      if (!wantedIds.has(postId)) {
        slotToPostRef.current.delete(slotKey);
        postToSlotRef.current.delete(postId);
      }
    }

    for (const { post } of wanted) {
      if (postToSlotRef.current.has(post.id)) {
        continue;
      }
      const freeSlot = FLOW_POOL_SLOT_KEYS.find(
        (slotKey) => !slotToPostRef.current.has(slotKey)
      );
      if (!freeSlot) {
        continue;
      }
      postToSlotRef.current.set(post.id, freeSlot);
      slotToPostRef.current.set(freeSlot, post.id);
    }

    return FLOW_POOL_SLOT_KEYS.flatMap((slotKey) => {
      const postId = slotToPostRef.current.get(slotKey);
      const match = wanted.find((entry) => entry.post.id === postId);
      const post =
        match?.post ?? lastPostBySlotRef.current.get(slotKey) ?? null;

      if (!post) {
        return [];
      }

      if (match?.post) {
        lastPostBySlotRef.current.set(slotKey, match.post);
      }

      return [
        {
          slotKey,
          post,
          active: match?.active ?? false,
          inWindow: Boolean(match),
        },
      ];
    });
  }, [current, next, previous]);
}

/**
 * Three persistent WebView slots. Post-to-slot mapping survives swipes so the
 * same YT.Player can loadVideoById/cueVideoById instead of remounting.
 */
export const FlowPlayerPool = memo(function FlowPlayerPool({
  current,
  previous,
  next,
}: FlowPlayerPoolProps) {
  const slots = useFlowPoolSlots(current, previous, next);

  return (
    <View style={styles.root}>
      {slots.map(({ slotKey, post, active, inWindow }) => (
        <View
          key={slotKey}
          style={[
            styles.slot,
            inWindow && active ? styles.slotActive : styles.slotHidden,
          ]}
          pointerEvents={inWindow && active ? "auto" : "none"}
          collapsable={false}
        >
          <FlowEmbedPlayer
            post={post}
            fill
            active={inWindow && active}
          />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slot: {
    ...StyleSheet.absoluteFillObject,
  },
  slotActive: {
    zIndex: 2,
    opacity: 1,
  },
  slotHidden: {
    zIndex: 1,
    opacity: 0,
  },
});
