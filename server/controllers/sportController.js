const { supabase, toCamelCase, toSnakeCase } = require('../utils/supabaseHelper');

// @desc    Get all sports
// @route   GET /api/sports
// @access  Public
exports.getAllSports = async (req, res) => {
  try {
    const { status, category, indoorOutdoor } = req.query;

    let query = supabase.from('sports').select('*');

    if (status && status !== 'All') query = query.eq('status', status);
    if (category && category !== 'All') query = query.eq('category', category);
    if (indoorOutdoor && indoorOutdoor !== 'All') query = query.eq('indoor_outdoor', indoorOutdoor);

    query = query.order('name', { ascending: true });

    const { data: sportsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const sports = (sportsRaw || []).map(toCamelCase);

    // Fetch counts in parallel
    const enriched = await Promise.all(sports.map(async (sport) => {
      const { count: playerCount } = await supabase
        .from('player_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('primary_sport', sport.id);

      const { count: equipmentCount } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('sport_id', sport.id);

      return {
        ...sport,
        registeredPlayersCount: playerCount || 0,
        equipmentItemsCount: equipmentCount || 0
      };
    }));

    res.json({
      success: true,
      count: enriched.length,
      sports: enriched
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sport
// @route   GET /api/sports/:id
// @access  Public
exports.getSportById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sportRaw, error: sportErr } = await supabase
      .from('sports')
      .select('*')
      .eq('id', id)
      .single();

    if (sportErr || !sportRaw) {
      return res.status(404).json({ success: false, message: 'Sport not found.' });
    }

    const sport = toCamelCase(sportRaw);

    // Players with this sport
    const { data: profilesRaw } = await supabase
      .from('player_profiles')
      .select('*, users(id, name, register_number, department, year, profile_photo)')
      .eq('primary_sport', id);

    const players = (profilesRaw || []).map(p => {
      const item = toCamelCase(p);
      if (p.users) item.userId = toCamelCase(p.users);
      return item;
    });

    // Equipment with this sport
    const { data: equipmentRaw } = await supabase
      .from('equipment')
      .select('*')
      .eq('sport_id', id);

    const equipment = (equipmentRaw || []).map(toCamelCase);

    res.json({
      success: true,
      sport,
      players,
      equipment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new sport
// @route   POST /api/sports
// @access  Private/Admin
exports.createSport = async (req, res) => {
  try {
    const { name, description, category, indoorOutdoor, playerCount, rules, coach, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Sport name is required.' });
    }

    const { data: existing } = await supabase
      .from('sports')
      .select('id')
      .ilike('name', name.trim())
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Sport with this name already exists.' });
    }

    let image = '/images/sports/default.jpg';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newSportData = {
      name: name.trim(),
      description: description || '',
      category: category || 'Team Sport',
      indoor_outdoor: indoorOutdoor || 'Outdoor',
      player_count: playerCount ? Number(playerCount) : 11,
      rules: rules || '',
      coach: coach || 'Sports Incharge',
      icon: icon || 'bi-trophy',
      image,
      status: 'Active'
    };

    const { data: createdRaw, error } = await supabase
      .from('sports')
      .insert(newSportData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'New sport discipline added successfully!',
      sport: toCamelCase(createdRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sport
// @route   PUT /api/sports/:id
// @access  Private/Admin
exports.updateSport = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, indoorOutdoor, playerCount, rules, coach, icon, status } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (category) updates.category = category;
    if (indoorOutdoor) updates.indoor_outdoor = indoorOutdoor;
    if (playerCount) updates.player_count = Number(playerCount);
    if (rules !== undefined) updates.rules = rules;
    if (coach) updates.coach = coach;
    if (icon) updates.icon = icon;
    if (status) updates.status = status;

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const { data: updatedRaw, error } = await supabase
      .from('sports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !updatedRaw) {
      return res.status(404).json({ success: false, message: 'Sport not found or update failed.' });
    }

    res.json({
      success: true,
      message: 'Sport updated successfully!',
      sport: toCamelCase(updatedRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete sport
// @route   DELETE /api/sports/:id
// @access  Private/Admin
exports.deleteSport = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedRaw, error } = await supabase
      .from('sports')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !deletedRaw) {
      return res.status(404).json({ success: false, message: 'Sport not found.' });
    }

    res.json({
      success: true,
      message: 'Sport deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
