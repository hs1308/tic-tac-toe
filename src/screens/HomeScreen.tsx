import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SupabaseStatusCard } from '../features/supabase/components/SupabaseStatusCard';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>V1 foundation</Text>
        <Text style={styles.title}>Simple, modular setup for local and online play.</Text>
        <Text style={styles.subtitle}>
          Game rules come next. This build gives us navigation, Supabase wiring, and clear
          feature boundaries to iterate safely.
        </Text>
      </View>

      <SupabaseStatusCard />

      <Card>
        <Text style={styles.sectionTitle}>Play modes</Text>
        <Text style={styles.body}>
          Both flows are placeholders right now so we can settle architecture before game logic.
        </Text>
        <PrimaryButton
          label="Open same-device flow"
          onPress={() => navigation.navigate('LocalPlay')}
        />
        <PrimaryButton
          label="Open online flow"
          onPress={() => navigation.navigate('OnlinePlay')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
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
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
