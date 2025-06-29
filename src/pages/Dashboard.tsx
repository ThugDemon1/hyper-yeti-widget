import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useNotesStore } from '../stores/useNotesStore';

// Components
import { QuickStats } from '../components/dashboard/QuickStats';
import { RecentNotes } from '../components/dashboard/RecentNotes';
import { ScratchPad } from '../components/dashboard/ScratchPad';
import { QuickShortcuts } from '../components/dashboard/QuickShortcuts';
import { RecentlyCaptured } from '../components/dashboard/RecentlyCaptured';
import { UpcomingReminders } from '../components/dashboard/UpcomingReminders';
import { DashboardAnalytics } from '../components/dashboard/DashboardAnalytics';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'analytics'>('overview');
  const { user } = useAuthStore();
  const { dueReminders, checkDueReminders } = useNotesStore();
  const [shownReminders, setShownReminders] = useState<string[]>([]);

  const backgroundImage = user?.preferences?.backgroundImage;
  const greeting = user?.preferences?.greeting || 'Welcome back!';

  useEffect(() => {
    checkDueReminders();
    const interval = setInterval(() => checkDueReminders(), 60000);
    return () => clearInterval(interval);
  }, [checkDueReminders]);

  useEffect(() => {
    dueReminders.forEach(reminder => {
      if (!shownReminders.includes(reminder._id)) {
        // Show toast (replace with your toast lib if needed)
        alert(`Reminder: ${reminder.title}\n${reminder.plainTextContent?.slice(0, 100)}`);
        setShownReminders(prev => [...prev, reminder._id]);
      }
    });
  }, [dueReminders, shownReminders]);

  return (
    <div
      className="relative h-full bg-cover bg-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
      }}
    >
      <div className="absolute inset-0 bg-black/70 z-0" />

      <div className="relative h-full overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{greeting}</h1>
            <p className="text-gray-300">Here's what's happening with your notes.</p>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {activeView === 'overview' ? (
          <>
            {/* Quick Stats */}
            <QuickStats />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Notes */}
                <RecentNotes />
                
                {/* Recently Captured */}
                <RecentlyCaptured />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Shortcuts */}
                <QuickShortcuts />
                
                {/* Upcoming Reminders */}
                <UpcomingReminders />
                
                {/* Scratch Pad */}
                <ScratchPad />
              </div>
            </div>
          </>
        ) : (
          <DashboardAnalytics />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 