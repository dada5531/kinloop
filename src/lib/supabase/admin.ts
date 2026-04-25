import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Admin Supabase client — bypasses RLS.
 * Use ONLY in API routes where we don't have a user session cookie
 * (e.g., during development without Clerk, or for admin operations).
 *
 * In production, prefer createServerSupabaseClient() from server.ts
 * which respects RLS policies.
 */
let _adminClient: SupabaseClient<Database> | null = null;

export function getAdminClient(): SupabaseClient<Database> {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
    }

    // Use service role key if available, otherwise fall back to anon key
    // (anon key works for tables without RLS or with permissive policies)
    const key = serviceKey || anonKey;
    if (!key) {
      throw new Error(
        "No Supabase key available (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
      );
    }

    _adminClient = createClient<Database>(url, key);
  }
  return _adminClient;
}
