import { createClient } from '@supabase/supabase-js';

// Recommendation: Use environment variables in a real production environment
// import.meta.env.VITE_SUPABASE_URL
// import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = 'https://cfnxopfvmcelelcyhkde.supabase.co';
const supabaseKey = 'sb_publishable_bbnh9x3hsRI698gyYzV-XA_LsX3mJZC';

export const supabase = createClient(supabaseUrl, supabaseKey);