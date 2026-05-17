const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Missing Supabase credentials. Make sure to set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env");
}

// We use the service key because the backend acts as a privileged admin to write the audit log
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder_key'
);

module.exports = supabase;
