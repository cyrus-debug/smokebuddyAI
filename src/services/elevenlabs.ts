import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from '../config/keys';

interface StreamAudioResponse {
  audioUrl: string;
}

class ElevenLabsError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ElevenLabsError';
  }
}

export const textToSpeech = async (text: string): Promise<StreamAudioResponse> => {
  if (!ELEVENLABS_API_KEY) {
    throw new ElevenLabsError('ElevenLabs API key is not configured');
  }
  if (!ELEVENLABS_VOICE_ID) {
    throw new ElevenLabsError('ElevenLabs Voice ID is not configured');
  }

  try {
    console.log('Sending request to ElevenLabs API...');
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('ElevenLabs API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });

      switch (response.status) {
        case 401:
          throw new ElevenLabsError('Invalid API key. Please check your ElevenLabs API key.', response.status);
        case 404:
          throw new ElevenLabsError('Voice ID not found. Please check your ElevenLabs Voice ID.', response.status);
        case 422:
          throw new ElevenLabsError('Invalid text input. Please try again with different text.', response.status);
        case 429:
          throw new ElevenLabsError('Rate limit exceeded. Please try again later.', response.status);
        default:
          throw new ElevenLabsError(
            `ElevenLabs API error: ${response.statusText} (${response.status})`,
            response.status
          );
      }
    }

    console.log('Received response from ElevenLabs API');
    const audioBlob = await response.blob();
    
    // Convert blob to base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
    
    reader.readAsDataURL(audioBlob);
    const base64Data = await base64Promise;
    
    // Save the audio to a temporary file
    const tempFilePath = `${FileSystem.cacheDirectory}temp_audio_${Date.now()}.mp3`;
    console.log('Saving audio to:', tempFilePath);
    
    await FileSystem.writeAsStringAsync(tempFilePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('Audio saved successfully');
    return { audioUrl: tempFilePath };
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    if (error instanceof ElevenLabsError) {
      throw error;
    }
    throw new ElevenLabsError('Failed to generate speech. Please try again.');
  }
}; 