import { useSyncExternalStore } from "react";

const GLOBAL_AUTOPLAY_LISTENER_KEY = "__all__";

type Listener = () => void;

let autoplayPostId: string | null = null;
let visiblePostIds = new Set<string>();

const autoplayListeners = new Map<string, Set<Listener>>();
const visibilityListeners = new Map<string, Set<Listener>>();

function subscribeMap(
  map: Map<string, Set<Listener>>,
  key: string,
  listener: Listener
): () => void {
  let listeners = map.get(key);
  if (!listeners) {
    listeners = new Set();
    map.set(key, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners!.delete(listener);
    if (listeners!.size === 0) {
      map.delete(key);
    }
  };
}

function notifyKeys(map: Map<string, Set<Listener>>, keys: Iterable<string>) {
  for (const key of keys) {
    const listeners = map.get(key);
    if (!listeners) {
      continue;
    }
    for (const listener of listeners) {
      listener();
    }
  }
}

export function resetFeedScrollVisibilityStore(): void {
  const autoplayChanged: string[] = [];
  if (autoplayPostId) {
    autoplayChanged.push(autoplayPostId);
  }
  autoplayPostId = null;

  const visibilityChanged = [...visiblePostIds];
  visiblePostIds = new Set();

  notifyKeys(autoplayListeners, autoplayChanged);
  notifyKeys(autoplayListeners, [GLOBAL_AUTOPLAY_LISTENER_KEY]);
  notifyKeys(visibilityListeners, visibilityChanged);
}

export function updateFeedScrollAutoplay(next: string | null): void {
  if (next === autoplayPostId) {
    return;
  }

  const changed: string[] = [];
  if (autoplayPostId) {
    changed.push(autoplayPostId);
  }
  if (next) {
    changed.push(next);
  }

  autoplayPostId = next;
  notifyKeys(autoplayListeners, changed);
  notifyKeys(autoplayListeners, [GLOBAL_AUTOPLAY_LISTENER_KEY]);
}

export function updateFeedVisiblePostIds(next: Set<string>): void {
  const changed = new Set<string>();

  for (const id of next) {
    if (!visiblePostIds.has(id)) {
      changed.add(id);
    }
  }
  for (const id of visiblePostIds) {
    if (!next.has(id)) {
      changed.add(id);
    }
  }

  if (changed.size === 0) {
    return;
  }

  visiblePostIds = next;
  notifyKeys(visibilityListeners, changed);
}

export function getFeedAutoplayPostId(): string | null {
  return autoplayPostId;
}

export function useFeedAutoplayPostId(): string | null {
  return useSyncExternalStore(
    (listener) =>
      subscribeMap(autoplayListeners, GLOBAL_AUTOPLAY_LISTENER_KEY, listener),
    () => autoplayPostId,
    () => autoplayPostId
  );
}

export function useIsFeedPostAutoplay(postId: string): boolean {
  return useSyncExternalStore(
    (listener) => subscribeMap(autoplayListeners, postId, listener),
    () => autoplayPostId === postId,
    () => autoplayPostId === postId
  );
}

export function useIsFeedPostMediaHighPriority(postId: string): boolean {
  return useSyncExternalStore(
    (listener) => subscribeMap(visibilityListeners, postId, listener),
    () => visiblePostIds.has(postId),
    () => visiblePostIds.has(postId)
  );
}
