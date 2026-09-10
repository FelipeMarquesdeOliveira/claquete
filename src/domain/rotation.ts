import type { Club, Member, Round } from './types';

/**
 * Who curates a given round.
 *
 * The rotation is a fixed list and rounds cycle through it, so round 6 in a
 * five-member club falls back to the first curator. This is the rule that
 * replaces voting: nobody chooses who chooses.
 */
export function curatorOf(club: Club, roundNumber: number): Member {
  if (roundNumber < 1) {
    throw new Error(`Round number must be 1 or greater, got ${roundNumber}`);
  }
  const index = (roundNumber - 1) % club.rotation.length;
  const memberId = club.rotation[index];
  const member = club.members.find((m) => m.id === memberId);
  if (!member) {
    throw new Error(`Rotation points at unknown member "${memberId}"`);
  }
  return member;
}

/** The round currently in play: the first one that has not closed yet. */
export function currentRound(club: Club): Round | null {
  return club.rounds.find((round) => round.status !== 'closed') ?? null;
}

/** True when this member is the curator of the round in play. */
export function isMyTurn(club: Club, memberId: string): boolean {
  const round = currentRound(club);
  return round ? round.curatorId === memberId : false;
}

/**
 * The curator has a deadline to pick. Once it passes the turn moves on, so a
 * single silent member cannot freeze the club.
 */
export function pickDeadlineMissed(round: Round, now: Date): boolean {
  return round.status === 'awaiting_pick' && now > new Date(round.pickDeadline);
}
