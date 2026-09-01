import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, radius, typography } from '@/theme';

/**
 * Claquete brand mark: a solid block opened by a single diagonal cut - the same
 * gesture that slices the wordmark. See docs/02-marca.md.
 */
function ClaqueteMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.cut} />
    </View>
  );
}

const STEPS = [
  {
    title: 'Monte seu clube',
    detail: 'Chame de 3 a 6 amigos por um código.',
  },
  {
    title: 'Toda semana, um escolhe',
    detail: 'O app define de quem é a vez — sem enquete.',
  },
  {
    title: 'Todo mundo dá nota',
    detail: 'Quem escolhe melhor ganha a temporada.',
  },
];

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ClaqueteMark />
          <Image
            source={require('../assets/brand/wordmark.png')}
            style={styles.wordmark}
            resizeMode="contain"
            accessibilityLabel="Claquete"
          />
          <Text style={styles.tagline}>
            Toda semana um escolhe. Todo mundo julga.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>COMO FUNCIONA</Text>
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
              <View style={styles.stepBody}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
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
    borderRadius: 22,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  cut: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: 38,
    height: 9,
    backgroundColor: colors.background,
    transform: [{ rotate: '-12deg' }],
  },
  wordmark: { width: 264, height: 82 },
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
    gap: spacing.lg,
  },
  cardLabel: { ...typography.label, color: colors.primary },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    ...typography.title,
    fontSize: 22,
    color: colors.secondary,
    width: 22,
  },
  stepBody: { flex: 1 },
  stepTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
  stepDetail: { ...typography.caption, color: colors.textMuted, marginTop: 3 },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
