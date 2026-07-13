import { VoteButtonArrowPulse } from "@/features/profile/components/VoteButtonArrowPulse";
import { ProfileVoteCircleButton } from "@/features/profile/components/ProfileVoteCircleButton";
import { memo, useCallback, useEffect, useRef, type RefObject } from "react";
import { View, type View as RNView } from "react-native";
import type { PostVoteFountainHandle } from "./PostVoteFountainLayer";
import type { PostVoteButtonPulse } from "../hooks/usePostVoteFeedback";

const FEED_VOTE_DIAMETER = 46;
const VOTE_GAP = 6;

type PostVoteCirclePairProps = {
  onUp: () => void;
  onDown: () => void;
  disabled?: boolean;
  voteDiameter?: number;
  fountainRef?: RefObject<PostVoteFountainHandle | null>;
  buttonPulseSeq?: number;
  lastButtonPulse?: PostVoteButtonPulse | null;
  onVoteRowLayout?: () => void;
};

function PostVoteCirclePairInner({
  onUp,
  onDown,
  disabled = false,
  voteDiameter = FEED_VOTE_DIAMETER,
  fountainRef,
  buttonPulseSeq = 0,
  lastButtonPulse = null,
  onVoteRowLayout,
}: PostVoteCirclePairProps) {
  const rowRef = useRef<RNView>(null);
  const upPulseRef = useRef<RNView>(null);
  const downPulseRef = useRef<RNView>(null);

  const measureAnchors = useCallback(() => {
    const rowNode = rowRef.current;
    const upNode = upPulseRef.current;
    const downNode = downPulseRef.current;
    const patch = fountainRef?.current?.patchAnchor;

    if (!rowNode || !upNode || !downNode || !patch) {
      return;
    }

    rowNode.measureInWindow((_rowX, rowY, rowWidth, rowHeight) => {
      upNode.measureInWindow((upX, upY, upWidth, upHeight) => {
        downNode.measureInWindow((downX, downY, downWidth, downHeight) => {
          if (rowWidth <= 0 || upWidth <= 0 || downWidth <= 0) {
            return;
          }

          patch({
            contentWidth: rowWidth,
            voteRowWindowY: rowY + rowHeight / 2,
            upPulseWindowX: upX + upWidth / 2,
            upPulseWindowY: upY + upHeight / 2,
            downPulseWindowX: downX + downWidth / 2,
            downPulseWindowY: downY + downHeight / 2,
          });
        });
      });
    });
  }, [fountainRef]);

  const handleLayout = useCallback(() => {
    measureAnchors();
    onVoteRowLayout?.();
  }, [measureAnchors, onVoteRowLayout]);

  useEffect(() => {
    measureAnchors();
  }, [measureAnchors, voteDiameter]);

  const downPulseKey =
    lastButtonPulse?.direction === "down" &&
    lastButtonPulse.seq === buttonPulseSeq
      ? buttonPulseSeq
      : 0;
  const upPulseKey =
    lastButtonPulse?.direction === "up" && lastButtonPulse.seq === buttonPulseSeq
      ? buttonPulseSeq
      : 0;

  return (
    <View
      ref={rowRef}
      collapsable={false}
      onLayout={handleLayout}
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: VOTE_GAP,
      }}
    >
      <View style={{ position: "relative", alignItems: "center" }}>
        <View
          ref={downPulseRef}
          collapsable={false}
          onLayout={handleLayout}
          style={{ position: "absolute", top: -44, alignSelf: "center" }}
        >
          <VoteButtonArrowPulse direction="down" pulseKey={downPulseKey} />
        </View>
        <ProfileVoteCircleButton
          direction="down"
          onPress={onDown}
          disabled={disabled}
          diameter={voteDiameter}
          showLabel={false}
          accessibilityLabel="Alçalt, gönderi puanından 1 düşür"
        />
      </View>
      <View style={{ position: "relative", alignItems: "center" }}>
        <View
          ref={upPulseRef}
          collapsable={false}
          onLayout={handleLayout}
          style={{ position: "absolute", top: -44, alignSelf: "center" }}
        >
          <VoteButtonArrowPulse direction="up" pulseKey={upPulseKey} />
        </View>
        <ProfileVoteCircleButton
          direction="up"
          onPress={onUp}
          disabled={disabled}
          diameter={voteDiameter}
          showLabel={false}
          accessibilityLabel="Yükselt, gönderi puanına 1 ekle"
        />
      </View>
    </View>
  );
}

export const PostVoteCirclePair = memo(PostVoteCirclePairInner);
