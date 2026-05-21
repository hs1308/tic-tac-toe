import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PlayerTurnCard } from '../components/PlayerTurnCard';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import { applyMove, getPlayableBoards } from '../features/game-engine/engine';
import { NestedBoard } from '../features/game-ui/NestedBoard';
import {
  fetchOnlineSession,
  subscribeToSession,
  undoOnlineMove,
  updateOnlineGameState,
} from '../features/online-game/supabaseOnline';
import { NestedGameState, OnlineSession, PlayerSymbol } from '../types/game';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineGame'>;

export function OnlineGameScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const { gameId } = route.params;
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  type UndoWindow = { previousState: NestedGameState; player: PlayerSymbol } | null;
  const [undoWindow, setUndoWindow] = useState<UndoWindow>(null);
  const undoWindowRef = useRef<UndoWindow>(null);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undoNotification, setUndoNotification] = useState<string | null>(null);
  const lastSeenUndoAtRef = useRef<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const nextSession = await fetchOnlineSession(gameId);
      setSession(nextSession);

      if (nextSession.game.status === 'finished' || nextSession.game.status === 'closed') {
        navigation.replace('OnlineResult', { gameId });
        return;
      }

      // Show notification when opponent undoes their move
      if (nextSession.game.lastUndoAt && nextSession.game.lastUndoAt !== lastSeenUndoAtRef.current) {
        lastSeenUndoAtRef.current = nextSession.game.lastUndoAt;
        const undoer = nextSession.players.find(p => p.seat === nextSession.game.lastUndoBy);
        if (undoer && undoer.profileId !== profile?.id) {
          setUndoNotification(`${undoer.nickname} undid their move`);
          setTimeout(() => setUndoNotification(null), 3000);
        }
      }

      // If it's our turn again but we still have an undo window open, opponent moved — clear it
      const myPlayerInSession = nextSession.players.find(p => p.profileId === profile?.id);
      if (undoWindowRef.current && myPlayerInSession &&
          nextSession.game.state.currentPlayer === myPlayerInSession.seat) {
        setUndoWindow(null);
        undoWindowRef.current = null;
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
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

  const myUndoChances = myPlayer?.seat === 'X' ? session.game.undoChancesX : session.game.undoChancesO;
  const canUndo = Boolean(
    undoWindow && myPlayer && undoWindow.player === myPlayer.seat && myUndoChances > 0
  );

  const handleOnlineUndo = () => {
    if (!undoWindow || !myPlayer || !canUndo) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoWindow(null);
    undoWindowRef.current = null;
    setIsSubmittingMove(true);
    void undoOnlineMove(gameId, undoWindow.previousState, myPlayer.seat, {
      X: session.game.undoChancesX,
      O: session.game.undoChancesO,
    })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsSubmittingMove(false));
  };

  return (
    <Screen>
      <Card>
        <Text
          style={[
            styles.turn,
            session.game.currentTurnPlayer === 'X' ? styles.turnX : styles.turnO,
          ]}
        >
          {currentPlayer?.nickname ?? 'Waiting'} ({session.game.currentTurnPlayer}) to play
        </Text>
        <Text style={styles.bodyCentered}>
          {playableBoards.length === 1
            ? `The next move must go in board ${playableBoards[0] + 1}.`
            : 'The next player can choose any open board.'}
        </Text>
        <View style={styles.playerRow}>
          {session.players.map((player) => {
            const isMe = player.profileId === profile.id;
            const playerChances = player.seat === 'X' ? session.game.undoChancesX : session.game.undoChancesO;
            const canUndoThis = isMe && canUndo;
            return (
              <View key={player.id} style={styles.playerColumn}>
                <PlayerTurnCard
                  nickname={player.nickname}
                  mascot={player.mascot}
                  symbol={player.seat}
                  isActive={session.game.currentTurnPlayer === player.seat}
                  isYou={isMe}
                />
                <Pressable
                  onPress={isMe ? handleOnlineUndo : undefined}
                  disabled={!canUndoThis}
                  style={styles.undoButton}
                >
                  <Text style={[styles.undoText, !canUndoThis && styles.undoTextDisabled]}>
                    Undo ({playerChances})
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        {undoNotification ? <Text style={styles.undoNotification}>{undoNotification}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <NestedBoard
        activePlayer={session.game.currentTurnPlayer}
        state={session.game.state}
        disabled={!canMove || isSubmittingMove}
        onMove={(boardIndex, cellIndex) => {
          if (!myPlayer) return;

          setError(null);
          setIsSubmittingMove(true);

          const prevState = session.game.state;
          const nextState = applyMove(session.game.state, boardIndex, cellIndex);

          if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
          const newWindow = { previousState: prevState, player: myPlayer.seat as PlayerSymbol };
          setUndoWindow(newWindow);
          undoWindowRef.current = newWindow;
          undoTimeoutRef.current = setTimeout(() => {
            setUndoWindow(null);
            undoWindowRef.current = null;
          }, 5000);

          void updateOnlineGameState(gameId, nextState)
            .catch((caughtError: Error) => {
              setError(caughtError.message);
              setUndoWindow(null);
              undoWindowRef.current = null;
              if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
            })
            .finally(() => setIsSubmittingMove(false));
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  turn: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  turnX: {
    color: colors.playerX,
  },
  turnO: {
    color: colors.playerO,
  },
  bodyCentered: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  playerColumn: {
    alignItems: 'center',
    gap: 6,
  },
  undoButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  undoText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  undoTextDisabled: {
    opacity: 0.35,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  undoNotification: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
  },
});
