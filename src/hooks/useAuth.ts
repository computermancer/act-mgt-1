import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the auth token from cookies
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='));
        
        const token = cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : null;

        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verify the token exists in the database
        const { data, error } = await supabase
          .from('secure_login')
          .select('password')
          .eq('password', token)
          .maybeSingle();

        if (error || !data) {
          // Clear invalid token
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Set up a small delay to ensure the auth state is properly set
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return { isAuthenticated, isLoading };
};
