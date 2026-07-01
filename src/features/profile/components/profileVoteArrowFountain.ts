export type VoteArrowParticle = {
  id: string;
  direction: "up" | "down";
  x: number;
  y: number;
  size: number;
  delay: number;
  travelX: number;
  travelY: number;
  curveBias: number;
};

export type VoteArrowFountainLayout = {
  width: number;
  upPulseX: number;
  upPulseY: number;
  downPulseX: number;
  downPulseY: number;
  upTravelY: number;
  downTravelY: number;
  horizontalTravel: number;
};

const MAX_PARTICLES = 12;
const STREAM_STAGGER_MIN_MS = 70;
const STREAM_STAGGER_MAX_MS = 120;

export function createVoteArrowParticles(
  direction: "up" | "down",
  count: number,
  layout: VoteArrowFountainLayout
): VoteArrowParticle[] {
  if (direction === "up") {
    return Array.from({ length: count }, (_, index) => {
      const travelX = layout.horizontalTravel + randomBetween(8, 24);
      return {
        id: `${Date.now()}-up-${index}-${Math.random().toString(36).slice(2, 8)}`,
        direction: "up" as const,
        x: layout.upPulseX + randomBetween(-6, 6),
        y: layout.upPulseY + randomBetween(-4, 4),
        size: Math.round(randomBetween(28, 36)),
        delay:
          index === 0
            ? 0
            : index * randomBetween(STREAM_STAGGER_MIN_MS, STREAM_STAGGER_MAX_MS),
        travelX,
        travelY: -layout.upTravelY,
        curveBias: randomBetween(-6, 10),
      };
    });
  }

  return Array.from({ length: count }, (_, index) => {
    const travelX = -layout.horizontalTravel + randomBetween(-24, -8);
    return {
      id: `${Date.now()}-down-${index}-${Math.random().toString(36).slice(2, 8)}`,
      direction: "down" as const,
      x: layout.downPulseX + randomBetween(-6, 6),
      y: layout.downPulseY + randomBetween(-4, 4),
      size: Math.round(randomBetween(28, 36)),
      delay:
        index === 0
          ? 0
          : index * randomBetween(STREAM_STAGGER_MIN_MS, STREAM_STAGGER_MAX_MS),
      travelX,
      travelY: layout.downTravelY,
      curveBias: randomBetween(-10, 6),
    };
  });
}

export function trimVoteArrowParticles(
  particles: VoteArrowParticle[],
  incoming: VoteArrowParticle[]
): VoteArrowParticle[] {
  const merged = [...particles, ...incoming];
  if (merged.length <= MAX_PARTICLES) {
    return merged;
  }
  return merged.slice(merged.length - MAX_PARTICLES);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function buildVoteArrowFountainLayout({
  width,
  avatarTopY,
  upPulseX,
  upPulseY,
  downPulseX,
  downPulseY,
  voteRowY,
  screenHeight,
}: {
  width: number;
  avatarTopY: number;
  upPulseX: number;
  upPulseY: number;
  downPulseX: number;
  downPulseY: number;
  voteRowY: number;
  screenHeight: number;
}): VoteArrowFountainLayout | null {
  if (width <= 0 || voteRowY <= 0 || upPulseY <= 0 || downPulseY <= 0) {
    return null;
  }

  const upTravelY = Math.max(100, upPulseY - 16);
  const downTravelY = Math.max(
    100,
    Math.min(screenHeight * 0.35, voteRowY + 80) - downPulseY
  );

  return {
    width,
    upPulseX,
    upPulseY,
    downPulseX,
    downPulseY,
    upTravelY,
    downTravelY,
    horizontalTravel: Math.max(56, width * 0.14),
  };
}
