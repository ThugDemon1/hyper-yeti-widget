
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Undo,
  Redo,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Underline,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Link,
  Image,
  Table,
  Paintbrush,
  CheckSquare,
  X,
  Type,
  Palette,
  MoreHorizontal
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';
import { spacingClasses } from '../../styles/design-tokens';

interface EvernoteToolbarProps {
  editor: Editor | null;
}

export const EvernoteToolbar: React.FC<EvernoteToolbarProps> = ({ editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notes, fetchNotes } = useNotesStore();
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredNotes, setFilteredNotes] = useState(notes);

  if (!editor) {
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: url }).run();
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openLinkModal = async () => {
    await fetchNotes();
    setFilteredNotes(notes);
    setLinkModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilteredNotes(notes.filter(n => n.title.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  const insertNoteLink = (note: any) => {
    editor?.chain().focus().insertContent(`<a href='?note=${note._id}' data-note-id='${note._id}' class='note-link'>${note.title}</a>`).run();
    setLinkModalOpen(false);
    setSearch('');
  };

  // Toolbar button component for consistency
  const ToolbarButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
  }> = ({ onClick, isActive, disabled, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        isActive 
          ? 'bg-[#4285f4] text-white' 
          : disabled
          ? 'text-[#808080] cursor-not-allowed'
          : 'text-[#484848] hover:bg-[#e1e1e1] hover:text-[#2a2a2a]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-2 bg-[#f8f8f8] border-b border-[#e1e1e1] overflow-x-auto">
      {/* Insert Menu */}
      <div className="flex items-center bg-white rounded border border-[#e1e1e1] mr-2">
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#484848] hover:bg-[#f0f0f0] rounded-l border-r border-[#e1e1e1]">
          <span>Insert</span>
        </button>
        <button className="px-2 py-1.5 text-[#484848] hover:bg-[#f0f0f0] rounded-r">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-[#e1e1e1] mx-1" />

      {/* Font Style Controls */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-[#e1e1e1] mx-1" />

      {/* Text Color */}
      <div className="flex items-center gap-1 mr-2">
        <div className="relative">
          <input
            type="color"
            onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="w-8 h-8 rounded border border-[#e1e1e1] cursor-pointer"
            title="Text Color"
          />
        </div>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffeb3b' }).run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Paintbrush className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-[#e1e1e1] mx-1" />

      {/* Lists */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive('taskList')}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-[#e1e1e1] mx-1" />

      {/* Insert Elements */}
      <div className="flex items-center gap-1 mr-2">
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Insert Image"
        >
          <Image className="w-4 h-4" />
        </ToolbarButton>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <ToolbarButton
          onClick={openLinkModal}
          title="Insert Note Link"
        >
          <Link className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <Table className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-[#e1e1e1] mx-1" />

      {/* More Options */}
      <ToolbarButton
        onClick={() => {}}
        title="More"
      >
        <MoreHorizontal className="w-4 h-4" />
      </ToolbarButton>

      {/* Note Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-[#808080] hover:text-[#484848]"
              onClick={() => setLinkModalOpen(false)}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="font-semibold text-lg text-[#484848] mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-[#4285f4]" /> Insert Note Link
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search notes by title..."
              className="border border-[#e1e1e1] rounded px-3 py-2 text-sm w-full mb-3 focus:outline-none focus:border-[#4285f4]"
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-[#808080] text-sm">No notes found</div>
              ) : (
                <ul>
                  {filteredNotes.map(note => (
                    <li key={note._id}>
                      <button
                        className="w-full text-left px-2 py-1 hover:bg-[#f0f0f0] rounded text-sm"
                        onClick={() => insertNoteLink(note)}
                      >
                        {note.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
