import { mockRepository } from './mockRepository';
import { supabaseRepository } from './supabaseRepository';
import { supabaseConfigured } from '@/services/supabase';
import type { ClubRepository } from './repository';

export * from './repository';
export { supabaseConfigured };

/**
 * Decides where the data comes from.
 *
 * Supabase takes over as soon as the two variables are set in .env; without
 * them the app falls back to the local JSON. That fallback is deliberate: the
 * prototype has to run in the emulator, in the browser and on a machine that
 * has never seen the credentials — a missing .env should never be the reason a
 * demonstration fails.
 */
let ativo: ClubRepository = supabaseConfigured ? supabaseRepository : mockRepository;

export function getRepository(): ClubRepository {
  return ativo;
}

/**
 * Desce para os dados locais quando o banco não responde.
 *
 * O Supabase gratuito suspende projetos parados por uma semana, e um APK na
 * mão de outra pessoa pode ser aberto muito depois da última vez que alguém
 * mexeu no banco. Um aplicativo que mostra tela vazia nessa hora parece
 * quebrado; descer para o catálogo local mantém tudo navegável, com um aviso
 * dizendo o que aconteceu.
 */
export function fallBackToLocal(): void {
  ativo = mockRepository;
}
