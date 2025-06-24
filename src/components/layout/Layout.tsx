
import React from 'react';
import EvernoteLayout from './EvernoteLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <EvernoteLayout>{children}</EvernoteLayout>;
};

export default Layout;
