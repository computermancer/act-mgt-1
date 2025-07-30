import React from 'react';
import { PencilIcon, TrashIcon, ClockIcon, MapPinIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Activity } from '../../types/activity';

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  onView: (activity: Activity) => void;
  isLoading: boolean;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
  activities, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first activity.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <li key={activity.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {activity.name}
                  </h3>
                  {activity.scheduled_date && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Scheduled
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="flex items-center text-sm text-gray-500">
                    {activity.distance !== undefined && activity.distance > 0 && (
                    <>
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      {activity.distance} mi
                    </>
                  )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                    {activity.location}
                  </div>
                  {activity.scheduled_date && (
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                      {new Date(activity.scheduled_date).toLocaleDateString()}
                    </div>
                  )}

                </div>
                {activity.details && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {activity.details}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => onView(activity)}
                  className="mr-2 text-gray-600 hover:text-gray-900"
                >
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onEdit(activity)}
                  className="mr-2 text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => onDelete(activity.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;
