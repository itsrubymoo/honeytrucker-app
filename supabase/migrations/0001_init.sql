-- Honeytrucker app schema: profiles, memberships, content, courses, RLS.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user reads own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user updates own row"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: admin reads all"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles: admin updates all"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever a new auth user signs up. The admin
-- allowlist lives here (Postgres can't read the app's env vars) — to add or
-- change admins, edit the array below and either re-run it as a migration
-- or, for an existing user, just `update profiles set role = 'admin' where
-- email = '...'` directly.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  admin_emails text[] := array['ruby@honeytrucker.com'];
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = any (admin_emails) then 'admin' else 'member' end
  );

  -- Reconcile any Stripe purchase that arrived before this login existed.
  update public.memberships
  set profile_id = new.id
  where email = new.email and profile_id is null;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- memberships (written only by the Stripe webhook, via the service role key)
-- ---------------------------------------------------------------------------
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  email text not null,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create index memberships_profile_id_idx on public.memberships (profile_id);
create index memberships_email_idx on public.memberships (email);

alter table public.memberships enable row level security;
-- No client-side policies: only the service-role key (server-only) touches this table.

create or replace function public.is_member(uid uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.profile_id = uid and m.status in ('active', 'trialing')
  );
$$;

-- ---------------------------------------------------------------------------
-- content_items (resources / audio / video)
-- ---------------------------------------------------------------------------
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('resource', 'audio', 'video')),
  slug text not null unique,
  title text not null,
  description text,
  tier text not null default 'free' check (tier in ('free', 'member')),
  cover_image_url text,
  file_url text,
  mux_playback_id text,
  mux_asset_id text,
  duration_seconds integer,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_items enable row level security;

-- Base table stays strictly gated — mux_playback_id and file_url live here,
-- and the anon key is public in the browser, so RLS (not app-code
-- discretion) must be what stops a direct API call from reading them for
-- member-tier content. Locked-preview metadata for the UI comes from the
-- *_public views below instead, which never expose these columns at all.
create policy "content_items: read published + entitled"
  on public.content_items for select
  using (published = true and (tier = 'free' or public.is_member(auth.uid())));

create policy "content_items: admin full access"
  on public.content_items for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- courses / modules / lessons
-- ---------------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  tier text not null default 'free' check (tier in ('free', 'member')),
  cover_image_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "courses: read published + entitled"
  on public.courses for select
  using (published = true and (tier = 'free' or public.is_member(auth.uid())));

create policy "courses: admin full access"
  on public.courses for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  sort_order integer not null default 0
);

alter table public.course_modules enable row level security;

create policy "course_modules: read via parent course"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id and c.published = true and (c.tier = 'free' or public.is_member(auth.uid()))
    )
  );

create policy "course_modules: admin full access"
  on public.course_modules for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  slug text not null,
  tier text check (tier in ('free', 'member')), -- null = inherit course tier
  body text,
  content_item_id uuid references public.content_items (id) on delete set null,
  sort_order integer not null default 0,
  unique (module_id, slug)
);

alter table public.course_lessons enable row level security;

create policy "course_lessons: read via parent course, own tier or inherited"
  on public.course_lessons for select
  using (
    exists (
      select 1 from public.course_modules cm
      join public.courses c on c.id = cm.course_id
      where cm.id = module_id
        and c.published = true
        and (coalesce(course_lessons.tier, c.tier) = 'free' or public.is_member(auth.uid()))
    )
  );

create policy "course_lessons: admin full access"
  on public.course_lessons for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---------------------------------------------------------------------------
-- course_progress (schema now, UI is v2)
-- ---------------------------------------------------------------------------
create table public.course_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (profile_id, lesson_id)
);

alter table public.course_progress enable row level security;

create policy "course_progress: user manages own rows"
  on public.course_progress for all
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- ---------------------------------------------------------------------------
-- Public preview views — metadata-only, so a logged-out or non-member
-- visitor can see that member-tier content/courses/lessons *exist* (for the
-- locked-card UI) without the view ever exposing a gated field. These views
-- are owned by the migration role, which bypasses the base tables' RLS, so
-- their own `where published = true` clause is the only filter — safe only
-- because every gated column (mux_playback_id, file_url, lesson body) is
-- deliberately left out of the column list below.
-- ---------------------------------------------------------------------------
create view public.content_items_public
with (security_invoker = false)
as
select id, type, slug, title, description, tier, cover_image_url, duration_seconds, sort_order, created_at
from public.content_items
where published = true;

grant select on public.content_items_public to anon, authenticated;

create view public.courses_public
with (security_invoker = false)
as
select id, slug, title, description, tier, cover_image_url, sort_order, created_at
from public.courses
where published = true;

grant select on public.courses_public to anon, authenticated;

create view public.course_modules_public
with (security_invoker = false)
as
select cm.id, cm.course_id, cm.title, cm.sort_order
from public.course_modules cm
join public.courses c on c.id = cm.course_id
where c.published = true;

grant select on public.course_modules_public to anon, authenticated;

create view public.course_lessons_public
with (security_invoker = false)
as
select cl.id, cl.module_id, cl.title, cl.slug, coalesce(cl.tier, c.tier) as tier, cl.sort_order
from public.course_lessons cl
join public.course_modules cm on cm.id = cl.module_id
join public.courses c on c.id = cm.course_id
where c.published = true;

grant select on public.course_lessons_public to anon, authenticated;
