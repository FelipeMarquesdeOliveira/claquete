import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/theme';

/**
 * Claquete brand mark drawn with native views (no SVG dependency):
 * a clapperboard whose top stripes turn into rating bars in the body.
 */
function ClaqueteMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.markTop}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.stripe, { left: 8 + i * 28 }]} />
        ))}
      </View>
      <View style={styles.markBody}>
        {[14, 30, 22].map((height, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: i === 1 ? colors.primary : colors.surfaceAlt,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const STEPS = [
  'Monte o clube e chame a galera pelo código.',
  'A cada rodada, um curador escolhe o filme da semana.',
  'Todos dão nota. Quem escolhe melhor, lidera a temporada.',
];

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ClaqueteMark />
          <Text style={styles.wordmark}>CLAQUETE</Text>
          <Text style={styles.tagline}>
            Toda semana um escolhe. Todo mundo julga.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>COMO FUNCIONA</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          CP4 · Idealização{'\n'}FIAP · Mobile Development & IoT
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', gap: spacing.md },
  mark: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  markTop: {
    height: 30,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  stripe: {
    position: 'absolute',
    top: -16,
    width: 11,
    height: 62,
    backgroundColor: colors.background,
    transform: [{ rotate: '20deg' }],
  },
  markBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  bar: { width: 12, borderRadius: radius.sm / 2 },
  wordmark: { ...typography.hero, color: colors.text },
  tagline: {
    ...typography.subtitle,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardLabel: { ...typography.label, color: colors.primary },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    ...typography.title,
    fontSize: 22,
    color: colors.secondary,
    width: 22,
  },
  stepText: { ...typography.body, color: colors.text, flex: 1 },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
