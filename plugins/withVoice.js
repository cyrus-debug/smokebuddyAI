const { withInfoPlist, withAndroidManifest } = require('@expo/config-plugins');

const withVoice = (config) => {
  // iOS configuration
  config = withInfoPlist(config, (config) => {
    config.modResults.NSMicrophoneUsageDescription = 
      'We need access to your microphone to enable voice chat with Cosmo.';
    config.modResults.NSSpeechRecognitionUsageDescription = 
      'We need speech recognition to understand your voice commands and chat with Cosmo.';
    return config;
  });

  // Android configuration
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add permissions
    const permissions = androidManifest.manifest.permission || [];
    permissions.push(
      {
        $: {
          'android:name': 'android.permission.RECORD_AUDIO',
        },
      },
      {
        $: {
          'android:name': 'android.permission.INTERNET',
        },
      }
    );
    androidManifest.manifest.permission = permissions;

    return config;
  });

  return config;
};

module.exports = withVoice; 