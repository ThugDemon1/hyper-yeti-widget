import React from 'react';
import { ChevronRight, Mountain } from 'lucide-react';
import { notes } from '../data/mockData';

export const NotesSection: React.FC = () => {
  const displayNotes = notes.slice(0, 4);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">NOTES</h2>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex space-x-4 mb-4">
        <button className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Recent
        </button>
        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-full text-sm font-medium transition-colors">
          Suggested
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {displayNotes.map((note) => (
          <div key={note.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">
                {note.title}
              </h3>
              {note.category === 'business' && (
                <Mountain className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
              )}
            </div>
            
            {note.thumbnail && (
              <div className="mb-3">
                <img
                  src={note.thumbnail}
                  alt={note.title}
                  className="w-full h-20 object-cover rounded"
                />
              </div>
            )}
            
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {note.preview}
            </p>
            
            <div className="text-xs text-gray-500">
              {note.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};