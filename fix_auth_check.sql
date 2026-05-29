-- ============================================================
-- FITPRO — FIX AUTH + SHIKO STATUSIN
-- Ekzekuto këtë në Supabase → SQL Editor → Run
-- ============================================================

-- SHIKO çfarë ka tani
select 'platform_admins' as tabela, id, auth_id, email, name from platform_admins
union all
select 'gym_users', id, auth_id, email, name from gym_users;

-- SHIKO userat në auth
select id as auth_uuid, email, created_at from auth.users order by created_at desc;
