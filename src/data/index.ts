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
export function getRepository(): ClubRepository {
  return supabaseConfigured ? supabaseRepository : mockRepository;
}
