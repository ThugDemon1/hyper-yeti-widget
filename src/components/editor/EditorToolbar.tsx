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
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNotesStore } from '../../stores/useNotesStore';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
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
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // Open modal and fetch notes if needed
  const openLinkModal = async () => {
    await fetchNotes();
    setFilteredNotes(notes);
    setLinkModalOpen(true);
  };

  // Filter notes by search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilteredNotes(notes.filter(n => n.title.toLowerCase().includes(e.target.value.toLowerCase())));
  };

  // Insert note link at cursor
  const insertNoteLink = (note: any) => {
    editor?.chain().focus().insertContent(`<a href='?note=${note._id}' data-note-id='${note._id}' class='note-link'>${note.title}</a>`).run();
    setLinkModalOpen(false);
    setSearch('');
  };

  return (
    <div className="editor-toolbar flex flex-wrap items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <Bold className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <Italic className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        <Strikethrough className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        <Code className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        <Heading1 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        <Heading2 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        <Heading3 className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        <Underline className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        >
          <AlignLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        >
          <AlignCenter className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        >
          <AlignRight className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <Image className="w-5 h-5" />
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
      {/* Insert Note Link Button */}
      <button
        type="button"
        onClick={openLinkModal}
        title="Insert Note Link"
      >
        <Link className="w-5 h-5 text-green-600" />
      </button>
      {/* Note Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setLinkModalOpen(false)}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="font-semibold text-lg text-gray-700 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5 text-green-600" /> Insert Note Link
            </div>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search notes by title..."
              className="border rounded px-2 py-1 text-sm w-full mb-3"
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="text-gray-400 text-sm">No notes found</div>
              ) : (
                <ul>
                  {filteredNotes.map(note => (
                    <li key={note._id}>
                      <button
                        className="w-full text-left px-2 py-1 hover:bg-blue-50 rounded text-sm"
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
      <button
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <Table className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <Quote className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <List className="w-5 h-5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <ListOrdered className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1">
        <input
          type="color"
          onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 p-0 border-none bg-transparent"
        />
      </div>
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffc078' }).run()}
        className={editor.isActive('highlight', { color: '#ffc078' }) ? 'is-active' : ''}
      >
        <Paintbrush className="w-5 h-5" />
      </button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <CheckSquare className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-1">
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-5 h-5" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};