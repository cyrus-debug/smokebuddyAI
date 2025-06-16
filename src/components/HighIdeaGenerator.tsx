import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, G } from 'react-native-svg';

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
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const generateIdea = async () => {
    try {
      setIsLoading(true);
      setError(null);

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
        votes: { deep: 0, trippy: 0 }
      };

      setCurrentIdea(newIdea);
      setIsModalVisible(true);
    } catch (error: any) {
      console.error('Error in generateIdea:', error);
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

  const handleVote = (type: 'deep' | 'trippy') => {
    if (!currentIdea) return;

    const updatedIdea = {
      ...currentIdea,
      votes: {
        ...currentIdea.votes,
        [type]: (currentIdea.votes[type] || 0) + 1
      }
    };

    setCurrentIdea(updatedIdea);
    setIsModalVisible(false);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="nebula1" cx="30%" cy="30%" r="50%" fx="30%" fy="30%">
            <Stop offset="0%" stopColor="#4B0082" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nebula2" cx="70%" cy="70%" r="50%" fx="70%" fy="70%">
            <Stop offset="0%" stopColor="#00CED1" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        
        <Rect width="100%" height="100%" fill="#000000" />
        <Circle cx={width * 0.3} cy={height * 0.3} r={width * 0.4} fill="url(#nebula1)" />
        <Circle cx={width * 0.7} cy={height * 0.7} r={width * 0.4} fill="url(#nebula2)" />
        
        <G fill="#FFFFFF">
          {/* Stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <Circle
              key={i}
              cx={Math.random() * width}
              cy={Math.random() * height}
              r={Math.random() * 2 + 1}
              opacity={Math.random() * 0.5 + 0.5}
            />
          ))}
        </G>
      </Svg>

      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.eyeContainer}>
            <LottieView
              source={require('../assets/psychedelic-eye.json')}
              autoPlay
              loop
              style={styles.eyeAnimation}
            />
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateIdea}
            disabled={isLoading}
          >
            <View style={styles.buttonGradient}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Generating...' : 'Generate High Idea'}
              </Text>
            </View>
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.ideaContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.ideaBlur}>
              <Text style={styles.ideaText}>
                {currentIdea ? currentIdea.text : 'Tap Generate to get started...'}
              </Text>

              {currentIdea && (
                <>
                  <View style={styles.mainActionButtons}>
                    <TouchableOpacity
                      style={[styles.mainActionButton, { backgroundColor: 'rgba(33, 150, 243, 0.8)' }]}
                      onPress={goDeeper}
                    >
                      <Text style={styles.mainActionButtonText}>Go Deeper</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.mainActionButton, { backgroundColor: 'rgba(156, 39, 176, 0.8)' }]}
                      onPress={remixIdea}
                    >
                      <Text style={styles.mainActionButtonText}>Remix</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.voteContainer}>
                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => handleVote('deep')}
                    >
                      <View style={[styles.voteButtonContent, { backgroundColor: 'rgba(76, 175, 80, 0.8)' }]}>
                        <Ionicons name="thumbs-up" size={24} color="white" />
                        <Text style={styles.voteText}>
                          That's Deep ({currentIdea?.votes?.deep || 0})
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.voteButton}
                      onPress={() => handleVote('trippy')}
                    >
                      <View style={[styles.voteButtonContent, { backgroundColor: 'rgba(244, 67, 54, 0.8)' }]}>
                        <Ionicons name="thumbs-down" size={24} color="white" />
                        <Text style={styles.voteText}>
                          Too Trippy ({currentIdea?.votes?.trippy || 0})
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </Animated.View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New High Idea</Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalIdeaText}>
                {currentIdea?.text}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deepButton]}
                onPress={() => handleVote('deep')}
              >
                <Text style={styles.modalButtonText}>That's Deep</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.trippyButton]}
                onPress={() => handleVote('trippy')}
              >
                <Text style={styles.modalButtonText}>Too Trippy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  eyeAnimation: {
    width: '100%',
    height: '100%',
  },
  generateButton: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(75, 0, 130, 0.8)',
    marginBottom: 20,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 209, 0.8)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ideaContainer: {
    width: '100%',
    marginBottom: 20,
  },
  ideaBlur: {
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ideaText: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    marginBottom: 20,
    lineHeight: 32,
  },
  mainActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  mainActionButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainActionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  voteButtonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  voteText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
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
  errorText: {
    color: '#FF6B6B',
    marginTop: 20,
    textAlign: 'center',
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  secondaryButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    width: '100%',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalBody: {
    width: '100%',
    marginBottom: 20,
  },
  modalIdeaText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    lineHeight: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deepButton: {
    backgroundColor: '#4CAF50',
  },
  trippyButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 