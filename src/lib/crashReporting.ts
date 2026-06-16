import { Platform } from "react-native";

type CrashlyticsFn = () => {
  setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<void> | void;
  log: (message: string) => void;
  recordError: (error: Error) => void;
  setUserId: (userId: string) => Promise<void> | void;
};

let crashlyticsFactory: CrashlyticsFn | null | undefined;

function getCrashlytics(): CrashlyticsFn | null {
  if (crashlyticsFactory !== undefined) {
    return crashlyticsFactory;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    crashlyticsFactory = require("@react-native-firebase/crashlytics")
      .default as CrashlyticsFn;
  } catch {
    crashlyticsFactory = null;
  }

  return crashlyticsFactory;
}

export async function initCrashReporting(): Promise<void> {
  if (__DEV__) {
    return;
  }

  const crashlytics = getCrashlytics();
  if (!crashlytics) {
    return;
  }

  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
    crashlytics().log("app_start");
  } catch {
    // Crash reporting must never block app boot.
  }
}

export function recordError(error: unknown, context?: string): void {
  if (__DEV__) {
    return;
  }

  const crashlytics = getCrashlytics();
  if (!crashlytics) {
    return;
  }

  try {
    if (context) {
      crashlytics().log(context);
    }

    if (error instanceof Error) {
      crashlytics().recordError(error);
      return;
    }

    crashlytics().recordError(new Error(String(error)));
  } catch {
    // Ignore secondary reporting failures.
  }
}

export function setCrashUserId(userId: string | null): void {
  if (__DEV__ || Platform.OS === "web") {
    return;
  }

  const crashlytics = getCrashlytics();
  if (!crashlytics) {
    return;
  }

  try {
    void crashlytics().setUserId(userId ?? "");
  } catch {
    // Ignore.
  }
}
