export interface Activity {
  id: string;
  name: string;
  location?: string;
  distance?: number;
  details?: string;
  notes?: string;
  activity_time?: string;
  scheduled_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityFormData {
  name: string;
  location?: string;
  distance?: number;
  details?: string;
  notes?: string;
  activity_time?: string;
  scheduled_date?: string | null;
}
