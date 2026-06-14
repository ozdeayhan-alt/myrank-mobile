const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Reduce inotify pressure on Linux servers with large node_modules trees.
config.watcher = {
  ...config.watcher,
  additionalExcludes: [
    /\/\.git\/.*/,
    /\/\.expo\/.*/,
    /\/android\/.*/,
    /\/ios\/.*/,
  ],
};

// Block server-only Firebase Admin paths from ever entering the mobile bundle.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  /firebase-admin/,
  /service-account\.json$/,
  /firebase-config\.js$/,
  new RegExp(
    `${path.resolve(__dirname, "..", "myrankapp")}[\\\\/].*`.replace(/\\/g, "\\\\")
  ),
];

module.exports = withNativeWind(config, { input: "./global.css" });
