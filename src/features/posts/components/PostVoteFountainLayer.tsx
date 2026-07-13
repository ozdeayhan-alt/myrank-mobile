import {
  buildVoteArrowFountainLayout,
  createVoteArrowParticles,
  trimVoteArrowParticles,
  type VoteArrowParticle,
} from "@/features/profile/components/profileVoteArrowFountain";
import { VoteArrowParticleView } from "@/features/profile/components/VoteArrowParticleView";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";

export type PostVoteFountainAnchor = {
  contentWidth: number;
  voteRowWindowY: number;
  upPulseWindowX: number;
  upPulseWindowY: number;
  downPulseWindowX: number;
  downPulseWindowY: number;
};

function isAnchorReady(
  anchor: Partial<PostVoteFountainAnchor>
): anchor is PostVoteFountainAnchor {
  return (
    anchor.contentWidth != null &&
    anchor.contentWidth > 0 &&
    anchor.voteRowWindowY != null &&
    anchor.voteRowWindowY > 0 &&
    anchor.upPulseWindowX != null &&
    anchor.upPulseWindowY != null &&
    anchor.upPulseWindowY > 0 &&
    anchor.downPulseWindowX != null &&
    anchor.downPulseWindowY != null &&
    anchor.downPulseWindowY > 0
  );
}

export type PostVoteFountainHandle = {
  trigger: (direction: "up" | "down") => void;
  patchAnchor: (patch: Partial<PostVoteFountainAnchor>) => void;
};

/** @deprecated Use PostVoteFountainHandle */
export type PostVoteBurstHandle = PostVoteFountainHandle;

export const PostVoteFountainLayer = memo(
  forwardRef<PostVoteFountainHandle>(function PostVoteFountainLayer(_props, ref) {
    const { height: screenHeight } = useWindowDimensions();
    const anchorRef = useRef<Partial<PostVoteFountainAnchor>>({});
    const [anchorVersion, setAnchorVersion] = useState(0);
    const [particles, setParticles] = useState<VoteArrowParticle[]>([]);
    const [overlayOrigin, setOverlayOrigin] = useState({ x: 0, y: 0 });
    const overlayRef = useRef<View>(null);
    const lastProcessedSpawnSeqRef = useRef(0);
    const spawnSeqRef = useRef(0);
    const pendingSpawnRef = useRef<{ seq: number; direction: "up" | "down" } | null>(
      null
    );

    const patchAnchor = useCallback((patch: Partial<PostVoteFountainAnchor>) => {
      const prev = anchorRef.current;
      let changed = false;
      for (const [key, value] of Object.entries(patch)) {
        if (prev[key as keyof PostVoteFountainAnchor] !== value) {
          changed = true;
          break;
        }
      }
      anchorRef.current = { ...prev, ...patch };
      if (changed) {
        setAnchorVersion((version) => version + 1);
      }
    }, []);

    const measureOverlayOrigin = useCallback(() => {
      overlayRef.current?.measureInWindow((x, y) => {
        setOverlayOrigin({ x, y });
      });
    }, []);

    const anchor = useMemo(() => {
      void anchorVersion;
      const value = anchorRef.current;
      return isAnchorReady(value) ? value : null;
    }, [anchorVersion]);

    const layout = useMemo(() => {
      if (!anchor) {
        return null;
      }

      const upPulseX = anchor.upPulseWindowX - overlayOrigin.x;
      const upPulseY = anchor.upPulseWindowY - overlayOrigin.y;
      const downPulseX = anchor.downPulseWindowX - overlayOrigin.x;
      const downPulseY = anchor.downPulseWindowY - overlayOrigin.y;
      const voteRowY = anchor.voteRowWindowY - overlayOrigin.y;

      if (upPulseY <= 0 || downPulseY <= 0 || voteRowY <= 0) {
        return null;
      }

      return buildVoteArrowFountainLayout({
        width: anchor.contentWidth,
        avatarTopY: upPulseY,
        upPulseX,
        upPulseY,
        downPulseX,
        downPulseY,
        voteRowY,
        screenHeight,
      });
    }, [anchor, overlayOrigin.x, overlayOrigin.y, screenHeight]);

    const spawnParticles = useCallback(
      (direction: "up" | "down") => {
        if (!layout) {
          return;
        }
        const batch = createVoteArrowParticles(direction, 1, layout);
        setParticles((current) => trimVoteArrowParticles(current, batch));
      },
      [layout]
    );

    useEffect(() => {
      const pending = pendingSpawnRef.current;
      if (!pending || !layout) {
        return;
      }
      if (pending.seq === lastProcessedSpawnSeqRef.current) {
        return;
      }
      lastProcessedSpawnSeqRef.current = pending.seq;
      pendingSpawnRef.current = null;
      spawnParticles(pending.direction);
    }, [layout, spawnParticles]);

    useImperativeHandle(
      ref,
      () => ({
        patchAnchor,
        trigger(direction) {
          const nextSeq = spawnSeqRef.current + 1;
          spawnSeqRef.current = nextSeq;
          pendingSpawnRef.current = { seq: nextSeq, direction };
          if (layout) {
            lastProcessedSpawnSeqRef.current = nextSeq;
            pendingSpawnRef.current = null;
            spawnParticles(direction);
          }
        },
      }),
      [layout, patchAnchor, spawnParticles]
    );

    const handleComplete = useCallback((id: string) => {
      setParticles((current) => current.filter((particle) => particle.id !== id));
    }, []);

    return (
      <View
        ref={overlayRef}
        pointerEvents="none"
        collapsable={false}
        onLayout={measureOverlayOrigin}
        style={styles.overlay}
      >
        {particles.map((particle) => (
          <VoteArrowParticleView
            key={particle.id}
            particle={particle}
            onComplete={handleComplete}
          />
        ))}
      </View>
    );
  })
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: Platform.OS === "android" ? 100 : 0,
  },
});
