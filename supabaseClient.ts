import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas. ' +
    'Crie um arquivo .env.local na raiz do projeto com essas variáveis. ' +
    'Consulte o .env.example para referência.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);