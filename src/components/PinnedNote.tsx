import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { notes } from '../data/mockData';

export const PinnedNote: React.FC = () => {
  const pinnedNote = notes.find(note => note.isPinned);

  if (!pinnedNote) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">PINNED NOTE</h2>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">{pinnedNote.title}</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Goal</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Capture the green homes market in the Bay Area and establish ourselves as the premier provider of eco-friendly housing solutions. Focus on sustainable materials, energy efficiency, and innovative design approaches.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Analysis</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-100 p-2 rounded">
                <div className="font-semibold text-green-800">Strengths</div>
                <div className="text-green-700">• Strong team<br/>• Market knowledge</div>
              </div>
              <div className="bg-red-100 p-2 rounded">
                <div className="font-semibold text-red-800">Weaknesses</div>
                <div className="text-red-700">• Limited capital<br/>• New brand</div>
              </div>
              <div className="bg-blue-100 p-2 rounded">
                <div className="font-semibold text-blue-800">Opportunities</div>
                <div className="text-blue-700">• Growing demand<br/>• Gov incentives</div>
              </div>
              <div className="bg-orange-100 p-2 rounded">
                <div className="font-semibold text-orange-800">Threats</div>
                <div className="text-orange-700">• Competition<br/>• Regulations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};