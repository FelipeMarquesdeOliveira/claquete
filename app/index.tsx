import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components';
import { colors, spacing, typography } from '@/theme';

/**
 * Claquete brand mark: a solid block opened by a single diagonal cut - the same
 * gesture that slices the wordmark. See docs/markdown/02-marca.md.
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
    detail: 'Chame de 3 a 5 amigos por um código.',
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
          {/* a quebra é fixa: a frase é dita em duas partes, como na tela do CP4 */}
          <Text style={styles.tagline}>
            Toda semana um escolhe.{'\n'}Todo mundo julga.
          </Text>
        </View>

        <View style={styles.steps}>
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

        <View style={styles.actions}>
          <Button label="Criar meu clube" onPress={() => router.replace('/clube')} />
          <Button
            label="Entrar com um código"
            variant="ghost"
            onPress={() => router.replace('/clube')}
          />
          <Text style={styles.footer}>Grátis para clubes de até 6 pessoas.</Text>
        </View>
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
  steps: { gap: spacing.lg },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 21,
    color: colors.secondary,
    width: 16,
  },
  stepBody: { flex: 1 },
  stepTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
  stepDetail: { ...typography.caption, color: colors.textMuted, marginTop: 3 },
  actions: { gap: spacing.sm + 4 },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
