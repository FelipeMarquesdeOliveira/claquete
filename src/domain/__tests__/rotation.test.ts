import { curatorOf, currentRound, isMyTurn, pickDeadlineMissed } from '../rotation';
import type { Club, Round } from '../types';

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

const round = (overrides: Partial<Round> = {}): Round => ({
  number: 1,
  curatorId: 'ana',
  movieId: null,
  sessionAt: null,
  pickDeadline: '2026-09-11T23:59:00.000Z',
  status: 'awaiting_pick',
  votes: [],
  ...overrides,
});

describe('rodízio de curadoria', () => {
  it('segue a ordem da rotação nas primeiras rodadas', () => {
    expect(curatorOf(club, 1).id).toBe('ana');
    expect(curatorOf(club, 2).id).toBe('bruno');
    expect(curatorOf(club, 3).id).toBe('caio');
  });

  it('volta ao primeiro curador quando a rotação dá a volta', () => {
    expect(curatorOf(club, 4).id).toBe('ana');
    expect(curatorOf(club, 7).id).toBe('ana');
  });

  it('recusa número de rodada inválido', () => {
    expect(() => curatorOf(club, 0)).toThrow();
  });

  it('avisa quando a rotação aponta para alguém que não é do clube', () => {
    const quebrado = { ...club, rotation: ['fantasma'] };
    expect(() => curatorOf(quebrado, 1)).toThrow(/fantasma/);
  });
});

describe('rodada em jogo', () => {
  it('é a primeira que ainda não encerrou', () => {
    const comHistorico = {
      ...club,
      rounds: [
        round({ number: 1, status: 'closed' }),
        round({ number: 2, curatorId: 'bruno', status: 'voting' }),
        round({ number: 3, curatorId: 'caio' }),
      ],
    };
    expect(currentRound(comHistorico)?.number).toBe(2);
  });

  it('não existe quando todas encerraram', () => {
    const encerrado = { ...club, rounds: [round({ status: 'closed' })] };
    expect(currentRound(encerrado)).toBeNull();
  });

  it('identifica de quem é a vez', () => {
    const emJogo = { ...club, rounds: [round({ curatorId: 'bruno' })] };
    expect(isMyTurn(emJogo, 'bruno')).toBe(true);
    expect(isMyTurn(emJogo, 'ana')).toBe(false);
  });
});

describe('prazo do curador', () => {
  it('vence quando a data passa e o filme não foi escolhido', () => {
    const atrasada = round({ pickDeadline: '2026-01-01T00:00:00.000Z' });
    expect(pickDeadlineMissed(atrasada, new Date('2026-01-02T00:00:00.000Z'))).toBe(true);
  });

  it('não vence antes da data', () => {
    const noPrazo = round({ pickDeadline: '2026-12-01T00:00:00.000Z' });
    expect(pickDeadlineMissed(noPrazo, new Date('2026-11-30T00:00:00.000Z'))).toBe(false);
  });

  it('não se aplica a uma rodada que já tem filme escolhido', () => {
    const escolhida = round({
      pickDeadline: '2026-01-01T00:00:00.000Z',
      status: 'awaiting_session',
    });
    expect(pickDeadlineMissed(escolhida, new Date('2026-06-01T00:00:00.000Z'))).toBe(false);
  });
});
