import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import {
  fetchPendingRematchForProfile,
  subscribeToPendingRematches,
} from '../features/online-game/supabaseOnline';
import { OnlineGame } from '../types/game';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const howToPlay = [
  'The very first move can go in any of the 81 cells.',
  'Every later move sends the next player to the matching small board position.',
  'Win a small board to claim that square on the big board.',
  'If you are sent to a full or won board, you can play in any open board.',
  'Win three claimed boards in a row on the big board to win the match.',
  'If no playable boards remain and nobody wins the big board, the game is a draw.',
];

export function HomeScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [pendingRematch, setPendingRematch] = useState<OnlineGame | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    const load = async () => {
      const pending = await fetchPendingRematchForProfile(profile.id);
      setPendingRematch(pending);
    };

    void load();
    const unsubscribe = subscribeToPendingRematches(() => {
      void load();
    });
    const intervalId = setInterval(() => {
      void load();
    }, 3000);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, [profile]);

  return (
    <Screen>
      <Card>
        <View style={styles.profileRow}>
          <View style={styles.profileInfo}>
            <Text style={styles.title}>Nested Tic Tac Toe</Text>
            <Text style={styles.subtitle}>
              Welcome back, {profile?.nickname}. Ready for another clever battle?
            </Text>
          </View>
          <View style={styles.profileActions}>
            <IconBadge mascot={profile?.mascot ?? 'Rocket Raccoon'} />
            <PrimaryButton label="Profile" onPress={() => navigation.navigate('Profile')} />
          </View>
        </View>
      </Card>

      {pendingRematch ? (
        <Card>
          <Text style={styles.sectionTitle}>Rematch waiting</Text>
          <Text style={styles.body}>
            A friend wants to continue a finished session. Open the result screen to accept or
            decline.
          </Text>
          <PrimaryButton
            label="Open request"
            onPress={() => navigation.navigate('OnlineResult', { gameId: pendingRematch.id })}
          />
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Choose a mode</Text>
        <PrimaryButton
          label="Play with Friends in person"
          onPress={() => navigation.navigate('LocalSetup')}
        />
        <PrimaryButton
          label="Play with friends online"
          onPress={() => navigation.navigate('OnlineLobby')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>How to play</Text>
        {howToPlay.map((instruction) => (
          <Text key={instruction} style={styles.instruction}>
            - {instruction}
          </Text>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    gap: 16,
  },
  profileInfo: {
    gap: 8,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  instruction: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
