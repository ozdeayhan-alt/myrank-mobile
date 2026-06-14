import fs from "fs";
import path from "path";
import type { ConfigContext, ExpoConfig } from "expo/config";

type AppVariant = "development" | "preview" | "production";

function getAppVariant(): AppVariant {
  const raw =
    process.env.APP_VARIANT?.trim() ||
    process.env.EAS_BUILD_PROFILE?.trim() ||
    "development";

  if (raw === "preview" || raw === "production") {
    return raw;
  }

  return "development";
}

/**
 * Client-only Firebase Web config (API Key, Project ID, …).
 * Never use service-account.json or firebase-admin on mobile.
 */
function getFirebaseExtra() {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

function getApiExtra() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "http://localhost:3000";
  return { apiUrl };
}

function assertApiUrlForRelease(appVariant: AppVariant): void {
  if (appVariant === "development") {
    return;
  }

  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) {
    // EAS CLI app.config'i env enjekte edilmeden önce okuyabilir; eas.json/EAS env build'de gelir.
    return;
  }

  if (configured.includes("localhost") || configured.includes("127.0.0.1")) {
    throw new Error(
      `[app.config] ${appVariant} build requires a public EXPO_PUBLIC_API_URL (got ${configured})`
    );
  }
}

function getBuildPropertiesPlugins(apiUsesHttps: boolean): NonNullable<ExpoConfig["plugins"]> {
  if (apiUsesHttps) {
    return [];
  }

  return [
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
  ];
}

function getIosGoogleUrlSchemeFromPlist(): string | null {
  const plistPath = path.join(__dirname, "GoogleService-Info.plist");
  if (!fs.existsSync(plistPath)) {
    return null;
  }

  const content = fs.readFileSync(plistPath, "utf8");
  const match = content.match(
    /<key>REVERSED_CLIENT_ID<\/key>\s*<string>([^<]+)<\/string>/
  );
  return match?.[1]?.trim() ?? null;
}

function getGoogleSignInPlugins(): NonNullable<ExpoConfig["plugins"]> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  if (!webClientId) {
    return [];
  }

  const iosUrlScheme = getIosGoogleUrlSchemeFromPlist();
  if (iosUrlScheme) {
    return [
      [
        "@react-native-google-signin/google-signin",
        { iosUrlScheme },
      ],
    ];
  }

  const match = webClientId.match(
    /^(\d+)-([^.]+)\.apps\.googleusercontent\.com$/
  );

  if (!match) {
    return [["@react-native-google-signin/google-signin", {}]];
  }

  return [
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme: `com.googleusercontent.apps.${match[1]}-${match[2]}`,
      },
    ],
  ];
}

function getEasProjectId(config: Partial<ExpoConfig>): string {
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const fromConfig = config.extra?.eas;
  if (
    fromConfig &&
    typeof fromConfig === "object" &&
    "projectId" in fromConfig &&
    typeof fromConfig.projectId === "string" &&
    fromConfig.projectId.trim()
  ) {
    return fromConfig.projectId.trim();
  }

  return "";
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = getAppVariant();
  const isDevClient = appVariant === "development";
  const firebase = getFirebaseExtra();
  const api = getApiExtra();
  assertApiUrlForRelease(appVariant);
  const apiUsesHttps = api.apiUrl.startsWith("https://");
  const easProjectId = getEasProjectId(config);

  const basePlugins = config.plugins ?? [];
  const mediaPlugins = basePlugins.filter((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === "expo-image-picker") {
      return false;
    }
    return true;
  });

  return {
    ...config,
    name: "MyRank",
    slug: config.slug ?? "myrank-mobile",
    sdkVersion: "54.0.0",
    ios: {
      ...config.ios,
      bundleIdentifier: "com.myrank.mobile",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      ...config.android,
      package: "com.myrank.mobile",
      googleServicesFile: "./google-services.json",
      softwareKeyboardLayoutMode: "resize",
      ...( { usesCleartextTraffic: !apiUsesHttps } as ExpoConfig["android"] ),
      blockedPermissions: [
        ...new Set([
          ...(config.android?.blockedPermissions ?? []),
          "android.permission.SYSTEM_ALERT_WINDOW",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.WRITE_EXTERNAL_STORAGE",
        ]),
      ],
    },
    plugins: [
      ...(isDevClient ? (["expo-dev-client"] as const) : []),
      ...mediaPlugins,
      [
        "expo-image-picker",
        {
          photosPermission:
            "Profil fotoğrafı ve paylaşım için galeriye erişim gerekir.",
          cameraPermission:
            "Fotoğraf ve video çekmek için kamera erişimi gerekir.",
          microphonePermission:
            "Video kaydı için mikrofon erişimi gerekir.",
        },
      ],
      ...getGoogleSignInPlugins(),
      ...getBuildPropertiesPlugins(apiUsesHttps),
      "expo-splash-screen",
      "expo-video",
      "react-native-compressor",
    ],
    extra: {
      ...(typeof config.extra === "object" && config.extra !== null
        ? config.extra
        : {}),
      appVariant,
      firebase,
      ...api,
      eas: {
        projectId: easProjectId,
      },
    },
  };
};
