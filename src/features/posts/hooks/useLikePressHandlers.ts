import { useCallback, useRef } from "react";
import { triggerLikeHaptic } from "@/lib/likeFeedback";

type UseBonusPressHandlersOptions = {
  active: boolean;
  onToggle: () => void;
  onOpenBonusPicker: () => void;
};

/** Kısa dokunuş: toggle. Basılı tut: bonus seçici. */
export function useBonusPressHandlers({
  active,
  onToggle,
  onOpenBonusPicker,
}: UseBonusPressHandlersOptions) {
  const longPressHandledRef = useRef(false);

  const onPress = useCallback(() => {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;
      return;
    }
    if (!active) {
      triggerLikeHaptic();
    }
    onToggle();
  }, [active, onToggle]);

  const onLongPress = useCallback(() => {
    longPressHandledRef.current = true;
    triggerLikeHaptic();
    onOpenBonusPicker();
  }, [onOpenBonusPicker]);

  return { onPress, onLongPress };
}

/** @deprecated Use useBonusPressHandlers */
export function useLikePressHandlers(options: {
  liked: boolean;
  onToggleLike: () => void;
  onOpenBonusPicker: () => void;
}) {
  return useBonusPressHandlers({
    active: options.liked,
    onToggle: options.onToggleLike,
    onOpenBonusPicker: options.onOpenBonusPicker,
  });
}
