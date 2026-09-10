import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Label } from '@/components';
import { roundAverage, seasonStandings, voteOf } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { club, movies, currentUserId, source, setCurrentUser, restartDemo } = useClubStore();
  if (!club) return null;

  const me = club.members.find((m) => m.id === currentUserId)!;
  const standing = seasonStandings(club).find((row) => row.member.id === me.id);

  const myVotes = club.rounds
    .filter((round) => round.status === 'closed')
    .map((round) => ({ round, vote: voteOf(round, me.id) }))
    .filter((entry) => entry.vote !== undefined)
    .reverse();

  const average =
    myVotes.length > 0
      ? Math.round(
          (myVotes.reduce((sum, e) => sum + (e.vote?.score ?? 0), 0) / myVotes.length) * 10
        ) / 10
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar member={me} size={56} />
          <View>
            <Text style={styles.name}>{me.name}</Text>
            <Text style={styles.meta}>{club.name}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{standing?.average?.toFixed(1) ?? '—'}</Text>
            <Label>Como curador</Label>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{average?.toFixed(1) ?? '—'}</Text>
            <Label>Nota que dou</Label>
          </Card>
          <Card style={styles.stat}>
            <Text style={styles.statValue}>{myVotes.length}</Text>
            <Label>Sessões</Label>
          </Card>
        </View>

        <View>
          <Label style={styles.sectionLabel}>Minhas notas</Label>
          <View style={styles.list}>
            {myVotes.map(({ round, vote }) => (
              <Card key={round.number} style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.movie}>
                    {movies.find((m) => m.id === round.movieId)?.title}
                  </Text>
                  {vote?.review ? <Text style={styles.review}>{vote.review}</Text> : null}
                  <Text style={styles.meta}>
                    rodada {round.number} · média do clube {roundAverage(round)?.toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.score}>{vote?.score}</Text>
              </Card>
            ))}
            {myVotes.length === 0 && (
              <Card>
                <Text style={styles.meta}>Você ainda não votou em nenhuma rodada.</Text>
              </Card>
            )}
          </View>
        </View>

        <Card outlined style={styles.demo}>
          <Label>Protótipo</Label>
          <Text style={styles.meta}>
            O Claquete é um produto de grupo. Para demonstrar em um aparelho só,
            dá para ver o aplicativo como qualquer membro do clube.
          </Text>
          <View style={styles.membros}>
            {club.members.map((member) => {
              const ativo = member.id === currentUserId;
              return (
                <Pressable
                  key={member.id}
                  onPress={() => setCurrentUser(member.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver como ${member.name}`}
                  accessibilityState={{ selected: ativo }}
                  style={[styles.membro, ativo && styles.membroAtivo]}
                >
                  <Avatar member={member} size={30} />
                  <Text style={[styles.membroNome, ativo && styles.membroNomeAtivo]}>
                    {member.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.meta}>
            Fonte de dados:{' '}
            <Text style={styles.strong}>
              {source === 'mock' ? 'JSON local' : 'Supabase'}
            </Text>
          </Text>
          <Button
            label="Reiniciar demonstração"
            variant="ghost"
            style={styles.reset}
            onPress={async () => {
              await restartDemo();
              router.replace('/clube');
            }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...typography.title, fontSize: 28, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  strong: { color: colors.text, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { ...typography.score, fontSize: 30, color: colors.primary },
  sectionLabel: { marginBottom: spacing.sm },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowInfo: { flex: 1, gap: 2 },
  movie: { ...typography.subtitle, fontSize: 15, color: colors.text },
  review: { ...typography.caption, color: colors.textMuted, fontStyle: 'italic' },
  score: { ...typography.score, fontSize: 26, color: colors.primary },
  demo: { gap: spacing.sm },
  membros: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  membro: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  membroAtivo: { borderColor: colors.primary, backgroundColor: colors.surface },
  membroNome: { ...typography.caption, fontSize: 11, color: colors.textMuted },
  membroNomeAtivo: { color: colors.primary },
  reset: { height: 44, marginTop: spacing.sm },
});
