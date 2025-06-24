import React, { useEffect, useState } from 'react';
import { Users, Eye, Edit, Crown, Clock, Check, X } from 'lucide-react';
import api from '../lib/api';

interface SharedNote {
  _id: string;
  noteId: {
    _id: string;
    title: string;
    plainTextContent: string;
    updatedAt: string;
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  sharedWith: Array<{
    userId: string;
    email: string;
    permission: 'read' | 'write' | 'admin';
    status: 'pending' | 'accepted' | 'declined';
    invitedAt: string;
    acceptedAt?: string;
  }>;
  isPublic: boolean;
}

export const SharedWithMe: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'with-me' | 'by-me' | 'pending'>('with-me');
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedContent();
  }, [activeTab]);

  const fetchSharedContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/sharing?type=${activeTab}`);
      setSharedNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch shared content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (shareId: string) => {
    try {
      await api.post(`/sharing/accept/${shareId}`);
      fetchSharedContent();
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvitation = async (shareId: string) => {
    try {
      await api.post(`/sharing/decline/${shareId}`);
      fetchSharedContent();
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'write':
        return <Edit className="w-4 h-4 text-blue-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'Admin';
      case 'write':
        return 'Can Edit';
      default:
        return 'Can View';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Shared Content</h1>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('with-me')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'with-me'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Shared with Me
              </button>
              <button
                onClick={() => setActiveTab('by-me')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'by-me'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Shared by Me
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending Invitations
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : sharedNotes.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'with-me' && 'No notes shared with you'}
                  {activeTab === 'by-me' && 'You haven\'t shared any notes'}
                  {activeTab === 'pending' && 'No pending invitations'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'with-me' && 'Notes that others share with you will appear here'}
                  {activeTab === 'by-me' && 'Share your notes with others to collaborate'}
                  {activeTab === 'pending' && 'Sharing invitations you haven\'t responded to will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sharedNotes.map((sharedNote) => (
                <div key={sharedNote._id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {sharedNote.noteId.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {sharedNote.noteId.plainTextContent}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {sharedNote.ownerId.name.charAt(0).toUpperCase()}
                          </div>
                          <span>
                            {activeTab === 'with-me' ? `Shared by ${sharedNote.ownerId.name}` : `Shared with others`}
                          </span>
                        </div>
                        
                        {activeTab === 'with-me' && (
                          <div className="flex items-center space-x-1">
                            {getPermissionIcon(sharedNote.sharedWith[0]?.permission || 'read')}
                            <span>{getPermissionLabel(sharedNote.sharedWith[0]?.permission || 'read')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(sharedNote.noteId.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {activeTab === 'pending' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleAcceptInvitation(sharedNote._id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDeclineInvitation(sharedNote._id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {activeTab === 'by-me' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Shared with {sharedNote.sharedWith.length} people
                        </span>
                        <button className="text-sm text-blue-600 hover:text-blue-700">
                          Manage Access
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedWithMe;