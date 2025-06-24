import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Home, 
  Zap, 
  FileText, 
  Book, 
  Users, 
  Bell, 
  Tag, 
  Trash2, 
  HelpCircle,
  ChevronDown,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotesStore } from '../../stores/useNotesStore';
import { useUIStore } from '../../stores/useUIStore';

const navigationItems = [
  { id: 'dashboard', name: 'Home', icon: Home, path: '/' },
  { id: 'shortcuts', name: 'Shortcuts', icon: Zap, path: '/shortcuts', badge: 3 },
  { id: 'notes', name: 'All Notes', icon: FileText, path: '/notes' },
  { id: 'notebooks', name: 'Notebooks', icon: Book, path: '/notebooks' },
  { id: 'shared', name: 'Shared with Me', icon: Users, path: '/shared' },
  { id: 'reminders', name: 'Reminders', icon: Bell, path: '/reminders' },
  { id: 'tags', name: 'Tags', icon: Tag, path: '/tags' },
  { id: 'trash', name: 'Trash', icon: Trash2, path: '/trash' }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { createNote, setCurrentNote } = useNotesStore();
  const { openCustomizeModal, toggleSearchModal } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCreateNote = async () => {
    try {
      // Check if user is authenticated
      if (!user) {
        console.error('User not authenticated');
        navigate('/login');
        return;
      }
      
      console.log('Creating new note...');
      const newNote = await createNote({
        title: 'Untitled',
        content: '',
        plainTextContent: ''
      });
      
      console.log('Note created, navigating to editor...');
      
      // Set the current note in the store
      setCurrentNote(newNote);
      
      // Navigate to notes page with the new note selected
      navigate(`/notes?note=${newNote._id}`);
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      // You might want to show a toast notification here
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const handleSearchClick = () => {
    toggleSearchModal();
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* User Profile */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium truncate">{user?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isCollapsed ? "" : "Search"}
            onClick={handleSearchClick}
            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none focus:bg-gray-600 cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* New Note Button */}
      <div className="px-4 pb-4">
        <button 
          onClick={handleCreateNote}
          className={`w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
            isCollapsed ? 'px-2' : 'space-x-2'
          }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Note</span>}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings and Help */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button
          onClick={() => {
            openCustomizeModal();
            setIsMobileOpen(false);
          }}
          className={`w-full flex items-center text-gray-400 text-sm hover:text-white transition-colors ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title={isCollapsed ? 'Customize' : undefined}
        >
          <Settings className="w-4 h-4" />
          {!isCollapsed && <span>Customize</span>}
        </button>
        
        <div className={`flex items-center text-gray-400 text-sm ${
          isCollapsed ? 'justify-center' : 'space-x-3'
        }`}>
          <HelpCircle className="w-4 h-4" />
          {!isCollapsed && <span>Need a little help?</span>}
        </div>

        <button
          onClick={() => {
            logout();
            setIsMobileOpen(false);
          }}
          className={`w-full text-left text-gray-400 text-sm hover:text-white transition-colors mt-4 ${
            isCollapsed ? 'text-center' : ''
          }`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          {isCollapsed ? '↗' : 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex bg-gray-800 text-white flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 right-2 p-1 text-gray-400 hover:text-white z-10"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
        
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        
        {sidebarContent}
      </div>
    </>
  );
};