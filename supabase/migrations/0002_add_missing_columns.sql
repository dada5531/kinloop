-- Add missing columns to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS reply_draft text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS confidence numeric;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS raw_content text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS source_label text;

-- Convert amount_due from numeric to jsonb for richer payment data
ALTER TABLE public.events ALTER COLUMN amount_due TYPE jsonb USING CASE WHEN amount_due IS NOT NULL THEN jsonb_build_object('amount', amount_due) ELSE NULL END;
ALTER TABLE public.events ALTER COLUMN amount_due SET DEFAULT NULL;

-- Add missing columns to health_records table
ALTER TABLE public.health_records ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.health_records ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.health_records ADD COLUMN IF NOT EXISTS provider text;

-- Add missing columns to activities table
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS safety_notes text[] DEFAULT '{}';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS messiness integer;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS indoor_outdoor text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS platform text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'medium';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS category text DEFAULT 'other';

-- Disable RLS for development (re-enable when Clerk is configured)
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.children DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips_saved DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings DISABLE ROW LEVEL SECURITY;
