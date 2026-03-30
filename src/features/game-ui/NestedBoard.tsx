import { Pressable, StyleSheet, Text, View } from 'react-native';

import { canPlayMove, getPlayableBoards } from '../game-engine/engine';
import { colors } from '../../theme/colors';
import { NestedGameState } from '../../types/game';

type NestedBoardProps = {
  state: NestedGameState;
  disabled?: boolean;
  onMove: (boardIndex: number, cellIndex: number) => void;
};

export function NestedBoard({ state, disabled = false, onMove }: NestedBoardProps) {
  const playableBoards = getPlayableBoards(state);

  return (
    <View style={styles.outerGrid}>
      {state.boards.map((board, boardIndex) => {
        const boardWinner = state.boardWinners[boardIndex];
        const boardIsPlayable = playableBoards.includes(boardIndex);

        return (
          <View
            key={boardIndex}
            style={[
              styles.smallBoard,
              boardIsPlayable ? styles.playableBoard : undefined,
            ]}
          >
            {board.map((cell, cellIndex) => {
              const canPlay = !disabled && canPlayMove(state, boardIndex, cellIndex);

              return (
                <Pressable
                  key={`${boardIndex}-${cellIndex}`}
                  disabled={!canPlay}
                  onPress={() => onMove(boardIndex, cellIndex)}
                  style={({ pressed }) => [
                    styles.cell,
                    canPlay ? styles.cellPlayable : undefined,
                    pressed ? styles.cellPressed : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      cell === 'O' ? styles.cellO : styles.cellX,
                    ]}
                  >
                    {cell ?? ''}
                  </Text>
                </Pressable>
              );
            })}

            {boardWinner ? (
              <View style={styles.winnerOverlay}>
                <Text style={[styles.winnerText, boardWinner === 'O' ? styles.cellO : styles.cellX]}>
                  {boardWinner === 'draw' ? '·' : boardWinner}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  outerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 2,
    borderColor: colors.text,
    borderRadius: 22,
    overflow: 'hidden',
  },
  smallBoard: {
    width: '33.333%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: colors.text,
    backgroundColor: '#edf3fb',
    position: 'relative',
  },
  playableBoard: {
    backgroundColor: '#dbeafe',
  },
  cell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#8ba3c2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPlayable: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  cellPressed: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
  },
  cellText: {
    fontSize: 22,
    fontWeight: '800',
  },
  cellX: {
    color: '#1d4ed8',
  },
  cellO: {
    color: '#ef4444',
  },
  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  winnerText: {
    fontSize: 76,
    fontWeight: '900',
    opacity: 0.9,
  },
});
