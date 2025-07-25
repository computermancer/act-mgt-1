import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ActivityModal from '../components/activities/ActivityModal';
import { Activity, ActivityFormData } from '../types/activity';
import { supabase } from '../lib/supabaseClient';

const ActivitiesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityToDelete, setActivityToDelete] = useState<{id: string, name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      try {
        // First, fetch all activities
        const { data, error } = await supabase
          .from('activities')
          .select('*');

        if (error) throw error;
        
        // Sort activities: first by scheduled_date (nulls last), then by created_at (newest first)
        const sortedActivities = [...(data || [])].sort((a, b) => {
          // If both have scheduled_date, sort by it (newest first)
          if (a.scheduled_date && b.scheduled_date) {
            return new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime();
          }
          // If only one has scheduled_date, it comes first
          if (a.scheduled_date) return -1;
          if (b.scheduled_date) return 1;
          // If neither has scheduled_date, sort by created_at
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setActivities(sortedActivities);
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
      // scheduled_date should already be in YYYY-MM-DD format from the form
      const formattedScheduledDate = activityData.scheduled_date || null;
      
      // Format the scheduled_time - if it's not provided, set it to null
      const formattedScheduledTime = activityData.scheduled_time || null;

      let updatedActivity: Activity;

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
            scheduled_date: formattedScheduledDate,
            scheduled_time: formattedScheduledTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedActivity.id)
          .select('*')
          .single();

        if (error) throw error;
        updatedActivity = data;

        // Update local state
        setActivities(activities.map(activity =>
          activity.id === selectedActivity.id ? updatedActivity : activity
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
            scheduled_date: formattedScheduledDate,
            scheduled_time: formattedScheduledTime,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select('*')
          .single();

        if (error) throw error;
        updatedActivity = data;

        if (error) throw error;

        // Add to local state
        setActivities([{ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...activities]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteClick = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivityToDelete({ id: activity.id, name: activity.name });
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityToDelete.id);

      if (error) throw error;

      // Update local state
      setActivities(activities.filter(activity => activity.id !== activityToDelete.id));
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const cancelDeleteActivity = () => {
    setActivityToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatScheduledDateTime = (activity: Activity) => {
    if (!activity.scheduled_date) return 'Not scheduled';
    
    const date = new Date(activity.scheduled_date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!activity.scheduled_time) return formattedDate;
    
    const [hours, minutes] = activity.scheduled_time.split(':');
    const time = new Date();
    time.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    const formattedTime = time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Activities</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all your activities.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleAddActivity}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {isLoading ? 'Loading...' : 'Add Activity'}
          </button>
        </div>
      </div>

      {isLoading && !activities.length ? (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-8">
          {activities.length === 0 ? (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new activity.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer flex flex-col"
                  onClick={() => handleViewActivity(activity)}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activity.name}
                        </h3>
                        {activity.location || (activity.distance !== undefined && activity.distance > 0) ? (
                          <div className="flex items-center mt-1">
                            {activity.location && (
                              <span className="text-sm font-normal text-gray-500">
                                {activity.location}
                              </span>
                            )}
                            {activity.location && activity.distance !== undefined && activity.distance > 0 && (
                              <span className="mx-2 text-gray-300">•</span>
                            )}
                            {activity.distance !== undefined && activity.distance > 0 && (
                              <span className="text-sm font-normal text-gray-500">
                                {activity.distance} km
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditActivity(activity);
                          }}
                          className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(activity, e)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </div>
                    
                    {activity.details && (
                      <div className="mt-2 flex-1 overflow-hidden">
                        <p className="text-gray-500 text-sm line-clamp-3">
                          {activity.details}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <div className="text-xs">
                        {activity.scheduled_date ? (
                          <span className="text-blue-600">
                            Scheduled: {formatScheduledDateTime(activity)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not scheduled</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {activityToDelete && (
        <div className="fixed z-30 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Activity
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{activityToDelete.name}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDeleteActivity}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={cancelDeleteActivity}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {isDetailsOpen && selectedActivity && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-6 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedActivity.name}
                      {selectedActivity.location && (
                        <span className="text-base font-normal text-gray-500 ml-2">
                          • {selectedActivity.location}
                        </span>
                      )}
                    </h3>
                    {selectedActivity.distance && (
                      <p className="text-sm text-gray-500 mt-1">
                        Distance: {selectedActivity.distance} km
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">Close</span>
                  </button>
                </div>
                
                {selectedActivity.scheduled_date && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800">
                      {formatScheduledDateTime(selectedActivity)}
                    </p>
                  </div>
                )}
                
                <div className="prose max-w-none mt-4">
                  {selectedActivity.details ? (
                    <div className="whitespace-pre-wrap">{selectedActivity.details}</div>
                  ) : (
                    <p className="text-gray-400 italic">No details provided</p>
                  )}
                </div>
                
                {selectedActivity.notes && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedActivity.notes}
                    </div>
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Created: {formatDate(selectedActivity.created_at)}
                    <br />
                    Last updated: {formatDate(selectedActivity.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Editor Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={handleSaveActivity}
        activity={selectedActivity}
      />
    </div>
  );
};

export default ActivitiesPage;
