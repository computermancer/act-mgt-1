import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ActivityList from '../components/activities/ActivityList';
import ActivityModal from '../components/activities/ActivityModal';
import ActivityDetailsModal from '../components/activities/ActivityDetailsModal';
import { Activity, ActivityFormData } from '../types/activity';
import { supabase } from '../lib/supabaseClient';

const ActivitiesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
    setIsModalOpen(false);
  };

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleSaveActivity = async (activityData: ActivityFormData) => {
    try {
      if (selectedActivity) {
        // Update existing activity in Supabase
        const { data, error } = await supabase
          .from('activities')
          .update({
            name: activityData.name,
            location: activityData.location,
            distance: activityData.distance,
            details: activityData.details,
            notes: activityData.notes,
            scheduled_date: activityData.scheduled_date,
            activity_time: activityData.activity_time ?
              `${new Date().toISOString().split('T')[0]}T${activityData.activity_time}:00.000Z` :
              null
          })
          .eq('id', selectedActivity.id)
          .select('*')
          .single();

        if (error) throw error;

        // Update local state
        setActivities(activities.map(activity =>
          activity.id === selectedActivity.id ? { ...activity, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } : activity
        ));
      } else {
        // Add new activity to Supabase
        const { data, error } = await supabase
          .from('activities')
          .insert([{
            name: activityData.name,
            location: activityData.location,
            distance: activityData.distance,
            details: activityData.details,
            notes: activityData.notes,
            scheduled_date: activityData.scheduled_date,
            activity_time: activityData.activity_time ?
              `${new Date().toISOString().split('T')[0]}T${activityData.activity_time}:00.000Z` :
              null
          }])
          .select('*')
          .single();

        if (error) throw error;

        // Add to local state
        setActivities([{ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...activities]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) throw error;

      // Update local state
      setActivities(activities.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Activities</h2>
          <p className="text-sm text-gray-500 mt-1">
            {activities.length} {activities.length === 1 ? 'activity' : 'activities'} in total
          </p>
        </div>
        <button
          onClick={handleAddActivity}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Activity
        </button>
      </div>

      <ActivityList
        activities={activities}
        onEdit={handleEditActivity}
        onDelete={handleDeleteActivity}
        onView={handleViewActivity}
        isLoading={isLoading}
      />

      <ActivityDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditActivity}
        activity={selectedActivity}
      />

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveActivity}
        activity={selectedActivity}
      />
    </div>
  );
};

export default ActivitiesPage;
