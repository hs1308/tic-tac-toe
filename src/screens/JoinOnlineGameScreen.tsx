import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useAuth } from '../features/auth/AuthContext';
import { joinOnlineGame } from '../features/online-game/supabaseOnline';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'JoinOnlineGame'>;

export function JoinOnlineGameScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Join a friend&apos;s game</Text>
        <Text style={styles.body}>Enter the 5-digit code your friend shared with you.</Text>
        <TextField
          keyboardType="number-pad"
          label="Game code"
          maxLength={5}
          onChangeText={(value) => setCode(value.replace(/[^0-9]/g, ''))}
          value={code}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={isJoining ? 'Joining...' : 'Join game'}
          onPress={() => {
            if (!profile) {
              return;
            }

            setError(null);
            setIsJoining(true);
            void joinOnlineGame(code, profile)
              .then((gameId) => navigation.replace('OnlineGame', { gameId }))
              .catch((caughtError: Error) => setError(caughtError.message))
              .finally(() => setIsJoining(false));
          }}
          disabled={code.length !== 5 || isJoining}
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
