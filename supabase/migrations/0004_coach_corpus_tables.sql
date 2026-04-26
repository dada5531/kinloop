-- Section 4: Coach corpus tables + daily recommendations
-- Applied via Supabase MCP (tables already created in live DB)

CREATE TABLE IF NOT EXISTS tips_corpus (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  source text NOT NULL,
  source_url text,
  category text,
  age_bucket text,
  embedding vector(1024),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities_corpus (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  source text NOT NULL,
  source_url text,
  category text,
  age_min integer,
  age_max integer,
  duration_minutes integer,
  materials text[],
  steps text[],
  embedding vector(1024),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_recommendations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  type text NOT NULL CHECK (type IN ('tip', 'activity')),
  content_id uuid,
  content_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);

-- RPC for vector similarity search
CREATE OR REPLACE FUNCTION match_corpus(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL,
  filter_age_bucket text DEFAULT NULL,
  corpus_table text DEFAULT 'tips'
)
RETURNS TABLE(id uuid, content text, source text, source_url text, category text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  IF corpus_table = 'activities' THEN
    RETURN QUERY
    SELECT ac.id, concat(ac.title, ': ', COALESCE(ac.description, '')) as content,
           ac.source, ac.source_url, ac.category,
           1 - (ac.embedding <=> query_embedding) as similarity
    FROM activities_corpus ac
    WHERE ac.embedding IS NOT NULL
      AND 1 - (ac.embedding <=> query_embedding) > match_threshold
      AND (filter_category IS NULL OR ac.category = filter_category)
    ORDER BY ac.embedding <=> query_embedding
    LIMIT match_count;
  ELSE
    RETURN QUERY
    SELECT tc.id, tc.content, tc.source, tc.source_url, tc.category,
           1 - (tc.embedding <=> query_embedding) as similarity
    FROM tips_corpus tc
    WHERE tc.embedding IS NOT NULL
      AND 1 - (tc.embedding <=> query_embedding) > match_threshold
      AND (filter_category IS NULL OR tc.category = filter_category)
      AND (filter_age_bucket IS NULL OR tc.age_bucket = filter_age_bucket OR tc.age_bucket IS NULL)
    ORDER BY tc.embedding <=> query_embedding
    LIMIT match_count;
  END IF;
END;
$$;
