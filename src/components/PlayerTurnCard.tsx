import { StyleSheet, Text, View } from 'react-native';

import { IconBadge } from './IconBadge';
import { colors } from '../theme/colors';
import { PlayerSymbol } from '../types/game';

type PlayerTurnCardProps = {
  nickname: string;
  mascot?: string;
  symbol: PlayerSymbol;
  isActive: boolean;
  isYou?: boolean;
};

export function PlayerTurnCard({
  nickname,
  mascot,
  symbol,
  isActive,
  isYou = false,
}: PlayerTurnCardProps) {
  const activeStyle = symbol === 'X' ? styles.activeX : styles.activeO;
  const symbolStyle = symbol === 'X' ? styles.symbolX : styles.symbolO;
  const nicknameStyle = isActive ? styles.nicknameActive : styles.nicknameInactive;
  const youStyle = isActive ? styles.youActive : styles.youInactive;

  return (
    <View style={[styles.card, isActive ? activeStyle : undefined]}>
      <Text style={[styles.symbolText, symbolStyle]}>{symbol}</Text>
      <View style={styles.metaRow}>
        <IconBadge mascot={mascot ?? 'Rocket Raccoon'} size={24} />
        <Text style={[styles.nickname, nicknameStyle]} numberOfLines={1}>
          {nickname}
        </Text>
      </View>
      {isYou ? <Text style={[styles.youText, youStyle]}>You</Text> : <View style={styles.youSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 116,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundMuted,
  },
  activeX: {
    borderColor: colors.playerX,
    backgroundColor: colors.playerXSoft,
  },
  activeO: {
    borderColor: colors.playerO,
    backgroundColor: colors.playerOSoft,
  },
  symbolText: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  symbolX: {
    color: colors.playerX,
  },
  symbolO: {
    color: colors.playerO,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  nickname: {
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },
  nicknameActive: {
    color: '#0f172a',
  },
  nicknameInactive: {
    color: '#e5eef9',
  },
  youText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  youActive: {
    color: '#334155',
  },
  youInactive: {
    color: '#cbd5e1',
  },
  youSpacer: {
    height: 16,
  },
});
