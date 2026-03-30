import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import { applyMove, getPlayableBoards } from '../features/game-engine/engine';
import { NestedBoard } from '../features/game-ui/NestedBoard';
import {
  fetchOnlineSession,
  subscribeToSession,
  updateOnlineGameState,
} from '../features/online-game/supabaseOnline';
import { OnlineSession } from '../types/game';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineGame'>;

export function OnlineGameScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const { gameId } = route.params;
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  useEffect(() => {
    const load = async () => {
      const nextSession = await fetchOnlineSession(gameId);
      setSession(nextSession);

      if (nextSession.game.status === 'finished' || nextSession.game.status === 'closed') {
        navigation.replace('OnlineResult', { gameId });
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

  const currentPlayer = session.players.find((player) => player.seat === session.game.currentTurnPlayer);
  const myPlayer = session.players.find((player) => player.profileId === profile.id);
  const playableBoards = getPlayableBoards(session.game.state);
  const canMove = Boolean(myPlayer && myPlayer.seat === session.game.currentTurnPlayer);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Game code {session.game.code}</Text>
        <Text style={styles.turn}>
          {currentPlayer?.nickname ?? 'Waiting'} ({session.game.currentTurnPlayer}) to play
        </Text>
        <Text style={styles.body}>
          {playableBoards.length === 1
            ? `The next move must go in board ${playableBoards[0] + 1}.`
            : 'The next player can choose any open board.'}
        </Text>
        <View style={styles.players}>
          {session.players.map((player) => (
            <Text key={player.id} style={styles.player}>
              {player.seat}: {player.nickname} ({player.mascot})
              {player.profileId === profile.id ? ' - you' : ''}
            </Text>
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <NestedBoard
        state={session.game.state}
        disabled={!canMove || isSubmittingMove}
        onMove={(boardIndex, cellIndex) => {
          if (!myPlayer) {
            return;
          }

          setError(null);
          setIsSubmittingMove(true);

          const nextState = applyMove(session.game.state, boardIndex, cellIndex);

          void updateOnlineGameState(gameId, nextState)
            .catch((caughtError: Error) => setError(caughtError.message))
            .finally(() => setIsSubmittingMove(false));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  turn: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  players: {
    gap: 6,
  },
  player: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});
