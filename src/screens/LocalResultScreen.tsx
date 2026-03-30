import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalResult'>;

export function LocalResultScreen({ navigation, route }: Props) {
  const { playerXName, playerOName, state } = route.params;
  const winnerName =
    state.winner === 'X' ? playerXName : state.winner === 'O' ? playerOName : 'Nobody';

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Game over</Text>
        <Text style={styles.result}>
          {state.winner === 'draw' ? 'It is a draw.' : `${winnerName} wins the game.`}
        </Text>
        <PrimaryButton
          label="Restart"
          onPress={() =>
            navigation.replace('LocalGame', {
              playerXName,
              playerOName,
            })
          }
        />
        <PrimaryButton label="Go to home" onPress={() => navigation.popToTop()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  result: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
  },
});
