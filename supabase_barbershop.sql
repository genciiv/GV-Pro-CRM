-- ============================================================
-- FITPRO — Moduli Barbershop / Rezervime
-- Ekzekuto: Supabase → SQL Editor → Run
-- ============================================================

-- Lloji i biznesit (gym, barbershop, salon, spa, yoga, etj)
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS business_type text default 'gym'
  check (business_type in ('gym','barbershop','salon','spa','yoga','pilates','martial_arts','other'));

-- Stafi (berberët, stilistët, etj)
create table if not exists staff (
  id           uuid primary key default uuid_generate_v4(),
  gym_id       uuid not null references gyms(id) on delete cascade,
  auth_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  email        text,
  phone        text,
  role         text default 'staff' check (role in ('owner','manager','staff')),
  speciality   text, -- 'barber', 'colorist', 'massage', 'trainer', etj
  bio          text,
  photo_url    text,
  avatar_color int default 0,
  is_active    boolean default true,
  working_days text[] default array['Mon','Tue','Wed','Thu','Fri','Sat'],
  start_time   time default '09:00',
  end_time     time default '19:00',
  slot_minutes int default 30, -- kohëzgjatja e çdo slot
  created_at   timestamptz default now()
);
create index if not exists idx_staff_gym on staff(gym_id);

-- Shërbimet (prerje flokësh, ngjyrosje, masazh, etj)
create table if not exists services (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  name          text not null,
  description   text,
  duration_min  int not null default 30, -- minuta
  price         int not null,
  category      text, -- 'haircut', 'color', 'beard', 'massage', etj
  emoji         text default '✂️',
  is_active     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now()
);
create index if not exists idx_services_gym on services(gym_id);

-- Lidhja staf-shërbime (çdo berber ofron shërbime të caktuara)
create table if not exists staff_services (
  staff_id    uuid not null references staff(id) on delete cascade,
  service_id  uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- Rezervimet
create table if not exists appointments (
  id              uuid primary key default uuid_generate_v4(),
  gym_id          uuid not null references gyms(id) on delete cascade,
  staff_id        uuid not null references staff(id) on delete cascade,
  service_id      uuid not null references services(id),
  -- Klienti (mund të jetë anëtar ose vetëm i ftuar)
  member_id       uuid references members(id) on delete set null,
  client_name     text not null,
  client_phone    text,
  client_email    text,
  -- Koha
  appointment_date date not null,
  start_time      time not null,
  end_time        time not null,
  -- Statusi
  status          text default 'pending'
    check (status in ('pending','confirmed','completed','cancelled','no_show')),
  -- Pagesa
  price           int not null,
  payment_status  text default 'unpaid' check (payment_status in ('unpaid','paid')),
  payment_method  text default 'cash',
  -- Notes
  notes           text,
  cancelled_reason text,
  invoice_number  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_appt_gym    on appointments(gym_id);
create index if not exists idx_appt_staff  on appointments(staff_id);
create index if not exists idx_appt_date   on appointments(appointment_date);
create index if not exists idx_appt_member on appointments(member_id);

-- Pushimet / Ditët e Lira (vakancë, sëmundje, etj)
create table if not exists staff_leaves (
  id         uuid primary key default uuid_generate_v4(),
  staff_id   uuid not null references staff(id) on delete cascade,
  gym_id     uuid not null references gyms(id) on delete cascade,
  date_from  date not null,
  date_to    date not null,
  reason     text,
  created_at timestamptz default now()
);

-- Oraret e personalizuara (override ditorë)
create table if not exists staff_schedule_overrides (
  id         uuid primary key default uuid_generate_v4(),
  staff_id   uuid not null references staff(id) on delete cascade,
  date       date not null,
  start_time time,
  end_time   time,
  is_off     boolean default false, -- true = nuk punon këtë ditë
  unique(staff_id, date)
);

-- ─── AUTO INVOICE APPOINTMENTS ───────────────────────────
create or replace function set_invoice_appt() returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from appointments where gym_id = new.gym_id;
  new.invoice_number := 'APT-' || lpad(v_n::text, 4, '0');
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_inv_appt on appointments;
create trigger trg_inv_appt before insert on appointments
  for each row execute function set_invoice_appt();

-- ─── AUTO UPDATED_AT ─────────────────────────────────────
drop trigger if exists t_appt on appointments;
create trigger t_appt before update on appointments
  for each row execute function upd_at();

-- ─── STATS VIEW ──────────────────────────────────────────
create or replace view appointment_stats as
select
  a.gym_id,
  count(*) filter (where a.appointment_date = current_date) as today_total,
  count(*) filter (where a.appointment_date = current_date and a.status = 'confirmed') as today_confirmed,
  count(*) filter (where a.appointment_date = current_date and a.status = 'completed') as today_completed,
  count(*) filter (where date_trunc('month', a.appointment_date::timestamptz) = date_trunc('month', now()) and a.status != 'cancelled') as month_total,
  coalesce(sum(a.price) filter (where a.payment_status = 'paid' and date_trunc('month', a.appointment_date::timestamptz) = date_trunc('month', now())), 0) as month_revenue,
  coalesce(sum(a.price) filter (where a.payment_status = 'paid' and a.appointment_date = current_date), 0) as today_revenue,
  count(*) filter (where a.status = 'pending') as pending_total
from appointments a
group by a.gym_id;

-- ─── FUNCTION: Get Available Slots ───────────────────────
create or replace function get_available_slots(
  p_staff_id uuid,
  p_date date,
  p_duration_min int
) returns table(slot_time time, is_available boolean) as $$
declare
  v_staff staff%rowtype;
  v_slot time;
  v_end_slot time;
  v_busy boolean;
begin
  select * into v_staff from staff where id = p_staff_id;
  if not found then return; end if;

  -- Kontrollo nëse është ditë pushimi
  if exists (
    select 1 from staff_leaves
    where staff_id = p_staff_id and p_date between date_from and date_to
  ) then return; end if;

  -- Gjenero slots
  v_slot := v_staff.start_time;
  while v_slot + (p_duration_min || ' minutes')::interval <= v_staff.end_time loop
    v_end_slot := v_slot + (p_duration_min || ' minutes')::interval;

    -- Kontrollo nëse slot-i është i zënë
    select exists (
      select 1 from appointments
      where staff_id = p_staff_id
        and appointment_date = p_date
        and status not in ('cancelled')
        and (
          (start_time <= v_slot and end_time > v_slot) or
          (start_time < v_end_slot and end_time >= v_end_slot) or
          (start_time >= v_slot and end_time <= v_end_slot)
        )
    ) into v_busy;

    slot_time := v_slot;
    is_available := not v_busy;
    return next;

    v_slot := v_slot + (v_staff.slot_minutes || ' minutes')::interval;
  end loop;
end; $$ language plpgsql security definer;

-- ─── RLS ─────────────────────────────────────────────────
alter table staff                      enable row level security;
alter table services                   enable row level security;
alter table staff_services             enable row level security;
alter table appointments               enable row level security;
alter table staff_leaves               enable row level security;
alter table staff_schedule_overrides   enable row level security;

-- Policies
drop policy if exists "staff_all"    on staff;
drop policy if exists "svc_sel"      on services;
drop policy if exists "svc_all"      on services;
drop policy if exists "ss_all"       on staff_services;
drop policy if exists "appt_sel"     on appointments;
drop policy if exists "appt_ins"     on appointments;
drop policy if exists "appt_upd"     on appointments;
drop policy if exists "leaves_all"   on staff_leaves;
drop policy if exists "override_all" on staff_schedule_overrides;

create policy "staff_all"    on staff for all using (gym_id = my_gym_id() or is_platform_admin());
create policy "svc_sel"      on services for select using (true);
create policy "svc_all"      on services for all using (gym_id = my_gym_id() or is_platform_admin());
create policy "ss_all"       on staff_services for all using (true);
create policy "appt_sel"     on appointments for select using (gym_id = my_gym_id() or is_platform_admin() or client_email = auth.email());
create policy "appt_ins"     on appointments for insert with check (true);
create policy "appt_upd"     on appointments for update using (gym_id = my_gym_id() or is_platform_admin());
create policy "leaves_all"   on staff_leaves for all using (gym_id = my_gym_id() or is_platform_admin());
create policy "override_all" on staff_schedule_overrides for all using (true);

-- ─── SHËRBIME DEFAULT për Barbershop ─────────────────────
-- (Ekzekuto këtë vetëm për barbershop-et)
-- insert into services (gym_id, name, emoji, duration_min, price, category) values
-- (GYM_ID, 'Prerje Flokësh', '✂️', 30, 800, 'haircut'),
-- (GYM_ID, 'Prerje + Rregullim Mjekre', '🪒', 45, 1200, 'haircut'),
-- (GYM_ID, 'Rregullim Mjekre', '🪒', 20, 500, 'beard'),
-- (GYM_ID, 'Ngjyrosje', '🎨', 60, 2000, 'color'),
-- (GYM_ID, 'Prerje Fëmijësh', '👶', 20, 600, 'haircut');

select 'Barbershop Schema ✅ U Instalua!' as rezultati;
