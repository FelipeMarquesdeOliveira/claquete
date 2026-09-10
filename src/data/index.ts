import { mockRepository } from './mockRepository';
import type { ClubRepository } from './repository';

export * from './repository';
export { resetMockData } from './mockRepository';

/**
 * Picks where the data comes from.
 *
 * Supabase takes over as soon as the credentials are configured; without them
 * the app falls back to the local JSON, so the prototype always runs — in the
 * emulator, in the browser and on a machine that has never seen the .env.
 */
export function getRepository(): ClubRepository {
  return mockRepository;
}
