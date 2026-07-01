import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ProfileVoteFountainAnchor } from "./profileVoteFountainAnchor";

function isFountainAnchorReady(
  anchor: Partial<ProfileVoteFountainAnchor>
): anchor is ProfileVoteFountainAnchor {
  return (
    anchor.contentWidth != null &&
    anchor.contentWidth > 0 &&
    anchor.avatarWindowY != null &&
    anchor.avatarWindowY > 0 &&
    anchor.upPulseWindowX != null &&
    anchor.upPulseWindowY != null &&
    anchor.downPulseWindowX != null &&
    anchor.downPulseWindowY != null &&
    anchor.voteRowWindowY != null &&
    anchor.voteRowWindowY > 0
  );
}

type ProfileVoteFountainContextValue = {
  patchFountainAnchor: (patch: Partial<ProfileVoteFountainAnchor>) => void;
  getFountainAnchor: () => ProfileVoteFountainAnchor | null;
  fountainAnchorVersion: number;
};

const ProfileVoteFountainContext =
  createContext<ProfileVoteFountainContextValue | null>(null);

export function ProfileVoteFountainProvider({ children }: { children: ReactNode }) {
  const anchorRef = useRef<Partial<ProfileVoteFountainAnchor>>({});
  const [fountainAnchorVersion, setFountainAnchorVersion] = useState(0);

  const patchFountainAnchor = useCallback(
    (patch: Partial<ProfileVoteFountainAnchor>) => {
      const prev = anchorRef.current;
      let changed = false;
      for (const [key, value] of Object.entries(patch)) {
        if (prev[key as keyof ProfileVoteFountainAnchor] !== value) {
          changed = true;
          break;
        }
      }
      anchorRef.current = { ...prev, ...patch };
      if (changed) {
        setFountainAnchorVersion((version) => version + 1);
      }
    },
    []
  );

  const getFountainAnchor = useCallback((): ProfileVoteFountainAnchor | null => {
    const anchor = anchorRef.current;
    return isFountainAnchorReady(anchor) ? anchor : null;
  }, []);

  const value = useMemo(
    (): ProfileVoteFountainContextValue => ({
      patchFountainAnchor,
      getFountainAnchor,
      fountainAnchorVersion,
    }),
    [patchFountainAnchor, getFountainAnchor, fountainAnchorVersion]
  );

  return (
    <ProfileVoteFountainContext.Provider value={value}>
      {children}
    </ProfileVoteFountainContext.Provider>
  );
}

export function useProfileVoteFountain(): ProfileVoteFountainContextValue {
  const ctx = useContext(ProfileVoteFountainContext);
  if (!ctx) {
    throw new Error(
      "useProfileVoteFountain must be used within ProfileVoteFountainProvider"
    );
  }
  return ctx;
}
