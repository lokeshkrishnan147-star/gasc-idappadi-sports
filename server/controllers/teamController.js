const { supabase, toCamelCase, toSnakeCase } = require('../utils/supabaseHelper');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public / Private
exports.getAllTeams = async (req, res) => {
  try {
    const { sportId, department, year, search } = req.query;

    let query = supabase.from('teams').select('*');

    if (sportId && sportId !== 'All') query = query.eq('sport_id', sportId);
    if (department && department !== 'All') {
      if (department === 'Maths' || department === 'Mathematics') {
        query = query.in('department', ['Maths', 'Mathematics']);
      } else if (department === 'B.Com' || department === 'Commerce' || department === 'B COM') {
        query = query.in('department', ['B.Com', 'Commerce', 'B COM']);
      } else if (department === 'BBA' || department === 'Business Administration') {
        query = query.in('department', ['BBA', 'Business Administration']);
      } else if (department === 'BMA' || department === 'MBA') {
        query = query.in('department', ['BMA', 'MBA']);
      } else if (department === 'M.Com' || department === 'MCOM') {
        query = query.in('department', ['M.Com', 'MCOM']);
      } else if (department === 'MA Tamil' || department === 'M.A. Tamil') {
        query = query.in('department', ['MA Tamil', 'M.A. Tamil']);
      } else if (department === 'MA English' || department === 'M.A. English') {
        query = query.in('department', ['MA English', 'M.A. English']);
      } else if (department === 'MA Maths' || department === 'M.Sc. Mathematics') {
        query = query.in('department', ['MA Maths', 'M.Sc. Mathematics']);
      } else {
        query = query.eq('department', department);
      }
    }
    if (year && year !== 'All') query = query.eq('year', year);

    if (search) {
      query = query.or(`captain_name.ilike.%${search.trim()}%,sport_name.ilike.%${search.trim()}%,department.ilike.%${search.trim()}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data: teamsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const teams = (teamsRaw || []).map(toCamelCase);

    res.json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public / Private
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: teamRaw, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !teamRaw) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    res.json({
      success: true,
      team: toCamelCase(teamRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new team
// @route   POST /api/teams
// @access  Private/Admin
exports.createTeam = async (req, res) => {
  try {
    const { captainName, sportId, department, year, phone } = req.body;

    if (!captainName || !sportId || !department || !year) {
      return res.status(400).json({
        success: false,
        message: 'Captain Name, Sport, Department, and Year are required.'
      });
    }

    let sportName = 'Sports';
    let validSportId = null;

    // Check if sportId is valid UUID or name
    if (sportId.includes('-')) {
      const { data: sport } = await supabase.from('sports').select('*').eq('id', sportId).single();
      if (sport) {
        sportName = sport.name;
        validSportId = sport.id;
      }
    } else {
      const { data: sport } = await supabase.from('sports').select('*').ilike('name', sportId).single();
      if (sport) {
        sportName = sport.name;
        validSportId = sport.id;
      } else {
        sportName = sportId;
      }
    }

    const newTeam = {
      captain_name: captainName.trim(),
      sport_id: validSportId,
      sport_name: sportName,
      department: department.trim(),
      year: year.trim(),
      phone: phone ? phone.trim() : '',
      name: `${sportName} (${department} - ${year})`,
      status: 'Active'
    };

    const { data: createdRaw, error } = await supabase
      .from('teams')
      .insert(newTeam)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: `Team for ${sportName} with Captain "${captainName}" created successfully!`,
      team: toCamelCase(createdRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private/Admin
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: teamRaw, error: fetchErr } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !teamRaw) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const { captainName, sportId, department, year, phone, status } = req.body;

    const updates = {};
    if (captainName) updates.captain_name = captainName.trim();
    if (department) updates.department = department.trim();
    if (year) updates.year = year.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : '';
    if (status) updates.status = status;

    let sportName = teamRaw.sport_name;
    if (sportId) {
      if (sportId.includes('-')) {
        const { data: sport } = await supabase.from('sports').select('*').eq('id', sportId).single();
        if (sport) {
          updates.sport_name = sport.name;
          updates.sport_id = sport.id;
          sportName = sport.name;
        }
      } else {
        updates.sport_name = sportId;
        sportName = sportId;
      }
    }

    const finalDept = updates.department || teamRaw.department;
    const finalYear = updates.year || teamRaw.year;
    updates.name = `${sportName} (${finalDept} - ${finalYear})`;

    const { data: updatedRaw, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: 'Team updated successfully!',
      team: toCamelCase(updatedRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private/Admin
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: teamRaw, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !teamRaw) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    res.json({ success: true, message: `Team "${teamRaw.name}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's teams
// @route   GET /api/teams/my-teams
// @access  Private/Student
exports.getMyTeams = async (req, res) => {
  try {
    const user = req.user;

    const { data: teamsRaw, error } = await supabase
      .from('teams')
      .select('*')
      .or(`department.ilike.%${user.department}%,captain_name.ilike.%${user.name}%`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const teams = (teamsRaw || []).map(toCamelCase);

    res.json({
      success: true,
      count: teams.length,
      teams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
