import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/Card';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { supabase } from '../../../lib/supabase';
import { colors } from '../../../theme/colors';

type StatusState =
  | { kind: 'loading'; detail: string }
  | { kind: 'success'; detail: string }
  | { kind: 'error'; detail: string };

export function SupabaseStatusCard() {
  const [status, setStatus] = useState<StatusState>({
    kind: 'loading',
    detail: 'Checking your Supabase connection.',
  });

  const runHealthCheck = async () => {
    setStatus({
      kind: 'loading',
      detail: 'Connecting to Supabase...',
    });

    const { error } = await supabase.auth.getSession();

    if (error) {
      setStatus({
        kind: 'error',
        detail: error.message,
      });
      return;
    }

    setStatus({
      kind: 'success',
      detail: 'Supabase client is configured and session storage is ready.',
    });
  };

  useEffect(() => {
    void runHealthCheck();
  }, []);

  return (
    <Card>
      <Text style={styles.title}>Backend status</Text>
      <View style={styles.row}>
        {status.kind === 'loading' ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View
            style={[
              styles.dot,
              status.kind === 'success' ? styles.dotSuccess : styles.dotError,
            ]}
          />
        )}
        <Text style={styles.status}>
          {status.kind === 'loading'
            ? 'Checking connection'
            : status.kind === 'success'
              ? 'Connected'
              : 'Needs attention'}
        </Text>
      </View>
      <Text style={styles.detail}>{status.detail}</Text>
      <PrimaryButton
        label={status.kind === 'loading' ? 'Checking...' : 'Run check again'}
        onPress={() => {
          void runHealthCheck();
        }}
        disabled={status.kind === 'loading'}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  status: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  dotSuccess: {
    backgroundColor: colors.success,
  },
  dotError: {
    backgroundColor: colors.danger,
  },
});
