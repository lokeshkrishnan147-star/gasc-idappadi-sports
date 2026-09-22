const jwt = require('jsonwebtoken');
const { supabase, toCamelCase } = require('../utils/supabaseHelper');

const verifyToken = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gasc_idappadi_sports_secret_jwt_key_2026');
    
    // Check master admin fallback token
    if (decoded.id === 'admin_master_01') {
      req.user = {
        id: 'admin_master_01',
        name: 'Dr. R. ANITHA',
        role: 'admin',
        department: 'Physical Education & Sports',
        status: 'Active'
      };
      return next();
    }

    // Fetch user from Supabase
    const { data: userRaw, error } = await supabase
      .from('users')
      .select('id, name, register_number, email, role, department, year, section, gender, mobile, profile_photo, status, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !userRaw) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
    }

    const user = toCamelCase(userRaw);

    if (user.status === 'Suspended' || user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated or suspended.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Access forbidden: Sports Incharge / Admin privileges required.'
    });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_STUDENT_ONLY',
      message: 'Access forbidden: Student player privileges required.'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireStudent
};
