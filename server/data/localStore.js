const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'local_db.json');

function getInitialData() {
  const adminHashed = bcrypt.hashSync('admin123', 10);
  const studentHashed = bcrypt.hashSync('student123', 10);

  const sports = [
    {
      id: 'sp_cricket_01',
      name: 'Cricket',
      description: 'Men & Women collegiate cricket with standard turf and matting wickets.',
      category: 'Team Sport',
      indoor_outdoor: 'Outdoor',
      player_count: 11,
      equipment_required: ['Cricket Bats', 'Leather Balls', 'Wickets & Bails', 'Batting Pads', 'Helmets'],
      coach: 'Dr. R. Anitha / Coach R. Selvan',
      icon: 'bi-trophy',
      image: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_volleyball_02',
      name: 'Volleyball',
      description: 'Standard clay and synthetic court volleyball coaching and university competitions.',
      category: 'Team Sport',
      indoor_outdoor: 'Outdoor',
      player_count: 6,
      equipment_required: ['Volleyballs', 'Heavy-Duty Net', 'Antennae', 'Knee Guards'],
      coach: 'Dr. R. Anitha',
      icon: 'bi-circle',
      image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_football_03',
      name: 'Football',
      description: 'Standard 11-a-side football field, tactical drills, and inter-collegiate tournaments.',
      category: 'Team Sport',
      indoor_outdoor: 'Outdoor',
      player_count: 11,
      equipment_required: ['Footballs', 'Goal Nets', 'Agility Cones', 'Shin Guards', 'Corner Flags'],
      coach: 'Coach S. Murugan',
      icon: 'bi-dribbble',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_kabaddi_04',
      name: 'Kabaddi',
      description: 'Traditional mat Kabaddi team, state zonal champions and university finalists.',
      category: 'Team Sport',
      indoor_outdoor: 'Both',
      player_count: 7,
      equipment_required: ['Kabaddi Mat', 'Knee & Ankle Supports', 'Grip Powders'],
      coach: 'Dr. R. Anitha',
      icon: 'bi-shield-shaded',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_badminton_05',
      name: 'Badminton',
      description: 'Indoor wooden court badminton training for singles and doubles.',
      category: 'Individual Sport',
      indoor_outdoor: 'Indoor',
      player_count: 2,
      equipment_required: ['Carbon Graphite Rackets', 'Feather Shuttles', 'Nets', 'Court Shoes'],
      coach: 'Dr. R. Anitha',
      icon: 'bi-lightning-charge',
      image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_athletics_06',
      name: 'Athletics & Track',
      description: '400m track running, sprints, relays, long jump, shot put, and javelin.',
      category: 'Athletics & Track',
      indoor_outdoor: 'Outdoor',
      player_count: 1,
      equipment_required: ['Starting Blocks', 'Relay Batons', 'Shot Put', 'Javelin', 'Measuring Tapes'],
      coach: 'Dr. R. Anitha',
      icon: 'bi-stopwatch',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sp_chess_07',
      name: 'Chess',
      description: 'Strategic mind sports club, FIDE rated tournament coaching.',
      category: 'Indoor Games',
      indoor_outdoor: 'Indoor',
      player_count: 1,
      equipment_required: ['Tournament Chess Boards', 'DGT Digital Clocks', 'Notation Sheets'],
      coach: 'Prof. T. Ramanathan',
      icon: 'bi-suit-spade',
      image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=600&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const users = [
    {
      id: 'user_admin_01',
      name: 'Dr. R. ANITHA (Sports Incharge)',
      register_number: 'ADMIN-SPORTS',
      email: 'admin@gascidappadi.edu.in',
      password: adminHashed,
      role: 'admin',
      department: 'Physical Education',
      year: 'Faculty',
      section: 'A',
      gender: 'Female',
      mobile: '+91 94432 18765',
      profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'user_student_01',
      name: 'Arun Kumar S',
      register_number: '23UGCS101',
      email: 'arun.cs@gascidappadi.edu.in',
      password: studentHashed,
      role: 'student',
      department: 'Computer Science',
      year: 'II Year',
      section: 'A',
      gender: 'Male',
      mobile: '+91 98421 54321',
      profile_photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'user_student_02',
      name: 'Priya Dharshini R',
      register_number: '23UGCS102',
      email: 'priya.cs@gascidappadi.edu.in',
      password: studentHashed,
      role: 'student',
      department: 'Computer Science',
      year: 'II Year',
      section: 'A',
      gender: 'Female',
      mobile: '+91 97890 12345',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'user_student_03',
      name: 'Karthik Raja M',
      register_number: '24UGCO205',
      email: 'karthik.com@gascidappadi.edu.in',
      password: studentHashed,
      role: 'student',
      department: 'Commerce',
      year: 'I Year',
      section: 'B',
      gender: 'Male',
      mobile: '+91 98943 67890',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'user_student_04',
      name: 'Deepa Lakshmi K',
      register_number: '22UGMA310',
      email: 'deepa.maths@gascidappadi.edu.in',
      password: studentHashed,
      role: 'student',
      department: 'Mathematics',
      year: 'III Year',
      section: 'A',
      gender: 'Female',
      mobile: '+91 96554 32109',
      profile_photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const player_profiles = [
    {
      id: 'prof_01',
      user_id: 'user_student_01',
      primary_sport: 'sp_cricket_01',
      position: 'Captain & Top-Order Batsman',
      jersey_number: 7,
      playing_level: 'University Level',
      experience: '3 Years',
      matches_played: 14,
      matches_won: 11,
      matches_lost: 3,
      score_points: 486,
      awards_count: 3,
      competitions_participated: 5,
      bio: 'Passionate collegiate cricketer and top-order batsman representing GASC Idappadi in Periyar University zonal matches.',
      created_at: new Date().toISOString()
    },
    {
      id: 'prof_02',
      user_id: 'user_student_02',
      primary_sport: 'sp_athletics_06',
      position: '100m / 200m Sprinter',
      jersey_number: 12,
      playing_level: 'State Level',
      experience: '2 Years',
      matches_played: 8,
      matches_won: 7,
      matches_lost: 1,
      score_points: 15,
      awards_count: 2,
      competitions_participated: 4,
      bio: 'Gold medalist in Salem District 100m track events.',
      created_at: new Date().toISOString()
    },
    {
      id: 'prof_03',
      user_id: 'user_student_03',
      primary_sport: 'sp_volleyball_02',
      position: 'Attacker / Outside Hitter',
      jersey_number: 9,
      playing_level: 'District Level',
      experience: '1 Year',
      matches_played: 10,
      matches_won: 8,
      matches_lost: 2,
      score_points: 84,
      awards_count: 1,
      competitions_participated: 3,
      bio: 'Lead attacker for GASC Idappadi Volleyball team.',
      created_at: new Date().toISOString()
    }
  ];

  const college_student_roster = [
    { id: 'ros_01', register_number: '23UGCS101', name: 'Arun Kumar S', department: 'Computer Science', year: 'II Year', section: 'A', gender: 'Male', is_registered: true },
    { id: 'ros_02', register_number: '23UGCS102', name: 'Priya Dharshini R', department: 'Computer Science', year: 'II Year', section: 'A', gender: 'Female', is_registered: true },
    { id: 'ros_03', register_number: '23UGCS103', name: 'Balaji K', department: 'Computer Science', year: 'II Year', section: 'A', gender: 'Male', is_registered: false },
    { id: 'ros_04', register_number: '23UGCS104', name: 'Divya M', department: 'Computer Science', year: 'II Year', section: 'B', gender: 'Female', is_registered: false },
    { id: 'ros_05', register_number: '23UGCS105', name: 'Elango V', department: 'Computer Science', year: 'II Year', section: 'B', gender: 'Male', is_registered: false },
    { id: 'ros_06', register_number: '24UGCO201', name: 'Gowtham N', department: 'Commerce', year: 'I Year', section: 'A', gender: 'Male', is_registered: false },
    { id: 'ros_07', register_number: '24UGCO205', name: 'Karthik Raja M', department: 'Commerce', year: 'I Year', section: 'B', gender: 'Male', is_registered: true },
    { id: 'ros_08', register_number: '22UGMA301', name: 'Abirami S', department: 'Mathematics', year: 'III Year', section: 'A', gender: 'Female', is_registered: false },
    { id: 'ros_09', register_number: '22UGMA310', name: 'Deepa Lakshmi K', department: 'Mathematics', year: 'III Year', section: 'A', gender: 'Female', is_registered: true },
    { id: 'ros_10', register_number: '23UGEN101', name: 'Dinesh Kumar P', department: 'English', year: 'II Year', section: 'A', gender: 'Male', is_registered: false },
    { id: 'ros_11', register_number: '23UGEN115', name: 'Vigneshwaran T', department: 'English', year: 'II Year', section: 'B', gender: 'Male', is_registered: false },
    { id: 'ros_12', register_number: '23UGTA101', name: 'Mani Maran C', department: 'Tamil', year: 'II Year', section: 'A', gender: 'Male', is_registered: false },
    { id: 'ros_13', register_number: '24UGPH101', name: 'Sanjay V', department: 'Physics', year: 'I Year', section: 'A', gender: 'Male', is_registered: false },
    { id: 'ros_14', register_number: '24UGCH101', name: 'Kavitha R', department: 'Chemistry', year: 'I Year', section: 'Female', is_registered: false },
    { id: 'ros_15', register_number: '23UGBA101', name: 'Naveen Prasath S', department: 'Business Administration', year: 'II Year', section: 'A', gender: 'Male', is_registered: false }
  ];

  const equipment = [
    {
      id: 'eq_01',
      name: 'English Willow Cricket Bats (SG / SS)',
      code: 'EQ-CRI-001',
      sport_id: 'sp_cricket_01',
      sport_name: 'Cricket',
      category: 'Bats & Rackets',
      total_quantity: 12,
      available_quantity: 10,
      issued_quantity: 2,
      damaged_quantity: 0,
      minimum_stock: 3,
      storage_location: 'Sports Store Room - Rack A1',
      condition: 'Good',
      status: 'In Stock',
      purchase_price: 3200.00,
      created_at: new Date().toISOString()
    },
    {
      id: 'eq_02',
      name: 'Four-Piece Leather Cricket Balls',
      code: 'EQ-CRI-002',
      sport_id: 'sp_cricket_01',
      sport_name: 'Cricket',
      category: 'Balls & Shuttles',
      total_quantity: 40,
      available_quantity: 34,
      issued_quantity: 6,
      damaged_quantity: 0,
      minimum_stock: 10,
      storage_location: 'Sports Store Room - Box 3',
      condition: 'Excellent',
      status: 'In Stock',
      purchase_price: 650.00,
      created_at: new Date().toISOString()
    },
    {
      id: 'eq_03',
      name: 'Cosco Super Volley Volleyballs',
      code: 'EQ-VOL-001',
      sport_id: 'sp_volleyball_02',
      sport_name: 'Volleyball',
      category: 'Balls & Shuttles',
      total_quantity: 15,
      available_quantity: 12,
      issued_quantity: 3,
      damaged_quantity: 0,
      minimum_stock: 4,
      storage_location: 'Sports Store Room - Rack B2',
      condition: 'Good',
      status: 'In Stock',
      purchase_price: 1100.00,
      created_at: new Date().toISOString()
    },
    {
      id: 'eq_04',
      name: 'Nivia Premier League Footballs (Size 5)',
      code: 'EQ-FTB-001',
      sport_id: 'sp_football_03',
      sport_name: 'Football',
      category: 'Balls & Shuttles',
      total_quantity: 16,
      available_quantity: 14,
      issued_quantity: 2,
      damaged_quantity: 0,
      minimum_stock: 4,
      storage_location: 'Sports Store Room - Rack C1',
      condition: 'Good',
      status: 'In Stock',
      purchase_price: 1250.00,
      created_at: new Date().toISOString()
    },
    {
      id: 'eq_05',
      name: 'Yonex Muscle Power Badminton Rackets',
      code: 'EQ-BDM-001',
      sport_id: 'sp_badminton_05',
      sport_name: 'Badminton',
      category: 'Bats & Rackets',
      total_quantity: 18,
      available_quantity: 14,
      issued_quantity: 4,
      damaged_quantity: 0,
      minimum_stock: 4,
      storage_location: 'Indoor Stadium - Locker 2',
      condition: 'Excellent',
      status: 'In Stock',
      purchase_price: 1800.00,
      created_at: new Date().toISOString()
    }
  ];

  const teams = [
    {
      id: 'team_01',
      captain_name: 'Arun Kumar S',
      sport_id: 'sp_cricket_01',
      sport_name: 'Cricket',
      department: 'Computer Science',
      year: 'II Year',
      phone: '+91 98421 54321',
      name: 'Cricket (Computer Science - II Year)',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'team_02',
      captain_name: 'Karthik Raja M',
      sport_id: 'sp_volleyball_02',
      sport_name: 'Volleyball',
      department: 'Commerce',
      year: 'I Year',
      phone: '+91 98943 67890',
      name: 'Volleyball (Commerce - I Year)',
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 'team_03',
      captain_name: 'Vigneshwaran T',
      sport_id: 'sp_kabaddi_04',
      sport_name: 'Kabaddi',
      department: 'English',
      year: 'II Year',
      phone: '+91 95663 88990',
      name: 'Kabaddi (English - II Year)',
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const competitions = [
    {
      id: 'comp_01',
      name: 'Periyar University Inter-Collegiate Cricket Tournament 2026',
      sport_id: 'sp_cricket_01',
      sport_name: 'Cricket',
      type: 'University',
      level: 'University',
      venue: 'GASC Idappadi Main Sports Ground',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      registration_start: new Date().toISOString(),
      registration_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      organizer: 'GASC Idappadi Physical Education Department',
      eligibility: 'All regular collegiate students with valid ID card',
      max_participants: 60,
      current_registrations: 14,
      status: 'Registration Open',
      description: 'Prestigious university zonal cricket championship tournament hosted at Idappadi campus.',
      created_at: new Date().toISOString()
    },
    {
      id: 'comp_02',
      name: 'Annual Inter-Department Volleyball Rolling Trophy 2026',
      sport_id: 'sp_volleyball_02',
      sport_name: 'Volleyball',
      type: 'Inter-Department',
      level: 'College',
      venue: 'College Volleyball Court',
      date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      registration_start: new Date().toISOString(),
      registration_end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      organizer: 'GASC Idappadi Sports Board',
      eligibility: 'Department student teams (UG & PG)',
      max_participants: 48,
      current_registrations: 24,
      status: 'Registration Open',
      description: 'Annual inter-department rivalry for the championship shield.',
      created_at: new Date().toISOString()
    },
    {
      id: 'comp_03',
      name: 'Salem District College Athletics Meet 2026',
      sport_id: 'sp_athletics_06',
      sport_name: 'Athletics & Track',
      type: 'District',
      level: 'District',
      venue: 'Mahatma Gandhi Stadium, Salem',
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      registration_start: new Date().toISOString(),
      registration_end: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      organizer: 'Salem District Sports Authority (SDAT)',
      eligibility: 'Top college sprinters and track athletes',
      max_participants: 30,
      current_registrations: 8,
      status: 'Upcoming',
      description: 'District level track and field trials for State Games qualification.',
      created_at: new Date().toISOString()
    }
  ];

  const achievements = [
    {
      id: 'ach_01',
      student_id: 'user_student_01',
      student_name: 'Arun Kumar S',
      register_number: '23UGCS101',
      department: 'Computer Science',
      sport_name: 'Cricket',
      title: 'Man of the Match & Best Batsman',
      position: 'Winner / 1st Place',
      medal: 'Gold',
      year: '2025 - 2026',
      description: 'Scored match-winning 84 runs off 48 balls in Periyar University Zonal Quarter Finals.',
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'ach_02',
      student_id: 'user_student_02',
      student_name: 'Priya Dharshini R',
      register_number: '23UGCS102',
      department: 'Computer Science',
      sport_name: 'Athletics & Track',
      title: '100m Sprint Gold Medalist',
      position: 'Winner / 1st Place',
      medal: 'Gold',
      year: '2025 - 2026',
      description: 'Clocked 12.4s to secure 1st place in Salem District Collegiate Athletics.',
      is_featured: true,
      created_at: new Date().toISOString()
    }
  ];

  const notifications = [
    {
      id: 'notif_01',
      title: '🏏 Periyar University Cricket Team Selection Trials',
      message: 'All interested student players are instructed to report to College Main Ground on Wednesday at 06:30 AM in proper sports kit.',
      category: 'Team Selection',
      priority: 'High',
      target_type: 'All Students',
      sender: 'Dr. R. Anitha (Physical Directress)',
      read_by: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'notif_02',
      title: '📢 Morning Sports Practice Schedule Announcement',
      message: 'Morning conditioning and fitness drills will commence every Monday, Wednesday, and Friday from 06:30 AM to 08:00 AM.',
      category: 'Practice',
      priority: 'Normal',
      target_type: 'All Students',
      sender: 'Sports Department',
      read_by: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'notif_03',
      title: '🏐 Inter-Department Volleyball Tournament Registration Open',
      message: 'Department team captains can register their 6-player squad online via the portal before the 20th of this month.',
      category: 'Competition',
      priority: 'Normal',
      target_type: 'All Students',
      sender: 'Sports Incharge',
      read_by: [],
      created_at: new Date().toISOString()
    }
  ];

  const admin_settings = [
    {
      id: 'sett_01',
      college_name: 'Government Arts and Science College, Idappadi',
      department_name: 'Department of Physical Education & Sports',
      sports_incharge_name: 'Dr. R. ANITHA, M.P.Ed., M.Phil., Ph.D.',
      sports_incharge_role: 'Physical Directress & Sports Incharge',
      email: 'sports@gascidappadi.edu.in',
      phone: '+91 94432 18765',
      address: 'Government Arts and Science College, Idappadi, Salem District - 637101, Tamil Nadu',
      office_hours: '08:30 AM - 05:30 PM (Mon - Sat)',
      auto_notifications: true,
      created_at: new Date().toISOString()
    }
  ];

  return {
    users,
    sports,
    player_profiles,
    college_student_roster,
    equipment,
    equipment_transactions: [],
    competitions,
    competition_registrations: [],
    teams,
    achievements,
    notifications,
    admin_settings,
    gallery: [],
    practice_sessions: [],
    sports_news: [],
    external_competitions: []
  };
}

class LocalStore {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.db = JSON.parse(raw);
        console.log('📦 Local Store loaded from local_db.json successfully.');
      } else {
        this.db = getInitialData();
        this.save();
        console.log('🌱 Local Store initialized with standard GASC Idappadi dataset.');
      }
    } catch (e) {
      console.error('Error loading local db, resetting to initial dataset:', e.message);
      this.db = getInitialData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving local db:', e.message);
    }
  }

  getTable(tableName) {
    if (!this.db[tableName]) {
      this.db[tableName] = [];
    }
    return this.db[tableName];
  }
}

const storeInstance = new LocalStore();

/**
 * High-performance Postgrest-compatible QueryBuilder executing in-memory against local JSON store
 */
class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.selectedFields = null;
    this.isHeadOnly = false;
    this.isExactCount = false;
    this.orderConfig = null;
    this.rangeConfig = null;
    this.limitCount = null;
    this.isSingle = false;
    this.isMaybeSingle = false;
    this.operation = 'select';
    this.mutationData = null;
    this.mutationOptions = null;
  }

  select(fields = '*', options = {}) {
    if (!this.operation || this.operation === 'select') {
      this.operation = 'select';
    }
    this.selectedFields = fields;
    if (options.head) this.isHeadOnly = true;
    if (options.count) this.isExactCount = true;
    return this;
  }

  insert(data) {
    this.operation = 'insert';
    this.mutationData = Array.isArray(data) ? data : [data];
    return this;
  }

  upsert(data, options = {}) {
    this.operation = 'upsert';
    this.mutationData = Array.isArray(data) ? data : [data];
    this.mutationOptions = options;
    return this;
  }

  update(data) {
    this.operation = 'update';
    this.mutationData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(col, val) {
    this.filters.push(row => String(row[col] ?? '') === String(val ?? ''));
    return this;
  }

  neq(col, val) {
    this.filters.push(row => String(row[col] ?? '') !== String(val ?? ''));
    return this;
  }

  in(col, vals) {
    const set = new Set((vals || []).map(String));
    this.filters.push(row => set.has(String(row[col] ?? '')));
    return this;
  }

  is(col, val) {
    this.filters.push(row => row[col] === val);
    return this;
  }

  gt(col, val) {
    this.filters.push(row => row[col] > val);
    return this;
  }

  gte(col, val) {
    this.filters.push(row => row[col] >= val);
    return this;
  }

  lt(col, val) {
    this.filters.push(row => row[col] < val);
    return this;
  }

  lte(col, val) {
    this.filters.push(row => row[col] <= val);
    return this;
  }

  ilike(col, pattern) {
    const cleanPattern = pattern.replace(/%/g, '.*');
    const regex = new RegExp(`^${cleanPattern}$`, 'i');
    this.filters.push(row => regex.test(String(row[col] || '')));
    return this;
  }

  or(condStr) {
    // Example: "name.ilike.%arun%,register_number.ilike.%arun%"
    const parts = (condStr || '').split(',');
    this.filters.push(row => {
      for (const part of parts) {
        const [field, op, val] = part.split('.');
        if (field && op && val) {
          const cleanPattern = val.replace(/%/g, '.*');
          const reg = new RegExp(cleanPattern, 'i');
          if (reg.test(String(row[field] || ''))) return true;
        }
      }
      return false;
    });
    return this;
  }

  order(col, { ascending = true } = {}) {
    this.orderConfig = { col, ascending };
    return this;
  }

  range(from, to) {
    this.rangeConfig = { from, to };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async execute() {
    const list = storeInstance.getTable(this.table);

    // MUTATION: INSERT
    if (this.operation === 'insert') {
      const inserted = [];
      for (const item of this.mutationData) {
        const doc = {
          id: item.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          ...item,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        list.push(doc);
        inserted.push(doc);
      }
      storeInstance.save();
      const resData = (this.isSingle || this.isMaybeSingle) ? inserted[0] : inserted;
      return { data: resData, error: null, count: inserted.length };
    }

    // MUTATION: UPSERT
    if (this.operation === 'upsert') {
      const conflictCol = this.mutationOptions?.onConflict || 'id';
      const upserted = [];
      for (const item of this.mutationData) {
        const conflictVal = item[conflictCol];
        const existingIdx = list.findIndex(r => String(r[conflictCol] ?? '') === String(conflictVal ?? ''));
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...item, updated_at: new Date().toISOString() };
          upserted.push(list[existingIdx]);
        } else {
          const doc = {
            id: item.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          list.push(doc);
          upserted.push(doc);
        }
      }
      storeInstance.save();
      const resData = (this.isSingle || this.isMaybeSingle) ? upserted[0] : upserted;
      return { data: resData, error: null, count: upserted.length };
    }

    // MUTATION: UPDATE
    if (this.operation === 'update') {
      const updated = [];
      for (let i = 0; i < list.length; i++) {
        const match = this.filters.every(f => f(list[i]));
        if (match) {
          list[i] = { ...list[i], ...this.mutationData, updated_at: new Date().toISOString() };
          updated.push(list[i]);
        }
      }
      storeInstance.save();
      const resData = (this.isSingle || this.isMaybeSingle) ? updated[0] : updated;
      return { data: resData, error: null, count: updated.length };
    }

    // MUTATION: DELETE
    if (this.operation === 'delete') {
      const remaining = [];
      const deleted = [];
      for (const item of list) {
        if (this.filters.every(f => f(item))) {
          deleted.push(item);
        } else {
          remaining.push(item);
        }
      }
      storeInstance.db[this.table] = remaining;
      storeInstance.save();
      const resData = (this.isSingle || this.isMaybeSingle) ? (deleted[0] || null) : deleted;
      return { data: resData, error: null, count: deleted.length };
    }

    // QUERY: SELECT
    let result = list.filter(row => {
      return this.filters.every(filterFn => filterFn(row));
    });

    const totalCount = result.length;

    if (this.orderConfig) {
      const { col, ascending } = this.orderConfig;
      result.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (ascending) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
    }

    if (this.rangeConfig) {
      result = result.slice(this.rangeConfig.from, this.rangeConfig.to + 1);
    } else if (this.limitCount !== null) {
      result = result.slice(0, this.limitCount);
    }

    // Head only (count request without payload)
    if (this.isHeadOnly) {
      return { data: null, count: totalCount, error: null };
    }

    // Resolve relationships if needed (e.g. sports(id, name), users(name))
    // We clone row objects so modifications don't corrupt store
    result = result.map(r => {
      const row = { ...r };
      const sel = this.selectedFields || '';

      if (sel.includes('sports(') || sel.includes('sports.')) {
        const sportId = row.sport_id || row.primary_sport;
        const sportObj = storeInstance.getTable('sports').find(s => s.id === sportId);
        row.sports = sportObj ? { id: sportObj.id, name: sportObj.name, icon: sportObj.icon } : null;
      }

      if (sel.includes('users(') || sel.includes('users.')) {
        const userId = row.user_id || row.student_id;
        const userObj = storeInstance.getTable('users').find(u => u.id === userId);
        row.users = userObj ? {
          id: userObj.id,
          name: userObj.name,
          register_number: userObj.register_number,
          department: userObj.department,
          year: userObj.year,
          mobile: userObj.mobile,
          email: userObj.email,
          profile_photo: userObj.profile_photo
        } : null;
      }

      if (sel.includes('equipment(') || sel.includes('equipment.')) {
        const eqId = row.equipment_id;
        const eqObj = storeInstance.getTable('equipment').find(e => e.id === eqId);
        row.equipment = eqObj ? { id: eqObj.id, name: eqObj.name, code: eqObj.code, category: eqObj.category } : null;
      }

      if (sel.includes('competitions(') || sel.includes('competitions.')) {
        const compId = row.competition_id;
        const compObj = storeInstance.getTable('competitions').find(c => c.id === compId);
        row.competitions = compObj ? { id: compObj.id, name: compObj.name, sport_name: compObj.sport_name, date: compObj.date, venue: compObj.venue } : null;
      }

      if (sel.includes('teams(') || sel.includes('teams.')) {
        const teamId = row.team_id;
        const teamObj = storeInstance.getTable('teams').find(t => t.id === teamId);
        row.teams = teamObj ? { id: teamObj.id, name: teamObj.name } : null;
      }

      return row;
    });

    if (this.isSingle) {
      return { data: result[0] || null, count: totalCount, error: result.length ? null : { message: 'Row not found' } };
    }
    if (this.isMaybeSingle) {
      return { data: result[0] || null, count: totalCount, error: null };
    }

    return { data: result, count: totalCount, error: null };
  }

  // Thenable for `await query`
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

module.exports = {
  storeInstance,
  LocalQueryBuilder,
  from: (table) => new LocalQueryBuilder(table)
};
