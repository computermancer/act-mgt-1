import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
};

export const handleSupabaseResponse = <T>({ 
  data, 
  error 
}: { 
  data: T | null; 
  error: PostgrestError | null 
}): T => {
  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  if (!data) {
    throw new Error('No data returned from Supabase');
  }
  return data;
};

// Helper to format dates for Supabase
export const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};

// Helper to parse dates from Supabase
export const parseDateFromSupabase = (dateString: string): Date => {
  return new Date(dateString);
};

// Helper to handle file uploads
export const uploadFile = async (
  bucket: string, 
  path: string, 
  file: File
): Promise<{ path: string; publicUrl: string }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl
  };
};
