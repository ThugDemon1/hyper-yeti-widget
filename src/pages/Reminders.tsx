import React, { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, Bell, Check, X, MoreVertical } from 'lucide-react';
import { useRemindersStore } from '../stores/useRemindersStore';

export const Reminders: React.FC = () => {
  const { 
    reminders, 
    fetchReminders, 
    createReminder, 
    markComplete, 
    markIncomplete, 
    deleteReminder,
    counts 
  } = useRemindersStore();
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchReminders(activeFilter);
  }, [activeFilter, fetchReminders]);

  const filters = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  const handleToggleComplete = async (reminder: any) => {
    try {
      if (reminder.isCompleted) {
        await markIncomplete(reminder._id);
      } else {
        await markComplete(reminder._id);
      }
    } catch (error) {
      console.error('Failed to toggle reminder:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && activeFilter !== 'completed';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Reminders</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Reminder</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{filter.label}</span>
                  {filter.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.id ? 'bg-gray-100' : 'bg-gray-200'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reminders List */}
          <div className="space-y-3">
            {reminders.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeFilter === 'all' ? 'No reminders yet' : `No ${activeFilter} reminders`}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create reminders to stay on top of important tasks
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Reminder
                  </button>
                </div>
              </div>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`bg-white rounded-lg p-4 shadow-sm border transition-colors ${
                    reminder.isCompleted 
                      ? 'border-gray-200 opacity-75' 
                      : isOverdue(reminder.dueDate)
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(reminder)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        reminder.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {reminder.isCompleted && <Check className="w-3 h-3" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            reminder.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {reminder.title}
                          </h3>
                          
                          {reminder.description && (
                            <p className={`text-sm mt-1 ${
                              reminder.isCompleted ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {reminder.description}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 mt-3 text-sm">
                            <div className={`flex items-center space-x-1 ${
                              isOverdue(reminder.dueDate) ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(reminder.dueDate).toLocaleDateString()}</span>
                            </div>
                            
                            <div className={`flex items-center space-x-1 ${
                              isOverdue(reminder.dueDate) ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(reminder.dueDate).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>

                            <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(reminder.priority)}`}>
                              {reminder.priority}
                            </span>

                            {reminder.noteId && (
                              <span className="text-gray-500">
                                📝 {reminder.noteId.title}
                              </span>
                            )}
                          </div>
                        </div>

                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <CreateReminderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            try {
              await createReminder(data);
              setShowCreateModal(false);
            } catch (error) {
              console.error('Failed to create reminder:', error);
            }
          }}
        />
      )}
    </div>
  );
};

// Create Reminder Modal Component
const CreateReminderModal: React.FC<{
  onClose: () => void;
  onCreate: (data: any) => void;
}> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && dueDate) {
      const dueDatetime = new Date(`${dueDate}T${dueTime || '09:00'}`);
      onCreate({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDatetime.toISOString(),
        priority
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Reminder</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to remember?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Reminders;