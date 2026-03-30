import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useAuth } from '../features/auth/AuthContext';
import { mascotOptions } from '../features/auth/mascots';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  const { profile, saveProfile, logout } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [mascotIndex, setMascotIndex] = useState(
    Math.max(0, mascotOptions.findIndex((item) => item === profile?.mascot)),
  );
  const [isSaving, setIsSaving] = useState(false);
  const mascot = mascotOptions[mascotIndex];

  return (
    <Screen>
      <Card>
        <View style={styles.profileHeader}>
          <IconBadge mascot={mascot} />
          <View style={styles.profileInfo}>
            <Text style={styles.title}>{profile?.nickname ?? 'Player'}</Text>
            <Text style={styles.subtitle}>{mascot}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <TextField
          autoCapitalize="words"
          label="Nickname"
          onChangeText={setNickname}
          value={nickname}
        />
        <PrimaryButton
          label={`Switch mascot: ${mascot}`}
          onPress={() => setMascotIndex((current) => (current + 1) % mascotOptions.length)}
        />
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Save changes'}
          onPress={() => {
            setIsSaving(true);
            void saveProfile({ nickname, mascot }).finally(() => setIsSaving(false));
          }}
          disabled={nickname.trim().length < 2 || isSaving}
        />
      </Card>

      <Card>
        <Text style={styles.logoutText}>Need to reset the mock account?</Text>
        <PrimaryButton
          label="Log out"
          onPress={() => {
            void logout();
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileInfo: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
