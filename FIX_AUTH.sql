-- ============================================================
-- FITPRO — FIX AUTH (Ekzekuto këtë TANI)
-- Supabase → SQL Editor → Run
-- ============================================================

-- STEP 1: Lidh platform admin me auth user
UPDATE platform_admins
SET auth_id = (
  SELECT id FROM auth.users 
  WHERE email = platform_admins.email 
  LIMIT 1
)
WHERE auth_id IS NULL;

-- STEP 2: Lidh gym_users me auth users (me email)
UPDATE gym_users
SET auth_id = au.id
FROM auth.users au
WHERE gym_users.email = au.email
  AND gym_users.auth_id IS NULL;

-- STEP 3: Kontrollo rezultatin
SELECT 
  'platform_admins' as tabela,
  email,
  CASE WHEN auth_id IS NOT NULL THEN '✅ OK - mund të hyjë' ELSE '❌ auth_id NULL - nuk mund të hyjë' END as statusi,
  auth_id
FROM platform_admins

UNION ALL

SELECT 
  'gym_users (' || g.name || ')' as tabela,
  gu.email,
  CASE WHEN gu.auth_id IS NOT NULL THEN '✅ OK - mund të hyjë' ELSE '❌ auth_id NULL - nuk mund të hyjë' END as statusi,
  gu.auth_id
FROM gym_users gu
JOIN gyms g ON g.id = gu.gym_id;
