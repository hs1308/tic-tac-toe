import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PlayerTurnCard } from '../components/PlayerTurnCard';
import { Screen } from '../components/Screen';
import { applyMove, createInitialGameState, getPlayableBoards } from '../features/game-engine/engine';
import { NestedBoard } from '../features/game-ui/NestedBoard';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalGame'>;

export function LocalGameScreen({ navigation, route }: Props) {
  const { playerXName, playerOName } = route.params;
  const [state, setState] = useState(() => createInitialGameState());

  const currentPlayerName = state.currentPlayer === 'X' ? playerXName : playerOName;
  const playableBoards = getPlayableBoards(state);

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
          />
          <PlayerTurnCard
            nickname={playerOName}
            symbol="O"
            isActive={state.currentPlayer === 'O'}
            mascot="Local Player"
          />
        </View>
      </Card>

      <View style={styles.boardWrapper}>
        <NestedBoard
          activePlayer={state.currentPlayer}
          state={state}
          onMove={(boardIndex, cellIndex) => {
            const nextState = applyMove(state, boardIndex, cellIndex);
            setState(nextState);

            if (nextState.status === 'finished') {
              navigation.replace('LocalResult', {
                playerXName,
                playerOName,
                state: nextState,
              });
            }
          }}
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
