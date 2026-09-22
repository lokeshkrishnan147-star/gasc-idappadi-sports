const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config(); // Fallback
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('⚡ Supabase Client initialized successfully!');
  } catch (error) {
    console.error('⚠️ Supabase Initialization Error:', error.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env. (Set SUPABASE_URL and SUPABASE_ANON_KEY to enable Supabase syncing)');
}

/**
 * Helper to check if Supabase connection is active
 */
const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && supabase);
};

module.exports = {
  supabase,
  isSupabaseConfigured,
  supabaseUrl,
  supabaseKey
};
