import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { recentItems } from '../data/mockData';

const tabs = ['Web Clips', 'Images', 'Documents', 'Audio', 'Email'];

export const RecentlyCaptured: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Web Clips');

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">RECENTLY CAPTURED</h2>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      <div className="flex space-x-4 mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};