import type { Club, Movie, Vote } from '@/domain';

export type DataSource = 'mock' | 'supabase';

/**
 * Everything the app needs from storage.
 *
 * Two implementations satisfy this contract: a local one backed by JSON
 * (`mockRepository`) and a remote one backed by Postgres (`supabaseRepository`).
 * The screens never know which is in use — that is the whole point of the
 * interface, and it is what lets the database come and go without touching UI.
 */
export interface ClubRepository {
  readonly source: DataSource;

  loadClub(): Promise<Club>;
  listMovies(): Promise<Movie[]>;

  /** The curator picks the film of the round and sets the session date. */
  pickMovie(input: {
    roundNumber: number;
    movieId: string;
    sessionAt: string;
  }): Promise<void>;

  /** A member says they will be at the session. */
  confirmPresence(input: { roundNumber: number; memberId: string }): Promise<void>;

  /** The session happened; the round opens for scoring. */
  openVoting(input: { roundNumber: number }): Promise<void>;

  /** One member scores the film. Re-voting replaces the previous score. */
  registerVote(input: { roundNumber: number; vote: Vote }): Promise<void>;

  /**
   * Prototype only: the other members cast their votes.
   *
   * The demo runs with a single user, so without this the reveal rule could
   * never be exercised — the round would sit forever waiting for four people
   * who do not exist. Documented in docs/markdown/07-prototipo.md.
   */
  seedOtherVotes(input: { roundNumber: number; exceptMemberId: string }): Promise<void>;

  /** Everyone voted: scores are revealed and the next round starts. */
  closeRound(input: { roundNumber: number }): Promise<void>;

  /**
   * Devolve os dados ao estado inicial da demonstração.
   *
   * A tela de perfil oferece isso para que a apresentação possa ser refeita
   * do zero. Com o banco ligado o reset também precisa acontecer no Postgres,
   * senão o botão mentiria: a tela recarregaria os mesmos dados já mexidos.
   */
  resetDemo(): Promise<void>;
}
