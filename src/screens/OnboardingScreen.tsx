import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { useAuth } from '../features/auth/AuthContext';
import { mascotOptions } from '../features/auth/mascots';
import { colors } from '../theme/colors';

export function OnboardingScreen() {
  const { profile, saveProfile } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [selectedMascot, setSelectedMascot] = useState(profile?.mascot ?? mascotOptions[0]);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.title}>Choose your player identity</Text>
        <Text style={styles.subtitle}>
          Your saved nickname and mascot will be used automatically in online games.
        </Text>
      </View>

      <Card>
        <TextField
          autoCapitalize="words"
          label="Nickname"
          maxLength={18}
          onChangeText={setNickname}
          placeholder="Enter your nickname"
          value={nickname}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Pick a mascot</Text>
        <View style={styles.mascotGrid}>
          {mascotOptions.map((mascot) => {
            const isSelected = selectedMascot === mascot;

            return (
              <Pressable
                key={mascot}
                onPress={() => setSelectedMascot(mascot)}
                style={[styles.mascotCard, isSelected ? styles.mascotCardSelected : undefined]}
              >
                <IconBadge mascot={mascot} />
                <Text style={styles.mascotName}>{mascot}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <PrimaryButton
        label={isSaving ? 'Saving...' : 'Enter the app'}
        onPress={() => {
          setIsSaving(true);
          void saveProfile({ nickname, mascot: selectedMascot }).finally(() => setIsSaving(false));
        }}
        disabled={nickname.trim().length < 2 || isSaving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  mascotGrid: {
    gap: 12,
  },
  mascotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    backgroundColor: colors.backgroundMuted,
  },
  mascotCardSelected: {
    borderColor: colors.primaryStrong,
    backgroundColor: '#10263d',
  },
  mascotName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
