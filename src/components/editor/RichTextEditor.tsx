import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { EditorToolbar } from './EditorToolbar';
import './editor-overrides.css';

interface RichTextEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert max-w-none p-4 min-h-[400px] outline-none',
        dir: 'ltr',
      },
      handleDrop(view, event, _slice, _moved) {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
              const url = URL.createObjectURL(file);
              editor?.chain().focus().setImage({ src: url }).run();
            }
          });
          event.preventDefault();
          return true;
        }
        return false;
      },
      handlePaste(view, event, _slice) {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                const url = URL.createObjectURL(file);
                editor?.chain().focus().setImage({ src: url }).run();
                event.preventDefault();
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="print:hidden">
        <EditorToolbar editor={editor} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};