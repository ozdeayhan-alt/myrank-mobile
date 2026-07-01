import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import {
  buildVoteArrowFountainLayout,
  createVoteArrowParticles,
  trimVoteArrowParticles,
  type VoteArrowParticle,
} from "./profileVoteArrowFountain";
import { VoteArrowParticleView } from "./VoteArrowParticleView";
import { useProfileVoteDisplay } from "./ProfileVoteProvider";
import { useProfileVoteFountain } from "./profileVoteFountainContext";

function ProfileVoteArrowFountainOverlayInner() {
  const { height: screenHeight } = useWindowDimensions();
  const { arrowSpawn } = useProfileVoteDisplay();
  const { getFountainAnchor, fountainAnchorVersion } = useProfileVoteFountain();
  const [particles, setParticles] = useState<VoteArrowParticle[]>([]);
  const [overlayOrigin, setOverlayOrigin] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<View>(null);
  const lastProcessedSpawnSeqRef = useRef(0);

  const measureOverlayOrigin = useCallback(() => {
    overlayRef.current?.measureInWindow((x, y) => {
      setOverlayOrigin({ x, y });
    });
  }, []);

  const fountainAnchor = useMemo(
    () => getFountainAnchor(),
    [getFountainAnchor, fountainAnchorVersion]
  );

  const layout = useMemo(() => {
    if (!fountainAnchor) {
      return null;
    }

    const avatarTopY = fountainAnchor.avatarWindowY - overlayOrigin.y;
    const voteRowY = fountainAnchor.voteRowWindowY - overlayOrigin.y;
    const upPulseX = fountainAnchor.upPulseWindowX - overlayOrigin.x;
    const upPulseY = fountainAnchor.upPulseWindowY - overlayOrigin.y;
    const downPulseX = fountainAnchor.downPulseWindowX - overlayOrigin.x;
    const downPulseY = fountainAnchor.downPulseWindowY - overlayOrigin.y;

    if (
      fountainAnchor.contentWidth <= 0 ||
      voteRowY <= 0 ||
      avatarTopY <= 0 ||
      upPulseY <= 0 ||
      downPulseY <= 0
    ) {
      return null;
    }

    return buildVoteArrowFountainLayout({
      width: fountainAnchor.contentWidth,
      avatarTopY,
      upPulseX,
      upPulseY,
      downPulseX,
      downPulseY,
      voteRowY,
      screenHeight,
    });
  }, [fountainAnchor, overlayOrigin.x, overlayOrigin.y, screenHeight]);

  useEffect(() => {
    if (!layout || !arrowSpawn) {
      return;
    }
    if (arrowSpawn.seq === lastProcessedSpawnSeqRef.current) {
      return;
    }
    lastProcessedSpawnSeqRef.current = arrowSpawn.seq;

    const batch = createVoteArrowParticles(
      arrowSpawn.direction,
      arrowSpawn.count,
      layout
    );
    setParticles((current) => trimVoteArrowParticles(current, batch));
  }, [arrowSpawn, layout]);

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
}

export const ProfileVoteArrowFountainOverlay = ProfileVoteArrowFountainOverlayInner;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: Platform.OS === "android" ? 100 : 0,
  },
});
