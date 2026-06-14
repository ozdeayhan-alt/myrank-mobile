import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  return (
    fromExtra ??
    process.env.EXPO_PUBLIC_API_URL ??
    "http://localhost:3000"
  );
}
