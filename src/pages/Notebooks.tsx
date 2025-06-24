import React, { useEffect, useState } from 'react';
import { Plus, Search, Grid, List, Book, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useNotebooksStore } from '../stores/useNotebooksStore';

export const Notebooks: React.FC = () => {
  const { notebooks, fetchNotebooks, createNotebook, deleteNotebook } = useNotebooksStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNotebook = async (name: string, description: string) => {
    try {
      await createNotebook({ name, description });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Notebooks</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>New Notebook</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notebooks..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notebooks Grid/List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {filteredNotebooks.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'No notebooks found' : 'No notebooks yet'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Create your first notebook to organize your notes'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Create Notebook
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
                  : 'space-y-4'
              }>
                {filteredNotebooks.map((notebook) => (
                  <div
                    key={notebook._id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                      viewMode === 'list' ? 'flex items-center p-4' : 'p-4 sm:p-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: notebook.color + '20' }}
                          >
                            <Book className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: notebook.color }} />
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{notebook.name}</h3>
                        {notebook.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
                            {notebook.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                          <span>{notebook.noteCount} notes</span>
                          <span>{new Date(notebook.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0"
                          style={{ backgroundColor: notebook.color + '20' }}
                        >
                          <Book className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: notebook.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{notebook.name}</h3>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{notebook.noteCount} notes</span>
                              <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {notebook.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{notebook.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Updated {new Date(notebook.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <CreateNotebookModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateNotebook}
        />
      )}
    </div>
  );
};

// Create Notebook Modal Component
const CreateNotebookModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Notebook</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notebook Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter notebook name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Notebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Notebooks;