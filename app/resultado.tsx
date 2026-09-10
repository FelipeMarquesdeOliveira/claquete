import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Icon, Label, Poster } from '@/components';
import { roundAverage, seasonStandings } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, spacing, typography } from '@/theme';
import { withArticle } from '@/utils/names';

export default function VerdictScreen() {
  const { club, movies, currentUserId } = useClubStore();
  if (!club) return null;

  // The verdict belongs to the round that just closed.
  const round = [...club.rounds].reverse().find((r) => r.status === 'closed');
  if (!round) return null;

  const movie = movies.find((m) => m.id === round.movieId);
  const curator = club.members.find((m) => m.id === round.curatorId)!;
  const average = roundAverage(round);
  const standing = seasonStandings(club).find((row) => row.member.id === curator.id);
  const memberById = (id: string) => club.members.find((m) => m.id === id)!;

  // da maior nota para a menor: o veredito se lê como um ranking
  const votos = [...round.votes].sort((a, b) => b.score - a.score);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Label style={styles.badgeText}>O veredito saiu</Label>
        </View>

        <Card style={styles.summary}>
          <Poster movieId={round.movieId} width={52} />
          <View style={styles.summaryInfo}>
            <Text style={styles.movieTitle}>{movie?.title.toUpperCase()}</Text>
            <Text style={styles.meta}>
              Rodada {round.number} · escolha{' '}
              {curator.id === currentUserId ? 'sua' : withArticle(curator.name)}
            </Text>
            <View style={styles.votedRow}>
              <Avatar member={curator} size={24} />
              <Text style={styles.allVoted}>
                {round.votes.length} de {club.members.length} votaram
              </Text>
            </View>
          </View>
          <View style={styles.averageBox}>
            <Text style={styles.average}>{average?.toFixed(1)}</Text>
            <Label>Média</Label>
          </View>
        </Card>

        <View style={styles.votes}>
          {votos.map((vote, index) => {
            const member = memberById(vote.memberId);
            return (
              <View key={vote.memberId} style={[styles.voteRow, index > 0 && styles.voteDivider]}>
                <Avatar member={member} size={30} />
                <View style={styles.voteInfo}>
                  <Text style={styles.voteName}>
                    {member.name}
                    {member.id === curator.id && <Text style={styles.meta}> · curador</Text>}
                  </Text>
                  {vote.review.length > 0 && (
                    <Text style={styles.review}>{vote.review}</Text>
                  )}
                </View>
                <Text style={styles.voteScore}>{vote.score}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Card style={styles.points}>
          <Icon name="trophy" color={colors.primary} size={20} />
          <View style={styles.pointsText}>
          <Text style={styles.pointsTitle}>
            {curator.id === currentUserId ? 'Você ganhou' : `${curator.name} ganhou`}{' '}
            {average?.toFixed(1)} pontos
          </Text>
          <Text style={styles.meta}>
            {standing ? `${standing.position}º lugar na temporada` : 'entrou no placar'}
          </Text>
          </View>
        </Card>

        <Button
          label="Ver placar da temporada"
          variant="ghost"
          onPress={() => router.replace('/placar')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  spacer: { flex: 1, minHeight: spacing.md },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  badgeText: { color: colors.primary },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  votedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  summaryInfo: { flex: 1 },
  movieTitle: { ...typography.title, fontSize: 28, lineHeight: 30, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  averageBox: { alignItems: 'center' },
  average: { ...typography.score, fontSize: 44, lineHeight: 46, color: colors.primary },
  votes: {},
  voteRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  voteDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  voteInfo: { flex: 1 },
  voteName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  review: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  voteScore: { ...typography.score, fontSize: 24, color: colors.primary },
  points: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceAlt },
  pointsText: { flex: 1 },
  allVoted: { ...typography.caption, color: colors.textMuted },
  pointsTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
});
