import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Text, Surface, IconButton } from 'react-native-paper';
import { generateAIResponse } from '../services/openai';
import { VoiceInput } from '../components/VoiceInput';
import { speakText, stopSpeaking } from '../services/speech';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(inputText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak the AI response if in voice mode
      if (isVoiceMode) {
        await speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Whoa dude, I'm having trouble connecting to the cosmic consciousness right now...",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInputText(text);
    handleSend();
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (isVoiceMode) {
      stopSpeaking();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContentContainer}
        showsVerticalScrollIndicator={true}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <Surface
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage,
            ]}
            elevation={1}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            {!message.isUser && (
              <IconButton
                icon="volume-high"
                size={20}
                onPress={() => speakText(message.text)}
                style={styles.speakButton}
              />
            )}
          </Surface>
        ))}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Cosmo is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {isVoiceMode ? (
          <VoiceInput
            onTranscriptionComplete={handleVoiceTranscription}
            disabled={isLoading}
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Share your thoughts..."
              multiline
              mode="outlined"
              disabled={isLoading}
            />
            <Button
              mode="contained"
              onPress={handleSend}
              style={styles.sendButton}
              disabled={!inputText.trim() || isLoading}
            >
              Send
            </Button>
          </>
        )}
        <IconButton
          icon={isVoiceMode ? 'keyboard' : 'microphone'}
          size={24}
          onPress={toggleVoiceMode}
          style={styles.voiceToggle}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContentContainer: {
    paddingBottom: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    marginRight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  voiceToggle: {
    marginLeft: 8,
  },
  speakButton: {
    margin: 0,
    padding: 0,
    position: 'absolute',
    right: 4,
    top: 4,
  },
}); 