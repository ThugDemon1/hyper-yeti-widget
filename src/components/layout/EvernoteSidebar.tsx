
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
  X,
  Calendar,
  Folder,
  Share2
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotesStore } from '../../stores/useNotesStore';
import { useUIStore } from '../../stores/useUIStore';
import { spacingClasses } from '../../styles/design-tokens';

const navigationItems = [
  { id: 'notebooks', name: 'Notebooks', icon: Book, path: '/notebooks' },
  { id: 'notes', name: 'Notes', icon: FileText, path: '/notes' },
  { id: 'tasks', name: 'Tasks', icon: Zap, path: '/shortcuts' },
  { id: 'files', name: 'Files', icon: Folder, path: '/files' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'tags', name: 'Tags', icon: Tag, path: '/tags' },
  { id: 'shared', name: 'Shared with Me', icon: Share2, path: '/shared' },
  { id: 'trash', name: 'Trash', icon: Trash2, path: '/trash' }
];

export const EvernoteSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { createNote, setCurrentNote } = useNotesStore();
  const { openCustomizeModal, toggleSearchModal } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleCreateNote = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      const newNote = await createNote({
        title: 'Untitled',
        content: '',
        plainTextContent: ''
      });
      
      setCurrentNote(newNote);
      navigate(`/notes?note=${newNote._id}`);
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
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
    <div className="flex flex-col h-full bg-[#2a2a2a] text-white">
      {/* User Profile - Exact Evernote styling */}
      <div className="p-4 border-b border-[#404040]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4285f4] rounded-full flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium truncate text-white">{user?.name || 'User'}</span>
              <ChevronDown className="w-4 h-4 text-[#b3b3b3] flex-shrink-0" />
            </div>
            <div className="text-xs text-[#b3b3b3] truncate">{user?.email || 'user@example.com'}</div>
          </div>
        </div>
      </div>

      {/* Search Bar - Evernote style */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#808080]" />
          <input
            type="text"
            placeholder="Search"
            onClick={handleSearchClick}
            className="w-full bg-[#3a3a3a] text-white pl-10 pr-3 py-2 rounded-md text-sm border border-[#404040] focus:outline-none focus:border-[#4285f4] cursor-pointer"
            readOnly
          />
        </div>
      </div>

      {/* New Note Button - Signature Evernote green */}
      <div className="px-4 pb-4">
        <button 
          onClick={handleCreateNote}
          className="w-full bg-[#00a82d] hover:bg-[#008a24] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors h-9"
        >
          <Plus className="w-4 h-4" />
          <span>Note</span>
        </button>
      </div>

      {/* Quick Action Buttons - Evernote style */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-[#3a3a3a] hover:bg-[#404040] text-[#b3b3b3] px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors h-9 border border-[#404040]">
            <Zap className="w-4 h-4" />
            <span>Task</span>
          </button>
          <button className="bg-[#3a3a3a] hover:bg-[#404040] text-[#b3b3b3] px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors h-9 border border-[#404040]">
            <Calendar className="w-4 h-4" />
            <span>Event</span>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                    isActive 
                      ? 'bg-[#404040] text-white' 
                      : 'text-[#b3b3b3] hover:bg-[#3a3a3a] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#404040] space-y-2">
        <button
          onClick={() => {
            openCustomizeModal();
            setIsMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 text-[#b3b3b3] text-sm hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-[#3a3a3a]"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        
        <div className="flex items-center gap-3 text-[#808080] text-sm px-3 py-2">
          <HelpCircle className="w-4 h-4" />
          <span>Need help?</span>
        </div>

        <button
          onClick={() => {
            logout();
            setIsMobileOpen(false);
          }}
          className="w-full text-left text-[#b3b3b3] text-sm hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-[#3a3a3a]"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#2a2a2a] text-white rounded-md"
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
      <div className="hidden lg:flex w-60 h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 transform transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#b3b3b3] hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        {sidebarContent}
      </div>
    </>
  );
};
