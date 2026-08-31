'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsletterEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onGenerateAI?: (prompt: string) => Promise<void>;
  isGenerating?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ElementType;
  title: string;
}

function ToolbarButton({ onClick, isActive = false, icon: Icon, title }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function NewsletterEditor({
  content,
  onChange,
  placeholder = 'Schrijf je nieuwsbrief hier...',
  onGenerateAI,
  isGenerating = false,
}: NewsletterEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-xl xl:prose-2xl mx-auto focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Afbeelding URL:');
    if (url) {
      const alt = window.prompt('Alt tekst (verplicht voor accessibility):') || '';
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Link URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const charCount = editor.getText().length;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={UnderlineIcon}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon={Strikethrough}
            title="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={Code}
            title="Code"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title="Heading 3"
          />
        </div>

        {/* Lists & Quote */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={Quote}
            title="Quote"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight}
            title="Align Right"
          />
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            icon={LinkIcon}
            title="Add Link"
          />
          <ToolbarButton
            onClick={addImage}
            icon={ImageIcon}
            title="Add Image"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            icon={Highlighter}
            title="Highlight"
          />
        </div>

        {/* AI Assistant */}
        {onGenerateAI && (
          <div className="flex gap-1 ml-auto pl-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                const prompt = window.prompt(
                  'Wat moet de AI genereren? (bijv. "Schrijf een introductie over AI in de welzijnssector")'
                );
                if (prompt && onGenerateAI) {
                  await onGenerateAI(prompt);
                }
              }}
              disabled={isGenerating}
              className="border-orange-400 text-orange-700 hover:bg-orange-50"
              title="AI assistent"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-orange-600 border-t-transparent rounded-full animate-spin" />
                  Genereren...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles size={14} />
                  AI Assistant
                </div>
              )}
            </Button>
          </div>
        )}

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            icon={Undo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            icon={Redo}
            title="Redo (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white" />

      {/* Footer with stats */}
      <div className="bg-gray-50 border-t px-4 py-2 text-sm text-gray-600 flex justify-between">
        <span>{charCount} karakters</span>
        <span>~{Math.ceil(charCount / 5)} woorden</span>
      </div>
    </div>
  );
}

/**
 * Helper component for adding a button/link block in the newsletter.
 * Renders a centered CTA button that matches the brand style.
 */
export function NewsletterCTABlock({
  text = 'Lees meer',
  url = '#',
}: {
  text?: string;
  url?: string;
}) {
  const html = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" style="border-radius: 8px; background-color: #f97316;">
            <tr>
              <td align="center" style="padding: 16px 44px;">
                <a href="${url}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; white-space: nowrap;">${text}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Pro editor props for the campaign editor form.
 */
export interface CampaignEditorData {
  title: string;
  subject: string;
  preview_text: string;
  content_html: string;
  status: 'draft' | 'sent' | 'scheduled' | 'archived';
  scheduled_at: string;
  sender_name: string;
  sender_email: string;
  reply_to: string;
  utm_campaign: string;
}
