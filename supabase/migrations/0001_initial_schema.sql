-- KINLOOP Initial Schema
-- Supabase (Postgres) with pgvector for RAG embeddings

-- Enable required extensions
create extension if not exists "pgvector" with schema public;
create extension if not exists "uuid-ossp" with schema public;

-- ============================================
-- Users (mirror of Clerk)
-- ============================================
create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text not null unique,
  email text,
  name text,
  avatar_url text,
  google_access_token text,
  google_refresh_token text,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (clerk_id = auth.jwt() ->> 'sub');

create policy "Users can update own data"
  on public.users for update
  using (clerk_id = auth.jwt() ->> 'sub');

-- ============================================
-- Children
-- ============================================
create table public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  dob date not null,
  photo_url text,
  allergies text[] default '{}',
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

create index idx_children_user_id on public.children(user_id);

alter table public.children enable row level security;

create policy "Users can CRUD own children"
  on public.children for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Events (Quadrant 1: Scheduler)
-- ============================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  title text not null,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  source text,
  action_items jsonb default '[]',
  amount_due numeric,
  google_event_id text,
  status text default 'pending' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

create index idx_events_user_id on public.events(user_id);
create index idx_events_child_id on public.events(child_id);
create index idx_events_start_time on public.events(start_time);

alter table public.events enable row level security;

create policy "Users can CRUD own events"
  on public.events for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Health Records (Quadrant 2: Development Hub)
-- ============================================
create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  visit_date date,
  type text,
  file_url text,
  extracted jsonb,
  summary text,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

create index idx_health_records_user_id on public.health_records(user_id);
create index idx_health_records_child_id on public.health_records(child_id);

alter table public.health_records enable row level security;

create policy "Users can CRUD own health records"
  on public.health_records for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Activities (Quadrant 3: Play Lab)
-- ============================================
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  source_url text,
  title text not null,
  materials jsonb default '[]',
  duration_minutes int,
  age_min int,
  age_max int,
  steps jsonb default '[]',
  scheduled_for timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

create index idx_activities_user_id on public.activities(user_id);
create index idx_activities_child_id on public.activities(child_id);

alter table public.activities enable row level security;

create policy "Users can CRUD own activities"
  on public.activities for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Tips Saved
-- ============================================
create table public.tips_saved (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  content text not null,
  source text,
  category text,
  created_at timestamptz default now() not null
);

create index idx_tips_saved_user_id on public.tips_saved(user_id);

alter table public.tips_saved enable row level security;

create policy "Users can CRUD own tips"
  on public.tips_saved for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Coach Conversations (Quadrant 4: Coach)
-- ============================================
create table public.coach_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz
);

create index idx_coach_conversations_user_id on public.coach_conversations(user_id);

alter table public.coach_conversations enable row level security;

create policy "Users can CRUD own conversations"
  on public.coach_conversations for all
  using (user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub'));

-- ============================================
-- Coach Messages
-- ============================================
create table public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.coach_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamptz default now() not null
);

create index idx_coach_messages_conversation_id on public.coach_messages(conversation_id);

alter table public.coach_messages enable row level security;

create policy "Users can CRUD own messages"
  on public.coach_messages for all
  using (
    conversation_id in (
      select id from public.coach_conversations
      where user_id = (select id from public.users where clerk_id = auth.jwt() ->> 'sub')
    )
  );

-- ============================================
-- Embeddings (pgvector for RAG)
-- ============================================
create table public.embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text,
  category text,
  embedding vector(1024),
  metadata jsonb,
  created_at timestamptz default now() not null
);

create index idx_embeddings_category on public.embeddings(category);

-- HNSW index for fast similarity search
create index idx_embeddings_vector on public.embeddings
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- No RLS on embeddings — these are shared knowledge base chunks
-- accessible to all authenticated users
