import React, { useEffect } from 'react';
import { Bell, Calendar, Clock } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useNavigate } from 'react-router-dom';

export const UpcomingReminders: React.FC = () => {
  const { upcomingReminders, fetchUpcomingReminders, completeReminder } = useNotesStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUpcomingReminders();
  }, [fetchUpcomingReminders]);

  const handleCompleteReminder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await completeReminder(id);
    } catch (error) {
      console.error('Failed to complete reminder:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Upcoming Reminders</h2>
        <button
          onClick={() => navigate('/reminders')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {upcomingReminders.length > 0 ? (
          upcomingReminders.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate('/reminders')}
              className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <button
                onClick={(e) => handleCompleteReminder(note._id, e)}
                className="mt-0.5 w-4 h-4 border-2 border-gray-300 rounded hover:border-green-500 transition-colors"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{note.reminderDate ? new Date(note.reminderDate).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{note.reminderDate ? new Date(note.reminderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              </div>
              <Bell className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming reminders</p>
            <button
              onClick={() => navigate('/reminders')}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Create a reminder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};