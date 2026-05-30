-- ============================================================
-- FITPRO — Moduli Yoga / Studio Klasash
-- Ekzekuto: Supabase → SQL Editor → Run
-- ============================================================

-- Klasat e Yoga/Pilates/etj
create table if not exists yoga_classes (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  instructor_id uuid references staff(id) on delete set null,
  class_type    text not null default 'Yoga',
  level         text default 'all' check (level in ('beginner','intermediate','advanced','all')),
  date          date not null,
  start_time    time not null,
  end_time      time not null,
  duration_min  int not null default 60,
  capacity      int, -- null = pa limit
  price         int not null default 0,
  description   text,
  is_cancelled  boolean default false,
  is_recurring  boolean default false,
  created_at    timestamptz default now()
);
create index if not exists idx_yc_gym  on yoga_classes(gym_id);
create index if not exists idx_yc_date on yoga_classes(date);

-- Rezervimet e klasave
create table if not exists yoga_bookings (
  id             uuid primary key default uuid_generate_v4(),
  gym_id         uuid not null references gyms(id) on delete cascade,
  class_id       uuid not null references yoga_classes(id) on delete cascade,
  member_id      uuid references members(id) on delete set null,
  client_name    text not null,
  client_phone   text,
  client_email   text,
  status         text default 'confirmed' check (status in ('confirmed','cancelled','no_show')),
  price_paid     int default 0,
  payment_status text default 'unpaid' check (payment_status in ('unpaid','paid')),
  payment_method text default 'cash',
  notes          text,
  created_at     timestamptz default now(),
  -- 1 rezervim për person / klasë
  unique(class_id, client_email)
);
create index if not exists idx_yb_gym   on yoga_bookings(gym_id);
create index if not exists idx_yb_class on yoga_bookings(class_id);

-- Orari javor (template)
create table if not exists yoga_schedule (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  instructor_id uuid references staff(id) on delete set null,
  class_type    text not null,
  level         text default 'all',
  day_of_week   text not null check (day_of_week in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun')),
  day_order     int default 0,
  start_time    time not null,
  duration_min  int default 60,
  capacity      int,
  price         int default 0,
  is_active     boolean default true,
  created_at    timestamptz default now()
);
create index if not exists idx_ys_gym on yoga_schedule(gym_id);

-- RLS
alter table yoga_classes   enable row level security;
alter table yoga_bookings  enable row level security;
alter table yoga_schedule  enable row level security;

drop policy if exists "yc_all" on yoga_classes;
drop policy if exists "yb_sel" on yoga_bookings;
drop policy if exists "yb_ins" on yoga_bookings;
drop policy if exists "yb_upd" on yoga_bookings;
drop policy if exists "ys_all" on yoga_schedule;

create policy "yc_all" on yoga_classes  for all using (gym_id = my_gym_id() or is_platform_admin());
create policy "yb_sel" on yoga_bookings for select using (gym_id = my_gym_id() or is_platform_admin());
create policy "yb_ins" on yoga_bookings for insert with check (true);
create policy "yb_upd" on yoga_bookings for update using (gym_id = my_gym_id() or is_platform_admin());
create policy "ys_all" on yoga_schedule for all using (gym_id = my_gym_id() or is_platform_admin());

select 'Yoga Schema ✅' as rezultati;
