const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Only apply react-native-web alias for web platform
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native') {
    return {
      filePath: require.resolve('react-native-web'),
      type: 'sourceFile',
    };
  }
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.transformer.minifierConfig = {
  keep_fnames: true,
  keep_classnames: true,
  mangle: {
    keep_fnames: true,
    keep_classnames: true,
  },
};

module.exports = config;