import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

export function OnlinePlayScreen() {
  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Online multiplayer</Text>
        <Text style={styles.body}>
          This flow will create and join turn-based games backed by Supabase tables prefixed with
          `tic_tac_toe_`.
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
