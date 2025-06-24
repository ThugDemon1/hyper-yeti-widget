import React from 'react';
import { Pin, Calendar, Paperclip, MoreVertical, Edit, Copy, Share2, Trash2, FileText } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { Note } from '../../stores/useNotesStore';

interface EvernoteNotesListProps {
  notes: Note[];
  loading: boolean;
  viewMode: 'list' | 'grid' | 'snippets';
  onNoteSelect: (noteId: string) => void;
  selectedNoteId: string | null;
}

export const EvernoteNotesList: React.FC<EvernoteNotesListProps> = ({
  notes,
  loading,
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
              <div className="h-4 bg-[#3a3a3a] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[#3a3a3a] rounded w-1/2"></div>
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
          <div className="w-24 h-24 bg-[#3a3a3a] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-[#808080]" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No notes found</h3>
          <p className="text-[#b3b3b3]">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Notes Count */}
      <div className="px-4 py-3 border-b border-[#404040]">
        <span className="text-sm text-[#b3b3b3]">{notes.length} notes</span>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-0">
          {notes.map((note, index) => (
            <div
              key={note._id}
              onClick={() => onNoteSelect(note._id)}
              className={`relative p-4 cursor-pointer transition-colors border-b border-[#404040] ${
                selectedNoteId === note._id
                  ? 'bg-[#4285f4] bg-opacity-20 border-l-2 border-l-[#4285f4]'
                  : 'hover:bg-[#3a3a3a] hover:bg-opacity-50'
              } ${index === 0 ? 'border-t border-[#404040]' : ''}`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate text-sm">{note.title}</h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {note.isPinned && <Pin className="w-4 h-4 text-[#ff9500]" />}
                    {note.reminderDate && <Calendar className="w-4 h-4 text-[#4285f4]" />}
                    {note.attachments.length > 0 && <Paperclip className="w-4 h-4 text-[#b3b3b3]" />}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => handleNoteMenuClick(e, note._id)}
                    className="text-[#808080] hover:text-[#b3b3b3] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenuFor === note._id && (
                    <div className="absolute right-0 top-8 w-48 bg-[#3a3a3a] rounded-lg shadow-lg border border-[#404040] py-1 z-50">
                      <button
                        onClick={() => handleMenuAction('edit', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#404040] hover:text-white flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('duplicate', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#404040] hover:text-white flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('pin', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#404040] hover:text-white flex items-center gap-2"
                      >
                        <Pin className="w-4 h-4" />
                        <span>{note.isPinned ? 'Unpin' : 'Pin'}</span>
                      </button>
                      <button
                        onClick={() => handleMenuAction('share', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-[#b3b3b3] hover:bg-[#404040] hover:text-white flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <hr className="my-1 border-[#404040]" />
                      <button
                        onClick={() => handleMenuAction('delete', note._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500 hover:bg-opacity-20 hover:text-red-300 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Preview */}
              <p className="text-sm text-[#b3b3b3] line-clamp-2 mb-3 leading-relaxed">
                {note.plainTextContent || 'No preview available'}
              </p>

              {/* Note Metadata */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[#808080]">
                  <span>{note.notebookId?.name || 'Unknown Notebook'}</span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag._id}
                          className="px-2 py-0.5 bg-[#404040] text-[#b3b3b3] rounded text-xs"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[#808080]">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[#808080]">{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
