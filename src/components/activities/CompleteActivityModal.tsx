import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabaseClient';

interface CompleteActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityName: string;
  onActivityCompleted: (archivedId: string) => void;
}

const CompleteActivityModal: React.FC<CompleteActivityModalProps> = ({
  isOpen,
  onClose,
  activityId,
  activityName,
  onActivityCompleted,
}) => {
  const [completionDate, setCompletionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [completionTime, setCompletionTime] = useState<string>(
    new Date().toTimeString().substring(0, 5)
  );
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the update data object
      const updateData: any = {
        is_archived: true,
        archive_notes: completionNotes,
        completed_date: completionDate,
        scheduled_date: null,  // Clear scheduled date to remove from calendar
        scheduled_time: null,  // Clear scheduled time
        updated_at: new Date().toISOString()
      };
      
      // If time is provided, add it to the update
      if (completionTime) {
        updateData.completed_time = completionTime;
      }
      
      // Update the activity to mark it as completed/archived
      const { data: updatedActivity, error: updateError } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activityId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Call the success callback with the updated activity ID
      onActivityCompleted(updatedActivity.id);
      onClose();
    } catch (err) {
      console.error('Error archiving activity:', err);
      setError('Failed to mark activity as completed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Mark Activity as Completed
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                disabled={isSubmitting}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  You're about to mark <span className="font-medium">{activityName}</span> as completed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="completionTime" className="block text-sm font-medium text-gray-700">
                    Completion Time (optional)
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="time"
                      id="completionTime"
                      className="flex-1 min-w-0 block w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={completionTime}
                      onChange={(e) => setCompletionTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setCompletionTime('')}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting || !completionTime}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="completionNotes" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  id="completionNotes"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm mt-2">{error}</div>
              )}

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : 'Mark as Completed'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteActivityModal;
