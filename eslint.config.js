const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "node_modules/",
      "android/",
      "ios/",
      "dist/",
      "web-build/",
      ".expo/",
      "scripts/",
    ],
  },
]);
