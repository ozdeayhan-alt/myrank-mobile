import { useCallback, useRef, useState } from "react";
import type { PostVoteFountainHandle } from "../components/PostVoteFountainLayer";

export type PostVoteButtonPulse = {
  seq: number;
  direction: "up" | "down";
};

export function usePostVoteFeedback() {
  const fountainRef = useRef<PostVoteFountainHandle>(null);
  const pulseSeqRef = useRef(0);
  const [buttonPulseSeq, setButtonPulseSeq] = useState(0);
  const [lastButtonPulse, setLastButtonPulse] = useState<PostVoteButtonPulse | null>(
    null
  );

  const triggerFeedback = useCallback((direction: "up" | "down") => {
    fountainRef.current?.trigger(direction);
    const seq = pulseSeqRef.current + 1;
    pulseSeqRef.current = seq;
    setButtonPulseSeq(seq);
    setLastButtonPulse({ seq, direction });
  }, []);

  return {
    fountainRef,
    triggerFeedback,
    buttonPulseSeq,
    lastButtonPulse,
  };
}
