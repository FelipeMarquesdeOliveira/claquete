import { create } from 'zustand';

import { getRepository, type DataSource } from '@/data';
import { resetMockData } from '@/data';
import type { Club, Movie } from '@/domain';

/**
 * Application state.
 *
 * Every mutation goes through the repository and then reloads the club, so the
 * screens always render what storage actually holds — no optimistic state to
 * drift out of sync with the database once Supabase is plugged in.
 */
type ClubState = {
  club: Club | null;
  movies: Movie[];
  currentUserId: string;
  source: DataSource;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  pickMovie: (movieId: string, sessionAt: string) => Promise<void>;
  confirmPresence: () => Promise<void>;
  openVoting: () => Promise<void>;
  castVote: (score: number, review: string) => Promise<void>;
  closeRound: () => Promise<void>;
  restartDemo: () => Promise<void>;
};

/** Whoever is using the app in this demo. */
const CURRENT_USER = 'felipe';

const repository = getRepository();

function currentRoundNumber(club: Club | null): number {
  const round = club?.rounds.find((r) => r.status !== 'closed');
  if (!round) throw new Error('Nenhuma rodada em jogo');
  return round.number;
}

export const useClubStore = create<ClubState>((set, get) => ({
  club: null,
  movies: [],
  currentUserId: CURRENT_USER,
  source: repository.source,
  loading: true,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const [club, movies] = await Promise.all([
        repository.loadClub(),
        repository.listMovies(),
      ]);
      set({ club, movies, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Falha ao carregar o clube',
      });
    }
  },

  async pickMovie(movieId, sessionAt) {
    await repository.pickMovie({
      roundNumber: currentRoundNumber(get().club),
      movieId,
      sessionAt,
    });
    await get().load();
  },

  async confirmPresence() {
    await repository.confirmPresence({
      roundNumber: currentRoundNumber(get().club),
      memberId: get().currentUserId,
    });
    await get().load();
  },

  async openVoting() {
    const roundNumber = currentRoundNumber(get().club);
    await repository.openVoting({ roundNumber });
    // os outros membros votam aqui, para a regra de revelação poder ser exercida
    await repository.seedOtherVotes({ roundNumber, exceptMemberId: get().currentUserId });
    await get().load();
  },

  async castVote(score, review) {
    await repository.registerVote({
      roundNumber: currentRoundNumber(get().club),
      vote: { memberId: get().currentUserId, score, review },
    });
    await get().load();
  },

  async closeRound() {
    await repository.closeRound({ roundNumber: currentRoundNumber(get().club) });
    await get().load();
  },

  async restartDemo() {
    resetMockData();
    await get().load();
  },
}));
