/**
 * Data contracts for a Claquete club.
 *
 * A club runs a season made of rounds. Each round has one curator, who picks
 * the film; after the session every member scores it, and the average becomes
 * the curator's points. See docs/markdown/01-escopo.md.
 */

export type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type Movie = {
  id: string;
  title: string;
  year: number;
  genres: string[];
  runtimeMinutes: number;
  streaming: string;
  synopsis: string;
};

export type Vote = {
  memberId: string;
  score: number; // 0 to 10
  review: string;
};

/**
 * A round walks through these states in order. The prototype can move a round
 * forward manually so the whole cycle is demonstrable in one sitting.
 */
export type RoundStatus =
  | 'awaiting_pick' // the curator has not chosen a film yet
  | 'awaiting_session' // film picked, session date in the future
  | 'voting' // session happened, members are scoring
  | 'closed'; // everyone voted, scores revealed

export type Round = {
  number: number;
  curatorId: string;
  movieId: string | null;
  sessionAt: string | null; // ISO date
  pickDeadline: string; // ISO date
  votes: Vote[];
  status: RoundStatus;
};

export type Season = {
  number: number;
  totalRounds: number;
};

export type Club = {
  id: string;
  name: string;
  inviteCode: string;
  members: Member[];
  /** Curator order for the season. Rounds cycle through this list. */
  rotation: string[];
  season: Season;
  rounds: Round[];
};

export type StandingRow = {
  member: Member;
  /** Average of the averages of the rounds this member curated. */
  average: number | null;
  roundsCurated: number;
  position: number;
};
