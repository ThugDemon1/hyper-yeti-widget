import { create } from 'zustand';
import api from '../lib/api';

export interface Reminder {
  _id: string;
  title: string;
  description: string;
  userId: string;
  noteId?: {
    _id: string;
    title: string;
  };
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  completedAt?: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval: number;
  snoozeUntil?: string;
  notificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RemindersState {
  reminders: Reminder[];
  overdueReminders: Reminder[];
  upcomingReminders: Reminder[];
  completedReminders: Reminder[];
  loading: boolean;
  counts: {
    all: number;
    today: number;
    upcoming: number;
    overdue: number;
    completed: number;
  };

  // Actions
  fetchReminders: (filter?: string) => Promise<void>;
  createReminder: (data: Partial<Reminder>) => Promise<Reminder>;
  updateReminder: (id: string, data: Partial<Reminder>) => Promise<Reminder>;
  deleteReminder: (id: string) => Promise<void>;
  markComplete: (id: string) => Promise<void>;
  markIncomplete: (id: string) => Promise<void>;
  snoozeReminder: (id: string, snoozeUntil: string) => Promise<void>;
  bulkOperation: (action: string, reminderIds: string[], data?: any) => Promise<void>;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  overdueReminders: [],
  upcomingReminders: [],
  completedReminders: [],
  loading: false,
  counts: {
    all: 0,
    today: 0,
    upcoming: 0,
    overdue: 0,
    completed: 0
  },

  fetchReminders: async (filter = 'all') => {
    set({ loading: true });
    try {
      const response = await api.get('/reminders', { 
        params: { filter } 
      });
      
      set({ 
        reminders: response.data.reminders,
        counts: response.data.counts,
        loading: false 
      });
    } catch (error) {
      console.error('Fetch reminders error:', error);
      set({ loading: false });
    }
  },

  createReminder: async (data: Partial<Reminder>) => {
    try {
      const response = await api.post('/reminders', data);
      const newReminder = response.data;
      
      set(state => ({
        reminders: [newReminder, ...state.reminders],
        counts: {
          ...state.counts,
          all: state.counts.all + 1
        }
      }));
      
      return newReminder;
    } catch (error) {
      console.error('Create reminder error:', error);
      throw error;
    }
  },

  updateReminder: async (id: string, data: Partial<Reminder>) => {
    try {
      const response = await api.put(`/reminders/${id}`, data);
      const updatedReminder = response.data;
      
      set(state => ({
        reminders: state.reminders.map(reminder => 
          reminder._id === id ? updatedReminder : reminder
        )
      }));
      
      return updatedReminder;
    } catch (error) {
      console.error('Update reminder error:', error);
      throw error;
    }
  },

  deleteReminder: async (id: string) => {
    try {
      await api.delete(`/reminders/${id}`);
      set(state => ({
        reminders: state.reminders.filter(reminder => reminder._id !== id),
        counts: {
          ...state.counts,
          all: state.counts.all - 1
        }
      }));
    } catch (error) {
      console.error('Delete reminder error:', error);
      throw error;
    }
  },

  markComplete: async (id: string) => {
    try {
      const response = await api.put(`/reminders/${id}/complete`);
      const updatedReminder = response.data;
      
      set(state => ({
        reminders: state.reminders.map(reminder => 
          reminder._id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error('Mark complete error:', error);
      throw error;
    }
  },

  markIncomplete: async (id: string) => {
    try {
      const response = await api.put(`/reminders/${id}/incomplete`);
      const updatedReminder = response.data;
      
      set(state => ({
        reminders: state.reminders.map(reminder => 
          reminder._id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error('Mark incomplete error:', error);
      throw error;
    }
  },

  snoozeReminder: async (id: string, snoozeUntil: string) => {
    try {
      const response = await api.put(`/reminders/${id}/snooze`, { snoozeUntil });
      const updatedReminder = response.data;
      
      set(state => ({
        reminders: state.reminders.map(reminder => 
          reminder._id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      console.error('Snooze reminder error:', error);
      throw error;
    }
  },

  bulkOperation: async (action: string, reminderIds: string[], data?: any) => {
    try {
      await api.post('/reminders/bulk', { action, reminderIds, data });
      // Refresh reminders list
      get().fetchReminders();
    } catch (error) {
      console.error('Bulk reminder operation error:', error);
      throw error;
    }
  },
}));