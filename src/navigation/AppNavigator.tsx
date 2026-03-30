import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { LocalPlayScreen } from '../screens/LocalPlayScreen';
import { OnlinePlayScreen } from '../screens/OnlinePlayScreen';
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

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Nested Tic Tac Toe' }}
        />
        <Stack.Screen
          name="LocalPlay"
          component={LocalPlayScreen}
          options={{ title: 'Same Device' }}
        />
        <Stack.Screen
          name="OnlinePlay"
          component={OnlinePlayScreen}
          options={{ title: 'Online Multiplayer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
