import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Button, Card, Icon, Label, Poster } from '@/components';
import {
  confirmedCount,
  curatorAfterNext,
  currentRound,
  hasConfirmed,
  hasVoted,
  nextCurator,
  roundAverage,
  scoresRevealed,
  votesMissing,
} from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, spacing, typography } from '@/theme';
import { countdownLabel, formatSession } from '@/utils/date';

/** "da Marina" / "do Gabriel" — nomes terminados em A levam artigo feminino. */
function genderedOf(name: string): string {
  return `${name.trim().toLowerCase().endsWith('a') ? 'da' : 'do'} ${name}`;
}

export default function ClubScreen() {
  const { club, movies, currentUserId, loading, confirmPresence, openVoting, closeRound } =
    useClubStore();

  if (loading || !club) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.loading}>Carregando o clube…</Text>
      </SafeAreaView>
    );
  }

  const round = currentRound(club);
  const memberById = (id: string) => club.members.find((m) => m.id === id)!;
  const movieById = (id: string | null) => movies.find((m) => m.id === id);

  const shelf = club.rounds
    .filter((r) => r.status === 'closed')
    .slice(-2)
    .reverse();

  const myTurn = round?.curatorId === currentUserId;
  const curator = round ? memberById(round.curatorId) : null;
  const movie = movieById(round?.movieId ?? null);
  const revealed = round ? scoresRevealed(club, round) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clubName}>{club.name.toUpperCase()}</Text>
            <Text style={styles.subtitle}>
              {club.members.length} membros · Temporada {club.season.number}
            </Text>
          </View>
          <View style={styles.avatars}>
            {club.members.slice(0, 3).map((member, i) => (
              <View key={member.id} style={i > 0 ? styles.stacked : undefined}>
                <Avatar member={member} size={30} ringed />
              </View>
            ))}
          </View>
        </View>

        {round && (
          <Card style={styles.roundCard}>
            <View style={styles.roundHeader}>
              <Label style={styles.roundNumber}>
                Rodada {round.number} de {club.season.totalRounds}
              </Label>
              {round.status === 'awaiting_pick' ? (
                <Label>{countdownLabel(round.pickDeadline)}</Label>
              ) : round.sessionAt ? (
                <Label>{countdownLabel(round.sessionAt)}</Label>
              ) : null}
            </View>

            {round.status === 'awaiting_pick' && (
              <View style={styles.gap}>
                <Text style={styles.headline}>
                  {myTurn ? 'É COM VOCÊ ESSA SEMANA' : `A VEZ É ${curator?.name.toUpperCase()}`}
                </Text>
                <Text style={styles.body}>
                  {myTurn
                    ? `Escolha o filme da rodada até ${countdownLabel(round.pickDeadline)}. Se o prazo vencer, a vez passa.`
                    : `${curator?.name} ainda não escolheu o filme. O clube é avisado assim que a escolha sair.`}
                </Text>
                {myTurn && (
                  <Button label="Escolher o filme" onPress={() => router.push('/curadoria')} />
                )}
              </View>
            )}

            {round.status !== 'awaiting_pick' && movie && (
              <View style={styles.gap}>
                <View style={styles.movieRow}>
                  <Poster movieId={movie.id} width={92} />
                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle}>{movie.title.toUpperCase()}</Text>
                    <Text style={styles.meta}>
                      {movie.year} · {movie.genres.join(', ')} · {Math.floor(movie.runtimeMinutes / 60)}h
                      {String(movie.runtimeMinutes % 60).padStart(2, '0')}
                    </Text>
                    {curator && (
                      <View style={styles.curatorRow}>
                        <Avatar member={curator} size={22} />
                        <Text style={styles.body}>
                          escolha {curator.id === currentUserId ? 'sua' : `de ${curator.name}`}
                        </Text>
                      </View>
                    )}
                    {round.sessionAt && (
                      <View style={styles.sessionRow}>
                        <Icon name="calendar" color={colors.textMuted} />
                        <Text style={styles.meta}>
                          {formatSession(round.sessionAt)} · {movie.streaming}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {round.status === 'awaiting_session' &&
                  (hasConfirmed(round, currentUserId) ? (
                    <Button label="Já assistimos" variant="ghost" onPress={openVoting} />
                  ) : (
                    <Button label="Confirmar presença" onPress={confirmPresence} />
                  ))}

                {round.status === 'voting' && !revealed && (
                  <Button
                    label={
                      hasVoted(round, currentUserId)
                        ? `Faltam ${votesMissing(club, round)} votos`
                        : 'Dar minha nota'
                    }
                    variant={hasVoted(round, currentUserId) ? 'ghost' : 'primary'}
                    disabled={hasVoted(round, currentUserId)}
                    onPress={() => router.push('/votacao')}
                  />
                )}

                {round.status === 'voting' && revealed && (
                  <Button
                    label="Ver o veredito"
                    onPress={async () => {
                      await closeRound();
                      router.push('/resultado');
                    }}
                  />
                )}
              </View>
            )}
          </Card>
        )}

        {round && round.status === 'awaiting_session' && (
          <Card style={styles.strip}>
            <View style={styles.stripText}>
              <Text style={styles.stripTitle}>
                {confirmedCount(round)} de {club.members.length} confirmaram
              </Text>
              <Text style={styles.meta}>A votação abre depois da sessão</Text>
            </View>
            <View style={styles.avatars}>
              {round.confirmations.slice(0, 3).map((id, i) => (
                <View key={id} style={i > 0 ? styles.stacked : undefined}>
                  <Avatar member={memberById(id)} size={26} ringed />
                </View>
              ))}
            </View>
          </Card>
        )}

        {round && round.status === 'voting' && !scoresRevealed(club, round) && (
          <Card style={styles.strip}>
            <View style={styles.stripText}>
              <Text style={styles.stripTitle}>
                {round.votes.length} de {club.members.length} já votaram
              </Text>
              <Text style={styles.meta}>As notas só aparecem quando todo mundo votar</Text>
            </View>
            <View style={styles.avatars}>
              {round.votes.slice(0, 3).map((vote, i) => (
                <View key={vote.memberId} style={i > 0 ? styles.stacked : undefined}>
                  <Avatar member={memberById(vote.memberId)} size={26} ringed />
                </View>
              ))}
            </View>
          </Card>
        )}

        {round && (
          <Card outlined style={styles.nextRound}>
            <Avatar member={nextCurator(club)} size={28} />
            <View>
              <Text style={styles.stripTitle}>
                Rodada {round.number + 1} é {genderedOf(nextCurator(club).name)}
              </Text>
              <Text style={styles.meta}>
                {curatorAfterNext(club).id === currentUserId
                  ? 'Depois, é a sua vez'
                  : `Depois, é a vez ${genderedOf(curatorAfterNext(club).name)}`}
              </Text>
            </View>
          </Card>
        )}

        {shelf.length > 0 && (
          <Card>
            <View style={styles.shelfHeader}>
              <Label>Na estante do clube</Label>
              <Text style={styles.link} onPress={() => router.push('/estante')}>
                ver tudo
              </Text>
            </View>
            {shelf.map((item) => {
              const shelfMovie = movieById(item.movieId);
              return (
                <View key={item.number} style={styles.shelfRow}>
                  <Poster movieId={item.movieId} width={26} />
                  <View style={styles.shelfInfo}>
                    <Text style={styles.shelfTitle}>{shelfMovie?.title}</Text>
                    <Text style={styles.shelfMeta}>
                      rodada {item.number} · escolha de {memberById(item.curatorId).name}
                    </Text>
                  </View>
                  <Text style={styles.score}>{roundAverage(item)?.toFixed(1)}</Text>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  loading: { ...typography.body, color: colors.textMuted, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clubName: { ...typography.title, fontSize: 28, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  avatars: { flexDirection: 'row' },
  stacked: { marginLeft: -10 },
  roundCard: { padding: spacing.lg, gap: spacing.md },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  roundNumber: { color: colors.primary },
  gap: { gap: spacing.md },
  headline: { ...typography.title, fontSize: 26, color: colors.text },
  body: { ...typography.body, color: colors.textMuted },
  movieRow: { flexDirection: 'row', gap: spacing.md },
  movieInfo: { flex: 1, gap: 6 },
  movieTitle: { ...typography.title, fontSize: 28, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
  curatorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  stripText: { flex: 1 },
  nextRound: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stripTitle: { ...typography.subtitle, fontSize: 15, color: colors.text },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  link: { ...typography.caption, color: colors.primary },
  shelfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  shelfInfo: { flex: 1 },
  shelfTitle: { ...typography.body, color: colors.text },
  shelfMeta: { ...typography.caption, fontSize: 11, color: colors.textMuted },
  score: { ...typography.score, fontSize: 20, color: colors.primary },
});
