const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  'react-native': 'react-native-web',
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
