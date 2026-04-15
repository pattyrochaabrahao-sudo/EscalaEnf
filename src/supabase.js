import { createClient } from '@supabase/supabase-js';

// Substitua estas strings pelas suas credenciais reais do Supabase
const supabaseUrl = 'https://nxwmzicqnzzvrnnfjcmc.supabase.co';
const supabaseKey = 'sb_publishable_YEvecXErD5tSRat0Ecd_qg_galbQ1r0';

export const supabase = createClient(supabaseUrl, supabaseKey);