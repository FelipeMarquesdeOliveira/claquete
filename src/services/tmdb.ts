import type { Movie } from '@/domain';

/**
 * Catálogo de filmes, vindo da API pública do TMDB.
 *
 * No CP5 o catálogo eram nove filmes num JSON. Aqui ele passa a ser o acervo
 * inteiro do TMDB, em português e com os provedores de streaming do Brasil —
 * que é o que o produto precisa de verdade: o curador escolhe qualquer filme,
 * não um de uma lista fechada.
 *
 * A busca é barata de propósito. A lista de resultados sai de uma chamada só, e
 * os dados caros (duração e onde assistir) são buscados apenas para o filme que
 * o curador escolhe — não para os vinte que ele apenas leu.
 */
const BASE = 'https://api.themoviedb.org/3';
const IMAGENS = 'https://image.tmdb.org/t/p/w342';

const chave = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export const tmdbConfigured = Boolean(chave);

/** Prefixo que distingue um filme do TMDB dos nove que vieram do CP4. */
export const TMDB_PREFIX = 'tmdb:';

export const isTmdbId = (id: string): boolean => id.startsWith(TMDB_PREFIX);

type ResultadoBusca = {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string | null;
  genre_ids?: number[];
};

async function buscar<T>(caminho: string, params: Record<string, string> = {}): Promise<T> {
  if (!chave) throw new Error('TMDB não configurado: falta EXPO_PUBLIC_TMDB_API_KEY no .env');

  const url = new URL(`${BASE}${caminho}`);
  url.searchParams.set('api_key', chave);
  url.searchParams.set('language', 'pt-BR');
  for (const [nome, valor] of Object.entries(params)) url.searchParams.set(nome, valor);

  const resposta = await fetch(url.toString());
  if (!resposta.ok) {
    throw new Error(`TMDB respondeu ${resposta.status} em ${caminho}`);
  }
  return (await resposta.json()) as T;
}

/**
 * Nomes dos gêneros, buscados uma vez por execução.
 *
 * A busca devolve só os números dos gêneros; sem esta tabela a lista de
 * resultados apareceria sem a linha "Drama, Crime" que a tela do CP4 mostra.
 */
let generosPorId: Map<number, string> | null = null;

async function generos(): Promise<Map<number, string>> {
  if (generosPorId) return generosPorId;
  try {
    const dados = await buscar<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
    generosPorId = new Map(dados.genres.map((g) => [g.id, g.name]));
  } catch {
    generosPorId = new Map(); // sem os nomes a busca ainda funciona, só sem a linha
  }
  return generosPorId;
}

/** Onde dá para assistir no Brasil, por assinatura. */
async function ondeAssistir(tmdbId: number): Promise<string> {
  try {
    const dados = await buscar<{
      results?: Record<string, { flatrate?: { provider_name: string }[] }>;
    }>(`/movie/${tmdbId}/watch/providers`);
    return dados.results?.BR?.flatrate?.[0]?.provider_name ?? '';
  } catch {
    return '';
  }
}

/** Procura filmes pelo nome. Devolve o essencial para a lista de escolha. */
export async function searchMovies(termo: string): Promise<Movie[]> {
  const busca = termo.trim();
  if (busca.length < 2) return [];

  const [dados, nomes] = await Promise.all([
    buscar<{ results: ResultadoBusca[] }>('/search/movie', {
      query: busca,
      include_adult: 'false',
      region: 'BR',
    }),
    generos(),
  ]);

  return dados.results
    .filter((item) => item.release_date) // sem data é quase sempre projeto não lançado
    .slice(0, 12)
    .map((item) => ({
      id: `${TMDB_PREFIX}${item.id}`,
      title: item.title,
      year: Number(item.release_date!.slice(0, 4)),
      genres: (item.genre_ids ?? []).map((id) => nomes.get(id)).filter(Boolean) as string[],
      runtimeMinutes: 0, // só vale a chamada para o filme escolhido
      streaming: '',
      synopsis: item.overview ?? '',
      posterUrl: item.poster_path ? `${IMAGENS}${item.poster_path}` : undefined,
    }));
}

/**
 * Completa o filme escolhido com o que a busca não traz.
 *
 * Chamado no momento da escolha, porque é aí que o filme vira parte da rodada e
 * precisa estar inteiro — a tela do clube mostra a duração e a plataforma.
 */
export async function completeMovie(movie: Movie): Promise<Movie> {
  if (!isTmdbId(movie.id)) return movie;
  const tmdbId = Number(movie.id.slice(TMDB_PREFIX.length));

  type Detalhes = { runtime?: number; genres?: { name: string }[] };
  const [detalhes, streaming] = await Promise.all([
    buscar<Detalhes>(`/movie/${tmdbId}`).catch((): Detalhes => ({})),
    ondeAssistir(tmdbId),
  ]);

  return {
    ...movie,
    runtimeMinutes: detalhes.runtime ?? movie.runtimeMinutes,
    genres: detalhes.genres?.map((g) => g.name) ?? movie.genres,
    streaming,
  };
}
