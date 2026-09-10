/**
 * O que o protótipo simula no lugar dos outros quatro membros do clube.
 *
 * A demonstração roda com um usuário só. Sem isto, a regra de revelação nunca
 * poderia ser exercitada: a rodada ficaria esperando para sempre por gente que
 * não está usando o aplicativo.
 *
 * Os números não são aleatórios. São os mesmos do veredito desenhado no CP4
 * (docs/markdown/04-telas.md): com o usuário dando 8, a rodada fecha em 8.2 —
 * exatamente a média da tela conceitual. Toda execução chega ao mesmo resultado.
 *
 * Os dois repositórios importam daqui, e não de cópias próprias, para que a
 * demonstração termine igual com dados locais ou com o banco ligado.
 */
export type SimulatedVote = { score: number; review: string };

export const SIMULATED_VOTES: Record<string, SimulatedVote> = {
  marina: { score: 9, review: 'Melhor coisa que vi no clube até agora' },
  gabriel: { score: 9, review: 'Eu avisei que valia a pena' },
  bia: { score: 8, review: 'A fotografia é absurda, mas é pesado' },
  felipe: { score: 8, review: 'Já tinha visto e valeu de novo' },
  joao: { score: 7, review: 'Dormi no meio, culpa minha' },
};

/** Quantos membros confirmam presença logo depois da escolha do curador. */
export const SIMULATED_CONFIRMATIONS = 2;
