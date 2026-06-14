import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import type { AppNotification } from "../types";
import { buildGossipScript } from "../utils/buildGossipScript";

export function useGossipSpeech(notifications: AppNotification[]) {
  const [speaking, setSpeaking] = useState(false);
  const notificationsRef = useRef(notifications);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speakGossip = useCallback(async () => {
    const script = buildGossipScript(notificationsRef.current);

    try {
      const alreadySpeaking = await Speech.isSpeakingAsync();
      if (alreadySpeaking) {
        Speech.stop();
        setSpeaking(false);
        return;
      }

      setSpeaking(true);
      Speech.speak(script, {
        language: "tr-TR",
        rate: 0.92,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } catch {
      setSpeaking(false);
    }
  }, []);

  return { speakGossip, speaking };
}
