import * as Speech from 'expo-speech';

export const speakText = async (text: string) => {
  try {
    await Speech.speak(text, {
      language: 'en',
      pitch: 0.9, // Slightly lower pitch for a more relaxed voice
      rate: 0.8, // Slower rate for a more laid-back feel
    });
  } catch (error) {
    console.error('Error speaking text:', error);
  }
};

export const stopSpeaking = async () => {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}; 