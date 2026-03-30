import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
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
        <Text style={styles.title}>Current turn</Text>
        <Text style={styles.turn}>
          {currentPlayerName} ({state.currentPlayer})
        </Text>
        <Text style={styles.body}>
          {playableBoards.length === 1
            ? `Must play in board ${playableBoards[0] + 1}.`
            : 'Can play in any open board.'}
        </Text>
      </Card>

      <View style={styles.boardWrapper}>
        <NestedBoard
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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  turn: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
  },
  boardWrapper: {
    gap: 16,
  },
});
