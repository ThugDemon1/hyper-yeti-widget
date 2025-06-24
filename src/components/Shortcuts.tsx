import React from 'react';
import { MoreHorizontal, Briefcase, Users, UserCheck, Search, FileText, TrendingUp, CheckSquare, User } from 'lucide-react';
import { shortcuts } from '../data/mockData';

const iconMap = {
  briefcase: Briefcase,
  users: Users,
  'user-check': UserCheck,
  search: Search,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'check-square': CheckSquare,
  user: User
};

export const Shortcuts: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">SHORTCUTS</h2>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((shortcut) => {
          const IconComponent = iconMap[shortcut.icon as keyof typeof iconMap];
          return (
            <div
              key={shortcut.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {shortcut.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};