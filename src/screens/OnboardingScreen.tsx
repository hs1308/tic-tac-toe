import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { PrimaryButton } from '../components/PrimaryButton';
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
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                  <IconBadge mascot={mascot} size={36} />
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Enter the app'}
          onPress={() => {
            setIsSaving(true);
            void saveProfile({ nickname, mascot: selectedMascot }).finally(() => setIsSaving(false));
          }}
          disabled={nickname.trim().length < 2 || isSaving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
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
    marginBottom: 12,
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mascotCard: {
    width: '18%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    backgroundColor: colors.backgroundMuted,
  },
  mascotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#14304a',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'rgba(8, 17, 32, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
