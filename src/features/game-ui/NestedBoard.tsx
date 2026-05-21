import { Pressable, StyleSheet, Text, View } from 'react-native';

import { canPlayMove, getPlayableBoards } from '../game-engine/engine';
import { colors } from '../../theme/colors';
import { NestedGameState, PlayerSymbol } from '../../types/game';

type NestedBoardProps = {
  state: NestedGameState;
  disabled?: boolean;
  activePlayer: PlayerSymbol;
  onMove: (boardIndex: number, cellIndex: number) => void;
};

export function NestedBoard({
  state,
  disabled = false,
  activePlayer,
  onMove,
}: NestedBoardProps) {
  const playableBoards = getPlayableBoards(state);
  const activeBoardStyle =
    activePlayer === 'X' ? styles.playableBoardX : styles.playableBoardO;
  const activeCellStyle =
    activePlayer === 'X' ? styles.cellPlayableX : styles.cellPlayableO;
  const activeCellPressedStyle =
    activePlayer === 'X' ? styles.cellPressedX : styles.cellPressedO;

  return (
    <View style={styles.boardFrame}>
      <View style={styles.outerGrid}>
        {Array.from({ length: 3 }, (_, row) => (
          <View key={row} style={styles.boardRow}>
            {Array.from({ length: 3 }, (_, col) => {
              const boardIndex = row * 3 + col;
              const board = state.boards[boardIndex];
              const boardWinner = state.boardWinners[boardIndex];
              const boardIsPlayable = playableBoards.includes(boardIndex);

              return (
                <View
                  key={boardIndex}
                  style={[
                    styles.smallBoard,
                    boardIsPlayable ? activeBoardStyle : undefined,
                    boardWinner ? styles.completedBoard : undefined,
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
                          canPlay ? activeCellStyle : undefined,
                          pressed && canPlay ? activeCellPressedStyle : undefined,
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
                      <Text
                        style={[
                          styles.winnerText,
                          boardWinner === 'O' ? styles.cellO : styles.cellX,
                        ]}
                      >
                        {boardWinner === 'draw' ? 'D' : boardWinner}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardFrame: {
    padding: 10,
    borderRadius: 28,
    backgroundColor: '#0d1727',
    borderWidth: 1,
    borderColor: '#1f3552',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  outerGrid: {
    gap: 8,
    borderRadius: 22,
    overflow: 'hidden',
  },
  boardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBoard: {
    flex: 1,
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 3,
    borderColor: '#0f1f33',
    borderRadius: 18,
    backgroundColor: '#edf3fb',
    position: 'relative',
    overflow: 'hidden',
  },
  playableBoardX: {
    backgroundColor: colors.playerXSoft,
    borderColor: colors.playerX,
  },
  playableBoardO: {
    backgroundColor: colors.playerOSoft,
    borderColor: colors.playerO,
  },
  completedBoard: {
    backgroundColor: '#e2e8f0',
  },
  cell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#8ba3c2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellPlayableX: {
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
  },
  cellPlayableO: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
  },
  cellPressedX: {
    backgroundColor: 'rgba(37, 99, 235, 0.24)',
  },
  cellPressedO: {
    backgroundColor: 'rgba(239, 68, 68, 0.24)',
  },
  cellText: {
    fontSize: 22,
    fontWeight: '800',
  },
  cellX: {
    color: colors.playerX,
  },
  cellO: {
    color: colors.playerO,
  },
  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  winnerText: {
    fontSize: 76,
    fontWeight: '900',
    opacity: 0.9,
  },
});
