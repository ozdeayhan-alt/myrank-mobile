import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  Text,
  View,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useShareIntentContext } from "expo-share-intent";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth";
import {
  isMetadataComplete,
  useProfileStore,
} from "@/features/profile";
import { recordError } from "@/lib/crashReporting";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import { parseShareIntent } from "./parseShareIntent";
import {
  refreshShareIntentNative,
  subscribeShareIntentRefreshOnActive,
} from "./refreshShareIntentNative";
import {
  enqueueSharePayload,
  consumePendingSharePayload,
  markShared,
  peekPendingSharePayload,
  readShareQueue,
  savePendingSharePayload,
  wasRecentlyShared,
  writeShareQueue,
  type QueuedSharePayload,
} from "./shareIntentQueue";
import { isNetworkError, processSharePayload } from "./processSharePayload";
import type { ParsedSharePayload } from "./classifySharePayload";

type ShareUiPhase = "idle" | "processing" | "success" | "error";

const SUCCESS_DISMISS_MS = 2000;

export function ShareIntentOrchestrator() {
  if (Platform.OS !== "android") {
    return null;
  }

  return <ShareIntentOrchestratorAndroid />;
}

function ShareIntentOrchestratorAndroid() {
  const { user, initializing } = useAuth();
  const { hasShareIntent, shareIntent, resetShareIntent, error, isReady } =
    useShareIntentContext();
  const metadata = useProfileStore((s) => s.metadata);
  const isProfileBootstrapSettled = useProfileStore(
    (s) => s.isProfileBootstrapSettled
  );
  const profileSavedOnServer = useProfileStore((s) => s.profileSavedOnServer);

  const [phase, setPhase] = useState<ShareUiPhase>("idle");
  const [message, setMessage] = useState<string>("");
  const [pendingVersion, setPendingVersion] = useState(0);
  const processingRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const capturingRef = useRef(false);

  const profileReady =
    Boolean(user) &&
    isProfileBootstrapSettled &&
    isMetadataComplete(metadata) &&
    profileSavedOnServer;

  const canProcess =
    isReady && !initializing && Boolean(user?.uid) && profileReady;

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const finishShareSession = useCallback(() => {
    clearDismissTimer();
    resetShareIntent();
    setPhase("idle");
    setMessage("");
    processingRef.current = false;
  }, [clearDismissTimer, resetShareIntent]);

  const showSuccessAndExit = useCallback(() => {
    setPhase("success");
    setMessage("Paylaşım profilinde yayınlandı.");
    clearDismissTimer();
    dismissTimerRef.current = setTimeout(() => {
      finishShareSession();
      BackHandler.exitApp();
    }, SUCCESS_DISMISS_MS);
  }, [clearDismissTimer, finishShareSession]);

  const runPayload = useCallback(
    async (payload: ParsedSharePayload) => {
      if (!user?.uid || !profileReady) {
        await savePendingSharePayload(payload);
        return;
      }

      if (await wasRecentlyShared(payload.dedupeKey)) {
        setPhase("success");
        setMessage("Bu içerik az önce zaten paylaşıldı.");
        clearDismissTimer();
        dismissTimerRef.current = setTimeout(() => {
          finishShareSession();
          BackHandler.exitApp();
        }, SUCCESS_DISMISS_MS);
        return;
      }

      setPhase("processing");
      setMessage("MyRank'e paylaşılıyor…");

      try {
        await processSharePayload(user.uid, payload);
        await markShared(payload.dedupeKey);
        showSuccessAndExit();
      } catch (err) {
        if (isNetworkError(err)) {
          await enqueueSharePayload(payload);
          setPhase("error");
          setMessage(
            "İnternet yok. Paylaşım kuyruğa alındı; bağlantı gelince yayınlanacak."
          );
          recordError(err, "ShareIntent:network-queue");
          clearDismissTimer();
          dismissTimerRef.current = setTimeout(() => finishShareSession(), 2500);
          return;
        }

        recordError(err, "ShareIntent:process");
        setPhase("error");
        setMessage(
          err instanceof Error ? err.message : "Paylaşım tamamlanamadı."
        );
        clearDismissTimer();
        dismissTimerRef.current = setTimeout(() => finishShareSession(), 2500);
      }
    },
    [
      clearDismissTimer,
      finishShareSession,
      profileReady,
      showSuccessAndExit,
      user?.uid,
    ]
  );

  const flushQueue = useCallback(async () => {
    if (!user?.uid || !profileReady || processingRef.current) {
      return;
    }

    const queue = await readShareQueue();
    if (queue.length === 0) {
      return;
    }

    processingRef.current = true;
    setPhase("processing");
    setMessage("Bekleyen paylaşım gönderiliyor…");

    const remaining: QueuedSharePayload[] = [];
    for (const item of queue) {
      try {
        if (!(await wasRecentlyShared(item.dedupeKey))) {
          await processSharePayload(user.uid, item);
          await markShared(item.dedupeKey);
        }
      } catch (err) {
        if (isNetworkError(err)) {
          remaining.push(item);
          break;
        }
        recordError(err, "ShareIntent:queue-item");
      }
    }

    await writeShareQueue(remaining);
    processingRef.current = false;

    if (remaining.length === 0) {
      showSuccessAndExit();
    } else {
      setPhase("error");
      setMessage("Bağlantı yok. Paylaşım kuyrukta bekliyor.");
      clearDismissTimer();
      dismissTimerRef.current = setTimeout(() => finishShareSession(), 2500);
    }
  }, [clearDismissTimer, finishShareSession, profileReady, showSuccessAndExit, user?.uid]);

  const processPendingShare = useCallback(async () => {
    if (!canProcess || processingRef.current || capturingRef.current) {
      return;
    }

    const pending = await peekPendingSharePayload();
    if (!pending) {
      await flushQueue();
      return;
    }

    processingRef.current = true;
    const payload = await consumePendingSharePayload();
    if (payload) {
      await runPayload(payload);
    }
    processingRef.current = false;
  }, [canProcess, flushQueue, runPayload]);

  useEffect(() => {
    return subscribeShareIntentRefreshOnActive();
  }, []);

  useEffect(() => {
    refreshShareIntentNative();
  }, []);

  useEffect(() => {
    if (!isReady || !hasShareIntent || !shareIntent || capturingRef.current) {
      return;
    }

    if (error) {
      recordError(error, "ShareIntent:native-error");
    }

    const payload = parseShareIntent(shareIntent);
    if (!payload) {
      setPhase("error");
      setMessage("Paylaşılan içerik okunamadı.");
      clearDismissTimer();
      dismissTimerRef.current = setTimeout(() => finishShareSession(), 2000);
      return;
    }

    capturingRef.current = true;
    void (async () => {
      try {
        await savePendingSharePayload(payload);
        resetShareIntent();
        setPendingVersion((value) => value + 1);
      } finally {
        capturingRef.current = false;
      }
    })();
  }, [
    clearDismissTimer,
    error,
    finishShareSession,
    hasShareIntent,
    isReady,
    resetShareIntent,
    shareIntent,
  ]);

  useEffect(() => {
    void processPendingShare();
  }, [canProcess, pendingVersion, processPendingShare]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        void processPendingShare();
      }
    });
    return unsubscribe;
  }, [processPendingShare]);

  useEffect(() => {
    return () => clearDismissTimer();
  }, [clearDismissTimer]);

  const visible = phase !== "idle";

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View className="flex-1 items-center justify-center bg-white px-8">
        {phase === "processing" ? (
          <ActivityIndicator size="large" color={SPINNER_COLOR} />
        ) : phase === "success" ? (
          <Ionicons name="checkmark-circle" size={56} color="#111827" />
        ) : (
          <Ionicons name="alert-circle-outline" size={56} color="#6B7280" />
        )}

        <Text className="mt-6 text-center text-xl font-bold text-gray-900">
          {phase === "success"
            ? "MyRank'te paylaşıldı"
            : phase === "processing"
              ? "Paylaşılıyor"
              : "Paylaşım"}
        </Text>

        {message ? (
          <Text className="mt-3 text-center text-base text-gray-600">
            {message}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}
