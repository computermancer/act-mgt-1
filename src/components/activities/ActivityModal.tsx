import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Activity, ActivityFormData } from '../../types/activity';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ActivityFormData) => void;
  activity: Omit<Activity, 'duration'> | null;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, activity }) => {
  const [formData, setFormData] = useState<Omit<ActivityFormData, 'scheduled_date' | 'scheduled_time'> & {
    scheduled_date: string | null;
    scheduled_time: string | null;
  }>({
    name: '',
    location: '',
    distance: 0,
    details: '',
    notes: '',
    scheduled_date: null,
    scheduled_time: null,
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        location: activity.location || '',
        distance: activity.distance || 0,
        details: activity.details || '',
        notes: activity.notes || '',
        scheduled_date: activity.scheduled_date || null,
        scheduled_time: activity.scheduled_time || null,
      });
    } else {
      setFormData({
        name: '',
        location: '',
        distance: 0,
        details: '',
        notes: '',
        scheduled_date: null,
        scheduled_time: null,
      });
    }
  }, [activity, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'distance' ? Number(value) : value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => {
      // If no date is selected, clear the scheduled_date
      if (!date) {
        return { ...prev, scheduled_date: null };
      }
      
      // Create a date string in YYYY-MM-DD format from the local date values
      // This ensures the date is preserved exactly as selected in the UI
      const localDate = new Date(date);
      // Use UTC methods to get the date in the local timezone
      const year = localDate.getUTCFullYear();
      const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localDate.getUTCDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      return {
        ...prev,
        scheduled_date: dateString,
      };
    });
  };
  
  // Helper function to create a date object from the stored date string
  const parseStoredDate = (dateString: string | null): Date | null => {
    if (!dateString) return null;
    
    // Split the date string and create a date object in the local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    // Create a date object using local timezone
    return new Date(year, month - 1, day);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a name for the activity');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
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
                {activity ? 'Edit Activity' : 'Add New Activity'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Activity Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                    Distance (miles)
                  </label>
                  <input
                    type="number"
                    name="distance"
                    id="distance"
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.distance}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700">
                    Scheduled Date
                  </label>
                  <DatePicker
                    selected={parseStoredDate(formData.scheduled_date)}
                    onChange={handleDateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholderText="Select date (optional)"
                    isClearable
                    clearButtonClassName="after:content-['×'] after:text-2xl after:text-gray-400 hover:after:text-gray-700"
                    dateFormat="MMMM d, yyyy"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={15}
                    adjustDateOnChange={false}
                  />
                </div>
                <div>
                  <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">
                    Activity Time
                  </label>
                  <input
                    type="time"
                    name="scheduled_time"
                    id="scheduled_time"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.scheduled_time || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value || null }))}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                  Details
                </label>
                <textarea
                  name="details"
                  id="details"
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.details}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={2}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  {activity ? 'Update' : 'Create'} Activity
                </button>
                <button
                  type="button"
                  onClick={onClose}
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

export default ActivityModal;
