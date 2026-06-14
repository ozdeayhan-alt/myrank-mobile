import Constants from "expo-constants";

/** Changes on each release so persisted React Query cache is invalidated. */
export function getPersistBuster(): string {
  const appVersion = Constants.expoConfig?.version ?? "0";
  const versionCode =
    Constants.expoConfig?.android?.versionCode?.toString() ??
    Constants.expoConfig?.ios?.buildNumber?.toString() ??
    "0";

  return `feed-v7-${appVersion}-${versionCode}`;
}
