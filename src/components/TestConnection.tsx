import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { testConnection, testChat } from '../services/test';

export const TestConnection = () => {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');

  useEffect(() => {
    testServer();
  }, []);

  const testServer = async () => {
    try {
      const result = await testConnection();
      setStatus(result);
    } catch (error) {
      setStatus('Connection failed');
    }
  };

  const sendTestMessage = async () => {
    try {
      const result = await testChat(message);
      setResponse(result);
    } catch (error) {
      setResponse('Failed to send message');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.status}>Status: {status}</Text>
      
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter test message"
      />
      
      <Button
        title="Send Test Message"
        onPress={sendTestMessage}
      />
      
      {response ? (
        <Text style={styles.response}>Response: {response}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
  },
}); 