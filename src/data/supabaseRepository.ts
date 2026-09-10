import { curatorOf, type Club, type Movie, type Round, type Vote } from '@/domain';
import { getSupabase } from '@/services/supabase';

import clubSeed from './mock/club.json';
import moviesSeed from './mock/movies.json';
import type { ClubRepository } from './repository';
import { SIMULATED_CONFIRMATIONS, SIMULATED_VOTES } from './simulation';

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

type PresenceRow = {
  round_number: number;
  member_id: string;
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

    const [clubResult, membersResult, roundsResult, votesResult, presencesResult] =
      await Promise.all([
        db.from('clubs').select('*').eq('id', CLUB_ID).single(),
        db.from('members').select('*').eq('club_id', CLUB_ID).order('join_order'),
        db.from('rounds').select('*').eq('club_id', CLUB_ID).order('number'),
        db.from('votes').select('*').eq('club_id', CLUB_ID).order('created_at'),
        db.from('presences').select('*').eq('club_id', CLUB_ID),
      ]);

    fail('carregar clube', clubResult.error);
    fail('carregar membros', membersResult.error);
    fail('carregar rodadas', roundsResult.error);
    fail('carregar votos', votesResult.error);
    fail('carregar presenças', presencesResult.error);

    const club = clubResult.data as ClubRow;
    const votes = (votesResult.data ?? []) as VoteRow[];
    const presences = (presencesResult.data ?? []) as PresenceRow[];

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
        confirmations: presences
          .filter((presence) => presence.round_number === row.number)
          .map((presence) => presence.member_id),
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
    const db = getSupabase();
    const { error } = await db
      .from('rounds')
      .update({ movie_id: movieId, session_at: sessionAt, status: 'awaiting_session' })
      .eq('club_id', CLUB_ID)
      .eq('number', roundNumber);
    fail('escolher filme', error);

    // Prototype only: parte do clube confirma logo após a escolha.
    const { data } = await db.from('rounds').select('curator_id').eq('club_id', CLUB_ID).eq('number', roundNumber).single();
    const { data: members } = await db
      .from('members')
      .select('id')
      .eq('club_id', CLUB_ID)
      .neq('id', data?.curator_id ?? '')
      .limit(SIMULATED_CONFIRMATIONS);

    const rows = (members ?? []).map((member) => ({
      club_id: CLUB_ID,
      round_number: roundNumber,
      member_id: member.id,
    }));
    if (rows.length > 0) {
      const { error: presenceError } = await db
        .from('presences')
        .upsert(rows, { onConflict: 'club_id,round_number,member_id' });
      fail('simular presenças', presenceError);
    }
  },

  async confirmPresence({ roundNumber, memberId }) {
    const { error } = await getSupabase().from('presences').upsert(
      { club_id: CLUB_ID, round_number: roundNumber, member_id: memberId },
      { onConflict: 'club_id,round_number,member_id' }
    );
    fail('confirmar presença', error);
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

    const { data: jaVotaram } = await db
      .from('votes')
      .select('member_id')
      .eq('club_id', CLUB_ID)
      .eq('round_number', roundNumber);
    const votantes = new Set((jaVotaram ?? []).map((linha) => linha.member_id));

    // As notas vêm de simulation.ts, as mesmas do repositório local, para que a
    // rodada feche em 8.2 com o banco ligado — igual à tela desenhada no CP4.
    const rows = (data ?? [])
      .filter((member) => SIMULATED_VOTES[member.id] && !votantes.has(member.id))
      .map((member) => ({
        club_id: CLUB_ID,
        round_number: roundNumber,
        member_id: member.id,
        ...SIMULATED_VOTES[member.id],
      }));
    if (rows.length === 0) return;

    const { error: insertError } = await db
      .from('votes')
      .upsert(rows, { onConflict: 'club_id,round_number,member_id' });
    fail('simular votos', insertError);
  },

  async resetDemo() {
    const db = getSupabase();
    const semente = clubSeed as unknown as Club;

    // A ordem importa: presenças e votos apontam para as rodadas.
    for (const tabela of ['votes', 'presences', 'rounds'] as const) {
      const { error } = await db.from(tabela).delete().eq('club_id', CLUB_ID);
      fail(`limpar ${tabela}`, error);
    }

    const { error: roundsError } = await db.from('rounds').insert(
      semente.rounds.map((round) => ({
        club_id: CLUB_ID,
        number: round.number,
        curator_id: round.curatorId,
        movie_id: round.movieId,
        session_at: round.sessionAt,
        pick_deadline: round.pickDeadline,
        status: round.status,
      }))
    );
    fail('recriar rodadas', roundsError);

    const presencas = semente.rounds.flatMap((round) =>
      round.confirmations.map((memberId) => ({
        club_id: CLUB_ID,
        round_number: round.number,
        member_id: memberId,
      }))
    );
    if (presencas.length > 0) {
      const { error } = await db.from('presences').insert(presencas);
      fail('recriar presenças', error);
    }

    const votos = semente.rounds.flatMap((round) =>
      round.votes.map((vote) => ({
        club_id: CLUB_ID,
        round_number: round.number,
        member_id: vote.memberId,
        score: vote.score,
        review: vote.review,
      }))
    );
    if (votos.length > 0) {
      const { error } = await db.from('votes').insert(votos);
      fail('recriar votos', error);
    }
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
