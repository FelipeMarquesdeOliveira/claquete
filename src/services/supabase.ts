import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

/**
 * Supabase client, built from the environment.
 *
 * Expo inlines any variable prefixed with EXPO_PUBLIC_ at build time, so the
 * two values live in a .env that stays out of Git. The anon key is meant to
 * reach the client — access is decided by the row level security policies in
 * supabase/schema.sql, never by hiding this key.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) {
    throw new Error(
      'Supabase não configurado. Copie .env.example para .env e preencha as duas chaves.'
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: false }, // o protótipo do CP5 ainda não tem login
    });
  }
  return client;
}
