const { supabase, toCamelCase } = require('../utils/supabaseHelper');
const AIInsightsService = require('../services/aiInsightsService');

// @desc    Get Admin Dashboard Master KPIs
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getAdminDashboardData = async (req, res) => {
  try {
    const [
      { count: totalPlayers },
      { count: activePlayers },
      { count: totalSports },
      { data: equipmentList },
      { count: upcomingCompetitions },
      { count: pendingApplications },
      { count: totalAchievements },
      { count: totalTeams },
      aiInsights
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'Active'),
      supabase.from('sports').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      supabase.from('equipment').select('total_quantity, available_quantity, issued_quantity, damaged_quantity, lost_quantity, minimum_stock'),
      supabase.from('competitions').select('*', { count: 'exact', head: true }).in('status', ['Upcoming', 'Registration Open', 'Ongoing']),
      supabase.from('competition_registrations').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('achievements').select('*', { count: 'exact', head: true }),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      AIInsightsService.generateInsights()
    ]);

    let eqTotal = 0;
    let eqAvailable = 0;
    let eqIssued = 0;
    let eqDamaged = 0;
    let eqLost = 0;
    let lowStockCount = 0;

    (equipmentList || []).forEach(eq => {
      eqTotal += eq.total_quantity || 0;
      eqAvailable += eq.available_quantity || 0;
      eqIssued += eq.issued_quantity || 0;
      eqDamaged += eq.damaged_quantity || 0;
      eqLost += eq.lost_quantity || 0;
      if ((eq.available_quantity || 0) <= (eq.minimum_stock || 5)) {
        lowStockCount++;
      }
    });

    // Recent activities
    const [
      { data: recentRegsRaw },
      { data: recentTxsRaw },
      { data: recentAchsRaw },
      { data: latestNotifsRaw }
    ] = await Promise.all([
      supabase.from('competition_registrations').select('*, users(name, register_number, department, profile_photo), competitions(name, sport_name, date)').order('registration_date', { ascending: false }).limit(5),
      supabase.from('equipment_transactions').select('*, users(name, register_number), equipment(name, code)').order('issue_date', { ascending: false }).limit(5),
      supabase.from('achievements').select('*').order('created_at', { ascending: false }).limit(4),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const recentRegistrations = (recentRegsRaw || []).map(r => {
      const item = toCamelCase(r);
      if (r.users) item.studentId = toCamelCase(r.users);
      if (r.competitions) item.competitionId = toCamelCase(r.competitions);
      return item;
    });

    const recentTransactions = (recentTxsRaw || []).map(t => {
      const item = toCamelCase(t);
      if (t.users) item.studentId = toCamelCase(t.users);
      if (t.equipment) item.equipmentId = toCamelCase(t.equipment);
      return item;
    });

    const recentAchievements = (recentAchsRaw || []).map(toCamelCase);
    const latestNotifications = (latestNotifsRaw || []).map(toCamelCase);

    res.json({
      success: true,
      kpis: {
        totalPlayers: totalPlayers || 0,
        activePlayers: activePlayers || 0,
        totalSports: totalSports || 0,
        totalEquipment: eqTotal,
        availableEquipment: eqAvailable,
        issuedEquipment: eqIssued,
        damagedEquipment: eqDamaged,
        lostEquipment: eqLost,
        lowStockCount,
        upcomingCompetitions: upcomingCompetitions || 0,
        pendingApplications: pendingApplications || 0,
        totalAchievements: totalAchievements || 0,
        totalTeams: totalTeams || 0
      },
      aiInsights,
      recentRegistrations,
      recentTransactions,
      recentAchievements,
      latestNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chart data for visual analytics
// @route   GET /api/analytics/charts
// @access  Private/Admin
exports.getChartData = async (req, res) => {
  try {
    // 1. Players by Department
    const { data: studentsRaw } = await supabase
      .from('users')
      .select('department')
      .eq('role', 'student');

    const deptMap = {};
    (studentsRaw || []).forEach(s => {
      const d = s.department || 'General';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });

    const deptLabels = Object.keys(deptMap);
    const deptValues = Object.values(deptMap);

    // 2. Equipment Status Breakdown
    const { data: eqList } = await supabase
      .from('equipment')
      .select('available_quantity, issued_quantity, damaged_quantity, lost_quantity');

    let eqStatus = { available: 0, issued: 0, damaged: 0, lost: 0 };
    (eqList || []).forEach(eq => {
      eqStatus.available += eq.available_quantity || 0;
      eqStatus.issued += eq.issued_quantity || 0;
      eqStatus.damaged += eq.damaged_quantity || 0;
      eqStatus.lost += eq.lost_quantity || 0;
    });

    // 3. Players by Primary Sport
    const { data: sportsRaw } = await supabase.from('sports').select('id, name').eq('status', 'Active');
    const { data: profilesRaw } = await supabase.from('player_profiles').select('primary_sport');

    const sportCounts = {};
    (profilesRaw || []).forEach(p => {
      if (p.primary_sport) {
        sportCounts[p.primary_sport] = (sportCounts[p.primary_sport] || 0) + 1;
      }
    });

    const sportsData = (sportsRaw || []).map(s => ({
      sport: s.name,
      count: sportCounts[s.id] || 0
    }));

    // 4. Medals breakdown
    const { data: achRaw } = await supabase.from('achievements').select('medal');
    const medalMap = {};
    (achRaw || []).forEach(a => {
      const m = a.medal || 'Participation / Trophy';
      medalMap[m] = (medalMap[m] || 0) + 1;
    });

    const medals = Object.entries(medalMap).map(([k, v]) => ({ _id: k, count: v }));

    res.json({
      success: true,
      departmentChart: {
        labels: deptLabels.length > 0 ? deptLabels : ['Computer Science', 'Commerce', 'Mathematics'],
        data: deptValues.length > 0 ? deptValues : [1, 1, 1]
      },
      equipmentChart: eqStatus,
      sportsChart: {
        labels: sportsData.map(s => s.sport),
        data: sportsData.map(s => s.count)
      },
      medalsChart: medals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Student Dashboard Overview
// @route   GET /api/analytics/student-dashboard
// @access  Private/Student
exports.getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [
      { data: profileRaw },
      { data: myAppsRaw },
      { data: myTeamsRaw },
      { data: myEqRaw },
      { data: myAchsRaw },
      { data: upCompsRaw },
      { data: notifsRaw }
    ] = await Promise.all([
      supabase.from('player_profiles').select('*, sports(*)').eq('user_id', studentId).single(),
      supabase.from('competition_registrations').select('*, competitions(*)').eq('student_id', studentId).order('registration_date', { ascending: false }),
      supabase.from('teams').select('*').or(`department.ilike.%${req.user.department}%,captain_name.ilike.%${req.user.name}%`),
      supabase.from('equipment_transactions').select('*, equipment(name, code)').eq('student_id', studentId).eq('status', 'Issued'),
      supabase.from('achievements').select('*').eq('student_id', studentId),
      supabase.from('competitions').select('*, sports(name, icon)').eq('status', 'Registration Open').order('date', { ascending: true }).limit(4),
      supabase.from('notifications').select('*').or(`target_type.eq.All Students,target_id.eq.${studentId}`).order('created_at', { ascending: false }).limit(5)
    ]);

    const profile = profileRaw ? toCamelCase(profileRaw) : null;
    if (profile && profileRaw.sports) profile.primarySport = toCamelCase(profileRaw.sports);

    const myApplications = (myAppsRaw || []).map(a => {
      const item = toCamelCase(a);
      if (a.competitions) item.competitionId = toCamelCase(a.competitions);
      return item;
    });

    const myTeams = (myTeamsRaw || []).map(toCamelCase);

    const issuedEquipment = (myEqRaw || []).map(e => {
      const item = toCamelCase(e);
      if (e.equipment) item.equipmentId = toCamelCase(e.equipment);
      return item;
    });

    const achievements = (myAchsRaw || []).map(toCamelCase);

    const upcomingCompetitions = (upCompsRaw || []).map(c => {
      const item = toCamelCase(c);
      if (c.sports) item.sportId = toCamelCase(c.sports);
      return item;
    });

    const notifications = (notifsRaw || []).map(toCamelCase);

    const now = new Date();
    const overdueCount = issuedEquipment.filter(e => new Date(e.expectedReturnDate) < now).length;

    res.json({
      success: true,
      stats: {
        primarySport: profile && profile.primarySport ? profile.primarySport.name : 'General Athletics',
        position: profile ? profile.position : 'All Rounder',
        teamCount: myTeams.length,
        primaryTeam: myTeams.length > 0 ? myTeams[0].name : `${req.user.department} Team`,
        achievementsCount: achievements.length,
        upcomingEventsCount: upcomingCompetitions.length,
        issuedEquipmentCount: issuedEquipment.length,
        overdueCount,
        applicationsCount: myApplications.length
      },
      profile,
      myApplications,
      myTeams,
      issuedEquipment,
      achievements,
      upcomingCompetitions,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
