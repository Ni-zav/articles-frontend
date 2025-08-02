"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export interface TipTapEditorProps {
  initialHTML?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  onRequestImageUpload?: (file: File) => Promise<string | undefined>; // return uploaded image URL (admin only) or undefined if not supported
  ariaLabel?: string;
}

export default function TipTapEditor({
  initialHTML = "",
  onChange,
  editable = true,
  onRequestImageUpload,
  ariaLabel = "Article editor",
}: TipTapEditorProps) {
  const [preview, setPreview] = useState(false);
  const lastHTMLRef = useRef<string>(initialHTML);

  const editor = useEditor(
    {
      editable,
      // Avoid SSR hydration mismatches: TipTap recommends disabling immediate render
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          codeBlock: {}, // fix type: pass options object instead of boolean
        }),
        Link.configure({
          autolink: true,
          openOnClick: true,
          linkOnPaste: true,
        }),
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full h-auto",
          },
        }),
      ],
      content: initialHTML || "<p></p>",
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        lastHTMLRef.current = html;
        onChange?.(html);
      },
    },
    [editable]
  );

  // keep external initialHTML in sync on mount/update
  useEffect(() => {
    if (!editor) return;
    if (typeof initialHTML === "string" && initialHTML !== lastHTMLRef.current) {
      // setContent signature in TipTap v2: setContent(content, emitUpdate?)
      // use command chain to avoid type friction and updates
      editor.chain().setContent(initialHTML || "<p></p>").run();
      lastHTMLRef.current = initialHTML;
    }
  }, [editor, initialHTML]);

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  const addImage = useCallback(async () => {
    if (!editor) return;
    // choose file first
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = (input.files && input.files[0]) || undefined;
      if (!file) return;

      // if upload handler provided (admin), upload and insert url; else use local preview
      let url: string | undefined = undefined;
      try {
        if (onRequestImageUpload) {
          url = await onRequestImageUpload(file);
        }
      } catch {
        // ignore failure, fallback to local preview
      }
      if (!url) {
        // local preview
        url = URL.createObjectURL(file);
      }
      editor.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  }, [editor, onRequestImageUpload]);

  const toggleLink = useCallback(() => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prevUrl || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const ToolbarButton = useMemo(() => {
    return function ToolbarButton({
      onClick,
      disabled,
      pressed,
      ariaLabel,
      children,
    }: {
      onClick: () => void;
      disabled?: boolean;
      pressed?: boolean;
      ariaLabel: string;
      children: React.ReactNode;
    }) {
      return (
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-pressed={pressed}
          className={`px-2 py-1 rounded border text-sm focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 disabled:opacity-50 ${
            pressed ? "bg-blue-50 border-blue-300 text-blue-700" : "hover:bg-gray-50"
          }`}
        >
          {children}
        </button>
      );
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div role="toolbar" aria-label="Editor toolbar" className="flex flex-wrap items-center gap-2 border rounded p-2 bg-white">
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          pressed={!!editor?.isActive("bold")}
          ariaLabel="Bold"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          pressed={!!editor?.isActive("italic")}
          ariaLabel="Italic"
        >
          I
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().setParagraph().run()}
          pressed={!!editor?.isActive("paragraph")}
          ariaLabel="Paragraph"
        >
          P
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          pressed={!!editor?.isActive("heading", { level: 1 })}
          ariaLabel="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          pressed={!!editor?.isActive("heading", { level: 2 })}
          ariaLabel="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          pressed={!!editor?.isActive("bulletList")}
          ariaLabel="Bullet list"
        >
          ••
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          pressed={!!editor?.isActive("orderedList")}
          ariaLabel="Ordered list"
        >
          1.
        </ToolbarButton>

        <ToolbarButton
          onClick={toggleLink}
          pressed={!!editor?.isActive("link")}
          ariaLabel="Insert link"
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          ariaLabel="Insert image"
        >
          Img
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          pressed={!!editor?.isActive("codeBlock")}
          ariaLabel="Code block"
        >
          {'</>'}
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!canUndo}
          ariaLabel="Undo"
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!canRedo}
          ariaLabel="Redo"
        >
          Redo
        </ToolbarButton>

        <div className="ml-auto" />

        <ToolbarButton
          onClick={() => setPreview((p) => !p)}
          pressed={preview}
          ariaLabel="Toggle preview"
        >
          {preview ? "Editor" : "Preview"}
        </ToolbarButton>
      </div>

      {/* Editor / Preview */}
      <div className="border rounded p-3 bg-white">
        {preview ? (
          <div
            aria-label="Preview content"
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
          />
        ) : (
          <div aria-label={ariaLabel} className="min-h-[160px]">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}