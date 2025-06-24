import React, { useState } from 'react';
import { 
  Plus, Search, Filter, SortAsc, SortDesc, 
  Grid, List, MoreVertical, Share2, Palette,
  Trash2, Archive, Pin, Tag, BookOpen
} from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useUIStore } from '../../stores/useUIStore';

export const NotesToolbar: React.FC<{ onNoteCreated?: (noteId: string) => void; showFilters?: boolean; onToggleFilters?: () => void; }> = ({ onNoteCreated, showFilters, onToggleFilters }) => {
  const { 
    createNote, 
    viewMode, 
    setViewMode, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder,
    selectedNotes,
    bulkOperation
  } = useNotesStore();
  
  const { toggleSearchModal, toggleTemplatesModal, openImportExportModal } = useUIStore();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        plainTextContent: ''
      });
      if (onNoteCreated && newNote._id) {
        onNoteCreated(newNote._id);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive' | 'pin') => {
    if (selectedNotes.length === 0) return;

    try {
      await bulkOperation(action, selectedNotes);
    } catch (error) {
      console.error(`Failed to ${action} notes:`, error);
    }
  };

  const sortOptions = [
    { value: 'updatedAt', label: 'Last Modified' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'title', label: 'Title' },
    { value: 'notebookId', label: 'Notebook' },
  ];

  const viewOptions = [
    { value: 'list', label: 'List View', icon: List },
    { value: 'grid', label: 'Grid View', icon: Grid },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-2">
          {/* New Note Button */}
          <button
            onClick={handleCreateNote}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Note</span>
          </button>

          {/* Template Button */}
          <button
            onClick={toggleTemplatesModal}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Note Templates"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Search Button */}
          <button
            onClick={toggleSearchModal}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Center Section - Bulk Actions */}
        {selectedNotes.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedNotes.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('pin')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Pin Notes"
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Archive Notes"
            >
              <Archive className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Delete Notes"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowViewMenu(!showViewMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {viewMode === 'list' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              <span className="hidden sm:inline">View</span>
            </button>

            {showViewMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {viewOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setViewMode(option.value as 'list' | 'grid');
                        setShowViewMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 ${
                        viewMode === option.value
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              <span className="hidden sm:inline">Sort</span>
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value as any);
                      setShowSortMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      sortBy === option.value
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setShowSortMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {sortOrder === 'asc' ? 'Newest First' : 'Oldest First'}
                </button>
              </div>
            )}
          </div>

          {/* More Options */}
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button 
                  onClick={() => {
                    openImportExportModal('export');
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Export Notes</span>
                </button>
                <button 
                  onClick={() => {
                    openImportExportModal('import');
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Import Notes</span>
                </button>
                <button 
                  onClick={() => {
                    // TODO: Navigate to tags page
                    console.log('Manage Tags clicked');
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>Manage Tags</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={() => {
                    // TODO: Implement archive all functionality
                    console.log('Archive All clicked');
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive All</span>
                </button>
                <button 
                  onClick={() => {
                    // TODO: Implement delete all functionality with confirmation
                    if (window.confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
                      console.log('Delete All clicked');
                    }
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showSortMenu || showViewMenu || showMoreMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSortMenu(false);
            setShowViewMenu(false);
            setShowMoreMenu(false);
          }}
        />
      )}
    </div>
  );
};