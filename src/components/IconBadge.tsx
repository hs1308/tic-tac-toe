import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

const emojiMap: Record<string, string> = {
  Rocket: '🚀',
  Neon: '✨',
  Pixel: '🧩',
  Disco: '🪩',
  Turbo: '⚡',
  Mochi: '🍡',
  Cosmic: '🌌',
  Lava: '🌋',
  Bubble: '🫧',
  Ninja: '🥷',
  Thunder: '🌩️',
  Glitter: '💫',
  Captain: '🧢',
  Comet: '☄️',
  Mango: '🥭',
  Frost: '❄️',
  Taco: '🌮',
  Solar: '🌞',
  Jellyfish: '🪼',
  Meteor: '🌠',
};

export function IconBadge({ mascot }: { mascot: string }) {
  const key = mascot.split(' ')[0] ?? 'Rocket';
  const emoji = emojiMap[key] ?? '🎮';

  return (
    <View style={styles.badge}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 26,
  },
});
