import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

interface HighIdea {
  id: string;
  text: string;
  timestamp: number;
  votes: {
    deep: number;
    trippy: number;
  };
}

const { width, height } = Dimensions.get('window');

export const HighIdeaGenerator: React.FC = () => {
  const { theme } = useTheme();
  const [currentIdea, setCurrentIdea] = useState<HighIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<HighIdea[]>([]);
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Start continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const generateNewIdea = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request to generate high idea...');
      const response = await fetch('http://127.0.0.1:3000/high-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Network error:', error);
        throw new Error('Unable to connect to the server. Please make sure the server is running.');
      });

      console.log('Response status:', response.status);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check if the server is running.');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate high idea');
      }

      if (!data.idea) {
        throw new Error('No idea received from server');
      }

      const newIdea: HighIdea = {
        id: Date.now().toString(),
        text: data.idea,
        timestamp: Date.now(),
        votes: { deep: 0, trippy: 0 },
      };

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIdea(newIdea);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error: any) {
      console.error('Error in generateNewIdea:', error);
      setError(error.message || 'An error occurred. Please try again.');
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Please make sure the server is running on port 3000.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goDeeper = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/high-idea/deeper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ previousIdea: currentIdea.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to go deeper');
      }

      const data = await response.json();
      const newIdea: HighIdea = {
        id: Date.now().toString(),
        text: data.idea,
        timestamp: Date.now(),
        votes: { deep: 0, trippy: 0 },
      };

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIdea(newIdea);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to go deeper. Try again?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = (type: 'deep' | 'trippy') => {
    if (!currentIdea) return;
    setCurrentIdea({
      ...currentIdea,
      votes: {
        ...currentIdea.votes,
        [type]: currentIdea.votes[type] + 1,
      },
    });
  };

  const saveIdea = () => {
    if (!currentIdea) return;
    setSavedIdeas([...savedIdeas, currentIdea]);
    Alert.alert('Saved!', 'High idea added to your collection.');
  };

  const shareIdea = async () => {
    if (!currentIdea) return;
    try {
      await Share.share({
        message: `Check out this cosmic thought: "${currentIdea.text}"\n\nShared via SmokeBuddy 🌿`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the high idea.');
    }
  };

  const remixIdea = async () => {
    if (!currentIdea) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/high-idea/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: currentIdea.text }),
      });

      if (!response.ok) {
        throw new Error('Failed to remix idea');
      }

      const data = await response.json();
      const newIdea: HighIdea = {
        id: Date.now().toString(),
        text: data.idea,
        timestamp: Date.now(),
        votes: { deep: 0, trippy: 0 },
      };

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIdea(newIdea);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to remix the idea. Try again?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/cosmic-bg.png')}
      style={styles.container}
    >
      <LinearGradient
        colors={['rgba(76, 0, 255, 0.3)', 'rgba(0, 255, 255, 0.3)']}
        style={styles.gradientOverlay}
      >
        <View style={styles.content}>
          <Text style={styles.title}>High Idea Generator</Text>
          <Text style={styles.subtitle}>
            Generate unique and creative ideas related to recreational drug use
          </Text>

          <Animated.View
            style={[
              styles.eyeContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: spin }
                ]
              }
            ]}
          >
            <LottieView
              source={require('../assets/psychedelic-eye.json')}
              autoPlay
              loop
              style={styles.eyeAnimation}
            />
          </Animated.View>

          {currentIdea ? (
            <Animated.View
              style={[
                styles.ideaContainer,
                { opacity: fadeAnim }
              ]}
            >
              <BlurView intensity={20} style={styles.blurContainer}>
                <Text style={styles.ideaText}>{currentIdea.text}</Text>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={goDeeper}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#2196F3']}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Go Deeper</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={remixIdea}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={['#9C27B0', '#E91E63']}
                      style={styles.gradientButton}
                    >
                      <Text style={styles.buttonText}>Remix</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.voteContainer}>
                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVote('deep')}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#8BC34A']}
                      style={styles.gradientButton}
                    >
                      <Ionicons name="thumbs-up" size={24} color="white" />
                      <Text style={styles.voteText}>
                        That's Deep ({currentIdea.votes.deep})
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.voteButton}
                    onPress={() => handleVote('trippy')}
                  >
                    <LinearGradient
                      colors={['#FF9800', '#F44336']}
                      style={styles.gradientButton}
                    >
                      <Ionicons name="thumbs-down" size={24} color="white" />
                      <Text style={styles.voteText}>
                        Too Trippy ({currentIdea.votes.trippy})
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.saveShareContainer}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={saveIdea}
                  >
                    <LinearGradient
                      colors={['#9C27B0', '#673AB7']}
                      style={styles.gradientButton}
                    >
                      <Ionicons name="bookmark" size={24} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={shareIdea}
                  >
                    <LinearGradient
                      colors={['#2196F3', '#03A9F4']}
                      style={styles.gradientButton}
                    >
                      <Ionicons name="share" size={24} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateNewIdea}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Generating...' : 'Generate Idea'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  eyeContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  eyeAnimation: {
    width: '100%',
    height: '100%',
  },
  ideaContainer: {
    width: '100%',
    marginTop: 20,
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
  },
  ideaText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    width: '45%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voteContainer: {
    marginBottom: 20,
  },
  voteButton: {
    marginBottom: 10,
    borderRadius: 25,
    overflow: 'hidden',
  },
  voteText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  saveShareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  generateButton: {
    width: '80%',
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
}); 