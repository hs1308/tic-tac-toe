import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../features/auth/AuthContext';
import { CreateOnlineGameScreen } from '../screens/CreateOnlineGameScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { JoinOnlineGameScreen } from '../screens/JoinOnlineGameScreen';
import { LocalGameScreen } from '../screens/LocalGameScreen';
import { LocalResultScreen } from '../screens/LocalResultScreen';
import { LocalSetupScreen } from '../screens/LocalSetupScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { OnlineGameScreen } from '../screens/OnlineGameScreen';
import { OnlineLobbyScreen } from '../screens/OnlineLobbyScreen';
import { OnlineResultScreen } from '../screens/OnlineResultScreen';
import { OnlineWaitingScreen } from '../screens/OnlineWaitingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primaryStrong,
  },
};

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function AppNavigator() {
  const { isLoading, isSignedIn, hasCompletedOnboarding } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!isSignedIn ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ title: 'Set up your profile' }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
            <Stack.Screen
              name="LocalSetup"
              component={LocalSetupScreen}
              options={{ title: 'In-person game' }}
            />
            <Stack.Screen
              name="LocalGame"
              component={LocalGameScreen}
              options={{ title: 'Game in progress' }}
            />
            <Stack.Screen
              name="LocalResult"
              component={LocalResultScreen}
              options={{ title: 'Result' }}
            />
            <Stack.Screen
              name="OnlineLobby"
              component={OnlineLobbyScreen}
              options={{ title: 'Online play' }}
            />
            <Stack.Screen
              name="CreateOnlineGame"
              component={CreateOnlineGameScreen}
              options={{ title: 'Create game' }}
            />
            <Stack.Screen
              name="JoinOnlineGame"
              component={JoinOnlineGameScreen}
              options={{ title: 'Join game' }}
            />
            <Stack.Screen
              name="OnlineWaiting"
              component={OnlineWaitingScreen}
              options={{ title: 'Waiting room' }}
            />
            <Stack.Screen
              name="OnlineGame"
              component={OnlineGameScreen}
              options={{ title: 'Online match' }}
            />
            <Stack.Screen
              name="OnlineResult"
              component={OnlineResultScreen}
              options={{ title: 'Match result' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
