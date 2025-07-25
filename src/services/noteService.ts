import { supabase } from '../lib/supabaseClient';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const getNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data || [];
};

export const createNote = async (noteData: { title: string; content: string }): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert([noteData])
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }

  return data;
};

export const updateNote = async (id: string, noteData: { title: string; content: string }): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }

  return data;
};

export const deleteNote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};
