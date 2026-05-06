module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Removed module-resolver with react-native alias — it caused native bundling
    // to resolve react-native → react-native-web, breaking Expo Go on device.
    // Web aliasing is now handled in metro.config.js per-platform only.
  };
};