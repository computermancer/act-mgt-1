import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const TestConnection = () => {
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        
        // Test auth state
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session);
        
        // Test database access
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error('Error connecting to Supabase database:', error);
        } else {
          console.log('Successfully connected to Supabase database!', data);
        }
        
        // Test storage (if needed)
        try {
          const { data: storageData, error: storageError } = await supabase.storage.listBuckets();
          if (storageError) {
            console.error('Error accessing storage:', storageError);
          } else {
            console.log('Successfully connected to Supabase storage:', storageData);
          }
        } catch (storageErr) {
          console.error('Storage test error:', storageErr);
        }
        
      } catch (error) {
        console.error('Unexpected error during Supabase connection test:', error);
      }
    };

    testConnection();
  }, []);

  return null; // This component doesn't render anything visible
};
