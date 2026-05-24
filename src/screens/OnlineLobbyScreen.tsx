import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import { createOnlineGame } from '../features/online-game/supabaseOnline';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineLobby'>;

export function OnlineLobbyScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Play with friends online</Text>
        <Text style={styles.body}>
          Create a room to get a 5-digit code, or join with a code from a friend.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isCreating ? 'Creating...' : 'Create game'}
          disabled={isCreating}
          onPress={() => {
            if (!profile) return;
            setError(null);
            setIsCreating(true);
            void createOnlineGame(profile)
              .then((gameId) => navigation.navigate('OnlineWaiting', { gameId }))
              .catch((caughtError: Error) => setError(caughtError.message))
              .finally(() => setIsCreating(false));
          }}
        />
        <PrimaryButton label="Join game" onPress={() => navigation.navigate('JoinOnlineGame')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});
