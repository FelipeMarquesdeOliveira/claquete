import { curatorOf, type Club, type Movie, type Vote } from '@/domain';

import clubSeed from './mock/club.json';
import moviesSeed from './mock/movies.json';
import type { ClubRepository } from './repository';

/**
 * In-memory repository backed by the JSON files in `mock/`.
 *
 * It keeps a working copy of the seed so the prototype survives navigation
 * between screens, and resets when the app reloads — which is exactly what a
 * demo wants: every run starts from the same known state.
 */
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

let club: Club = clone(clubSeed as unknown as Club);
const movies = clone(moviesSeed as unknown as Movie[]);

/** One week after the given date, at the same time. */
function oneWeekAfter(iso: string): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + 7);
  return date.toISOString();
}

function requireRound(roundNumber: number) {
  const round = club.rounds.find((r) => r.number === roundNumber);
  if (!round) throw new Error(`Round ${roundNumber} not found`);
  return round;
}

export const mockRepository: ClubRepository = {
  source: 'mock',

  async loadClub() {
    return clone(club);
  },

  async listMovies() {
    return clone(movies);
  },

  async pickMovie({ roundNumber, movieId, sessionAt }) {
    const round = requireRound(roundNumber);
    round.movieId = movieId;
    round.sessionAt = sessionAt;
    round.status = 'awaiting_session';
  },

  async openVoting({ roundNumber }) {
    const round = requireRound(roundNumber);
    round.status = 'voting';
  },

  async registerVote({ roundNumber, vote }) {
    const round = requireRound(roundNumber);
    const existing = round.votes.findIndex((v) => v.memberId === vote.memberId);
    if (existing >= 0) round.votes[existing] = vote;
    else round.votes.push(vote);
  },

  async closeRound({ roundNumber }) {
    const round = requireRound(roundNumber);
    round.status = 'closed';

    // the season keeps going: open the next round for the next curator
    const nextNumber = roundNumber + 1;
    if (nextNumber > club.season.totalRounds) return;
    if (club.rounds.some((r) => r.number === nextNumber)) return;

    club.rounds.push({
      number: nextNumber,
      curatorId: curatorOf(club, nextNumber).id,
      movieId: null,
      sessionAt: null,
      pickDeadline: oneWeekAfter(round.sessionAt ?? new Date().toISOString()),
      status: 'awaiting_pick',
      votes: [],
    });
  },
};

/** Puts the demo back to the seed state. Used by the profile screen. */
export function resetMockData() {
  club = clone(clubSeed as unknown as Club);
}
