const { supabase, toCamelCase, toSnakeCase } = require('../utils/supabaseHelper');
const NotificationService = require('../services/notificationService');

// @desc    Get all competitions
// @route   GET /api/competitions
// @access  Public
exports.getAllCompetitions = async (req, res) => {
  try {
    const { status, type, level, sportId } = req.query;

    let query = supabase.from('competitions').select('*, sports(id, name, icon)');

    if (status && status !== 'All') query = query.eq('status', status);
    if (type && type !== 'All') query = query.eq('type', type);
    if (level && level !== 'All') query = query.eq('level', level);
    if (sportId && sportId !== 'All') query = query.eq('sport_id', sportId);

    query = query.order('date', { ascending: true });

    const { data: compsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const competitions = (compsRaw || []).map(c => {
      const item = toCamelCase(c);
      if (c.sports) item.sportId = toCamelCase(c.sports);
      return item;
    });

    res.json({
      success: true,
      count: competitions.length,
      competitions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single competition
// @route   GET /api/competitions/:id
// @access  Public
exports.getCompetitionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: compRaw, error: compErr } = await supabase
      .from('competitions')
      .select('*, sports(id, name, icon)')
      .eq('id', id)
      .single();

    if (compErr || !compRaw) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    const competition = toCamelCase(compRaw);
    if (compRaw.sports) competition.sportId = toCamelCase(compRaw.sports);

    const { data: regsRaw } = await supabase
      .from('competition_registrations')
      .select('*, users(id, name, register_number, department, year, mobile, profile_photo)')
      .eq('competition_id', id)
      .order('registration_date', { ascending: false });

    const registrations = (regsRaw || []).map(r => {
      const item = toCamelCase(r);
      if (r.users) item.studentId = toCamelCase(r.users);
      return item;
    });

    res.json({
      success: true,
      competition,
      registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create competition
// @route   POST /api/competitions
// @access  Private/Admin
exports.createCompetition = async (req, res) => {
  try {
    const {
      name,
      sportId,
      type,
      level,
      venue,
      date,
      startTime,
      endTime,
      registrationStart,
      registrationEnd,
      organizer,
      eligibility,
      maxParticipants,
      description
    } = req.body;

    if (!name || !sportId || !date || !registrationEnd) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const { data: sport } = await supabase
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .single();

    if (!sport) {
      return res.status(400).json({ success: false, message: 'Invalid sport ID.' });
    }

    let bannerImage = '/images/competitions/default.jpg';
    if (req.file) {
      bannerImage = `/uploads/${req.file.filename}`;
    }

    const newComp = {
      name: name.trim(),
      sport_id: sport.id,
      sport_name: sport.name,
      type: type || 'Inter-College',
      level: level || 'College',
      venue: venue || 'GASC Idappadi Sports Ground',
      date: new Date(date).toISOString(),
      start_time: startTime || '09:00 AM',
      end_time: endTime || '05:00 PM',
      registration_start: registrationStart ? new Date(registrationStart).toISOString() : new Date().toISOString(),
      registration_end: new Date(registrationEnd).toISOString(),
      organizer: organizer || 'GASC Idappadi Sports Board',
      eligibility: eligibility || 'All enrolled UG and PG students',
      max_participants: maxParticipants ? Number(maxParticipants) : 50,
      description: description || '',
      banner_image: bannerImage,
      status: 'Registration Open'
    };

    const { data: createdRaw, error } = await supabase
      .from('competitions')
      .insert(newComp)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const competition = toCamelCase(createdRaw);

    // Send broadcast notification
    await NotificationService.send({
      title: `🏆 New Competition: ${competition.name}`,
      message: `Registrations are now open for ${competition.name} (${sport.name}) taking place on ${new Date(date).toLocaleDateString('en-IN')}. Register before deadline!`,
      category: 'Competition',
      targetType: 'All Students',
      priority: 'High'
    });

    res.status(201).json({
      success: true,
      message: 'Competition created and published successfully!',
      competition
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update competition
// @route   PUT /api/competitions/:id
// @access  Private/Admin
exports.updateCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name, type, level, venue, date, startTime, endTime,
      registrationEnd, organizer, eligibility, maxParticipants,
      description, status, resultSummary
    } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (type) updates.type = type;
    if (level) updates.level = level;
    if (venue) updates.venue = venue;
    if (date) updates.date = new Date(date).toISOString();
    if (startTime) updates.start_time = startTime;
    if (endTime) updates.end_time = endTime;
    if (registrationEnd) updates.registration_end = new Date(registrationEnd).toISOString();
    if (organizer) updates.organizer = organizer;
    if (eligibility) updates.eligibility = eligibility;
    if (maxParticipants !== undefined) updates.max_participants = Number(maxParticipants);
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;
    if (resultSummary !== undefined) updates.result_summary = resultSummary;

    if (req.file) {
      updates.banner_image = `/uploads/${req.file.filename}`;
    }

    const { data: updatedRaw, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedRaw) {
      return res.status(404).json({ success: false, message: 'Competition not found or update failed.' });
    }

    res.json({
      success: true,
      message: 'Competition updated successfully!',
      competition: toCamelCase(updatedRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete competition
// @route   DELETE /api/competitions/:id
// @access  Private/Admin
exports.deleteCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('competition_registrations').delete().eq('competition_id', id);
    const { data: deletedRaw, error } = await supabase.from('competitions').delete().eq('id', id).select().single();

    if (error || !deletedRaw) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    res.json({ success: true, message: 'Competition deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register for a competition (Student)
// @route   POST /api/competitions/:id/register
// @access  Private/Student
exports.registerForCompetition = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: compRaw } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', id)
      .single();

    if (!compRaw) {
      return res.status(404).json({ success: false, message: 'Competition not found.' });
    }

    if (new Date() > new Date(compRaw.registration_end)) {
      return res.status(400).json({ success: false, message: 'Registration has closed for this competition.' });
    }

    const { data: existing } = await supabase
      .from('competition_registrations')
      .select('id')
      .eq('competition_id', id)
      .eq('student_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already registered for this competition.' });
    }

    const { preferredPosition, remarks } = req.body;

    const { data: regRaw, error: regErr } = await supabase
      .from('competition_registrations')
      .insert({
        competition_id: id,
        student_id: req.user.id,
        preferred_position: preferredPosition || '',
        remarks: remarks || '',
        status: 'Pending'
      })
      .select()
      .single();

    if (regErr) {
      return res.status(400).json({ success: false, message: regErr.message });
    }

    // Increment current registrations
    await supabase
      .from('competitions')
      .update({ current_registrations: (compRaw.current_registrations || 0) + 1 })
      .eq('id', id);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Status is Pending review by Sports Incharge.',
      registration: toCamelCase(regRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all registrations (Admin)
// @route   GET /api/competitions/registrations/all
// @access  Private/Admin
exports.getAllRegistrations = async (req, res) => {
  try {
    const { status, competitionId } = req.query;

    let query = supabase.from('competition_registrations').select('*, users(id, name, register_number, department, year, mobile, email, profile_photo), competitions(id, name, sport_name, date, venue)');

    if (status && status !== 'All') query = query.eq('status', status);
    if (competitionId) query = query.eq('competition_id', competitionId);

    query = query.order('registration_date', { ascending: false });

    const { data: regsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const registrations = (regsRaw || []).map(r => {
      const item = toCamelCase(r);
      if (r.users) item.studentId = toCamelCase(r.users);
      if (r.competitions) item.competitionId = toCamelCase(r.competitions);
      return item;
    });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own competition registrations
// @route   GET /api/competitions/my-applications
// @access  Private/Student
exports.getMyRegistrations = async (req, res) => {
  try {
    const { data: regsRaw, error } = await supabase
      .from('competition_registrations')
      .select('*, competitions(*, sports(name, icon))')
      .eq('student_id', req.user.id)
      .order('registration_date', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const registrations = (regsRaw || []).map(r => {
      const item = toCamelCase(r);
      if (r.competitions) {
        const comp = toCamelCase(r.competitions);
        if (r.competitions.sports) comp.sportId = toCamelCase(r.competitions.sports);
        item.competitionId = comp;
      }
      return item;
    });

    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject competition registration (Admin)
// @route   PATCH /api/competitions/registrations/:id/status
// @access  Private/Admin
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const { data: regRaw, error: regErr } = await supabase
      .from('competition_registrations')
      .select('*, competitions(*), users(*)')
      .eq('id', id)
      .single();

    if (regErr || !regRaw) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    const { data: updatedRaw } = await supabase
      .from('competition_registrations')
      .update({
        status,
        admin_remarks: adminRemarks || '',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    const reg = toCamelCase(updatedRaw);

    // Notify student
    if (regRaw.users && regRaw.competitions) {
      await NotificationService.notifyApplicationStatus(
        regRaw.users.id,
        regRaw.competitions.name,
        status,
        adminRemarks
      );
    }

    res.json({
      success: true,
      message: `Registration marked as ${status} successfully. Student has been notified.`,
      registration: reg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
