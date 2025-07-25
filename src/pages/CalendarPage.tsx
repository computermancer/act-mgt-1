import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, Event, View } from 'react-big-calendar';
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
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };
  
  const handleView = (newView: View) => {
    setCurrentView(newView);
  };

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
    return activities
      .filter(activity => activity.scheduled_date) // Only include activities with a scheduled date
      .map(activity => {
        // Create a date object from the scheduled_date (format: YYYY-MM-DD)
        const [year, month, day] = activity.scheduled_date!.split('-').map(Number);
        const start = new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
        
        // If we have a scheduled_time, set the hours and minutes
        if (activity.scheduled_time) {
          const [hours, minutes] = activity.scheduled_time.split(':').map(Number);
          start.setHours(hours, minutes, 0, 0);
        } else {
          // Default to 12:00 PM if no time is specified
          start.setHours(12, 0, 0, 0);
        }
        
        const end = new Date(start);
        end.setHours(start.getHours() + 1); // Set end time to 1 hour after start time

        return {
          title: `${activity.name}${activity.location ? ` - ${activity.location}` : ''}`,
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
          view={currentView}
          onView={handleView}
          date={currentDate}
          onNavigate={handleNavigate}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          style={{ height: 600 }}
          components={{
            toolbar: (props) => (
              <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date())}
                    className="rbc-btn"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date(currentDate);
                      if (currentView === 'week') {
                        date.setDate(date.getDate() - 7);
                      } else if (currentView === 'day') {
                        date.setDate(date.getDate() - 1);
                      } else {
                        date.setMonth(date.getMonth() - 1);
                      }
                      setCurrentDate(date);
                    }}
                    className="rbc-btn"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const date = new Date(currentDate);
                      if (currentView === 'week') {
                        date.setDate(date.getDate() + 7);
                      } else if (currentView === 'day') {
                        date.setDate(date.getDate() + 1);
                      } else {
                        date.setMonth(date.getMonth() + 1);
                      }
                      setCurrentDate(date);
                    }}
                    className="rbc-btn"
                  >
                    ›
                  </button>
                </span>
                <span className="rbc-toolbar-label">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <span className="rbc-btn-group">
                  <button
                    type="button"
                    className={currentView === 'month' ? 'rbc-active' : ''}
                    onClick={() => setCurrentView('month')}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    className={currentView === 'week' ? 'rbc-active' : ''}
                    onClick={() => setCurrentView('week')}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    className={currentView === 'day' ? 'rbc-active' : ''}
                    onClick={() => setCurrentView('day')}
                  >
                    Day
                  </button>
                </span>
              </div>
            ),
          }}
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
