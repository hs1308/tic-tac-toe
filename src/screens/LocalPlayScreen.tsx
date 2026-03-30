import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

export function LocalPlayScreen() {
  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Same-device multiplayer</Text>
        <Text style={styles.body}>
          This flow will host two-player pass-and-play on one phone, with no backend dependency
          during active turns.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
