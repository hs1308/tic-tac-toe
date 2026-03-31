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

export function IconBadge({ mascot, size = 56 }: { mascot: string; size?: number }) {
  const key = mascot.split(' ')[0] ?? 'Rocket';
  const emoji = emojiMap[key] ?? '🎮';

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.32),
        },
      ]}
    >
      <Text
        style={[
          styles.emoji,
          {
            fontSize: Math.round(size * 0.46),
          },
        ]}
      >
        {emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {},
});
