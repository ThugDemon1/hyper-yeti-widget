import React, { useEffect, useState } from 'react';
import { useNotesStore } from '../stores/useNotesStore';
import { useNotebooksStore } from '../stores/useNotebooksStore';
import { useTagsStore } from '../stores/useTagsStore';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Components
import { NotesToolbar } from '../components/notes/NotesToolbar';
import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { NotesFilters } from '../components/notes/NotesFilters';

export const AllNotes: React.FC = () => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { 
    notes, 
    fetchNotes, 
    loading, 
    viewMode, 
    selectedNotes,
    clearSelection,
    currentNote,
    setCurrentNote
  } = useNotesStore();
  
  const { fetchNotebooks } = useNotebooksStore();
  const { fetchTags } = useTagsStore();

  useEffect(() => {
    fetchNotes();
    fetchNotebooks();
    fetchTags();
  }, [fetchNotes, fetchNotebooks, fetchTags]);

  // Handle note selection from URL query parameter or current note from store
  useEffect(() => {
    const noteIdFromUrl = searchParams.get('note');
    
    if (noteIdFromUrl) {
      setSelectedNoteId(noteIdFromUrl);
    } else if (currentNote && !selectedNoteId) {
      setSelectedNoteId(currentNote._id);
    }
  }, [searchParams, currentNote, selectedNoteId]);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    clearSelection();
    
    // Update URL without navigation
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('note', noteId);
    setSearchParams(newSearchParams);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(null);
    setCurrentNote(null);
    
    // Remove note from URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('note');
    setSearchParams(newSearchParams);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="h-full flex flex-col lg:flex-row">
            {/* Notes List Panel */}
            <div className={`${
              selectedNoteId 
                ? 'hidden lg:flex lg:w-1/3' 
                : 'w-full'
            } border-r border-gray-200 flex flex-col bg-white transition-all duration-300`}>
              {/* Toolbar */}
              <NotesToolbar 
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
                onNoteCreated={handleNoteSelect}
              />

              {/* Filters */}
              {showFilters && (
                <div className="border-b border-gray-200">
                  <NotesFilters />
                </div>
              )}

              {/* Notes List */}
              <div className="flex-1 overflow-hidden">
                <NotesList 
                  notes={notes}
                  loading={loading}
                  viewMode={viewMode}
                  onNoteSelect={handleNoteSelect}
                  selectedNoteId={selectedNoteId}
                />
              </div>
            </div>

            {/* Note Editor Panel */}
            {selectedNoteId ? (
              <div className="flex-1 bg-white">
                <NoteEditor 
                  noteId={selectedNoteId}
                  onClose={handleCloseEditor}
                />
              </div>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a note to view</h3>
                  <p className="text-gray-500">Choose a note from the list to start reading or editing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllNotes;