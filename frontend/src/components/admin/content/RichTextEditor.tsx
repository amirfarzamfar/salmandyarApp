'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminContentApi from '@/lib/content-admin-api';
import { Button } from '@/components/ui/Button';

const RICH_TEXT_EDITOR_EXTENSIONS = [
  StarterKit.configure({
    heading: {
      levels: [2, 3, 4],
    },
    codeBlock: false,
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class: 'rounded-xl border border-slate-200 max-w-full h-auto my-4',
      loading: 'lazy',
    },
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return `عنوان سطح ${node.attrs.level}...`;
      }
      return 'محتوای مقاله را اینجا بنویسید... برای شروع می‌توانید از ابزارهای نوار بالا استفاده کنید.';
    },
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Highlight.configure({ multicolor: false }),
  CharacterCount,
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({ value, onChange, minHeight = 420 }: Props) {
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: RICH_TEXT_EDITOR_EXTENSIONS,
    content: value || '',
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        dir: 'rtl',
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[200px] prose-headings:font-black prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-p:leading-8 prose-p:text-slate-700 prose-p:my-3 prose-li:my-1 prose-ul:my-4 prose-ol:my-4 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-r-4 prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/40 prose-blockquote:pr-4 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700 prose-blockquote:font-medium prose-hr:my-8 prose-hr:border-slate-200 prose-img:my-6 prose-table:w-full prose-table:border-collapse prose-th:bg-slate-50 prose-th:border prose-th:border-slate-200 prose-th:px-3 prose-th:py-2 prose-th:text-right prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setSourceHtml(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.isEmpty && !value) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
      setSourceHtml(value || '');
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    if (editor.view.isDestroyed) return;
  }, [editor]);

  const addImageFromUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      toast.error('فایل انتخاب شده تصویر نیست');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از ۸ مگابایت باشد');
      return;
    }
    setImageUploading(true);
    const toastId = toast.loading('در حال آپلود تصویر...');
    try {
      const result = await adminContentApi.uploadImage(file, 'inline');
      editor.chain().focus().setImage({
        src: result.url,
        alt: file.name.replace(/\.[^.]+$/, ''),
      }).run();
      toast.success('تصویر با موفقیت اضافه شد', { id: toastId });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در آپلود تصویر';
      toast.error(msg, { id: toastId });
    } finally {
      setImageUploading(false);
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    toast.success('جدول اضافه شد');
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || 'https://');
    setLinkDialogOpen(true);
  }, [editor]);

  const confirmLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let normalized = url;
      if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
      editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const ifCmd = (cond: boolean, className: string, fallback = '') => (cond ? className : fallback);

  const ToolbarBtn = ({
    onClick,
    isActive,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={
        'h-9 w-9 min-w-[36px] inline-flex items-center justify-center rounded-lg border text-slate-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed ' +
        ifCmd(isActive ?? false, 'bg-teal-600 border-teal-600 text-white shadow-sm hover:bg-teal-700', 'border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300')
      }
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center gap-1.5 p-3 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
        <ToolbarBtn
          title="بازگردانی (Ctrl+Z)"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="انجام دوباره (Ctrl+Y)"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="عنوان H2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor?.isActive('heading', { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="عنوان H3"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor?.isActive('heading', { level: 3 })}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="عنوان H4"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
          isActive={editor?.isActive('heading', { level: 4 })}
        >
          <Heading4 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="پاراگراف معمولی"
          onClick={() => editor?.chain().focus().setParagraph().run()}
          isActive={editor?.isActive('paragraph')}
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="پررنگ (Ctrl+B)"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={editor?.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="خمیده (Ctrl+I)"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={editor?.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="زیرخط‌دار (Ctrl+U)"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          isActive={editor?.isActive('underline')}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
          <ToolbarBtn
            title="تراز راست"
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            isActive={editor?.isActive({ textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="تراز وسط"
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            isActive={editor?.isActive({ textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="تراز چپ"
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            isActive={editor?.isActive({ textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="تراز دوطرفه"
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            isActive={editor?.isActive({ textAlign: 'justify' })}
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        <Divider />

        <ToolbarBtn
          title="لیست نقطه‌ای"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={editor?.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="لیست شماره‌دار"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          isActive={editor?.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="نقل‌قول"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          isActive={editor?.isActive('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="جداکننده افقی"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="افزودن لینک"
          onClick={setLink}
          isActive={editor?.isActive('link')}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn
          title="حذف لینک"
          onClick={removeLink}
          disabled={!editor?.isActive('link')}
        >
          <Unlink className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title="افزودن تصویر داخل متن"
          onClick={() => hiddenFileInputRef.current?.click()}
          disabled={imageUploading}
        >
          {imageUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </ToolbarBtn>
        <ToolbarBtn
          title="افزودن جدول ۳x۳"
          onClick={addTable}
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          title={showSource ? 'بازگشت به حالت ویرایشگر' : 'مشاهده و ویرایش کد HTML'}
          onClick={() => {
            if (!showSource) {
              setSourceHtml(editor?.getHTML() || value || '');
            } else if (editor) {
              editor.commands.setContent(sourceHtml, { emitUpdate: false });
              onChange(sourceHtml);
            }
            setShowSource((s) => !s);
          }}
          isActive={showSource}
        >
          <Code className="h-4 w-4" />
        </ToolbarBtn>

        <input
          ref={hiddenFileInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) addImageFromUpload(f);
            e.target.value = '';
          }}
        />
      </div>

      {linkDialogOpen && (
        <div className="border-b border-slate-100 bg-teal-50/40 px-4 py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <label className="text-xs font-black text-slate-700 whitespace-nowrap pt-2">
            آدرس لینک:
          </label>
          <input
            type="url"
            value={linkUrl}
            dir="ltr"
            autoFocus
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmLink();
              if (e.key === 'Escape') {
                setLinkDialogOpen(false);
                setLinkUrl('');
              }
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-mono"
            placeholder="https://example.com"
          />
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => { setLinkDialogOpen(false); setLinkUrl(''); }}>
              <X className="h-4 w-4 ml-1" />
              انصراف
            </Button>
            <Button size="sm" onClick={confirmLink} className="bg-teal-600 hover:bg-teal-700">
              <Check className="h-4 w-4 ml-1" />
              تایید
            </Button>
          </div>
        </div>
      )}

      {showSource ? (
        <textarea
          dir="ltr"
          value={sourceHtml}
          onChange={(e) => {
            setSourceHtml(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full font-mono text-xs text-slate-800 bg-slate-900/95 text-slate-100 p-4 outline-none resize-y border-0 leading-7"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div
          className="px-5 py-4 editor-scroll-container overflow-y-auto"
          style={{ minHeight }}
        >
          <EditorContent editor={editor} />
        </div>
      )}

      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-500 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Bold className="h-3.5 w-3.5 text-teal-600" />
            کاراکترها:{' '}
            <span className="text-slate-700 font-black">
              {editor?.storage.characterCount?.characters?.() ?? value.length}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <List className="h-3.5 w-3.5 text-blue-600" />
            کلمات:{' '}
            <span className="text-slate-700 font-black">
              {editor?.storage.characterCount?.words?.() ??
                (value.trim().split(/\s+/).filter((w) => w.length).length)}
            </span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-bold">
          ساختار خروجی HTML استاندارد و مناسب برای سئو
        </div>
      </div>
    </div>
  );
}
