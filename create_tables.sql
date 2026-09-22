-- ================================================
-- GASC Idappadi Sports — New Tables Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ================================================

-- TABLE 1: External Sports Competitions
CREATE TABLE IF NOT EXISTS external_competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT DEFAULT 'General',
  level TEXT DEFAULT 'Inter-College',
  type TEXT DEFAULT 'Individual',
  organizer TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  district TEXT DEFAULT '',
  state TEXT DEFAULT 'Tamil Nadu',
  start_date DATE,
  end_date DATE,
  registration_start_date DATE,
  registration_deadline DATE,
  eligibility TEXT DEFAULT '',
  age_limit TEXT DEFAULT '',
  gender TEXT DEFAULT 'All',
  participation_type TEXT DEFAULT 'Individual',
  description TEXT DEFAULT '',
  announcement_summary TEXT DEFAULT '',
  source_name TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  registration_url TEXT DEFAULT '',
  image TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Draft',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: Sports News & Announcements
CREATE TABLE IF NOT EXISTS sports_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  short_summary TEXT NOT NULL DEFAULT '',
  full_description TEXT DEFAULT '',
  sport TEXT DEFAULT 'General',
  category TEXT DEFAULT 'General Sports News',
  source_name TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  published_date DATE DEFAULT CURRENT_DATE,
  image TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Draft',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('external_competitions', 'sports_news');
