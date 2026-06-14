import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  type KeyboardEvent,
} from "react-native";

function getKeyboardBottomOffset(event: KeyboardEvent) {
  if (Platform.OS === "android") {
    const windowHeight = Dimensions.get("window").height;
    const keyboardTop = event.endCoordinates.screenY;
    return Math.max(0, windowHeight - keyboardTop);
  }

  return event.endCoordinates.height;
}

export function useKeyboardBottomOffset() {
  const [offset, setOffset] = useState(0);
  const remeasureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const clearRemeasureTimer = () => {
      if (remeasureTimerRef.current) {
        clearTimeout(remeasureTimerRef.current);
        remeasureTimerRef.current = null;
      }
    };

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setOffset(getKeyboardBottomOffset(event));

      if (Platform.OS === "android") {
        clearRemeasureTimer();
        remeasureTimerRef.current = setTimeout(() => {
          setOffset(getKeyboardBottomOffset(event));
        }, 100);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      clearRemeasureTimer();
      setOffset(0);
    });

    return () => {
      clearRemeasureTimer();
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return offset;
}

/** @deprecated Use useKeyboardBottomOffset */
export function useKeyboardHeight() {
  return useKeyboardBottomOffset();
}
