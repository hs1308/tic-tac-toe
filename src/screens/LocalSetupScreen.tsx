import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalSetup'>;

export function LocalSetupScreen({ navigation }: Props) {
  const [playerXName, setPlayerXName] = useState('');
  const [playerOName, setPlayerOName] = useState('');

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Play with friends in person</Text>
        <Text style={styles.body}>
          Enter both player names, then pass the phone back and forth after each move.
        </Text>
        <TextField
          autoCapitalize="words"
          label="Player X name"
          onChangeText={setPlayerXName}
          value={playerXName}
        />
        <TextField
          autoCapitalize="words"
          label="Player O name"
          onChangeText={setPlayerOName}
          value={playerOName}
        />
        <PrimaryButton
          label="Start game"
          onPress={() =>
            navigation.navigate('LocalGame', {
              playerXName: playerXName.trim(),
              playerOName: playerOName.trim(),
            })
          }
          disabled={playerXName.trim().length < 2 || playerOName.trim().length < 2}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
