import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, IconButton, ActivityIndicator, Snackbar } from 'react-native-paper';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { generateAIResponse } from '../services/openai';
import { textToSpeech } from '../services/elevenlabs';
import { Audio } from 'expo-av';
import { SoundWave } from '../components/SoundWave';

export const VoiceModeScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Initialize voice recognition
    const setupVoice = async () => {
      try {
        await Voice.isAvailable();
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
      } catch (e) {
        console.error('Voice recognition not available:', e);
        setError('Voice recognition is not available on this device.');
      }
    };

    setupVoice();

    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value[0]) {
      const text = e.value[0];
      setTranscription(text);
    }
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.error('Speech recognition error:', e);
    setIsListening(false);
    if (e.error?.message === 'Speech recognition already started!') {
      // If already started, try to stop it first
      Voice.stop().catch(console.error);
    } else {
      setError('Failed to recognize speech. Please try again.');
    }
  };

  const startListening = async () => {
    try {
      // First check if we're already listening
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        throw new Error('Voice recognition is not available');
      }

      // If we're already listening, stop first
      if (isListening) {
        await Voice.stop();
      }

      // Start fresh
      await Voice.start('en-US');
      setIsListening(true);
      setTranscription('');
      setError(null);
    } catch (e) {
      console.error('Error starting voice recognition:', e);
      setError('Failed to start voice recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
        
        // Only process the input if there's actual transcription
        if (transcription.trim()) {
          handleUserInput(transcription);
        }
      }
    } catch (e) {
      console.error('Error stopping voice recognition:', e);
      setError('Failed to stop voice recognition. Please try again.');
      setIsListening(false);
    }
  };

  const handleUserInput = async (text: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get AI response from voice-mode endpoint
      const response = await fetch('http://localhost:3000/voice-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      console.log('AI Response:', data.response);

      // Convert to speech
      const { audioUrl } = await textToSpeech(data.response);
      console.log('Audio URL:', audioUrl);
      
      // Play the audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      console.log('Loading audio file...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 100,
        },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      setIsSpeaking(true);
      console.log('Audio playback started');

    } catch (error: any) {
      console.error('Error in handleUserInput:', error);
      setError(error.message || 'An error occurred. Please try again.');
      setIsSpeaking(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        console.log('Playback finished');
        setIsSpeaking(false);
        // Clean up the blob URL
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      }
      if (status.error) {
        console.error('Playback error:', status.error);
        setError('Error playing audio. Please try again.');
        setIsSpeaking(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        <SoundWave isSpeaking={isSpeaking} />
        {isProcessing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Cosmo is thinking...</Text>
          </View>
        )}
      </View>

      <Surface style={styles.controlsContainer} elevation={4}>
        <IconButton
          icon={isListening ? 'stop' : 'microphone'}
          size={32}
          mode="contained"
          onPress={isListening ? stopListening : startListening}
          style={[
            styles.micButton,
            isListening && styles.micButtonActive,
          ]}
        />
        {transcription && (
          <Text style={styles.transcriptionText}>{transcription}</Text>
        )}
      </Surface>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => setError(null),
        }}
        duration={5000}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  waveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  micButton: {
    backgroundColor: '#4CAF50',
  },
  micButtonActive: {
    backgroundColor: '#f44336',
  },
  transcriptionText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
}); 