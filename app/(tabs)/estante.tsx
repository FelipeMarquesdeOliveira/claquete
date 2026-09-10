import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, Label, Poster } from '@/components';
import { roundAverage } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, spacing, typography } from '@/theme';
import { formatSession } from '@/utils/date';
import { withArticle } from '@/utils/names';

export default function ShelfScreen() {
  const { club, movies } = useClubStore();
  if (!club) return null;

  const watched = club.rounds.filter((r) => r.status === 'closed').reverse();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>ESTANTE DO CLUBE</Text>
          <Text style={styles.subtitle}>
            {watched.length} {watched.length === 1 ? 'filme assistido' : 'filmes assistidos'} ·
            temporada {club.season.number}
          </Text>
        </View>

        {watched.length === 0 && (
          <Card>
            <Text style={styles.empty}>
              A estante enche sozinha: cada rodada encerrada entra aqui com a nota do clube.
            </Text>
          </Card>
        )}

        {watched.map((round) => {
          const movie = movies.find((m) => m.id === round.movieId);
          const curator = club.members.find((m) => m.id === round.curatorId)!;
          return (
            <Card key={round.number} style={styles.row}>
              <Poster movieId={round.movieId} width={56} />
              <View style={styles.info}>
                <Label>Rodada {round.number}</Label>
                <Text style={styles.movieTitle}>{movie?.title}</Text>
                <View style={styles.curator}>
                  <Avatar member={curator} size={20} />
                  <Text style={styles.meta}>escolha {withArticle(curator.name)}</Text>
                </View>
                {round.sessionAt && (
                  <Text style={styles.meta}>{formatSession(round.sessionAt)}</Text>
                )}
              </View>
              <Text style={styles.score}>{roundAverage(round)?.toFixed(1)}</Text>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.title, fontSize: 28, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  empty: { ...typography.body, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 4 },
  movieTitle: { ...typography.subtitle, fontSize: 16, color: colors.text },
  curator: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { ...typography.caption, color: colors.textMuted },
  score: { ...typography.score, fontSize: 28, color: colors.primary },
});
