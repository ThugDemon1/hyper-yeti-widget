import React, { useEffect, useState } from 'react';
import { X, History, Eye, RotateCcw, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface NoteHistoryModalProps {
  noteId: string;
  onClose: () => void;
  onRestore: () => void;
}

interface NoteVersion {
  title: string;
  content: string;
  plainTextContent: string;
  attachments: any[];
  tags: string[];
  updatedAt: string;
  version: number;
}

const NoteHistoryModal: React.FC<NoteHistoryModalProps> = ({ noteId, onClose, onRestore }) => {
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/notes/${noteId}/history`);
        setHistory(res.data.reverse()); // Show most recent first
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [noteId]);

  const handleRestore = async (index: number) => {
    if (!window.confirm('Restore this version? This will overwrite the current note.')) return;
    setRestoring(true);
    try {
      await api.post(`/notes/${noteId}/history/restore`, { historyIndex: history.length - 1 - index });
      onRestore();
    } catch (err) {
      setError('Failed to restore version.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Note History</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-600 text-center">{error}</div>
          ) : history.length === 0 ? (
            <div className="text-gray-500 text-center">No previous versions found.</div>
          ) : (
            <div className="space-y-4">
              {history.map((version, idx) => (
                <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="font-medium">{version.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">Version {version.version || idx + 1} &middot; {version.updatedAt ? new Date(version.updatedAt).toLocaleString() : ''}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-blue-600"
                      title="Preview"
                      onClick={() => setPreviewIndex(idx)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-gray-100 text-green-600"
                      title="Restore"
                      disabled={restoring}
                      onClick={() => handleRestore(idx)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Preview Modal */}
        {previewIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Preview Version</span>
                </div>
                <button onClick={() => setPreviewIndex(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="text-2xl font-bold mb-2">{history[previewIndex].title}</div>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: history[previewIndex].content }} />
                <div className="mt-4 text-xs text-gray-500">Saved: {history[previewIndex].updatedAt ? new Date(history[previewIndex].updatedAt).toLocaleString() : ''}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteHistoryModal; 