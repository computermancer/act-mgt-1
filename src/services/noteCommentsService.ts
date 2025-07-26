import { supabase } from '../lib/supabaseClient';
import { Emoticon, Comment, NoteEmoticon } from '../types/note-comments';

// Test function to check Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('comments').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      throw error;
    }
    
    console.log('Supabase connection successful!', { data });
    return true;
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    return false;
  }
};

export const getEmoticons = async (): Promise<Emoticon[]> => {
  const { data, error } = await supabase
    .from('emoticons')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getNoteComments = async (noteId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('note_id', noteId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return (data || []) as unknown as Comment[];
};

export const addComment = async (noteId: string, content: string, parentId?: string): Promise<Comment> => {
  console.log('Attempting to add comment to Supabase:', { noteId, content, parentId });
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          note_id: noteId,
          content,
          parent_id: parentId || null
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding comment:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Successfully added comment:', data);
    return data as unknown as Comment;
  } catch (error) {
    console.error('Unexpected error in addComment:', error);
    throw error;
  }
};

export const updateComment = async (commentId: string, content: string): Promise<Comment> => {
  const { data, error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return data as unknown as Comment;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
};

export const getNoteEmoticon = async (noteId: string) => {
  try {
    const { data, error } = await supabase
      .from('note_emoticons')
      .select('emoticon:emoticon_id(*)')
      .eq('note_id', noteId)
      .maybeSingle();

    if (error) {
      console.error('Error getting note emoticon:', error);
      return null;
    }

    // If no data or no emoticon, return null
    if (!data || !data.emoticon) {
      return null;
    }

    // Handle case where emoticon might be an array
    const emoticon = Array.isArray(data.emoticon) ? data.emoticon[0] : data.emoticon;
    
    // Ensure the emoticon has required fields
    if (!emoticon?.id || !emoticon?.emoji) {
      console.error('Invalid emoticon data:', emoticon);
      return null;
    }

    return { emoticon };
  } catch (error) {
    console.error('Unexpected error in getNoteEmoticon:', error);
    return null;
  }
};

export const setNoteEmoticon = async (noteId: string, emoticonId: string): Promise<void> => {
  // First, remove any existing emoticon for this note
  await supabase
    .from('note_emoticons')
    .delete()
    .eq('note_id', noteId);

  // Then add the new one
  const { error } = await supabase
    .from('note_emoticons')
    .insert([{ note_id: noteId, emoticon_id: emoticonId }]);

  if (error) {
    console.error('Error setting note emoticon:', error);
    throw error;
  }
};

export const removeNoteEmoticon = async (noteId: string): Promise<void> => {
  const { error } = await supabase
    .from('note_emoticons')
    .delete()
    .eq('note_id', noteId);

  if (error) throw error;
};
