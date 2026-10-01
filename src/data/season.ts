import type { Club } from '@/domain';

/**
 * Traz a temporada da semente para a semana de quem está abrindo o aplicativo.
 *
 * As datas em `mock/club.json` são fixas, e isso é bom para os testes: a
 * coerência dos dados pode ser verificada sem depender do dia de hoje. Mas um
 * APK instalado semanas depois mostrava "ATRASADO" na rodada em jogo — a sessão
 * tinha ficado no passado, e o produto parecia abandonado.
 *
 * A correção não reescreve a semente: ela desloca todas as datas pelo mesmo
 * intervalo, de modo que a sessão da rodada em jogo caia na próxima ocorrência
 * do dia da semana que ela já tinha. O espaçamento semanal entre as rodadas, a
 * ordem e os prazos continuam exatamente como foram escritos.
 */
const DIA = 24 * 60 * 60 * 1000;

/** A próxima vez que esse dia da semana acontece, daqui a pelo menos 2 dias. */
function proximaOcorrencia(modelo: Date, agora: Date): Date {
  const alvo = new Date(agora);
  alvo.setHours(modelo.getHours(), modelo.getMinutes(), 0, 0);

  const distancia = (modelo.getDay() - alvo.getDay() + 7) % 7;
  alvo.setDate(alvo.getDate() + distancia);

  // Sessão hoje ou amanhã não dá tempo de confirmar presença: pula uma semana.
  if (alvo.getTime() - agora.getTime() < 2 * DIA) alvo.setDate(alvo.getDate() + 7);
  return alvo;
}

export function rebaseSeason(club: Club, agora = new Date()): Club {
  const emJogo = club.rounds.find((round) => round.status !== 'closed');
  const referencia = emJogo?.sessionAt ?? emJogo?.pickDeadline;
  if (!referencia) return club;

  const original = new Date(referencia);
  const deslocamento = proximaOcorrencia(original, agora).getTime() - original.getTime();
  if (deslocamento === 0) return club;

  const mover = (iso: string | null): string | null =>
    iso === null ? null : new Date(new Date(iso).getTime() + deslocamento).toISOString();

  return {
    ...club,
    rounds: club.rounds.map((round) => ({
      ...round,
      sessionAt: mover(round.sessionAt),
      pickDeadline: mover(round.pickDeadline)!,
    })),
  };
}
