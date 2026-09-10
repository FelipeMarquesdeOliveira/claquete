import type { Club, Round, Vote } from './types';

/** Every member of the club has cast a vote in this round. */
export function everyoneVoted(club: Club, round: Round): boolean {
  return round.votes.length >= club.members.length;
}

/**
 * Scores stay hidden until the last vote lands.
 *
 * Without this, whoever votes last anchors on the visible average and the
 * standings would measure social influence instead of taste. It is the reason
 * the reveal is a product decision and not a detail.
 */
export function scoresRevealed(club: Club, round: Round): boolean {
  return everyoneVoted(club, round);
}

/** How many votes are still missing before the reveal. */
export function votesMissing(club: Club, round: Round): number {
  return Math.max(0, club.members.length - round.votes.length);
}

export function voteOf(round: Round, memberId: string): Vote | undefined {
  return round.votes.find((vote) => vote.memberId === memberId);
}

export function hasVoted(round: Round, memberId: string): boolean {
  return voteOf(round, memberId) !== undefined;
}

/**
 * The round average, rounded to one decimal. Returns null while the round has
 * no votes, so the interface can tell "no score yet" from "scored zero".
 */
export function roundAverage(round: Round): number | null {
  if (round.votes.length === 0) return null;
  const total = round.votes.reduce((sum, vote) => sum + vote.score, 0);
  return Math.round((total / round.votes.length) * 10) / 10;
}

/** This member said they will be at the session. */
export function hasConfirmed(round: Round, memberId: string): boolean {
  return round.confirmations.includes(memberId);
}

/** How many members confirmed presence for the session. */
export function confirmedCount(round: Round): number {
  return round.confirmations.length;
}
