import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Firebase web typings omit the React Native persistence helper.
 * Metro resolves `@firebase/auth` to the RN build at bundle time.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require("@firebase/auth") as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
};

export function getAuthPersistence() {
  return getReactNativePersistence(AsyncStorage);
}
