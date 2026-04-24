/**
 * Auto-generated Supabase database types.
 *
 * Regenerate with: pnpm db:types
 * (runs: supabase gen types typescript --local > src/lib/supabase/types.ts)
 *
 * TODO: Run `pnpm db:types` after connecting Supabase and running migrations.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // TODO: Auto-generated after running `pnpm db:types`
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
