import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { GameIllustration } from '../components/GameIllustration';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useAuth } from '../features/auth/AuthContext';
import { colors } from '../theme/colors';

export function WelcomeScreen() {
  const { mockSignIn, isLoading } = useAuth();

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Party strategy game</Text>
        <Text style={styles.title}>Nested Tic Tac Toe</Text>
        <Text style={styles.subtitle}>
          Big-board mind games for two friends on one phone or across the internet.
        </Text>
      </View>

      <GameIllustration />

      <Card>
        <Text style={styles.cardTitle}>Sign in</Text>
        <Text style={styles.cardBody}>
          Google login is coming next. For now, this button uses a mock sign-in so we can build the
          full game flow first.
        </Text>
        <PrimaryButton
          label={isLoading ? 'Loading...' : 'Continue with Google'}
          onPress={() => {
            void mockSignIn();
          }}
          disabled={isLoading}
        />
        {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 24,
    gap: 10,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 42,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
