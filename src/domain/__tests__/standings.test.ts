import { roundsRemaining, seasonStandings } from '../standings';
import type { Club, Round } from '../types';

const membros = [
  { id: 'ana', name: 'Ana', initials: 'A', color: '#fff' },
  { id: 'bruno', name: 'Bruno', initials: 'B', color: '#fff' },
  { id: 'caio', name: 'Caio', initials: 'C', color: '#fff' },
];

const rodada = (
  number: number,
  curatorId: string,
  notas: number[],
  status: Round['status'] = 'closed'
): Round => ({
  number,
  curatorId,
  movieId: `filme-${number}`,
  sessionAt: '2026-09-05T20:00:00.000Z',
  pickDeadline: '2026-09-03T23:59:00.000Z',
  status,
  confirmations: [],
  votes: notas.map((score, i) => ({
    memberId: membros[i % membros.length].id,
    score,
    review: '',
  })),
});

const clube = (rounds: Round[]): Club => ({
  id: 'c1',
  name: 'Clube de Teste',
  inviteCode: 'TESTE-1',
  members: membros,
  rotation: ['ana', 'bruno', 'caio'],
  season: { number: 1, totalRounds: 6 },
  rounds,
});

describe('placar da temporada', () => {
  it('ordena os curadores pela média que receberam', () => {
    const placar = seasonStandings(
      clube([rodada(1, 'ana', [7, 7, 7]), rodada(2, 'bruno', [9, 9, 9])])
    );
    expect(placar[0].member.id).toBe('bruno');
    expect(placar[0].average).toBe(9);
    expect(placar[1].member.id).toBe('ana');
    expect(placar[1].average).toBe(7);
  });

  it('dá o ponto a quem escolheu, não a quem votou', () => {
    // a Ana curou e tirou a nota mais baixa; o Bruno votou alto e não pontua por isso
    const placar = seasonStandings(clube([rodada(1, 'ana', [5, 10, 9])]));
    const ana = placar.find((linha) => linha.member.id === 'ana');
    expect(ana?.average).toBe(8);
    expect(ana?.roundsCurated).toBe(1);
    expect(placar.find((l) => l.member.id === 'bruno')?.roundsCurated).toBe(0);
  });

  it('deixa por último, sem nota, quem ainda não foi curador', () => {
    const placar = seasonStandings(clube([rodada(1, 'ana', [8, 8, 8])]));
    const ultimo = placar[placar.length - 1];
    expect(ultimo.average).toBeNull();
    expect(ultimo.roundsCurated).toBe(0);
  });

  it('ignora rodada que ainda não encerrou', () => {
    const placar = seasonStandings(
      clube([rodada(1, 'ana', [8, 8, 8]), rodada(2, 'bruno', [10, 10, 10], 'voting')])
    );
    expect(placar.find((l) => l.member.id === 'bruno')?.average).toBeNull();
  });

  it('faz a média entre as rodadas de quem curou mais de uma vez', () => {
    const placar = seasonStandings(
      clube([rodada(1, 'ana', [6, 6, 6]), rodada(4, 'ana', [8, 8, 8])])
    );
    expect(placar.find((l) => l.member.id === 'ana')?.average).toBe(7);
    expect(placar.find((l) => l.member.id === 'ana')?.roundsCurated).toBe(2);
  });

  it('empate divide a mesma posição', () => {
    const placar = seasonStandings(
      clube([rodada(1, 'ana', [8, 8, 8]), rodada(2, 'bruno', [8, 8, 8])])
    );
    expect(placar[0].position).toBe(1);
    expect(placar[1].position).toBe(1);
  });
});

describe('rodadas restantes', () => {
  it('desconta as rodadas encerradas do total da temporada', () => {
    expect(roundsRemaining(clube([rodada(1, 'ana', [8]), rodada(2, 'bruno', [8])]))).toBe(4);
  });

  it('não fica negativo se a temporada estourar o total', () => {
    const muitas = Array.from({ length: 8 }, (_, i) => rodada(i + 1, 'ana', [8]));
    expect(roundsRemaining(clube(muitas))).toBe(0);
  });
});
