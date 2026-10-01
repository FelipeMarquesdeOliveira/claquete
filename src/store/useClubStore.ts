import { create } from 'zustand';

import { fallBackToLocal, getRepository, type DataSource } from '@/data';
import type { Club, Movie } from '@/domain';

/**
 * Application state.
 *
 * Every mutation goes through the repository and then reloads the club, so the
 * screens always render what storage actually holds — no optimistic state to
 * drift out of sync with the database once Supabase is plugged in.
 */
type ClubState = {
  club: Club | null;
  movies: Movie[];
  currentUserId: string;
  source: DataSource;
  loading: boolean;
  error: string | null;

  load: () => Promise<void>;
  pickMovie: (movieId: string, sessionAt: string) => Promise<void>;
  confirmPresence: () => Promise<void>;
  openVoting: () => Promise<void>;
  castVote: (score: number, review: string) => Promise<void>;
  closeRound: () => Promise<void>;
  setCurrentUser: (memberId: string) => void;
  restartDemo: () => Promise<void>;
};

/** Whoever is using the app in this demo. */
const CURRENT_USER = 'felipe';

/**
 * Roda uma escrita e garante que a tela fique sabendo se ela falhou.
 *
 * Sem isto a promessa é rejeitada dentro do onPress de um botão, ninguém a
 * escuta, e a interface recarrega como se tivesse dado certo.
 */
async function escrever(
  set: (parcial: Partial<ClubState>) => void,
  recarregar: () => Promise<void>,
  acao: () => Promise<void>
): Promise<void> {
  set({ error: null });
  let falha: string | null = null;
  try {
    await acao();
  } catch (error) {
    falha = error instanceof Error ? error.message : 'Não consegui salvar';
  }

  // a recarga limpa o erro ao começar, então o aviso é reposto depois dela
  await recarregar();
  if (falha) set({ error: falha });
}

function currentRoundNumber(club: Club | null): number {
  const round = club?.rounds.find((r) => r.status !== 'closed');
  if (!round) throw new Error('Nenhuma rodada em jogo');
  return round.number;
}

export const useClubStore = create<ClubState>((set, get) => ({
  club: null,
  movies: [],
  currentUserId: CURRENT_USER,
  source: getRepository().source,
  loading: true,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const [club, movies] = await Promise.all([
        getRepository().loadClub(),
        getRepository().listMovies(),
      ]);
      set({ club, movies, loading: false, source: getRepository().source });
      return;
    } catch (error) {
      // Banco fora do ar: segue com os dados locais em vez de mostrar tela vazia.
      if (getRepository().source === 'supabase') {
        fallBackToLocal();
        const [club, movies] = await Promise.all([
          getRepository().loadClub(),
          getRepository().listMovies(),
        ]);
        set({
          club,
          movies,
          loading: false,
          source: getRepository().source,
          error: 'Banco indisponível. Mostrando os dados locais do protótipo.',
        });
        return;
      }
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Falha ao carregar o clube',
      });
    }
  },

  async pickMovie(movieId, sessionAt) {
    await escrever(set, get().load, () =>
      getRepository().pickMovie({ roundNumber: currentRoundNumber(get().club), movieId, sessionAt })
    );
  },

  async confirmPresence() {
    await escrever(set, get().load, () =>
      getRepository().confirmPresence({
        roundNumber: currentRoundNumber(get().club),
        memberId: get().currentUserId,
      })
    );
  },

  async openVoting() {
    const roundNumber = currentRoundNumber(get().club);
    await escrever(set, get().load, async () => {
      await getRepository().openVoting({ roundNumber });
      // os outros membros votam aqui, para a regra de revelação poder ser exercida
      await getRepository().seedOtherVotes({ roundNumber, exceptMemberId: get().currentUserId });
    });
  },

  async castVote(score, review) {
    await escrever(set, get().load, () =>
      getRepository().registerVote({
        roundNumber: currentRoundNumber(get().club),
        vote: { memberId: get().currentUserId, score, review },
      })
    );
  },

  async closeRound() {
    await escrever(set, get().load, () =>
      getRepository().closeRound({ roundNumber: currentRoundNumber(get().club) })
    );
  },

  /**
   * Prototype only: troca de quem é a vez de usar o aplicativo.
   *
   * O Claquete é um produto de grupo demonstrado em um aparelho só. Sem isto,
   * telas que só existem para o curador ficariam inalcançáveis na apresentação.
   */
  setCurrentUser(memberId) {
    set({ currentUserId: memberId });
  },

  async restartDemo() {
    await escrever(set, get().load, () => getRepository().resetDemo());
  },
}));
