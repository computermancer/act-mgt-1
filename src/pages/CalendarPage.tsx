import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Event } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Activity, ActivityFormData } from '../types/activity';
import ActivityModal from '../components/activities/ActivityModal';
import ActivityDetailsModal from '../components/activities/ActivityDetailsModal';
import { supabase } from '../lib/supabaseClient';

interface CalendarEvent extends Event {
  activity: Activity;
}

// Define the parse function for the localizer
const parseDate = (dateString: string) => {
  return parseISO(dateString);
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseDate,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-US': enUS },
});

const CalendarPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Format activities for the calendar
  const events = useMemo<CalendarEvent[]>(() => {
    return activities.map(activity => {
      const start = activity.scheduled_date ? new Date(activity.scheduled_date) : new Date();
      const end = new Date(start);
      end.setHours(start.getHours() + 1); // Set end time to 1 hour after start time

      return {
        title: `${activity.name} - ${activity.location}`,
        start,
        end,
        allDay: false,
        activity,
      };
    });
  }, [activities]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.activity);
    setIsDetailsOpen(true);
    setIsModalOpen(false);
  };

  const handleAddActivity = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
    setIsDetailsOpen(false);
  };

  const handleSaveActivity = (activityData: ActivityFormData) => {
    // TODO: Implement save to Supabase
    console.log('Saving activity:', activityData);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Calendar</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: 600 }}
        />
      </div>

      {selectedEvent && (
        <div>
          <ActivityDetailsModal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            onEdit={handleAddActivity}
            activity={selectedEvent}
          />

          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveActivity}
            activity={selectedEvent}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
