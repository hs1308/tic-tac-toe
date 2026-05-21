import { useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PlayerTurnCard } from '../components/PlayerTurnCard';
import { Screen } from '../components/Screen';
import { applyMove, createInitialGameState, getPlayableBoards } from '../features/game-engine/engine';
import { NestedGameState, PlayerSymbol } from '../types/game';
import { NestedBoard } from '../features/game-ui/NestedBoard';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalGame'>;

export function LocalGameScreen({ navigation, route }: Props) {
  const { playerXName, playerOName } = route.params;
  const [state, setState] = useState(() => createInitialGameState());

  type UndoWindow = { previousState: NestedGameState; player: PlayerSymbol } | null;
  const [undoWindow, setUndoWindow] = useState<UndoWindow>(null);
  const [undoChances, setUndoChances] = useState({ X: 3, O: 3 });
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayerName = state.currentPlayer === 'X' ? playerXName : playerOName;
  const playableBoards = getPlayableBoards(state);

  const handleMove = (boardIndex: number, cellIndex: number) => {
    const prevState = state;
    const nextState = applyMove(state, boardIndex, cellIndex);

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setUndoWindow({ previousState: prevState, player: prevState.currentPlayer });
    undoTimeoutRef.current = setTimeout(() => setUndoWindow(null), 5000);

    setState(nextState);

    if (nextState.status === 'finished') {
      navigation.replace('LocalResult', { playerXName, playerOName, state: nextState });
    }
  };

  const handleUndo = (player: PlayerSymbol) => {
    if (!undoWindow || undoWindow.player !== player || undoChances[player] <= 0) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    setState(undoWindow.previousState);
    setUndoWindow(null);
    setUndoChances(prev => ({ ...prev, [player]: prev[player] - 1 }));
  };

  return (
    <Screen>
      <Card>
        <Text style={[styles.turn, state.currentPlayer === 'X' ? styles.turnX : styles.turnO]}>
          {currentPlayerName} ({state.currentPlayer})
        </Text>
        <Text style={styles.bodyCentered}>
          {playableBoards.length === 1
            ? `The next move must go in board ${playableBoards[0] + 1}.`
            : 'The next player can choose any open board.'}
        </Text>
        <View style={styles.playerRow}>
          <PlayerTurnCard
            nickname={playerXName}
            symbol="X"
            isActive={state.currentPlayer === 'X'}
            mascot="Local Player"
            undoChancesRemaining={undoChances.X}
            canUndo={undoWindow?.player === 'X' && undoChances.X > 0}
            onUndo={() => handleUndo('X')}
          />
          <PlayerTurnCard
            nickname={playerOName}
            symbol="O"
            isActive={state.currentPlayer === 'O'}
            mascot="Local Player"
            undoChancesRemaining={undoChances.O}
            canUndo={undoWindow?.player === 'O' && undoChances.O > 0}
            onUndo={() => handleUndo('O')}
          />
        </View>
      </Card>

      <View style={styles.boardWrapper}>
        <NestedBoard
          activePlayer={state.currentPlayer}
          state={state}
          onMove={handleMove}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  turn: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
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
  boardWrapper: {
    gap: 16,
  },
});
