import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { ChatScreen } from './src/screens/ChatScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { VoiceModeScreen } from './src/screens/VoiceModeScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { HighIdeaGenerator } from './src/components/HighIdeaGenerator';

export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  Dashboard: undefined;
  Chat: undefined;
  VoiceMode: undefined;
  HighIdeas: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#4CAF50',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="SignIn" 
              component={SignInScreen}
              options={{ title: 'Sign In' }}
            />
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ title: 'Highdeas AI' }}
            />
            <Stack.Screen 
              name="VoiceMode" 
              component={VoiceModeScreen}
              options={{ title: 'Voice Mode' }}
            />
            <Stack.Screen 
              name="HighIdeas" 
              component={HighIdeaGenerator}
              options={{
                title: 'Cosmic Thoughts',
                headerStyle: {
                  backgroundColor: '#4CAF50',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ThemeProvider>
  );
}
