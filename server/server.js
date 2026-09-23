const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Supabase Configuration & Auto-seeder
const { isSupabaseConfigured, supabase } = require('./config/supabase');
const seedSupabase = require('./utils/seedSupabase');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const sportRoutes = require('./routes/sportRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const teamRoutes = require('./routes/teamRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const supabaseRoutes = require('./routes/supabaseRoutes');
const externalCompetitionRoutes = require('./routes/externalCompetitionRoutes');
const sportsNewsRoutes = require('./routes/sportsNewsRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable HTTP caching globally so browser changes appear instantly
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Ensure upload directory exists
const clientPublic = path.join(__dirname, '../client/public');
const uploadDir = path.join(clientPublic, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ============================================================
// 🏛️ CLEAN PORTAL ROUTES (STUDENT & SPORTS INCHARGE / ADMIN)
// ============================================================

// 1. Student Portal Routes
app.get('/student/login', (req, res) => {
  res.sendFile(path.join(clientPublic, 'student-login.html'));
});
app.get('/student/register', (req, res) => {
  res.sendFile(path.join(clientPublic, 'student-register.html'));
});
app.get('/student/dashboard', (req, res) => {
  res.sendFile(path.join(clientPublic, 'student-dashboard.html'));
});
app.get(['/student', '/student/'], (req, res) => {
  res.redirect('/student/login');
});
app.get([
  '/student/profile',
  '/student/my-sports',
  '/student/sports',
  '/student/competitions',
  '/student/applications',
  '/student/team',
  '/student/practice',
  '/student/attendance',
  '/student/equipment',
  '/student/achievements',
  '/student/certificates',
  '/student/news',
  '/student/notifications',
  '/student/external-competitions'
], (req, res) => {
  res.sendFile(path.join(clientPublic, 'student-dashboard.html'));
});
// Zero-404 fallback: Any unrecognized student subroute safely opens the dashboard
app.get('/student/*', (req, res) => {
  res.sendFile(path.join(clientPublic, 'student-dashboard.html'));
});

// 2. Sports Incharge / Admin Portal Routes
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(clientPublic, 'admin-login.html'));
});
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(clientPublic, 'admin-dashboard.html'));
});
app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/admin/login');
});
app.get('/admin/:section', (req, res) => {
  res.sendFile(path.join(clientPublic, 'admin-dashboard.html'));
});

// 3. Legacy Redirects for seamless backward compatibility
app.get('/login.html', (req, res) => {
  if (req.query.role === 'admin') {
    return res.redirect('/admin/login');
  }
  res.redirect('/student/login');
});
app.get('/register.html', (req, res) => {
  res.redirect('/student/register');
});
app.get('/admin.html', (req, res) => {
  res.redirect('/admin/login');
});
app.get('/student.html', (req, res) => {
  res.redirect('/student/login');
});


// Serve static frontend assets
app.use(express.static(clientPublic));
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/supabase', supabaseRoutes);
app.use('/api/external-competitions', externalCompetitionRoutes);
app.use('/api/sports-news', sportsNewsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    college: 'Government Arts and Science College, Idappadi',
    system: 'Smart Sports Management System',
    database: 'Supabase Cloud (PostgreSQL)',
    timestamp: new Date()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

let activeServer = null;

// Resilient port listener (auto-switches to next port if busy)
const listenOnPort = (port) => {
  const server = app.listen(port, () => {
    activeServer = server;
    console.log('\n===============================================================');
    console.log('🏆 GASC IDAPPADI — SMART SPORTS MANAGEMENT SYSTEM');
    console.log('🏛️ Government Arts and Science College, Idappadi');
    console.log('---------------------------------------------------------------');
    console.log(`🚀 Server running on: http://localhost:${port}`);
    console.log(`🌐 Public Website:    http://localhost:${port}/index.html`);
    console.log(`⚡ Supabase Database: ${isSupabaseConfigured() ? '✅ Connected & Active' : '❌ Not configured'}`);
    console.log('---------------------------------------------------------------');
    console.log('Demo Credentials for Viva / Presentation:');
    console.log('  Admin (Sports Incharge):       admin / admin123');
    console.log('  Student Player:                23UGCS101 / student123');
    console.log('===============================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is currently in use. Automatically switching to http://localhost:${nextPort}...`);
      listenOnPort(nextPort);
    } else {
      console.error('Server error:', err.message);
    }
  });
};

// Initialize Supabase Database and Start Server
const startServer = async () => {
  listenOnPort(DEFAULT_PORT);
  try {
    if (isSupabaseConfigured()) {
      console.log('⚡ Connected to Supabase Cloud Database!');
      await seedSupabase(false);
    } else {
      console.warn('⚠️ Supabase credentials missing in .env');
    }
  } catch (error) {
    console.error('Failed during server startup check:', error.message);
  }
};

startServer();

module.exports = {
  app,
  startServer,
  getHttpServer: () => activeServer
};
