module.exports = {
  expo: {
    name: 'Highdeas AI',
    slug: 'highdeas-ai',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.highdeasai.app'
    },
    android: {
      package: 'com.highdeasai.app'
    },
    plugins: [
      './plugins/withVoice'
    ],
    extra: {
      eas: {
        projectId: 'your-project-id'
      }
    }
  }
}; 