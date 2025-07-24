import { supabase } from '../lib/supabaseClient';
import { Activity, ActivityFormData } from '../types/activity';

export const getActivities = async (): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }

  return data || [];
};

export const getActivityById = async (id: string): Promise<Activity | null> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching activity ${id}:`, error);
    return null;
  }

  return data;
};

export const createActivity = async (activityData: ActivityFormData): Promise<Activity> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('activities')
    .insert([
      {
        ...activityData,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating activity:', error);
    throw error;
  }

  return data;
};

export const updateActivity = async (id: string, activityData: Partial<ActivityFormData>): Promise<Activity> => {
  const { data, error } = await supabase
    .from('activities')
    .update(activityData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating activity ${id}:`, error);
    throw error;
  }

  return data;
};

export const deleteActivity = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting activity ${id}:`, error);
    throw error;
  }
};

export const getUpcomingActivities = async (daysAhead: number = 7): Promise<Activity[]> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('scheduled_date', startDate.toISOString())
    .lte('scheduled_date', endDate.toISOString())
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming activities:', error);
    throw error;
  }

  return data || [];
};
