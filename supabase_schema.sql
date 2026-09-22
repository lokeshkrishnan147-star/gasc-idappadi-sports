-- =====================================================================
-- 🏆 GASC IDAPPADI - SMART SPORTS MANAGEMENT SYSTEM
-- 🏛️ Government Arts and Science College, Idappadi
-- 🗄️ SUPABASE / POSTGRESQL COMPLETE DATABASE SCHEMA
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Students, Staff & Admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    register_number VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    department VARCHAR(255) DEFAULT 'General',
    year VARCHAR(50) DEFAULT 'I Year' CHECK (year IN ('I Year', 'II Year', 'III Year', 'Faculty', 'Other')),
    section VARCHAR(10) DEFAULT 'A',
    gender VARCHAR(20) DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    dob DATE,
    mobile VARCHAR(50),
    profile_photo TEXT DEFAULT '/images/default-avatar.png',
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SPORTS TABLE
CREATE TABLE IF NOT EXISTS sports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Team Sport' CHECK (category IN ('Team Sport', 'Individual Sport', 'Athletics & Track', 'Indoor Games')),
    indoor_outdoor VARCHAR(50) DEFAULT 'Outdoor' CHECK (indoor_outdoor IN ('Indoor', 'Outdoor', 'Both')),
    player_count INTEGER DEFAULT 11,
    equipment_required TEXT[] DEFAULT '{}',
    rules TEXT,
    coach VARCHAR(255) DEFAULT 'Physical Director',
    image TEXT DEFAULT '/images/sports/default.jpg',
    icon VARCHAR(100) DEFAULT 'bi-trophy',
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLAYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS player_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    primary_sport UUID REFERENCES sports(id) ON DELETE SET NULL,
    secondary_sports UUID[] DEFAULT '{}',
    position VARCHAR(100) DEFAULT 'All Rounder',
    jersey_number INTEGER DEFAULT 7,
    playing_level VARCHAR(100) DEFAULT 'College Level' CHECK (playing_level IN ('College Level', 'District Level', 'Zonal Level', 'University Level', 'State Level', 'National Level')),
    experience VARCHAR(100) DEFAULT '1 Year',
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    score_points INTEGER DEFAULT 0,
    awards_count INTEGER DEFAULT 0,
    competitions_participated INTEGER DEFAULT 0,
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    sport_name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Balls & Shuttles' CHECK (category IN ('Balls & Shuttles', 'Bats & Rackets', 'Protective Gear', 'Nets & Goals', 'Track & Field Gear', 'Training & Cones', 'Board & Accessories')),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    issued_quantity INTEGER DEFAULT 0,
    damaged_quantity INTEGER DEFAULT 0,
    lost_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 5,
    purchase_date DATE DEFAULT CURRENT_DATE,
    purchase_price NUMERIC(10, 2) DEFAULT 0.00,
    supplier VARCHAR(255) DEFAULT 'Salem Sports Goods Co.',
    storage_location VARCHAR(255) DEFAULT 'Main Sports Room, Rack A1',
    condition VARCHAR(100) DEFAULT 'Good' CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Needs Maintenance')),
    warranty VARCHAR(100) DEFAULT '1 Year',
    status VARCHAR(100) DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock', 'Under Maintenance')),
    description TEXT,
    image TEXT DEFAULT '/images/equipment/default.jpg',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EQUIPMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS equipment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    register_number VARCHAR(100),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    equipment_name VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    expected_return_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned', 'Damaged', 'Lost', 'Overdue')),
    return_condition VARCHAR(100) DEFAULT 'Pending' CHECK (return_condition IN ('Good', 'Damaged', 'Lost', 'Partially Damaged', 'Pending')),
    damage_description TEXT,
    fine_amount NUMERIC(10, 2) DEFAULT 0.00,
    purpose VARCHAR(255) DEFAULT 'College Practice / Match',
    remarks TEXT,
    issued_by VARCHAR(255) DEFAULT 'Sports Incharge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMPETITIONS TABLE
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    sport_name VARCHAR(255),
    type VARCHAR(100) DEFAULT 'Inter-College' CHECK (type IN ('Inter-Department', 'Inter-College', 'District', 'State', 'University', 'National', 'Friendly Match')),
    level VARCHAR(100) DEFAULT 'College' CHECK (level IN ('Department', 'College', 'District', 'Zonal', 'University', 'State', 'National')),
    venue VARCHAR(255) NOT NULL DEFAULT 'GASC Idappadi Sports Ground',
    date TIMESTAMPTZ NOT NULL,
    start_time VARCHAR(50) DEFAULT '09:00 AM',
    end_time VARCHAR(50) DEFAULT '05:00 PM',
    registration_start TIMESTAMPTZ DEFAULT NOW(),
    registration_end TIMESTAMPTZ NOT NULL,
    organizer VARCHAR(255) DEFAULT 'GASC Idappadi Sports Board',
    eligibility TEXT DEFAULT 'All enrolled undergraduate and postgraduate students',
    max_participants INTEGER DEFAULT 50,
    current_registrations INTEGER DEFAULT 0,
    description TEXT,
    banner_image TEXT DEFAULT '/images/competitions/default.jpg',
    status VARCHAR(100) DEFAULT 'Registration Open' CHECK (status IN ('Upcoming', 'Registration Open', 'Registration Closed', 'Ongoing', 'Completed', 'Cancelled')),
    result_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMPETITION REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS competition_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    preferred_position VARCHAR(100),
    remarks TEXT,
    admin_remarks TEXT,
    reviewed_at TIMESTAMPTZ,
    UNIQUE (competition_id, student_id)
);

-- 8. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captain_name VARCHAR(255) NOT NULL,
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    sport_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year VARCHAR(50) NOT NULL DEFAULT 'I Year' CHECK (year IN ('I Year', 'II Year', 'III Year', 'I PG', 'II PG')),
    phone VARCHAR(50) DEFAULT '',
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255),
    register_number VARCHAR(100),
    department VARCHAR(255),
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    sport_name VARCHAR(255),
    competition_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
    competition_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    position VARCHAR(255) DEFAULT 'Winner / 1st Place',
    medal VARCHAR(100) DEFAULT 'Gold' CHECK (medal IN ('Gold', 'Silver', 'Bronze', 'Participation / Trophy', 'None')),
    year VARCHAR(50) DEFAULT '2025 - 2026',
    date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    certificate TEXT,
    photo TEXT DEFAULT '/images/achievements/default.jpg',
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General' CHECK (category IN ('Competition', 'Practice', 'Equipment', 'Team Selection', 'General', 'Urgent')),
    target_type VARCHAR(100) DEFAULT 'All Students' CHECK (target_type IN ('All Students', 'Specific Sport', 'Specific Team', 'Specific Student')),
    target_id UUID,
    target_model VARCHAR(50) CHECK (target_model IN ('User', 'Sport', 'Team', 'Competition')),
    priority VARCHAR(50) DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    read_by UUID[] DEFAULT '{}',
    sender VARCHAR(255) DEFAULT 'Sports Incharge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sport_id UUID REFERENCES sports(id) ON DELETE SET NULL,
    sport_name VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Tournaments' CHECK (category IN ('Tournaments', 'Annual Sports Day', 'Practice Sessions', 'Prize Distribution', 'Campus Facilities', 'General')),
    image TEXT NOT NULL DEFAULT '/images/gallery/default.jpg',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PRACTICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL DEFAULT 'Sports Practice Session',
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    sport_name VARCHAR(255),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    team_name VARCHAR(255),
    date DATE NOT NULL,
    start_time VARCHAR(50) NOT NULL DEFAULT '06:30 AM',
    end_time VARCHAR(50) NOT NULL DEFAULT '08:00 AM',
    venue VARCHAR(255) NOT NULL DEFAULT 'College Main Ground',
    coach VARCHAR(255) DEFAULT 'Physical Director',
    focus_area TEXT DEFAULT 'Fitness, drills, and match simulations',
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    date DATE NOT NULL,
    remarks TEXT,
    recorded_by VARCHAR(255) DEFAULT 'Sports Incharge',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (practice_session_id, student_id)
);

-- 14. COLLEGE STUDENT ROSTER TABLE (Pre-registered list for validation)
CREATE TABLE IF NOT EXISTS college_student_roster (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    register_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year VARCHAR(50) DEFAULT 'I Year' CHECK (year IN ('I Year', 'II Year', 'III Year')),
    section VARCHAR(10) DEFAULT 'A',
    gender VARCHAR(20) DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    college_name VARCHAR(255) DEFAULT 'Government Arts and Science College, Idappadi',
    is_registered BOOLEAN DEFAULT FALSE,
    registered_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ADMIN SETTINGS TABLE
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_name VARCHAR(255) DEFAULT 'Government Arts and Science College, Idappadi',
    department_name VARCHAR(255) DEFAULT 'Department of Physical Education & Sports',
    sports_incharge_name VARCHAR(255) DEFAULT 'Dr. K. Malathi, M.P.Ed., M.Phil., Ph.D.',
    sports_incharge_role VARCHAR(255) DEFAULT 'Physical Directress & Sports Incharge',
    email VARCHAR(255) DEFAULT 'sports@gascidappadi.edu.in',
    phone VARCHAR(100) DEFAULT '+91 94432 18765',
    address TEXT DEFAULT 'Government Arts and Science College, Idappadi, Salem District - 637101, Tamil Nadu',
    office_hours VARCHAR(255) DEFAULT '08:30 AM - 05:30 PM (Mon - Sat)',
    auto_notifications BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INITIAL SEED DATA (Admin, Sports, Settings)
-- =====================================================================

-- Insert Default Admin Settings
INSERT INTO admin_settings (college_name, department_name, sports_incharge_name, sports_incharge_role, email, phone)
VALUES (
    'Government Arts and Science College, Idappadi',
    'Department of Physical Education & Sports',
    'Dr. K. Malathi, M.P.Ed., M.Phil., Ph.D.',
    'Physical Directress & Sports Incharge',
    'sports@gascidappadi.edu.in',
    '+91 94432 18765'
) ON CONFLICT DO NOTHING;

-- Insert Default Sports
INSERT INTO sports (name, category, indoor_outdoor, player_count, coach, description)
VALUES 
    ('Kabaddi', 'Team Sport', 'Outdoor', 7, 'Dr. K. Malathi', 'Traditional contact sport of Tamil Nadu with vibrant collegiate tournaments.'),
    ('Cricket', 'Team Sport', 'Outdoor', 11, 'Dr. K. Malathi', 'Collegiate cricket matches and university championship series.'),
    ('Volleyball', 'Team Sport', 'Outdoor', 6, 'Dr. K. Malathi', 'Inter-department and zonal level volleyball tournaments.'),
    ('Kho-Kho', 'Team Sport', 'Outdoor', 9, 'Dr. K. Malathi', 'Fast-paced traditional tag sport fostering agile teamwork.'),
    ('Athletics (100m, 200m, Relay)', 'Athletics & Track', 'Outdoor', 1, 'Dr. K. Malathi', 'Annual track and field events across all student departments.'),
    ('Chess', 'Indoor Games', 'Indoor', 1, 'Dr. K. Malathi', 'Strategic board game championships held at the college recreation hall.'),
    ('Badminton', 'Indoor Games', 'Indoor', 2, 'Dr. K. Malathi', 'Singles and doubles indoor badminton tournaments.')
ON CONFLICT (name) DO NOTHING;
