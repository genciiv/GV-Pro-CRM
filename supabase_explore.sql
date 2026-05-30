-- ============================================================
-- FITPRO — Explore / Marketplace
-- Ekzekuto: Supabase → SQL Editor → Run
-- ============================================================

-- Shto kolona te gyms
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS slug           text unique;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS description    text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS logo_url       text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS cover_url      text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS rating         numeric(3,2) default 0;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS review_count   int default 0;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS is_public      boolean default true;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS working_hours  jsonb default '{"Mon":"09:00-19:00","Tue":"09:00-19:00","Wed":"09:00-19:00","Thu":"09:00-19:00","Fri":"09:00-19:00","Sat":"09:00-17:00"}'::jsonb;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS social_instagram text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS social_facebook  text;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS website          text;

-- Auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name text, city text)
RETURNS text AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 0;
BEGIN
  base_slug := lower(
    regexp_replace(
      translate(name || '-' || coalesce(city,''),
        'ëÿüöäáéíóúàèìòùâêîôûãñõÄÖÜÁÉÍÓÚÀÈÌÒÙ',
        'eyuoaaeioua eiouaeiouanoAOUAEIOUAEIOU'
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM gyms WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Set slugs for existing gyms
UPDATE gyms SET slug = generate_slug(name, city)
WHERE slug IS NULL;

-- Auto-set slug on insert
CREATE OR REPLACE FUNCTION set_gym_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name, NEW.city);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gym_slug ON gyms;
CREATE TRIGGER trg_gym_slug
  BEFORE INSERT ON gyms
  FOR EACH ROW EXECUTE FUNCTION set_gym_slug();

-- Reviews tabela
CREATE TABLE IF NOT EXISTS gym_reviews (
  id         uuid primary key default uuid_generate_v4(),
  gym_id     uuid not null references gyms(id) on delete cascade,
  member_id  uuid references members(id) on delete set null,
  client_name text not null,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  is_public  boolean default true,
  created_at timestamptz default now()
);
CREATE INDEX IF NOT EXISTS idx_rev_gym ON gym_reviews(gym_id);

-- Auto-update rating
CREATE OR REPLACE FUNCTION update_gym_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE gyms SET
    rating = (SELECT round(avg(rating)::numeric, 2) FROM gym_reviews WHERE gym_id = NEW.gym_id AND is_public = true),
    review_count = (SELECT count(*) FROM gym_reviews WHERE gym_id = NEW.gym_id AND is_public = true)
  WHERE id = NEW.gym_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gym_rating ON gym_reviews;
CREATE TRIGGER trg_gym_rating
  AFTER INSERT OR UPDATE ON gym_reviews
  FOR EACH ROW EXECUTE FUNCTION update_gym_rating();

-- Public explore view
CREATE OR REPLACE VIEW public_businesses AS
SELECT
  g.id, g.slug, g.name, g.city, g.address, g.phone, g.email,
  g.business_type, g.description, g.logo_url, g.cover_url,
  g.rating, g.review_count, g.working_hours,
  g.social_instagram, g.social_facebook, g.website,
  (SELECT count(*) FROM staff s WHERE s.gym_id = g.id AND s.is_active = true) as staff_count,
  (SELECT count(*) FROM services sv WHERE sv.gym_id = g.id AND sv.is_active = true) as service_count,
  (SELECT json_agg(json_build_object('name',sv.name,'price',sv.price,'duration',sv.duration_min,'emoji',sv.emoji))
   FROM (SELECT * FROM services WHERE gym_id = g.id AND is_active = true ORDER BY sort_order LIMIT 4) sv) as top_services
FROM gyms g
WHERE g.status = 'approved' AND g.is_public = true;

-- RLS
ALTER TABLE gym_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rev_sel" ON gym_reviews FOR SELECT USING (is_public = true OR gym_id = my_gym_id() OR is_platform_admin());
CREATE POLICY "rev_ins" ON gym_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "rev_adm" ON gym_reviews FOR UPDATE USING (is_platform_admin() OR gym_id = my_gym_id());

SELECT 'Explore Schema ✅' as rezultati;

-- Shto koordinatat GPS (opsionale - për precizion)
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS lat  numeric(10,7);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS lng  numeric(10,7);
