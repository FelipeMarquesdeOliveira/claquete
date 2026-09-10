import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Aviso, Button, Card, Icon, Label, Poster } from '@/components';
import { currentRound, everyoneVoted, votesMissing } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, radius, spacing, typography } from '@/theme';
import { withArticle } from '@/utils/names';

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function VotingScreen() {
  const { club, movies, currentUserId, castVote, closeRound } = useClubStore();
  const [score, setScore] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);

  const round = club ? currentRound(club) : null;
  const movie = movies.find((m) => m.id === round?.movieId);
  const curator = club?.members.find((m) => m.id === round?.curatorId);

  async function submit() {
    if (score === null || !club || !round) return;
    setSaving(true);
    await castVote(score, review.trim());

    // With the last vote in, the scores are revealed and the round closes.
    const updated = useClubStore.getState().club;
    const updatedRound = updated ? currentRound(updated) : null;
    if (updated && updatedRound && everyoneVoted(updated, updatedRound)) {
      await closeRound();
      router.replace('/resultado');
      return;
    }
    router.back();
  }

  if (!club || !round || !movie) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>
            ‹
          </Text>
          <Text style={styles.title}>SUA NOTA</Text>
        </View>

        <Aviso />

        <Card style={styles.movie}>
          <Poster movieId={movie.id} width={40} />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={styles.meta}>
              Rodada {round.number} · escolha {curator ? withArticle(curator.name) : ''}
            </Text>
          </View>
        </Card>

        <View style={styles.scoreBox}>
          <Text style={styles.bigScore}>{score === null ? '–' : score}</Text>
          <Text style={styles.outOf}>/10</Text>
        </View>
        <Text style={styles.hint}>
          {score === null ? 'Toque em uma nota abaixo' : 'Toque para mudar sua nota'}
        </Text>

        <View style={styles.pills}>
          {SCORES.map((value) => {
            const active = score === value;
            return (
              <Pressable
                key={value}
                onPress={() => setScore(value)}
                accessibilityRole="button"
                accessibilityLabel={`Nota ${value}`}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <View>
          <Label style={styles.reviewLabel}>Sua resenha, em uma linha</Label>
          <TextInput
            value={review}
            onChangeText={setReview}
            placeholder="O que você achou?"
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.review}
            accessibilityLabel="Sua resenha"
          />
        </View>

        <View style={styles.spacer} />

        <Card style={styles.lock}>
          <Icon name="lock" color={colors.primary} size={18} />
          <Text style={styles.lockText}>
            As notas ficam fechadas até todo mundo votar.{'\n'}
            <Text style={styles.lockStrong}>
              {round.votes.length} de {club.members.length} já votaram
              {votesMissing(club, round) === 1 ? ' — falta só você' : ''}.
            </Text>
          </Text>
        </Card>

        <Button
          label={saving ? 'Enviando…' : 'Enviar minha nota'}
          disabled={score === null || saving}
          onPress={submit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  spacer: { flex: 1, minHeight: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: { color: colors.text, fontSize: 30, lineHeight: 32 },
  title: { ...typography.title, fontSize: 26, color: colors.text },
  movie: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  movieInfo: { flex: 1 },
  movieTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 3 },
  scoreBox: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
  bigScore: { ...typography.score, fontSize: 72, lineHeight: 74, color: colors.primary },
  outOf: { ...typography.subtitle, color: colors.textMuted, marginBottom: 12 },
  hint: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: -8 },
  pills: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    // 6 por linha ocupando a largura útil da tela, como na tela do CP4
    width: 50,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { ...typography.score, fontSize: 22, lineHeight: 24, color: colors.textMuted },
  pillTextActive: { color: colors.textInverse },
  reviewLabel: { marginBottom: spacing.sm },
  review: {
    ...typography.body,
    color: colors.text,
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  lock: {
    backgroundColor: 'rgba(255,197,61,0.08)',
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lockText: { ...typography.caption, color: colors.textMuted, lineHeight: 20, flex: 1 },
  lockStrong: { color: colors.text, fontWeight: '700' },
});
