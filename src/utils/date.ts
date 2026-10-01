/**
 * Date helpers written by hand instead of leaning on Intl.
 *
 * Intl is available in modern Hermes, but the abbreviations it produces vary
 * between engine versions and the app shows these strings on every screen —
 * they need to read the same in the emulator, in the browser and on a device.
 */

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WEEKDAYS_LONG = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado',
];
const MONTHS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** "sáb, 22 mar · 20h" */
export function formatSession(iso: string): string {
  const date = new Date(iso);
  const weekday = WEEKDAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const time = minutes === 0 ? `${hour}h` : `${hour}h${String(minutes).padStart(2, '0')}`;
  return `${weekday}, ${date.getDate()} ${month} · ${time}`;
}

/** "22 de março" — used where the date needs to be read out loud. */
export function formatLongDate(iso: string): string {
  const full = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ];
  const date = new Date(iso);
  return `${date.getDate()} de ${full[date.getMonth()]}`;
}

/** "Sábado, 22 de março" — o dia da sessão, escrito por extenso. */
export function formatFullDate(iso: string): string {
  const date = new Date(iso);
  return `${WEEKDAYS_LONG[date.getDay()]}, ${formatLongDate(iso)}`;
}

/**
 * "sexta às 23h" — o prazo do curador, do jeito que se combina no grupo.
 *
 * O dia vem em minúscula porque a frase da tela é "Escolha até sexta às 23h":
 * o prazo aparece no meio da frase, não no começo dela.
 */
export function deadlineLabel(iso: string): string {
  const date = new Date(iso);
  const day = WEEKDAYS_LONG[date.getDay()].toLowerCase();
  const minutes = date.getMinutes();
  const time = minutes === 0 ? `${date.getHours()}h` : `${date.getHours()}h${String(minutes).padStart(2, '0')}`;
  return `${day} às ${time}`;
}

/** Whole days between now and a date; negative once it is in the past. */
export function daysUntil(iso: string, now = new Date()): number {
  const target = new Date(iso);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const end = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  ).getTime();
  return Math.round((end - start) / millisecondsPerDay);
}

/** "faltam 2 dias", "é hoje", "amanhã", "atrasado" */
export function countdownLabel(iso: string, now = new Date()): string {
  const days = daysUntil(iso, now);
  if (days < 0) return 'atrasado';
  if (days === 0) return 'é hoje';
  if (days === 1) return 'amanhã';
  return `faltam ${days} dias`;
}

/**
 * As datas que o curador pode marcar para a sessão: sexta, sábado e domingo do
 * próximo fim de semana, sempre às 20h.
 *
 * Fim de semana porque é quando um clube de cinema consegue se reunir, e nunca
 * antes de dois dias porque o resto do grupo precisa de tempo para confirmar
 * presença.
 */
const HORA_DA_SESSAO = 20;
const DIAS_MINIMOS = 2;

export function sessionOptions(now = new Date()): string[] {
  const minimo = new Date(now.getTime() + DIAS_MINIMOS * 24 * 60 * 60 * 1000);

  return [5, 6, 0]
    .map((diaDaSemana) => {
      const data = new Date(now);
      data.setHours(HORA_DA_SESSAO, 0, 0, 0);
      data.setDate(data.getDate() + ((diaDaSemana - data.getDay() + 7) % 7));
      if (data < minimo) data.setDate(data.getDate() + 7);
      return data.toISOString();
    })
    // Em ordem: um dia empurrado para a semana seguinte por ser cedo demais
    // não pode aparecer antes de datas que vêm primeiro.
    .sort();
}

/** O sábado mais próximo que ainda dá tempo: o que o aplicativo sugere sozinho. */
export function nextSessionSlot(now = new Date()): string {
  const opcoes = sessionOptions(now);
  const sabado = opcoes.find((iso) => new Date(iso).getDay() === 6);
  return sabado ?? opcoes[0];
}
