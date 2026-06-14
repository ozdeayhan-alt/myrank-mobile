import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth";
import { triggerVoteHaptic } from "@/lib/voteFeedback";
import {
  loadGaugeVoteMode,
  saveGaugeVoteMode,
  type GaugeVoteMode,
} from "../lib/gaugeVoteModeStorage";
export type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";

import { useProfileVoteTap } from "../hooks/useProfileVoteTap";
import { useProfileStore } from "../store/useProfileStore";

export type VoteFlashDirection = "up" | "down" | null;

const VOTE_FLASH_MS = 700;

type ProfileVoteContextValue = {
  targetUserId: string;
  isOwnProfile: boolean;
  displayTP: number;
  voteFlash: VoteFlashDirection;
  /** Son oy modu: null = nötr (henüz oy yok / ilk açılış) */
  gaugeVoteMode: GaugeVoteMode;
  registerUp: () => void;
  registerDown: () => void;
  votesEnabled: boolean;
};

const ProfileVoteContext = createContext<ProfileVoteContextValue | null>(null);

export function useProfileVoteContext(): ProfileVoteContextValue {
  const ctx = useContext(ProfileVoteContext);
  if (!ctx) {
    throw new Error("useProfileVoteContext must be used within ProfileVoteProvider");
  }
  return ctx;
}

type ProfileVoteProviderProps = {
  targetUserId: string;
  loadedTotalScore: number;
  isOwnProfile: boolean;
  children: ReactNode;
};

export function ProfileVoteProvider({
  targetUserId,
  loadedTotalScore,
  isOwnProfile,
  children,
}: ProfileVoteProviderProps) {
  const { user } = useAuth();
  const storeTotalScore = useProfileStore((s) => s.totalScore);
  const setStoreTotalScore = useProfileStore((s) => s.setTotalScore);
  const votesEnabled = Boolean(user?.uid);

  const initialTotalScore = useMemo(
    () => (isOwnProfile ? storeTotalScore : loadedTotalScore),
    [isOwnProfile, storeTotalScore, loadedTotalScore]
  );

  const handleFlushedScore = useCallback(
    (score: number) => {
      if (isOwnProfile) {
        setStoreTotalScore(score);
      }
    },
    [isOwnProfile, setStoreTotalScore]
  );

  const { displayTP, registerUp, registerDown } = useProfileVoteTap({
    targetUserId,
    initialTotalScore,
    enabled: votesEnabled,
    onFlushedScore: handleFlushedScore,
  });

  const [gaugeVoteMode, setGaugeVoteMode] = useState<GaugeVoteMode>(null);
  const [voteFlash, setVoteFlash] = useState<VoteFlashDirection>(null);
  const voteFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadGaugeVoteMode(targetUserId).then((mode) => {
      if (!cancelled) {
        setGaugeVoteMode(mode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [targetUserId]);

  const flashVote = useCallback((direction: "up" | "down") => {
    if (voteFlashTimerRef.current) {
      clearTimeout(voteFlashTimerRef.current);
    }
    setVoteFlash(direction);
    voteFlashTimerRef.current = setTimeout(() => {
      voteFlashTimerRef.current = null;
      setVoteFlash(null);
    }, VOTE_FLASH_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (voteFlashTimerRef.current) {
        clearTimeout(voteFlashTimerRef.current);
      }
    };
  }, []);

  const registerUpWithFeedback = useCallback(() => {
    registerUp();
    setGaugeVoteMode("up");
    void saveGaugeVoteMode(targetUserId, "up");
    if (votesEnabled) {
      triggerVoteHaptic();
      flashVote("up");
    }
  }, [registerUp, votesEnabled, flashVote, targetUserId]);

  const registerDownWithFeedback = useCallback(() => {
    registerDown();
    setGaugeVoteMode("down");
    void saveGaugeVoteMode(targetUserId, "down");
    if (votesEnabled) {
      triggerVoteHaptic();
      flashVote("down");
    }
  }, [registerDown, votesEnabled, flashVote, targetUserId]);

  const value = useMemo(
    (): ProfileVoteContextValue => ({
      targetUserId,
      isOwnProfile,
      displayTP,
      voteFlash,
      gaugeVoteMode,
      registerUp: registerUpWithFeedback,
      registerDown: registerDownWithFeedback,
      votesEnabled,
    }),
    [
      targetUserId,
      isOwnProfile,
      displayTP,
      voteFlash,
      gaugeVoteMode,
      registerUpWithFeedback,
      registerDownWithFeedback,
      votesEnabled,
    ]
  );

  return (
    <ProfileVoteContext.Provider value={value}>
      {children}
    </ProfileVoteContext.Provider>
  );
}
