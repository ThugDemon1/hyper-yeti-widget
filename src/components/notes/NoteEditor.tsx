import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Share, MoreVertical, Pin, Calendar, Book, Download, Trash } from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import { RichTextEditor } from '../editor/RichTextEditor';
import { Note } from '../../stores/useNotesStore';
// import NoteHistoryModal from './NoteHistoryModal'; // Uncomment if file exists
import { useTagsStore } from '../../stores/useTagsStore';
import { useNotebooksStore } from '../../stores/useNotebooksStore';
import CreatableSelect from 'react-select/creatable';
import { useUIStore } from '../../stores/useUIStore';
import { jsPDF } from 'jspdf';
import './note-editor-print.css';

interface NoteEditorProps {
  noteId: string;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, onClose }) => {
  const { fetchNote, saving, autoSaveNote, pinNote, updateNote, setReminder, clearReminder, updateReminderRecurring, shareNote, updateCollaborator, removeCollaborator, uploadAttachment, removeAttachment, fetchBacklinks } = useNotesStore();
  const { tags, fetchTags, createTag } = useTagsStore();
  const { notebooks, fetchNotebooks } = useNotebooksStore();
  const { openImportExportModal } = useUIStore();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string>('');
  const [reminderInput, setReminderInput] = useState(note?.reminderDate ? note.reminderDate.slice(0, 16) : '');
  const [recurring, setRecurring] = useState(note?.reminderRecurring || { frequency: 'none', interval: 1 });
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPermission, setCollabPermission] = useState('read');
  const [sharingError, setSharingError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const shareModalRef = useRef<HTMLDivElement>(null);
  const [backlinks, setBacklinks] = useState<{ _id: string; title: string }[]>([]);

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);
        setError(null);
        const noteData = await fetchNote(noteId);
        setNote(noteData);
        setTitle(noteData.title);
        setContent(noteData.content);
      } catch (error) {
        console.error('Failed to load note:', error);
        setError('Failed to load note. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      loadNote();
    }
  }, [noteId, fetchNote]);

  useEffect(() => {
    fetchTags();
    fetchNotebooks();
  }, [fetchTags, fetchNotebooks]);

  useEffect(() => {
    setSelectedTags(note?.tags?.map(t => t._id) || []);
    setSelectedNotebook(note?.notebookId?._id || '');
  }, [note]);

  useEffect(() => {
    setReminderInput(note?.reminderDate ? note.reminderDate.slice(0, 16) : '');
    setRecurring(note?.reminderRecurring || { frequency: 'none', interval: 1 });
  }, [note]);

  // Load backlinks
  useEffect(() => {
    if (noteId) {
      fetchBacklinks(noteId).then(setBacklinks).catch(() => setBacklinks([]));
    }
  }, [noteId, fetchBacklinks]);

  // Auto-save functionality
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (title: string, content: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (note && (title !== note.title || content !== note.content)) {
            try {
              const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
              await autoSaveNote(noteId, content, plainTextContent);
              setLastSaved(new Date());
            } catch (error) {
              console.error('Auto-save failed:', error);
            }
          }
        }, 2000);
      };
    })(),
    [note, noteId, autoSaveNote]
  );

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedAutoSave(newTitle, content);
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedAutoSave(title, newContent);
  };

  const handleTagsChange = async (selected: any) => {
    // selected is an array of { value, label, ... }
    const values = selected ? selected.map((opt: any) => opt.value) : [];
    setSelectedTags(values);
    try {
      await updateNote(noteId, { tags: values });
      setNote(prev => prev ? { ...prev, tags: tags.filter(t => values.includes(t._id)) } : null);
    } catch (err) {
      console.error('Failed to update tags', err);
    }
  };

  const handleCreateTag = async (inputValue: string) => {
    try {
      const newTag = await createTag({ name: inputValue });
      setSelectedTags(prev => [...prev, newTag._id]);
      await updateNote(noteId, { tags: [...selectedTags, newTag._id] });
      setNote(prev => prev ? { ...prev, tags: [...(prev.tags || []), newTag] } : null);
    } catch (err) {
      console.error('Failed to create tag', err);
    }
  };

  const handleNotebookChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedNotebook(value);
    try {
      await updateNote(noteId, { notebookId: value });
      setNote(prev => {
        if (!prev) return null;
        const found = notebooks.find(nb => nb._id === value);
        return found ? { ...prev, notebookId: found } : prev;
      });
    } catch (err) {
      console.error('Failed to update notebook', err);
    }
  };

  const handleReminderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderInput(e.target.value);
    if (e.target.value) {
      await setReminder(noteId, new Date(e.target.value).toISOString(), recurring);
      setNote(prev => prev ? { ...prev, reminderDate: new Date(e.target.value).toISOString() } : null);
    }
  };

  const handleClearReminder = async () => {
    await clearReminder(noteId);
    setReminderInput('');
    setNote(prev => prev ? { ...prev, reminderDate: null } : null);
  };

  const handleRecurringChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const freq = e.target.value;
    const newRecurring = { ...recurring, frequency: freq };
    setRecurring(newRecurring);
    await updateReminderRecurring(noteId, newRecurring);
    setNote(prev => prev ? { ...prev, reminderRecurring: newRecurring } : null);
  };

  const handleIntervalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const interval = parseInt(e.target.value) || 1;
    const newRecurring = { ...recurring, interval };
    setRecurring(newRecurring);
    await updateReminderRecurring(noteId, newRecurring);
    setNote(prev => prev ? { ...prev, reminderRecurring: newRecurring } : null);
  };

  const handleAddCollaborator = async () => {
    setSharingError('');
    try {
      // For demo: use email as userId (in real app, lookup userId by email)
      await shareNote(noteId, collabEmail, collabPermission);
      setCollabEmail('');
      setCollabPermission('read');
      // Optionally reload note
      if (noteId) fetchNote(noteId).then(setNote);
    } catch (err) {
      setSharingError('Failed to add collaborator');
    }
  };

  const handleUpdatePermission = async (userId: string, permission: string) => {
    try {
      await updateCollaborator(noteId, userId, permission);
      if (noteId) fetchNote(noteId).then(setNote);
    } catch (err) {
      setSharingError('Failed to update permission');
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator(noteId, userId);
      if (noteId) fetchNote(noteId).then(setNote);
    } catch (err) {
      setSharingError('Failed to remove collaborator');
    }
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !note) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadAttachment(note._id, e.target.files[0]);
      // Refetch note to update attachments
      if (noteId) fetchNote(noteId).then(setNote);
    } catch (err) {
      setUploadError('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = async (filename: string) => {
    if (!note) return;
    setUploading(true);
    setUploadError(null);
    try {
      await removeAttachment(note._id, filename);
      if (noteId) fetchNote(noteId).then(setNote);
    } catch (err) {
      setUploadError('Failed to remove attachment');
    } finally {
      setUploading(false);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    if (!shareModalOpen) return;
    function handleClick(e: MouseEvent) {
      if (shareModalRef.current && !shareModalRef.current.contains(e.target as Node)) {
        setShareModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareModalOpen]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Note not found</h3>
          <button
            onClick={onClose}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white print:hidden">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>in</span>
            <span className="text-gray-700 font-medium">{note.notebookId?.name || 'Unknown Notebook'}</span>
            {(saving || lastSaved) && (
              <div className="flex items-center space-x-1">
                {saving ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Saved {lastSaved?.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 ${
              note.isPinned ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={async () => {
              try {
                await pinNote(note._id, !note.isPinned);
                // Update local state
                setNote(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
              } catch (error) {
                console.error('Failed to pin/unpin note:', error);
              }
            }}
          >
            <Pin className="w-4 h-4" />
          </button>
          {/* Export as PDF Button */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="Export as PDF"
            onClick={() => {
              const printContents = document.getElementById('note-print-content')?.innerHTML;
              const printWindow = window.open('', '', 'height=600,width=800');
              printWindow?.document.write('<html><head><title>Export as PDF</title>');
              printWindow?.document.write('<style>body{font-family:sans-serif;padding:2em;} h1{font-size:2em;} .prose{max-width:100%;}</style>');
              printWindow?.document.write('</head><body >');
              printWindow?.document.write(printContents || '');
              printWindow?.document.write('</body></html>');
              printWindow?.document.close();
              printWindow?.focus();
              printWindow?.print();
            }}
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Export Button */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="Export Note"
            onClick={() => openImportExportModal('export')}
          >
            <Download className="w-4 h-4" />
          </button>
          {/* Note History Button */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="Note History"
            onClick={() => setHistoryModalOpen(true)}
          >
            <Book className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <Calendar className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="Share"
            onClick={() => setShareModalOpen(true)}
          >
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Title */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title..."
          className="w-full text-2xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
        />
        {/* Evernote-style Notebook and Tags Controls */}
        <div className="flex flex-wrap items-center gap-4 mt-3">
          {/* Notebook Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Notebook:</span>
            <select
              value={selectedNotebook}
              onChange={handleNotebookChange}
              className="border rounded px-2 py-1 text-sm min-w-[120px] bg-white"
            >
              <option value="">Select notebook</option>
              {notebooks.map(nb => (
                <option key={nb._id} value={nb._id}>{nb.name}</option>
              ))}
            </select>
          </div>
          {/* Tags Multi-select */}
          <div className="flex items-center gap-2 min-w-[200px] flex-1">
            <span className="text-xs text-gray-500">Tags:</span>
            <div className="flex-1 min-w-[120px]">
              <CreatableSelect
                isMulti
                value={tags.filter(tag => selectedTags.includes(tag._id)).map(tag => ({ value: tag._id, label: tag.name }))}
                options={tags.map(tag => ({ value: tag._id, label: tag.name }))}
                onChange={handleTagsChange}
                onCreateOption={handleCreateTag}
                placeholder="Add tag..."
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, minHeight: '32px', fontSize: '0.875rem' }),
                  valueContainer: (base) => ({ ...base, padding: '0 6px' }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#e0e7ff', color: '#3730a3' }),
                  multiValueLabel: (base) => ({ ...base, color: '#3730a3' }),
                  multiValueRemove: (base) => ({ ...base, color: '#6366f1', ':hover': { backgroundColor: '#c7d2fe', color: '#312e81' } }),
                }}
                isClearable={false}
                menuPlacement="auto"
              />
            </div>
          </div>
        </div>
        {/* Reminder Picker */}
        <div className="mt-2 flex items-center gap-2">
          <label className="text-xs text-gray-500">Reminder:</label>
          <input
            type="datetime-local"
            value={reminderInput}
            onChange={handleReminderChange}
            className="border rounded px-2 py-1 text-sm"
          />
          {reminderInput && (
            <button
              className="text-xs text-red-500 ml-2"
              onClick={handleClearReminder}
              type="button"
            >
              Clear
            </button>
          )}
          {/* Recurring Dropdown */}
          <label className="text-xs text-gray-500 ml-4">Repeat:</label>
          <select
            value={recurring.frequency}
            onChange={handleRecurringChange}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {recurring.frequency !== 'none' && (
            <input
              type="number"
              min={1}
              value={recurring.interval}
              onChange={handleIntervalChange}
              className="border rounded px-2 py-1 text-sm w-16 ml-2"
              title="Repeat interval"
            />
          )}
        </div>
        {recurring.frequency !== 'none' && (
          <div className="text-xs text-gray-500 mt-1 ml-2">
            Repeats every {recurring.interval} {recurring.frequency}{recurring.interval > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Note Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6" id="note-print-content">
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing your note..."
          />
        </div>
      </div>

      {/* Note Metadata */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
            <span>Modified {new Date(note.updatedAt).toLocaleDateString()}</span>
            <span>{note.wordCount || 0} words</span>
          </div>
          <div className="flex items-center space-x-2">
            <Book className="w-4 h-4" />
            <span>{note.notebookId?.name || 'Unknown Notebook'}</span>
          </div>
        </div>
      </div>

      {/* Backlinks Section */}
      {backlinks.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="font-semibold text-gray-700 mb-2">Linked from:</div>
          <ul className="list-disc pl-5">
            {backlinks.map(link => (
              <li key={link._id}>
                <a href={`?note=${link._id}`} className="text-blue-600 hover:underline">{link.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sharing Section - now in modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div ref={shareModalRef} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShareModalOpen(false)}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="font-semibold text-lg text-gray-700 mb-4 flex items-center gap-2">
              <Share className="w-5 h-5 text-blue-500" /> Share this note
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={collabEmail}
                onChange={e => setCollabEmail(e.target.value)}
                placeholder="Collaborator email or username"
                className="border rounded px-2 py-1 text-sm flex-1"
              />
              <select
                value={collabPermission}
                onChange={e => setColabPermission(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="read">Read</option>
                <option value="write">Edit</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                onClick={handleAddCollaborator}
                type="button"
                disabled={!collabEmail}
              >
                Add
              </button>
            </div>
            {sharingError && <div className="text-xs text-red-500 mb-2">{sharingError}</div>}
            {note.collaborators && note.collaborators.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">Collaborators:</div>
                <ul>
                  {note.collaborators.map((c: any) => (
                    <li key={c.userId} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-700">{typeof c.userId === 'object' ? c.userId.email || c.userId.name || c.userId._id : c.userId}</span>
                      <select
                        value={c.permission}
                        onChange={e => handleUpdatePermission(c.userId, e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      >
                        <option value="read">Read</option>
                        <option value="write">Edit</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="text-xs text-red-500 ml-2"
                        onClick={() => handleRemoveCollaborator(c.userId)}
                        type="button"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attachments Section */}
      <div className="mt-4">
        <label className="block text-xs text-gray-500 mb-1">Attachments:</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="block text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <span className="text-xs text-blue-500">Uploading...</span>}
          {uploadError && <span className="text-xs text-red-500">{uploadError}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {note.attachments && note.attachments.length > 0 ? (
            note.attachments.map(att => (
              <div key={att.filename} className="flex items-center gap-2 border rounded px-2 py-1 bg-gray-50">
                {att.type.startsWith('image/') ? (
                  <a href={att.url} target="_blank" rel="noopener noreferrer">
                    <img src={att.url} alt={att.originalName} className="w-12 h-12 object-cover rounded" />
                  </a>
                ) : (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">{att.originalName}</span>
                  </a>
                )}
                <button
                  className="ml-1 text-xs text-red-500 hover:text-red-700"
                  title="Remove attachment"
                  onClick={() => handleRemoveAttachment(att.filename)}
                  disabled={uploading}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <span className="text-xs text-gray-400">No attachments</span>
          )}
        </div>
      </div>

      {/* Note History Modal */}
      {/* {historyModalOpen && (
        <NoteHistoryModal
          noteId={noteId}
          onClose={() => setHistoryModalOpen(false)}
          onRestore={() => {
            setHistoryModalOpen(false);
            // Optionally reload note after restore
            if (noteId) fetchNote(noteId).then(setNote);
          }}
        />
      )} */}
    </div>
  );
};