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

type Props = NativeStackScreenProps<RootStackParamList, 'CreateOnlineGame'>;

export function CreateOnlineGameScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Create an online game</Text>
        <Text style={styles.body}>
          We will reserve a 5-digit code for this session. The code stays active until the players
          stop or decline a rematch.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isCreating ? 'Creating...' : 'Create game code'}
          onPress={() => {
            if (!profile) {
              return;
            }

            setError(null);
            setIsCreating(true);
            void createOnlineGame(profile)
              .then((gameId) => navigation.replace('OnlineWaiting', { gameId }))
              .catch((caughtError: Error) => setError(caughtError.message))
              .finally(() => setIsCreating(false));
          }}
          disabled={isCreating}
        />
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
