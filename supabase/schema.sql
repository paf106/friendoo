create extension if not exists pgcrypto;

create type public.group_status as enum ('draft', 'drawn');
create type public.group_role as enum ('owner', 'participant');
create type public.email_status as enum ('pending', 'sent', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  max_price numeric(10, 2) not null check (max_price > 0),
  exchange_date date,
  message text,
  join_code text not null unique,
  status public.group_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.group_role not null default 'participant',
  gift_suggestions text,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

create table public.draw_assignments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  giver_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (giver_id <> receiver_id),
  unique (group_id, giver_id),
  unique (group_id, receiver_id)
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  assignment_id uuid references public.draw_assignments(id) on delete set null,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  resend_id text,
  status public.email_status not null default 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index group_members_user_id_idx on public.group_members(user_id);
create index group_members_group_id_idx on public.group_members(group_id);
create index draw_assignments_group_id_idx on public.draw_assignments(group_id);
create index email_deliveries_group_id_idx on public.email_deliveries(group_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.draw_assignments enable row level security;
alter table public.email_deliveries enable row level security;

create policy "profiles are visible to authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "users can maintain their own profile"
on public.profiles for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "members can read their groups"
on public.groups for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1 from public.group_members gm
    where gm.group_id = groups.id and gm.user_id = auth.uid()
  )
);

create policy "authenticated users can create groups"
on public.groups for insert
to authenticated
with check (owner_id = auth.uid());

create policy "owners can update their draft groups"
on public.groups for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "members can read group members"
on public.group_members for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.group_members viewer
    where viewer.group_id = group_members.group_id and viewer.user_id = auth.uid()
  )
);

create policy "users can join groups as themselves"
on public.group_members for insert
to authenticated
with check (user_id = auth.uid());

create policy "users can update their member row"
on public.group_members for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "assignment visibility"
on public.draw_assignments for select
to authenticated
using (
  giver_id = auth.uid()
  or exists (
    select 1 from public.groups g
    where g.id = draw_assignments.group_id and g.owner_id = auth.uid()
  )
);

create policy "email delivery owner visibility"
on public.email_deliveries for select
to authenticated
using (
  recipient_user_id = auth.uid()
  or exists (
    select 1 from public.groups g
    where g.id = email_deliveries.group_id and g.owner_id = auth.uid()
  )
);
