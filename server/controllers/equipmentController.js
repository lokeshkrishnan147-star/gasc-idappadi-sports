const { supabase, toCamelCase, toSnakeCase } = require('../utils/supabaseHelper');
const StockService = require('../services/stockService');

// @desc    Get all equipment with search and filters
// @route   GET /api/equipment
// @access  Public / Private
exports.getAllEquipment = async (req, res) => {
  try {
    const { search, category, sportId, status, lowStock } = req.query;

    let query = supabase.from('equipment').select('*, sports(id, name, icon)');

    if (category && category !== 'All') query = query.eq('category', category);
    if (sportId && sportId !== 'All') query = query.eq('sport_id', sportId);
    if (status && status !== 'All') query = query.eq('status', status);

    if (search) {
      query = query.or(`name.ilike.%${search.trim()}%,code.ilike.%${search.trim()}%,supplier.ilike.%${search.trim()}%`);
    }

    query = query.order('name', { ascending: true });

    const { data: itemsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    let items = (itemsRaw || []).map(item => {
      const converted = toCamelCase(item);
      if (item.sports) {
        converted.sportId = toCamelCase(item.sports);
      }
      return converted;
    });

    if (lowStock === 'true') {
      items = items.filter(item => item.availableQuantity <= item.minimumStock);
    }

    res.json({
      success: true,
      count: items.length,
      equipment: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: itemRaw, error } = await supabase
      .from('equipment')
      .select('*, sports(id, name, icon)')
      .eq('id', id)
      .single();

    if (error || !itemRaw) {
      return res.status(404).json({ success: false, message: 'Equipment item not found.' });
    }

    const equipment = toCamelCase(itemRaw);
    if (itemRaw.sports) {
      equipment.sportId = toCamelCase(itemRaw.sports);
    }

    const { data: txRaw } = await supabase
      .from('equipment_transactions')
      .select('*')
      .eq('equipment_id', id)
      .order('issue_date', { ascending: false });

    const transactions = (txRaw || []).map(toCamelCase);

    res.json({
      success: true,
      equipment,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private/Admin
exports.createEquipment = async (req, res) => {
  try {
    const {
      name,
      code,
      sportId,
      category,
      totalQuantity,
      minimumStock,
      purchaseDate,
      purchasePrice,
      supplier,
      storageLocation,
      condition,
      warranty,
      description
    } = req.body;

    if (!name || !code || !sportId || totalQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const cleanCode = code.trim().toUpperCase();

    const { data: existing } = await supabase
      .from('equipment')
      .select('id')
      .eq('code', cleanCode)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Equipment code already exists. Use a unique code.' });
    }

    const { data: sport } = await supabase
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .single();

    if (!sport) {
      return res.status(400).json({ success: false, message: 'Invalid sport ID.' });
    }

    const totalQty = parseInt(totalQuantity, 10);
    let image = '/images/equipment/default.jpg';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const newRecord = {
      name: name.trim(),
      code: cleanCode,
      sport_id: sport.id,
      sport_name: sport.name,
      category: category || 'Balls & Shuttles',
      total_quantity: totalQty,
      available_quantity: totalQty,
      issued_quantity: 0,
      damaged_quantity: 0,
      lost_quantity: 0,
      minimum_stock: minimumStock !== undefined ? parseInt(minimumStock, 10) : 5,
      purchase_date: purchaseDate ? new Date(purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : 0,
      supplier: supplier || 'Salem Sports Goods Co.',
      storage_location: storageLocation || 'Sports Room Shelf A1',
      condition: condition || 'Good',
      warranty: warranty || '1 Year',
      description: description || '',
      image,
      status: 'In Stock'
    };

    const { data: createdRaw, error } = await supabase
      .from('equipment')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: 'New equipment registered successfully!',
      equipment: toCamelCase(createdRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Admin
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: itemRaw, error: itemErr } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (itemErr || !itemRaw) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    const {
      name,
      category,
      totalQuantity,
      minimumStock,
      purchasePrice,
      supplier,
      storageLocation,
      condition,
      warranty,
      description
    } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (category) updates.category = category;
    if (totalQuantity !== undefined) {
      const newTotal = parseInt(totalQuantity, 10);
      updates.total_quantity = newTotal;
      const issued = itemRaw.issued_quantity || 0;
      const damaged = itemRaw.damaged_quantity || 0;
      const lost = itemRaw.lost_quantity || 0;
      const available = Math.max(0, newTotal - (issued + damaged + lost));
      updates.available_quantity = available;
      if (available === 0) updates.status = 'Out of Stock';
      else if (available <= (minimumStock !== undefined ? parseInt(minimumStock, 10) : itemRaw.minimum_stock)) updates.status = 'Low Stock';
      else updates.status = 'In Stock';
    }
    if (minimumStock !== undefined) updates.minimum_stock = parseInt(minimumStock, 10);
    if (purchasePrice !== undefined) updates.purchase_price = parseFloat(purchasePrice);
    if (supplier) updates.supplier = supplier;
    if (storageLocation) updates.storage_location = storageLocation;
    if (condition) updates.condition = condition;
    if (warranty) updates.warranty = warranty;
    if (description !== undefined) updates.description = description;

    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    const { data: updatedRaw, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully!',
      equipment: toCamelCase(updatedRaw)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: itemRaw } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', id)
      .single();

    if (!itemRaw) {
      return res.status(404).json({ success: false, message: 'Equipment not found.' });
    }

    if ((itemRaw.issued_quantity || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${itemRaw.issued_quantity} unit(s) of this equipment are currently issued to students.`
      });
    }

    await supabase.from('equipment').delete().eq('id', id);

    res.json({
      success: true,
      message: 'Equipment deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Issue equipment to student
// @route   POST /api/equipment/issue
// @access  Private/Admin
exports.issueEquipment = async (req, res) => {
  try {
    const { studentIdentifier, equipmentId, quantity, expectedReturnDate, purpose, remarks } = req.body;

    if (!studentIdentifier || !equipmentId || !quantity || !expectedReturnDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Find student by registerNumber or ID
    const { data: studentRaw } = await supabase
      .from('users')
      .select('*')
      .or(`register_number.ilike.${studentIdentifier.trim()},id.eq.${studentIdentifier.includes('-') ? studentIdentifier : '00000000-0000-0000-0000-000000000000'}`)
      .eq('role', 'student')
      .limit(1)
      .single();

    if (!studentRaw) {
      return res.status(404).json({ success: false, message: `Student with Register Number "${studentIdentifier}" not found.` });
    }

    const student = toCamelCase(studentRaw);

    const result = await StockService.issueEquipment({
      student,
      equipmentId,
      quantity,
      expectedReturnDate,
      purpose,
      remarks,
      issuedBy: req.user.name || 'Sports Incharge'
    });

    res.json({
      success: true,
      message: `Successfully issued ${quantity} unit(s) of ${result.equipment.name} to ${student.name} (${student.registerNumber})`,
      transaction: result.transaction,
      equipment: result.equipment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Return equipment
// @route   POST /api/equipment/return
// @access  Private/Admin
exports.returnEquipment = async (req, res) => {
  try {
    const { transactionId, returnCondition, damageDescription, fineAmount, remarks } = req.body;

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required.' });
    }

    const result = await StockService.returnEquipment({
      transactionId,
      returnCondition,
      damageDescription,
      fineAmount,
      remarks
    });

    res.json({
      success: true,
      message: `Equipment return processed successfully (${result.transaction.returnCondition}). Stock updated.`,
      transaction: result.transaction,
      equipment: result.equipment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/equipment/transactions
// @access  Private
exports.getAllTransactions = async (req, res) => {
  try {
    const { status, studentId, equipmentId } = req.query;

    let query = supabase.from('equipment_transactions').select('*, users(id, name, register_number, department, mobile), equipment(id, name, code, category)');

    if (status && status !== 'All') query = query.eq('status', status);
    if (studentId) query = query.eq('student_id', studentId);
    if (equipmentId) query = query.eq('equipment_id', equipmentId);

    query = query.order('issue_date', { ascending: false });

    const { data: txsRaw, error } = await query;

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const now = new Date();
    const transactions = (txsRaw || []).map(t => {
      const item = toCamelCase(t);
      if (t.users) item.studentId = toCamelCase(t.users);
      if (t.equipment) item.equipmentId = toCamelCase(t.equipment);
      item.isOverdue = item.status === 'Issued' && new Date(item.expectedReturnDate) < now;
      return item;
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's issued and previous equipment
// @route   GET /api/equipment/my-equipment
// @access  Private/Student
exports.getMyEquipment = async (req, res) => {
  try {
    const { data: txsRaw, error } = await supabase
      .from('equipment_transactions')
      .select('*, equipment(id, name, code, category, storage_location, image)')
      .eq('student_id', req.user.id)
      .order('issue_date', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const now = new Date();
    const activeIssued = [];
    const history = [];

    (txsRaw || []).forEach(t => {
      const item = toCamelCase(t);
      if (t.equipment) item.equipmentId = toCamelCase(t.equipment);
      item.isOverdue = item.status === 'Issued' && new Date(item.expectedReturnDate) < now;

      if (item.status === 'Issued') {
        activeIssued.push(item);
      } else {
        history.push(item);
      }
    });

    res.json({
      success: true,
      activeIssued,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
