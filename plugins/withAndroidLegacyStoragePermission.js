const { withAndroidManifest } = require("expo/config-plugins");

const READ_EXTERNAL_STORAGE = "android.permission.READ_EXTERNAL_STORAGE";
const MAX_SDK_VERSION = "32";

/**
 * Android 11–12 (API 30–32) galeri erişimi için READ_EXTERNAL_STORAGE gerekir.
 * Android 13+ için READ_MEDIA_* kullanılır; bu izin maxSdkVersion=32 ile sınırlanır.
 *
 * Expo blockedPermissions / image-picker bazen tools:node="remove" ekler;
 * bu plugin o bayrağı kaldırıp izni etkin bırakır.
 */
function ensureLegacyReadStoragePermission(androidManifest) {
  const permissions = androidManifest.manifest["uses-permission"] ?? [];
  const withoutLegacy = permissions.filter(
    (entry) => entry.$?.["android:name"] !== READ_EXTERNAL_STORAGE
  );

  withoutLegacy.push({
    $: {
      "android:name": READ_EXTERNAL_STORAGE,
      "android:maxSdkVersion": MAX_SDK_VERSION,
    },
  });

  androidManifest.manifest["uses-permission"] = withoutLegacy;
  return androidManifest;
}

module.exports = function withAndroidLegacyStoragePermission(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = ensureLegacyReadStoragePermission(config.modResults);
    return config;
  });
};
