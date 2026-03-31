import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
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

type ModeCardProps = {
  icon: string;
  title: string;
  iconColor?: string;
  onPress: () => void;
};

function ModeCard({ icon, title, iconColor = '#042033', onPress }: ModeCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.modeCard, pressed ? styles.modeCardPressed : undefined]}>
      <Text style={[styles.modeIcon, { color: iconColor }]}>{icon}</Text>
      <Text style={styles.modeTitle}>{title}</Text>
    </Pressable>
  );
}

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
        <View style={styles.heroTop}>
          <View style={styles.profileInfo}>
            <Text style={styles.title}>Nested Tic Tac Toe</Text>
            <View style={styles.greetingRow}>
              <Text style={styles.subtitle}>Welcome back, {profile?.nickname}</Text>
              <IconBadge mascot={profile?.mascot ?? 'Rocket Raccoon'} size={24} />
              <Text style={styles.subtitle}>Ready for another clever battle?</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Profile')}
            style={({ pressed }) => [styles.profileIconButton, pressed ? styles.profileIconPressed : undefined]}
          >
            <Text style={styles.profileIcon}>⚙️</Text>
          </Pressable>
        </View>
      </Card>

      {pendingRematch ? (
        <Card>
          <Text style={styles.sectionTitle}>Rematch Waiting</Text>
          <Text style={styles.body}>
            A friend wants to continue a finished session. Open the result screen to accept or
            decline.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('OnlineResult', { gameId: pendingRematch.id })}
            style={({ pressed }) => [styles.rematchButton, pressed ? styles.modeCardPressed : undefined]}
          >
            <Text style={styles.rematchButtonText}>Open Request</Text>
          </Pressable>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionTitle}>Choose a Mode</Text>
        <View style={styles.modeRow}>
          <ModeCard
            icon="📱"
            title="Play with Friends In Person"
            onPress={() => navigation.navigate('LocalSetup')}
          />
          <ModeCard
            icon="🌐"
            title="Play with Friends Online"
            iconColor="#173a63"
            onPress={() => navigation.navigate('OnlineLobby')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>How to Play</Text>
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileInfo: {
    flex: 1,
    gap: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
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
  profileIconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileIconPressed: {
    opacity: 0.86,
  },
  profileIcon: {
    fontSize: 20,
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
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modeCard: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: colors.primaryStrong,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  modeCardPressed: {
    opacity: 0.88,
  },
  modeIcon: {
    fontSize: 26,
  },
  modeTitle: {
    color: '#042033',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },
  rematchButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryStrong,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rematchButtonText: {
    color: '#042033',
    fontSize: 15,
    fontWeight: '800',
  },
  instruction: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
