import { curatorOf, type Club, type Movie, type Round, type Vote } from '@/domain';
import { getSupabase } from '@/services/supabase';

import moviesSeed from './mock/movies.json';
import type { ClubRepository } from './repository';

/**
 * Repository backed by Postgres, through Supabase.
 *
 * It satisfies the same contract as the local one, so the screens do not change
 * when the data starts coming from the database. Only the club lives here: the
 * film catalogue stays local because from CP6 it comes from the TMDB API.
 */
const CLUB_ID = 'clube-cinema-da-galera';

type ClubRow = {
  id: string;
  name: string;
  invite_code: string;
  season_number: number;
  total_rounds: number;
  rotation: string[];
};

type MemberRow = {
  id: string;
  name: string;
  initials: string;
  color: string;
  join_order: number;
};

type RoundRow = {
  number: number;
  curator_id: string;
  movie_id: string | null;
  session_at: string | null;
  pick_deadline: string;
  status: Round['status'];
};

type VoteRow = {
  round_number: number;
  member_id: string;
  score: number;
  review: string;
};

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase · ${context}: ${error.message}`);
}

export const supabaseRepository: ClubRepository = {
  source: 'supabase',

  async loadClub(): Promise<Club> {
    const db = getSupabase();

    const [clubResult, membersResult, roundsResult, votesResult] = await Promise.all([
      db.from('clubs').select('*').eq('id', CLUB_ID).single(),
      db.from('members').select('*').eq('club_id', CLUB_ID).order('join_order'),
      db.from('rounds').select('*').eq('club_id', CLUB_ID).order('number'),
      db.from('votes').select('*').eq('club_id', CLUB_ID).order('created_at'),
    ]);

    fail('carregar clube', clubResult.error);
    fail('carregar membros', membersResult.error);
    fail('carregar rodadas', roundsResult.error);
    fail('carregar votos', votesResult.error);

    const club = clubResult.data as ClubRow;
    const votes = (votesResult.data ?? []) as VoteRow[];

    return {
      id: club.id,
      name: club.name,
      inviteCode: club.invite_code,
      rotation: club.rotation,
      season: { number: club.season_number, totalRounds: club.total_rounds },
      members: ((membersResult.data ?? []) as MemberRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        initials: row.initials,
        color: row.color,
      })),
      rounds: ((roundsResult.data ?? []) as RoundRow[]).map((row) => ({
        number: row.number,
        curatorId: row.curator_id,
        movieId: row.movie_id,
        sessionAt: row.session_at,
        pickDeadline: row.pick_deadline,
        status: row.status,
        votes: votes
          .filter((vote) => vote.round_number === row.number)
          .map(
            (vote): Vote => ({
              memberId: vote.member_id,
              score: vote.score,
              review: vote.review,
            })
          ),
      })),
    };
  },

  async listMovies(): Promise<Movie[]> {
    return moviesSeed as unknown as Movie[];
  },

  async pickMovie({ roundNumber, movieId, sessionAt }) {
    const { error } = await getSupabase()
      .from('rounds')
      .update({ movie_id: movieId, session_at: sessionAt, status: 'awaiting_session' })
      .eq('club_id', CLUB_ID)
      .eq('number', roundNumber);
    fail('escolher filme', error);
  },

  async openVoting({ roundNumber }) {
    const { error } = await getSupabase()
      .from('rounds')
      .update({ status: 'voting' })
      .eq('club_id', CLUB_ID)
      .eq('number', roundNumber);
    fail('abrir votação', error);
  },

  async registerVote({ roundNumber, vote }) {
    // upsert: votar de novo troca a nota, em vez de criar uma segunda linha
    const { error } = await getSupabase().from('votes').upsert(
      {
        club_id: CLUB_ID,
        round_number: roundNumber,
        member_id: vote.memberId,
        score: vote.score,
        review: vote.review,
      },
      { onConflict: 'club_id,round_number,member_id' }
    );
    fail('registrar voto', error);
  },

  async seedOtherVotes({ roundNumber, exceptMemberId }) {
    const db = getSupabase();
    const { data, error } = await db
      .from('members')
      .select('id')
      .eq('club_id', CLUB_ID)
      .neq('id', exceptMemberId);
    fail('listar membros', error);

    const scores = [9, 7, 8, 8];
    const reviews = [
      'Não esperava gostar tanto.',
      'Bom, mas não é meu tipo de filme.',
      'A segunda metade salva.',
      'Boa escolha, sério.',
    ];

    const rows = (data ?? []).map((member, index) => ({
      club_id: CLUB_ID,
      round_number: roundNumber,
      member_id: member.id,
      score: scores[index % scores.length],
      review: reviews[index % reviews.length],
    }));

    const { error: insertError } = await db
      .from('votes')
      .upsert(rows, { onConflict: 'club_id,round_number,member_id' });
    fail('simular votos', insertError);
  },

  async closeRound({ roundNumber }) {
    const db = getSupabase();

    const { error } = await db
      .from('rounds')
      .update({ status: 'closed' })
      .eq('club_id', CLUB_ID)
      .eq('number', roundNumber);
    fail('encerrar rodada', error);

    const club = await this.loadClub();
    const nextNumber = roundNumber + 1;
    if (nextNumber > club.season.totalRounds) return;
    if (club.rounds.some((round) => round.number === nextNumber)) return;

    const previous = club.rounds.find((round) => round.number === roundNumber);
    const deadline = new Date(previous?.sessionAt ?? new Date().toISOString());
    deadline.setDate(deadline.getDate() + 7);

    const { error: insertError } = await db.from('rounds').insert({
      club_id: CLUB_ID,
      number: nextNumber,
      curator_id: curatorOf(club, nextNumber).id,
      movie_id: null,
      session_at: null,
      pick_deadline: deadline.toISOString(),
      status: 'awaiting_pick',
    });
    fail('abrir próxima rodada', insertError);
  },
};
