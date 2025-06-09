import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleSignIn = () => {
    // TODO: Implement sign in navigation
    navigation.navigate('SignIn');
  };

  const handleSkipSignIn = () => {
    navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.contentContainer} elevation={2}>
        <Text style={styles.title}>Welcome to Highdeas AI</Text>
        <Text style={styles.subtitle}>Your philosophical stoner companion</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In / Create Account
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleSkipSignIn}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Skip Sign In
          </Button>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 