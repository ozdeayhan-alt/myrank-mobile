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
  saveGaugeVoteModeDebounced,
  type GaugeVoteMode,
} from "../lib/gaugeVoteModeStorage";
import { useProfileVoteTap } from "../hooks/useProfileVoteTap";
import { useProfileStore } from "../store/useProfileStore";
import { ProfileVoteFountainProvider } from "./profileVoteFountainContext";

export type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";

export type VoteFlashDirection = "up" | "down" | null;

const VOTE_FLASH_MS = 450;

export type VoteArrowSpawn = {
  seq: number;
  direction: "up" | "down";
  count: number;
};

export type VoteButtonPulse = {
  seq: number;
  direction: "up" | "down";
};

type ProfileVoteActionsContextValue = {
  targetUserId: string;
  isOwnProfile: boolean;
  registerUp: () => void;
  registerDown: () => void;
  votesEnabled: boolean;
  spawnVoteArrows: (direction: "up" | "down", count?: number) => void;
  spawnButtonPulse: (direction: "up" | "down") => void;
};

type ProfileVoteDisplayContextValue = {
  displayTP: number;
  voteFlash: VoteFlashDirection;
  voteBurstKey: number;
  arrowSpawn: VoteArrowSpawn | null;
  buttonPulseSeq: number;
  lastButtonPulse: VoteButtonPulse | null;
  gaugeVoteMode: GaugeVoteMode;
  /** İlk Yükselt/Alçalt — tam merdiven fetch */
  fullLadderRequested: boolean;
};

type ProfileVoteContextValue = ProfileVoteActionsContextValue &
  ProfileVoteDisplayContextValue;

const ProfileVoteActionsContext =
  createContext<ProfileVoteActionsContextValue | null>(null);
const ProfileVoteDisplayContext =
  createContext<ProfileVoteDisplayContextValue | null>(null);

export function useProfileVoteActions(): ProfileVoteActionsContextValue {
  const ctx = useContext(ProfileVoteActionsContext);
  if (!ctx) {
    throw new Error(
      "useProfileVoteActions must be used within ProfileVoteProvider"
    );
  }
  return ctx;
}

export function useProfileVoteDisplay(): ProfileVoteDisplayContextValue {
  const ctx = useContext(ProfileVoteDisplayContext);
  if (!ctx) {
    throw new Error(
      "useProfileVoteDisplay must be used within ProfileVoteProvider"
    );
  }
  return ctx;
}

export function useProfileVoteContext(): ProfileVoteContextValue {
  const actions = useProfileVoteActions();
  const display = useProfileVoteDisplay();
  return useMemo(() => ({ ...actions, ...display }), [actions, display]);
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
  const [fullLadderRequested, setFullLadderRequested] = useState(isOwnProfile);
  const [voteFlash, setVoteFlash] = useState<VoteFlashDirection>(null);
  const [voteBurstKey, setVoteBurstKey] = useState(0);
  const [arrowSpawn, setArrowSpawn] = useState<VoteArrowSpawn | null>(null);
  const [buttonPulseSeq, setButtonPulseSeq] = useState(0);
  const [lastButtonPulse, setLastButtonPulse] = useState<VoteButtonPulse | null>(
    null
  );
  const voteFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrowSpawnSeqRef = useRef(0);
  const buttonPulseSeqRef = useRef(0);

  const spawnVoteArrows = useCallback((direction: "up" | "down", count = 1) => {
    const nextSeq = arrowSpawnSeqRef.current + 1;
    arrowSpawnSeqRef.current = nextSeq;
    setArrowSpawn({ seq: nextSeq, direction, count });
  }, []);

  const spawnButtonPulse = useCallback((direction: "up" | "down") => {
    const nextSeq = buttonPulseSeqRef.current + 1;
    buttonPulseSeqRef.current = nextSeq;
    setButtonPulseSeq(nextSeq);
    setLastButtonPulse({ seq: nextSeq, direction });
  }, []);

  useEffect(() => {
    setFullLadderRequested(isOwnProfile);
  }, [targetUserId, isOwnProfile]);

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
    setVoteBurstKey((key) => key + 1);
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

  const castUpVote = useCallback(() => {
    if (!votesEnabled) {
      return;
    }
    registerUp();
    setFullLadderRequested(true);
    setGaugeVoteMode("up");
    saveGaugeVoteModeDebounced(targetUserId, "up");
  }, [registerUp, votesEnabled, targetUserId]);

  const castDownVote = useCallback(() => {
    if (!votesEnabled) {
      return;
    }
    registerDown();
    setFullLadderRequested(true);
    setGaugeVoteMode("down");
    saveGaugeVoteModeDebounced(targetUserId, "down");
  }, [registerDown, votesEnabled, targetUserId]);

  const registerUpWithFeedback = useCallback(() => {
    castUpVote();
    if (votesEnabled) {
      triggerVoteHaptic();
      flashVote("up");
      spawnButtonPulse("up");
      spawnVoteArrows("up", 1);
    }
  }, [castUpVote, votesEnabled, flashVote, spawnButtonPulse, spawnVoteArrows]);

  const registerDownWithFeedback = useCallback(() => {
    castDownVote();
    if (votesEnabled) {
      triggerVoteHaptic();
      flashVote("down");
      spawnButtonPulse("down");
      spawnVoteArrows("down", 1);
    }
  }, [castDownVote, votesEnabled, flashVote, spawnButtonPulse, spawnVoteArrows]);

  const actionsValue = useMemo(
    (): ProfileVoteActionsContextValue => ({
      targetUserId,
      isOwnProfile,
      registerUp: registerUpWithFeedback,
      registerDown: registerDownWithFeedback,
      votesEnabled,
      spawnVoteArrows,
      spawnButtonPulse,
    }),
    [
      targetUserId,
      isOwnProfile,
      registerUpWithFeedback,
      registerDownWithFeedback,
      votesEnabled,
      spawnVoteArrows,
      spawnButtonPulse,
    ]
  );

  const displayValue = useMemo(
    (): ProfileVoteDisplayContextValue => ({
      displayTP,
      voteFlash,
      voteBurstKey,
      arrowSpawn,
      buttonPulseSeq,
      lastButtonPulse,
      gaugeVoteMode,
      fullLadderRequested,
    }),
    [
      displayTP,
      voteFlash,
      voteBurstKey,
      arrowSpawn,
      buttonPulseSeq,
      lastButtonPulse,
      gaugeVoteMode,
      fullLadderRequested,
    ]
  );

  return (
    <ProfileVoteActionsContext.Provider value={actionsValue}>
      <ProfileVoteDisplayContext.Provider value={displayValue}>
        <ProfileVoteFountainProvider>{children}</ProfileVoteFountainProvider>
      </ProfileVoteDisplayContext.Provider>
    </ProfileVoteActionsContext.Provider>
  );
}
