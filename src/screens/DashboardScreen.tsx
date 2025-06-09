import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const theme = useTheme();

  const menuItems = [
    {
      title: 'Chat with Cosmo',
      description: 'Have a philosophical conversation with your AI companion',
      icon: 'chat',
      route: 'Chat',
      color: '#4CAF50',
    },
    {
      title: 'Voice Mode',
      description: 'Talk to Cosmo using your voice',
      icon: 'microphone',
      route: 'VoiceMode',
      color: '#2196F3',
    },
    {
      title: 'Cosmic Thoughts',
      description: 'Generate mind-bending philosophical ideas',
      icon: 'lightbulb',
      route: 'HighIdeas',
      color: '#FF9800',
    },
    {
      title: 'Profile Settings',
      description: 'Manage your account and preferences',
      icon: 'account-cog',
      route: 'Profile',
      color: '#9C27B0',
      disabled: true,
    },
  ];

  const handleNavigation = (route: string) => {
    switch (route) {
      case 'Chat':
        navigation.navigate('Chat');
        break;
      case 'VoiceMode':
        navigation.navigate('VoiceMode');
        break;
      case 'HighIdeas':
        navigation.navigate('HighIdeas');
        break;
      // Other routes will be implemented later
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text style={styles.welcomeText}>Welcome to Highdeas AI</Text>
        <Text style={styles.subtitle}>Your philosophical journey begins here</Text>
      </Surface>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Surface
            key={index}
            style={[styles.menuItem, { backgroundColor: item.color + '10' }]}
            elevation={1}
          >
            <View style={styles.menuItemContent}>
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={24} color="white" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
            </View>
            <Button
              mode="contained"
              onPress={() => handleNavigation(item.route)}
              style={[styles.button, { backgroundColor: item.color }]}
              disabled={item.disabled}
            >
              {item.disabled ? 'Coming Soon' : 'Open'}
            </Button>
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
  },
  menuContainer: {
    padding: 16,
    gap: 16,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    borderRadius: 8,
  },
}); 