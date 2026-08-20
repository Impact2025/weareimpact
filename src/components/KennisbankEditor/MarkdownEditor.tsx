'use client';

import { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({ content, onChange, placeholder, rows = 20 }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Wrap the current selection with markdown syntax (e.g. **bold**), or insert
  // placeholder markers around the cursor when nothing is selected.
  const wrapSelection = (before: string, after: string = before, placeholderText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || placeholderText;
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = selectionStart + before.length;
      textarea.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  };

  // Prefix each line touched by the selection with a line-level marker (heading, list, quote).
  const prefixLines = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    let lineEnd = value.indexOf('\n', selectionEnd);
    if (lineEnd === -1) lineEnd = value.length;

    const block = value.slice(lineStart, lineEnd);
    const prefixed = block
      .split('\n')
      .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
      .join('\n');

    const next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart, lineStart + prefixed.length);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const next = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const addLink = () => {
    const url = window.prompt('Link URL:');
    if (!url) return;
    const textarea = textareaRef.current;
    const selected = textarea ? textarea.value.slice(textarea.selectionStart, textarea.selectionEnd) : '';
    wrapSelection('[', `](${url})`, selected || 'linktekst');
  };

  const addImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Upload mislukt');
        return;
      }

      const alt = window.prompt('Alt tekst (verplicht voor SEO en toegankelijkheid):') || '';
      insertAtCursor(`![${alt}](${result.url})`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Er ging iets fout bij het uploaden');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const charCount = content.length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => wrapSelection('**', '**', 'vet')} icon={Bold} title="Bold (**)" />
          <ToolbarButton onClick={() => wrapSelection('*', '*', 'cursief')} icon={Italic} title="Italic (*)" />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => prefixLines('## ')} icon={Heading2} title="Heading 2" />
          <ToolbarButton onClick={() => prefixLines('### ')} icon={Heading3} title="Heading 3" />
        </div>

        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton onClick={() => prefixLines('- ')} icon={List} title="Bullet List" />
          <ToolbarButton onClick={() => prefixLines('1. ')} icon={ListOrdered} title="Numbered List" />
          <ToolbarButton onClick={() => prefixLines('> ')} icon={Quote} title="Quote" />
        </div>

        <div className="flex gap-1">
          <ToolbarButton onClick={addLink} icon={LinkIcon} title="Add Link" />
          <label
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent cursor-pointer"
            title="Add Image"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={addImage}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm rounded-none border-0 focus-visible:ring-0"
      />

      <div className="bg-gray-50 border-t px-4 py-2 text-sm text-gray-600 flex justify-between">
        <span>{charCount} karakters</span>
        <span>~{Math.ceil(charCount / 5)} woorden</span>
      </div>
    </div>
  );
}
