import React from 'react';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Activity } from '../../types/activity';
import Modal from '../common/Modal';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (activity: Activity) => void;
  activity: Activity | null;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({ isOpen, onClose, onEdit, activity }) => {
  if (!activity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Activity Details
            </h3>
            <div className="mt-2">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-sm text-gray-900">{activity.name}</div>
                </div>
                {activity.location && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Location</div>
                    <div className="text-sm text-gray-900">{activity.location}</div>
                  </div>
                )}
                {activity.distance && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Distance</div>
                    <div className="text-sm text-gray-900">{activity.distance} miles</div>
                  </div>
                )}
                {activity.details && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Details</div>
                    <div className="text-sm text-gray-900">{activity.details}</div>
                  </div>
                )}
                {activity.scheduled_date && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Scheduled Date</div>
                    <div className="text-sm text-gray-900">
                      {new Date(activity.scheduled_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {activity.activity_time && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Time</div>
                    <div className="text-sm text-gray-900">{activity.activity_time}</div>
                  </div>
                )}
                {activity.notes && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Notes</div>
                    <div className="text-sm text-gray-900">{activity.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          onClick={() => onEdit(activity!)}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
        >
          <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Edit Activity
        </button>
        <button
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          <XMarkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ActivityDetailsModal;
