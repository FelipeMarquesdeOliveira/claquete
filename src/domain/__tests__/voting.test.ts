import type { Club, Round, Vote } from '../types';
import {
  everyoneVoted,
  hasVoted,
  roundAverage,
  scoresRevealed,
  votesMissing,
} from '../voting';

const club: Club = {
  id: 'c1',
  name: 'Clube de Teste',
  inviteCode: 'TESTE-1',
  members: [
    { id: 'ana', name: 'Ana', initials: 'A', color: '#fff' },
    { id: 'bruno', name: 'Bruno', initials: 'B', color: '#fff' },
    { id: 'caio', name: 'Caio', initials: 'C', color: '#fff' },
  ],
  rotation: ['ana', 'bruno', 'caio'],
  season: { number: 1, totalRounds: 6 },
  rounds: [],
};

const voto = (memberId: string, score: number): Vote => ({
  memberId,
  score,
  review: '',
});

const round = (votes: Vote[]): Round => ({
  number: 1,
  curatorId: 'ana',
  movieId: 'filme-1',
  sessionAt: '2026-09-05T20:00:00.000Z',
  pickDeadline: '2026-09-03T23:59:00.000Z',
  status: 'voting',
  votes,
});

describe('revelação das notas', () => {
  it('mantém as notas fechadas enquanto falta alguém', () => {
    const parcial = round([voto('ana', 9), voto('bruno', 7)]);
    expect(scoresRevealed(club, parcial)).toBe(false);
    expect(votesMissing(club, parcial)).toBe(1);
  });

  it('revela assim que o último voto entra', () => {
    const completa = round([voto('ana', 9), voto('bruno', 7), voto('caio', 8)]);
    expect(everyoneVoted(club, completa)).toBe(true);
    expect(scoresRevealed(club, completa)).toBe(true);
    expect(votesMissing(club, completa)).toBe(0);
  });

  it('não revela nada quando ninguém votou', () => {
    expect(scoresRevealed(club, round([]))).toBe(false);
  });

  it('sabe quem já votou', () => {
    const parcial = round([voto('ana', 9)]);
    expect(hasVoted(parcial, 'ana')).toBe(true);
    expect(hasVoted(parcial, 'bruno')).toBe(false);
  });
});

describe('média da rodada', () => {
  it('calcula a média das notas', () => {
    expect(roundAverage(round([voto('ana', 9), voto('bruno', 7)]))).toBe(8);
  });

  it('arredonda para uma casa decimal', () => {
    const tres = round([voto('ana', 9), voto('bruno', 8), voto('caio', 8)]);
    expect(roundAverage(tres)).toBe(8.3);
  });

  it('devolve nulo sem votos, para distinguir de nota zero', () => {
    expect(roundAverage(round([]))).toBeNull();
    expect(roundAverage(round([voto('ana', 0)]))).toBe(0);
  });
});
