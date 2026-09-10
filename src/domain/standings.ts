import { curatorOf } from './rotation';
import type { Club, StandingRow } from './types';
import { roundAverage } from './voting';

/**
 * Season standings.
 *
 * The score belongs to the curator, not to the film: each closed round hands
 * its average to whoever picked it, and a member's position is the average of
 * those rounds. Members who have not curated a closed round yet appear last,
 * with no score — they have not been judged, so they cannot be ranked.
 */
export function seasonStandings(club: Club): StandingRow[] {
  const totals = new Map<string, number[]>();

  for (const round of club.rounds) {
    if (round.status !== 'closed') continue;
    const average = roundAverage(round);
    if (average === null) continue;
    const scores = totals.get(round.curatorId) ?? [];
    scores.push(average);
    totals.set(round.curatorId, scores);
  }

  const rows = club.members.map((member) => {
    const scores = totals.get(member.id) ?? [];
    const average =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;
    return { member, average, roundsCurated: scores.length, position: 0 };
  });

  rows.sort((a, b) => {
    if (a.average === null && b.average === null) {
      return a.member.name.localeCompare(b.member.name);
    }
    if (a.average === null) return 1;
    if (b.average === null) return -1;
    if (b.average !== a.average) return b.average - a.average;
    return a.member.name.localeCompare(b.member.name);
  });

  // Ties share a position: two curators on 8.2 are both second.
  let position = 0;
  let previous: number | null | undefined;
  rows.forEach((row, index) => {
    if (row.average !== previous) {
      position = index + 1;
      previous = row.average;
    }
    row.position = row.average === null ? rows.length : position;
  });

  return rows;
}

/** Rounds left until the season trophy. */
export function roundsRemaining(club: Club): number {
  const closed = club.rounds.filter((round) => round.status === 'closed').length;
  return Math.max(0, club.season.totalRounds - closed);
}

/** Who curates the round after the one in play. */
export function nextCurator(club: Club) {
  return curatorOf(club, nextRoundNumber(club));
}

/** And the one after that — the club likes to know when its own turn comes. */
export function curatorAfterNext(club: Club) {
  return curatorOf(club, nextRoundNumber(club) + 1);
}

function nextRoundNumber(club: Club): number {
  const inPlay = club.rounds.find((round) => round.status !== 'closed');
  return inPlay ? inPlay.number + 1 : club.rounds.length + 1;
}
