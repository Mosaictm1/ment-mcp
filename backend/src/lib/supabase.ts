import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

// Client for server-side operations with service role key
export const supabaseAdmin = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Client with anon key (for public operations)
export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
);
