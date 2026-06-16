import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import type { AppNotification } from "../types";
import { buildGossipScriptParts } from "../utils/buildGossipScript";
import { pickGossipVoice } from "../utils/pickGossipVoice";
import { speakGossipChunks } from "../utils/speakGossipChunks";

const GOSSIP_SPEECH_RATE = 0.9;
const GOSSIP_SPEECH_PITCH_FEMALE = 1.12;
const GOSSIP_SPEECH_PITCH_FALLBACK = 1.24;

type UseGossipSpeechOptions = {
  recipientDisplayName?: string;
};

export function useGossipSpeech(
  notifications: AppNotification[],
  options: UseGossipSpeechOptions = {}
) {
  const [speaking, setSpeaking] = useState(false);
  const notificationsRef = useRef(notifications);
  const recipientDisplayNameRef = useRef(options.recipientDisplayName ?? "");
  const voiceRef = useRef<string | undefined>(undefined);
  const isFemaleVoiceRef = useRef(false);
  const speakGenerationRef = useRef(0);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    recipientDisplayNameRef.current = options.recipientDisplayName ?? "";
  }, [options.recipientDisplayName]);

  useEffect(() => {
    void pickGossipVoice().then((selection) => {
      voiceRef.current = selection.voice;
      isFemaleVoiceRef.current = selection.isFemale;
    });

    return () => {
      speakGenerationRef.current += 1;
      Speech.stop();
    };
  }, []);

  const speakGossip = useCallback(async () => {
    const { parts } = buildGossipScriptParts(notificationsRef.current, {
      recipientDisplayName: recipientDisplayNameRef.current,
    });

    try {
      const alreadySpeaking = await Speech.isSpeakingAsync();
      if (alreadySpeaking) {
        speakGenerationRef.current += 1;
        Speech.stop();
        setSpeaking(false);
        return;
      }

      if (!voiceRef.current) {
        const selection = await pickGossipVoice();
        voiceRef.current = selection.voice;
        isFemaleVoiceRef.current = selection.isFemale;
      }

      const generation = speakGenerationRef.current + 1;
      speakGenerationRef.current = generation;
      setSpeaking(true);

      await speakGossipChunks(
        parts,
        {
          language: "tr-TR",
          voice: voiceRef.current,
          rate: GOSSIP_SPEECH_RATE,
          pitch: isFemaleVoiceRef.current
            ? GOSSIP_SPEECH_PITCH_FEMALE
            : GOSSIP_SPEECH_PITCH_FALLBACK,
        },
        () => speakGenerationRef.current !== generation
      );

      if (speakGenerationRef.current === generation) {
        setSpeaking(false);
      }
    } catch {
      setSpeaking(false);
    }
  }, []);

  return { speakGossip, speaking };
}
