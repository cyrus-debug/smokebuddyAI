import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SoundWaveProps {
  isSpeaking: boolean;
}

export const SoundWave: React.FC<SoundWaveProps> = ({ isSpeaking }) => {
  const bars = 5;
  const animations = useRef<Animated.Value[]>(
    Array(bars).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (isSpeaking) {
      animations.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + index * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400 + index * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else {
      animations.forEach(anim => {
        anim.setValue(0);
        anim.stopAnimation();
      });
    }
  }, [isSpeaking]);

  return (
    <View style={styles.container}>
      {animations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [
                {
                  scaleY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ],
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 4,
  },
  bar: {
    width: 4,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
}); 