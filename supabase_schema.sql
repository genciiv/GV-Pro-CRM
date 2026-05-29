-- ============================================================
-- FITPRO CRM — SQL Schema Multi-Tenant
-- Ekzekuto: Supabase → SQL Editor → Run All
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ─── TABELAT ─────────────────────────────────────────────

create table if not exists gyms (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  email        text not null unique,
  phone        text,
  address      text,
  city         text,
  nipt         text,
  status       text default 'pending' check (status in ('pending','approved','suspended','rejected')),
  plan         text default 'starter',
  approved_at  timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists gym_users (
  id           uuid primary key default uuid_generate_v4(),
  gym_id       uuid not null references gyms(id) on delete cascade,
  auth_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  email        text not null,
  role         text default 'owner' check (role in ('owner','admin','reception','trainer')),
  is_active    boolean default true,
  avatar_color int default 0,
  created_at   timestamptz default now()
);
create index if not exists idx_gym_users_gym    on gym_users(gym_id);
create index if not exists idx_gym_users_auth   on gym_users(auth_id);
create index if not exists idx_gym_users_email  on gym_users(email);

create table if not exists plans (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  name          text not null,
  emoji         text default '📆',
  price         int not null,
  duration_days int not null,
  is_active     boolean default true,
  sort_order    int default 0,
  created_at    timestamptz default now()
);
create index if not exists idx_plans_gym on plans(gym_id);

create table if not exists members (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  phone         text,
  email         text,
  birthday      date,
  gender        text check (gender in ('M','F','other')),
  avatar_color  int default 0,
  notes         text,
  qr_code       text unique default encode(gen_random_bytes(12),'hex'),
  is_active     boolean default true,
  registered_at date default current_date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_members_gym    on members(gym_id);
create index if not exists idx_members_qr     on members(qr_code);
create index if not exists idx_members_name   on members(gym_id, last_name);

create table if not exists memberships (
  id           uuid primary key default uuid_generate_v4(),
  gym_id       uuid not null references gyms(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  plan_id      uuid not null references plans(id),
  start_date   date not null default current_date,
  end_date     date not null,
  status       text default 'active' check (status in ('active','expired','frozen','cancelled')),
  freeze_date  date,
  freeze_days  int default 0,
  price_paid   int,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_memberships_gym    on memberships(gym_id);
create index if not exists idx_memberships_member on memberships(member_id);

create table if not exists payments (
  id              uuid primary key default uuid_generate_v4(),
  gym_id          uuid not null references gyms(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  membership_id   uuid references memberships(id) on delete set null,
  invoice_number  text,
  amount          int not null,
  method          text default 'cash' check (method in ('cash','transfer','card')),
  status          text default 'paid' check (status in ('paid','unpaid')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_payments_gym    on payments(gym_id);
create index if not exists idx_payments_member on payments(member_id);

create table if not exists check_ins (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  membership_id uuid references memberships(id) on delete set null,
  checked_in_at timestamptz default now(),
  method        text default 'qr' check (method in ('qr','manual'))
);
create index if not exists idx_checkins_gym  on check_ins(gym_id);
create index if not exists idx_checkins_time on check_ins(checked_in_at);
create unique index if not exists one_checkin_per_day
  on check_ins(gym_id, member_id, date(checked_in_at at time zone 'Europe/Tirane'));

create table if not exists applications (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  owner_name   text not null,
  email        text not null,
  phone        text not null,
  city         text,
  address      text,
  message      text,
  status       text default 'new' check (status in ('new','contacted','approved','rejected')),
  gym_id       uuid references gyms(id),
  created_at   timestamptz default now()
);

create table if not exists platform_admins (
  id         uuid primary key default uuid_generate_v4(),
  auth_id    uuid unique references auth.users(id) on delete cascade,
  email      text unique not null,
  name       text not null,
  created_at timestamptz default now()
);

-- ─── AUTO INVOICE ────────────────────────────────────────

create or replace function set_invoice_number()
returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from payments where gym_id = new.gym_id;
  new.invoice_number := 'INV-' || lpad(v_n::text, 4, '0');
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_invoice on payments;
create trigger trg_invoice before insert on payments
  for each row execute function set_invoice_number();

-- ─── AUTO UPDATED_AT ─────────────────────────────────────

create or replace function upd_at()
returns trigger as $$ begin new.updated_at=now(); return new; end; $$ language plpgsql;

drop trigger if exists t_gyms on gyms;
drop trigger if exists t_members on members;
drop trigger if exists t_memberships on memberships;
drop trigger if exists t_payments on payments;

create trigger t_gyms        before update on gyms        for each row execute function upd_at();
create trigger t_members     before update on members     for each row execute function upd_at();
create trigger t_memberships before update on memberships for each row execute function upd_at();
create trigger t_payments    before update on payments    for each row execute function upd_at();

-- ─── VIEWS ───────────────────────────────────────────────

create or replace view members_with_status as
select
  m.id, m.gym_id, m.first_name, m.last_name,
  m.first_name||' '||m.last_name as full_name,
  m.phone, m.email, m.birthday, m.gender,
  m.avatar_color, m.qr_code, m.is_active, m.registered_at, m.notes,
  ms.id          as membership_id,
  ms.status      as membership_status,
  ms.start_date, ms.end_date,
  p.id           as plan_id,
  p.name         as plan_name,
  p.emoji        as plan_emoji,
  p.price        as plan_price,
  (ms.end_date - current_date) as days_remaining,
  coalesce((select sum(amount) from payments py where py.member_id=m.id and py.gym_id=m.gym_id and py.status='unpaid'),0) as total_debt,
  (select count(*) from check_ins ci where ci.member_id=m.id and ci.gym_id=m.gym_id and date_trunc('month',ci.checked_in_at)=date_trunc('month',now())) as checkins_this_month,
  (select max(checked_in_at) from check_ins ci where ci.member_id=m.id and ci.gym_id=m.gym_id) as last_checkin
from members m
left join memberships ms on ms.member_id=m.id and ms.gym_id=m.gym_id
  and ms.status in ('active','frozen')
  and ms.end_date=(select max(end_date) from memberships where member_id=m.id and gym_id=m.gym_id and status in ('active','frozen'))
left join plans p on p.id=ms.plan_id
where m.is_active=true;

create or replace view todays_checkins as
select ci.id, ci.gym_id, ci.checked_in_at, ci.method, ci.member_id,
  m.first_name||' '||m.last_name as member_name, m.avatar_color,
  p.name as plan_name
from check_ins ci
join members m on m.id=ci.member_id
left join memberships ms on ms.id=ci.membership_id
left join plans p on p.id=ms.plan_id
where date(ci.checked_in_at at time zone 'Europe/Tirane')=current_date
order by ci.checked_in_at desc;

create or replace view gym_monthly_revenue as
select gym_id, date_trunc('month',created_at) as month,
  sum(amount) as total, count(*) as transactions
from payments where status='paid'
group by 1,2 order by 1,2;

-- ─── FUNCTIONS ───────────────────────────────────────────

create or replace function get_gym_stats(p_gym_id uuid)
returns jsonb as $$
declare
  v_active int; v_checkins int; v_expiring int;
  v_debt bigint; v_debtors int; v_today bigint; v_month bigint;
  t date := current_date;
  mo date := date_trunc('month',now())::date;
begin
  select count(*) into v_active from memberships where gym_id=p_gym_id and status='active' and end_date>=t;
  select count(*) into v_checkins from check_ins where gym_id=p_gym_id and date(checked_in_at at time zone 'Europe/Tirane')=t;
  select count(*) into v_expiring from memberships where gym_id=p_gym_id and status='active' and end_date between t and t+7;
  select coalesce(sum(amount),0),count(*) into v_debt,v_debtors from payments where gym_id=p_gym_id and status='unpaid';
  select coalesce(sum(amount),0) into v_today from payments where gym_id=p_gym_id and status='paid' and date(created_at at time zone 'Europe/Tirane')=t;
  select coalesce(sum(amount),0) into v_month from payments where gym_id=p_gym_id and status='paid' and created_at>=mo;
  return jsonb_build_object('active',v_active,'checkins',v_checkins,'expiring',v_expiring,'debt',v_debt,'debtors',v_debtors,'paidToday',v_today,'paidMonth',v_month);
end; $$ language plpgsql security definer;

create or replace function process_qr_checkin(p_qr_code text, p_gym_id uuid)
returns jsonb as $$
declare v_m members%rowtype; v_ms memberships%rowtype;
begin
  select * into v_m from members where qr_code=p_qr_code and gym_id=p_gym_id and is_active=true;
  if not found then return jsonb_build_object('success',false,'message','QR Code nuk u gjet'); end if;
  select * into v_ms from memberships where member_id=v_m.id and gym_id=p_gym_id and status='active' and end_date>=current_date order by end_date desc limit 1;
  if not found then return jsonb_build_object('success',false,'message','Abonimi ka skaduar','member_name',v_m.first_name||' '||v_m.last_name); end if;
  begin
    insert into check_ins(gym_id,member_id,membership_id,method) values(p_gym_id,v_m.id,v_ms.id,'qr');
  exception when unique_violation then
    return jsonb_build_object('success',true,'already_checked',true,'member_name',v_m.first_name||' '||v_m.last_name,'plan_name',(select name from plans where id=v_ms.plan_id),'days_remaining',(v_ms.end_date-current_date));
  end;
  return jsonb_build_object('success',true,'already_checked',false,'member_name',v_m.first_name||' '||v_m.last_name,'plan_name',(select name from plans where id=v_ms.plan_id),'days_remaining',(v_ms.end_date-current_date));
end; $$ language plpgsql security definer;

create or replace function freeze_membership(p_membership_id uuid) returns void as $$
begin update memberships set status='frozen',freeze_date=current_date,updated_at=now() where id=p_membership_id and status='active'; end;
$$ language plpgsql security definer;

create or replace function unfreeze_membership(p_membership_id uuid) returns void as $$
declare v_days int;
begin
  select (current_date-freeze_date) into v_days from memberships where id=p_membership_id;
  update memberships set status='active',end_date=end_date+v_days,freeze_days=freeze_days+v_days,freeze_date=null,updated_at=now() where id=p_membership_id and status='frozen';
end; $$ language plpgsql security definer;

create or replace function create_default_plans(p_gym_id uuid) returns void as $$
begin
  insert into plans(gym_id,name,emoji,price,duration_days,sort_order) values
    (p_gym_id,'Ditor','☀️',500,1,1),(p_gym_id,'Javor','📅',1500,7,2),
    (p_gym_id,'Mujor','📆',3000,30,3),(p_gym_id,'3 Mujor','🗓️',7500,90,4),
    (p_gym_id,'6 Mujor','🏆',13000,180,5),(p_gym_id,'Vjetor','⭐',22000,365,6),
    (p_gym_id,'Student','🎓',2000,30,7),(p_gym_id,'Couple','👫',5000,30,8);
end; $$ language plpgsql security definer;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────

alter table gyms            enable row level security;
alter table gym_users       enable row level security;
alter table plans           enable row level security;
alter table members         enable row level security;
alter table memberships     enable row level security;
alter table payments        enable row level security;
alter table check_ins       enable row level security;
alter table applications    enable row level security;
alter table platform_admins enable row level security;

-- Helper functions
create or replace function my_gym_id() returns uuid as $$
  select gym_id from gym_users where auth_id=auth.uid() and is_active=true limit 1;
$$ language sql security definer stable;

create or replace function is_platform_admin() returns boolean as $$
  select exists(select 1 from platform_admins where auth_id=auth.uid());
$$ language sql security definer stable;

-- Policies
drop policy if exists "gym_see"    on gyms;
drop policy if exists "gym_upd"    on gyms;
drop policy if exists "gym_ins"    on gyms;
drop policy if exists "users_own"  on gym_users;
drop policy if exists "plans_own"  on plans;
drop policy if exists "mbrs_own"   on members;
drop policy if exists "mbs_own"    on memberships;
drop policy if exists "pays_own"   on payments;
drop policy if exists "ci_own"     on check_ins;
drop policy if exists "apps_ins"   on applications;
drop policy if exists "apps_admin" on applications;
drop policy if exists "padmin_own" on platform_admins;

create policy "gym_see"    on gyms for select using (id=my_gym_id() or is_platform_admin());
create policy "gym_upd"    on gyms for update using (id=my_gym_id() or is_platform_admin());
create policy "gym_ins"    on gyms for insert with check (is_platform_admin());
create policy "users_own"  on gym_users  for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "plans_own"  on plans      for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "mbrs_own"   on members    for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "mbs_own"    on memberships for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "pays_own"   on payments   for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "ci_own"     on check_ins  for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "apps_ins"   on applications for insert with check (true);
create policy "apps_admin" on applications for select using (is_platform_admin());
create policy "apps_upd"   on applications for update using (is_platform_admin());
create policy "padmin_own" on platform_admins for all using (is_platform_admin() or auth_id=auth.uid());

-- ─── SUKSES ──────────────────────────────────────────────
select 'FitPro Schema u krijua me sukses! ✅' as rezultati;
