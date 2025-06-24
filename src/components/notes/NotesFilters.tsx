import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Tag, Book, Paperclip, Bell } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { useTagsStore } from '../../stores/useTagsStore';
import { useNotebooksStore } from '../../stores/useNotebooksStore';
import { useReactToPrint } from "react-to-print";

export const NotesFilters: React.FC = () => {
  const { fetchNotes, savedSearches, fetchSavedSearches, createSavedSearch } = useNotesStore();
  const { tags, fetchTags } = useTagsStore();
  const { notebooks, fetchNotebooks } = useNotebooksStore();

  const [selectedNotebook, setSelectedNotebook] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [hasReminders, setHasReminders] = useState(false);
  const [hasAttachments, setHasAttachments] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newSearchName, setNewSearchName] = useState('');
  const [isPrinting, setIsPrinting] = React.useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Note",
  });

  useEffect(() => {
    fetchTags();
    fetchNotebooks();
    fetchSavedSearches();
  }, [fetchTags, fetchNotebooks, fetchSavedSearches]);

  // Fetch notes when filters change
  useEffect(() => {
    const filters: any = {};
    if (selectedNotebook) filters.notebook = selectedNotebook;
    if (selectedTags.length > 0) filters.tags = { $all: selectedTags.join(',') };
    if (createdFrom) filters.createdFrom = createdFrom;
    if (createdTo) filters.createdTo = createdTo;
    if (hasReminders) filters.hasReminders = true;
    if (hasAttachments) filters.hasAttachments = true;
    fetchNotes(filters);
  }, [selectedNotebook, selectedTags, createdFrom, createdTo, hasReminders, hasAttachments, fetchNotes]);

  React.useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleApplySavedSearch = (search: any) => {
    setSelectedNotebook(search.filters.notebook || '');
    setSelectedTags(search.filters.tags || []);
    setCreatedFrom(search.filters.createdFrom || '');
    setCreatedTo(search.filters.createdTo || '');
    setHasReminders(!!search.filters.hasReminders);
    setHasAttachments(!!search.filters.hasAttachments);
    fetchNotes(search.filters);
  };

  const handleSaveSearch = async () => {
    await createSavedSearch({
      name: newSearchName,
      query: '',
      filters: {
        notebook: selectedNotebook,
        tags: selectedTags,
        createdFrom,
        createdTo,
        hasReminders,
        hasAttachments
      }
    });
    setSaveModalOpen(false);
    setNewSearchName('');
  };

  interface PrintableNoteProps {
    children: React.ReactNode;
  }
  const PrintableNote = React.forwardRef<HTMLDivElement, PrintableNoteProps>(({ children }, ref) => (
  <div ref={ref}>
    {/* Only the note content here, no toolbar */}
    {children}
  </div>
));

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Saved Searches Dropdown */}
      <div className="mb-4 flex items-center gap-2">
        <select
          className="border rounded px-2 py-1 text-sm min-w-[180px]"
          onChange={e => {
            const search = savedSearches.find(s => s._id === e.target.value);
            if (search) handleApplySavedSearch(search);
          }}
          defaultValue=""
        >
          <option value="">Select Saved Search...</option>
          {savedSearches.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <button
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          onClick={() => setSaveModalOpen(true)}
        >
          Save Current Search
        </button>
      </div>
      {/* Save Search Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-2">Save Search</h3>
            <input
              type="text"
              value={newSearchName}
              onChange={e => setNewSearchName(e.target.value)}
              placeholder="Search name..."
              className="w-full border rounded px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200"
                onClick={() => setSaveModalOpen(false)}
              >Cancel</button>
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white"
                onClick={handleSaveSearch}
                disabled={!newSearchName.trim()}
              >Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Book className="w-4 h-4" /> Notebook
          </h3>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedNotebook}
            onChange={e => setSelectedNotebook(e.target.value)}
          >
            <option value="">All Notebooks</option>
            {notebooks.map(nb => (
              <option key={nb._id} value={nb._id}>{nb.name}</option>
            ))}
          </select>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag._id}
                className={`px-3 py-1 rounded-full border text-xs ${selectedTags.includes(tag._id) ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => handleTagToggle(tag._id)}
                type="button"
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Created From
            </h3>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={createdFrom}
              onChange={e => setCreatedFrom(e.target.value)}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Created To
            </h3>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={createdTo}
              onChange={e => setCreatedTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasReminders}
              onChange={e => setHasReminders(e.target.checked)}
            />
            <Bell className="w-4 h-4" /> Has Reminders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasAttachments}
              onChange={e => setHasAttachments(e.target.checked)}
            />
            <Paperclip className="w-4 h-4" /> Has Attachments
          </label>
        </div>
      </div>
      <div className="mt-4">
        <button onClick={handlePrint}>Print/Export PDF</button>
      </div>
      <PrintableNote ref={printRef}>
        {/* Printable area */}
        <div>Sample printable content goes here.</div>
      </PrintableNote>
    </div>
  );
};
