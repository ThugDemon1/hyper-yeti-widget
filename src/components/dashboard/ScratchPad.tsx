import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export const ScratchPad: React.FC = () => {
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    // Load saved content from localStorage
    const saved = localStorage.getItem('scratchpad-content');
    if (saved) {
      setContent(saved);
    }
  }, []);

  useEffect(() => {
    // Auto-save to localStorage
    const timeout = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem('scratchpad-content', content);
        setLastSaved(new Date());
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [content]);

  return (
    <div className="bg-yellow-50 rounded-lg p-6 shadow-sm border-2 border-yellow-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-yellow-800">Scratch Pad</h2>
        <div className="flex items-center space-x-2 text-xs text-yellow-600">
          {lastSaved && (
            <>
              <Save className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down quick thoughts, ideas, or reminders..."
          className="w-full h-32 bg-transparent placeholder-yellow-600 text-yellow-900 resize-none focus:outline-none text-sm leading-relaxed"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 19px, #fbbf24 20px)',
            backgroundSize: '100% 20px',
            lineHeight: '20px',
            paddingTop: '2px'
          }}
        />
      </div>
      
      <div className="mt-3 text-xs text-yellow-600">
        {content.length} characters • Auto-saves as you type
      </div>
    </div>
  );
};