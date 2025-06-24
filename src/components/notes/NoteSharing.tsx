import React, { useState, useEffect } from 'react';
import { 
  Share2, Users, Globe, Copy, 
  Eye, Edit, Trash2, UserPlus, Settings, X
} from 'lucide-react';
import { useNotesStore } from '../../stores/useNotesStore';
import api from '../../lib/api.ts';

interface ShareSettings {
  isPublic: boolean;
  allowEdit: boolean;
  allowComments: boolean;
  passwordProtected: boolean;
  password?: string;
  expiresAt?: string;
}

interface Collaborator {
  _id: string;
  email: string;
  name: string;
  role: 'viewer' | 'editor' | 'admin';
  avatar?: string;
  joinedAt: string;
}

interface NoteSharingProps {
  noteId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NoteSharing: React.FC<NoteSharingProps> = ({ noteId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'share' | 'collaborators' | 'settings'>('share');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    isPublic: false,
    allowEdit: false,
    allowComments: true,
    passwordProtected: false,
    password: '',
    expiresAt: ''
  });
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { currentNote } = useNotesStore();

  useEffect(() => {
    if (isOpen && noteId) {
      loadShareData();
    }
  }, [isOpen, noteId]);

  const loadShareData = async () => {
    try {
      setIsLoading(true);
      const [shareResponse, collaboratorsResponse] = await Promise.all([
        api.get(`/notes/${noteId}/share`),
        api.get(`/notes/${noteId}/collaborators`)
      ]);

      setShareSettings(shareResponse.data.settings);
      setCollaborators(collaboratorsResponse.data.collaborators);
      setShareLink(shareResponse.data.shareLink);
    } catch (error) {
      console.error('Failed to load share data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateShareSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.put(`/notes/${noteId}/share`, shareSettings);
      setShareLink(response.data.shareLink);
      setMessage('Share settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update share settings:', error);
      setMessage('Failed to update share settings');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const addCollaborator = async () => {
    if (!newCollaborator.trim()) return;

    try {
      setIsLoading(true);
      const response = await api.post(`/notes/${noteId}/collaborators`, {
        email: newCollaborator,
        role: newCollaboratorRole
      });

      setCollaborators([...collaborators, response.data.collaborator]);
      setNewCollaborator('');
      setMessage('Collaborator added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add collaborator:', error);
      setMessage('Failed to add collaborator');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/notes/${noteId}/collaborators/${collaboratorId}`);
      setCollaborators(collaborators.filter(c => c._id !== collaboratorId));
      setMessage('Collaborator removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
      setMessage('Failed to remove collaborator');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCollaboratorRole = async (collaboratorId: string, role: 'viewer' | 'editor' | 'admin') => {
    try {
      setIsLoading(true);
      await api.put(`/notes/${noteId}/collaborators/${collaboratorId}`, { role });
      setCollaborators(collaborators.map(c => 
        c._id === collaboratorId ? { ...c, role } : c
      ));
      setMessage('Collaborator role updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update collaborator role:', error);
      setMessage('Failed to update collaborator role');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setMessage('Share link copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setMessage('Failed to copy link');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Note</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentNote?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'share'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborators'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Collaborators ({collaborators.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md">
              {message}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Share Link</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Share</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShareSettings({ ...shareSettings, isPublic: true, allowEdit: false })}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      shareSettings.isPublic && !shareSettings.allowEdit
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">View Only</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Anyone with the link can view</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShareSettings({ ...shareSettings, isPublic: true, allowEdit: true })}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      shareSettings.isPublic && shareSettings.allowEdit
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Can Edit</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Anyone with the link can edit</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Collaborator</h3>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    value={newCollaboratorRole}
                    onChange={(e) => setNewCollaboratorRole(e.target.value as 'viewer' | 'editor')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={addCollaborator}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Collaborators</h3>
                <div className="space-y-3">
                  {collaborators.map((collaborator) => (
                    <div
                      key={collaborator._id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {collaborator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{collaborator.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={collaborator.role}
                          onChange={(e) => updateCollaboratorRole(collaborator._id, e.target.value as any)}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => removeCollaborator(collaborator._id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {collaborators.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No collaborators yet. Add someone to start collaborating!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareSettings.isPublic}
                      onChange={(e) => setShareSettings({ ...shareSettings, isPublic: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Make note public</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareSettings.allowEdit}
                      onChange={(e) => setShareSettings({ ...shareSettings, allowEdit: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Allow editing</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareSettings.allowComments}
                      onChange={(e) => setShareSettings({ ...shareSettings, allowComments: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Allow comments</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareSettings.passwordProtected}
                      onChange={(e) => setShareSettings({ ...shareSettings, passwordProtected: e.target.checked })}
                      className="rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Password protect</span>
                  </label>

                  {shareSettings.passwordProtected && (
                    <input
                      type="password"
                      value={shareSettings.password || ''}
                      onChange={(e) => setShareSettings({ ...shareSettings, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expiration</h3>
                <input
                  type="datetime-local"
                  value={shareSettings.expiresAt || ''}
                  onChange={(e) => setShareSettings({ ...shareSettings, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty for no expiration
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={updateShareSettings}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}; 