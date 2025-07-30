-- Create archived_activities table
CREATE TABLE IF NOT EXISTS public.archived_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  activity_id UUID NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  distance NUMERIC(10, 2),
  details TEXT,
  notes TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on archived_activities
ALTER TABLE public.archived_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for archived_activities
CREATE POLICY "Users can view their own archived activities"
  ON public.archived_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own archived activities"
  ON public.archived_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to archive an activity
CREATE OR REPLACE FUNCTION public.archive_activity(
  p_activity_id UUID,
  p_completion_notes TEXT DEFAULT NULL
) 
RETURNS UUID AS $$
DECLARE
  v_archived_id UUID;
  v_user_id UUID;
  v_activity RECORD;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Get the activity to be archived
  SELECT * INTO v_activity 
  FROM public.activities 
  WHERE id = p_activity_id AND user_id = v_user_id
  FOR UPDATE;
  
  IF v_activity IS NULL THEN
    RAISE EXCEPTION 'Activity not found or access denied';
  END IF;
  
  -- Insert into archived_activities
  INSERT INTO public.archived_activities (
    user_id,
    activity_id,
    name,
    location,
    distance,
    details,
    notes,
    scheduled_date,
    scheduled_time,
    completion_notes
  ) VALUES (
    v_user_id,
    v_activity.id,
    v_activity.name,
    v_activity.location,
    v_activity.distance,
    v_activity.details,
    v_activity.notes,
    v_activity.scheduled_date::DATE,
    v_activity.scheduled_time,
    p_completion_notes
  )
  RETURNING id INTO v_archived_id;
  
  -- Delete the original activity
  DELETE FROM public.activities WHERE id = p_activity_id;
  
  RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
