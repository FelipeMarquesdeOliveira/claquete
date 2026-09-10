import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Icon, Label, Poster } from '@/components';
import { currentRound } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, radius, spacing, typography } from '@/theme';
import { countdownLabel, formatLongDate, nextSessionSlot } from '@/utils/date';

export default function CuratorScreen() {
  const { club, movies, pickMovie } = useClubStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sessionAt = useMemo(() => nextSessionSlot(), []);
  const round = club ? currentRound(club) : null;

  // Films the club already watched are out: the point is to see something new.
  const watched = useMemo(
    () => new Set(club?.rounds.map((r) => r.movieId).filter(Boolean) as string[]),
    [club]
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return movies
      .filter((movie) => !watched.has(movie.id))
      .filter((movie) => (term ? movie.title.toLowerCase().includes(term) : true));
  }, [movies, query, watched]);

  async function confirm() {
    if (!selected) return;
    setSaving(true);
    await pickMovie(selected, sessionAt);
    router.back();
  }

  if (!club || !round) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.back} onPress={() => router.back()}>
            ‹
          </Text>
          <Text style={styles.title}>É COM VOCÊ ESSA SEMANA</Text>
        </View>

        <Card style={styles.deadline}>
          <Text style={styles.deadlineText}>
            Escolha {countdownLabel(round.pickDeadline)} ou a vez passa
          </Text>
        </Card>

        <View>
          <Label style={styles.sectionLabel}>O filme da rodada {round.number}</Label>
          <View style={styles.search}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar filme"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel="Buscar filme"
            />
          </View>
        </View>

        <View style={styles.list}>
          {results.map((movie) => {
            const active = selected === movie.id;
            return (
              <Pressable
                key={movie.id}
                onPress={() => setSelected(movie.id)}
                accessibilityRole="button"
                style={[styles.option, active && styles.optionActive]}
              >
                <Poster movieId={movie.id} width={44} />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{movie.title}</Text>
                  <Text style={styles.optionMeta}>
                    {movie.year} · {movie.genres.join(', ')}
                  </Text>
                  <Text style={styles.optionMeta}>Disponível na {movie.streaming}</Text>
                </View>
                {active && (
                  <View style={styles.check}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
          {results.length === 0 && (
            <Text style={styles.empty}>Nenhum filme encontrado com esse nome.</Text>
          )}
        </View>

        <Card style={styles.session}>
          <View style={styles.sessionLeft}>
            <Icon name="calendar" color={colors.primary} size={20} />
            <View>
              <Label>Sessão</Label>
              <Text style={styles.sessionDate}>{formatLongDate(sessionAt)} · 20h</Text>
            </View>
          </View>
          <Text style={styles.alterar}>alterar</Text>
        </Card>

        <Button
          label={saving ? 'Salvando…' : 'Bater a claquete'}
          icon="claquete"
          disabled={!selected || saving}
          onPress={confirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: { color: colors.text, fontSize: 30, lineHeight: 32 },
  title: { ...typography.title, fontSize: 26, color: colors.text, flex: 1 },
  deadline: {
    backgroundColor: 'rgba(226,62,87,0.12)',
    borderColor: colors.secondary,
  },
  deadlineText: { ...typography.body, color: colors.text },
  sectionLabel: { marginBottom: spacing.sm },
  search: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  input: { ...typography.body, color: colors.text },
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.surface },
  optionInfo: { flex: 1, gap: 3 },
  optionTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
  optionMeta: { ...typography.caption, fontSize: 12, color: colors.textMuted },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: colors.textInverse, fontWeight: '700' },
  empty: { ...typography.body, color: colors.textMuted, paddingVertical: spacing.md },
  session: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionDate: { ...typography.body, color: colors.text, marginTop: 3 },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  alterar: { ...typography.caption, color: colors.primary },
});
