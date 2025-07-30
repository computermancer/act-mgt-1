import React, { useState, useEffect } from 'react';
import { TrashIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

interface ArchivedActivity {
  id: string;
  name: string;
  location?: string;
  distance?: number;
  details?: string;
  notes?: string;
  archive_notes?: string;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  created_at: string;
  updated_at: string;
  completed_date?: string;
  completed_time?: string;
  is_archived: boolean;
}

const ArchivedActivitiesPage: React.FC = () => {
  const [archivedActivities, setArchivedActivities] = useState<ArchivedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ArchivedActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<ArchivedActivity | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Load archived activities from Supabase
  const loadArchivedActivities = async () => {
    try {
      setIsLoading(true);
      
      // Fetch only archived activities
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setArchivedActivities(data || []);
    } catch (error) {
      console.error('Error loading archived activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchivedActivities();
  }, []);

  // Handle permanent deletion of an archived activity
  const handleDeletePermanently = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setArchivedActivities(prev => prev.filter(activity => activity.id !== id));
      setShowDeleteDialog(false);
      setActivityToDelete(null);
    } catch (error) {
      console.error('Error deleting archived activity:', error);
    }
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      await handleDeletePermanently(activityToDelete.id);
    }
  };

  const handleViewActivity = (activity: ArchivedActivity) => {
    setSelectedActivity(activity);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Use UTC methods to avoid timezone conversion
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ));
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    };
    return utcDate.toLocaleDateString(undefined, options);
  };

  const formatCompletedDate = (activity: ArchivedActivity) => {
    if (!activity.completed_date) return 'N/A';
    
    // Parse the date string directly (format: YYYY-MM-DD)
    const [year, month, day] = activity.completed_date.split('-').map(Number);
    
    // Format the date without any timezone conversion
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let formattedDate = `${monthNames[month - 1]} ${day}, ${year}`;
    
    // Add time if it exists
    if (activity.completed_time) {
      // Parse the time string directly (format: HH:MM)
      const [hours, minutes] = activity.completed_time.split(':').map(Number);
      
      // Format time in 12-hour format with AM/PM
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      formattedDate += `, ${displayHours}:${displayMinutes} ${period}`;
    }
    
    return formattedDate;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Archived Activities</h1>
      </div>

      {archivedActivities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No archived activities found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {archivedActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium">{activity.name}</h3>
                  </div>
                  
                  {activity.location && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Location:</span> {activity.location}
                    </p>
                  )}
                  
                  {activity.distance !== undefined && activity.distance > 0 && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Distance:</span> {activity.distance} miles
                    </p>
                  )}
                  
                  <div className="space-y-3 mt-3">
                    {/* Location Section */}
                    {activity.location && (
                      <div className="border-l-4 border-gray-200 pl-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Location</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {activity.location}
                        </p>
                      </div>
                    )}
                    
                    {/* Original Details Section */}
                    <div className="border-l-4 border-gray-200 pl-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Original Details</h4>
                      <div className="p-2 bg-gray-50 rounded space-y-1 text-sm text-gray-600">
                        {activity.distance !== undefined && activity.distance > 0 && (
                          <p><span className="font-medium">Distance:</span> {activity.distance} miles</p>
                        )}
                        {activity.details && (
                          <div className="mt-1">
                            <p className="whitespace-pre-line">{activity.details}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Original Notes Section */}
                    {activity.notes && (
                      <div className="border-l-4 border-gray-200 pl-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Original Notes</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded">
                          {activity.notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Archive Notes Section */}
                    {activity.archive_notes && (
                      <div className="border-l-4 border-blue-200 pl-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Archive Notes</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line bg-blue-50 p-2 rounded">
                          {activity.archive_notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Completed On Section */}
                    <div className="border-l-4 border-green-200 pl-3 mt-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Completed On</h4>
                      <div className="p-2 bg-green-50 rounded text-sm text-gray-600">
                        <p>{formatCompletedDate(activity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewActivity(activity);
                    }}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                    title="View details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivityToDelete(activity);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete permanently"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {activityToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to permanently delete "{activityToDelete.name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setActivityToDelete(null);
                  setShowDeleteDialog(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivity && isDetailsOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsDetailsOpen(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedActivity.name}</h2>
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6 mt-4">
              {/* Location Section */}
              {selectedActivity.location && (
                <div className="border-l-4 border-gray-200 pl-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-700">{selectedActivity.location}</p>
                  </div>
                </div>
              )}
              
              {/* Original Details Section */}
              <div className="border-l-4 border-gray-200 pl-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Original Details</h3>
                <div className="p-3 bg-gray-50 rounded space-y-2">
                  {selectedActivity.distance !== undefined && selectedActivity.distance > 0 && (
                    <p className="text-gray-700"><span className="font-medium">Distance:</span> {selectedActivity.distance} miles</p>
                  )}
                  {selectedActivity.details && (
                    <div className="mt-2">
                      <p className="text-gray-700 whitespace-pre-line">{selectedActivity.details}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Original Notes Section */}
              {selectedActivity.notes && (
                <div className="border-l-4 border-gray-200 pl-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Original Notes</h3>
                  <div className="p-3 bg-gray-50 rounded">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedActivity.notes}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Archive Notes Section */}
              {selectedActivity.archive_notes && (
                <div className="border-l-4 border-blue-200 pl-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Archive Notes</h3>
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedActivity.archive_notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedActivitiesPage;
