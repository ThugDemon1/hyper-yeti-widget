import React from 'react';
import { Pin, Calendar, Paperclip, MoreVertical, Edit, Copy, Share2, Trash2 } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { Note } from '../../stores/useNotesStore';

interface NotesListProps {
  notes: Note[];
  loading: boolean;
  viewMode: 'list' | 'grid' | 'snippets';
  onNoteSelect: (noteId: string) => void;
  selectedNoteId: string | null;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  loading,
  viewMode,
  onNoteSelect,
  selectedNoteId
}) => {
  const { deleteNote, duplicateNote, pinNote } = useNotesStore();
  const [showMenuFor, setShowMenuFor] = React.useState<string | null>(null);

  const handleNoteMenuClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setShowMenuFor(showMenuFor === noteId ? null : noteId);
  };

  const handleMenuAction = async (action: string, noteId: string) => {
    try {
      switch (action) {
        case 'delete':
          await deleteNote(noteId);
          break;
        case 'duplicate':
          await duplicateNote(noteId);
          break;
        case 'pin':
          const note = notes.find(n => n._id === noteId);
          if (note) {
            await pinNote(noteId, !note.isPinned);
          }
          break;
        case 'share':
          // TODO: Implement sharing functionality
          console.log('Share note:', noteId);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} note:`, error);
    } finally {
      setShowMenuFor(null);
    }
  };

  const handleClickOutside = () => {
    setShowMenuFor(null);
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-2'}`}>
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => onNoteSelect(note._id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedNoteId === note._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                  {note.isPinned && <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  {note.reminderDate && <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                  {note.attachments.length > 0 && <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </div>
                <div 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => handleNoteMenuClick(e, note._id)}
                >
                  <MoreVertical className="w-4 h-4" />
                  
                  {/* Dropdown Menu */}
                  {showMenuFor === note._id && (
                    <div className="absolute right-0 top-6 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={() => handleMenuAction('edit', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('duplicate', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('pin', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{note.isPinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('share', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => handleMenuAction('delete', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {note.plainTextContent || 'No content'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>{note.notebookId?.name || 'Unknown Notebook'}</span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag._id}
                          className="px-2 py-0.5 bg-gray-100 rounded-full"
                          style={{ color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-gray-400">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};