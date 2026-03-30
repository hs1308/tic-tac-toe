import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export function GameIllustration() {
  const cells = ['X', '', 'O', '', 'O', '', 'X', '', 'X'];

  return (
    <View style={styles.frame}>
      <View style={styles.board}>
        {cells.map((cell, index) => (
          <View key={index} style={styles.cell}>
            <Text style={[styles.symbol, cell === 'O' ? styles.o : styles.x]}>{cell}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: 'center',
    padding: 18,
    borderRadius: 28,
    backgroundColor: '#0d1930',
    borderWidth: 1,
    borderColor: colors.border,
  },
  board: {
    width: 180,
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cell: {
    width: '33.333%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#b8c7de',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 28,
    fontWeight: '800',
  },
  x: {
    color: '#2563eb',
  },
  o: {
    color: '#ef4444',
  },
});
