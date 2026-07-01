import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { Text, useWindowDimensions, View, type View as RNView } from "react-native";
import {
  getProfileVoteControlLayout,
  PROFILE_VOTE_CONTROLS_MARGIN_TOP,
} from "../profileLayout";
import { getProfileSideButtonFontSize } from "./profileInstagramSideButtonStyles";
import { ProfileVoteCircleButton } from "./ProfileVoteCircleButton";
import { ProfileFollowButton } from "./ProfileFollowButton";
import { ProfileFollowStatsButton } from "./ProfileFollowStatsButton";
import { ProfileMessageButton } from "./ProfileMessageButton";
import { useProfileVoteActions, useProfileVoteDisplay } from "./ProfileVoteProvider";
import { useProfileVoteFountain } from "./profileVoteFountainContext";
import { VoteButtonArrowPulse } from "./VoteButtonArrowPulse";

type ProfileVoteControlsProps = {
  enabled: boolean;
  onUp: () => void;
  onDown: () => void;
};

function ProfileSideButton({
  isOwnProfile,
  height,
  maxWidth,
  fontSize,
  voteDiameter,
}: {
  isOwnProfile: boolean;
  height: number;
  maxWidth: number;
  fontSize: number;
  voteDiameter: number;
}) {
  if (isOwnProfile) {
    return (
      <ProfileFollowStatsButton
        height={height}
        maxWidth={maxWidth}
        fontSize={fontSize}
        voteDiameter={voteDiameter}
      />
    );
  }

  return (
    <ProfileFollowButton
      height={height}
      maxWidth={maxWidth}
      fontSize={fontSize}
      voteDiameter={voteDiameter}
    />
  );
}

function VoteTapButton({
  direction,
  onPress,
  disabled,
  diameter,
  active,
  accessibilityLabel,
  pulseKey,
  pulseRef,
  onPulseLayout,
}: {
  direction: "up" | "down";
  onPress: () => void;
  disabled: boolean;
  diameter: number;
  active: boolean;
  accessibilityLabel: string;
  pulseKey: number;
  pulseRef?: RefObject<RNView | null>;
  onPulseLayout?: () => void;
}) {
  return (
    <View style={{ position: "relative", alignItems: "center" }}>
      <View
        ref={pulseRef}
        collapsable={false}
        onLayout={onPulseLayout}
        style={{ position: "absolute", top: -44, alignSelf: "center" }}
      >
        <VoteButtonArrowPulse direction={direction} pulseKey={pulseKey} />
      </View>
      <ProfileVoteCircleButton
        direction={direction}
        onPress={onPress}
        disabled={disabled}
        diameter={diameter}
        active={active}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

export function ProfileVoteControls({
  enabled,
  onUp,
  onDown,
}: ProfileVoteControlsProps) {
  const { isOwnProfile } = useProfileVoteActions();
  const { gaugeVoteMode, buttonPulseSeq, lastButtonPulse } =
    useProfileVoteDisplay();
  const { patchFountainAnchor } = useProfileVoteFountain();
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const upPulseRef = useRef<RNView>(null);
  const downPulseRef = useRef<RNView>(null);

  const layout = useMemo(
    () => getProfileVoteControlLayout(screenWidth),
    [screenWidth]
  );
  const sideFontSize = useMemo(
    () => getProfileSideButtonFontSize(layout.sideButtonHeight, fontScale),
    [layout.sideButtonHeight, fontScale]
  );
  const sideButtonProps = useMemo(
    () => ({
      height: layout.sideButtonHeight,
      maxWidth: layout.sideButtonMaxWidth,
      fontSize: sideFontSize,
      voteDiameter: layout.voteDiameter,
    }),
    [
      layout.sideButtonHeight,
      layout.sideButtonMaxWidth,
      layout.voteDiameter,
      sideFontSize,
    ]
  );

  const measurePulseAnchors = useCallback(() => {
    const upNode = upPulseRef.current;
    const downNode = downPulseRef.current;

    if (!upNode || !downNode) {
      return;
    }

    upNode.measureInWindow((upX, upY, upWidth, upHeight) => {
      downNode.measureInWindow((downX, downY, downWidth, downHeight) => {
        if (upWidth <= 0 || downWidth <= 0) {
          return;
        }

        patchFountainAnchor({
          upPulseWindowX: upX + upWidth / 2,
          upPulseWindowY: upY + upHeight / 2,
          downPulseWindowX: downX + downWidth / 2,
          downPulseWindowY: downY + downHeight / 2,
        });
      });
    });
  }, [patchFountainAnchor]);

  useEffect(() => {
    measurePulseAnchors();
  }, [layout.stacked, layout.voteDiameter, layout.voteGap, measurePulseAnchors]);

  const downPulseKey =
    lastButtonPulse?.direction === "down" &&
    lastButtonPulse.seq === buttonPulseSeq
      ? buttonPulseSeq
      : 0;
  const upPulseKey =
    lastButtonPulse?.direction === "up" && lastButtonPulse.seq === buttonPulseSeq
      ? buttonPulseSeq
      : 0;

  const voteButtons = (
    <>
      <VoteTapButton
        direction="down"
        onPress={onDown}
        disabled={!enabled}
        diameter={layout.voteDiameter}
        active={gaugeVoteMode === "down"}
        pulseKey={downPulseKey}
        pulseRef={downPulseRef}
        onPulseLayout={measurePulseAnchors}
        accessibilityLabel="Alçalt, toplam puandan 1 düşür"
      />
      <VoteTapButton
        direction="up"
        onPress={onUp}
        disabled={!enabled}
        diameter={layout.voteDiameter}
        active={gaugeVoteMode === "up"}
        pulseKey={upPulseKey}
        pulseRef={upPulseRef}
        onPulseLayout={measurePulseAnchors}
        accessibilityLabel="Yükselt, toplam puana 1 ekle"
      />
    </>
  );

  return (
    <View
      className="mb-4 w-full"
      style={{ marginTop: PROFILE_VOTE_CONTROLS_MARGIN_TOP }}
      collapsable={false}
      onLayout={measurePulseAnchors}
    >
      {!enabled ? (
        <Text className="mb-3 text-center text-xs text-gray-500">
          Oy kullanmak ve takip etmek için giriş yapın.
        </Text>
      ) : null}

      {layout.stacked ? (
        <View collapsable={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: layout.voteGap,
              minHeight: layout.voteDiameter + 52,
              paddingTop: 16,
              paddingVertical: 4,
            }}
          >
            {voteButtons}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              minHeight: layout.voteDiameter + 6,
              marginTop: 8,
              paddingVertical: 4,
            }}
          >
            <ProfileSideButton
              isOwnProfile={isOwnProfile}
              {...sideButtonProps}
            />
            <ProfileMessageButton {...sideButtonProps} />
          </View>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            minHeight: layout.rowMinHeight + 16,
            paddingTop: 16,
            paddingVertical: 4,
          }}
          collapsable={false}
        >
          <ProfileSideButton
            isOwnProfile={isOwnProfile}
            {...sideButtonProps}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: layout.voteGap,
              marginLeft: layout.centerNudge,
              flexShrink: 0,
            }}
            collapsable={false}
          >
            {voteButtons}
          </View>

          <ProfileMessageButton {...sideButtonProps} />
        </View>
      )}
    </View>
  );
}
