import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Card, Icon, Label } from '@/components';
import { roundsRemaining, seasonStandings } from '@/domain';
import { useClubStore } from '@/store/useClubStore';
import { colors, radius, spacing, typography } from '@/theme';

export default function StandingsScreen() {
  const { club, currentUserId } = useClubStore();
  if (!club) return null;

  const rows = seasonStandings(club);
  const podium = rows.filter((row) => row.average !== null).slice(0, 3);
  const rest = rows.slice(podium.length);
  const remaining = roundsRemaining(club);

  // second, first, third — the tallest block in the middle
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);
  const blockHeight = [76, 104, 62];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>PLACAR DA TEMPORADA</Text>
          <Text style={styles.subtitle}>
            {club.name} · temporada {club.season.number} ·{' '}
            {club.rounds.filter((r) => r.status === 'closed').length} de {club.season.totalRounds}{' '}
            rodadas
          </Text>
        </View>

        {podium.length > 0 && (
          <View style={styles.podium}>
            {podiumOrder.map((row, index) => {
              const first = row.member.id === podium[0]?.member.id;
              return (
                <View key={row.member.id} style={styles.podiumColumn}>
                  {first && <Icon name="trophy" color={colors.primary} size={18} />}
                  <Avatar member={row.member} size={first ? 46 : 38} />
                  <Text style={styles.podiumName}>{row.member.name}</Text>
                  <View
                    style={[
                      styles.block,
                      { height: blockHeight[index] },
                      first && styles.blockFirst,
                    ]}
                  >
                    <Text style={[styles.place, first && styles.placeFirst]}>
                      {row.position}º
                    </Text>
                    <Text style={[styles.podiumScore, first && styles.podiumScoreFirst]}>
                      {row.average?.toFixed(1)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.list}>
          {rest.map((row) => (
            <Card key={row.member.id} style={styles.row}>
              <Text style={styles.position}>{row.position}º</Text>
              <Avatar member={row.member} size={28} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName}>
                  {row.member.name}
                  {row.member.id === currentUserId && <Text style={styles.you}> · você</Text>}
                </Text>
                <Text style={styles.meta}>
                  {row.roundsCurated === 0
                    ? 'ainda não foi curador'
                    : `${row.roundsCurated} ${row.roundsCurated === 1 ? 'rodada' : 'rodadas'} como curador`}
                </Text>
              </View>
              <Text style={styles.rowScore}>
                {row.average === null ? '—' : row.average.toFixed(1)}
              </Text>
            </Card>
          ))}
        </View>

        <Card outlined style={styles.footer}>
          <Icon name="clock" color={colors.textMuted} size={16} />
          <Label>
            {remaining === 0
              ? 'Temporada encerrada'
              : `Faltam ${remaining} ${remaining === 1 ? 'rodada' : 'rodadas'} para o troféu`}
          </Label>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  title: { ...typography.title, fontSize: 28, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  podium: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  podiumColumn: { flex: 1, alignItems: 'center', gap: 6 },
  podiumName: { ...typography.caption, color: colors.text, fontWeight: '700' },
  block: {
    width: '100%',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockFirst: { backgroundColor: 'rgba(255,197,61,0.12)', borderColor: colors.primary },
  place: { ...typography.score, fontSize: 20, color: colors.text },
  placeFirst: { color: colors.primary, fontSize: 26 },
  podiumScore: { ...typography.caption, color: colors.textMuted },
  podiumScoreFirst: { color: colors.primary },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  position: { ...typography.score, fontSize: 18, color: colors.textMuted, width: 26 },
  rowInfo: { flex: 1 },
  rowName: { ...typography.subtitle, fontSize: 14, color: colors.text },
  you: { color: colors.primary },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  rowScore: { ...typography.score, fontSize: 22, color: colors.primary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
