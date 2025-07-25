import { createClient } from '@supabase/supabase-js';

// Log environment variables for debugging (remove in production)
console.log('Environment Variables:', {
  REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not set',
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_URL: process.env.PUBLIC_URL
});

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    =======================================
    Missing Supabase environment variables!
    Please check your .env.local file and ensure it includes:
    
    REACT_APP_SUPABASE_URL=your_supabase_url_here
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    
    =======================================
  `);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get the current user's ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Helper function to handle errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw error;
};
