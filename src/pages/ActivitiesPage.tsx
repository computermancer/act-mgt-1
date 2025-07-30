import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import ActivityModal from '../components/activities/ActivityModal';
import CompleteActivityModal from '../components/activities/CompleteActivityModal';
import { Activity, ActivityFormData } from '../types/activity';
import { supabase } from '../lib/supabaseClient';

interface ActivityBase {
  id: string;
  name: string;
  location?: string;
  distance?: number;
  details?: string;
  notes?: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  created_at: string;
  updated_at: string;
}

const ActivitiesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityBase | null>(null);
  const [activities, setActivities] = useState<ActivityBase[]>([]);
  const [activityToDelete, setActivityToDelete] = useState<{id: string, name: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastCompletedActivity, setLastCompletedActivity] = useState<{id: string, name: string} | null>(null);




  // Load activities from Supabase
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      
      // Fetch only non-archived activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .is('is_archived', null);

      if (activitiesError) throw activitiesError;
      
      // Sort activities based on hierarchy:
      // 1. Scheduled activities (soonest first)
      // 2. Activities with details (most recently updated first)
      // 3. Activities with just a title (most recently created first)
      const sortedActivities = [...(activitiesData || [])].sort((a, b) => {
        // Both activities are scheduled - sort by date (soonest first)
        if (a.scheduled_date && b.scheduled_date) {
          return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
        }
        
        // Only A is scheduled
        if (a.scheduled_date) return -1;
        // Only B is scheduled
        if (b.scheduled_date) return 1;
        
        // Check if activities have additional information
        const aHasDetails = a.location || a.distance || a.details || a.notes;
        const bHasDetails = b.location || b.distance || b.details || b.notes;
        
        // Both have details - sort by last updated (newest first)
        if (aHasDetails && bHasDetails) {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        
        // Only A has details
        if (aHasDetails) return -1;
        // Only B has details
        if (bHasDetails) return 1;
        
        // Both are just titles - sort by creation date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      console.log('Activities data:');
      console.table(activities.map(a => ({
        name: a.name,
        distance: a.distance,
        location: a.location,
        scheduled_date: a.scheduled_date
      })));
      
      // Also log the first activity's full details
      console.log('First activity details:', activities[0]);
    }
  }, [activities]);

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleViewActivity = (activity: ActivityBase) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const handleEditActivity = (activity: ActivityBase) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCompleteClick = (activity: ActivityBase, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedActivity(activity);
    setIsCompleting(true);
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

        // Add to local state
        setActivities([{ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...activities]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteClick = (activity: ActivityBase, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivityToDelete({ id: activity.id, name: activity.name });
  };

  const handleActivityCompleted = async (archivedId: string) => {
    try {
      // Remove the completed activity from the active list
      setActivities(prev => prev.filter(activity => activity.id !== selectedActivity?.id));
      
      // Set the last completed activity for potential recreation
      if (selectedActivity) {
        setLastCompletedActivity({
          id: selectedActivity.id,
          name: selectedActivity.name
        });
      }
    } catch (error) {
      console.error('Error handling activity completion:', error);
    } finally {
      setIsCompleting(false);
      setSelectedActivity(null);
    }
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
      setActivities(prev => prev.filter(activity => activity.id !== activityToDelete.id));
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const cancelDeleteActivity = () => {
    setActivityToDelete(null);
  };

  // Handle closing the activity details modal
  const closeActivityDetails = () => {
    setIsDetailsOpen(false);
    setSelectedActivity(null);
  };

  const formatScheduledDateTime = (activity: ActivityBase): string => {
    if (!activity.scheduled_date) return 'Not scheduled';
    
    try {
      // Parse the date string directly (format: YYYY-MM-DD)
      const [year, month, day] = activity.scheduled_date.split('-').map(Number);
      
      // Create a date object in local timezone
      const date = new Date(year, month - 1, day);
      
      // Format the date parts manually to avoid timezone issues
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const weekday = weekdays[date.getDay()];
      const monthName = months[date.getMonth()];
      
      let formattedDate = `${weekday}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
      
      if (activity.scheduled_time) {
        const [hours, minutes] = activity.scheduled_time.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        
        // Validate time values
        if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12; // Convert to 12-hour format
          const displayMinute = minute.toString().padStart(2, '0');
          
          formattedDate += ` at ${displayHour}:${displayMinute} ${period}`;
        }
      }
      
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error);
      return activity.scheduled_date; // Return the raw date string if formatting fails
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <button
          onClick={handleAddActivity}
          className="flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Activity
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No activities found. Add your first activity to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewActivity(activity)}
            >
              <div className="flex justify-between items-start">
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">{activity.name}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {/* Location and Distance */}
                    <div className="space-y-1">
                      {activity.location && (
                        <div className="flex items-start">
                          <span className="font-medium w-20">Location:</span>
                          <span className="flex-1 bg-gray-50 px-2 py-1 rounded">{activity.location}</span>
                        </div>
                      )}
                      
                      {/* Scheduled Date/Time */}
                      {activity.scheduled_date && (
                        <div className="flex items-start">
                          <span className="font-medium w-20">When:</span>
                          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">{formatScheduledDateTime(activity)}</span>
                        </div>
                      )}
                      
                      {(activity.distance !== undefined && activity.distance !== null && activity.distance > 0) && (
                        <div className="flex items-start">
                          <span className="font-medium w-20">Distance:</span>
                          <span className="bg-gray-50 px-2 py-1 rounded">{activity.distance} miles</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  {activity.details && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900">Details:</h4>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        <p className="line-clamp-2">{activity.details}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes Section */}
                  {activity.notes && (
                    <div className="space-y-2 mt-3 pt-2 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900">Notes:</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="line-clamp-2">{activity.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteClick(activity, e);
                    }}
                    className="text-green-600 hover:text-green-800"
                    title="Mark as completed"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditActivity(activity);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit activity"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivityToDelete({ id: activity.id, name: activity.name });
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete activity"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                    {selectedActivity.distance !== undefined && selectedActivity.distance > 0 && (
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Editor Modal */}
      {isModalOpen && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedActivity(null);
          }}
          onSave={handleSaveActivity}
          activity={selectedActivity}
        />
      )}

      {selectedActivity && isCompleting && (
        <CompleteActivityModal
          isOpen={isCompleting}
          onClose={() => {
            setIsCompleting(false);
            setSelectedActivity(null);
          }}
          activityId={selectedActivity.id}
          activityName={selectedActivity.name}
          onActivityCompleted={handleActivityCompleted}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;
