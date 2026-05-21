import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import { NestedBoard } from '../features/game-ui/NestedBoard';
import {
  fetchOnlineSession,
  requestRematch,
  respondToRematch,
  subscribeToSession,
} from '../features/online-game/supabaseOnline';
import { OnlineSession } from '../types/game';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineResult'>;

export function OnlineResultScreen({ navigation, route }: Props) {
  const { gameId } = route.params;
  const { profile } = useAuth();
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);

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

  if (!session || !profile) {
    return (
      <Screen>
        <Card>
          <ActivityIndicator color={colors.primary} />
        </Card>
      </Screen>
    );
  }

  const winningPlayer =
    session.game.winner === 'draw'
      ? null
      : session.players.find((player) => player.seat === session.game.winner);
  const isRequester = session.game.rematchRequestedByProfileId === profile.id;
  const shouldRespond =
    session.game.rematchStatus === 'pending' && session.game.rematchRequestedByProfileId !== profile.id;

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Session result</Text>
        <Text style={styles.result}>
          {session.game.winner === 'draw'
            ? 'The game ended in a draw.'
            : `${winningPlayer?.nickname ?? 'A player'} wins this round.`}
        </Text>
        <Text style={styles.body}>Game code {session.game.code}</Text>

        {session.game.status === 'closed' ? (
          <Text style={styles.note}>This session has ended and its code is no longer reusable.</Text>
        ) : null}
        {session.game.rematchStatus === 'pending' && isRequester ? (
          <Text style={styles.note}>Rematch requested. Waiting for your friend to respond.</Text>
        ) : null}
        {session.game.rematchStatus === 'declined' ? (
          <Text style={styles.note}>Your friend declined the rematch, so the session is closed.</Text>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <View style={styles.boardWrapper}>
        <NestedBoard
          state={session.game.state}
          activePlayer={session.game.winner === 'O' ? 'O' : 'X'}
          disabled
          onMove={() => {}}
        />
      </View>

      <Card>
        {session.game.status !== 'closed' && !session.game.rematchStatus ? (
          <PrimaryButton
            label={isWorking ? 'Sending...' : 'Restart'}
            onPress={() => {
              setError(null);
              setIsWorking(true);
              void requestRematch(gameId, profile.id)
                .catch((caughtError: Error) => setError(caughtError.message))
                .finally(() => setIsWorking(false));
            }}
            disabled={isWorking}
          />
        ) : null}

        {shouldRespond ? (
          <>
            <PrimaryButton
              label={isWorking ? 'Working...' : 'Accept rematch'}
              onPress={() => {
                setError(null);
                setIsWorking(true);
                void respondToRematch(gameId, true)
                  .catch((caughtError: Error) => setError(caughtError.message))
                  .finally(() => setIsWorking(false));
              }}
              disabled={isWorking}
            />
            <PrimaryButton
              label={isWorking ? 'Working...' : 'Decline rematch'}
              onPress={() => {
                setError(null);
                setIsWorking(true);
                void respondToRematch(gameId, false)
                  .catch((caughtError: Error) => setError(caughtError.message))
                  .finally(() => setIsWorking(false));
              }}
              disabled={isWorking}
            />
          </>
        ) : null}

        <PrimaryButton label="Go to home" onPress={() => navigation.popToTop()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  result: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  boardWrapper: {},
});
