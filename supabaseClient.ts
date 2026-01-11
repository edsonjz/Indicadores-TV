import { createClient } from '@supabase/supabase-js';

// Vercel espera estas variáveis durante o build.
// Certifique-se de adicioná-las no Dashboard da Vercel -> Settings -> Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cfnxopfvmcelelcyhkde.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bbnh9x3hsRI698gyYzV-XA_LsX3mJZC';

export const supabase = createClient(supabaseUrl, supabaseKey);