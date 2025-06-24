import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { useAuthStore } from './stores/useAuthStore';
import { useUIStore } from './stores/useUIStore';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AllNotes from './pages/AllNotes';
import Notebooks from './pages/Notebooks';
import Tags from './pages/Tags';
import Reminders from './pages/Reminders';
import Shortcuts from './pages/Shortcuts';
import SharedWithMe from './pages/SharedWithMe';
import Trash from './pages/Trash';

// Components
import Layout from './components/layout/Layout';
import SearchModal from './components/modals/SearchModal';
import { CustomizeModal } from './components/modals/CustomizeModal';
import { KeyboardShortcutsModal } from './components/modals/KeyboardShortcutsModal';
import { ImportExportModal } from './components/modals/ImportExportModal';
import NoteTemplates from './components/notes/NoteTemplates';

function App() {
  const { user, isLoading } = useAuthStore();
  const { 
    searchModalOpen, 
    templatesModalOpen, 
    keyboardShortcutsModalOpen,
    importExportMode
  } = useUIStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<AllNotes />} />
              <Route path="/notebooks" element={<Notebooks />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/shortcuts" element={<Shortcuts />} />
              <Route path="/shared" element={<SharedWithMe />} />
              <Route path="/trash" element={<Trash />} />
            </Routes>
          </Layout>

          {/* Modals */}
          <SearchModal isOpen={searchModalOpen} onClose={() => useUIStore.getState().toggleSearchModal()} />
          <CustomizeModal />
          <KeyboardShortcutsModal isOpen={keyboardShortcutsModalOpen} onClose={() => useUIStore.getState().toggleKeyboardShortcutsModal()} />
          <ImportExportModal mode={importExportMode} />
          <NoteTemplates isOpen={templatesModalOpen} onClose={() => useUIStore.getState().toggleTemplatesModal()} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;