
import React from 'react';
import { EvernoteSidebar } from './EvernoteSidebar';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface EvernoteLayoutProps {
  children: React.ReactNode;
}

const EvernoteLayout: React.FC<EvernoteLayoutProps> = ({ children }) => {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex bg-[#2a2a2a] overflow-hidden font-['Segoe_UI','Helvetica_Neue',Arial,sans-serif]">
      <EvernoteSidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EvernoteLayout;
