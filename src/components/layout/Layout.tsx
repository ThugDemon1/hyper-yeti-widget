import React from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 