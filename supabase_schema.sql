-- ============================================================
-- FITPRO ECOSYSTEM — Schema i Plotë
-- Moduli: Palestra + Dietologë + Produkte + Anëtarë App
-- Ekzekuto: Supabase → SQL Editor → Run All
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ─── GYMS ────────────────────────────────────────────────
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

-- ─── GYM USERS ───────────────────────────────────────────
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
create index if not exists idx_gu_gym    on gym_users(gym_id);
create index if not exists idx_gu_auth   on gym_users(auth_id);
create index if not exists idx_gu_email  on gym_users(email);

-- ─── PLANS ───────────────────────────────────────────────
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

-- ─── MEMBERS ─────────────────────────────────────────────
create table if not exists members (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  auth_id       uuid references auth.users(id) on delete set null,
  first_name    text not null,
  last_name     text not null,
  phone         text,
  email         text,
  birthday      date,
  gender        text check (gender in ('M','F','other')),
  avatar_color  int default 0,
  notes         text,
  qr_code       text unique default encode(gen_random_bytes(12),'hex'),
  -- App profile
  weight        numeric(5,1),
  height        numeric(5,1),
  goal          text check (goal in ('lose_weight','build_muscle','stay_fit','other')),
  is_active     boolean default true,
  registered_at date default current_date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index if not exists idx_mb_gym   on members(gym_id);
create index if not exists idx_mb_qr    on members(qr_code);
create index if not exists idx_mb_auth  on members(auth_id);
create index if not exists idx_mb_email on members(email);

-- ─── MEMBERSHIPS ─────────────────────────────────────────
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
create index if not exists idx_ms_gym    on memberships(gym_id);
create index if not exists idx_ms_member on memberships(member_id);

-- ─── PAYMENTS ────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default uuid_generate_v4(),
  gym_id          uuid not null references gyms(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  membership_id   uuid references memberships(id) on delete set null,
  invoice_number  text,
  amount          int not null,
  method          text default 'cash' check (method in ('cash','transfer','card','online')),
  status          text default 'paid' check (status in ('paid','unpaid')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_pay_gym    on payments(gym_id);
create index if not exists idx_pay_member on payments(member_id);

-- ─── CHECK-INS ───────────────────────────────────────────
create table if not exists check_ins (
  id            uuid primary key default uuid_generate_v4(),
  gym_id        uuid not null references gyms(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  membership_id uuid references memberships(id) on delete set null,
  checked_in_at timestamptz default now(),
  method        text default 'qr' check (method in ('qr','manual'))
);
create index if not exists idx_ci_gym  on check_ins(gym_id);
create index if not exists idx_ci_time on check_ins(checked_in_at);
create unique index if not exists one_checkin_per_day
  on check_ins(gym_id, member_id, date(checked_in_at at time zone 'Europe/Tirane'));

-- ─── APPLICATIONS (palestra) ─────────────────────────────
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

-- ─── PLATFORM ADMINS ─────────────────────────────────────
create table if not exists platform_admins (
  id         uuid primary key default uuid_generate_v4(),
  auth_id    uuid unique references auth.users(id) on delete cascade,
  email      text unique not null,
  name       text not null,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- MODULI DIETOLOGËVE
-- ═══════════════════════════════════════════════════════════

create table if not exists nutritionists (
  id           uuid primary key default uuid_generate_v4(),
  auth_id      uuid unique references auth.users(id) on delete set null,
  name         text not null,
  email        text not null unique,
  phone        text,
  bio          text,
  speciality   text, -- 'weight_loss', 'muscle_gain', 'medical', 'sports', 'vegan'
  photo_url    text,
  experience_years int default 0,
  education    text,
  certificate  text,
  status       text default 'pending' check (status in ('pending','approved','suspended','rejected')),
  commission_pct int default 70, -- % që merr dietologu (default 70%)
  rating       numeric(3,2) default 0,
  total_sales  int default 0,
  approved_at  timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_nutr_auth  on nutritionists(auth_id);
create index if not exists idx_nutr_email on nutritionists(email);

-- Planet e dietës
create table if not exists diet_plans (
  id               uuid primary key default uuid_generate_v4(),
  nutritionist_id  uuid not null references nutritionists(id) on delete cascade,
  title            text not null,
  description      text,
  goal             text check (goal in ('lose_weight','build_muscle','stay_fit','medical','vegan','other')),
  duration_weeks   int not null default 4,
  price            int not null, -- në Lekë
  calories_per_day int,
  meals_per_day    int default 3,
  content          jsonb, -- plani i plotë i dietës
  includes         text[], -- çfarë përfshin
  is_active        boolean default true,
  is_featured      boolean default false,
  purchases        int default 0,
  rating           numeric(3,2) default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index if not exists idx_dp_nutr on diet_plans(nutritionist_id);

-- Porositë e dietave
create table if not exists diet_orders (
  id               uuid primary key default uuid_generate_v4(),
  diet_plan_id     uuid not null references diet_plans(id),
  nutritionist_id  uuid not null references nutritionists(id),
  member_id        uuid references members(id) on delete set null,
  buyer_name       text not null,
  buyer_email      text not null,
  buyer_phone      text,
  amount           int not null,
  nutritionist_amount int not null, -- 70% e shumës
  platform_amount  int not null,    -- 30% e shumës
  status           text default 'pending' check (status in ('pending','paid','cancelled')),
  payment_method   text default 'cash',
  paid_at          timestamptz,
  access_until     date,
  invoice_number   text,
  created_at       timestamptz default now()
);
create index if not exists idx_do_nutr   on diet_orders(nutritionist_id);
create index if not exists idx_do_member on diet_orders(member_id);

-- Aplikimet e dietologëve
create table if not exists nutritionist_applications (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  email        text not null,
  phone        text not null,
  speciality   text,
  experience   text,
  bio          text,
  certificate  text,
  status       text default 'new' check (status in ('new','approved','rejected')),
  nutritionist_id uuid references nutritionists(id),
  created_at   timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════
-- MODULI PRODUKTEVE (DYQANI)
-- ═══════════════════════════════════════════════════════════

create table if not exists product_categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  emoji      text default '📦',
  sort_order int default 0
);

insert into product_categories (name, emoji, sort_order) values
  ('Suplementa', '💊', 1),
  ('Veshje Sportive', '👕', 2),
  ('Pajisje Stërvitjeje', '🏋️', 3),
  ('Aksesorë', '🎽', 4),
  ('Ushqime Shëndetësore', '🥗', 5)
on conflict do nothing;

create table if not exists products (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid references product_categories(id),
  name         text not null,
  description  text,
  price        int not null,
  stock        int default 0,
  image_url    text,
  brand        text,
  weight       text, -- '1kg', '500g', etj
  is_active    boolean default true,
  is_featured  boolean default false,
  commission_pct int default 30, -- % që merr platforma
  sold_count   int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create index if not exists idx_prod_cat on products(category_id);

create table if not exists product_orders (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id),
  gym_id          uuid references gyms(id),
  member_id       uuid references members(id) on delete set null,
  buyer_name      text not null,
  buyer_phone     text,
  quantity        int default 1,
  unit_price      int not null,
  total_amount    int not null,
  platform_amount int not null, -- 30%
  status          text default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  payment_method  text default 'cash',
  notes           text,
  invoice_number  text,
  created_at      timestamptz default now()
);
create index if not exists idx_po_gym    on product_orders(gym_id);
create index if not exists idx_po_member on product_orders(member_id);

-- ═══════════════════════════════════════════════════════════
-- MODULI STËRVITJES (WORKOUT PLANS)
-- ═══════════════════════════════════════════════════════════

create table if not exists workout_plans (
  id           uuid primary key default uuid_generate_v4(),
  gym_id       uuid not null references gyms(id) on delete cascade,
  trainer_id   uuid references gym_users(id) on delete set null,
  member_id    uuid references members(id) on delete cascade,
  title        text not null,
  description  text,
  duration_weeks int default 4,
  days_per_week  int default 3,
  goal         text,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

create table if not exists workout_sessions (
  id              uuid primary key default uuid_generate_v4(),
  workout_plan_id uuid not null references workout_plans(id) on delete cascade,
  day_number      int not null, -- Dita 1, 2, 3...
  title           text not null, -- 'Gjoks + Triceps', 'Këmbë', etj
  notes           text,
  sort_order      int default 0
);

create table if not exists exercises (
  id                 uuid primary key default uuid_generate_v4(),
  workout_session_id uuid not null references workout_sessions(id) on delete cascade,
  name               text not null,
  sets               int default 3,
  reps               text default '10-12', -- '10-12' ose '30 sek'
  rest_seconds       int default 60,
  weight             text, -- 'Vetë pesha', '20kg', etj
  notes              text,
  video_url          text,
  sort_order         int default 0
);

-- Regjistrim i stërvitjeve të kryera
create table if not exists workout_logs (
  id                 uuid primary key default uuid_generate_v4(),
  member_id          uuid not null references members(id) on delete cascade,
  workout_session_id uuid references workout_sessions(id),
  logged_at          timestamptz default now(),
  duration_minutes   int,
  notes              text,
  rating             int check (rating between 1 and 5)
);

-- ═══════════════════════════════════════════════════════════
-- PLATFORM STATS VIEW
-- ═══════════════════════════════════════════════════════════

create or replace view platform_overview as
select
  (select count(*) from gyms where status='approved')              as active_gyms,
  (select count(*) from gyms where status='pending')              as pending_gyms,
  (select count(*) from members where is_active=true)             as total_members,
  (select count(*) from nutritionists where status='approved')    as active_nutritionists,
  (select count(*) from nutritionists where status='pending')     as pending_nutritionists,
  (select count(*) from diet_orders where status='paid')          as total_diet_orders,
  (select coalesce(sum(platform_amount),0) from diet_orders where status='paid') as diet_revenue,
  (select count(*) from product_orders where status!='cancelled') as total_product_orders,
  (select coalesce(sum(platform_amount),0) from product_orders where status='delivered') as product_revenue,
  (select coalesce(sum(amount),0) from payments where status='paid'
    and created_at >= date_trunc('month',now()))                  as gym_revenue_month,
  (select count(*) from applications where status='new')          as new_gym_applications,
  (select count(*) from nutritionist_applications where status='new') as new_nutr_applications;

-- ─── MEMBERS WITH STATUS ─────────────────────────────────
create or replace view members_with_status as
select
  m.id, m.gym_id, m.first_name, m.last_name,
  m.first_name||' '||m.last_name as full_name,
  m.phone, m.email, m.birthday, m.gender,
  m.avatar_color, m.qr_code, m.is_active, m.registered_at, m.notes,
  m.weight, m.height, m.goal, m.auth_id,
  ms.id          as membership_id,
  ms.status      as membership_status,
  ms.start_date, ms.end_date,
  p.id           as plan_id,
  p.name         as plan_name,
  p.emoji        as plan_emoji,
  p.price        as plan_price,
  (ms.end_date - current_date) as days_remaining,
  coalesce((select sum(amount) from payments py where py.member_id=m.id and py.gym_id=m.gym_id and py.status='unpaid'),0) as total_debt,
  (select count(*) from check_ins ci where ci.member_id=m.id and ci.gym_id=m.gym_id
    and date_trunc('month',ci.checked_in_at)=date_trunc('month',now())) as checkins_this_month,
  (select max(checked_in_at) from check_ins ci where ci.member_id=m.id and ci.gym_id=m.gym_id) as last_checkin
from members m
left join memberships ms on ms.member_id=m.id and ms.gym_id=m.gym_id
  and ms.status in ('active','frozen')
  and ms.end_date=(select max(end_date) from memberships where member_id=m.id and gym_id=m.gym_id and status in ('active','frozen'))
left join plans p on p.id=ms.plan_id
where m.is_active=true;

-- ─── TODAY'S CHECK-INS ───────────────────────────────────
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

-- ─── MONTHLY REVENUE ─────────────────────────────────────
create or replace view gym_monthly_revenue as
select gym_id, date_trunc('month',created_at) as month,
  sum(amount) as total, count(*) as transactions
from payments where status='paid'
group by 1,2 order by 1,2;

-- ─── NUTRITIONIST STATS ──────────────────────────────────
create or replace view nutritionist_stats as
select
  n.id, n.name, n.email, n.speciality, n.status, n.rating, n.commission_pct,
  count(distinct dp.id) as total_plans,
  count(distinct do2.id) as total_orders,
  coalesce(sum(case when do2.status='paid' then do2.nutritionist_amount else 0 end),0) as total_earned,
  coalesce(sum(case when do2.status='paid' then do2.platform_amount else 0 end),0) as platform_earned
from nutritionists n
left join diet_plans dp on dp.nutritionist_id=n.id
left join diet_orders do2 on do2.nutritionist_id=n.id
group by n.id, n.name, n.email, n.speciality, n.status, n.rating, n.commission_pct;

-- ─── AUTO INVOICE ────────────────────────────────────────
create or replace function set_invoice_gym() returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from payments where gym_id=new.gym_id;
  new.invoice_number := 'GYM-'||lpad(v_n::text,4,'0');
  return new;
end; $$ language plpgsql;

create or replace function set_invoice_diet() returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from diet_orders;
  new.invoice_number := 'DIET-'||lpad(v_n::text,4,'0');
  return new;
end; $$ language plpgsql;

create or replace function set_invoice_product() returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from product_orders;
  new.invoice_number := 'SHOP-'||lpad(v_n::text,4,'0');
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_inv_gym  on payments;
drop trigger if exists trg_inv_diet on diet_orders;
drop trigger if exists trg_inv_prod on product_orders;

create trigger trg_inv_gym  before insert on payments      for each row execute function set_invoice_gym();
create trigger trg_inv_diet before insert on diet_orders   for each row execute function set_invoice_diet();
create trigger trg_inv_prod before insert on product_orders for each row execute function set_invoice_product();

-- ─── AUTO CALC DIET ORDER AMOUNTS ────────────────────────
create or replace function calc_diet_order() returns trigger as $$
declare v_pct int;
begin
  select commission_pct into v_pct from nutritionists where id=new.nutritionist_id;
  new.nutritionist_amount := round(new.amount * v_pct / 100.0);
  new.platform_amount     := new.amount - new.nutritionist_amount;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_diet_calc on diet_orders;
create trigger trg_diet_calc before insert on diet_orders
  for each row execute function calc_diet_order();

-- ─── AUTO CALC PRODUCT ORDER AMOUNTS ─────────────────────
create or replace function calc_product_order() returns trigger as $$
declare v_pct int;
begin
  select commission_pct into v_pct from products where id=new.product_id;
  new.platform_amount := round(new.total_amount * v_pct / 100.0);
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_prod_calc on product_orders;
create trigger trg_prod_calc before insert on product_orders
  for each row execute function calc_product_order();

-- ─── FUNCTIONS ───────────────────────────────────────────
create or replace function set_invoice_number() returns trigger as $$
declare v_n int;
begin
  select count(*)+1 into v_n from payments where gym_id=new.gym_id;
  new.invoice_number := 'INV-'||lpad(v_n::text,4,'0');
  return new;
end; $$ language plpgsql;

create or replace function get_gym_stats(p_gym_id uuid) returns jsonb as $$
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

create or replace function process_qr_checkin(p_qr_code text, p_gym_id uuid) returns jsonb as $$
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

create or replace function upd_at() returns trigger as $$ begin new.updated_at=now(); return new; end; $$ language plpgsql;

-- ─── RLS ─────────────────────────────────────────────────
alter table gyms                     enable row level security;
alter table gym_users                enable row level security;
alter table plans                    enable row level security;
alter table members                  enable row level security;
alter table memberships              enable row level security;
alter table payments                 enable row level security;
alter table check_ins                enable row level security;
alter table applications             enable row level security;
alter table platform_admins          enable row level security;
alter table nutritionists            enable row level security;
alter table diet_plans               enable row level security;
alter table diet_orders              enable row level security;
alter table nutritionist_applications enable row level security;
alter table products                 enable row level security;
alter table product_orders           enable row level security;
alter table product_categories       enable row level security;
alter table workout_plans            enable row level security;
alter table workout_sessions         enable row level security;
alter table exercises                enable row level security;
alter table workout_logs             enable row level security;

create or replace function my_gym_id() returns uuid as $$
  select gym_id from gym_users where auth_id=auth.uid() and is_active=true limit 1;
$$ language sql security definer stable;

create or replace function is_platform_admin() returns boolean as $$
  select exists(select 1 from platform_admins where auth_id=auth.uid());
$$ language sql security definer stable;

create or replace function my_nutritionist_id() returns uuid as $$
  select id from nutritionists where auth_id=auth.uid() limit 1;
$$ language sql security definer stable;

create or replace function my_member_id() returns uuid as $$
  select id from members where auth_id=auth.uid() limit 1;
$$ language sql security definer stable;

-- Gym policies
drop policy if exists "gym_sel" on gyms;
drop policy if exists "gym_upd" on gyms;
drop policy if exists "gym_ins" on gyms;
create policy "gym_sel" on gyms for select using (id=my_gym_id() or is_platform_admin());
create policy "gym_upd" on gyms for update using (id=my_gym_id() or is_platform_admin());
create policy "gym_ins" on gyms for insert with check (is_platform_admin());

-- Gym users
drop policy if exists "gu_all" on gym_users;
create policy "gu_all" on gym_users for all using (gym_id=my_gym_id() or is_platform_admin());

-- Plans, members, memberships, payments, check-ins
drop policy if exists "pl_all" on plans;
drop policy if exists "mb_all" on members;
drop policy if exists "ms_all" on memberships;
drop policy if exists "py_all" on payments;
drop policy if exists "ci_all" on check_ins;
create policy "pl_all" on plans       for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "mb_all" on members     for all using (gym_id=my_gym_id() or is_platform_admin() or auth_id=auth.uid());
create policy "ms_all" on memberships for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "py_all" on payments    for all using (gym_id=my_gym_id() or is_platform_admin());
create policy "ci_all" on check_ins   for all using (gym_id=my_gym_id() or is_platform_admin());

-- Applications
drop policy if exists "app_ins" on applications;
drop policy if exists "app_adm" on applications;
create policy "app_ins" on applications for insert with check (true);
create policy "app_adm" on applications for select using (is_platform_admin());
create policy "app_upd" on applications for update using (is_platform_admin());

-- Platform admins
drop policy if exists "pa_all" on platform_admins;
create policy "pa_all" on platform_admins for all using (is_platform_admin() or auth_id=auth.uid());

-- Nutritionists
drop policy if exists "nutr_sel" on nutritionists;
drop policy if exists "nutr_upd" on nutritionists;
drop policy if exists "nutr_ins" on nutritionists;
create policy "nutr_sel" on nutritionists for select using (true);
create policy "nutr_upd" on nutritionists for update using (auth_id=auth.uid() or is_platform_admin());
create policy "nutr_ins" on nutritionists for insert with check (is_platform_admin());

-- Diet plans
drop policy if exists "dp_sel" on diet_plans;
drop policy if exists "dp_mod" on diet_plans;
create policy "dp_sel" on diet_plans for select using (true);
create policy "dp_mod" on diet_plans for all using (nutritionist_id=my_nutritionist_id() or is_platform_admin());

-- Diet orders
drop policy if exists "do_ins" on diet_orders;
drop policy if exists "do_sel" on diet_orders;
create policy "do_ins" on diet_orders for insert with check (true);
create policy "do_sel" on diet_orders for select using (nutritionist_id=my_nutritionist_id() or is_platform_admin() or member_id=my_member_id());
create policy "do_upd" on diet_orders for update using (is_platform_admin());

-- Nutritionist applications
drop policy if exists "na_ins" on nutritionist_applications;
drop policy if exists "na_adm" on nutritionist_applications;
create policy "na_ins" on nutritionist_applications for insert with check (true);
create policy "na_adm" on nutritionist_applications for all using (is_platform_admin());

-- Products
drop policy if exists "prod_sel" on products;
drop policy if exists "prod_adm" on products;
create policy "prod_sel" on products for select using (true);
create policy "prod_adm" on products for all using (is_platform_admin());

-- Product orders
drop policy if exists "po_ins" on product_orders;
drop policy if exists "po_sel" on product_orders;
create policy "po_ins" on product_orders for insert with check (true);
create policy "po_sel" on product_orders for select using (is_platform_admin() or gym_id=my_gym_id());
create policy "po_upd" on product_orders for update using (is_platform_admin());

-- Product categories
drop policy if exists "pc_sel" on product_categories;
create policy "pc_sel" on product_categories for select using (true);
create policy "pc_adm" on product_categories for all using (is_platform_admin());

-- Workout plans
drop policy if exists "wp_all" on workout_plans;
create policy "wp_all" on workout_plans for all using (gym_id=my_gym_id() or is_platform_admin() or member_id=my_member_id());
create policy "ws_all" on workout_sessions for all using (true);
create policy "ex_all" on exercises for all using (true);
create policy "wl_all" on workout_logs for all using (member_id=my_member_id() or is_platform_admin());

-- ─── SAMPLE PRODUCTS ─────────────────────────────────────
insert into products (name, description, price, stock, brand, weight, is_featured, commission_pct, category_id)
select 'Proteinë Whey', 'Proteinë me cilësi të lartë, 24g proteina/serving', 4500, 50, 'MyProtein', '1kg', true, 30, id from product_categories where name='Suplementa' limit 1
on conflict do nothing;

insert into products (name, description, price, stock, brand, is_featured, commission_pct, category_id)
select 'Bluzë Sportive Vaqo', 'Bluzë premium me logo Vaqo', 1500, 100, 'Vaqo', false, 30, id from product_categories where name='Veshje Sportive' limit 1
on conflict do nothing;

insert into products (name, description, price, stock, brand, is_featured, commission_pct, category_id)
select 'Doreza Gome', 'Doreza për stërvitje pesëngritje', 800, 30, 'ProGrip', false, 30, id from product_categories where name='Aksesorë' limit 1
on conflict do nothing;

select 'Vaqo Ecosystem Schema ✅ U Instalua me Sukses!' as rezultati;

-- ─── DEMO REQUESTS ────────────────────────────────────────
create table if not exists demo_requests (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  phone           text not null,
  email           text,
  biz_type        text,
  biz_name        text,
  city            text,
  preferred_hours text[],
  message         text,
  status          text default 'new' check (status in ('new','contacted','done','cancelled')),
  notes           text,
  created_at      timestamptz default now()
);
alter table demo_requests enable row level security;
create policy "demo_ins" on demo_requests for insert with check (true);
create policy "demo_sel" on demo_requests for select using (is_platform_admin());
create policy "demo_upd" on demo_requests for update using (is_platform_admin());

-- ── ANALYTICS: Add last_checkin to members ───────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_checkin timestamptz;

-- Auto-update last_checkin when checkin happens
CREATE OR REPLACE FUNCTION update_last_checkin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE members SET last_checkin = NEW.created_at WHERE id = NEW.member_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_checkin_update_member ON checkins;
CREATE TRIGGER on_checkin_update_member
  AFTER INSERT ON checkins
  FOR EACH ROW EXECUTE FUNCTION update_last_checkin();

-- View: members_with_status (used by analytics)
CREATE OR REPLACE VIEW members_with_status AS
SELECT
  m.*,
  mm.end_date AS membership_end,
  mm.status AS membership_status,
  p.name AS plan_name,
  EXTRACT(DAY FROM (mm.end_date - NOW()))::int AS days_remaining
FROM members m
LEFT JOIN member_memberships mm ON mm.member_id = m.id AND mm.status = 'active'
LEFT JOIN plans p ON p.id = mm.plan_id;

-- ── ONBOARDING ────────────────────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS onboarding_done boolean DEFAULT false;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS onboarding_step int DEFAULT 1;

-- ── APPOINTMENTS is_test ──────────────────────────────────
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;

-- ── AFFILIATE PROGRAM ─────────────────────────────────────

-- Referral codes for each gym
create table if not exists affiliate_codes (
  id           uuid primary key default uuid_generate_v4(),
  gym_id       uuid references gyms(id) on delete cascade,
  code         text unique not null,  -- e.g. "FITZONE20"
  clicks       int default 0,
  created_at   timestamptz default now()
);

-- Each referral relationship
create table if not exists referrals (
  id              uuid primary key default uuid_generate_v4(),
  referrer_gym_id uuid references gyms(id),   -- who referred
  referred_gym_id uuid references gyms(id),   -- who signed up
  code            text not null,
  status          text default 'pending'       -- pending|active|cancelled
    check (status in ('pending','active','cancelled')),
  commission_pct  int default 10,
  created_at      timestamptz default now(),
  activated_at    timestamptz
);

-- Monthly commission payments
create table if not exists affiliate_payments (
  id              uuid primary key default uuid_generate_v4(),
  referrer_gym_id uuid references gyms(id),
  referred_gym_id uuid references gyms(id),
  referral_id     uuid references referrals(id),
  month           text not null,               -- "2026-01"
  referred_plan   text,
  plan_price      int,
  commission_pct  int default 10,
  commission_amt  int not null,                -- në L
  status          text default 'pending'
    check (status in ('pending','paid','cancelled')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz default now()
);

-- RLS
alter table affiliate_codes    enable row level security;
alter table referrals          enable row level security;
alter table affiliate_payments enable row level security;

-- Gym sees own affiliate data
create policy "aff_code_own"  on affiliate_codes    for all using (gym_id = get_gym_id());
create policy "aff_ref_own"   on referrals          for all using (referrer_gym_id = get_gym_id());
create policy "aff_pay_own"   on affiliate_payments for all using (referrer_gym_id = get_gym_id());
-- Admin sees all
create policy "aff_code_adm"  on affiliate_codes    for all using (is_platform_admin());
create policy "aff_ref_adm"   on referrals          for all using (is_platform_admin());
create policy "aff_pay_adm"   on affiliate_payments for all using (is_platform_admin());

-- Auto-generate referral code when gym is approved
create or replace function generate_affiliate_code()
returns trigger as $$
declare
  code text;
  base text;
begin
  if new.status = 'approved' and old.status != 'approved' then
    base := upper(regexp_replace(new.name, '[^A-Za-z0-9]', '', 'g'));
    base := substring(base, 1, 6);
    code := base || floor(random()*90+10)::text;
    insert into affiliate_codes(gym_id, code) values(new.id, code)
    on conflict(code) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_gym_approved_affiliate on gyms;
create trigger on_gym_approved_affiliate
  after update on gyms for each row execute function generate_affiliate_code();

-- View: affiliate summary per gym
create or replace view affiliate_summary as
select
  ac.gym_id,
  ac.code,
  ac.clicks,
  count(r.id) filter (where r.status='active')  as active_referrals,
  count(r.id)                                    as total_referrals,
  coalesce(sum(ap.commission_amt) filter (where ap.status='paid'),0)    as total_earned,
  coalesce(sum(ap.commission_amt) filter (where ap.status='pending'),0) as pending_earnings
from affiliate_codes ac
left join referrals r          on r.referrer_gym_id = ac.gym_id
left join affiliate_payments ap on ap.referrer_gym_id = ac.gym_id
group by ac.gym_id, ac.code, ac.clicks;

-- ── SLUG FOR PUBLIC BOOKING ───────────────────────────────
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS slug text unique;

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_gym_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM gyms WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_gym_slug ON gyms;
CREATE TRIGGER set_gym_slug BEFORE INSERT OR UPDATE OF name ON gyms
  FOR EACH ROW WHEN (NEW.slug IS NULL) EXECUTE FUNCTION generate_gym_slug();

-- Backfill existing gyms
UPDATE gyms SET name = name WHERE slug IS NULL;

-- ── FIX: Shto kolona që mungojnë ─────────────────────────
ALTER TABLE applications ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS owner_name text;
-- Riemëro status check constraint (lejon edhe 'pending')
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD CONSTRAINT applications_status_check 
  CHECK (status IN ('new','pending','contacted','approved','rejected'));

-- ── WAITLIST TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid primary key default uuid_generate_v4(),
  gym_id      uuid references gyms(id) on delete cascade,
  name        text not null,
  phone       text not null,
  email       text,
  class_name  text,
  notes       text,
  status      text default 'waiting' check (status in ('waiting','contacted','confirmed','cancelled')),
  created_at  timestamptz default now()
);
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_gym" ON waitlist USING (
  gym_id IN (SELECT gym_id FROM gym_users WHERE auth_id = auth.uid())
);

-- ── FIX staff_id nullable ─────────────────────────────────
-- Barbershop/Salon mund të kenë rezervim pa specifikuar staf
ALTER TABLE appointments ALTER COLUMN staff_id DROP NOT NULL;
ALTER TABLE appointments ALTER COLUMN service_id DROP NOT NULL;
