import React from 'react';
import { 
  Search, 
  Plus, 
  Home, 
  Zap, 
  FileText, 
  Book, 
  Users, 
  Bell, 
  Tag, 
  Trash2, 
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { navigationItems } from '../data/mockData';

const iconMap = {
  home: Home,
  zap: Zap,
  'file-text': FileText,
  book: Book,
  users: Users,
  bell: Bell,
  tag: Tag,
  'trash-2': Trash2
};

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      {/* User Profile */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
            J
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium">Jamie</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:bg-gray-600"
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-4 pb-4">
        <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {navigationItems.map((item) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          return (
            <div key={item.id} className="mb-1">
              <div className="flex items-center justify-between px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 text-gray-400 text-sm">
          <HelpCircle className="w-4 h-4" />
          <span>Need a little help?</span>
        </div>
      </div>
    </div>
  );
};