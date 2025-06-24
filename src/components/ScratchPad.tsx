import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export const ScratchPad: React.FC = () => {
  const [content, setContent] = useState('');

  return (
    <div className="bg-yellow-50 rounded-lg p-6 shadow-sm border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-yellow-800">SCRATCH PAD</h2>
        <MoreHorizontal className="w-5 h-5 text-yellow-600 cursor-pointer hover:text-yellow-800" />
      </div>
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-32 bg-transparent placeholder-yellow-600 text-yellow-900 resize-none focus:outline-none text-sm leading-relaxed"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #fbbf24 20px)',
            backgroundSize: '100% 20px',
            lineHeight: '20px',
            paddingTop: '2px'
          }}
        />
      </div>
    </div>
  );
};