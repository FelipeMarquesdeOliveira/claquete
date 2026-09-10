import { curatorOf, roundAverage } from '@/domain';
import type { Club, Movie } from '@/domain';

import clubSeed from '../mock/club.json';
import moviesSeed from '../mock/movies.json';

const club = clubSeed as unknown as Club;
const movies = moviesSeed as unknown as Movie[];

/**
 * Os dados mockados são o roteiro da demonstração. Se alguém editar o JSON e
 * quebrar a coerência — um voto de quem não é do clube, um curador fora do
 * rodízio — estes testes reprovam antes da apresentação.
 */
describe('dados mockados do clube', () => {
  const ids = new Set(club.members.map((m) => m.id));
  const filmes = new Set(movies.map((f) => f.id));

  it('tem uma rotação com todos os membros, sem repetir', () => {
    expect(new Set(club.rotation).size).toBe(club.rotation.length);
    expect(club.rotation.every((id) => ids.has(id))).toBe(true);
    expect(club.rotation.length).toBe(club.members.length);
  });

  it('respeita o rodízio em todas as rodadas', () => {
    for (const round of club.rounds) {
      expect(round.curatorId).toBe(curatorOf(club, round.number).id);
    }
  });

  it('numera as rodadas em sequência a partir de 1', () => {
    club.rounds.forEach((round, i) => expect(round.number).toBe(i + 1));
  });

  it('só tem voto de quem é do clube, e um por pessoa', () => {
    for (const round of club.rounds) {
      const votantes = round.votes.map((v) => v.memberId);
      expect(votantes.every((id) => ids.has(id))).toBe(true);
      expect(new Set(votantes).size).toBe(votantes.length);
    }
  });

  it('só aponta para filmes que existem no catálogo', () => {
    for (const round of club.rounds) {
      if (round.movieId) expect(filmes.has(round.movieId)).toBe(true);
    }
  });

  it('mantém as notas entre 0 e 10', () => {
    for (const round of club.rounds) {
      for (const voto of round.votes) {
        expect(voto.score).toBeGreaterThanOrEqual(0);
        expect(voto.score).toBeLessThanOrEqual(10);
      }
    }
  });

  it('em rodada encerrada, todo mundo votou e há filme e data', () => {
    for (const round of club.rounds.filter((r) => r.status === 'closed')) {
      expect(round.votes.length).toBe(club.members.length);
      expect(round.movieId).not.toBeNull();
      expect(round.sessionAt).not.toBeNull();
      expect(roundAverage(round)).not.toBeNull();
    }
  });

  it('deixa exatamente uma rodada em jogo, para a demonstração começar em um ponto conhecido', () => {
    const emJogo = club.rounds.filter((r) => r.status !== 'closed');
    expect(emJogo).toHaveLength(1);

    // a demonstração começa na tela 2 do CP4: filme já escolhido, parte do
    // clube confirmada e o usuário ainda por confirmar
    const rodada = emJogo[0];
    expect(rodada.status).toBe('awaiting_session');
    expect(rodada.movieId).toBe('cidade-de-deus');
    expect(rodada.confirmations).toHaveLength(3);
    expect(rodada.votes).toHaveLength(0);
  });

  it('não passa do total de rodadas da temporada', () => {
    expect(club.rounds.length).toBeLessThanOrEqual(club.season.totalRounds);
  });
});

describe('catálogo mockado', () => {
  it('não repete identificador', () => {
    expect(new Set(movies.map((f) => f.id)).size).toBe(movies.length);
  });

  it('tem os campos que a interface usa', () => {
    for (const filme of movies) {
      expect(filme.title.length).toBeGreaterThan(0);
      expect(filme.year).toBeGreaterThan(1900);
      expect(filme.genres.length).toBeGreaterThan(0);
      expect(filme.runtimeMinutes).toBeGreaterThan(0);
      expect(filme.streaming.length).toBeGreaterThan(0);
      expect(filme.synopsis.length).toBeGreaterThan(20);
    }
  });
});
