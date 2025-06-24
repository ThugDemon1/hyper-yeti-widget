import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { key: '⌘ + K', description: 'Search notes' },
      { key: '⌘ + N', description: 'New note' },
      { key: '⌘ + 1', description: 'Go to Dashboard' },
      { key: '⌘ + 2', description: 'Go to Notes' },
      { key: '⌘ + 3', description: 'Go to Notebooks' },
      { key: '⌘ + 4', description: 'Go to Tags' },
    ]
  },
  {
    category: 'Note Actions',
    items: [
      { key: '⌘ + S', description: 'Save note' },
      { key: '⌘ + D', description: 'Duplicate note' },
      { key: '⌘ + P', description: 'Pin/Unpin note' },
      { key: '⌘ + Delete', description: 'Delete note' },
      { key: '⌘ + E', description: 'Export note' },
    ]
  },
  {
    category: 'Text Editing',
    items: [
      { key: '⌘ + B', description: 'Bold' },
      { key: '⌘ + I', description: 'Italic' },
      { key: '⌘ + U', description: 'Underline' },
      { key: '⌘ + Z', description: 'Undo' },
      { key: '⌘ + Y', description: 'Redo' },
      { key: '⌘ + A', description: 'Select all' },
    ]
  },
  {
    category: 'View',
    items: [
      { key: '⌘ + L', description: 'List view' },
      { key: '⌘ + G', description: 'Grid view' },
      { key: '⌘ + T', description: 'Toggle dark mode' },
      { key: '⌘ + M', description: 'Toggle sidebar' },
    ]
  }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <p className="text-gray-500 dark:text-gray-400">Master your productivity with these shortcuts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-500">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Command className="w-4 h-4" />
                <span>Mac</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-4 h-4 bg-gray-400 rounded text-white text-xs flex items-center justify-center font-bold">Ctrl</span>
                <span>Windows/Linux</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 