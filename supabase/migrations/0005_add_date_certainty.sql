-- Add date certainty tracking to events table
-- Supports: exact (default), approximate, unknown
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS date_certainty text DEFAULT 'exact'
  CHECK (date_certainty IN ('exact', 'approximate', 'unknown'));

-- Preserve the original date text from the email for user reference
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS original_date_text text;
