import type { Club } from '@/domain';

import clubSeed from '../mock/club.json';
import { rebaseSeason } from '../season';

const semente = clubSeed as unknown as Club;
const DIA = 24 * 60 * 60 * 1000;

/**
 * A temporada da demonstração precisa estar sempre à frente de quem abre o
 * aplicativo. Estes testes prendem as duas coisas que não podem quebrar nessa
 * conta: a sessão fica no futuro, e o resto da temporada anda junto.
 */
describe('rebase da temporada', () => {
  // Uma quinta-feira qualquer, bem depois das datas escritas na semente.
  const agora = new Date('2027-03-04T10:00:00-03:00');
  const ajustada = rebaseSeason(semente, agora);
  const emJogo = ajustada.rounds.find((round) => round.status !== 'closed')!;
  const originalEmJogo = semente.rounds.find((round) => round.status !== 'closed')!;

  it('coloca a sessão da rodada em jogo no futuro', () => {
    expect(new Date(emJogo.sessionAt!).getTime()).toBeGreaterThan(agora.getTime());
  });

  it('deixa tempo para o clube confirmar presença', () => {
    const distancia = new Date(emJogo.sessionAt!).getTime() - agora.getTime();
    expect(distancia).toBeGreaterThanOrEqual(2 * DIA);
  });

  it('mantém o dia da semana que a sessão tinha', () => {
    expect(new Date(emJogo.sessionAt!).getDay()).toBe(new Date(originalEmJogo.sessionAt!).getDay());
  });

  it('desloca a temporada inteira pelo mesmo intervalo', () => {
    const deslocamento =
      new Date(emJogo.sessionAt!).getTime() - new Date(originalEmJogo.sessionAt!).getTime();

    ajustada.rounds.forEach((round, i) => {
      const original = semente.rounds[i];
      if (!round.sessionAt || !original.sessionAt) return;
      const movido = new Date(round.sessionAt).getTime() - new Date(original.sessionAt).getTime();
      expect(movido).toBe(deslocamento);
    });
  });

  it('mantém o prazo do curador antes da sessão', () => {
    ajustada.rounds.forEach((round) => {
      if (!round.sessionAt) return;
      expect(new Date(round.pickDeadline).getTime()).toBeLessThan(
        new Date(round.sessionAt).getTime()
      );
    });
  });

  it('não mexe no que não é data', () => {
    expect(ajustada.rounds.map((r) => r.curatorId)).toEqual(semente.rounds.map((r) => r.curatorId));
    expect(ajustada.rounds.map((r) => r.status)).toEqual(semente.rounds.map((r) => r.status));
    expect(ajustada.members).toEqual(semente.members);
  });
});
