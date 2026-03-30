import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { fetchOnlineSession, subscribeToSession } from '../features/online-game/supabaseOnline';
import { OnlineSession } from '../types/game';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineWaiting'>;

export function OnlineWaitingScreen({ navigation, route }: Props) {
  const [session, setSession] = useState<OnlineSession | null>(null);
  const { gameId } = route.params;

  useEffect(() => {
    const load = async () => {
      const nextSession = await fetchOnlineSession(gameId);
      setSession(nextSession);

      if (nextSession.game.status === 'active') {
        navigation.replace('OnlineGame', { gameId });
      }
    };

    void load();
    const unsubscribe = subscribeToSession(gameId, () => {
      void load();
    });
    const intervalId = setInterval(() => {
      void load();
    }, 2000);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [gameId, navigation]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Share this code</Text>
        <Text style={styles.code}>{session?.game.code ?? '.....'}</Text>
        <Text style={styles.body}>
          Send the code by WhatsApp or any messenger. The game starts once your friend joins.
        </Text>
      </Card>

      <Card>
        <Text style={styles.title}>Players joined</Text>
        {session ? (
          session.players.map((player) => (
            <Text key={player.id} style={styles.player}>
              {player.seat}: {player.nickname} ({player.mascot})
            </Text>
          ))
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </Card>

      <PrimaryButton label="Back to home" onPress={() => navigation.popToTop()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  code: {
    color: colors.primary,
    fontSize: 42,
    letterSpacing: 4,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  player: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
