import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'OnlineLobby'>;

export function OnlineLobbyScreen({ navigation }: Props) {
  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Play with friends online</Text>
        <Text style={styles.body}>
          Create a room to get a 5-digit code, or join with a code from a friend.
        </Text>
        <PrimaryButton
          label="Create game"
          onPress={() => navigation.navigate('CreateOnlineGame')}
        />
        <PrimaryButton label="Join game" onPress={() => navigation.navigate('JoinOnlineGame')} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
